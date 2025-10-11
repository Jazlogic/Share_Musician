-- ==============================
-- Migración: Añadir nuevas tablas del esquema deploy.sql
-- ==============================

-- Define el tipo de enumeración para los roles de usuario en el sistema.
-- Los roles determinan los permisos y funcionalidades a los que un usuario tiene acceso.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'client',   -- Representa a un cliente que solicita servicios musicales.
            'musician', -- Representa a un músico que ofrece sus servicios.
            'leader',   -- Representa a un líder de banda o grupo musical.
            'admin'     -- Representa a un administrador del sistema con privilegios elevados.
        );
    END IF;
END
$$;

-- Define el tipo de enumeración para los posibles estados de una solicitud musical.
-- Estos estados guían el flujo de trabajo desde la creación hasta la finalización o cancelación de una solicitud.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
          'CREATED',              -- La solicitud ha sido creada por el cliente/líder.
          'OFFER_RECEIVED',       -- Se ha recibido al menos una oferta de un músico.
          'OFFER_ACCEPTED',       -- Una oferta ha sido aceptada por el cliente/líder.
          'CONFIRMED',            -- La solicitud ha sido confirmada y está lista para ejecutarse.
          'IN_PROGRESS',
          'COMPLETED',            -- El servicio musical ha sido completado.
          'CANCELLED_BY_CLIENT',  -- La solicitud ha sido cancelada por el cliente.
          'CANCELLED_BY_MUSICIAN',-- La solicitud ha sido cancelada por el músico.
          'REOPENED',             -- La solicitud ha sido reabierta después de una cancelación o finalización.
          'EXPIRED',              -- La solicitud ha expirado sin ser completada o aceptada.
          'ARCHIVED'              -- La solicitud ha sido archivada.
        );
    END IF;
END
$$;

-- Define el tipo de enumeración para los posibles estados de una oferta realizada por un músico.
-- Estos estados reflejan el ciclo de vida de una oferta en respuesta a una solicitud.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM (
            'SENT',      -- La oferta ha sido enviada por el músico al cliente.
            'ACCEPTED',  -- La oferta ha sido aceptada por el cliente.
            'REJECTED',  -- La oferta ha sido rechazada por el cliente.
            'WITHDRAWN', -- La oferta ha sido retirada por el músico antes de ser aceptada.
            'SELECTED'   -- La oferta ha sido seleccionada como la preferida por el cliente.
        );
    END IF;
END
$$;

-- Define el tipo de enumeración para los diferentes tipos de transacciones financieras.
-- Estos tipos clasifican los movimientos de dinero dentro de la plataforma.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM (
            'earning',    -- Representa ingresos o ganancias para un usuario.
            'withdrawal', -- Representa un retiro de fondos por parte de un usuario.
            'refund',     -- Representa un reembolso de dinero.
            'bonus'       -- Representa un bono o crédito adicional.
        );
    END IF;
END
$$;
-- Define el tipo de enumeración para los posibles estados de una transacción financiera.
-- Estos estados indican el progreso y el resultado de cada operación monetaria.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM (
            'pending',   -- La transacción ha sido iniciada pero aún no se ha completado.
            'completed', -- La transacción se ha realizado con éxito.
            'failed',    -- La transacción ha fallado por alguna razón.
            'cancelled'  -- La transacción ha sido cancelada.
        );
    END IF;
END
$$;

-- Define el tipo de enumeración para los diferentes tipos de notificaciones que los usuarios pueden recibir.
-- Esto permite categorizar y gestionar las notificaciones de manera efectiva.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'SYSTEM',  -- Notificaciones generadas por el sistema (ej. actualizaciones, avisos).
            'MESSAGE', -- Notificaciones relacionadas con mensajes directos entre usuarios.
            'ALERT'    -- Notificaciones de alerta importantes que requieren atención inmediata.
        );
    END IF;
END
$$;

-- TIPOS DE EVENTOS
-- Esta tabla almacena los diferentes tipos de eventos musicales que pueden ser solicitados o registrados en la plataforma.
-- Permite categorizar las solicitudes y ofertas de servicios musicales.
CREATE TABLE IF NOT EXISTS event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único para cada tipo de evento. Es la clave primaria de la tabla.
  name VARCHAR(255) NOT NULL UNIQUE             -- Nombre descriptivo del tipo de evento (ej. Boda, Concierto, Fiesta Privada). Debe ser único.
);

