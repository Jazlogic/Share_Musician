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

COMMENT ON TABLE instruments IS 'Catálogo de instrumentos musicales disponibles en la plataforma.';
COMMENT ON COLUMN instruments.id IS 'Identificador único del instrumento.';
COMMENT ON COLUMN instruments.name IS 'Nombre del instrumento (ej. Guitarra, Piano, Voz).';
COMMENT ON COLUMN instruments.category IS 'Categoría a la que pertenece el instrumento (ej. cuerda, viento, percusión, tecla, voz).';
COMMENT ON COLUMN instruments.icon IS 'Icono representativo del instrumento.';
COMMENT ON COLUMN instruments.created_at IS 'Marca de tiempo de creación del registro.';

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

COMMENT ON TABLE musician_tariffs IS 'Tarifas base por categoría de músico.';
COMMENT ON COLUMN musician_tariffs.id IS 'Identificador único de la tarifa.';
COMMENT ON COLUMN musician_tariffs.category IS 'Categoría del músico (ej. Principiante, Intermedio, Profesional).';
COMMENT ON COLUMN musician_tariffs.hourly_rate IS 'Tarifa por hora para esta categoría de músico.';
COMMENT ON COLUMN musician_tariffs.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN musician_tariffs.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE user_instruments IS 'Asocia usuarios con los instrumentos que tocan, incluyendo detalles de habilidad.';
COMMENT ON COLUMN user_instruments.user_id IS 'ID del usuario.';
COMMENT ON COLUMN user_instruments.instrument_id IS 'ID del instrumento.';
COMMENT ON COLUMN user_instruments.primary_instrument IS 'Indica si es el instrumento principal del músico.';
COMMENT ON COLUMN user_instruments.level IS 'Nivel de habilidad del músico con este instrumento (ej. Principiante, Intermedio, Profesional).';
COMMENT ON COLUMN user_instruments.years_experience IS 'Años de experiencia del músico con este instrumento.';
COMMENT ON COLUMN user_instruments.created_at IS 'Marca de tiempo de creación del registro.';

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


COMMENT ON COLUMN requests.id IS 'Identificador único de la solicitud.';
COMMENT ON COLUMN requests.leader_id IS 'ID del líder que crea la solicitud.';
COMMENT ON COLUMN requests.event_type_id IS 'ID del tipo de evento.';
COMMENT ON COLUMN requests.event_date IS 'Fecha y hora del evento.';
COMMENT ON COLUMN requests.start_time IS 'Hora de inicio del evento.';
COMMENT ON COLUMN requests.end_time IS 'Hora de finalización del evento.';
COMMENT ON COLUMN requests.duration IS 'Duración estimada del evento.';
COMMENT ON COLUMN requests.location IS 'Ubicación del evento (ciudad, dirección, lat/lng).';
COMMENT ON COLUMN requests.base_rate IS 'Tarifa base calculada para la solicitud.';
COMMENT ON COLUMN requests.duration_hours IS 'Duración del evento en horas.';
COMMENT ON COLUMN requests.distance_km IS 'Distancia en kilómetros al lugar del evento.';
COMMENT ON COLUMN requests.experience_factor IS 'Factor de experiencia aplicado al cálculo del precio.';
COMMENT ON COLUMN requests.instrument_factor IS 'Factor de instrumento aplicado al cálculo del precio.';
COMMENT ON COLUMN requests.system_fee IS 'Comisión de la plataforma.';
COMMENT ON COLUMN requests.total_price IS 'Precio total final de la solicitud.';
COMMENT ON COLUMN requests.extra_amount IS 'Monto adicional sugerido por el líder.';
COMMENT ON COLUMN requests.description IS 'Descripción detallada de la solicitud.';
COMMENT ON COLUMN requests.is_public IS 'Indica si la solicitud es pública o privada.';
COMMENT ON COLUMN requests.status IS 'Estado actual de la solicitud (ej. CREATED, OFFER_RECEIVED, IN_PROGRESS).';
COMMENT ON COLUMN requests.cancelled_by IS 'Indica quién canceló la solicitud (leader, musician, system).';
COMMENT ON COLUMN requests.cancellation_reason IS 'Razón de la cancelación.';
COMMENT ON COLUMN requests.reopened_from_id IS 'ID de la solicitud original si esta fue reabierta.';
COMMENT ON COLUMN requests.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN requests.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE request_instruments IS 'Define qué instrumentos son necesarios para una solicitud específica.';
COMMENT ON COLUMN request_instruments.request_id IS 'ID de la solicitud.';
COMMENT ON COLUMN request_instruments.instrument_id IS 'ID del instrumento requerido.';
COMMENT ON COLUMN request_instruments.quantity IS 'Cantidad de músicos requeridos para este instrumento.';
COMMENT ON COLUMN request_instruments.notes IS 'Notas adicionales sobre el instrumento requerido (ej. tipo específico de guitarra).';

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
COMMENT ON COLUMN offers.id IS 'Identificador único de la oferta.';
COMMENT ON COLUMN offers.request_id IS 'ID de la solicitud a la que se refiere la oferta.';
COMMENT ON COLUMN offers.musician_id IS 'ID del músico que realiza la oferta.';
COMMENT ON COLUMN offers.message IS 'Mensaje opcional del músico al líder.';
COMMENT ON COLUMN offers.proposed_price IS 'Precio propuesto por el músico para el servicio.';
COMMENT ON COLUMN offers.availability_confirmed IS 'Indica si el músico ha confirmado su disponibilidad.';
COMMENT ON COLUMN offers.status IS 'Estado actual de la oferta (ej. SENT, ACCEPTED, REJECTED).';
COMMENT ON COLUMN offers.selected_at IS 'Marca de tiempo cuando la oferta fue seleccionada/aceptada.';
COMMENT ON COLUMN offers.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN offers.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE request_status_history IS 'Historial de cambios de estado para cada solicitud.';
COMMENT ON COLUMN request_status_history.id IS 'Identificador único del registro de historial.';
COMMENT ON COLUMN request_status_history.request_id IS 'ID de la solicitud a la que pertenece este historial.';
COMMENT ON COLUMN request_status_history.old_status IS 'Estado anterior de la solicitud.';
COMMENT ON COLUMN request_status_history.new_status IS 'Nuevo estado de la solicitud.';
COMMENT ON COLUMN request_status_history.changed_by IS 'ID del usuario o sistema que realizó el cambio de estado.';
COMMENT ON COLUMN request_status_history.change_reason IS 'Razón del cambio de estado.';
COMMENT ON COLUMN request_status_history.created_at IS 'Marca de tiempo de creación del registro.';

