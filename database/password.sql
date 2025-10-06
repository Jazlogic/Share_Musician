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