COMMENT ON TABLE event_types IS 'Catálogo de los diferentes tipos de eventos musicales que los usuarios pueden seleccionar al crear una solicitud. Ejemplos: Boda, Concierto, Fiesta Privada.';
COMMENT ON COLUMN event_types.id IS 'Identificador único (UUID) del tipo de evento. Es la clave primaria de la tabla.';
COMMENT ON COLUMN event_types.name IS 'Nombre del tipo de evento (ej. Boda, Concierto, Fiesta Privada). Debe ser único y no nulo.';


-- INSTRUMENTOS (catálogo)
-- Esta tabla contiene un catálogo de todos los instrumentos musicales que los músicos pueden tocar y que pueden ser requeridos en las solicitudes.
-- Permite estandarizar la información sobre los instrumentos en la plataforma.
CREATE TABLE IF NOT EXISTS instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único para cada instrumento. Es la clave primaria de la tabla.
  name VARCHAR(100) UNIQUE NOT NULL,             -- Nombre del instrumento (ej. Guitarra, Piano, Voz). Debe ser único y no nulo.
  category VARCHAR(50),                          -- Categoría a la que pertenece el instrumento (ej. cuerda, viento, percusión, tecla, voz). Permite agrupar instrumentos similares.
  icon TEXT,                                     -- Representación en texto de un icono para el instrumento, útil para la interfaz de usuario.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Marca de tiempo que registra cuándo se añadió el instrumento al catálogo.
);
-- eliminar tabla request;
COMMENT ON TABLE instruments IS 'Catálogo de instrumentos musicales disponibles en la plataforma. Cada instrumento tiene un nombre único, una categoría, un icono y una fecha de creación.';
COMMENT ON COLUMN instruments.id IS 'Identificador único (UUID) del instrumento. Es la clave primaria de la tabla.';
COMMENT ON COLUMN instruments.name IS 'Nombre del instrumento (ej. Guitarra, Piano, Voz). Debe ser único y no nulo.';
COMMENT ON COLUMN instruments.category IS 'Categoría a la que pertenece el instrumento (ej. cuerda, viento, percusión, tecla, voz). Puede ser nulo si no aplica una categoría específica.';
COMMENT ON COLUMN instruments.icon IS 'Icono representativo del instrumento, almacenado como texto (ej. un path a un SVG o un código de icono).';
COMMENT ON COLUMN instruments.created_at IS 'Marca de tiempo con zona horaria que indica la fecha y hora en que se creó el registro del instrumento.';


-- INSTRUMENTOS DE USUARIO (instrumentos que toca un músico)
-- Esta tabla registra los instrumentos específicos que cada músico puede tocar, junto con su nivel de habilidad y años de experiencia.
-- Es fundamental para emparejar músicos con solicitudes que requieren instrumentos y habilidades particulares.
CREATE TABLE IF NOT EXISTS user_instruments (
  user_id UUID NOT NULL,                               -- Identificador único del usuario (músico) al que se asocia el instrumento.
  instrument_id UUID NOT NULL,                           -- Identificador único del instrumento que el músico toca.
  skill_level VARCHAR(50),                               -- Nivel de habilidad del músico con este instrumento (ej. Principiante, Intermedio, Avanzado).
  experience_years NUMERIC(4,1),                         -- Años de experiencia que el músico tiene tocando este instrumento.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),     -- Marca de tiempo que registra cuándo se añadió este instrumento al perfil del músico.
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),     -- Marca de tiempo de la última actualización del registro.
  PRIMARY KEY (user_id, instrument_id)                   -- La clave primaria compuesta asegura que un músico no tenga el mismo instrumento registrado dos veces.
);

COMMENT ON TABLE user_instruments IS 'Registra los instrumentos que cada músico domina, incluyendo su nivel de habilidad y años de experiencia. Es una tabla de unión entre usuarios e instrumentos.';
COMMENT ON COLUMN user_instruments.user_id IS 'Identificador único (UUID) del músico. Parte de la clave primaria compuesta.';
COMMENT ON COLUMN user_instruments.instrument_id IS 'Identificador único (UUID) del instrumento. Parte de la clave primaria compuesta.';
COMMENT ON COLUMN user_instruments.skill_level IS 'Nivel de habilidad del músico con el instrumento (ej. Principiante, Intermedio, Avanzado). Puede ser nulo si no se especifica.';
COMMENT ON COLUMN user_instruments.experience_years IS 'Número de años de experiencia del músico tocando este instrumento. Puede ser nulo.';
COMMENT ON COLUMN user_instruments.created_at IS 'Marca de tiempo con zona horaria que indica la fecha y hora en que se creó el registro de la habilidad del músico con el instrumento.';
COMMENT ON COLUMN user_instruments.updated_at IS 'Marca de tiempo con zona horaria que indica la última fecha y hora en que se actualizó el registro de la habilidad del músico con el instrumento.';


