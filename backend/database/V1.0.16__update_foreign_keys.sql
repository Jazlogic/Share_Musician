-- ==============================
-- Migration: Update Foreign Keys
-- ==============================

-- Update foreign key in request_instruments to point to the unified 'request' table
ALTER TABLE request_instruments DROP CONSTRAINT IF EXISTS fk_request_instruments_request;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_request_instruments_request' AND table_name = 'request_instruments') THEN
    ALTER TABLE request_instruments ADD CONSTRAINT fk_request_instruments_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Update foreign key in offer to point to the unified 'request' table
ALTER TABLE offer DROP CONSTRAINT IF EXISTS fk_offer_request;
ALTER TABLE offer ADD CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;

-- Update foreign key in request_history to point to the unified 'request' table
ALTER TABLE request_history DROP CONSTRAINT IF EXISTS fk_history_request;
ALTER TABLE request_history ADD CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;