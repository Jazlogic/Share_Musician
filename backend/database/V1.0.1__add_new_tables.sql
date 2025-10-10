-- ==============================
-- Migration: Add new tables from deploy.sql schema
-- ==============================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
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
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('SYSTEM', 'MESSAGE', 'ALERT');
    END IF;
END
$$;

-- EVENT TYPES
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE
);

COMMENT ON TABLE event_types IS 'Tipos de eventos musicales (ej. Boda, Concierto, Fiesta Privada).';
COMMENT ON COLUMN event_types.id IS 'Identificador único del tipo de evento.';
COMMENT ON COLUMN event_types.name IS 'Nombre del tipo de evento.';

-- INSTRUMENTS (catalog)
CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- Ej: Guitarra, Piano, Voz
  category VARCHAR(50), -- Ej: cuerda, viento, percusión, tecla, voz
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- drop table request;
COMMENT ON TABLE instruments IS 'Catálogo de instrumentos musicales disponibles en la plataforma.';
COMMENT ON COLUMN instruments.id IS 'Identificador único del instrumento.';
COMMENT ON COLUMN instruments.name IS 'Nombre del instrumento (ej. Guitarra, Piano, Voz).';
COMMENT ON COLUMN instruments.category IS 'Categoría a la que pertenece el instrumento (ej. cuerda, viento, percusión, tecla, voz).';
COMMENT ON COLUMN instruments.icon IS 'Icono representativo del instrumento.';
COMMENT ON COLUMN instruments.created_at IS 'Marca de tiempo de creación del registro.';

-- USER INSTRUMENTS (instrumentos que toca un músico)
CREATE TABLE IF NOT EXISTS user_instruments (
  user_id UUID NOT NULL,
  instrument_id UUID NOT NULL,
  skill_level VARCHAR(50), -- Ej: Principiante, Intermedio, Avanzado
  experience_years NUMERIC(4,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, instrument_id)
);

COMMENT ON TABLE user_instruments IS 'Instrumentos que un músico específico toca, con su nivel de habilidad y años de experiencia.';
COMMENT ON COLUMN user_instruments.user_id IS 'ID del músico.';
COMMENT ON COLUMN user_instruments.instrument_id IS 'ID del instrumento.';
COMMENT ON COLUMN user_instruments.skill_level IS 'Nivel de habilidad del músico con este instrumento.';
COMMENT ON COLUMN user_instruments.experience_years IS 'Años de experiencia del músico con este instrumento.';
COMMENT ON COLUMN user_instruments.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN user_instruments.updated_at IS 'Marca de tiempo de la última actualización del registro.';

-- MUSICIAN TARIFFS (tarifas base por tipo de músico)
CREATE TABLE IF NOT EXISTS musician_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL UNIQUE,
    hourly_rate NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE musician_tariffs IS 'Tarifas base por categoría de músico.';
COMMENT ON COLUMN musician_tariffs.id IS 'Identificador único de la tarifa.';
COMMENT ON COLUMN musician_tariffs.hourly_rate IS 'Tarifa por hora para esta categoría de músico.';
COMMENT ON COLUMN musician_tariffs.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN musician_tariffs.updated_at IS 'Marca de tiempo de la última actualización del registro.';

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

