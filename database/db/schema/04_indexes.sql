-- Índice para búsquedas rápidas por correo electrónico de usuario
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- Índice para búsquedas rápidas por rol de usuario
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- Índice para búsquedas rápidas por estado de usuario
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Índice para búsquedas rápidas de instrumentos por ID de usuario
CREATE INDEX IF NOT EXISTS idx_user_instruments_user_id ON user_instruments(user_id);
-- Índice para búsquedas rápidas de instrumentos por ID de instrumento
CREATE INDEX IF NOT EXISTS idx_user_instruments_instrument_id ON user_instruments(instrument_id);

-- Índice para búsquedas rápidas de solicitudes por ID de líder
CREATE INDEX IF NOT EXISTS idx_requests_leader_id ON requests(leader_id);
-- Índice para búsquedas rápidas de solicitudes por estado
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
-- Índice para búsquedas rápidas de solicitudes por fecha de evento
CREATE INDEX IF NOT EXISTS idx_requests_event_date ON requests(event_date);

-- Índice para búsquedas rápidas de ofertas por ID de solicitud
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
-- Índice para búsquedas rápidas de ofertas por ID de músico
CREATE INDEX IF NOT EXISTS idx_offers_musician_id ON offers(musician_id);
-- Índice para búsquedas rápidas de ofertas por estado
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- Índice para búsquedas rápidas de notificaciones por ID de usuario
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
-- Índice para búsquedas rápidas de notificaciones por estado de lectura
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Índice para búsquedas rápidas de disponibilidad de músicos por ID de músico y fecha de evento
CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date ON musician_availability(musician_id, event_date);

-- Índice para búsquedas rápidas de configuración de precios por estado activo
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);

-- Índice para búsquedas rápidas de saldos de usuario por ID de usuario
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

-- Índice para búsquedas rápidas de transacciones de usuario por ID de usuario
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
-- Índice para búsquedas rápidas de transacciones de usuario por tipo
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
-- Índice para búsquedas rápidas de transacciones de usuario por estado
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);

-- Índices para optimizar consultas de ubicación en la tabla 'users'
CREATE INDEX IF NOT EXISTS idx_users_latitude_longitude ON users(latitude, longitude);

-- Índices para optimizar consultas de ubicación en la tabla 'requests'
CREATE INDEX IF NOT EXISTS idx_requests_latitude_longitude ON requests(latitude, longitude);
-- Índice compuesto para búsquedas frecuentes de solicitudes por líder, estado y fecha
CREATE INDEX IF NOT EXISTS idx_requests_leader_status_event_date ON requests(leader_id, status, event_date);

-- Índice compuesto para búsquedas frecuentes de ofertas por solicitud, músico y estado
CREATE INDEX IF NOT EXISTS idx_offers_request_musician_status ON offers(request_id, musician_id, status);

-- Índice compuesto para optimizar la búsqueda de disponibilidad de músicos por fecha y rango de tiempo
CREATE INDEX IF NOT EXISTS idx_musician_availability_full ON musician_availability(musician_id, event_date, start_time, end_time);

-- Índice compuesto para recuperar eficientemente notificaciones de un usuario y su estado de lectura
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Índice compuesto para filtrar transacciones de un usuario por tipo y estado
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_type_status ON user_transactions(user_id, type, status);