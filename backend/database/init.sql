-- Drop everything and start fresh
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- Re-enable basic extensions if needed
-- Enable UUID generation
-- Habilitar la extensión para la generación de UUIDs (Identificadores Únicos Universales).
-- Esto permite usar la función uuid_generate_v4() para crear IDs únicos para las tablas.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar la extensión pgcrypto para funciones criptográficas.
-- Esto es útil para el hash seguro de contraseñas y otras operaciones de seguridad.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Your new schema will go here

-- Tabla para Iglesias
-- Esta tabla almacena información sobre las iglesias registradas en el sistema.
CREATE TABLE IF NOT EXISTS churches (
    churches_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Identificador único de la iglesia (UUID).
    name VARCHAR(255) UNIQUE NOT NULL,                       -- Nombre de la iglesia, debe ser único.
    location VARCHAR(255),                                   -- Ubicación geográfica de la iglesia.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),       -- Marca de tiempo de creación del registro.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()        -- Marca de tiempo de la última actualización del registro.
);
select * from churches;

-- Tabla para Usuarios (normalizada)
-- Esta tabla almacena información detallada de los usuarios del sistema, incluyendo su rol, estado y datos de contacto.
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                               -- Identificador único del usuario (UUID).
    name VARCHAR(255) NOT NULL,                                                        -- Nombre completo del usuario.
    email VARCHAR(255) UNIQUE NOT NULL,                                                -- Correo electrónico del usuario, debe ser único.
    phone VARCHAR(20) NOT NULL,                                                        -- Número de teléfono del usuario.
    role VARCHAR(20) NOT NULL DEFAULT 'leader' CHECK (role IN ('leader', 'musician', 'admin')), -- Rol principal del usuario (líder, músico, administrador).
    active_role VARCHAR(20) DEFAULT 'musician' CHECK (active_role IN ('leader', 'musician')), -- Rol activo del usuario en un momento dado.
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')), -- Estado de la cuenta del usuario (activo, pendiente, rechazado).
    church_id UUID REFERENCES churches(churches_id) ON DELETE SET NULL,                -- Clave foránea a la tabla de iglesias, si aplica.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),                                 -- Marca de tiempo de creación del registro.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),                                 -- Marca de tiempo de la última actualización del registro.
    email_verified BOOLEAN DEFAULT FALSE,                                              -- Indica si el correo electrónico del usuario ha sido verificado.
    verification_token VARCHAR(255) UNIQUE,                                            -- Token para la verificación de correo electrónico.
    profileKey VARCHAR(255) DEFAULT NULL,                                              -- Clave para la imagen de perfil del usuario.
    reset_password_token VARCHAR(255),                                                 -- Token para restablecer la contraseña.
    reset_password_expires_at TIMESTAMP WITH TIME ZONE,                                -- Fecha y hora de expiración del token de restablecimiento de contraseña.
    verification_token_expires_at TIMESTAMP WITH TIME ZONE                             -- Fecha y hora de expiración del token de verificación de correo electrónico.
);

-- Comandos ALTER para añadir columnas adicionales a la tabla users.
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMP WITH TIME ZONE; -- Añade la columna para la fecha de expiración del token de restablecimiento de contraseña.
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE; -- Añade la columna para la fecha de expiración del token de verificación de correo electrónico.
select * from users;

delete from users where email = 'astaciosanchezjefryagustin@gmail.com';
delete from users where email = 'jasbootstudios@gmail.com';
delete from users where email = 'elica.app@gmail.com';

-- Tabla para el historial de imágenes de perfil
-- Esta tabla registra cada cambio en la imagen de perfil de un usuario, manteniendo un historial de las imágenes utilizadas.
CREATE TABLE IF NOT EXISTS user_profile_image_history (
    user_profile_image_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único del registro de historial de imagen de perfil.
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,       -- Clave foránea al usuario al que pertenece la imagen de perfil.
    profilekey TEXT NOT NULL,                                                -- Clave de la imagen de perfil en el sistema de almacenamiento.
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP           -- Marca de tiempo de la carga de la imagen.
);
select * from user_profile_image_history;

drop table user_profile_image_history;

-- Tabla para contraseñas de usuarios (separada por seguridad)
-- Esta tabla almacena las contraseñas hasheadas de los usuarios, separadas de la tabla principal de usuarios para mayor seguridad.
CREATE TABLE IF NOT EXISTS user_passwords (
    password_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Identificador único de la contraseña.
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Clave foránea al usuario al que pertenece la contraseña.
    password VARCHAR(255) NOT NULL,                          -- Contraseña hasheada del usuario.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()        -- Marca de tiempo de creación del registro de contraseña.
);

