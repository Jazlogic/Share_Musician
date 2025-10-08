-- ==============================
-- EVENT TYPES (catalog)
-- ==============================
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- Ej: boda, culto, concierto, ensayo
);

COMMENT ON TABLE event_types IS 'Tipos de eventos disponibles para solicitudes musicales.';