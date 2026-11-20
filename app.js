/*
 * SQLab · aplicación
 * Motor SQLite real (sql.js / WebAssembly) + retos autocorregidos en el navegador.
 *
 * Copyright (C) 2026 Sergi Garcia Barea
 * Licencia: GNU Affero General Public License v3.0 o posterior (AGPL-3.0-or-later).
 * Texto completo en LICENSE · https://www.gnu.org/licenses/agpl-3.0.html
 */
(function () {
  'use strict';

  const DATA = window.SQLAB_DATA;
  const LEVELS = {
    1: 'Fácil',
    2: 'Medio',
    3: 'Avanzado',
    4: 'Reto 10'
  };
  const STORAGE = {
    progress: 'sqlab.progress.v1',
    drafts: 'sqlab.drafts.v1',
    theme: 'sqlab.theme.v1'
  };
  const DEMO_SQL = 'SELECT c.nombre AS cliente, COUNT(p.id) AS pedidos, ' +
    'ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS gasto ' +
    'FROM clientes c JOIN pedidos p ON p.cliente_id = c.id ' +
    'JOIN lineas_pedido l ON l.pedido_id = p.id ' +
    'GROUP BY c.id ORDER BY gasto DESC LIMIT 3;';
  const SAVE_DELAY = 350;
  const SANDBOX_STARTER = '-- Laboratorio libre sobre tienda.db\n-- Escribe cualquier consulta y pulsa Ctrl + Enter\n\nSELECT *\nFROM productos\nORDER BY precio DESC\nLIMIT 10;';

  const EXERCISES = DATA.exercises;
  const BY_ID = new Map(EXERCISES.map((ex) => [ex.id, ex]));
  const WRITE_QUERY = /^(insert|update|delete|drop|alter|create|replace|attach|detach|pragma|vacuum|reindex|begin|commit|savepoint)\b/i;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const state = {
    view: 'home',
    mode: 'practica',
    level: 1,
    currentId: null,
    db: null,
    expected: new Map(),
    solved: new Set(loadJSON(STORAGE.progress, [])),
    drafts: loadJSON(STORAGE.drafts, {}),
    lastResult: null,
    lastDuration: 0,
    tab: 'mine',
    engineReady: false,
    installPrompt: null,
    SQL: null
  };

  let editor = null;
  let saveTimer = null;

  /* ───────────────── almacenamiento ───────────────── */

  function loadJSON(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      /* modo privado o file:// sin permisos: seguimos sin persistir */
    }
  }

  /* ───────────────── portada y tema ───────────────── */

  function showView(view) {
    const changed = state.view !== view;
    if (changed) saveDraft();
    state.view = view;
    document.body.dataset.view = view;
    $('#home').hidden = view !== 'home';
    $('#app').hidden = view !== 'app';
    window.scrollTo(0, 0);
    if (view === 'app' && changed && window.innerWidth > 980) editor.focus();
  }

  function currentTheme() {
    return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme, persist) {
    const light = theme === 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    const icon = $('#theme-icon');
    const button = $('#theme-toggle');
    if (icon) icon.textContent = light ? '☾' : '☀';
    if (button) {
      button.title = light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro';
      button.setAttribute('aria-label', button.title);
      button.setAttribute('aria-pressed', light ? 'true' : 'false');
    }
    const meta = $('#theme-color');
    if (meta) meta.setAttribute('content', light ? '#f2f5fb' : '#070b14');
    if (persist) saveJSON(STORAGE.theme, light ? 'light' : 'dark');
  }

  function renderHome() {
    const total = $('#stat-total');
    if (total) total.textContent = String(EXERCISES.length);
    renderProgress();
  }

  /** Registra el service worker (solo con http/https) para poder instalar la app. */
  function setupPwa() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(window.location.protocol)) return;
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        /* sin service worker la aplicación sigue funcionando igual */
      });
    });
  }

  /** Barras de progreso por nivel en la portada. */
  function renderHomeLevels() {
    const wrap = $('#home-levels');
    if (!wrap) return;
    let done = 0;
    let total = 0;
    wrap.innerHTML = Object.keys(LEVELS).map(function (key) {
      const level = Number(key);
      const all = EXERCISES.filter(function (ex) { return ex.level === level; });
      const solved = all.filter(function (ex) { return state.solved.has(ex.id); }).length;
      const pct = all.length ? Math.round((solved / all.length) * 100) : 0;
      const complete = all.length > 0 && solved === all.length;
      done += solved;
      total += all.length;
      return '<div class="lp-item' + (complete ? ' is-done' : '') + '">' +
        '<div class="lp-top">' +
          '<span class="lp-name">' + escapeHTML(LEVELS[level]) + '</span>' +
          '<span class="lp-count">' + solved + ' / ' + all.length + (complete ? ' ✓' : '') + '</span>' +
        '</div>' +
        '<div class="lp-bar" role="progressbar" aria-label="' + escapeHTML(LEVELS[level]) + '" ' +
          'aria-valuemin="0" aria-valuemax="' + all.length + '" aria-valuenow="' + solved + '">' +
          '<i style="width:' + pct + '%"></i>' +
        '</div>' +
      '</div>';
    }).join('');
    const summary = $('#home-levels-summary');
    if (summary) {
      const pct = total ? Math.round((done / total) * 100) : 0;
      summary.textContent = done
        ? done + ' de ' + total + ' retos · ' + pct + ' %'
        : 'Aún no has resuelto ninguno · 0 de ' + total + ' retos';
    }
  }

  /** Pinta en la portada una consulta real ejecutada contra tienda.db. */
  function renderDemoTable() {
    const target = $('#demo-results');
    if (!target || !state.db) return;
    try {
      const sets = state.db.exec(DEMO_SQL);
      const last = sets.length ? sets[sets.length - 1] : null;
      if (!last) return;
      target.innerHTML = '<table class="grid"><thead><tr>' +
        last.columns.map(function (col) { return '<th>' + escapeHTML(col) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        last.values.map(function (row) {
          return '<tr>' + row.map(function (value) {
            if (value === null) return '<td><span class="null">NULL</span></td>';
            if (typeof value === 'number') return '<td class="num">' + formatNumber(value) + '</td>';
            return '<td>' + escapeHTML(String(value)) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
      const meta = $('#demo-meta');
      if (meta) meta.textContent = last.values.length + ' filas · SQLite en tu navegador';
    } catch (err) {
      /* la portada nunca debe romper la aplicación */
    }
  }

  /* ───────────────── arranque ───────────────── */

  async function boot() {
    applyTheme(loadJSON(STORAGE.theme, document.documentElement.dataset.theme) === 'light' ? 'light' : 'dark', false);
    setupPwa();
    editor = createEditor();
    bindEvents();
    renderSchema();
    renderExamples();
    renderProgress();
    renderHome();
    selectExercise(EXERCISES[0].id);

    try {
      const binary = decodeWasm();
      const SQL = await window.initSqlJs(binary ? { wasmBinary: binary } : { locateFile: (file) => 'vendor/' + file });
      state.SQL = SQL;
      state.db = buildDatabase(SQL);
      computeExpected(SQL);
      const version = readScalar(state.db, 'SELECT sqlite_version();');
      $('#engine-status').textContent = 'SQLite ' + version + ' (WebAssembly) · listo';
      state.engineReady = true;
      $('#btn-run').disabled = false;
      document.documentElement.dataset.engine = 'ready';
      selectExercise(firstUnsolved());
      renderDemoTable();
    } catch (err) {
      $('#engine-status').textContent = 'No se pudo iniciar el motor SQLite';
      document.documentElement.dataset.engine = 'error';
      showFeedback('bad', 'El motor SQL no ha arrancado', 'Abre la página desde un servidor local (por ejemplo <code>python3 -m http.server</code>) o desde GitHub Pages y recarga. ' + escapeHTML(err.message || ''));
    }
  }

  function decodeWasm() {
    const b64 = window.__SQL_WASM_BASE64;
    if (!b64) return null;
    const raw = window.atob(b64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function buildDatabase(SQL) {
    const db = new SQL.Database();
    db.run(DATA.schema);
    db.run(DATA.seed);
    return db;
  }

  function readScalar(db, sql) {
    const sets = db.exec(sql);
    return sets.length && sets[0].values.length ? sets[0].values[0][0] : '';
  }

  /** Calcula, con una base de datos limpia, el resultado oficial de cada reto. */
  function computeExpected(SQL) {
    let check;
    try {
      check = buildDatabase(SQL);
    } catch (err) {
      console.error('[SQLab] no se pudo crear la base de datos de comprobación', err);
      return;
    }
    EXERCISES.forEach((ex) => {
      try {
        const sets = check.exec(ex.solution);
        const last = sets.length ? sets[sets.length - 1] : { columns: [], values: [] };
        state.expected.set(ex.id, { columns: last.columns.slice(), rows: last.values.slice() });
      } catch (err) {
        state.expected.set(ex.id, { columns: [], rows: [], error: err.message });
        console.error('[SQLab] solución inválida en el reto ' + ex.id + ': ' + err.message);
      }
    });
    try {
      check.close();
    } catch (err) {
      /* nada */
    }
  }

  function firstUnsolved() {
    const pending = EXERCISES.find((ex) => !state.solved.has(ex.id));
    if (pending) state.level = pending.level;
    return (pending || EXERCISES[0]).id;
  }

  /* ───────────────── editor ───────────────── */

  function createEditor() {
    const textarea = $('#sql-input');
    const highlight = $('#hl');

    function syncHighlight() {
      highlight.innerHTML = highlightSQL(textarea.value) + '\n';
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    }

    function queueSave() {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveDraft, SAVE_DELAY);
    }

    textarea.addEventListener('input', function () {
      syncHighlight();
      queueSave();
    });

    textarea.addEventListener('scroll', function () {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    });

    textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') {
        event.preventDefault();
        insertAtCursor(textarea, '  ');
        syncHighlight();
        queueSave();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        runQuery();
      }
    });

    return {
      el: textarea,
      get: function () { return textarea.value; },
      set: function (value) {
        textarea.value = value;
        textarea.scrollTop = 0;
        textarea.scrollLeft = 0;
        syncHighlight();
      },
      focus: function () { textarea.focus(); },
      clear: function () { this.set(''); }
    };
  }

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    textarea.value = textarea.value.slice(0, start) + text + textarea.value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
  }

  const SQL_KEYWORDS = new Set(('SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET JOIN LEFT RIGHT INNER OUTER FULL CROSS ' +
    'ON AS AND OR NOT NULL IS IN LIKE GLOB BETWEEN EXISTS CASE WHEN THEN ELSE END DISTINCT UNION ALL INTERSECT EXCEPT ' +
    'COUNT SUM AVG MIN MAX TOTAL ROUND COALESCE IFNULL NULLIF CAST WITH OVER PARTITION ROW_NUMBER RANK DENSE_RANK ' +
    'ASC DESC INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW INDEX TRIGGER DROP ALTER ADD COLUMN PRIMARY KEY ' +
    'FOREIGN REFERENCES UNIQUE CHECK DEFAULT PRAGMA SUBSTR LENGTH UPPER LOWER TRIM DATE DATETIME STRFTIME TRUE FALSE ' +
    'RECURSIVE USING NATURAL EXPLAIN ANALYZE RETURNING LIMIT').split(/\s+/));

  function escapeHTML(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlightSQL(sql) {
    const tokenizer = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = '';
    let last = 0;
    let match;
    while ((match = tokenizer.exec(sql)) !== null) {
      out += escapeHTML(sql.slice(last, match.index));
      if (match[1]) {
        out += '<span class="tok-com">' + escapeHTML(match[1]) + '</span>';
      } else if (match[2]) {
        out += '<span class="tok-str">' + escapeHTML(match[2]) + '</span>';
      } else if (match[3]) {
        out += '<span class="tok-num">' + match[3] + '</span>';
      } else if (SQL_KEYWORDS.has(match[4].toUpperCase())) {
        out += '<span class="tok-kw">' + escapeHTML(match[4]) + '</span>';
      } else {
        out += escapeHTML(match[4]);
      }
      last = match.index + match[0].length;
    }
    return out + escapeHTML(sql.slice(last));
  }

  /* ───────────────── borradores ───────────────── */

  function draftKey() {
    return state.mode === 'sandbox' ? '_sandbox' : state.currentId;
  }

  function saveDraft() {
    const key = draftKey();
    if (!key || !editor) return;
    state.drafts[key] = editor.get();
    saveJSON(STORAGE.drafts, state.drafts);
  }

  function starterFor(ex) {
    return '-- ' + ex.title + '\n-- Ctrl + Enter para ejecutar\n\n';
  }

  function loadDraft() {
    const key = draftKey();
    if (!key) return;
    if (state.mode === 'sandbox') {
      editor.set(typeof state.drafts[key] === 'string' ? state.drafts[key] : SANDBOX_STARTER);
      return;
    }
    const ex = BY_ID.get(key);
    if (!ex) return;
    const draft = state.drafts[key];
    editor.set(typeof draft === 'string' ? draft : starterFor(ex));
    editor.el.scrollTop = 0;
  }

  /* ───────────────── modos ───────────────── */

  function setMode(mode) {
    if (state.mode === mode) return;
    saveDraft();
    state.mode = mode;
    state.lastResult = null;
    state.tab = 'mine';
    $('#mode-practica').classList.toggle('is-active', mode === 'practica');
    $('#mode-sandbox').classList.toggle('is-active', mode === 'sandbox');
    $('#panel-practica').hidden = mode !== 'practica';
    $('#panel-sandbox').hidden = mode !== 'sandbox';
    $('#btn-solution').hidden = mode !== 'practica';
    $('#feedback').innerHTML = '';
    loadDraft();
    renderBrief();
    paintResults();
    if (window.innerWidth > 980) editor.focus();
  }

  /* ───────────────── barra lateral ───────────────── */

  function renderLevels() {
    const wrap = $('#levels');
    wrap.innerHTML = '';
    Object.keys(LEVELS).forEach((key) => {
      const level = Number(key);
      const all = EXERCISES.filter((ex) => ex.level === level);
      const done = all.filter((ex) => state.solved.has(ex.id)).length;
      const btn = document.createElement('button');
      btn.className = 'level-chip' + (state.level === level ? ' is-active' : '');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', state.level === level ? 'true' : 'false');
      btn.dataset.level = String(level);
      btn.innerHTML = LEVELS[level] + '<span>' + done + '/' + all.length + ' resueltos</span>';
      btn.addEventListener('click', function () {
        state.level = level;
        renderLevels();
        renderList();
      });
      wrap.appendChild(btn);
    });
  }

  /**
   * Siguiente reto pendiente del nivel que se está viendo; si ese nivel ya está
   * completo, el primero pendiente del catálogo (para que el botón nunca quede muerto).
   */
  function nextUnsolved() {
    const visible = EXERCISES.filter(function (ex) { return ex.level === state.level; });
    const inLevel = visible.find(function (ex) { return !state.solved.has(ex.id); });
    if (inLevel) return inLevel;
    return EXERCISES.find(function (ex) { return !state.solved.has(ex.id); }) || null;
  }

  function renderList() {
    const list = $('#exercise-list');
    const visible = EXERCISES.filter((ex) => ex.level === state.level);
    const solvedHere = visible.filter((ex) => state.solved.has(ex.id)).length;
    const next = nextUnsolved();
    const nextId = next ? next.id : null;
    $('#side-count').textContent = solvedHere + ' de ' + visible.length;
    $('#side-level-name').textContent = LEVELS[state.level];
    list.innerHTML = '';
    visible.forEach((ex, index) => {
      const solved = state.solved.has(ex.id);
      const item = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ex-item' +
        (ex.id === state.currentId ? ' is-active' : '') +
        (solved ? ' is-solved' : '') +
        (ex.id === nextId ? ' is-next' : '');
      btn.dataset.id = ex.id;
      btn.innerHTML = '<span class="ex-index">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<span class="ex-name">' + escapeHTML(ex.title) + '</span>' +
        (ex.id === nextId ? '<span class="ex-flag">siguiente</span>' : '') +
        (solved ? '<span class="ex-tick" aria-label="resuelto">✓</span>' : '');
      btn.addEventListener('click', function () { selectExercise(ex.id); });
      item.appendChild(btn);
      list.appendChild(item);
    });

    const cta = $('#btn-continue');
    cta.disabled = !next;
    cta.querySelector('.cta-label').textContent = next
      ? 'Continuar con ' + next.id.toUpperCase()
      : 'Todo resuelto ✓';
    cta.title = next
      ? 'Ir al reto ' + next.id.toUpperCase() + ': ' + next.title
      : 'Has resuelto todos los retos';
  }

  /** Mueve la selección dentro del nivel actual: nunca cambia de nivel sin querer. */
  function stepExercise(delta) {
    const level = EXERCISES.filter(function (ex) { return ex.level === state.level; });
    const index = level.findIndex(function (ex) { return ex.id === state.currentId; });
    if (index < 0) return;
    const target = level[index + delta];
    if (target) selectExercise(target.id);
  }

  function renderNav() {
    const nav = $('#brief-nav');
    const ex = currentExercise();
    nav.hidden = !ex;
    if (!ex) return;
    const sameLevel = EXERCISES.filter(function (item) { return item.level === ex.level; });
    const pos = sameLevel.findIndex(function (item) { return item.id === ex.id; }) + 1;
    $('#ex-pos').textContent = 'Reto ' + pos + ' de ' + sameLevel.length + ' · ' + LEVELS[ex.level];
    const index = sameLevel.findIndex(function (item) { return item.id === ex.id; });
    $('#ex-prev').disabled = index <= 0;
    $('#ex-next').disabled = index >= sameLevel.length - 1;
  }

  function renderProgress() {
    const total = EXERCISES.length;
    const done = state.solved.size;
    const pct = total ? Math.round((done / total) * 100) : 0;
    $('#progress-label').textContent = done + ' / ' + total + ' resueltos';
    $('#progress-pct').textContent = pct + '%';
    $('#progress-fill').style.width = pct + '%';
    const stat = $('#stat-progress');
    if (stat) stat.textContent = String(done);
    const ctaText = done ? 'Seguir practicando →' : 'Empezar a practicar →';
    $$('.js-start').forEach(function (btn) { btn.textContent = ctaText; });
    renderHomeLevels();
  }

  /* ───────────────── reto actual ───────────────── */

  function selectExercise(id) {
    saveDraft();
    const ex = BY_ID.get(id);
    if (!ex) return;
    if (state.mode !== 'practica') {
      state.mode = 'practica';
    }
    state.currentId = id;
    state.level = ex.level;
    state.lastResult = null;
    state.lastDuration = 0;
    state.tab = 'mine';
    renderLevels();
    renderList();
    renderBrief();
    loadDraft();
    paintResults();
    $('#feedback').innerHTML = '';
  }

  function currentExercise() {
    return state.mode === 'practica' ? BY_ID.get(state.currentId) : null;
  }

  function renderBrief() {
    const ex = currentExercise();
    const badge = $('#ex-level');
    const title = $('#ex-title');
    const prompt = $('#ex-prompt');
    const chips = $('#ex-tables');
    const hintBox = $('#ex-hint-box');
    const orderNote = $('#ex-order');
    const solvedTag = $('#ex-solved');

    if (!ex) {
      badge.textContent = 'Laboratorio';
      badge.dataset.level = '4';
      $('#ex-id').textContent = 'tienda.db';
      orderNote.hidden = true;
      solvedTag.hidden = true;
      title.textContent = 'Consultas libres sobre la base de datos';
      prompt.innerHTML = 'Escribe cualquier sentencia SQL: <code>SELECT</code>, <code>JOIN</code>, <code>GROUP BY</code>, ' +
        'incluso <code>CREATE TABLE</code> o <code>INSERT</code>. Los cambios son temporales: con «Restaurar datos» vuelves ' +
        'al estado original. El esquema completo está en la barra lateral.';
      chips.innerHTML = '';
      hintBox.hidden = true;
      renderNav();
      return;
    }

    badge.textContent = LEVELS[ex.level];
    badge.dataset.level = String(ex.level);
    $('#ex-id').textContent = ex.id.toUpperCase();
    orderNote.hidden = !ex.ordered;
    solvedTag.hidden = !state.solved.has(ex.id);
    title.textContent = ex.title;
    prompt.textContent = ex.prompt;

    hintBox.hidden = !ex.hint;
    $('#ex-hint').textContent = ex.hint || '';

    chips.innerHTML = ex.tables.map(function (name) {
      const meta = DATA.tables.find((t) => t.name === name);
      if (!meta) return '';
      return '<details class="table-chip"><summary>' + escapeHTML(name) + '</summary><ul>' +
        meta.columns.map((col) => '<li><b>' + escapeHTML(col[0]) + '</b> <i>' + escapeHTML(col[1]) + '</i></li>').join('') +
        '</ul></details>';
    }).join('');
    renderNav();
  }

  function renderSchema() {
    const wrap = $('#schema-list');
    wrap.innerHTML = DATA.tables.map(function (table) {
      return '<button type="button" class="schema-table" data-table="' + escapeHTML(table.name) + '">' +
          escapeHTML(table.name) + '<small>' + escapeHTML(table.desc) + '</small></button>' +
        '<ul class="schema-cols">' +
          table.columns.map((col) => '<li><b>' + escapeHTML(col[0]) + '</b> <i>' + escapeHTML(col[1]) + '</i></li>').join('') +
        '</ul>';
    }).join('');

    $$('[data-table]', wrap).forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMode('sandbox');
        editor.set('SELECT *\nFROM ' + btn.dataset.table + '\nLIMIT 20;');
        editor.focus();
      });
    });
  }

  function renderExamples() {
    const wrap = $('#examples');
    wrap.innerHTML = '';
    DATA.examples.forEach(function (example) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'example-btn';
      btn.textContent = example.label;
      btn.addEventListener('click', function () {
        setMode('sandbox');
        editor.set(example.sql);
        editor.focus();
      });
      wrap.appendChild(btn);
    });
  }

  /* ───────────────── ejecución ───────────────── */

  function isWriteQuery(sql) {
    const clean = sql
      .replace(/--[^\n]*/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .trim();
    return WRITE_QUERY.test(clean);
  }

  function runQuery() {
    if (!state.engineReady) return;
    const sql = editor.get().trim();
    if (!sql) {
      showFeedback('warn', 'El editor está vacío', 'Escribe una consulta y vuelve a ejecutar.');
      return;
    }

    if (state.mode === 'practica' && isWriteQuery(sql)) {
      showFeedback('warn', 'En los retos solo se consultan datos',
        'Esta práctica admite <code>SELECT</code> (también con <code>WITH</code>). Si quieres crear tablas o modificar datos, ' +
        'usa el <strong>Laboratorio</strong>.');
      return;
    }

    let sets;
    const started = window.performance.now();
    try {
      sets = state.db.exec(sql);
    } catch (err) {
      state.lastResult = null;
      state.lastDuration = 0;
      paintResults();
      showFeedback('bad', 'Error de SQLite', '<code>' + escapeHTML(err.message || 'sentencia no válida') + '</code>');
      return;
    }
    const duration = window.performance.now() - started;
    const last = sets.length ? sets[sets.length - 1] : { columns: [], values: [] };
    const result = { columns: last.columns.slice(), rows: last.values.slice() };
    state.lastResult = result;
    state.lastDuration = duration;
    state.tab = 'mine';
    paintResults();
    $('#run-time').textContent = Math.round(duration) + ' ms';

    if (state.mode === 'sandbox') {
      const count = result.rows.length;
      showFeedback('info', 'Consulta ejecutada',
        count === 0
          ? 'La sentencia se ha ejecutado sin devolver filas.'
          : 'Se han obtenido ' + count + (count === 1 ? ' fila' : ' filas') + ' en ' + Math.round(duration) + ' ms.');
      return;
    }

    const ex = currentExercise();
    const expected = state.expected.get(ex.id);
    if (!expected) {
      showFeedback('warn', 'Reto sin comprobación', 'No se pudo preparar el resultado esperado de este reto.');
      return;
    }
    if (expected.error) {
      showFeedback('bad', 'Este reto tiene un problema de configuración', 'La solución oficial no se ejecuta: <code>' +
        escapeHTML(expected.error) + '</code>');
      return;
    }

    const verdict = compareResults(result, expected, ex);
    if (verdict.ok) {
      const wasSolved = state.solved.has(ex.id);
      markSolved(ex.id);
      showFeedback('ok', wasSolved ? '¡Correcto otra vez!' : '¡Correcto!',
        'Tu consulta devuelve las ' + result.rows.length + (result.rows.length === 1 ? ' fila esperada' : ' filas esperadas') +
        ' en ' + Math.round(duration) + ' ms.',
        ex.lesson, true);
    } else {
      showFeedback('bad', 'Todavía no', verdict.message, '', false, verdict.preview);
    }
  }

  function compareResults(actual, expected, ex) {
    const actualKeys = actual.rows.map(rowKey);
    const expectedKeys = expected.rows.map(rowKey);

    if (multisetEqual(actualKeys, expectedKeys)) {
      if (!ex.ordered) return { ok: true };
      if (orderIsValid(actual.rows, expected, ex)) return { ok: true };
      return {
        ok: false,
        message: 'Tienes todas las filas necesarias, pero el orden no es el que pide el enunciado. ' +
          'Revisa el <code>ORDER BY</code>.'
      };
    }

    const remaining = expectedKeys.slice();
    const extra = [];
    actual.rows.forEach(function (row) {
      const index = remaining.indexOf(rowKey(row));
      if (index >= 0) remaining.splice(index, 1);
      else extra.push(row);
    });
    const missing = remaining.map(function (key) {
      return expected.rows[expectedKeys.indexOf(key)];
    });

    let message = 'Tu consulta devuelve ' + actual.rows.length +
      (actual.rows.length === 1 ? ' fila' : ' filas') + ' y se esperan ' + expected.rows.length + '.';
    if (missing.length && !extra.length) message += ' Te falta' + (missing.length === 1 ? ' una fila.' : 'n ' + missing.length + ' filas.');
    else if (extra.length && !missing.length) message += ' Te sobra' + (extra.length === 1 ? ' una fila.' : 'n ' + extra.length + ' filas.');
    else if (missing.length || extra.length) message += ' Hay filas que no coinciden.';

    const previewRow = missing[0] || extra[0];
    return {
      ok: false,
      message: message,
      preview: previewRow
        ? { label: missing.length ? 'Falta una fila así' : 'Sobra una fila así', row: previewRow }
        : null
    };
  }

  /** ¿Las dos listas de claves contienen exactamente las mismas filas? */
  function multisetEqual(a, b) {
    if (a.length !== b.length) return false;
    const left = a.slice().sort();
    const right = b.slice().sort();
    return left.every(function (key, index) { return key === right[index]; });
  }

  /**
   * Comprueba que la columna ordenada sea monótona, de modo que dos filas
   * empatadas puedan aparecer en cualquier orden (SQLite no garantiza el desempate).
   */
  function orderIsValid(rows, expected, ex) {
    const index = ex.orderBy ? expected.columns.indexOf(ex.orderBy) : -1;
    if (index < 0) {
      return rows.length === expected.rows.length &&
        rows.every(function (row, i) { return rowKey(row) === rowKey(expected.rows[i]); });
    }
    const descending = ex.orderDir === 'desc';
    for (let i = 1; i < rows.length; i++) {
      const cmp = compareOrderValues(orderValue(rows[i - 1][index]), orderValue(rows[i][index]));
      if (descending ? cmp < 0 : cmp > 0) return false;
    }
    return true;
  }

  function orderValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Math.round(value * 1e6) / 1e6;
    return String(value);
  }

  function compareOrderValues(a, b) {
    if (a === b) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : 1;
    const left = String(a);
    const right = String(b);
    return left < right ? -1 : left > right ? 1 : 0;
  }

  function rowKey(row) {
    return JSON.stringify(Array.prototype.map.call(row, normalizeValue));
  }

  function normalizeValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Math.round(value * 1e6) / 1e6;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value instanceof Uint8Array) return '[blob]';
    return String(value);
  }

  function markSolved(id) {
    if (state.solved.has(id)) return;
    state.solved.add(id);
    saveJSON(STORAGE.progress, Array.from(state.solved));
    renderProgress();
    renderLevels();
    renderList();
    const ex = currentExercise();
    if (ex && ex.id === id) $('#ex-solved').hidden = false;
  }

  /* ───────────────── feedback ───────────────── */

  function showFeedback(kind, title, message, lesson, withNext, preview) {
    const icons = { ok: '✓', bad: '✗', warn: '⚠', info: 'ℹ' };
    const wrapper = document.createElement('div');
    wrapper.className = 'feedback ' + (kind === 'info' ? '' : kind);
    wrapper.innerHTML =
      '<span class="ico" aria-hidden="true">' + (icons[kind] || '•') + '</span>' +
      '<div class="body">' +
        '<strong>' + escapeHTML(title) + '</strong>' +
        (message ? '<p>' + message + '</p>' : '') +
        (preview ? '<div class="row-preview">' + escapeHTML(preview.label) + ': ' + formatRow(preview.row) + '</div>' : '') +
        (lesson ? '<div class="lesson">💡 ' + escapeHTML(lesson) + '</div>' : '') +
      '</div>';

    if (withNext && state.mode === 'practica') {
      const next = nextExercise();
      if (next) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ghost small next-btn';
        btn.textContent = 'Siguiente: ' + next.title + ' →';
        btn.addEventListener('click', function () { selectExercise(next.id); });
        wrapper.querySelector('.body').appendChild(btn);
      }
    }

    const slot = $('#feedback');
    slot.innerHTML = '';
    slot.appendChild(wrapper);
  }

  function formatRow(row) {
    return Array.prototype.map.call(row, function (value) {
      if (value === null) return 'NULL';
      if (typeof value === 'number') return formatNumber(value);
      return String(value);
    }).join(' · ');
  }

  function nextExercise() {
    const list = EXERCISES.filter((ex) => ex.level === state.level);
    const index = list.findIndex((ex) => ex.id === state.currentId);
    return index >= 0 ? list[index + 1] || null : null;
  }

  /* ───────────────── resultados ───────────────── */

  function paintResults() {
    const card = $('#results-card');
    const ex = currentExercise();
    const expectedAvailable = !!(ex && state.expected.has(ex.id));
    const expectedTab = $('#tab-expected');
    expectedTab.hidden = !expectedAvailable;
    if (!expectedAvailable && state.tab === 'expected') state.tab = 'mine';

    $$('.tab').forEach(function (tab) {
      tab.classList.toggle('is-active', tab.dataset.tab === state.tab);
    });

    const result = state.tab === 'expected' && expectedAvailable
      ? state.expected.get(ex.id)
      : state.lastResult;

    if (!result) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    $('#results').innerHTML = renderTable(result);
    const count = result.rows.length;
    $('#result-meta').textContent = state.tab === 'expected'
      ? count + (count === 1 ? ' fila esperada' : ' filas esperadas')
      : count + (count === 1 ? ' fila' : ' filas') + (state.lastDuration ? ' · ' + Math.round(state.lastDuration) + ' ms' : '');
  }

  function renderTable(result) {
    if (result.error) {
      return '<div class="empty-result">No se pudo calcular el resultado esperado.<br><code>' +
        escapeHTML(result.error) + '</code></div>';
    }
    if (!result.rows.length) {
      return '<div class="empty-result">La consulta no devuelve ninguna fila.</div>';
    }
    const limit = 400;
    const rows = result.rows.slice(0, limit);
    const columns = result.columns.length
      ? result.columns
      : result.rows[0].map(function (_, i) { return 'col' + (i + 1); });

    const head = '<thead><tr>' + columns.map(function (col) {
      return '<th>' + escapeHTML(col) + '</th>';
    }).join('') + '</tr></thead>';

    const body = '<tbody>' + rows.map(function (row) {
      return '<tr>' + Array.prototype.map.call(row, function (value) {
        if (value === null) return '<td><span class="null">NULL</span></td>';
        if (typeof value === 'number') return '<td class="num">' + formatNumber(value) + '</td>';
        return '<td>' + escapeHTML(String(value)) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody>';

    const note = result.rows.length > limit
      ? '<div class="result-note">Mostrando ' + limit + ' de ' + result.rows.length + ' filas.</div>'
      : '';

    return '<table class="grid">' + head + body + '</table>' + note;
  }

  function formatNumber(value) {
    if (!isFinite(value)) return String(value);
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 100) / 100);
  }

  /* ───────────────── eventos ───────────────── */

  function bindEvents() {
    $('#brand-home').addEventListener('click', function (event) {
      event.preventDefault();
      showView('home');
    });
    $('#btn-home').addEventListener('click', function () { showView('home'); });
    $('#theme-toggle').addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light', true);
    });
    const installBtn = $('#btn-install');
    if (installBtn) {
      window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        state.installPrompt = event;
        installBtn.hidden = false;
      });
      installBtn.addEventListener('click', function () {
        if (!state.installPrompt) return;
        const prompt = state.installPrompt;
        state.installPrompt = null;
        try {
          const shown = prompt.prompt();
          if (shown && typeof shown.catch === 'function') {
            /* sin gesto de usuario el navegador rechaza la promesa: no es un fallo de la app */
            shown.catch(function () {});
          }
          prompt.userChoice.then(function (choice) {
            installBtn.hidden = choice.outcome === 'accepted';
          }).catch(function () { /* el navegador decidió no mostrar el diálogo */ });
        } catch (err) {
          installBtn.hidden = true;
        }
      });
      window.addEventListener('appinstalled', function () {
        state.installPrompt = null;
        installBtn.hidden = true;
      });
    }

    $$('.js-start').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showView('app');
        setMode('practica');
        selectExercise(state.currentId || firstUnsolved());
        editor.focus();
      });
    });
    $$('.js-sandbox').forEach(function (btn) {
      btn.addEventListener('click', function () {
        showView('app');
        setMode('sandbox');
        editor.focus();
      });
    });

    $('#mode-practica').addEventListener('click', function () { setMode('practica'); });
    $('#mode-sandbox').addEventListener('click', function () { setMode('sandbox'); });
    $('#btn-run').addEventListener('click', runQuery);

    $('#btn-clear').addEventListener('click', function () {
      editor.clear();
      saveDraft();
      state.lastResult = null;
      paintResults();
      showFeedback('info', 'Editor vacío', 'Escribe una nueva consulta.');
      editor.focus();
    });

    $('#btn-solution').addEventListener('click', function () {
      const ex = currentExercise();
      if (!ex) return;
      editor.set(ex.solution + '\n');
      saveDraft();
      showFeedback('warn', 'Solución cargada',
        'Está en el editor: pulsa <code>Ejecutar</code> para comprobar el resultado. Intenta entenderla antes de seguir.');
      editor.focus();
    });

    $$('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.tab = tab.dataset.tab;
        paintResults();
      });
    });

    $('#reset-db').addEventListener('click', function () {
      if (!state.engineReady) return;
      state.db.close();
      state.db = buildDatabase(state.SQL);
      state.lastResult = null;
      state.lastDuration = 0;
      paintResults();
      showFeedback('info', 'Datos restaurados', 'La base de datos <code>tienda.db</code> vuelve a su estado original.');
    });

    $('#reset-progress').addEventListener('click', function () {
      if (!state.solved.size) return;
      if (!window.confirm('¿Borrar el progreso de todos los retos resueltos?')) return;
      state.solved.clear();
      saveJSON(STORAGE.progress, []);
      renderProgress();
      renderLevels();
      renderList();
      renderBrief();
    });

    $('#btn-continue').addEventListener('click', function () {
      const next = nextUnsolved();
      if (next) selectExercise(next.id);
    });
    $('#ex-prev').addEventListener('click', function () { stepExercise(-1); });
    $('#ex-next').addEventListener('click', function () { stepExercise(1); });

    window.addEventListener('beforeunload', saveDraft);
    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) {
        const hl = $('#hl');
        hl.scrollTop = editor.el.scrollTop;
        hl.scrollLeft = editor.el.scrollLeft;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
