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
    profileKey VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userId UUID REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    imageKey VARCHAR(255),
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

select * from churches;
select * from users;
select * from posts;