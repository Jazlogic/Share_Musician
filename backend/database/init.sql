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
    verification_token VARCHAR(255) UNIQUE
);
insert into  users (name, email, phone, role) values ('Jefry Agustin astacio Sanchez','astaciosanchezjefryagustin@gmail.com','829-441-9998','admin');
select * from users;

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


select * from users;