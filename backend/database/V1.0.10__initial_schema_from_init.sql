-- Tabla para Iglesias
CREATE TABLE IF NOT EXISTS churches (
    churches_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Tabla para el historial de imágenes de perfil
CREATE TABLE IF NOT EXISTS user_profile_image_history (
    user_profile_image_history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    profilekey TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

-- User passwords table (separate for security)
CREATE TABLE IF NOT EXISTS user_passwords (
    password_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_passwords_user_id ON user_passwords(user_id);

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

-- Tabla para Publicaciones (Posts)
CREATE TABLE IF NOT EXISTS posts (
    post_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT,
    postKey VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- TABLA PRINCIPAL: SOLICITUD
-- ==============================
CREATE TABLE IF NOT EXISTS request (
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
CREATE TABLE IF NOT EXISTS offer (
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
CREATE TABLE IF NOT EXISTS request_history (
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
CREATE TABLE IF NOT EXISTS musician_metrics (
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

CREATE TABLE IF NOT EXISTS client_metrics (
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