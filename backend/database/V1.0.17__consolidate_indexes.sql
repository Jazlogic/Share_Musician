-- ==============================
-- Migration: Consolidate Indexes
-- ==============================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_request_client_id;
DROP INDEX IF EXISTS idx_request_musician_id;
DROP INDEX IF EXISTS idx_request_status;
DROP INDEX IF EXISTS idx_request_creation_date;
DROP INDEX IF EXISTS idx_request_event_date;

DROP INDEX IF EXISTS idx_offer_request_id;
DROP INDEX IF EXISTS idx_offer_musician_id;
DROP INDEX IF EXISTS idx_offer_status;

DROP INDEX IF EXISTS idx_request_history_request_id;
DROP INDEX IF EXISTS idx_request_history_user_id;
DROP INDEX IF EXISTS idx_request_history_change_date;

-- Create new indexes for the unified 'request' table
CREATE INDEX IF NOT EXISTS idx_request_client_id ON request (client_id);
CREATE INDEX IF NOT EXISTS idx_request_musician_id ON request (musician_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON request (status);
CREATE INDEX IF NOT EXISTS idx_request_creation_date ON request (created_at);
CREATE INDEX IF NOT EXISTS idx_request_event_date ON request (event_date);

-- Create new indexes for the unified 'offer' table
CREATE INDEX IF NOT EXISTS idx_offer_request_id ON offer (request_id);
CREATE INDEX IF NOT EXISTS idx_offer_musician_id ON offer (musician_id);
CREATE INDEX IF NOT EXISTS idx_offer_status ON offer (status);

-- Create new indexes for the unified 'request_history' table
CREATE INDEX IF NOT EXISTS idx_request_history_request_id ON request_history (request_id);
CREATE INDEX IF NOT EXISTS idx_request_history_changed_by ON request_history (changed_by);
CREATE INDEX IF NOT EXISTS idx_request_history_change_date ON request_history (change_date);