-- ==============================
-- Migration: Consolidate Functions
-- ==============================

-- Create or replace the update_request_timestamp() function for the unified 'request' table
CREATE OR REPLACE FUNCTION update_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;