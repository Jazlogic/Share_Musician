-- ==============================
-- Migration: Unify Request Table
-- ==============================

-- 1. Rename 'requests' table to 'request'
ALTER TABLE requests RENAME TO request;

-- 2. Rename 'leader_id' column to 'client_id'
ALTER TABLE request RENAME COLUMN leader_id TO client_id;

-- 3. Add missing columns from the unified schema to the 'request' table
ALTER TABLE request ADD COLUMN IF NOT EXISTS title VARCHAR(255) NOT NULL DEFAULT 'Untitled Request';
ALTER TABLE request ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE request ADD COLUMN IF NOT EXISTS tip NUMERIC(12,2);
ALTER TABLE request ADD COLUMN IF NOT EXISTS updated_by UUID;
ALTER TABLE request ADD COLUMN IF NOT EXISTS client_rating INT CHECK (client_rating BETWEEN 1 AND 5);
ALTER TABLE request ADD COLUMN IF NOT EXISTS musician_rating INT CHECK (musician_rating BETWEEN 1 AND 5);
ALTER TABLE request ADD COLUMN IF NOT EXISTS client_comment TEXT;
ALTER TABLE request ADD COLUMN IF NOT EXISTS musician_comment TEXT;
ALTER TABLE request ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;

-- 4. Add foreign key constraints
ALTER TABLE request ADD CONSTRAINT fk_request_client FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE request ADD CONSTRAINT fk_request_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE request ADD CONSTRAINT fk_request_event_type FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE RESTRICT;
ALTER TABLE request ADD CONSTRAINT fk_request_reopened FOREIGN KEY (reopened_from_id) REFERENCES request(id) ON DELETE SET NULL;

-- 5. Update default value for title if it was null
UPDATE request SET title = 'Untitled Request' WHERE title IS NULL;

-- 6. Set NOT NULL constraint for title after updating existing null values
ALTER TABLE request ALTER COLUMN title SET NOT NULL;