-- TARIFAS DE MÚSICOS (tarifas base por tipo de músico)
-- Esta tabla define las tarifas horarias base para diferentes categorías de músicos.
-- Permite establecer una estructura de precios flexible y escalable para los servicios musicales.
CREATE TABLE IF NOT EXISTS musician_tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- Identificador único para cada tarifa de músico. Es la clave primaria.
    category VARCHAR(100) NOT NULL UNIQUE,             -- Categoría del músico a la que se aplica esta tarifa (ej. Solista, Banda, Orquesta). Debe ser única.
    hourly_rate NUMERIC(12,2) NOT NULL,                 -- Tarifa por hora base para esta categoría de músico. No puede ser nula.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Marca de tiempo que registra cuándo se creó esta tarifa.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Marca de tiempo de la última actualización de la tarifa.
);

COMMENT ON TABLE musician_tariffs IS 'Define las tarifas horarias base para diferentes categorías de músicos. Estas tarifas son utilizadas como punto de partida para calcular el costo de los servicios musicales.';
COMMENT ON COLUMN musician_tariffs.id IS 'Identificador único (UUID) de la tarifa del músico. Es la clave primaria de la tabla.';
COMMENT ON COLUMN musician_tariffs.category IS 'Categoría del músico a la que se aplica esta tarifa (ej. Solista, Banda, Orquesta). Debe ser única y no nula.';
COMMENT ON COLUMN musician_tariffs.hourly_rate IS 'Tarifa por hora base para esta categoría de músico. Representa el costo por hora de servicio.';
COMMENT ON COLUMN musician_tariffs.created_at IS 'Marca de tiempo con zona horaria que indica la fecha y hora en que se creó el registro de la tarifa.';
COMMENT ON COLUMN musician_tariffs.updated_at IS 'Marca de tiempo con zona horaria que indica la última fecha y hora en que se actualizó el registro de la tarifa.';


-- CONFIGURACIÓN DE PRECIOS (configuración para cálculo de tarifas)
-- Esta tabla almacena la configuración global utilizada para calcular tarifas, comisiones y otros aspectos financieros en la plataforma.
-- Permite ajustar dinámicamente los parámetros de precios sin modificar el código de la aplicación.
CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),     -- Identificador único para la configuración de precios. Es la clave primaria.
  base_hourly_rate NUMERIC(12,2) NOT NULL DEFAULT 500.00, -- Tarifa horaria base predeterminada para los músicos, utilizada si no se especifica una tarifa por categoría.
  minimum_hours NUMERIC(4,2) NOT NULL DEFAULT 2.00,   -- Número mínimo de horas que se pueden solicitar para un servicio musical.
  maximum_hours NUMERIC(4,2) NOT NULL DEFAULT 12.00,  -- Número máximo de horas que se pueden solicitar para un servicio musical.
  platform_commission NUMERIC(5,4) NOT NULL DEFAULT 0.1500, -- Porcentaje de comisión que la plataforma retiene de cada transacción (ej. 0.15 para 15%).
  service_fee NUMERIC(10,2) NOT NULL DEFAULT 100.00,  -- Tarifa de servicio fija aplicada a cada transacción, independientemente del costo total.
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.1800,      -- Tasa de impuesto aplicada a los servicios (ej. 0.18 para 18%).
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',         -- Código de la moneda utilizada para todas las transacciones (ej. 'DOP' para pesos dominicanos).
  is_active BOOLEAN DEFAULT TRUE,                     -- Indica si esta configuración de precios está actualmente activa y en uso.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Marca de tiempo que registra cuándo se creó esta configuración.
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Marca de tiempo de la última actualización de la configuración.
);

