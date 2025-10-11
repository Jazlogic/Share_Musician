-- ==============================
-- VISTAS MATERIALIZADAS
-- ==============================

-- Vista Materializada para un resumen de solicitudes
-- Combina información de solicitudes, líderes y tipos de evento para un acceso rápido.
-- Esta vista incluye los siguientes campos:
--   - request_id: ID único de la solicitud.
--   - client_id: ID del cliente que realizó la solicitud.
--   - leader_name: Nombre del líder asociado a la solicitud.
--   - leader_email: Correo electrónico del líder asociado a la solicitud.
--   - event_type_name: Nombre del tipo de evento.
--   - event_date: Fecha del evento.
--   - start_time: Hora de inicio del evento.
--   - end_time: Hora de finalización del evento.
--   - duration: Duración del evento.
--   - location: Ubicación del evento.
--   - total_price: Precio total de la solicitud.
--   - status: Estado actual de la solicitud.
--   - created_at: Marca de tiempo de creación de la solicitud.
--   - updated_at: Marca de tiempo de la última actualización de la solicitud.
CREATE MATERIALIZED VIEW IF NOT EXISTS request_overview AS
SELECT
    r.id AS request_id,
    r.client_id,
    u.name AS leader_name,
    u.email AS leader_email,
    et.name AS event_type_name,
    r.event_date,
    r.start_time,
    r.end_time,
    r.duration,
    r.location,
    r.total_price,
    r.status,
    r.created_at,
    r.updated_at
FROM
    request r
JOIN
    users u ON r.client_id = u.user_id
JOIN
    event_types et ON r.event_type_id = et.id;

COMMENT ON MATERIALIZED VIEW request_overview IS 'Vista materializada que proporciona un resumen rápido de las solicitudes, incluyendo información del líder y tipo de evento.';

-- Opcional: Crear un índice en la vista materializada para búsquedas más rápidas
-- Índice para búsquedas rápidas por request_id
CREATE INDEX IF NOT EXISTS idx_request_overview_request_id ON request_overview(request_id);
-- Índice para búsquedas rápidas por client_id
CREATE INDEX IF NOT EXISTS idx_request_overview_client_id ON request_overview(client_id);
-- Índice para búsquedas rápidas por event_date
CREATE INDEX IF NOT EXISTS idx_request_overview_event_date ON request_overview(event_date);