-- ==============================
-- NOTIFICATIONS
-- ==============================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL a la que la notificación debe dirigir
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Almacena notificaciones para los usuarios.';
COMMENT ON COLUMN notifications.id IS 'Identificador único de la notificación.';
COMMENT ON COLUMN notifications.user_id IS 'ID del usuario al que se envía la notificación.';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación (ej. SYSTEM, MESSAGE, ALERT).';
COMMENT ON COLUMN notifications.title IS 'Título de la notificación.';
COMMENT ON COLUMN notifications.message IS 'Contenido principal de la notificación.';
COMMENT ON COLUMN notifications.link IS 'Enlace asociado a la notificación.';
COMMENT ON COLUMN notifications.is_read IS 'Indica si el usuario ha leído la notificación.';
COMMENT ON COLUMN notifications.created_at IS 'Marca de tiempo de creación del registro.';

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

COMMENT ON TABLE musician_availability IS 'Define la disponibilidad de un músico para una fecha específica.';
COMMENT ON COLUMN musician_availability.id IS 'Identificador único del registro de disponibilidad.';
COMMENT ON COLUMN musician_availability.musician_id IS 'ID del músico.';
COMMENT ON COLUMN musician_availability.event_date IS 'Fecha del evento o día de disponibilidad.';
COMMENT ON COLUMN musician_availability.start_time IS 'Hora de inicio de la disponibilidad.';
COMMENT ON COLUMN musician_availability.end_time IS 'Hora de fin de la disponibilidad.';
COMMENT ON COLUMN musician_availability.is_blocked IS 'Indica si el músico está bloqueado para esta franja horaria.';
COMMENT ON COLUMN musician_availability.reason IS 'Razón del bloqueo (ej. evento, buffer de viaje, no disponible).';
COMMENT ON COLUMN musician_availability.request_id IS 'ID de la solicitud asociada si la disponibilidad está vinculada a un evento.';
COMMENT ON COLUMN musician_availability.latitude IS 'Latitud de la ubicación de disponibilidad.';
COMMENT ON COLUMN musician_availability.longitude IS 'Longitud de la ubicación de disponibilidad.';
COMMENT ON COLUMN musician_availability.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN musician_availability.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE pricing_config IS 'Configuración global para el cálculo de tarifas y comisiones.';
COMMENT ON COLUMN pricing_config.id IS 'Identificador único de la configuración de precios.';
COMMENT ON COLUMN pricing_config.base_hourly_rate IS 'Tarifa horaria base predeterminada para los músicos.';
COMMENT ON COLUMN pricing_config.minimum_hours IS 'Número mínimo de horas que se pueden solicitar para un servicio.';
COMMENT ON COLUMN pricing_config.maximum_hours IS 'Número máximo de horas que se pueden solicitar para un servicio.';
COMMENT ON COLUMN pricing_config.platform_commission IS 'Porcentaje de comisión que la plataforma toma de cada transacción.';
COMMENT ON COLUMN pricing_config.service_fee IS 'Tarifa de servicio fija aplicada a cada transacción.';
COMMENT ON COLUMN pricing_config.tax_rate IS 'Tasa de impuesto aplicada a los servicios.';
COMMENT ON COLUMN pricing_config.currency IS 'Moneda utilizada para las transacciones (ej. USD, EUR).';
COMMENT ON COLUMN pricing_config.is_active IS 'Indica si esta configuración de precios está activa.';
COMMENT ON COLUMN pricing_config.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN pricing_config.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE user_balances IS 'Almacena los balances financieros detallados de cada usuario.';
COMMENT ON COLUMN user_balances.id IS 'Identificador único del balance.';
COMMENT ON COLUMN user_balances.user_id IS 'ID del usuario al que pertenece este balance.';
COMMENT ON COLUMN user_balances.total_earnings IS 'Ganancias totales acumuladas por el usuario.';
COMMENT ON COLUMN user_balances.pending_earnings IS 'Ganancias pendientes de liberación o pago.';
COMMENT ON COLUMN user_balances.available_balance IS 'Balance disponible para retiro o uso.';
COMMENT ON COLUMN user_balances.total_withdrawn IS 'Monto total retirado por el usuario.';
COMMENT ON COLUMN user_balances.currency IS 'Moneda utilizada para los balances (ej. DOP).';
COMMENT ON COLUMN user_balances.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN user_balances.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

