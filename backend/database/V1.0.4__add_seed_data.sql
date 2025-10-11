-- ==============================
-- Migración: Añadir datos de prueba del esquema deploy.sql
-- ==============================

-- Datos de prueba para instrumentos (ejemplos) 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO instruments (id, name, category) VALUES 
  (gen_random_uuid(), 'Bajo', 'cuerda'),
  (gen_random_uuid(), 'Guitarra Eléctrica', 'cuerda'),
  (gen_random_uuid(), 'Guitarra Acústica', 'cuerda'),
  (gen_random_uuid(), 'Violín', 'cuerda'),
  (gen_random_uuid(), 'Violonchelo', 'cuerda'),
  (gen_random_uuid(), 'Contrabajo', 'cuerda'),
  (gen_random_uuid(), 'Piano', 'teclado'),
  (gen_random_uuid(), 'Batería', 'percusión'),
  (gen_random_uuid(), 'Vocalista', 'voces'),
  (gen_random_uuid(), 'Conga', 'percusión'),
  (gen_random_uuid(), 'Güira', 'percusión'),
  (gen_random_uuid(), 'Tambora', 'percusión'),
  (gen_random_uuid(), 'Timbal', 'percusión'),
  (gen_random_uuid(), 'Saxofón', 'viento'),
  (gen_random_uuid(), 'Flauta', 'viento'),
  (gen_random_uuid(), 'Trompeta', 'viento'),
  (gen_random_uuid(), 'Clarinet', 'viento'),
ON CONFLICT (name) DO NOTHING;

-- Configuración de precios de prueba si no existe
INSERT INTO pricing_config (id, base_hourly_rate, minimum_hours, maximum_hours, platform_commission, service_fee, tax_rate, currency, is_active)
SELECT gen_random_uuid(), 500.00, 2.00, 12.00, 0.1500, 100.00, 0.1800, 'DOP', TRUE
WHERE NOT EXISTS (SELECT 1 FROM pricing_config WHERE is_active = TRUE);

-- Datos por defecto para tarifas de músicos 
INSERT INTO musician_tariffs (category, hourly_rate) VALUES
    ('Soloist', 50.00),
    ('Duo', 80.00),
    ('Trio', 120.00),
    ('Quartet', 180.00),
    ('Band', 250.00)
ON CONFLICT (category) DO NOTHING;

-- Datos de prueba para usuarios (clientes y músicos) 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO users (user_id, username, email, password_hash, role, created_at, updated_at) VALUES
('client_uuid_1', 'cliente_ejemplo', 'cliente@example.com', 'hashed_password_client', 'client', NOW(), NOW()),
('musician_uuid_1', 'musico_ejemplo', 'musico@example.com', 'hashed_password_musician', 'musician', NOW(), NOW());

-- Datos de prueba para tipos de eventos 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO event_types (event_type_id, name, description, price_factor, created_at, updated_at) VALUES
('event_type_uuid_1', 'Boda', 'Música para bodas', 1.50, NOW(), NOW()),
('event_type_uuid_2', 'Concierto', 'Concierto en vivo', 1.20, NOW(), NOW()),
('event_type_uuid_3', 'Fiesta Privada', 'Música para fiestas privadas', 1.00, NOW(), NOW());


-- Datos de prueba para instrumentos 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO instruments (instrument_id, name, description, price_factor, created_at, updated_at) VALUES
('instrument_uuid_1', 'Guitarra', 'Instrumento de cuerda', 1.10, NOW(), NOW()),
('instrument_uuid_2', 'Batería', 'Instrumento de percusión', 1.30, NOW(), NOW()),
('instrument_uuid_3', 'Teclado', 'Instrumento de teclado', 1.05, NOW(), NOW());

-- Datos de prueba para solicitudes 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO requests (request_id, client_id, event_type_id, event_date, start_time, end_time, title, description, location, is_public, created_at, updated_at, musician_id) VALUES
('request_uuid_1', 'client_uuid_1', 'event_type_uuid_1', '2024-12-25', '19:00:00', '22:00:00', 'Música para Boda Navideña', 'Necesitamos un grupo para tocar en nuestra boda de Navidad.', 'Salón de Eventos Central', TRUE, NOW(), NOW(), NULL);


-- Datos de prueba para instrumentos de solicitud 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO request_instruments (request_id, instrument_id) VALUES
('request_uuid_1', 'instrument_uuid_1'),
('request_uuid_1', 'instrument_uuid_3');


-- Datos de prueba para notificaciones 2025-10-10  5:08 p.m. JASBOOTSTUDIOS
INSERT INTO notifications (notification_id, user_id, type, message, is_read, created_at) VALUES
('notification_uuid_1', 'client_uuid_1', 'request_created', 'Se ha creado una nueva solicitud: Música para Boda Navideña', FALSE, NOW());


select * from musician_tariffs;
select * from pricing_config;
select * from instruments;
