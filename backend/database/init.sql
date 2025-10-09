-- Drop everything and start fresh
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Re-enable basic extensions if needed
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for secure password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Your new schema will go here

-- Tabla para Iglesias
CREATE TABLE IF NOT EXISTS churches (
    churches_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
select * from churches;

-- Tabla para Usuarios (normalizada)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'leader' CHECK (role IN ('leader', 'musician', 'admin')),
    active_role VARCHAR(20) DEFAULT 'musician' CHECK (active_role IN ('leader', 'musician')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    church_id UUID REFERENCES churches(churches_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) UNIQUE,
    profileKey VARCHAR(255) DEFAULT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires_at TIMESTAMP WITH TIME ZONE,
    verification_token_expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE;
select * from users;

delete from users where email = 'astaciosanchezjefryagustin@gmail.com';

-- Tabla para el historial de imágenes de perfil
CREATE TABLE IF NOT EXISTS user_profile_image_history (
    user_profile_image_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    profilekey TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);
select * from user_profile_image_history;

drop table user_profile_image_history;

-- User passwords table (separate for security)
CREATE TABLE IF NOT EXISTS user_passwords (
    password_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Users can read their own password
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own password' AND tablename = 'user_passwords') THEN
        CREATE POLICY "Users can read own password" ON user_passwords
            FOR SELECT USING (auth.uid()::text = user_id::text);
    END IF;
END
$$;

-- Tabla para verificaciones de correo electrónico
CREATE TABLE IF NOT EXISTS email_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    pin VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '10 minutes',
    verified BOOLEAN DEFAULT FALSE
);

ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all for email_verifications' AND tablename = 'email_verifications') THEN
        CREATE POLICY "Allow all for email_verifications" ON email_verifications USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- Tabla para Publicaciones (Posts)
CREATE TABLE IF NOT EXISTS posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT,
    postKey VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

select * from posts;

-- Tabla para Solicitudes de Música (Requests)
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


select * from request;

select * from users;