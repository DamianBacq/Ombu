-- Ombú — estudio de piel (página modelo)
-- Crear la base "ombu" en PostgreSQL y correr este script entero.

DROP TABLE IF EXISTS pago, pedido_item, pedido, turno, cliente, consulta, producto, categoria,
    tratamiento, profesional, horario_atencion, usuario CASCADE;

CREATE TABLE categoria (
    id serial PRIMARY KEY,
    nombre varchar(60) NOT NULL,
    slug varchar(60) NOT NULL UNIQUE
);

CREATE TABLE producto (
    id serial PRIMARY KEY,
    categoria_id int NOT NULL REFERENCES categoria(id),
    nombre varchar(100) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    resumen varchar(200) NOT NULL,
    descripcion text NOT NULL,
    modo_uso text NOT NULL,
    tipo_piel varchar(20) NOT NULL CHECK (tipo_piel IN ('Todas', 'Seca', 'Grasa', 'Mixta', 'Sensible')),
    contenido varchar(30) NOT NULL,
    precio numeric(10,2) NOT NULL,
    precio_anterior numeric(10,2),
    stock int NOT NULL,
    imagen varchar(200) NOT NULL,
    destacado boolean NOT NULL DEFAULT false,
    activo boolean NOT NULL DEFAULT true
);

CREATE TABLE tratamiento (
    id serial PRIMARY KEY,
    nombre varchar(100) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    tipo varchar(20) NOT NULL CHECK (tipo IN ('Facial', 'Corporal')),
    resumen varchar(200) NOT NULL,
    descripcion text NOT NULL,
    duracion_minutos int NOT NULL,
    precio numeric(10,2) NOT NULL,
    imagen varchar(200) NOT NULL,
    activo boolean NOT NULL DEFAULT true
);

CREATE TABLE profesional (
    id serial PRIMARY KEY,
    nombre varchar(60) NOT NULL,
    especialidad varchar(100) NOT NULL,
    tipo varchar(20) NOT NULL CHECK (tipo IN ('Facial', 'Corporal')),
    activo boolean NOT NULL DEFAULT true
);

CREATE TABLE horario_atencion (
    id serial PRIMARY KEY,
    dia_semana int NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    hora_desde time NOT NULL,
    hora_hasta time NOT NULL
);

CREATE TABLE cliente (
    id serial PRIMARY KEY,
    nombre varchar(60) NOT NULL,
    apellido varchar(60) NOT NULL,
    telefono varchar(30) NOT NULL,
    email varchar(120) NOT NULL UNIQUE
);

CREATE TABLE turno (
    id serial PRIMARY KEY,
    cliente_id int NOT NULL REFERENCES cliente(id),
    tratamiento_id int NOT NULL REFERENCES tratamiento(id),
    profesional_id int NOT NULL REFERENCES profesional(id),
    fecha_hora timestamp NOT NULL,
    precio numeric(10,2) NOT NULL,
    sena numeric(10,2) NOT NULL,
    estado varchar(20) NOT NULL CHECK (estado IN ('PendientePago', 'Confirmado', 'Cancelado', 'Completado', 'Ausente')),
    codigo uuid NOT NULL UNIQUE,
    fecha_creacion timestamp NOT NULL
);

CREATE UNIQUE INDEX turno_horario_unico ON turno (profesional_id, fecha_hora) WHERE estado <> 'Cancelado';

CREATE TABLE pedido (
    id serial PRIMARY KEY,
    cliente_id int NOT NULL REFERENCES cliente(id),
    codigo uuid NOT NULL UNIQUE,
    estado varchar(20) NOT NULL CHECK (estado IN ('PendientePago', 'Pagado', 'Preparando', 'Enviado', 'Entregado', 'Cancelado')),
    entrega varchar(10) NOT NULL CHECK (entrega IN ('Retiro', 'Envio')),
    direccion varchar(150),
    localidad varchar(80),
    codigo_postal varchar(10),
    subtotal numeric(10,2) NOT NULL,
    costo_envio numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    fecha timestamp NOT NULL
);