-- Crear índice para mejorar el rendimiento en búsquedas por user_id.
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);

-- Habilitar Row Level Security (RLS) para la tabla user_passwords.
-- Esto asegura que los usuarios solo puedan acceder a sus propias contraseñas.
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Política de seguridad: Los usuarios pueden leer su propia contraseña.
-- Esta política permite que un usuario autenticado (auth.uid()) acceda a su propio registro de contraseña.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own password' AND tablename = 'user_passwords') THEN
        CREATE POLICY "Users can read own password" ON user_passwords
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
END
$$;

-- Tabla para verificaciones de correo electrónico
-- Esta tabla almacena los registros de verificación de correo electrónico, incluyendo el PIN enviado y su estado.
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Identificador único de la verificación de correo electrónico.
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Clave foránea al usuario asociado con la verificación.
    email VARCHAR(255) NOT NULL,                                 -- Correo electrónico que se está verificando.
    pin VARCHAR(6) NOT NULL,                                     -- Código PIN enviado al usuario para la verificación.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Marca de tiempo de creación del registro de verificación.
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes', -- Fecha y hora de expiración del PIN.
    verified BOOLEAN DEFAULT FALSE                               -- Indica si el correo electrónico ha sido verificado exitosamente.
);

-- Habilitar Row Level Security (RLS) para la tabla email_verifications.
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Política de seguridad: Permitir todo para email_verifications.
-- Esta política permite el acceso completo a la tabla email_verifications, lo cual puede ser ajustado según las necesidades de seguridad.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for email_verifications' AND tablename = 'email_verifications') THEN
        CREATE POLICY "Allow all for email_verifications" ON email_verifications USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Tabla para Publicaciones (Posts)
-- Esta tabla almacena las publicaciones o posts creados por los usuarios, incluyendo su contenido y la clave de almacenamiento.
CREATE TABLE IF NOT EXISTS posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Identificador único de la publicación.
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE, -- Clave foránea al usuario que creó la publicación.
    content TEXT,                                        -- Contenido textual de la publicación.
    postKey VARCHAR(255) DEFAULT NULL,                   -- Clave para el contenido de la publicación en el sistema de almacenamiento (ej. para imágenes o videos).
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),   -- Marca de tiempo de creación de la publicación.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()    -- Marca de tiempo de la última actualización de la publicación.
);

select * from posts;

-- Tabla para Solicitudes de Música (Requests)
-- ==============================
-- ENUMS
-- ==============================
-- Definición de los posibles estados de una solicitud de música.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM (
      'CREATED',            -- La solicitud ha sido creada y está pendiente.
      'WAITING_OFFER',      -- La solicitud está esperando ofertas de músicos.
      'OFFER_RECEIVED',     -- Se ha recibido al menos una oferta para la solicitud.
      'OFFER_ACCEPTED',     -- Una oferta ha sido aceptada por el cliente.
      'CONFIRMED',          -- La solicitud ha sido confirmada y está lista para el evento.
      'IN_PROGRESS',        -- El evento o servicio musical está en curso.
      'COMPLETED',          -- El evento o servicio musical ha finalizado exitosamente.
      'CANCELED_BY_CLIENT', -- La solicitud ha sido cancelada por el cliente.
      'CANCELED_BY_MUSICIAN', -- La solicitud ha sido cancelada por el músico.
      'REOPENED',           -- La solicitud ha sido reabierta después de una cancelación o finalización.
      'REJECTED',           -- La solicitud ha sido rechazada (ej. por falta de músicos).
      'EXPIRED',            -- La solicitud ha expirado sin ser completada.
      'IN_DISPUTE',         -- Existe una disputa o problema con la solicitud.
      'ARCHIVED'            -- La solicitud ha sido archivada.
    );
  END IF;
END
$$;

-- Definición de los posibles estados de una oferta realizada por un músico.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
    CREATE TYPE offer_status AS ENUM (
      'SENT',      -- La oferta ha sido enviada por el músico.
      'ACCEPTED',  -- La oferta ha sido aceptada por el cliente.
      'REJECTED',  -- La oferta ha sido rechazada por el cliente.
      'WITHDRAWN'  -- La oferta ha sido retirada por el músico.
    );
  END IF;
END
$$;

-- Definición de los tipos de roles de usuario en el sistema.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
    CREATE TYPE user_type AS ENUM (
      'leader',   -- Rol para líderes o clientes que solicitan servicios.
      'musician', -- Rol para músicos que ofrecen servicios.
      'admin'     -- Rol para administradores del sistema.
    );
  END IF;
END
$$;

