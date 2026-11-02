-- Lista real de regalos del baby shower de HaoRan Santino.
-- Pegar en el SQL Editor de Neon y ejecutar UNA vez.
-- ATENCIÓN: borra los regalos de ejemplo (y cualquier respuesta de prueba) antes de cargar la lista.

BEGIN;

CREATE TABLE IF NOT EXISTS gifts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  quantity INT NOT NULL CHECK (quantity >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pledges (
  id SERIAL PRIMARY KEY,
  gift_id INT NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
  giver_name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  co_givers TEXT[] NOT NULL DEFAULT '{}',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
ALTER TABLE gifts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';

-- Evita que la web vuelva a cargar los ejemplos
INSERT INTO app_meta (key, value) VALUES ('seeded', '1') ON CONFLICT (key) DO NOTHING;

DELETE FROM gifts;

INSERT INTO gifts (category, name, description, link, quantity, sort_order) VALUES
  ('🛏️ Dormir', 'Cuna, moisés o colecho certificado', '', '', 1, 0),
  ('🛏️ Dormir', 'Colchón firme', '', '', 1, 1),
  ('🛏️ Dormir', 'Protector impermeable para colchón', '', '', 1, 2),
  ('🛏️ Dormir', 'Juegos de sábanas ajustables', 'Necesitamos 2 o 3 juegos', '', 3, 3),
  ('🛏️ Dormir', 'Bolsa de dormir (sleep sack)', 'Opcional', '', 1, 4),
  ('🛏️ Dormir', 'Monitor para bebé', 'Opcional', '', 1, 5),
  ('👕 Ropa', 'Bodies manga larga', 'Talle 8 meses en adelante · 6 a 8 en total', '', 8, 6),
  ('👕 Ropa', 'Bodies manga corta', 'Talle 8 meses en adelante · 6 a 8 en total', '', 8, 7),
  ('👕 Ropa', 'Enteritos o pijamas', 'Talle 8 meses en adelante · 6 a 8 en total', '', 8, 8),
  ('👕 Ropa', 'Pantalones', 'Talle 8 meses en adelante · 4 a 6 en total', '', 6, 9),
  ('👕 Ropa', 'Pares de medias', 'Talle 8 meses en adelante', '', 6, 10),
  ('👕 Ropa', 'Abrigo para salir', 'Según la estación', '', 1, 11),
  ('🧺 Lavado', 'Detergente suave para ropa de bebé', '', '', 1, 12),
  ('🧺 Lavado', 'Canasto para ropa sucia', '', '', 1, 13),
  ('🍼 Alimentación', 'Discos absorbentes para lactancia', '', '', 1, 14),
  ('🍼 Alimentación', 'Extractor de leche', 'Opcional', '', 1, 15),
  ('🍼 Alimentación', 'Bolsas o recipientes para almacenar leche', 'Opcional', '', 1, 16),
  ('🍼 Alimentación', 'Set mamadera y chupete Zero Zero (recién nacido)', '', 'https://caprauruguay.com/products/set-recien-nacido-zero-zero™-mamadera-chupete-fair', 1, 17),
  ('🍼 Alimentación', 'Tetinas para recién nacido', '', '', 1, 18),
  ('🍼 Alimentación', 'Cepillo para lavar mamaderas', '', '', 1, 19),
  ('🍼 Alimentación', 'Escurridor de mamaderas', '', '', 1, 20),
  ('🚿 Higiene', 'Cambiador', '', '', 1, 21),
  ('🚿 Higiene', 'Pañales talle RN', 'Paquetes normales', '', 6, 22),
  ('🚿 Higiene', 'Pañales talle P', 'Paquetes', '', 6, 23),
  ('🚿 Higiene', 'Pañales talle M', 'Paquetes', '', 10, 24),
  ('🚿 Higiene', 'Pañales talle G', 'Paquetes', '', 5, 25),
  ('🚿 Higiene', 'Pañales descartables (2 a 4 años)', '', '', 1, 26),
  ('🚿 Higiene', 'Toallitas húmedas o algodón', '', '', 1, 27),
  ('🚿 Higiene', 'Crema para paspaduras', '', '', 1, 28),
  ('🚿 Higiene', 'Bañera o adaptador', '', '', 1, 29),
  ('🚿 Higiene', 'Toallas con capucha', '', '', 2, 30),
  ('🚿 Higiene', 'Jabón líquido suave', '', '', 1, 31),
  ('🚿 Higiene', 'Shampoo para bebé', 'Opcional', '', 1, 32),
  ('🩺 Botiquín', 'Jeringas pequeñas de goma', '', '', 1, 33),
  ('🚗 Transporte', 'Silla para auto homologada', '', '', 1, 34),
  ('🏠 Hogar', 'Sillón cómodo para alimentar al bebé', '', '', 1, 35),
  ('🧸 Accesorios', 'Babitas', 'Necesitamos entre 8 y 12', '', 12, 36),
  ('🧸 Accesorios', 'Chupete', '', '', 1, 37),
  ('🧸 Accesorios', 'Portachupete', '', '', 1, 38),
  ('🧸 Accesorios', 'Juguete sensorial simple', 'Para más adelante', '', 1, 39),
  ('🤱 Para el posparto de Vivi', 'Toallas higiénicas o pañales posparto', '', '', 1, 40),
  ('🤱 Para el posparto de Vivi', 'Toallitas refrescantes posparto', '', '', 1, 41),
  ('🤱 Para el posparto de Vivi', 'Gel íntimo hidratante', '', '', 1, 42),
  ('🤱 Para el posparto de Vivi', 'Compresas posparto', '', '', 1, 43),
  ('🤱 Para el posparto de Vivi', 'Remeras o vestidos con apertura para lactancia', '', '', 1, 44),
  ('🤱 Para el posparto de Vivi', 'Corpiños de lactancia', '', '', 1, 45),
  ('🤱 Para el posparto de Vivi', 'Discos absorbentes reutilizables', '', '', 1, 46),
  ('🤱 Para el posparto de Vivi', 'Ropa interior cómoda', '', '', 1, 47);

COMMIT;

-- Verificación: tiene que mostrar 48 regalos
SELECT category, count(*) AS regalos, sum(quantity) AS unidades FROM gifts GROUP BY category ORDER BY min(sort_order);