COMMENT ON TABLE user_transactions IS 'Registra todas las transacciones financieras realizadas por los usuarios.';
COMMENT ON COLUMN user_transactions.id IS 'Identificador único de la transacción.';
COMMENT ON COLUMN user_transactions.user_id IS 'ID del usuario que realiza la transacción.';
COMMENT ON COLUMN user_transactions.request_id IS 'ID de la solicitud asociada a la transacción (si aplica).';
COMMENT ON COLUMN user_transactions.offer_id IS 'ID de la oferta asociada a la transacción (si aplica).';
COMMENT ON COLUMN user_transactions.type IS 'Tipo de transacción (ej. DEPOSIT, WITHDRAWAL, PAYMENT, REFUND).';
COMMENT ON COLUMN user_transactions.amount IS 'Monto de la transacción.';
COMMENT ON COLUMN user_transactions.description IS 'Descripción detallada de la transacción.';
COMMENT ON COLUMN user_transactions.status IS 'Estado actual de la transacción (ej. PENDING, COMPLETED, FAILED).';
COMMENT ON COLUMN user_transactions.provider IS 'Proveedor de pago utilizado para la transacción (ej. Stripe, MercadoPago).';
COMMENT ON COLUMN user_transactions.currency IS 'Moneda de la transacción (ej. DOP).';
COMMENT ON COLUMN user_transactions.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN user_transactions.updated_at IS 'Marca de tiempo de la última actualización del registro.;

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

COMMENT ON TABLE admin_actions IS 'Registra las acciones realizadas por los administradores en la plataforma.';
COMMENT ON COLUMN admin_actions.id IS 'Identificador único de la acción administrativa.';
COMMENT ON COLUMN admin_actions.admin_id IS 'ID del administrador que realizó la acción.';
COMMENT ON COLUMN admin_actions.user_id IS 'ID del usuario afectado por la acción (si aplica).';
COMMENT ON COLUMN admin_actions.action IS 'Tipo de acción realizada (ej. BLOCK_USER, DELETE_POST).';
COMMENT ON COLUMN admin_actions.reason IS 'Razón o justificación de la acción.';
COMMENT ON COLUMN admin_actions.created_at IS 'Marca de tiempo de creación del registro.';