-- REQUESTS (solicitudes de músicos)
-- Tabla comentada para actualizar estructura de request (init.sql). Fecha: 2024-10-23
/*
DROP TABLE IF EXISTS request;
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  event_type_id UUID NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME WITH TIME ZONE NOT NULL,
  end_time TIME WITH TIME ZONE NOT NULL,
  duration INTERVAL,
  location TEXT NOT NULL,
  base_rate NUMERIC(12,2) NOT NULL,
  duration_hours NUMERIC(5,2),
  distance_km NUMERIC(10,2),
  experience_factor NUMERIC(3,2),
  instrument_factor NUMERIC(3,2),
  system_fee NUMERIC(12,2),
  total_price NUMERIC(12,2),
  extra_amount NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  status request_status NOT NULL DEFAULT 'CREATED',
  cancelled_by user_role,
  cancellation_reason TEXT,
  reopened_from_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- Comandos ALTER para completar tabla request (init.sql)
ALTER TABLE request ADD COLUMN IF NOT EXISTS event_type_id UUID;
ALTER TABLE request ADD COLUMN IF NOT EXISTS start_time TIME WITH TIME ZONE;
ALTER TABLE request ADD COLUMN IF NOT EXISTS end_time TIME WITH TIME ZONE;
ALTER TABLE request ADD COLUMN IF NOT EXISTS duration INTERVAL;
ALTER TABLE request ADD COLUMN IF NOT EXISTS base_rate NUMERIC(12,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(5,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS experience_factor NUMERIC(3,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS instrument_factor NUMERIC(3,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS system_fee NUMERIC(12,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS extra_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE request ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE request ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE request ADD COLUMN IF NOT EXISTS cancelled_by user_role;
ALTER TABLE request ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE request ADD COLUMN IF NOT EXISTS reopened_from_id UUID;

COMMENT ON TABLE request IS 'Solicitudes musicales creadas por líderes/clientes. Puede vincular varios instrumentos mediante request_instruments.';
COMMENT ON COLUMN request.id IS 'Identificador único de la solicitud.';
COMMENT ON COLUMN request.client_id IS 'ID del cliente que crea la solicitud.';
COMMENT ON COLUMN request.event_type_id IS 'ID del tipo de evento.';
COMMENT ON COLUMN request.event_date IS 'Fecha y hora del evento.';
COMMENT ON COLUMN request.start_time IS 'Hora de inicio del evento.';
COMMENT ON COLUMN request.end_time IS 'Hora de finalización del evento.';
COMMENT ON COLUMN request.duration IS 'Duración estimada del evento.';
COMMENT ON COLUMN request.location IS 'Ubicación del evento (ciudad, dirección, lat/lng).';
COMMENT ON COLUMN request.base_rate IS 'Tarifa base calculada para la solicitud.';
COMMENT ON COLUMN request.duration_hours IS 'Duración del evento en horas.';
COMMENT ON COLUMN request.distance_km IS 'Distancia en kilómetros al lugar del evento.';
COMMENT ON COLUMN request.experience_factor IS 'Factor de experiencia aplicado al cálculo del precio.';
COMMENT ON COLUMN request.instrument_factor IS 'Factor de instrumento aplicado al cálculo del precio.';
COMMENT ON COLUMN request.system_fee IS 'Comisión de la plataforma.';
COMMENT ON COLUMN request.total_price IS 'Precio total que verá el cliente como coste final del servicio.';
COMMENT ON COLUMN request.extra_amount IS 'Monto adicional sugerido por el líder.';
COMMENT ON COLUMN request.description IS 'Descripción detallada de la solicitud.';
COMMENT ON COLUMN request.is_public IS 'Indica si la solicitud es pública o privada.';
COMMENT ON COLUMN request.status IS 'Estado actual de la solicitud (ej. CREATED, OFFER_RECEIVED, IN_PROGRESS).';
COMMENT ON COLUMN request.cancelled_by IS 'Indica quién canceló la solicitud (leader, musician, system).';
COMMENT ON COLUMN request.cancellation_reason IS 'Razón de la cancelación.';
COMMENT ON COLUMN request.reopened_from_id IS 'ID de la solicitud original si esta fue reabierta.';
COMMENT ON COLUMN request.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN request.updated_at IS 'Marca de tiempo de la última actualización del registro.';

ALTER TABLE request ADD CONSTRAINT fk_requests_client_id FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE request ADD CONSTRAINT fk_requests_event_type_id FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- REQUEST STATUS HISTORY (trazabilidad de cambios)
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

-- NOTIFICATIONS
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

-- MUSICIAN AVAILABILITY
CREATE TABLE IF NOT EXISTS musician_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE musician_availability IS 'Disponibilidad de los músicos para eventos.';
COMMENT ON COLUMN musician_availability.id IS 'Identificador único de la disponibilidad.';
COMMENT ON COLUMN musician_availability.musician_id IS 'ID del músico.';
COMMENT ON COLUMN musician_availability.event_date IS 'Fecha del evento.';
COMMENT ON COLUMN musician_availability.start_time IS 'Hora de inicio de la disponibilidad.';
COMMENT ON COLUMN musician_availability.end_time IS 'Hora de fin de la disponibilidad.';
COMMENT ON COLUMN musician_availability.is_available IS 'Indica si el músico está disponible en ese horario.';
COMMENT ON COLUMN musician_availability.created_at IS 'Marca de tiempo de creación del registro.';
COMMENT ON COLUMN musician_availability.updated_at IS 'Marca de tiempo de la última actualización del registro.';

-- USER BALANCES
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

-- USER TRANSACTIONS
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

COMMENT ON TABLE user_transactions IS 'Almacena todas las transacciones financieras realizadas por los usuarios.';
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
COMMENT ON COLUMN user_transactions.updated_at IS 'Marca de tiempo de la última actualización del registro.';

-- ADMIN ACTIONS
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE admin_actions IS 'Almacena las acciones realizadas por los administradores en la plataforma.';
COMMENT ON COLUMN admin_actions.id IS 'Identificador único de la acción administrativa.';
COMMENT ON COLUMN admin_actions.admin_id IS 'ID del administrador que realizó la acción.';
COMMENT ON COLUMN admin_actions.user_id IS 'ID del usuario afectado por la acción (si aplica).';
COMMENT ON COLUMN admin_actions.action IS 'Tipo de acción realizada (ej. BLOCK_USER, DELETE_POST).';
COMMENT ON COLUMN admin_actions.reason IS 'Razón o justificación de la acción.';
COMMENT ON COLUMN admin_actions.created_at IS 'Marca de tiempo de creación del registro.';

-- OFFERS (propuestas de músicos)
-- CREATE TABLE IF NOT EXISTS offer (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     request_id UUID NOT NULL REFERENCES request(id) ON DELETE CASCADE,
--     musician_id UUID NOT NULL REFERENCES musician_profiles(id) ON DELETE CASCADE,
--     proposed_price NUMERIC(10, 2) NOT NULL,
--     message TEXT,
--     availability_confirmed BOOLEAN DEFAULT FALSE,
--     status offer_status DEFAULT 'SENT',
--     selected_at TIMESTAMP WITH TIME ZONE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- COMMENT ON TABLE offer IS 'Ofertas enviadas por músicos para cubrir una solicitud.';
-- COMMENT ON COLUMN offer.id IS 'Identificador único de la oferta.';
-- COMMENT ON COLUMN offer.request_id IS 'ID de la solicitud a la que se refiere la oferta.';
-- COMMENT ON COLUMN offer.musician_id IS 'ID del músico que realiza la oferta.';
-- COMMENT ON COLUMN offer.proposed_price IS 'Precio propuesto por el músico para el servicio.';
-- COMMENT ON COLUMN offer.availability_confirmed IS 'Indica si el músico ha confirmado su disponibilidad.';
-- COMMENT ON COLUMN offer.status IS 'Estado actual de la oferta (ej. SENT, ACCEPTED, REJECTED).';
-- COMMENT ON COLUMN offer.selected_at IS 'Marca de tiempo cuando la oferta fue seleccionada/aceptada.';
-- COMMENT ON COLUMN offer.created_at IS 'Marca de tiempo de creación del registro.';
-- COMMENT ON COLUMN offer.updated_at IS 'Marca de tiempo de la última actualización del registro.';

-- REQUEST INSTRUMENTS (instrumentos requeridos para una solicitud)
CREATE TABLE IF NOT EXISTS request_instruments (
  request_id UUID NOT NULL,
  instrument_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (request_id, instrument_id),
  CONSTRAINT fk_request_instruments_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE,
  CONSTRAINT fk_request_instruments_instrument FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON DELETE CASCADE
);

COMMENT ON TABLE request_instruments IS 'Instrumentos específicos requeridos para una solicitud musical.';
COMMENT ON COLUMN request_instruments.request_id IS 'ID de la solicitud.';
COMMENT ON COLUMN request_instruments.instrument_id IS 'ID del instrumento requerido.';
COMMENT ON COLUMN request_instruments.created_at IS 'Marca de tiempo de creación del registro.'
