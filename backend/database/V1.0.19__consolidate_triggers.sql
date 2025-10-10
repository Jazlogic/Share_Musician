-- ==============================
-- Migration: Consolidate Triggers
-- ==============================

-- Drop old trigger if it exists
DROP TRIGGER IF EXISTS trg_update_request_timestamp ON request;

-- Create new trigger for the unified 'request' table
CREATE TRIGGER trg_update_request_timestamp
BEFORE UPDATE ON request
FOR EACH ROW
EXECUTE FUNCTION update_request_timestamp();