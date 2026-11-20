/*
 * SQLab · datos
 * Esquema + datos de ejemplo (tienda.db) y catálogo de retos.
 * Se puede cargar tanto en el navegador (window.SQLAB_DATA) como en Node.
 */
(function (root) {
  'use strict';

  const schema = `
CREATE TABLE categorias (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT NOT NULL
);

CREATE TABLE productos (
  id           INTEGER PRIMARY KEY,
  nombre       TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  precio       REAL NOT NULL,
  stock        INTEGER NOT NULL
);

CREATE TABLE clientes (
  id         INTEGER PRIMARY KEY,
  nombre     TEXT NOT NULL,
  ciudad     TEXT NOT NULL,
  email      TEXT NOT NULL,
  fecha_alta TEXT NOT NULL
);

CREATE TABLE departamentos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE empleados (
  id              INTEGER PRIMARY KEY,
  nombre          TEXT NOT NULL,
  puesto          TEXT NOT NULL,
  salario         REAL NOT NULL,
  departamento_id INTEGER NOT NULL REFERENCES departamentos(id),
  jefe_id         INTEGER REFERENCES empleados(id)
);

CREATE TABLE pedidos (
  id          INTEGER PRIMARY KEY,
  cliente_id  INTEGER NOT NULL REFERENCES clientes(id),
  empleado_id INTEGER NOT NULL REFERENCES empleados(id),
  fecha       TEXT NOT NULL,
  estado      TEXT NOT NULL
);

CREATE TABLE lineas_pedido (
  id               INTEGER PRIMARY KEY,
  pedido_id        INTEGER NOT NULL REFERENCES pedidos(id),
  producto_id      INTEGER NOT NULL REFERENCES productos(id),
  cantidad         INTEGER NOT NULL,
  precio_unitario  REAL NOT NULL
);
`;

  const seed = `
INSERT INTO categorias (id, nombre) VALUES
  (1, 'Informática'),
  (2, 'Telefonía'),
  (3, 'Audio'),
  (4, 'Hogar'),
  (5, 'Deportes'),
  (6, 'Libros'),
  (7, 'Juguetes'),
  (8, 'Jardín'),
  (9, 'Mascotas');

INSERT INTO productos (id, nombre, categoria_id, precio, stock) VALUES
  (1,  'Portátil Pro 15',      1, 1299.00, 12),
  (2,  'Ratón inalámbrico',    1,   25.90, 140),
  (3,  'Teclado mecánico',     1,   79.90, 60),
  (4,  'Monitor 27 4K',        1,  349.00, 18),
  (5,  'Webcam Full HD',       1,   59.90, 0),
  (6,  'Smartphone X20',       2,  899.00, 25),
  (7,  'Smartphone Lite',      2,  249.00, 70),
  (8,  'Funda protectora',     2,   19.90, 300),
  (9,  'Cargador rápido 65W',  2,   34.50, 120),
  (10, 'Auriculares BT Pro',   3,  129.00, 45),
  (11, 'Altavoz portátil',     3,   59.00, 0),
  (12, 'Barra de sonido',      3,  189.00, 22),
  (13, 'Micrófono USB',        3,   89.00, 15),
  (14, 'Cafetera express',     4,  219.00, 30),
  (15, 'Aspirador robot',      4,  299.00, 9),
  (16, 'Lámpara LED',          4,   39.90, 85),
  (17, 'Set de sartenes',      4,   74.50, 40),
  (18, 'Balón de fútbol',      5,   29.90, 110),
  (19, 'Zapatillas running',   5,  119.00, 55),
  (20, 'Esterilla yoga',       5,   34.90, 0),
  (21, 'Mancuernas 10kg',      5,   49.90, 33),
  (22, 'Bicicleta estática',   5,  449.00, 6),
  (23, 'Novela histórica',     6,   21.50, 200),
  (24, 'Manual de Python',     6,   39.00, 150),
  (25, 'Guía de SQL',          6,   32.50, 4),
  (26, 'Cómic ilustrado',      6,   18.00, 90),
  (27, 'Puzzle 1000 piezas',   7,   17.90, 130),
  (28, 'Juego de mesa',        7,   44.00, 48),
  (29, 'Figura coleccionable', 7,   24.90, 0),
  (30, 'Tijeras de podar',     8,   27.50, 65),
  (31, 'Maceta autorriego',    8,   14.90, 210),
  (32, 'Manguera 20m',         8,   32.00, 27),
  (33, 'Barbacoa portátil',    8,  128.00, 11);

INSERT INTO clientes (id, nombre, ciudad, email, fecha_alta) VALUES
  (1,  'Marta Oliver',    'Valencia',   'marta.oliver@gmail.com',    '2023-01-15'),
  (2,  'Jordi Pons',      'Barcelona',  'jordi.pons@hotmail.com',    '2023-02-03'),
  (3,  'Lucía Romero',    'Madrid',     'lucia.romero@gmail.com',    '2023-02-20'),
  (4,  'Pablo Navarro',   'Sevilla',    'pablo.navarro@yahoo.es',    '2023-03-11'),
  (5,  'Sofía Iglesias',  'Valencia',   'sofia.iglesias@gmail.com',  '2023-04-02'),
  (6,  'Adrián Moya',     'Bilbao',     'adrian.moya@empresa.es',    '2023-05-19'),
  (7,  'Nerea Campos',    'Málaga',     'nerea.campos@gmail.com',    '2023-06-07'),
  (8,  'Sergio Lozano',   'Madrid',     'sergio.lozano@empresa.es',  '2023-07-23'),
  (9,  'Elena Prieto',    'Zaragoza',   'elena.prieto@hotmail.com',  '2023-09-01'),
  (10, 'Iván Cabrera',    'Valencia',   'ivan.cabrera@gmail.com',    '2024-01-10'),
  (11, 'Alba Cortés',     'Barcelona',  'alba.cortes@gmail.com',     '2024-02-14'),
  (12, 'Raúl Domínguez',  'Granada',    'raul.dominguez@yahoo.es',   '2024-03-05'),
  (13, 'Clara Bueno',     'Valladolid', 'clara.bueno@empresa.es',    '2024-04-18'),
  (14, 'Diego Ramos',     'A Coruña',   'diego.ramos@gmail.com',     '2024-06-22'),
  (15, 'Julia Serrano',   'Valencia',   'julia.serrano@hotmail.com', '2024-09-09'),
  (16, 'Raquel Vega',     'Palma',      'raquel.vega@gmail.com',     '2024-10-02'),
  (17, 'Tomás Gil',       'Murcia',     'tomas.gil@empresa.es',      '2024-11-17'),
  (18, 'Iria Blanco',     'Santiago',   'iria.blanco@gmail.com',     '2025-01-08');

INSERT INTO departamentos (id, nombre) VALUES
  (1, 'Dirección'),
  (2, 'Ventas'),
  (3, 'Almacén'),
  (4, 'Soporte'),
  (5, 'Marketing');

INSERT INTO empleados (id, nombre, puesto, salario, departamento_id, jefe_id) VALUES
  (1,  'Laura Gómez',   'Directora',            5200, 1, NULL),
  (2,  'Marc Soler',    'Jefe de ventas',       3400, 2, 1),
  (3,  'Ana Ruiz',      'Comercial',            2450, 2, 2),
  (4,  'David Pérez',   'Comercial',            2300, 2, 2),
  (5,  'Carla Vidal',   'Comercial',            2650, 2, 2),
  (6,  'Hugo Martín',   'Responsable almacén',  2100, 3, 1),
  (7,  'Elena Sanz',    'Mozo de almacén',      1750, 3, 6),
  (8,  'Iván Torres',   'Técnico de soporte',   1950, 4, 1),
  (9,  'Noa Ferrer',    'Técnica de soporte',   2050, 4, 1),
  (10, 'Paula León',    'Marketing',            2250, 5, 1);

INSERT INTO pedidos (id, cliente_id, empleado_id, fecha, estado) VALUES
  (1,  1,  3, '2024-01-05', 'completado'),
  (2,  2,  4, '2024-01-12', 'completado'),
  (3,  3,  3, '2024-02-02', 'enviado'),
  (4,  1,  5, '2024-02-18', 'completado'),
  (5,  4,  4, '2024-03-01', 'cancelado'),
  (6,  5,  3, '2024-03-15', 'completado'),
  (7,  6,  5, '2024-04-09', 'enviado'),
  (8,  2,  3, '2024-04-22', 'completado'),
  (9,  7,  4, '2024-05-06', 'completado'),
  (10, 8,  5, '2024-05-28', 'pendiente'),
  (11, 3,  3, '2024-06-11', 'completado'),
  (12, 9,  4, '2024-06-30', 'enviado'),
  (13, 1,  5, '2024-07-14', 'completado'),
  (14, 10, 3, '2024-08-02', 'completado'),
  (15, 11, 4, '2024-08-19', 'cancelado'),
  (16, 5,  5, '2024-09-07', 'completado'),
  (17, 12, 3, '2024-09-21', 'completado'),
  (18, 13, 4, '2024-10-04', 'enviado'),
  (19, 2,  5, '2024-10-25', 'completado'),
  (20, 14, 3, '2024-11-08', 'pendiente'),
  (21, 7,  4, '2024-11-23', 'completado'),
  (22, 15, 5, '2024-12-05', 'completado'),
  (23, 3,  3, '2025-01-16', 'completado'),
  (24, 6,  5, '2025-02-08', 'completado'),
  (25, 1,  4, '2025-03-02', 'enviado'),
  (26, 9,  5, '2025-03-20', 'completado');

INSERT INTO lineas_pedido (id, pedido_id, producto_id, cantidad, precio_unitario) VALUES
  (1,  1,  1,  1, 1299.00),
  (2,  1,  2,  2,   25.90),
  (3,  2,  6,  1,  899.00),
  (4,  2,  9,  1,   34.50),
  (5,  2,  8,  2,   19.90),
  (6,  3,  10, 1,  129.00),
  (7,  3,  11, 1,   59.00),
  (8,  4,  14, 1,  219.00),
  (9,  4,  17, 1,   74.50),
  (10, 6,  19, 1,  119.00),
  (11, 6,  21, 2,   49.90),
  (12, 7,  4,  1,  349.00),
  (13, 7,  3,  1,   79.90),
  (14, 8,  7,  1,  249.00),
  (15, 8,  5,  1,   59.90),
  (16, 9,  23, 3,   21.50),
  (17, 10, 28, 1,   44.00),
  (18, 10, 27, 2,   17.90),
  (19, 11, 24, 1,   39.00),
  (20, 11, 25, 1,   32.50),
  (21, 11, 26, 1,   18.00),
  (22, 12, 15, 1,  299.00),
  (23, 13, 1,  1, 1299.00),
  (24, 13, 10, 1,  129.00),
  (25, 13, 9,  1,   34.50),
  (26, 14, 20, 1,   34.90),
  (27, 14, 18, 2,   29.90),
  (28, 16, 6,  1,  899.00),
  (29, 16, 8,  1,   19.90),
  (30, 17, 30, 2,   27.50),
  (31, 17, 31, 1,   14.90),
  (32, 17, 32, 1,   32.00),
  (33, 18, 12, 1,  189.00),
  (34, 18, 13, 1,   89.00),
  (35, 19, 3,  2,   79.90),
  (36, 19, 2,  2,   25.90),
  (37, 20, 22, 1,  449.00),
  (38, 21, 23, 2,   21.50),
  (39, 21, 24, 1,   39.00),
  (40, 22, 16, 1,   39.90),
  (41, 22, 17, 1,   74.50),
  (42, 23, 6,  1,  899.00),
  (43, 23, 7,  1,  249.00),
  (44, 23, 10, 1,  129.00),
  (45, 24, 26, 1,   18.00),
  (46, 24, 27, 1,   17.90),
  (47, 25, 4,  1,  349.00),
  (48, 25, 2,  3,   25.90),
  (49, 26, 19, 1,  119.00),
  (50, 26, 20, 1,   34.90);
`;

  const tables = [
    { name: 'categorias', desc: 'Categorías del catálogo', columns: [['id', 'INTEGER'], ['nombre', 'TEXT']] },
    { name: 'productos', desc: 'Catálogo de productos', columns: [['id', 'INTEGER'], ['nombre', 'TEXT'], ['categoria_id', 'INTEGER → categorias.id'], ['precio', 'REAL'], ['stock', 'INTEGER']] },
    { name: 'clientes', desc: 'Clientes de la tienda', columns: [['id', 'INTEGER'], ['nombre', 'TEXT'], ['ciudad', 'TEXT'], ['email', 'TEXT'], ['fecha_alta', 'TEXT YYYY-MM-DD']] },
    { name: 'departamentos', desc: 'Departamentos de la empresa', columns: [['id', 'INTEGER'], ['nombre', 'TEXT']] },
    { name: 'empleados', desc: 'Plantilla (jefe_id → empleados.id)', columns: [['id', 'INTEGER'], ['nombre', 'TEXT'], ['puesto', 'TEXT'], ['salario', 'REAL'], ['departamento_id', 'INTEGER → departamentos.id'], ['jefe_id', 'INTEGER → empleados.id']] },
    { name: 'pedidos', desc: 'Cabecera de cada pedido', columns: [['id', 'INTEGER'], ['cliente_id', 'INTEGER → clientes.id'], ['empleado_id', 'INTEGER → empleados.id'], ['fecha', 'TEXT YYYY-MM-DD'], ['estado', 'TEXT: completado | enviado | pendiente | cancelado']] },
    { name: 'lineas_pedido', desc: 'Detalle: productos de cada pedido', columns: [['id', 'INTEGER'], ['pedido_id', 'INTEGER → pedidos.id'], ['producto_id', 'INTEGER → productos.id'], ['cantidad', 'INTEGER'], ['precio_unitario', 'REAL']] }
  ];

  const exercises = [
    /* ─────────────── NIVEL 1 · FÁCIL ─────────────── */
    {
      id: 'f01', level: 1, title: 'Todas las columnas de clientes',
      prompt: 'Muestra todas las filas y todas las columnas de la tabla clientes.',
      tables: ['clientes'], hint: 'El asterisco (*) significa "todas las columnas".',
      lesson: 'SELECT * FROM tabla devuelve el contenido completo. Es perfecto para explorar, pero en producción conviene listar solo las columnas necesarias.',
      solution: 'SELECT * FROM clientes;'
    },
    {
      id: 'f02', level: 1, title: 'Nombre y precio del catálogo',
      prompt: 'Lista el nombre y el precio de todos los productos (dos columnas, en ese orden).',
      tables: ['productos'], hint: 'Después de SELECT escribe las columnas separadas por comas.',
      lesson: 'Puedes elegir el orden de las columnas: SELECT nombre, precio no es lo mismo que SELECT precio, nombre.',
      solution: 'SELECT nombre, precio FROM productos;'
    },
    {
      id: 'f03', level: 1, title: 'Productos de más de 100 €',
      prompt: 'Muestra el nombre y el precio de los productos cuyo precio sea estrictamente mayor que 100.',
      tables: ['productos'], hint: 'Filtra las filas con WHERE precio > 100.',
      lesson: 'WHERE se evalúa fila a fila antes de devolver el resultado. Usa >, <, >=, <=, = y <>.',
      solution: 'SELECT nombre, precio FROM productos WHERE precio > 100;'
    },
    {
      id: 'f04', level: 1, title: 'Del más caro al más barato', ordered: true,
      orderBy: 'precio', orderDir: 'desc',
      prompt: 'Muestra el nombre y el precio de todos los productos ordenados de mayor a menor precio.',
      tables: ['productos'], hint: 'ORDER BY precio DESC.',
      lesson: 'ASC (ascendente) es el orden por defecto; DESC invierte el resultado.',
      solution: 'SELECT nombre, precio FROM productos ORDER BY precio DESC;'
    },
    {
      id: 'f05', level: 1, title: 'Los 5 productos más caros', ordered: true,
      orderBy: 'precio', orderDir: 'desc',
      prompt: 'Devuelve el nombre y el precio de los 5 productos más caros, del más caro al más barato.',
      tables: ['productos'], hint: 'Combina ORDER BY ... DESC con LIMIT.',
      lesson: 'LIMIT se aplica después de ordenar: por eso "los N más..." siempre necesita un ORDER BY.',
      solution: 'SELECT nombre, precio FROM productos ORDER BY precio DESC LIMIT 5;'
    },
    {
      id: 'f06', level: 1, title: 'Clientes de Valencia',
      prompt: 'Muestra el nombre y la ciudad de los clientes que viven en Valencia.',
      tables: ['clientes'], hint: 'Los textos van entre comillas simples: \'Valencia\'.',
      lesson: 'En SQL los literales de texto usan comillas simples, no dobles (las dobles son para nombres de tablas/columnas).',
      solution: "SELECT nombre, ciudad FROM clientes WHERE ciudad = 'Valencia';"
    },
    {
      id: 'f07', level: 1, title: 'Salarios intermedios',
      prompt: 'Muestra el nombre y el salario de los empleados cuyo salario esté entre 2000 y 3000, ambos incluidos.',
      tables: ['empleados'], hint: 'BETWEEN a AND b incluye los extremos.',
      lesson: 'BETWEEN es inclusivo en ambos extremos. Para excluirlos, combina > y <.',
      solution: 'SELECT nombre, salario FROM empleados WHERE salario BETWEEN 2000 AND 3000;'
    },
    {
      id: 'f08', level: 1, title: 'Productos agotados',
      prompt: 'Muestra el nombre y el stock de los productos que no tienen existencias (stock igual a 0).',
      tables: ['productos'], hint: 'La condición es stock = 0.',
      lesson: 'Para comparar con NULL no se usa =, sino IS NULL / IS NOT NULL.',
      solution: 'SELECT nombre, stock FROM productos WHERE stock = 0;'
    },
    {
      id: 'f09', level: 1, title: 'Correos de Gmail',
      prompt: 'Muestra el nombre y el email de los clientes cuyo correo termine en @gmail.com.',
      tables: ['clientes'], hint: 'Usa LIKE con el comodín % al principio: \'%@gmail.com\'.',
      lesson: 'En LIKE, % representa cualquier cantidad de caracteres y _ exactamente uno.',
      solution: "SELECT nombre, email FROM clientes WHERE email LIKE '%@gmail.com';"
    },
    {
      id: 'f10', level: 1, title: '¿Cuántos productos hay?',
      prompt: 'Devuelve una única fila con una columna llamada total_productos que cuente todos los productos del catálogo.',
      tables: ['productos'], hint: 'COUNT(*) cuenta filas.',
      lesson: 'COUNT(*) cuenta todas las filas; COUNT(columna) ignora los NULL de esa columna.',
      solution: 'SELECT COUNT(*) AS total_productos FROM productos;'
    },
    {
      id: 'f11', level: 1, title: 'Precio medio y máximo',
      prompt: 'Devuelve una fila con dos columnas: precio_medio (media de los precios) y precio_maximo (el precio más alto).',
      tables: ['productos'], hint: 'AVG() y MAX() son funciones de agregado.',
      lesson: 'Las funciones de agregado (SUM, AVG, MIN, MAX, COUNT) resumen muchas filas en una sola.',
      solution: 'SELECT AVG(precio) AS precio_medio, MAX(precio) AS precio_maximo FROM productos;'
    },
    {
      id: 'f12', level: 1, title: 'Ciudades con clientes', ordered: true,
      orderBy: 'ciudad', orderDir: 'asc',
      prompt: 'Lista cada ciudad donde haya al menos un cliente, sin repetir ninguna, ordenada alfabéticamente de la A a la Z.',
      tables: ['clientes'], hint: 'DISTINCT elimina duplicados; ORDER BY ordena.',
      lesson: 'DISTINCT se aplica a la combinación de columnas seleccionadas, no solo a la primera.',
      solution: 'SELECT DISTINCT ciudad FROM clientes ORDER BY ciudad;'
    },

    /* ─────────────── NIVEL 2 · MEDIO ─────────────── */
    {
      id: 'm01', level: 2, title: 'Productos con su categoría',
      prompt: 'Muestra el nombre del producto y el nombre de su categoría. Llama a la segunda columna categoria.',
      tables: ['productos', 'categorias'], hint: 'JOIN productos p ON p.categoria_id = c.id, con alias para cada tabla.',
      lesson: 'JOIN combina filas de dos tablas cuando se cumple la condición ON. Los alias (p, c) evitan ambigüedades.',
      solution: 'SELECT p.nombre, c.nombre AS categoria FROM productos p JOIN categorias c ON c.id = p.categoria_id;'
    },
    {
      id: 'm02', level: 2, title: 'Categorías vacías',
      prompt: 'Muestra el nombre de las categorías que no tienen ningún producto.',
      tables: ['categorias', 'productos'], hint: 'LEFT JOIN + WHERE p.id IS NULL.',
      lesson: 'LEFT JOIN conserva todas las filas de la izquierda; las que no encuentran pareja quedan con NULL. Filtrar por IS NULL es el patrón clásico para encontrar "huérfanos".',
      solution: 'SELECT c.nombre FROM categorias c LEFT JOIN productos p ON p.categoria_id = c.id WHERE p.id IS NULL;'
    },
    {
      id: 'm03', level: 2, title: 'Pedidos por cliente', ordered: true,
      orderBy: 'pedidos', orderDir: 'desc',
      prompt: 'Muestra el nombre de cada cliente con pedidos y cuántos pedidos ha hecho (columna pedidos). Ordena de más a menos pedidos y, en caso de empate, por nombre.',
      tables: ['clientes', 'pedidos'], hint: 'GROUP BY c.id y COUNT(*). No olvides ORDER BY pedidos DESC, c.nombre.',
      lesson: 'Con GROUP BY, cada grupo produce una fila. Las columnas del SELECT deben ser la clave del grupo o funciones de agregado.',
      solution: 'SELECT c.nombre, COUNT(*) AS pedidos FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id ORDER BY pedidos DESC, c.nombre;'
    },
    {
      id: 'm04', level: 2, title: 'Clientes fieles',
      prompt: 'Muestra el nombre de los clientes que han hecho más de 2 pedidos.',
      tables: ['clientes', 'pedidos'], hint: 'La condición sobre el agregado va en HAVING, no en WHERE.',
      lesson: 'WHERE filtra filas antes de agrupar; HAVING filtra grupos después de agregar.',
      solution: 'SELECT c.nombre FROM clientes c JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id HAVING COUNT(*) > 2;'
    },
    {
      id: 'm05', level: 2, title: 'Importe de cada pedido', ordered: true,
      orderBy: 'id', orderDir: 'asc',
      prompt: 'Para cada pedido que tenga líneas, muestra su id y el importe total (columna total): suma de cantidad × precio_unitario. Ordena por id de pedido.',
      tables: ['pedidos', 'lineas_pedido'], hint: 'SUM(l.cantidad * l.precio_unitario) agrupado por pedido.',
      lesson: 'Puedes agregar expresiones completas, no solo columnas: SUM(cantidad * precio_unitario).',
      solution: 'SELECT p.id, SUM(l.cantidad * l.precio_unitario) AS total FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY p.id ORDER BY p.id;'
    },
    {
      id: 'm06', level: 2, title: 'Ingresos por categoría', ordered: true,
      orderBy: 'ingresos', orderDir: 'desc',
      prompt: 'Calcula los ingresos de cada categoría (columna ingresos: cantidad × precio_unitario de todas sus ventas), redondeados a 2 decimales. Ordena de mayor a menor ingreso.',
      tables: ['categorias', 'productos', 'lineas_pedido'], hint: 'Necesitas encadenar lineas_pedido → productos → categorias.',
      lesson: 'ROUND(valor, 2) redondea. Es útil para presentar importes, aunque conviene redondear solo al mostrar, no al calcular.',
      solution: 'SELECT c.nombre AS categoria, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS ingresos FROM lineas_pedido l JOIN productos p ON p.id = l.producto_id JOIN categorias c ON c.id = p.categoria_id GROUP BY c.id ORDER BY ingresos DESC;'
    },
    {
      id: 'm07', level: 2, title: 'Clientes sin pedidos',
      prompt: 'Muestra el nombre de los clientes que nunca han hecho un pedido.',
      tables: ['clientes', 'pedidos'], hint: 'LEFT JOIN desde clientes y filtra p.id IS NULL.',
      lesson: 'Comprobar NULL en la tabla derecha del LEFT JOIN es la forma más eficiente de encontrar registros sin relación.',
      solution: 'SELECT c.nombre FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL;'
    },
    {
      id: 'm08', level: 2, title: 'Por encima de la media salarial', ordered: true,
      orderBy: 'salario', orderDir: 'desc',
      prompt: 'Muestra el nombre y el salario de los empleados que cobran más que la media de la empresa, ordenados de mayor a menor salario.',
      tables: ['empleados'], hint: 'Una subconsulta escalar: (SELECT AVG(salario) FROM empleados).',
      lesson: 'Una subconsulta escalar devuelve un solo valor y puede usarse donde iría un número.',
      solution: 'SELECT nombre, salario FROM empleados WHERE salario > (SELECT AVG(salario) FROM empleados) ORDER BY salario DESC;'
    },
    {
      id: 'm09', level: 2, title: 'Pedidos de 2025', ordered: true,
      orderBy: 'fecha', orderDir: 'asc',
      prompt: 'Muestra el id del pedido, el nombre del cliente y la fecha, solo para pedidos de 2025, ordenados por fecha.',
      tables: ['pedidos', 'clientes'], hint: "Filtra con fecha LIKE '2025%' o con substr(fecha, 1, 4) = '2025'.",
      lesson: 'Las fechas se guardan como texto YYYY-MM-DD, así que compararlas y ordenarlas alfabéticamente coincide con el orden cronológico.',
      solution: "SELECT p.id, c.nombre, p.fecha FROM pedidos p JOIN clientes c ON c.id = p.cliente_id WHERE p.fecha LIKE '2025%' ORDER BY p.fecha;"
    },
    {
      id: 'm10', level: 2, title: 'Pedidos por estado', ordered: true,
      orderBy: 'total', orderDir: 'desc',
      prompt: 'Muestra cada estado y cuántos pedidos hay en él (columna total). Ordena de más a menos pedidos y, en caso de empate, por estado alfabéticamente.',
      tables: ['pedidos'], hint: 'GROUP BY estado ORDER BY total DESC, estado.',
      lesson: 'Agrupar por una columna de texto es igual de válido que por una numérica.',
      solution: 'SELECT estado, COUNT(*) AS total FROM pedidos GROUP BY estado ORDER BY total DESC, estado;'
    },
    {
      id: 'm11', level: 2, title: 'Top 5 productos más vendidos', ordered: true,
      orderBy: 'unidades', orderDir: 'desc',
      prompt: 'Muestra el nombre del producto y las unidades vendidas (columna unidades) de los 5 productos con más unidades. Ordena de más a menos unidades y, en empate, por nombre.',
      tables: ['productos', 'lineas_pedido'], hint: 'SUM(l.cantidad) agrupado por producto.',
      lesson: 'Al hacer JOIN con lineas_pedido, cada línea cuenta: SUM(cantidad) acumula todas las ventas del producto.',
      solution: 'SELECT pr.nombre, SUM(l.cantidad) AS unidades FROM lineas_pedido l JOIN productos pr ON pr.id = l.producto_id GROUP BY pr.id ORDER BY unidades DESC, pr.nombre LIMIT 5;'
    },
    {
      id: 'm12', level: 2, title: 'Categorías caras', ordered: true,
      orderBy: 'media', orderDir: 'desc',
      prompt: 'Muestra las categorías cuyo precio medio de producto supere los 100 €, con su media redondeada a 2 decimales (columna media). Ordena de media más alta a más baja.',
      tables: ['categorias', 'productos'], hint: 'HAVING AVG(p.precio) > 100.',
      lesson: 'El agregado del HAVING se calcula igual que el del SELECT: no puedes usar el alias en todos los motores, así que repetir AVG(...) es lo más portable.',
      solution: 'SELECT c.nombre, ROUND(AVG(p.precio), 2) AS media FROM productos p JOIN categorias c ON c.id = p.categoria_id GROUP BY c.id HAVING AVG(p.precio) > 100 ORDER BY media DESC;'
    },
    {
      id: 'm13', level: 2, title: 'Los 3 clientes que más gastan', ordered: true,
      orderBy: 'gasto', orderDir: 'desc',
      prompt: 'Muestra el nombre de los 3 clientes que más dinero han gastado y su gasto total redondeado a 2 decimales (columna gasto). Ordena de mayor a menor gasto.',
      tables: ['clientes', 'pedidos', 'lineas_pedido'], hint: 'Tres tablas: clientes → pedidos → lineas_pedido.',
      lesson: 'Al sumar dinero, multiplica siempre cantidad × precio; el precio del pedido puede ser distinto del precio actual del catálogo.',
      solution: 'SELECT c.nombre, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS gasto FROM clientes c JOIN pedidos pe ON pe.cliente_id = c.id JOIN lineas_pedido l ON l.pedido_id = pe.id GROUP BY c.id ORDER BY gasto DESC LIMIT 3;'
    },
    {
      id: 'm14', level: 2, title: 'Plantilla por departamento', ordered: true,
      orderBy: 'nombre', orderDir: 'asc',
      prompt: 'Muestra el nombre de cada empleado y el nombre de su departamento (columna departamento), ordenados por nombre de empleado.',
      tables: ['empleados', 'departamentos'], hint: 'JOIN departamentos d ON d.id = e.departamento_id.',
      lesson: 'Nombrar las columnas calculadas con AS hace que el resultado sea legible y fácil de consumir.',
      solution: 'SELECT e.nombre, d.nombre AS departamento FROM empleados e JOIN departamentos d ON d.id = e.departamento_id ORDER BY e.nombre;'
    },

    /* ─────────────── NIVEL 3 · AVANZADO ─────────────── */
    {
      id: 'a01', level: 3, title: 'Productos por encima de su categoría',
      prompt: 'Muestra el nombre, el precio y la categoría de los productos cuyo precio supera la media de su propia categoría.',
      tables: ['productos', 'categorias'], hint: 'Subconsulta correlacionada: WHERE p2.categoria_id = p.categoria_id.',
      lesson: 'Una subconsulta correlacionada se evalúa para cada fila de la consulta externa y puede referirse a sus columnas.',
      solution: 'SELECT p.nombre, p.precio, c.nombre AS categoria FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE p.precio > (SELECT AVG(p2.precio) FROM productos p2 WHERE p2.categoria_id = p.categoria_id);'
    },
    {
      id: 'a02', level: 3, title: 'Productos que nadie compra',
      prompt: 'Muestra el nombre de los productos que no aparecen en ninguna línea de pedido.',
      tables: ['productos', 'lineas_pedido'], hint: 'NOT EXISTS o NOT IN con una subconsulta sobre lineas_pedido.',
      lesson: 'NOT EXISTS se detiene en cuanto encuentra una coincidencia, así que suele rendir mejor que NOT IN con subconsultas grandes.',
      solution: 'SELECT nombre FROM productos p WHERE NOT EXISTS (SELECT 1 FROM lineas_pedido l WHERE l.producto_id = p.id);'
    },
    {
      id: 'a03', level: 3, title: 'El cliente número uno',
      prompt: 'Muestra el nombre y el gasto total (columna gasto, 2 decimales) del cliente que más ha gastado en toda la tienda.',
      tables: ['clientes', 'pedidos', 'lineas_pedido'], hint: 'Agrupa por cliente, suma y limita a 1.',
      lesson: 'LIMIT 1 tras ORDER BY DESC es la forma rápida de obtener "el que más". Si hubiera empate, este patrón devolvería solo uno.',
      solution: 'SELECT c.nombre, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS gasto FROM clientes c JOIN pedidos pe ON pe.cliente_id = c.id JOIN lineas_pedido l ON l.pedido_id = pe.id GROUP BY c.id ORDER BY gasto DESC LIMIT 1;'
    },
    {
      id: 'a04', level: 3, title: 'La categoría estrella',
      prompt: 'Muestra el nombre de la categoría con más ingresos y esos ingresos redondeados a 2 decimales (columna ingresos).',
      tables: ['categorias', 'productos', 'lineas_pedido'], hint: 'Igual que los ingresos por categoría, pero solo la primera fila.',
      lesson: 'Reutiliza la consulta de agregación y recorta con ORDER BY + LIMIT: es el patrón "top 1".',
      solution: 'SELECT c.nombre AS categoria, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS ingresos FROM lineas_pedido l JOIN productos p ON p.id = l.producto_id JOIN categorias c ON c.id = p.categoria_id GROUP BY c.id ORDER BY ingresos DESC LIMIT 1;'
    },
    {
      id: 'a05', level: 3, title: 'Facturación mensual', ordered: true,
      orderBy: 'mes', orderDir: 'asc',
      prompt: 'Calcula la facturación total de cada mes (columna mes en formato YYYY-MM y total con 2 decimales), ordenada cronológicamente.',
      tables: ['pedidos', 'lineas_pedido'], hint: 'substr(fecha, 1, 7) extrae el mes.',
      lesson: 'SQLite guarda fechas como texto; substr y strftime te permiten agrupar por mes o año sin funciones de fecha complejas.',
      solution: 'SELECT substr(p.fecha, 1, 7) AS mes, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS total FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY mes ORDER BY mes;'
    },
    {
      id: 'a06', level: 3, title: 'Ranking salarial por departamento', ordered: true,
      prompt: 'Para cada empleado, muestra el nombre del departamento, el nombre del empleado, su salario y su posición por salario dentro de su departamento (columna posicion, 1 = el que más cobra). Ordena por departamento y por posición.',
      tables: ['empleados', 'departamentos'], hint: 'ROW_NUMBER() OVER (PARTITION BY departamento_id ORDER BY salario DESC).',
      lesson: 'Las funciones de ventana calculan sobre un conjunto de filas sin colapsarlas, a diferencia de GROUP BY.',
      solution: 'SELECT d.nombre AS departamento, e.nombre, e.salario, ROW_NUMBER() OVER (PARTITION BY e.departamento_id ORDER BY e.salario DESC) AS posicion FROM empleados e JOIN departamentos d ON d.id = e.departamento_id ORDER BY departamento, posicion;'
    },
    {
      id: 'a07', level: 3, title: '¿Quién es el jefe de quién?', ordered: true,
      orderBy: 'empleado', orderDir: 'asc',
      prompt: 'Muestra el nombre de cada empleado y el nombre de su jefe (columna jefe). Incluye a los empleados sin jefe, que deben aparecer con jefe a NULL. Ordena por nombre de empleado.',
      tables: ['empleados'], hint: 'Auto-join con alias distintos: empleados e y empleados j.',
      lesson: 'Un auto-join une una tabla consigo misma usando dos alias. LEFT JOIN conserva a quien no tiene jefe.',
      solution: 'SELECT e.nombre AS empleado, j.nombre AS jefe FROM empleados e LEFT JOIN empleados j ON j.id = e.jefe_id ORDER BY e.nombre;'
    },
    {
      id: 'a08', level: 3, title: 'Peso de cada cliente en la facturación', ordered: true,
      orderBy: 'gasto', orderDir: 'desc',
      prompt: 'Para cada cliente con compras, muestra su nombre, su gasto total (2 decimales) y qué porcentaje representa sobre la facturación global (columna porcentaje, 2 decimales). Ordena de mayor a menor gasto.',
      tables: ['clientes', 'pedidos', 'lineas_pedido'], hint: 'Divide el gasto del cliente entre (SELECT SUM(cantidad * precio_unitario) FROM lineas_pedido).',
      lesson: '100.0 * parte / total evita la división entera. Usa 100.0 (con decimal) para forzar cálculo real.',
      solution: 'SELECT c.nombre, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS gasto, ROUND(100.0 * SUM(l.cantidad * l.precio_unitario) / (SELECT SUM(cantidad * precio_unitario) FROM lineas_pedido), 2) AS porcentaje FROM clientes c JOIN pedidos pe ON pe.cliente_id = c.id JOIN lineas_pedido l ON l.pedido_id = pe.id GROUP BY c.id ORDER BY gasto DESC;'
    },
    {
      id: 'a09', level: 3, title: 'Ticket medio',
      prompt: 'Calcula el importe medio por pedido (columna ticket_medio, 2 decimales), es decir, la media de los totales de cada pedido.',
      tables: ['lineas_pedido'], hint: 'No es AVG(cantidad * precio): primero suma por pedido en una subconsulta y luego haz la media.',
      lesson: 'La media de sumas no es la suma de medias. Piensa siempre en el grano de la agregación: primero por pedido, después global.',
      solution: 'SELECT ROUND(AVG(total), 2) AS ticket_medio FROM (SELECT SUM(cantidad * precio_unitario) AS total FROM lineas_pedido GROUP BY pedido_id);'
    },
    {
      id: 'a10', level: 3, title: 'Departamentos mejor pagados', ordered: true,
      orderBy: 'salario_medio', orderDir: 'desc',
      prompt: 'Muestra los departamentos cuyo salario medio supera la media salarial de la empresa, con su salario medio redondeado a 2 decimales (columna salario_medio). Ordena de mayor a menor.',
      tables: ['departamentos', 'empleados'], hint: 'HAVING AVG(e.salario) > (SELECT AVG(salario) FROM empleados).',
      lesson: 'Puedes comparar un agregado agrupado con una subconsulta escalar en el HAVING.',
      solution: 'SELECT d.nombre, ROUND(AVG(e.salario), 2) AS salario_medio FROM empleados e JOIN departamentos d ON d.id = e.departamento_id GROUP BY d.id HAVING AVG(e.salario) > (SELECT AVG(salario) FROM empleados) ORDER BY salario_medio DESC;'
    },
    {
      id: 'a11', level: 3, title: 'Clientes por encima de la media (CTE)', ordered: true,
      orderBy: 'gasto', orderDir: 'desc',
      prompt: 'Usando una CTE, muestra el nombre y el gasto total (2 decimales) de los clientes cuyo gasto supera el gasto medio por cliente. Ordena de mayor a menor gasto.',
      tables: ['clientes', 'pedidos', 'lineas_pedido'], hint: 'WITH gasto AS (...) SELECT ... WHERE total > (SELECT AVG(total) FROM gasto).',
      lesson: 'Una CTE (WITH ...) es una consulta con nombre que puedes reutilizar en la misma sentencia; mejora la legibilidad frente a subconsultas anidadas.',
      solution: 'WITH gasto AS (SELECT cliente_id, SUM(cantidad * precio_unitario) AS total FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY cliente_id) SELECT c.nombre, ROUND(g.total, 2) AS gasto FROM gasto g JOIN clientes c ON c.id = g.cliente_id WHERE g.total > (SELECT AVG(total) FROM gasto) ORDER BY g.total DESC;'
    },
    {
      id: 'a12', level: 3, title: 'El mejor pagado de cada departamento', ordered: true,
      orderBy: 'salario', orderDir: 'desc',
      prompt: 'Muestra el nombre del empleado, su salario y el nombre de su departamento, solo para el empleado que más cobra en cada departamento. Ordena de mayor a menor salario.',
      tables: ['empleados', 'departamentos'], hint: 'WHERE salario = (SELECT MAX(...) del mismo departamento).',
      lesson: 'Comparar con el máximo de un grupo mediante subconsulta correlacionada evita depender de funciones de ventana.',
      solution: 'SELECT e.nombre, e.salario, d.nombre AS departamento FROM empleados e JOIN departamentos d ON d.id = e.departamento_id WHERE e.salario = (SELECT MAX(salario) FROM empleados e2 WHERE e2.departamento_id = e.departamento_id) ORDER BY e.salario DESC;'
    },

    /* ─────────────── NIVEL 4 · RETO 10 ─────────────── */
    {
      id: 'r01', level: 4, title: 'Top 3 de cada categoría', ordered: true,
      prompt: 'Muestra el top 3 de productos por ingresos dentro de cada categoría: categoría, producto, ingresos (2 decimales) y posición (1, 2, 3). Ordena por categoría y posición.',
      tables: ['categorias', 'productos', 'lineas_pedido'], hint: 'CTE de ventas por producto + RANK() OVER (PARTITION BY categoria_id ORDER BY ingresos DESC); después filtra pos <= 3.',
      lesson: 'No puedes filtrar por el resultado de una función de ventana en el mismo SELECT; envuélvelo en otra CTE.',
      solution: 'WITH ventas AS (SELECT p.id, p.nombre, p.categoria_id, SUM(l.cantidad * l.precio_unitario) AS ingresos FROM lineas_pedido l JOIN productos p ON p.id = l.producto_id GROUP BY p.id), ranking AS (SELECT c.nombre AS categoria, v.nombre AS producto, v.ingresos, RANK() OVER (PARTITION BY v.categoria_id ORDER BY v.ingresos DESC) AS pos FROM ventas v JOIN categorias c ON c.id = v.categoria_id) SELECT categoria, producto, ROUND(ingresos, 2) AS ingresos, pos FROM ranking WHERE pos <= 3 ORDER BY categoria, pos;'
    },
    {
      id: 'r02', level: 4, title: 'Facturación acumulada', ordered: true,
      orderBy: 'fecha', orderDir: 'asc',
      prompt: 'Muestra, para cada día con ventas, la fecha, el total del día y la facturación acumulada hasta ese día (columnas total_dia y acumulado, 2 decimales). Ordena por fecha.',
      tables: ['pedidos', 'lineas_pedido'], hint: 'SUM(total) OVER (ORDER BY fecha) sobre una CTE diaria.',
      lesson: 'Una función de ventana con ORDER BY y sin PARTITION calcula el acumulado de todo el conjunto.',
      solution: 'WITH diario AS (SELECT p.fecha, SUM(l.cantidad * l.precio_unitario) AS total FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY p.fecha) SELECT fecha, ROUND(total, 2) AS total_dia, ROUND(SUM(total) OVER (ORDER BY fecha), 2) AS acumulado FROM diario ORDER BY fecha;'
    },
    {
      id: 'r03', level: 4, title: 'Segmentar la cartera de clientes',
      orderBy: 'gasto', orderDir: 'desc',
      prompt: 'Clasifica a todos los clientes según su gasto: VIP si es 3000 o más, Oro si es 1500 o más, Plata si ha gastado algo, y Sin compras si no ha comprado nada. Devuelve nombre, gasto (2 decimales) y nivel. Ordena de mayor a menor gasto.',
      tables: ['clientes', 'pedidos', 'lineas_pedido'], hint: 'LEFT JOIN doble desde clientes + COALESCE(SUM(...), 0) + CASE.',
      lesson: 'COALESCE convierte NULL en 0 para que los clientes sin compras también aparezcan en la agregación.',
      solution: "WITH gasto AS (SELECT c.id, c.nombre, COALESCE(SUM(l.cantidad * l.precio_unitario), 0) AS total FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id LEFT JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY c.id) SELECT nombre, ROUND(total, 2) AS gasto, CASE WHEN total >= 3000 THEN 'VIP' WHEN total >= 1500 THEN 'Oro' WHEN total > 0 THEN 'Plata' ELSE 'Sin compras' END AS nivel FROM gasto ORDER BY total DESC;"
    },
    {
      id: 'r04', level: 4, title: 'El producto estrella de cada mes', ordered: true,
      orderBy: 'mes', orderDir: 'asc',
      prompt: 'Para cada mes (formato YYYY-MM), muestra el producto que más unidades vendió ese mes y cuántas unidades. Columnas: mes, producto, unidades. Ordena por mes.',
      tables: ['pedidos', 'lineas_pedido', 'productos'], hint: 'Agrupa por mes y producto, y usa ROW_NUMBER() OVER (PARTITION BY mes ORDER BY unidades DESC) para quedarte con el primero.',
      lesson: 'ROW_NUMBER, RANK y DENSE_RANK se diferencian en cómo tratan los empates: ROW_NUMBER siempre da números consecutivos.',
      solution: 'WITH mensual AS (SELECT substr(p.fecha, 1, 7) AS mes, pr.nombre, SUM(l.cantidad) AS unidades FROM pedidos p JOIN lineas_pedido l ON l.pedido_id = p.id JOIN productos pr ON pr.id = l.producto_id GROUP BY mes, pr.id), ranking AS (SELECT mes, nombre, unidades, ROW_NUMBER() OVER (PARTITION BY mes ORDER BY unidades DESC, nombre) AS pos FROM mensual) SELECT mes, nombre AS producto, unidades FROM ranking WHERE pos = 1 ORDER BY mes;'
    },
    {
      id: 'r05', level: 4, title: 'Ranking comercial', ordered: true,
      orderBy: 'facturado', orderDir: 'desc',
      prompt: 'Muestra los 3 empleados que más dinero han vendido, con su nombre y el importe facturado en sus pedidos (columna facturado, 2 decimales). Ordena de mayor a menor.',
      tables: ['empleados', 'pedidos', 'lineas_pedido'], hint: 'Une empleados → pedidos → lineas_pedido y agrupa por empleado.',
      lesson: 'Un mismo esquema sirve para responder preguntas de negocio muy distintas cambiando la clave de agrupación.',
      solution: 'SELECT e.nombre, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS facturado FROM empleados e JOIN pedidos p ON p.empleado_id = e.id JOIN lineas_pedido l ON l.pedido_id = p.id GROUP BY e.id ORDER BY facturado DESC LIMIT 3;'
    },
    {
      id: 'r06', level: 4, title: 'Cartera inactiva', ordered: true,
      orderBy: 'ultimo_pedido', orderDir: 'asc',
      prompt: 'Muestra el nombre de cada cliente y la fecha de su último pedido (columna ultimo_pedido). Incluye a los que nunca han pedido (NULL) y a los que no han comprado desde antes de 2025. Ordena por fecha (los NULL primero) y, a igualdad, por nombre.',
      tables: ['clientes', 'pedidos'], hint: 'LEFT JOIN + GROUP BY + HAVING MAX(p.fecha) IS NULL OR MAX(p.fecha) < \'2025-01-01\'.',
      lesson: 'HAVING puede filtrar por un agregado como MAX(fecha) para segmentar por recencia.',
      solution: "SELECT c.nombre, MAX(p.fecha) AS ultimo_pedido FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id GROUP BY c.id HAVING MAX(p.fecha) IS NULL OR MAX(p.fecha) < '2025-01-01' ORDER BY ultimo_pedido, c.nombre;"
    }
  ];

  const examples = [
    { label: 'Ver todas las tablas', sql: "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;" },
    { label: 'Últimos pedidos con cliente', sql: 'SELECT p.id, c.nombre, p.fecha, p.estado\nFROM pedidos p\nJOIN clientes c ON c.id = p.cliente_id\nORDER BY p.fecha DESC\nLIMIT 10;' },
    { label: 'Stock bajo (menos de 10)', sql: 'SELECT nombre, stock\nFROM productos\nWHERE stock < 10\nORDER BY stock;' },
    { label: 'Ventas por categoría', sql: 'SELECT c.nombre AS categoria, ROUND(SUM(l.cantidad * l.precio_unitario), 2) AS ingresos\nFROM lineas_pedido l\nJOIN productos p ON p.id = l.producto_id\nJOIN categorias c ON c.id = p.categoria_id\nGROUP BY c.id\nORDER BY ingresos DESC;' },
    { label: 'Crear una tabla propia', sql: 'CREATE TABLE IF NOT EXISTS notas (\n  id INTEGER PRIMARY KEY,\n  texto TEXT NOT NULL,\n  creada TEXT DEFAULT (date(\'now\'))\n);\nINSERT INTO notas (texto) VALUES (\'Mi primera tabla\');\nSELECT * FROM notas;' }
  ];

  const data = { schema, seed, tables, exercises, examples };

  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  root.SQLAB_DATA = data;
})(typeof window !== 'undefined' ? window : globalThis);
