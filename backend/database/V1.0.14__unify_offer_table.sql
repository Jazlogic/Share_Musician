-- ==============================
-- Migration: Unify Offer Table
-- ==============================

-- 1. Rename 'offer' table to 'offer'
ALTER TABLE offers RENAME TO offer;

-- 2. Add missing columns from the unified schema to the 'offer' table
ALTER TABLE offer ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 3. Add foreign key constraints
ALTER TABLE offer ADD CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;
ALTER TABLE offer ADD CONSTRAINT fk_offer_musician FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE;