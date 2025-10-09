-- Mussikon Database Schema (v2)
-- PostgreSQL / Supabase ready SQL file
-- Includes: roles, users, instruments, requests, offers, notifications,
-- availability, pricing/finance, balances, transactions, history, RLS policies,
-- triggers and helper functions.

/*
  NOTAS IMPORTANTES:
  - Este script usa gen_random_uuid() (pgcrypto). Asegúrate de que la extensión esté habilitada.
  - Está pensado para ejecutarse en Supabase (Postgres >= 13).
  - Contiene comentarios explicativos sobre propósito de tablas y columnas.
*/

-- ==============================
-- EXTENSIONS
-- ==============================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

-- ==============================
-- ENUM TYPES
-- ==============================
CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');

CREATE TYPE request_status AS ENUM (
  'CREATED',
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED_BY_CLIENT',
  'CANCELLED_BY_MUSICIAN',
  'REOPENED',
  'EXPIRED',
  'ARCHIVED'
);

CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');

CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- ==============================
-- CORE: USERS
-- ==============================
-- Tabla única para clientes, músicos, líderes y admins.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'client', -- client | musician | leader | admin
  active_role user_role DEFAULT 'musician', -- si el usuario puede alternar roles (ej: musician/leader)
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'active', 'pending', 'rejected'
  church_name VARCHAR(255),
  location JSONB, -- ubicación flexible (ciudad, dirección, lat/lng)
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Usuarios: clientes, músicos, líderes y admins.';

-- Indexes útiles
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ==============================
-- USER PASSWORDS (separado por seguridad)
-- ==============================
CREATE TABLE IF NOT EXISTS user_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_passwords IS 'Hasheos de contraseña (almacenado separado por seguridad).';

-- ==============================
-- INSTRUMENTS (catalog)
-- ==============================
CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- Ej: Guitarra, Piano, Voz
  category VARCHAR(50), -- Ej: cuerda, viento, percusión, tecla, voz
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- MUSICIAN TARIFFS (tarifas base por tipo de músico)
-- ==============================
CREATE TABLE IF NOT EXISTS musician_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL UNIQUE,
    hourly_rate NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- USER INSTRUMENTS (many-to-many with extra info)
-- ==============================
CREATE TABLE IF NOT EXISTS user_instruments (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  primary_instrument BOOLEAN DEFAULT FALSE,
  level VARCHAR(50), -- Principiante / Intermedio / Profesional
  years_experience INT DEFAULT 0 CHECK (years_experience >= 0 AND years_experience <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, instrument_id)
);

CREATE INDEX IF NOT EXISTS idx_user_instruments_user_id ON user_instruments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_instruments_instrument_id ON user_instruments(instrument_id);

-- ==============================
-- REQUESTS (solicitudes musicales)
-- ==============================
-- Este sistema elimina price_min y price_max, ya que ahora el cálculo es automático.
-- musician_tariffs define tarifas base por categoría de músico.
-- Los factores permiten ajustes según experiencia e instrumento.
-- system_fee es la comisión de la plataforma.
-- total_price es lo que verá el cliente como coste final del servicio.
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- quien crea la solicitud (puede ser role 'leader' o 'client')
  event_type VARCHAR(100) NOT NULL, -- Ej: boda, culto, concierto, ensayo
  event_date TIMESTAMP WITH TIME ZONE NOT NULL, -- fecha y hora del evento
  start_time TIME, -- hora de inicio (opcional si event_date ya incluye la hora)
  end_time TIME,
  duration INTERVAL, -- duración estimada
  location JSONB NOT NULL, -- { city, address, lat, lng }
  base_rate NUMERIC(12,2),
  duration_hours NUMERIC(6,2),
  distance_km NUMERIC(8,2),
  experience_factor NUMERIC(4,2) DEFAULT 1,
  instrument_factor NUMERIC(4,2) DEFAULT 1,
  system_fee NUMERIC(12,2),
  total_price NUMERIC(12,2),
  extra_amount NUMERIC(10,2) DEFAULT 0 CHECK (extra_amount >= 0), -- monto adicional sugerido
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  status request_status NOT NULL DEFAULT 'CREATED',
  cancelled_by VARCHAR(20), -- 'leader' | 'musician' | 'system' (para trazabilidad)
  cancellation_reason TEXT,
  reopened_from_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE requests IS 'Solicitudes musicales creadas por líderes/clientes. Puede vincular varios instrumentos mediante request_instruments.';

CREATE INDEX IF NOT EXISTS idx_requests_leader_id ON requests(leader_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_event_date ON requests(event_date);

-- ==============================
-- REQUEST_INSTRUMENTS (N:N: qué instrumentos necesita una solicitud)
-- ==============================
CREATE TABLE IF NOT EXISTS request_instruments (
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  instrument_id UUID NOT NULL REFERENCES instruments(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1 CHECK (quantity >= 1),
  notes TEXT, -- Ej: "necesitamos 2 guitarras, una eléctrica y una acústica"
  PRIMARY KEY (request_id, instrument_id)
);

-- ==============================
-- OFFERS (propuestas de músicos)
-- ==============================
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  proposed_price NUMERIC(12,2) NOT NULL CHECK (proposed_price >= 0),
  availability_confirmed BOOLEAN DEFAULT FALSE,
  status offer_status NOT NULL DEFAULT 'SENT',
  selected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_request_id ON offers(request_id);
CREATE INDEX IF NOT EXISTS idx_offers_musician_id ON offers(musician_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

COMMENT ON TABLE offers IS 'Ofertas enviadas por músicos para cubrir una solicitud.';

-- ==============================
-- REQUEST STATUS HISTORY (trazabilidad de cambios)
-- ==============================
CREATE TABLE IF NOT EXISTS request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  old_status request_status,
  new_status request_status NOT NULL,
  changed_by UUID, -- quien hizo el cambio (user id o system)
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- NOTIFICATIONS
-- ==============================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ==============================
-- MUSICIAN AVAILABILITY
-- ==============================
CREATE TABLE IF NOT EXISTS musician_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  reason VARCHAR(100), -- 'event', 'travel_buffer', 'unavailable'
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_musician_availability_musician_date ON musician_availability(musician_id, event_date);

-- ==============================
-- PRICING CONFIG (configuración para cálculo de tarifas)
-- ==============================
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_hourly_rate NUMERIC(12,2) NOT NULL DEFAULT 500.00,
  minimum_hours NUMERIC(4,2) NOT NULL DEFAULT 2.00,
  maximum_hours NUMERIC(4,2) NOT NULL DEFAULT 12.00,
  platform_commission NUMERIC(5,4) NOT NULL DEFAULT 0.1500, -- 15%
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 100.00,
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1800, -- 18%
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);

-- ==============================
-- FINANCIALS: BALANCES Y TRANSACTIONS
-- ==============================
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_earnings NUMERIC(14,2) DEFAULT 0.00,
  pending_earnings NUMERIC(14,2) DEFAULT 0.00,
  available_balance NUMERIC(14,2) DEFAULT 0.00,
  total_withdrawn NUMERIC(14,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT,
  status transaction_status NOT NULL DEFAULT 'pending',
  provider VARCHAR(50), -- Stripe, MercadoPago, etc.
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_type ON user_transactions(type);
CREATE INDEX IF NOT EXISTS idx_user_transactions_status ON user_transactions(status);

-- ==============================
-- ADMIN ACTIONS (auditoría de decisiones admin)
-- ==============================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- HELPERS: triggers, functions
-- ==============================
-- Trigger helper to set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to common tables
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_musician_availability_updated_at BEFORE UPDATE ON musician_availability FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pricing_config_updated_at BEFORE UPDATE ON pricing_config FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_balances_updated_at BEFORE UPDATE ON user_balances FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_user_transactions_updated_at BEFORE UPDATE ON user_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Function for automatic price calculation
CREATE OR REPLACE FUNCTION calculate_request_price()
RETURNS TRIGGER AS $$
DECLARE
  base NUMERIC(12,2);
  hours NUMERIC(6,2);
  distance NUMERIC(8,2);
  exp_factor NUMERIC(4,2) := 1;
  instr_factor NUMERIC(4,2) := 1;
  fee NUMERIC(12,2);
  total NUMERIC(12,2);
BEGIN
  -- Get base rate
  SELECT hourly_rate INTO base
  FROM musician_tariffs
  WHERE category = NEW.event_type -- Assuming event_type maps to musician_tariffs.category
  LIMIT 1;

  -- Calculate duration
  hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

  -- Optional distance
  distance := COALESCE((NEW.location->>'distance_km')::NUMERIC, 0);

  -- Apply additional factors (these would need to be determined dynamically)
  -- For now, using default factors
  total := (base * hours * exp_factor * instr_factor);

  -- Calculate system fee (10% for example)
  fee := total * 0.10;

  NEW.base_rate := base;
  NEW.duration_hours := hours;
  NEW.distance_km := distance;
  NEW.experience_factor := exp_factor;
  NEW.instrument_factor := instr_factor;
  NEW.system_fee := fee;
  NEW.total_price := total + fee;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic calculation on insert or update of requests
CREATE TRIGGER trg_calculate_request_price
BEFORE INSERT OR UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION calculate_request_price();

-- Function to calculate event price (returns a single row)
CREATE OR REPLACE FUNCTION calculate_event_price(
  p_start_time TIME,
  p_end_time TIME,
  p_custom_rate NUMERIC DEFAULT NULL
) RETURNS TABLE (
  hourly_rate NUMERIC(12,2),
  hours NUMERIC(6,2),
  subtotal NUMERIC(12,2),
  commission NUMERIC(12,2),
  service_fee NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  musician_earnings NUMERIC(12,2)
) AS $$
DECLARE
  cfg pricing_config%ROWTYPE;
  rate NUMERIC(12,2);
  ev_hours NUMERIC(6,2);
  sub NUMERIC(12,2);
BEGIN
  SELECT * INTO cfg FROM pricing_config WHERE is_active = TRUE LIMIT 1;
  IF cfg IS NULL THEN
    RAISE EXCEPTION 'No active pricing configuration found';
  END IF;

  rate := COALESCE(p_custom_rate, cfg.base_hourly_rate);
  ev_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600.0;
  IF ev_hours <= 0 THEN ev_hours := cfg.minimum_hours; END IF;

  sub := ROUND(ev_hours * rate, 2);
  commission := ROUND(sub * cfg.platform_commission, 2);
  service_fee := cfg.service_fee;
  total := ROUND(sub + commission + service_fee, 2);
  tax := ROUND(total * cfg.tax_rate, 2);
  total := total + tax;
  musician_earnings := ROUND(sub - commission, 2);

  RETURN QUERY SELECT rate, ev_hours, sub, commission, service_fee, tax, total, musician_earnings;
END;
$$ LANGUAGE plpgsql;

-- Function to update user balances when transactions inserted/updated
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update on INSERT or when status becomes completed
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, total_withdrawn, currency)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      NEW.currency
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_earnings = user_balances.total_earnings + CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      pending_earnings = user_balances.pending_earnings + CASE WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      available_balance = user_balances.available_balance + CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      total_withdrawn = user_balances.total_withdrawn + CASE WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_transactions_after_insert_update
AFTER INSERT OR UPDATE ON user_transactions
FOR EACH ROW
EXECUTE FUNCTION update_user_balance();

-- ==============================
-- AUTOMATIC NOTIFICATIONS
-- ==============================
-- Helper to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR,
  p_message TEXT,
  p_type VARCHAR DEFAULT 'info',
  p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  n_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, data) VALUES (p_user_id, p_title, p_message, p_type, p_data) RETURNING id INTO n_id;
  RETURN n_id;
END;
$$ LANGUAGE plpgsql;

-- Notify musicians of new request (trigger)
CREATE OR REPLACE FUNCTION notify_musicians_new_request()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN SELECT id FROM users WHERE role = 'musician' AND status = 'active' LOOP
    PERFORM create_notification(rec.id, 'Nueva solicitud', 'Se ha creado una nueva solicitud: '||NEW.event_type, 'new_request', jsonb_build_object('request_id', NEW.id));
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_musicians_new_request AFTER INSERT ON requests FOR EACH ROW EXECUTE FUNCTION notify_musicians_new_request();

-- Notify leader when a new offer is created
CREATE OR REPLACE FUNCTION notify_leader_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  leader_uuid UUID;
BEGIN
  SELECT leader_id INTO leader_uuid FROM requests WHERE id = NEW.request_id;
  IF leader_uuid IS NOT NULL THEN
    PERFORM create_notification(leader_uuid, 'Nueva oferta', 'Has recibido una nueva oferta para tu solicitud', 'new_offer', jsonb_build_object('offer_id', NEW.id, 'request_id', NEW.request_id, 'musician_id', NEW.musician_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_leader_new_offer AFTER INSERT ON offers FOR EACH ROW EXECUTE FUNCTION notify_leader_new_offer();

-- Notify musician when offer selected
CREATE OR REPLACE FUNCTION notify_musician_offer_selected()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'SELECTED' AND OLD.status IS DISTINCT FROM 'SELECTED') OR (TG_OP = 'UPDATE' AND NEW.status = 'ACCEPTED' AND OLD.status IS DISTINCT FROM 'ACCEPTED') THEN
    PERFORM create_notification(NEW.musician_id, 'Oferta seleccionada', 'Tu oferta ha sido seleccionada', 'offer_selected', jsonb_build_object('offer_id', NEW.id, 'request_id', NEW.request_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_musician_offer_selected AFTER UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION notify_musician_offer_selected();

-- ==============================
-- ROW LEVEL SECURITY (RLS) + POLICIES
-- ==============================
-- Enable RLS for critical tables (Supabase best practice)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Policies: users
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Anyone can register" ON users FOR INSERT WITH CHECK (true);

-- Policies: user_passwords (users can read own password row)
CREATE POLICY "Users can read own password" ON user_passwords FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own password" ON user_passwords FOR INSERT, UPDATE, DELETE USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- Policies: user_instruments
CREATE POLICY "Users can manage own instruments" ON user_instruments FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Public can read user instruments" ON user_instruments FOR SELECT USING (true);

-- Policies: requests
CREATE POLICY "Public can read public requests" ON requests FOR SELECT USING (status = 'CREATED' OR status = 'OFFER_RECEIVED');
CREATE POLICY "Leaders can manage own requests" ON requests FOR ALL USING (auth.uid()::text = leader_id::text);

-- Policies: offers
CREATE POLICY "Public can read offers for active requests" ON offers FOR SELECT USING (true);
CREATE POLICY "Musicians can create offers" ON offers FOR INSERT WITH CHECK (auth.role() = 'musician');
CREATE POLICY "Musicians can update own offers" ON offers FOR UPDATE USING (auth.uid()::text = musician_id::text);
CREATE POLICY "Leaders can update offers for their requests" ON offers FOR UPDATE USING (EXISTS(SELECT 1 FROM requests WHERE requests.id = offers.request_id AND requests.leader_id::text = auth.uid()::text));

-- Policies: notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Policies: musician_availability
CREATE POLICY "Musicians can manage their own availability" ON musician_availability FOR ALL USING (auth.uid()::text = musician_id::text);
CREATE POLICY "Admins can manage all availability" ON musician_availability FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));

-- Policies: user_balances and user_transactions
CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all balances" ON user_balances FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));
CREATE POLICY "Users can view own transactions" ON user_transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can manage transactions" ON user_transactions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));

-- Policies: admin_actions
CREATE POLICY "Admins can manage admin actions" ON admin_actions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));