CREATE TABLE pedido_item (
    id serial PRIMARY KEY,
    pedido_id int NOT NULL REFERENCES pedido(id),
    producto_id int NOT NULL REFERENCES producto(id),
    nombre varchar(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    cantidad int NOT NULL
);

CREATE TABLE pago (
    id serial PRIMARY KEY,
    pedido_id int REFERENCES pedido(id),
    turno_id int REFERENCES turno(id),
    monto numeric(10,2) NOT NULL,
    estado varchar(20) NOT NULL CHECK (estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    mp_pago_id varchar(40),
    fecha timestamp NOT NULL
);

CREATE TABLE consulta (
    id serial PRIMARY KEY,
    nombre varchar(80) NOT NULL,
    email varchar(120) NOT NULL,
    mensaje text NOT NULL,
    fecha timestamp NOT NULL,
    leida boolean NOT NULL DEFAULT false
);

CREATE TABLE usuario (
    id serial PRIMARY KEY,
    usuario varchar(40) NOT NULL UNIQUE,
    password_hash varchar(100) NOT NULL
);

-- Datos de la página modelo ------------------------------------------------

INSERT INTO categoria (nombre, slug) VALUES
('Sérums y aceites', 'serums'),
('Hidratación', 'hidratacion'),
('Limpieza y exfoliación', 'limpieza'),
('Cuerpo y ritual', 'cuerpo'),
('Herramientas y regalos', 'regalos');

INSERT INTO producto (categoria_id, nombre, slug, resumen, descripcion, modo_uso, tipo_piel, contenido, precio, precio_anterior, stock, imagen, destacado) VALUES
(1, 'Sérum vitamina C 15%', 'serum-vitamina-c', 'Unifica el tono y suma luminosidad desde la primera semana.',
 'Vitamina C estabilizada con ácido ferúlico y vitamina E. Ayuda a atenuar manchas, protege frente al daño ambiental y deja la piel con un brillo sano, sin sensación grasa.',
 'Por la mañana, 3 o 4 gotas sobre la piel limpia y seca. Después, hidratante y protector solar.', 'Todas', '30 ml', 28500, 32000, 24, '/img/p-vitamina-c.jpg', true),
(1, 'Aceite de rosa mosqueta', 'aceite-rosa-mosqueta', 'Prensado en frío. Para cicatrices, marcas y piel apagada.',
 'Aceite puro de rosa mosqueta patagónica, rico en ácidos grasos y vitamina A natural. Regenera, nutre y mejora la textura de la piel con el uso diario.',
 'De noche, 2 o 3 gotas tibias entre las manos. Presionar suavemente sobre rostro y cuello.', 'Seca', '20 ml', 16900, NULL, 40, '/img/p-rosa-mosqueta.jpg', true),
(1, 'Sérum niacinamida 10%', 'serum-niacinamida', 'Afina poros y equilibra la piel grasa o mixta.',
 'Niacinamida al 10% con zinc. Regula el sebo, reduce la apariencia de los poros y calma rojeces. Textura acuosa que se absorbe al instante.',
 'Mañana y noche, antes de la crema. Si usás vitamina C, alternalas: una de día y otra de noche.', 'Grasa', '30 ml', 21500, NULL, 31, '/img/p-niacinamida.jpg', false),
(1, 'Óleo nocturno reparador', 'oleo-nocturno', 'Mezcla de aceites vegetales para despertar con la piel descansada.',
 'Jojoba, almendras y lavanda en una fórmula ligera que repara la barrera de la piel mientras dormís. Aroma suave y relajante.',
 'Como último paso de la noche, 4 gotas con un masaje ascendente.', 'Seca', '30 ml', 24900, NULL, 3, '/img/p-oleo-noche.jpg', false),
(2, 'Gel calmante de aloe', 'gel-aloe', 'Frescura inmediata para piel sensibilizada o después del sol.',
 'Aloe vera al 92% con pantenol y centella asiática. Calma, hidrata y alivia la tirantez. Ideal después de depilación, sol o tratamientos.',
 'Aplicar una capa fina sobre la zona. Guardado en la heladera es todavía más refrescante.', 'Sensible', '200 ml', 12800, NULL, 55, '/img/p-aloe.jpg', true),
(2, 'Set rutina de noche', 'set-rutina-noche', 'Limpiador, sérum y crema: los tres pasos de la noche en una caja.',
 'Una rutina completa pensada por nuestras cosmiatras: limpiador en gel, sérum renovador y crema nutritiva de textura rica. Viene en caja lista para regalar.',
 'Limpiar, aplicar el sérum y sellar con la crema. Todas las noches.', 'Todas', '3 productos', 58900, 66000, 12, '/img/p-set-noche.jpg', true),
(3, 'Exfoliante de azúcar y coco', 'exfoliante-azucar-coco', 'Pulido suave que deja la piel lisa y perfumada.',
 'Azúcar fina, aceite de coco y manteca de karité. Retira células muertas sin irritar y deja una película nutritiva.',
 'Una o dos veces por semana, sobre la piel húmeda, con movimientos circulares. Enjuagar con agua tibia.', 'Todas', '250 g', 14500, NULL, 0, '/img/p-exfoliante.jpg', false),
(3, 'Aceite esencial de eucalipto', 'aceite-eucalipto', 'Para vahos, baños y difusor. Despeja y renueva.',
 'Aceite esencial 100% puro de eucalipto globulus. Un clásico para el baño de vapor antes de la limpieza facial casera.',
 'Unas gotas en un bol con agua caliente para vapor, o en el difusor. No aplicar puro sobre la piel.', 'Todas', '10 ml', 7900, NULL, 60, '/img/p-eucalipto.jpg', false),
(4, 'Aceite corporal de caléndula', 'aceite-calendula', 'Nutrición profunda para piernas, brazos y escote.',
 'Caléndula, girasol y vitamina E. Nutre la piel seca del cuerpo y es el mismo aceite que usamos en los masajes del estudio.',
 'Después de la ducha, con la piel todavía húmeda.', 'Seca', '120 ml', 15900, NULL, 22, '/img/p-calendula.jpg', true),
(4, 'Kit ritual de baño', 'kit-ritual-bano', 'Sales, cepillo de fibras naturales y jabón artesanal.',
 'Todo para un baño de inmersión en casa: sales del mar con lavanda, cepillo para masaje en seco y jabón de avena hecho a mano.',
 'Cepillar la piel en seco hacia el corazón, disolver las sales en el agua tibia y quedarse 20 minutos.', 'Todas', '3 piezas', 26500, NULL, 9, '/img/p-ritual-bano.jpg', false),
(5, 'Rodillo de cuarzo rosa y gua sha', 'rodillo-cuarzo-gua-sha', 'Masaje facial en casa para desinflamar y relajar.',
 'Piedra de cuarzo rosa natural. El rodillo desinflama y el gua sha marca el contorno. Incluye un mini sérum para empezar.',
 'Sobre la piel con sérum o aceite, siempre de adentro hacia afuera y de abajo hacia arriba. 5 minutos alcanzan.', 'Todas', '2 piezas', 19900, NULL, 15, '/img/p-cuarzo.jpg', false),
(5, 'Tarjeta de regalo', 'tarjeta-regalo', 'Para usar en cualquier tratamiento o producto del estudio.',
 'Una tarjeta digital por $30.000 que llega por mail con un código. Se puede usar en la tienda o en el estudio, durante 6 meses.',
 'Al reservar o comprar, presentá el código. Si sobra saldo, queda para la próxima.', 'Todas', 'Digital', 30000, NULL, 999, '/img/p-giftcard.svg', false);

INSERT INTO tratamiento (nombre, slug, tipo, resumen, descripcion, duracion_minutos, precio, imagen) VALUES
('Limpieza facial profunda', 'limpieza-facial', 'Facial', 'Vapor, extracción y máscara según tu piel.',
 'Empezamos con un diagnóstico de tu piel. Después, doble limpieza, vapor de ozono, extracción cuidadosa, alta frecuencia y una máscara elegida para vos. Terminamos con hidratación y protector solar.', 60, 32000, '/img/t-limpieza.jpg'),
('Dermaplaning', 'dermaplaning', 'Facial', 'Piel lisa, sin vello ni células muertas.',
 'Con un bisturí estéril retiramos la capa superficial de células muertas y el vello fino. La piel queda muy suave, el maquillaje se asienta mejor y los activos penetran más.', 45, 29000, '/img/t-dermaplaning.jpg'),
('Detox con arcilla', 'detox-arcilla', 'Facial', 'Purifica y matifica la piel grasa o con brotes.',
 'Limpieza, exfoliación enzimática y máscara de arcillas verde y blanca. Regula el sebo y deja la piel fresca y equilibrada. Ideal para piel grasa o mixta.', 50, 27500, '/img/t-arcilla.jpg'),
('Hidratación intensiva', 'hidratacion-intensiva', 'Facial', 'Ácido hialurónico y masaje para piel seca o cansada.',
 'Un tratamiento de rescate: ácido hialurónico en varias capas, máscara de alginato y masaje facial relajante. La piel recupera el volumen y la luz.', 60, 34000, '/img/t-hidratacion.jpg'),
('Masaje descontracturante', 'masaje-descontracturante', 'Corporal', 'Espalda, cuello y hombros, con aceite tibio.',
 'Masaje de presión media a firme enfocado en la espalda, el cuello y los hombros. Usamos aceite de caléndula tibio. Ideal si pasás muchas horas sentado.', 60, 30000, '/img/t-descontracturante.jpg'),
('Masaje con piedras calientes', 'piedras-calientes', 'Corporal', 'Calor profundo que relaja los músculos.',
 'Piedras volcánicas tibias que se deslizan y se apoyan sobre los puntos de tensión. Un masaje lento, para desconectar por completo.', 60, 38000, '/img/t-piedras.jpg'),
('Drenaje linfático', 'drenaje-linfatico', 'Corporal', 'Desinflama piernas y reduce la retención.',
 'Técnica manual suave y rítmica que estimula la circulación linfática. Alivia la sensación de piernas pesadas y la retención de líquidos.', 50, 28000, '/img/t-drenaje.jpg');

-- Cada profesional atiende los tratamientos de su tipo
INSERT INTO profesional (nombre, especialidad, tipo) VALUES
('Julieta Arce', 'Cosmiatra', 'Facial'),
('Martina Sosa', 'Cosmetóloga', 'Facial'),
('Lucas Ferreyra', 'Masoterapeuta', 'Corporal');

-- Lunes a viernes de 9 a 19, sábados de 10 a 14 (domingo cerrado)
INSERT INTO horario_atencion (dia_semana, hora_desde, hora_hasta) VALUES
(1, '09:00', '19:00'), (2, '09:00', '19:00'), (3, '09:00', '19:00'),
(4, '09:00', '19:00'), (5, '09:00', '19:00'), (6, '10:00', '14:00');

-- Clientes, pedidos y turnos de ejemplo (para que el panel tenga datos) ---

INSERT INTO cliente (nombre, apellido, telefono, email) VALUES
('Camila', 'Rodríguez', '11 5555-0101', 'camila.demo@ejemplo.com'),
('Sofía', 'López', '11 5555-0102', 'sofia.demo@ejemplo.com'),
('Valentina', 'Gómez', '11 5555-0103', 'valentina.demo@ejemplo.com'),
('Lucía', 'Fernández', '11 5555-0104', 'lucia.demo@ejemplo.com'),
('Martín', 'Díaz', '11 5555-0105', 'martin.demo@ejemplo.com'),
('Florencia', 'Martínez', '11 5555-0106', 'florencia.demo@ejemplo.com'),
('Agustina', 'Pérez', '11 5555-0107', 'agustina.demo@ejemplo.com'),
('Tomás', 'García', '11 5555-0108', 'tomas.demo@ejemplo.com');

-- 70 pedidos repartidos en los últimos 60 días
INSERT INTO pedido (cliente_id, codigo, estado, entrega, direccion, localidad, codigo_postal, subtotal, costo_envio, total, fecha)
SELECT 1 + (g % 8), gen_random_uuid(),
       CASE WHEN g <= 4 THEN 'Pagado' WHEN g <= 7 THEN 'Preparando' WHEN g <= 10 THEN 'Enviado' ELSE 'Entregado' END,
       CASE WHEN g % 3 = 0 THEN 'Retiro' ELSE 'Envio' END,
       CASE WHEN g % 3 = 0 THEN NULL ELSE 'Calle de ejemplo ' || (100 + g) END,
       CASE WHEN g % 3 = 0 THEN NULL ELSE (ARRAY['Lomas de Zamora','Banfield','Temperley','Adrogué','Lanús'])[1 + g % 5] END,
       CASE WHEN g % 3 = 0 THEN NULL ELSE '1832' END,
       0, 0, 0,
       date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires') - ((g * 6) / 7) * interval '1 day' + (10 + g % 9) * interval '1 hour'
FROM generate_series(1, 70) g;

INSERT INTO pedido_item (pedido_id, producto_id, nombre, precio, cantidad)
SELECT p.id, pr.id, pr.nombre, pr.precio, 1 + (p.id % 2)
FROM pedido p JOIN producto pr ON pr.id = 1 + (p.id * 7) % 11;

INSERT INTO pedido_item (pedido_id, producto_id, nombre, precio, cantidad)
SELECT p.id, pr.id, pr.nombre, pr.precio, 1
FROM pedido p JOIN producto pr ON pr.id = 1 + (p.id * 3 + 4) % 11
WHERE p.id % 3 <> 0 AND pr.id <> 1 + (p.id * 7) % 11;

UPDATE pedido p SET subtotal = (SELECT sum(precio * cantidad) FROM pedido_item WHERE pedido_id = p.id);
UPDATE pedido SET costo_envio = CASE WHEN entrega = 'Envio' AND subtotal < 60000 THEN 4500 ELSE 0 END;
UPDATE pedido SET total = subtotal + costo_envio;

INSERT INTO pago (pedido_id, monto, estado, mp_pago_id, fecha)
SELECT id, total, 'Aprobado', 'demo-' || id, fecha FROM pedido;

-- Turnos de ejemplo: completados en el pasado y confirmados en los próximos días
INSERT INTO turno (cliente_id, tratamiento_id, profesional_id, fecha_hora, precio, sena, estado, codigo, fecha_creacion)
SELECT 1 + (g % 8), t.id,
       CASE WHEN t.tipo = 'Corporal' THEN 3 ELSE 1 + (g % 2) END,
       date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires') - (g / 2) * interval '1 day' + (10 + (g % 7)) * interval '1 hour',
       t.precio, round(t.precio * 0.3), 'Completado', gen_random_uuid(),
       now() AT TIME ZONE 'America/Argentina/Buenos_Aires' - (g / 2 + 3) * interval '1 day'
FROM generate_series(2, 80) g JOIN tratamiento t ON t.id = 1 + (g % 7)
WHERE extract(dow FROM date_trunc('day', now()) - (g / 2) * interval '1 day') BETWEEN 1 AND 5;

INSERT INTO turno (cliente_id, tratamiento_id, profesional_id, fecha_hora, precio, sena, estado, codigo, fecha_creacion)
SELECT 1 + (g % 8), t.id,
       CASE WHEN t.tipo = 'Corporal' THEN 3 ELSE 1 + (g % 2) END,
       date_trunc('day', now() AT TIME ZONE 'America/Argentina/Buenos_Aires') + (1 + g / 3) * interval '1 day' + (10 + (g % 6)) * interval '1 hour',
       t.precio, round(t.precio * 0.3), 'Confirmado', gen_random_uuid(),
       now() AT TIME ZONE 'America/Argentina/Buenos_Aires' - interval '1 day'
FROM generate_series(0, 14) g JOIN tratamiento t ON t.id = 1 + (g % 7)
WHERE extract(dow FROM date_trunc('day', now()) + (1 + g / 3) * interval '1 day') BETWEEN 1 AND 5;

INSERT INTO pago (turno_id, monto, estado, mp_pago_id, fecha)
SELECT id, sena, 'Aprobado', 'demo-t' || id, fecha_creacion FROM turno;

INSERT INTO pago (turno_id, monto, estado, mp_pago_id, fecha)
SELECT id, precio - sena, 'Aprobado', NULL, fecha_hora FROM turno WHERE estado = 'Completado';

INSERT INTO consulta (nombre, email, mensaje, fecha) VALUES
('Paula', 'paula.demo@ejemplo.com', 'Hola, ¿hacen limpieza facial para adolescentes? Mi hija tiene 15 años.', now() AT TIME ZONE 'America/Argentina/Buenos_Aires' - interval '5 hours'),
('Diego', 'diego.demo@ejemplo.com', '¿Tienen tarjetas de regalo para masajes? Quiero regalar uno para un cumpleaños.', now() AT TIME ZONE 'America/Argentina/Buenos_Aires' - interval '1 day');