-- ==============================
-- TABLA PRINCIPAL: SOLICITUD
-- ==============================
-- Esta tabla almacena todas las solicitudes de servicios musicales realizadas por clientes o líderes.
-- Cada solicitud detalla el evento, los requisitos, el estado y la información de precios.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'request' AND relkind = 'r') THEN
    CREATE TABLE request (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                   -- Identificador único (UUID) de la solicitud. Es la clave primaria de la tabla.
      client_id UUID NOT NULL,                                                         -- Identificador único (UUID) del cliente o líder que creó la solicitud.
      musician_id UUID,                                                                -- Identificador único (UUID) del músico asignado a la solicitud (puede ser nulo).
      title VARCHAR(255) NOT NULL,                                                     -- Título o nombre de la solicitud.
      description TEXT NOT NULL,                                                       -- Descripción detallada de la solicitud.
      category VARCHAR(100),                                                           -- Categoría del evento o tipo de música solicitado.
      location JSONB,                                                                  -- Información de ubicación del evento en formato JSONB (ej. { "address": "", "lat": 0, "lng": 0 }).
      event_date TIMESTAMP,                                                            -- Fecha y hora del evento.
      start_time TIME,                                                                 -- Hora de inicio del evento.
      end_time TIME,                                                                   -- Hora de finalización del evento.
      event_duration INTERVAL,                                                         -- Duración total del evento.
      price NUMERIC(12,2),                                                             -- Precio acordado para la solicitud.
      tip NUMERIC(12,2),
      status request_status NOT NULL DEFAULT 'CREATED',                                -- Estado actual de la solicitud, usando la enumeración request_status.
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo de creación del registro.
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo de la última actualización del registro.
      updated_by UUID,                                                                 -- Identificador del usuario que realizó la última actualización.
      expiration_date TIMESTAMP,                                                       -- Fecha y hora de expiración de la solicitud.
      cancellation_reason TEXT,                                                        -- Razón de la cancelación de la solicitud.
      client_rating INT CHECK (client_rating BETWEEN 1 AND 5),                         -- Calificación del cliente al músico (1-5).
      musician_rating INT CHECK (musician_rating BETWEEN 1 AND 5),                     -- Calificación del músico al cliente (1-5).
      client_comment TEXT,                                                             -- Comentario del cliente sobre el servicio.
      musician_comment TEXT,                                                           -- Comentario del músico sobre la experiencia.
      is_public BOOLEAN DEFAULT TRUE,                                                  -- Indica si la solicitud es pública (visible para todos los músicos) o privada.
      reopened_from_id UUID,
      CONSTRAINT fk_request_client FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE, -- Clave foránea al cliente que hizo la solicitud.
      CONSTRAINT fk_request_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE SET NULL, -- Clave foránea al músico asignado.
      CONSTRAINT fk_request_reopened FOREIGN KEY (reopened_from_id) REFERENCES request(id) ON DELETE SET NULL -- Clave foránea a la solicitud original si fue reabierta.
    );
  END IF;
END
$$;

-- ==============================
-- TABLA DE OFERTAS
-- ==============================
-- Esta tabla almacena las ofertas realizadas por los músicos en respuesta a las solicitudes de servicios musicales.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'offer' AND relkind = 'r') THEN
    CREATE TABLE offer (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                   -- Identificador único (UUID) de la oferta. Es la clave primaria de la tabla.
      request_id UUID NOT NULL,                                                        -- Identificador único (UUID) de la solicitud a la que pertenece esta oferta.
      musician_id UUID NOT NULL,                                                       -- Identificador único (UUID) del músico que realiza la oferta.
      message TEXT,                                                                    -- Mensaje o propuesta del músico al cliente.
      price NUMERIC(12,2),                                                             -- Precio propuesto por el músico para la solicitud.
      status offer_status NOT NULL DEFAULT 'SENT',                                     -- Estado actual de la oferta, usando la enumeración offer_status.
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo de creación del registro.
      updated_by UUID,                                                                 -- Identificador del usuario que realizó la última actualización.
      CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE, -- Clave foránea a la solicitud asociada.
      CONSTRAINT fk_offer_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE -- Clave foránea al músico que hizo la oferta.
    );
  END IF;
END
$$;

-- RLS for offers table
ALTER TABLE offer ENABLE ROW LEVEL SECURITY;

