# AGENTS.md

Guía para agentes de código y colaboradores que trabajen en este repositorio.

## Proyecto

**SQLab** es un laboratorio de práctica de SQL que se ejecuta entero en el navegador: 44 retos
autocorregidos, laboratorio libre y progreso local sobre una base de datos de tienda. No hay
backend: SQLite viaja como WebAssembly.

- **Autor:** Sergi Garcia Barea · [mejoratudocencia.es](https://mejoratudocencia.es)
- **Demo:** <https://sergarb1.github.io/sqlab/>
- **Código:** <https://github.com/sergarb1/sqlab>

## Licencia (no se toca)

GNU Affero General Public License v3.0 o posterior (**AGPL-3.0-or-later**). Texto completo en
`LICENSE`. Toda contribución se publica bajo la misma licencia.

- Conserva el copyright y el enlace a <https://mejoratudocencia.es> en el pie de la web, el README,
  este archivo y las cabeceras de `app.js`, `data.js` y `styles.css`.
- No relicenses el proyecto, no quites la licencia y no publiques una versión sin ofrecer el código
  fuente a sus usuarios (requisito de la AGPL).
- Los archivos de `vendor/` son de terceros (sql.js, MIT; SQLite, dominio público): no los edites.

## Cómo trabajar

```bash
python3 -m http.server 8000   # desarrollo en http://localhost:8000
node --check app.js && node --check data.js
```

- Sin dependencias nuevas si se pueden evitar; sin backend y sin build.
- La interfaz está en español, en tono directo y con tuteo.
- El resultado esperado de cada reto se calcula ejecutando su `solution` contra una base limpia:
  no se escribe a mano. Al añadir un reto, valida que se resuelve solo.
- Si cambias archivos servidos por la PWA, sube `VERSION` en `sw.js`.
- Comprueba tus cambios en Chrome a 1280 px y 390 px antes de publicar.

## Límites

El alcance de lo que no debe modificarse está en [HANDS-OFF.md](HANDS-OFF.md).
