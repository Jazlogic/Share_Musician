-- ==============================
-- Migration: Consolidate RLS Policies
-- ==============================

-- Enable Row Level Security (RLS) for unified tables
ALTER TABLE request ENABLE ROW LEVEL SECURITY;
-- RLS for offer table
ALTER TABLE offer ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy for 'request' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow client to manage own requests' AND tablename = 'request') THEN
        CREATE POLICY "Allow client to manage own requests" ON request
            FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
    END IF;
END
$$;

-- RLS Policy for 'offer' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow musician to manage own offers' AND tablename = 'offer') THEN
        CREATE POLICY "Musicians can create offer" ON offer FOR INSERT WITH CHECK (musician_id = auth.uid());
        CREATE POLICY "Musicians can view their own offer" ON offer FOR SELECT USING (musician_id = auth.uid());
        CREATE POLICY "Clients can view offers for their requests" ON offer FOR SELECT USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid()));
        CREATE POLICY "Musicians can update their own offer" ON offer FOR UPDATE USING (musician_id = auth.uid());
        CREATE POLICY "Musicians can delete their own offer" ON offer FOR DELETE USING (musician_id = auth.uid());
    END IF;
END
$$;

-- RLS Policy for 'request_history' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow access to own request history' AND tablename = 'request_history') THEN
        CREATE POLICY "Allow access to own request history" ON request_history
            FOR SELECT USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid() OR musician_id = auth.uid()));
    END IF;
END
$$;