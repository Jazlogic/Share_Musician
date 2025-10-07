-- ==============================
-- ENUMS
-- ==============================
CREATE TYPE request_status AS ENUM (
  'CREATED',
  'WAITING_OFFERS',
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED_BY_CLIENT',
  'CANCELED_BY_MUSICIAN',
  'REOPENED',
  'REJECTED',
  'EXPIRED',
  'IN_DISPUTE',
  'ARCHIVED'
);

CREATE TYPE offer_status AS ENUM (
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN'
);

CREATE TYPE user_type AS ENUM (
  'leader',
  'musician',
  'admin'
);

CREATE TYPE event_type AS ENUM (
  'Español' | 'English',
  'Culto Nocturno' | 'Night Cult',
  'Culto Diurno' | 'Day Cult',
  'Retiro' | 'Retreat',
  'Congreso' | 'Congress',
  'Campaña' | 'Campaign',
  'Concierto' | 'Concert',
  'Boda' | 'Wedding',
  'Funeral' | 'Funeral'
);

-- ==============================
-- TABLA PRINCIPAL: SOLICITUD
-- ==============================
CREATE TABLE request (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  musician_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  location JSONB,
  event_date TIMESTAMP,
  start_time TIME,
  end_time TIME,
  event_duration INTERVAL,
  price NUMERIC(12,2),
  tip NUMERIC(12,2),
  status request_status NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID,
  expiration_date TIMESTAMP,
  cancellation_reason TEXT,
  client_rating INT CHECK (client_rating BETWEEN 1 AND 5),
  musician_rating INT CHECK (musician_rating BETWEEN 1 AND 5),
  client_comment TEXT,
  musician_comment TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  reopened_from_id UUID,
  CONSTRAINT fk_request_client FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_request_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_request_reopened FOREIGN KEY (reopened_from_id) REFERENCES request(id) ON DELETE SET NULL
);

-- ==============================
-- TABLA DE OFERTAS
-- ==============================
CREATE TABLE offer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  musician_id UUID NOT NULL,
  message TEXT,
  price NUMERIC(12,2),
  status offer_status NOT NULL DEFAULT 'SENT',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID,
  CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- TABLA DE HISTORIAL DE ESTADOS
-- ==============================
CREATE TABLE request_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  old_status request_status,
  new_status request_status NOT NULL,
  user_id UUID,
  updated_by UUID,
  user_type user_type,
  change_date TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE
);

-- ==============================
-- MÉTRICAS DE CLIENTES Y MÚSICOS
-- ==============================
CREATE TABLE musician_metrics (
  musician_id UUID PRIMARY KEY,
  total_canceled_by_musician INT DEFAULT 0,
  total_completed INT DEFAULT 0,
  total_rejected INT DEFAULT 0,
  total_in_dispute INT DEFAULT 0,
  total_archived INT DEFAULT 0,
  updated_by UUID,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_musician_metrics FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE client_metrics (
  client_id UUID PRIMARY KEY,
  total_canceled_by_client INT DEFAULT 0,
  total_completed INT DEFAULT 0,
  total_rejected INT DEFAULT 0,
  total_expired INT DEFAULT 0,
  total_in_dispute INT DEFAULT 0,
  total_archived INT DEFAULT 0,
  updated_by UUID,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client_metrics FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ==============================
-- ÍNDICES
-- ==============================
CREATE INDEX idx_request_client_id ON request (client_id);
CREATE INDEX idx_request_musician_id ON request (musician_id);
CREATE INDEX idx_request_status ON request (status);
CREATE INDEX idx_request_creation_date ON request (created_at);
CREATE INDEX idx_request_event_date ON request (event_date);

CREATE INDEX idx_offer_request_id ON offer (request_id);
CREATE INDEX idx_offer_musician_id ON offer (musician_id);
CREATE INDEX idx_offer_status ON offer (status);

CREATE INDEX idx_request_history_request_id ON request_history (request_id);
CREATE INDEX idx_request_history_user_id ON request_history (user_id);
CREATE INDEX idx_request_history_change_date ON request_history (change_date);

-- ==============================
-- TRIGGER DE ACTUALIZACIÓN DE FECHA
-- ==============================
CREATE OR REPLACE FUNCTION update_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_request_timestamp
BEFORE UPDATE ON request
FOR EACH ROW
EXECUTE FUNCTION update_request_timestamp();