-- ==============================
-- DEFAULT DATA (seed minimal)
-- ==============================
-- Seed instruments (examples)
INSERT INTO instruments (id, name, category) VALUES
  (gen_random_uuid(), 'Guitarra', 'cuerda') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Piano', 'tecla') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Bateria', 'percusion') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Voz', 'voz') ON CONFLICT DO NOTHING;

-- Seed pricing config if none exists
INSERT INTO pricing_config (id, base_hourly_rate, minimum_hours, maximum_hours, platform_commission, service_fee, tax_rate, currency, is_active)
SELECT gen_random_uuid(), 500.00, 2.00, 12.00, 0.1500, 100.00, 0.1800, 'DOP', TRUE
WHERE NOT EXISTS (SELECT 1 FROM pricing_config WHERE is_active = TRUE);

-- Default data for musician_tariffs
INSERT INTO musician_tariffs (category, hourly_rate) VALUES
    ('Soloist', 500.00),
    ('Duo', 800.00),
    ('Trio', 1200.00),
    ('Quartet', 1800.00),
    ('Band', 2500.00)
ON CONFLICT (category) DO NOTHING;

-- ==============================
-- COMMENTS / DOCUMENTATION
-- ==============================
COMMENT ON TABLE instruments IS 'Catálogo oficial de instrumentos. Evita nombres duplicados y facilita filtros.';
COMMENT ON TABLE request_instruments IS 'Relación N:N entre requests e instrumentos requeridos.';
COMMENT ON TABLE offers IS 'Propuestas de los músicos para una solicitud.';
COMMENT ON TABLE user_balances IS 'Saldo del usuario: earnings/pending/available.';
COMMENT ON TABLE user_transactions IS 'Movimientos financieros relacionados a requests/ofers.';

-- ==============================
-- RECOMMENDATIONS (not executed):
-- 1) Considera usar job queue (pg_cron o external worker) para envío masivo de notificaciones.
-- 2) Para auditoría extra, guarda IP y user agent en request_status_history cuando cambie.
-- 3) Protege user_passwords: en Supabase usa auth providers y no almacenar hash si no es necesario.

-- End of schema v2
