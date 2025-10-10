-- ==============================
-- Migration: Unify Request History Table
-- ==============================

-- 1. Rename 'request_status_history' table to 'request_history'
ALTER TABLE request_status_history RENAME TO request_history;

-- 2. Add missing columns from the unified schema to the 'request_history' table
ALTER TABLE request_history ADD COLUMN IF NOT EXISTS user_type user_role;
ALTER TABLE request_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Add foreign key constraints
ALTER TABLE request_history ADD CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;
ALTER TABLE request_history ADD CONSTRAINT fk_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL;