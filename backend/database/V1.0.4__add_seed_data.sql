-- ==============================
-- Migración: Añadir datos de prueba del esquema deploy.sql
-- ==============================
-- Datos de prueba para instrumentos (ejemplos) 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Inserta una lista de instrumentos con sus categorías.
INSERT INTO
  instruments (id, name, category)
VALUES
  (gen_random_uuid (), 'Bajo', 'cuerda'),
  (
    gen_random_uuid (),
    'Guitarra Eléctrica',
    'cuerda'
  ),
  (gen_random_uuid (), 'Guitarra Acústica', 'cuerda'),
  (gen_random_uuid (), 'Violín', 'cuerda'),
  (gen_random_uuid (), 'Violonchelo', 'cuerda'),
  (gen_random_uuid (), 'Contrabajo', 'cuerda'),
  (gen_random_uuid (), 'Piano', 'teclado'),
  (gen_random_uuid (), 'Batería', 'percusión'),
  (gen_random_uuid (), 'Vocalista', 'voces'),
  (gen_random_uuid (), 'Conga', 'percusión'),
  (gen_random_uuid (), 'Güira', 'percusión'),
  (gen_random_uuid (), 'Tambora', 'percusión'),
  (gen_random_uuid (), 'Timbal', 'percusión'),
  (gen_random_uuid (), 'Saxofón', 'viento'),
  (gen_random_uuid (), 'Flauta', 'viento'),
  (gen_random_uuid (), 'Trompeta', 'viento'),
  (gen_random_uuid (), 'Clarinet', 'viento')
ON CONFLICT (name) DO NOTHING;

select * from instruments;

-- Configuración de precios de prueba si no existe
-- Inserta una configuración de precios por defecto si no existe una activa.
INSERT INTO
  pricing_config (
    id,
    base_hourly_rate,
    minimum_hours,
    maximum_hours,
    platform_commission,
    service_fee,
    tax_rate,
    currency,
    is_active
  )
SELECT
  gen_random_uuid (),
  600.00,
  1.00,
  12.00,
  0.1500,
  10.00,
  0.1000,
  'DOP',
  TRUE
WHERE
  NOT EXISTS (
    SELECT
      1
    FROM
      pricing_config
    WHERE
      is_active = TRUE
  );

  select * from pricing_config;

-- Datos por defecto para tarifas de músicos 
-- Inserta tarifas por hora para diferentes categorías de músicos.
INSERT INTO
  musician_tariffs (category, hourly_rate)
VALUES
  ('Soloist', 50.00),
  ('Duo', 80.00),
  ('Trio', 120.00),
  ('Quartet', 180.00),
  ('Band', 250.00) ON CONFLICT (category) DO NOTHING;
  select * from musician_tariffs;

-- Datos de prueba para usuarios (clientes y músicos) 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Inserta usuarios de ejemplo con roles de cliente y músico.
INSERT INTO
  users (
    user_id,
    name,
    email,
    phone,
    role,
    created_at,
    updated_at
  )
VALUES
  (
    gen_random_uuid (),
    'Jefry Client',
    'cliente@example.com',
    '809-111-2222',
    'client',
    NOW (),
    NOW ()
  ),
  (
    gen_random_uuid (),
    'Jefry Musician',
    'musico@example.com',
    '809-333-4444',
    'musician',
    NOW (),
    NOW ()
  );
  select * from users;

-- Insertar contraseñas en la tabla user_passwords
INSERT INTO user_passwords (user_id, password)
VALUES
  ((SELECT user_id FROM users WHERE email = 'cliente@example.com'), 'P0pok@tepel00'),
  ((SELECT user_id FROM users WHERE email = 'musico@example.com'), 'P0pok@tepel00');
   select * from user_passwords;


-- Datos de prueba para tipos de eventos 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Inserta tipos de eventos de ejemplo con sus descripciones y factores de precio.
INSERT INTO
  event_types (
    id,
    name,
    price_factor
  )
VALUES
  (
    gen_random_uuid (),
    'Boda',
    1.50
  ),
  (
    gen_random_uuid (),
    'Concierto',
    1.20
  ),
  (
    gen_random_uuid (),
    'Fiesta Privada',
    1.00
  );
  select * from event_types;


-- Datos de prueba para solicitudes 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Inserta una solicitud de ejemplo con detalles del evento y el cliente.
INSERT INTO
  request (
    id,
    client_id,
    event_type_id,
    event_date,
    start_time,
    end_time,
    title,
    description,
    location,
    is_public,
    created_at,
    updated_at,
    musician_id
  )
VALUES
  (
    gen_random_uuid (),
    (SELECT user_id FROM users WHERE email = 'cliente@example.com'),
    (SELECT id FROM event_types WHERE name = 'Boda'),
    '2024-12-25',
    '19:00:00',
    '22:00:00',
    'Música para Boda Navideña',
    'Necesitamos un grupo para tocar en nuestra boda de Navidad.',
    '"Salón de Eventos Central"'::json,
    TRUE,
    NOW (),
    NOW (),
    NULL
  ),
  (
    gen_random_uuid (),
    (SELECT user_id FROM users WHERE email = 'cliente@example.com'),
    (SELECT id FROM event_types WHERE name = 'Concierto'),
    '2024-12-25',
    '19:00:00',
    '22:00:00',
    'Pampaña evangelistica al aire libre',
    'Necesitamos un grupo para tocar en nuestra pampaña evangelistica al aire libre.',
    '"Salón de Eventos Central"'::json,
    TRUE,
    NOW (),
    NOW (),
    NULL
  ),
  (
    gen_random_uuid (),
    (SELECT user_id FROM users WHERE email = 'cliente@example.com'),
    (SELECT id FROM event_types WHERE name = 'Retiro nominical'),
    '2024-12-25',
    '19:00:00',
    '22:00:00',
    'Retiro nominical',
    'Necesitamos un grupo para tocar en nuestro retiro nominical.',
    '"Salón de Eventos Central"'::json,
    TRUE,
    NOW (),
    NOW (),
    NULL
  ),
  (
    gen_random_uuid (),
    (SELECT user_id FROM users WHERE email = 'cliente@example.com'),
    (SELECT id FROM event_types WHERE name = 'Comgreso de damas'),
    '2024-12-25',
    '19:00:00',
    '22:00:00',
    'Comgreso de damas',
    'Necesitamos un grupo para tocar en nuestro comgreso de damas.',
    '"Salón de Eventos Central"'::json,
    TRUE,
    NOW (),
    NOW (),
    NULL
  );
  update request set musician_id = (SELECT user_id FROM users WHERE email = 'musico@example.com'), distance_km = '10.5', price = '5545', location = CASE WHEN jsonb_typeof(location) = 'object' THEN jsonb_set(location, '{distance_km}', '10.5'::jsonb) ELSE jsonb_build_object('distance_km', '10.5'::jsonb) END where title = 'Música para Boda Navideña';
  update request set musician_id = (SELECT user_id FROM users WHERE email = 'musico@example.com'), distance_km = '13.8', price = '2150', location = CASE WHEN jsonb_typeof(location) = 'object' THEN jsonb_set(location, '{price}', '2150'::jsonb) ELSE jsonb_build_object('price', '2150'::jsonb) END where title = 'Música para Boda Navideña';

  
select * from request;

select 
  price as Precio,
  distance_km as Distancia 
    from request;

-- Datos de prueba para instrumentos de solicitud 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Asocia instrumentos específicos a la solicitud de ejemplo.
INSERT INTO
  request_instruments (request_id, instrument_id)
VALUES
  (
    (SELECT id FROM request WHERE title = 'Música para Boda Navideña'),
    (SELECT id FROM instruments WHERE name = 'Guitarra Acústica')
  ),
  (
    (SELECT id FROM request WHERE title = 'Pampaña evangelistica al aire libre'),
    (SELECT id FROM instruments WHERE name = 'Batería')
  ),
  (
    (SELECT id FROM request WHERE title = 'Retiro nominical'),
    (SELECT id FROM instruments WHERE name = 'Piano')
  ),
  (
    (SELECT id FROM request WHERE title = 'Comgreso de damas'),
    (SELECT id FROM instruments WHERE name = 'Saxofón')
  );
  select * from request_instruments;

-- Datos de prueba para notificaciones 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
-- Inserta una notificación de ejemplo para el cliente.
INSERT INTO
  notifications (
    id,
    user_id,
    type,
    title,
    message,
    is_read,
    created_at
  )
VALUES
  (
    gen_random_uuid (),
    (SELECT user_id FROM users WHERE email = 'cliente@example.com'),
    'SYSTEM',
    'Nueva Solicitud Creada',
    'Se ha creado una nueva solicitud: Música para Boda Navideña',
    FALSE,
    NOW ()
  );
   select * from notifications;

select
  *
from
  request_overview;

select
  *
from
  pricing_config;

select
  *
from
  instruments;