COMMENT ON TABLE pricing_config IS 'Configuración global para el cálculo de tarifas, comisiones, impuestos y otros parámetros financieros de la plataforma. Permite la gestión centralizada de la política de precios.';
COMMENT ON COLUMN pricing_config.id IS 'Identificador único (UUID) de la configuración de precios. Es la clave primaria.';
COMMENT ON COLUMN pricing_config.base_hourly_rate IS 'Tarifa horaria base predeterminada para los músicos. Se utiliza como valor por defecto si no hay una tarifa específica por categoría.';
COMMENT ON COLUMN pricing_config.minimum_hours IS 'Número mínimo de horas que un servicio musical puede durar. Ayuda a establecer límites en las solicitudes.';
COMMENT ON COLUMN pricing_config.maximum_hours IS 'Número máximo de horas que un servicio musical puede durar. Ayuda a establecer límites en las solicitudes.';
COMMENT ON COLUMN pricing_config.platform_commission IS 'Porcentaje de comisión que la plataforma cobra por cada transacción. Se expresa como un decimal (ej. 0.15 para 15%).';
COMMENT ON COLUMN pricing_config.service_fee IS 'Tarifa fija de servicio que se añade a cada transacción. Cubre costos operativos de la plataforma.';
COMMENT ON COLUMN pricing_config.tax_rate IS 'Tasa de impuesto aplicada a los servicios. Se expresa como un decimal (ej. 0.18 para 18%).';
COMMENT ON COLUMN pricing_config.currency IS 'Código de tres letras de la moneda utilizada en la plataforma (ej. DOP, USD, EUR). Por defecto es DOP.';
COMMENT ON COLUMN pricing_config.is_active IS 'Indica si esta configuración de precios está activa. Solo una configuración activa debería estar en uso en un momento dado.';
COMMENT ON COLUMN pricing_config.created_at IS 'Marca de tiempo con zona horaria que indica la fecha y hora en que se creó este registro de configuración.';
COMMENT ON COLUMN pricing_config.updated_at IS 'Marca de tiempo con zona horaria que indica la última fecha y hora en que se actualizó este registro de configuración.';



-- Comandos ALTER para completar tabla solicitud (init.sql)
-- Estos comandos añaden columnas adicionales a la tabla 'request' que son necesarias para la gestión completa de las solicitudes musicales.
ALTER TABLE request ADD COLUMN IF NOT EXISTS event_type_id UUID;             -- Añade la columna para el tipo de evento asociado a la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS start_time TIME WITH TIME ZONE; -- Añade la columna para la hora de inicio del evento.
ALTER TABLE request ADD COLUMN IF NOT EXISTS end_time TIME WITH TIME ZONE;   -- Añade la columna para la hora de finalización del evento.
ALTER TABLE request ADD COLUMN IF NOT EXISTS duration INTERVAL;             -- Añade la columna para la duración total del evento.
ALTER TABLE request ADD COLUMN IF NOT EXISTS base_rate NUMERIC(12,2);       -- Añade la columna para la tarifa base calculada para la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS duration_hours NUMERIC(5,2);   -- Añade la columna para la duración del evento en horas.
ALTER TABLE request ADD COLUMN IF NOT EXISTS distance_km NUMERIC(10,2);     -- Añade la columna para la distancia en kilómetros al lugar del evento.
ALTER TABLE request ADD COLUMN IF NOT EXISTS experience_factor NUMERIC(3,2); -- Añade la columna para el factor de experiencia aplicado al cálculo del precio.
ALTER TABLE request ADD COLUMN IF NOT EXISTS instrument_factor NUMERIC(3,2); -- Añade la columna para el factor de instrumento aplicado al cálculo del precio.
ALTER TABLE request ADD COLUMN IF NOT EXISTS system_fee NUMERIC(12,2);       -- Añade la columna para la comisión del sistema aplicada a la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS total_price NUMERIC(12,2);     -- Añade la columna para el precio total final de la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS extra_amount NUMERIC(12,2) DEFAULT 0; -- Añade la columna para cualquier monto extra añadido a la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS description TEXT;               -- Añade la columna para una descripción detallada de la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE; -- Añade la columna para indicar si la solicitud es pública o privada.
ALTER TABLE request ADD COLUMN IF NOT EXISTS cancelled_by user_role;         -- Añade la columna para registrar quién canceló la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;       -- Añade la columna para la razón de la cancelación de la solicitud.
ALTER TABLE request ADD COLUMN IF NOT EXISTS reopened_from_id UUID;          -- Añade la columna para el ID de la solicitud original si fue reabierta.