-- ==============================
-- TABLA DE HISTORIAL DE ESTADOS DE SOLICITUDES
-- ==============================
-- Esta tabla registra los cambios de estado de las solicitudes, manteniendo un historial de las transiciones.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'request_history' AND relkind = 'r') THEN
    CREATE TABLE request_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),                                   -- Identificador único (UUID) del registro de historial.
      request_id UUID NOT NULL,                                                        -- Identificador único (UUID) de la solicitud a la que se refiere el historial.
      old_status request_status,                                                       -- El estado anterior de la solicitud antes del cambio.
      new_status request_status NOT NULL,                                              -- El nuevo estado de la solicitud después del cambio.
      user_id UUID,                                                                    -- Identificador del usuario que realizó el cambio de estado.
      updated_by UUID,                                                                 -- Identificador del usuario que realizó la última actualización (puede ser el mismo que user_id).
      user_type user_type,                                                             -- Tipo de usuario (músico o cliente) que realizó el cambio.
      change_date TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo del momento en que ocurrió el cambio de estado.
      CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE -- Clave foránea a la solicitud asociada.
    );
  END IF;
END
$$;

-- ==============================
-- TABLA DE MÉTRICAS DE MÚSICOS
-- ==============================
-- Esta tabla almacena métricas clave de rendimiento y actividad para cada músico.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'musician_metrics' AND relkind = 'r') THEN
    CREATE TABLE musician_metrics (
      musician_id UUID PRIMARY KEY,                                                    -- Identificador único (UUID) del músico. Es también una clave foránea a la tabla de usuarios.
      total_canceled_by_musician INT DEFAULT 0,                                        -- Número total de solicitudes canceladas por el músico.
      total_completed INT DEFAULT 0,                                                   -- Número total de solicitudes completadas exitosamente por el músico.
      total_rejected INT DEFAULT 0,                                                    -- Número total de solicitudes rechazadas por el músico.
      total_in_dispute INT DEFAULT 0,                                                  -- Número total de solicitudes en disputa que involucran al músico.
      total_archived INT DEFAULT 0,                                                    -- Número total de solicitudes archivadas por el músico.
      updated_by UUID,                                                                 -- Identificador del usuario que realizó la última actualización de estas métricas.
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo de la última actualización de las métricas.
      CONSTRAINT fk_musician_metrics FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE -- Clave foránea al músico asociado.
    );
  END IF;
END
$$;

-- ==============================
-- TABLA DE MÉTRICAS DE CLIENTES
-- ==============================
-- Esta tabla almacena métricas clave de rendimiento y actividad para cada cliente.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'client_metrics' AND relkind = 'r') THEN
    CREATE TABLE client_metrics (
      client_id UUID PRIMARY KEY,                                                      -- Identificador único (UUID) del cliente. Es también una clave foránea a la tabla de usuarios.
      total_canceled_by_client INT DEFAULT 0,                                          -- Número total de solicitudes canceladas por el cliente.
      total_completed INT DEFAULT 0,                                                   -- Número total de solicitudes completadas exitosamente por el cliente.
      total_rejected INT DEFAULT 0,                                                    -- Número total de solicitudes rechazadas por el cliente.
      total_expired INT DEFAULT 0,                                                     -- Número total de solicitudes que expiraron sin ser completadas.
      total_in_dispute INT DEFAULT 0,                                                  -- Número total de solicitudes en disputa que involucran al cliente.
      total_archived INT DEFAULT 0,                                                    -- Número total de solicitudes archivadas por el cliente.
      updated_by UUID,                                                                 -- Identificador del usuario que realizó la última actualización de estas métricas.
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),                                     -- Marca de tiempo de la última actualización de las métricas.
      CONSTRAINT fk_client_metrics FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE -- Clave foránea al cliente asociado.
    );
  END IF;
END
$$;

-- ==============================
-- ÍNDICES
-- ==============================
-- Índices para optimizar las consultas en la tabla 'request'.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_client_id') THEN
        CREATE INDEX idx_request_client_id ON request (client_id);             -- Índice en client_id para búsquedas rápidas por cliente.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_musician_id') THEN
        CREATE INDEX idx_request_musician_id ON request (musician_id);         -- Índice en musician_id para búsquedas rápidas por músico asignado.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_status') THEN
        CREATE INDEX idx_request_status ON request (status);                   -- Índice en status para filtrar solicitudes por su estado.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_creation_date') THEN
        CREATE INDEX idx_request_creation_date ON request (created_at);        -- Índice en created_at para ordenar y filtrar por fecha de creación.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_event_date') THEN
        CREATE INDEX idx_request_event_date ON request (event_date);           -- Índice en event_date para búsquedas y ordenamientos por fecha del evento.
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_offer_request_id') THEN
        CREATE INDEX idx_offer_request_id ON offer (request_id);         -- Índice en request_id para búsquedas rápidas de ofertas por solicitud.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_offer_musician_id') THEN
        CREATE INDEX idx_offer_musician_id ON offer (musician_id);       -- Índice en musician_id para búsquedas rápidas de ofertas por músico.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_offer_status') THEN
        CREATE INDEX idx_offer_status ON offer (status);                 -- Índice en status para filtrar ofertas por su estado.
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_history_request_id') THEN
        CREATE INDEX idx_request_history_request_id ON request_history (request_id); -- Índice en request_id para búsquedas rápidas de historial por solicitud.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_history_user_id') THEN
        CREATE INDEX idx_request_history_user_id ON request_history (user_id);         -- Índice en user_id para búsquedas rápidas de historial por usuario.
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_request_history_change_date') THEN
        CREATE INDEX idx_request_history_change_date ON request_history (change_date); -- Índice en change_date para ordenar y filtrar el historial por fecha de cambio.
    END IF;
