# SQLab

Laboratorio para practicar SQL con un motor **SQLite real** (compilado a WebAssembly con
[sql.js](https://sql.js.org)) que se ejecuta dentro del navegador. Sin backend, sin cuentas y sin
enviar consultas a ningún servidor.

## Cómo abrirlo

- **Doble clic en `index.html`**: funciona directamente porque el WASM va embebido en
  `vendor/sql-wasm-base64.js`.
- **Con un servidor local** (recomendado para desarrollo):

  ```bash
  python3 -m http.server 8000
  # abre http://localhost:8000
  ```

- **GitHub Pages**: sube el contenido del proyecto y activa Pages; no hace falta configurar nada más.

## Qué incluye

- **44 retos** en cuatro niveles (Fácil, Medio, Avanzado y ⭐ Reto 10) sobre una base de datos de
  tienda con 7 tablas relacionadas: `clientes`, `productos`, `categorias`, `pedidos`,
  `lineas_pedido`, `empleados`, `departamentos` y `departamentos`.
- **Corrección automática**: tu consulta se ejecuta de verdad y su resultado se compara con el de
  la solución oficial (calculado en tiempo de ejecución). El orden solo cuenta cuando el enunciado
  lo exige, y se toleran empates.
- **Editor con resaltado de sintaxis**, atajos (`Ctrl`/`Cmd` + `Enter` para ejecutar, `Tab` para
  indentar) y borradores guardados por reto.
- **Pistas y solución** en cada ejercicio, con una explicación breve al acertar.
- **Laboratorio libre**: escribe cualquier sentencia (incluido `CREATE TABLE` / `INSERT`) sobre la
  misma base de datos, navega el esquema y restaura los datos originales cuando quieras.
- **Progreso en `localStorage`** (se ve en la barra superior y en cada nivel).

En los retos solo se permiten consultas de lectura; las escrituras se reservan al laboratorio para
no romper el estado de la base de datos.

## Estructura

```
index.html                 estructura de la interfaz
styles.css                 estilos
data.js                    esquema, datos de ejemplo y catálogo de retos
app.js                     motor, ejecución, comparación y progreso
vendor/sql-wasm.js         sql.js (SQLite → WebAssembly)
vendor/sql-wasm-base64.js  el binario WASM embebido, para funcionar desde file://
vendor/sql-wasm.wasm       binario original (referencia / uso con servidor)
```

## Añadir un reto

Añade un objeto a `exercises` en `data.js`:

```js
{
  id: 'm15', level: 2, title: 'Título corto',
  prompt: 'Enunciado con las columnas esperadas.',
  tables: ['pedidos'], hint: 'Pista opcional.',
  lesson: 'Idea que se aprende al resolverlo.',
  solution: 'SELECT ...;'
}
```

El resultado esperado **no** se escribe a mano: se ejecuta `solution` contra una copia limpia de la
base de datos al cargar la página. Si el reto exige un orden concreto, añade `ordered: true` y
`orderBy: 'columna'`, `orderDir: 'asc' | 'desc'` para comparar solo esa columna.
