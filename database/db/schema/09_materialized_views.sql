-- ==============================
-- VISTAS MATERIALIZADAS
-- ==============================

-- Vista Materializada para un resumen de solicitudes
-- Combina información de solicitudes, líderes y tipos de evento para un acceso rápido.
CREATE MATERIALIZED VIEW request_overview AS
SELECT
    r.id AS request_id,
    r.leader_id,
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
    requests r
JOIN
    users u ON r.leader_id = u.id
JOIN
    event_types et ON r.event_type_id = et.id;

COMMENT ON MATERIALIZED VIEW request_overview IS 'Vista materializada que proporciona un resumen rápido de las solicitudes, incluyendo información del líder y tipo de evento.';

-- Opcional: Crear un índice en la vista materializada para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_request_overview_request_id ON request_overview(request_id);
CREATE INDEX IF NOT EXISTS idx_request_overview_leader_id ON request_overview(leader_id);
CREATE INDEX IF NOT EXISTS idx_request_overview_event_date ON request_overview(event_date);