END
$$;

-- ==============================
-- FUNCIÓN PARA ACTUALIZAR LA FECHA DE MODIFICACIÓN
-- ==============================
-- Esta función se encarga de actualizar automáticamente la columna 'updated_at' de una tabla
-- con la fecha y hora actual cada vez que se modifica una fila.
CREATE OR REPLACE FUNCTION update_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW(); -- Establece la columna 'updated_at' del nuevo registro a la fecha y hora actual.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- TRIGGER PARA LA ACTUALIZACIÓN DE FECHA
-- ==============================
-- Este trigger se activa ANTES de cada operación de ACTUALIZACIÓN en la tabla 'request'.
-- Ejecuta la función 'update_request_timestamp()' para asegurar que 'updated_at' se actualice.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_request_timestamp') THEN
        CREATE TRIGGER trg_update_request_timestamp
        BEFORE UPDATE ON request
        FOR EACH ROW
        EXECUTE FUNCTION update_request_timestamp();
    END IF;
END
$$;


select * from request;

select * from users;

-- ==============================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS) PARA LA TABLA 'offer'
-- ==============================

-- Política para permitir a los músicos crear ofertas.
-- Un músico solo puede insertar una oferta si el 'musician_id' de la oferta coincide con su propio 'uid' (identificador de usuario autenticado).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create offer' AND tablename = 'offer') THEN
        DROP POLICY "Musicians can create offer" ON offer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create offer' AND tablename = 'offer') THEN
        CREATE POLICY "Musicians can create offer" ON offer FOR INSERT WITH CHECK (musician_id = auth.uid());
    END IF;
END
$$;

-- Política para permitir a los músicos ver sus propias ofertas.
-- Un músico solo puede seleccionar ofertas donde el 'musician_id' de la oferta coincida con su propio 'uid'.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can view their own offer' AND tablename = 'offer') THEN
        DROP POLICY "Musicians can view their own offer" ON offer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can view their own offer' AND tablename = 'offer') THEN
        CREATE POLICY "Musicians can view their own offer" ON offer FOR SELECT USING (musician_id = auth.uid());
    END IF;
END
$$;

-- Política para permitir a los clientes ver las ofertas relacionadas con sus solicitudes.
-- Un cliente puede seleccionar ofertas si el 'request_id' de la oferta está asociado a una solicitud
-- donde el 'client_id' de esa solicitud coincide con el 'uid' del cliente autenticado.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can view offer for their requests' AND tablename = 'offer') THEN
        DROP POLICY "Clients can view offer for their requests" ON offer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Clients can view offer for their requests' AND tablename = 'offer') THEN
        CREATE POLICY "Clients can view offer for their requests" ON offer FOR SELECT USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid()));
    END IF;
END
$$;

-- Política para permitir a los músicos actualizar sus propias ofertas.
-- Un músico solo puede actualizar ofertas donde el 'musician_id' de la oferta coincida con su propio 'uid'.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can update their own offer' AND tablename = 'offer') THEN
        DROP POLICY "Musicians can update their own offer" ON offer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can update their own offer' AND tablename = 'offer') THEN
        CREATE POLICY "Musicians can update their own offer" ON offer FOR UPDATE USING (musician_id = auth.uid());
    END IF;
END
$$;

-- Política para permitir a los músicos eliminar sus propias ofertas.
-- Un músico solo puede eliminar ofertas donde el 'musician_id' de la oferta coincida con su propio 'uid'.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can delete their own offer' AND tablename = 'offer') THEN
        DROP POLICY "Musicians can delete their own offer" ON offer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can delete their own offer' AND tablename = 'offer') THEN
        CREATE POLICY "Musicians can delete their own offer" ON offer FOR DELETE USING (musician_id = auth.uid());
    END IF;
END
$$;