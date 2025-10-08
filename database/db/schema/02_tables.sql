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
  avatar_url VARCHAR(255),
  home_latitude DECIMAL(9,6),
  home_longitude DECIMAL(9,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN pricing_config.id IS 'Identificador único de la configuración de precios.';
COMMENT ON COLUMN pricing_config.base_hourly_rate IS 'Tarifa base por hora para los servicios musicales.';
COMMENT ON COLUMN pricing_config.minimum_hours IS 'Número mínimo de horas para un servicio.';
COMMENT ON COLUMN pricing_config.maximum_hours IS 'Número máximo de horas para un servicio.';
COMMENT ON COLUMN pricing_config.platform_commission IS 'Porcentaje de comisión que la plataforma retiene por cada servicio.';
COMMENT ON COLUMN pricing_config.service_fee IS 'Tarifa fija por servicio que cobra la plataforma.';
COMMENT ON COLUMN pricing_config.tax_rate IS 'Tasa de impuesto aplicada a los servicios.';
COMMENT ON COLUMN pricing_config.currency IS 'Moneda utilizada para los precios (ej. ''DOP'').';
COMMENT ON COLUMN pricing_config.is_active IS 'Indica si esta configuración de precios está activa.';
COMMENT ON COLUMN pricing_config.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN pricing_config.updated_at IS 'Marca de tiempo de la última actualización del registro.';

COMMENT ON TABLE users IS 'Usuarios: clientes, músicos, líderes y admins.';

-- ==============================
-- USER PASSWORDS (separado por seguridad)
-- ==============================
CREATE TABLE IF NOT EXISTS user_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
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
  user_id UUID NOT NULL,
  instrument_id UUID NOT NULL,
  primary_instrument BOOLEAN DEFAULT FALSE,
  level VARCHAR(50), -- Principiante / Intermedio / Profesional
  years_experience INT DEFAULT 0 CHECK (years_experience >= 0 AND years_experience <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, instrument_id)
);

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
  leader_id UUID NOT NULL,
  event_type_id UUID NOT NULL,
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
  reopened_from_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE requests IS 'Solicitudes musicales creadas por líderes/clientes. Puede vincular varios instrumentos mediante request_instruments.';

-- ==============================
-- REQUEST_INSTRUMENTS (N:N: qué instrumentos necesita una solicitud)
-- ==============================
CREATE TABLE IF NOT EXISTS request_instruments (
  request_id UUID NOT NULL,
  instrument_id UUID NOT NULL,
  quantity INT DEFAULT 1 CHECK (quantity >= 1),
  notes TEXT, -- Ej: "necesitamos 2 guitarras, una eléctrica y una acústica"
  PRIMARY KEY (request_id, instrument_id)
);

-- ==============================
-- OFFERS (propuestas de músicos)
-- ==============================
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  musician_id UUID NOT NULL,
  message TEXT,
  proposed_price NUMERIC(12,2) NOT NULL CHECK (proposed_price >= 0),
  availability_confirmed BOOLEAN DEFAULT FALSE,
  status offer_status NOT NULL DEFAULT 'SENT',
  selected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE offers IS 'Ofertas enviadas por músicos para cubrir una solicitud.';

-- ==============================
-- REQUEST STATUS HISTORY (trazabilidad de cambios)
-- ==============================
CREATE TABLE IF NOT EXISTS request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
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
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- MUSICIAN AVAILABILITY
-- ==============================
CREATE TABLE IF NOT EXISTS musician_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  reason VARCHAR(100), -- 'event', 'travel_buffer', 'unavailable'
  request_id UUID,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- ==============================
-- FINANCIALS: BALANCES Y TRANSACTIONS
-- ==============================
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  total_earnings NUMERIC(14,2) DEFAULT 0.00,
  pending_earnings NUMERIC(14,2) DEFAULT 0.00,
  available_balance NUMERIC(14,2) DEFAULT 0.00,
  total_withdrawn NUMERIC(14,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id UUID,
  offer_id UUID,
  type transaction_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  description TEXT,
  status transaction_status NOT NULL DEFAULT 'pending',
  provider VARCHAR(50), -- Stripe, MercadoPago, etc.
  currency VARCHAR(3) DEFAULT 'DOP',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- ADMIN ACTIONS (auditoría de decisiones admin)
-- ==============================
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);