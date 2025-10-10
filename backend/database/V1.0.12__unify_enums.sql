-- ==============================
-- Migration: Unify ENUMs
-- ==============================

-- Unify user_role ENUM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        ALTER TYPE user_role RENAME TO old_user_role;
    END IF;
    CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');

    -- Temporarily drop RLS policies that depend on the 'role' column
    DROP POLICY IF EXISTS "Admins can manage all availability" ON musician_availability;
    DROP POLICY IF EXISTS "Admins can view all balances" ON user_balances;
    DROP POLICY IF EXISTS "Admins can manage transactions" ON user_transactions;
    DROP POLICY IF EXISTS "Admins can manage admin actions" ON admin_actions;
    DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
    DROP POLICY IF EXISTS "Musicians can create offers" ON offer;

    -- Update columns to use the new user_role ENUM
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'users' AND relkind = 'r') THEN
        -- Remove default constraint before altering type
        ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
        -- Alter column type
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::text::user_role;
        -- Add default constraint back, explicitly cast to new type
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'leader'::user_role;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'request_history' AND relkind = 'r') THEN
        ALTER TABLE request_history ALTER COLUMN user_type TYPE user_role USING user_type::text::user_role;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'old_user_role') THEN
        DROP TYPE old_user_role;
    END IF;

    -- Re-create RLS policies that depend on the 'role' column
    CREATE POLICY "Admins can manage all availability"
      ON musician_availability FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins can view all balances"
      ON user_balances FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins can manage transactions"
      ON user_transactions FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins can manage admin actions"
      ON admin_actions FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins can manage pricing config"
      ON pricing_config FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );

    CREATE POLICY "Musicians can create offer"
      ON offer FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'musician'
        )
      );
END
$$;

-- Unify request_status ENUM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        ALTER TYPE request_status RENAME TO old_request_status;
    END IF;
    CREATE TYPE request_status AS ENUM (
      'CREATED',
      'WAITING_OFFER',
      'OFFER_RECEIVED',
      'OFFER_ACCEPTED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELED_BY_CLIENT',
      'CANCELED_BY_MUSICIAN',
      'REOPENED',
      'REJECTED',
      'EXPIRED',
      'IN_DISPUTE',
      'ARCHIVED'
    );

    -- Temporarily drop RLS policies that depend on the 'request_status' ENUM
    DROP POLICY IF EXISTS "Allow client to manage own requests" ON request;
    DROP POLICY IF EXISTS "Allow access to own request history" ON request_history;

    -- Drop materialized view that depends on request.status
    DROP MATERIALIZED VIEW IF EXISTS request_overview;

    -- Drop index that depends on request.status
    DROP INDEX IF EXISTS idx_request_status;

    -- Update columns to use the new request_status ENUM
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'request' AND relkind = 'r') THEN
        -- Remove default constraint before altering type
        ALTER TABLE request ALTER COLUMN status DROP DEFAULT;
        -- Alter column type
        ALTER TABLE request ALTER COLUMN status TYPE request_status USING status::text::request_status;
        -- Add default constraint back, explicitly cast to new type
        ALTER TABLE request ALTER COLUMN status SET DEFAULT 'CREATED'::request_status;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'request_history' AND relkind = 'r') THEN
        ALTER TABLE request_history ALTER COLUMN old_status TYPE request_status USING old_status::text::request_status;
        ALTER TABLE request_history ALTER COLUMN new_status TYPE request_status USING new_status::text::request_status;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'old_request_status') THEN
        DROP TYPE old_request_status;
    END IF;

    -- Re-create RLS policies that depend on the 'request_status' ENUM
    CREATE POLICY "Allow client to manage own requests" ON request
        FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

    CREATE POLICY "Allow access to own request history" ON request_history
        FOR SELECT USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid() OR musician_id = auth.uid()));

    -- Recreate materialized view
    CREATE MATERIALIZED VIEW IF NOT EXISTS request_overview AS
    SELECT
        r.id AS request_id,
        r.client_id,
        u.name AS leader_name,
        u.email AS leader_email,
        et.name AS event_type_name,
        r.event_date,
        r.start_time,
        r.end_time,
        r.duration,
        r.location,
        r.total_price,
        r.status,
        r.created_at,
        r.updated_at
    FROM
        request r
    JOIN
        users u ON r.client_id = u.user_id
    JOIN
        event_types et ON r.event_type_id = et.id;

    COMMENT ON MATERIALIZED VIEW request_overview IS 'Vista materializada que proporciona un resumen rápido de las solicitudes, incluyendo información del líder y tipo de evento.';

    -- Opcional: Crear un índice en la vista materializada para búsquedas más rápidas
    CREATE INDEX IF NOT EXISTS idx_request_overview_request_id ON request_overview(request_id);
    CREATE INDEX IF NOT EXISTS idx_request_overview_client_id ON request_overview(client_id);
    CREATE INDEX IF NOT EXISTS idx_request_overview_event_date ON request_overview(event_date);

    -- Recreate index that depends on request.status
    CREATE INDEX IF NOT EXISTS idx_request_status ON request (status);
END
$$;

-- Unify offer_status ENUM
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        ALTER TYPE offer_status RENAME TO old_offer_status;
    END IF;
    CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'old_offer_status') THEN
        DROP TYPE old_offer_status;
    END IF;
END
$$;

-- Ensure transaction_type ENUM exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
    END IF;
END
$$;

-- Ensure transaction_status ENUM exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    END IF;
END
$$;

-- Ensure notification_type ENUM exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('SYSTEM', 'MESSAGE', 'ALERT');
    END IF;
END
$$;

-- Drop trigger that depends on request.status
DROP TRIGGER IF EXISTS trg_notify_event_status_change ON request;

-- Recreate trigger that depends on request.status
CREATE TRIGGER trg_notify_event_status_change AFTER UPDATE ON request FOR EACH ROW WHEN (NEW.status = 'IN_PROGRESS' AND OLD.status IS DISTINCT FROM 'IN_PROGRESS') EXECUTE FUNCTION notify_event_status_change();