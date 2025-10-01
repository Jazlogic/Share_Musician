CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    role VARCHAR(20) NOT NULL CHECK (role IN ('leader', 'musician', 'admin')),
    active_role VARCHAR(20) DEFAULT 'musician' CHECK (active_role IN ('leader', 'musician')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected')),
    church_id UUID REFERENCES churches(churches_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable Row Level Security (RLS)
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;

-- Users can read their own password
CREATE POLICY "Users can read own password" ON user_passwords
    FOR SELECT USING (auth.uid()::text = user_id::text);

select * from churches;
select * from users;
select * from user_passwords;