COMMENT ON TABLE request IS 'Tabla que almacena todas las solicitudes de servicios musicales realizadas por clientes o líderes. Cada solicitud detalla el evento, los requisitos, el estado y la información de precios. Puede vincular varios instrumentos mediante la tabla request_instruments.';
COMMENT ON COLUMN request.id IS 'Identificador único (UUID) de la solicitud. Es la clave primaria de la tabla.';
COMMENT ON COLUMN request.client_id IS 'Identificador único (UUID) del cliente o líder que creó la solicitud.';
COMMENT ON COLUMN request.event_type_id IS 'Identificador único (UUID) del tipo de evento asociado a esta solicitud (ej. Boda, Concierto). Referencia a la tabla event_types.';
COMMENT ON COLUMN request.event_date IS 'Fecha específica en la que se llevará a cabo el evento musical.';
COMMENT ON COLUMN request.start_time IS 'Hora de inicio programada para el evento musical. Incluye información de zona horaria.';
COMMENT ON COLUMN request.end_time IS 'Hora de finalización programada para el evento musical. Incluye información de zona horaria.';
COMMENT ON COLUMN request.duration IS 'Duración total estimada del evento musical, expresada como un intervalo de tiempo.';
COMMENT ON COLUMN request.location IS 'Ubicación física donde se realizará el evento, incluyendo detalles como ciudad, dirección y coordenadas geográficas (latitud/longitud).';
COMMENT ON COLUMN request.base_rate IS 'Tarifa base calculada para la solicitud antes de aplicar factores adicionales o comisiones. Se basa en las tarifas de los músicos y la duración.';
COMMENT ON COLUMN request.duration_hours IS 'Duración del evento expresada en horas, utilizada para cálculos de precios.';
COMMENT ON COLUMN request.distance_km IS 'Distancia en kilómetros desde un punto de referencia (ej. ubicación del músico) hasta el lugar del evento. Afecta los costos de transporte.';
COMMENT ON COLUMN request.experience_factor IS 'Factor numérico aplicado al cálculo del precio basado en la experiencia requerida para los músicos. Un valor más alto indica mayor experiencia y, por ende, mayor costo.';
COMMENT ON COLUMN request.instrument_factor IS 'Factor numérico aplicado al cálculo del precio basado en la rareza o demanda de los instrumentos requeridos. Instrumentos más especializados pueden aumentar el costo.';
COMMENT ON COLUMN request.system_fee IS 'Monto de la comisión que la plataforma cobra por la gestión de la solicitud. Se añade al precio total.';
COMMENT ON COLUMN request.total_price IS 'Precio total final que el cliente deberá pagar por el servicio musical, incluyendo tarifas base, factores, comisiones y montos extra.';
COMMENT ON COLUMN request.extra_amount IS 'Monto adicional opcional que el líder o cliente puede haber añadido a la solicitud, por ejemplo, para cubrir gastos imprevistos o propinas.';
COMMENT ON COLUMN request.description IS 'Descripción detallada de la solicitud musical, incluyendo el tipo de música, ambiente deseado, requisitos especiales, etc.';
COMMENT ON COLUMN request.is_public IS 'Indica si la solicitud es visible públicamente para todos los músicos o si es una solicitud privada dirigida a músicos específicos.';
COMMENT ON COLUMN request.status IS 'Estado actual de la solicitud, utilizando los valores definidos en la enumeración request_status (ej. CREATED, OFFER_RECEIVED, IN_PROGRESS, COMPLETED).';
COMMENT ON COLUMN request.cancelled_by IS 'Indica el rol del usuario que canceló la solicitud (ej. client, musician, system). Utiliza los valores de la enumeración user_role.';
COMMENT ON COLUMN request.cancellation_reason IS 'Texto que describe la razón específica por la cual la solicitud fue cancelada.';
COMMENT ON COLUMN request.reopened_from_id IS 'Si la solicitud fue reabierta después de una cancelación, este campo almacena el identificador único (UUID) de la solicitud original.';
COMMENT ON COLUMN request.created_at IS 'Marca de tiempo con zona horaria que indica la fecha y hora en que la solicitud fue creada en el sistema.';
COMMENT ON COLUMN request.updated_at IS 'Marca de tiempo con zona horaria que indica la última fecha y hora en que la solicitud fue modificada o actualizada.';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_requests_client_id') THEN
        ALTER TABLE request ADD CONSTRAINT fk_requests_client_id FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_requests_event_type_id') THEN
        ALTER TABLE request ADD CONSTRAINT fk_requests_event_type_id FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- HISTORIAL DE ESTADO DE SOLICITUD (trazabilidad de cambios)
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

-- NOTIFICACIONES
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

-- DISPONIBILIDAD DEL MÚSICO
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

-- SALDOS DE USUARIO
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

-- TRANSACCIONES DE USUARIO
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

-- ACCIONES DE ADMINISTRADOR
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

-- INSTRUMENTOS DE SOLICITUD (instrumentos requeridos para una solicitud)
CREATE TABLE IF NOT EXISTS request_instruments (
  request_id UUID NOT NULL,
  instrument_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (request_id, instrument_id)
);

COMMENT ON TABLE request_instruments IS 'Instrumentos específicos requeridos para una solicitud musical.';
COMMENT ON COLUMN request_instruments.request_id IS 'ID de la solicitud a la que se asocia el instrumento.';
COMMENT ON COLUMN request_instruments.instrument_id IS 'ID del instrumento requerido para la solicitud.';
COMMENT ON COLUMN request_instruments.created_at IS 'Marca de tiempo de creación del registro.';
