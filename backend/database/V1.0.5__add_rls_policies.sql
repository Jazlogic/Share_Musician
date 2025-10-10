-- ==============================
-- Migration: Add RLS policies (corregido)
-- ==============================

-- 1️⃣ Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- 2️⃣ Políticas por tabla

-- USERS
DROP POLICY IF EXISTS "Users can read own data" ON users;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own data' AND tablename = 'users') THEN
    CREATE POLICY "Users can read own data"
      ON users FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Users can update own data" ON users;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own data' AND tablename = 'users') THEN
    CREATE POLICY "Users can update own data"
      ON users FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Anyone can register" ON users;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can register' AND tablename = 'users') THEN
    CREATE POLICY "Anyone can register"
      ON users FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- USER PASSWORDS
DROP POLICY IF EXISTS "Users can read own user_passwords" ON user_passwords;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own user_passwords' AND tablename = 'user_passwords') THEN
    CREATE POLICY "Users can read own user_passwords"
      ON user_passwords FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;
-- Users can insert own password
DROP POLICY IF EXISTS "Users can insert own password" ON user_passwords;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own password' AND tablename = 'user_passwords') THEN
    CREATE POLICY "Users can insert own password"
      ON user_passwords FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
-- Users can update own password
DROP POLICY IF EXISTS "Users can update own password" ON user_passwords;
CREATE POLICY "Users can update own password"
  ON user_passwords
  FOR UPDATE
  USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);
-- Users can delete own password
DROP POLICY IF EXISTS "Users can delete own password" ON user_passwords;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own password' AND tablename = 'user_passwords') THEN
    CREATE POLICY "Users can delete own password"
      ON user_passwords FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- USER INSTRUMENTS
DROP POLICY IF EXISTS "Users can manage own instruments" ON user_instruments;
CREATE POLICY "Users can manage own instruments"
  ON user_instruments FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own user_instruments" ON user_instruments;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own user_instruments' AND tablename = 'user_instruments') THEN
    CREATE POLICY "Users can read own user_instruments"
      ON user_instruments FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Public can read user instruments" ON user_instruments;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read user instruments' AND tablename = 'user_instruments') THEN
    CREATE POLICY "Public can read user instruments"
      ON user_instruments FOR SELECT
      USING (true);
  END IF;
END
$$;

-- REQUEST
DROP POLICY IF EXISTS "Public can read public request" ON request;
CREATE POLICY "Public can read public request"
  ON request FOR SELECT
  USING (status IN ('CREATED', 'OFFER_RECEIVED'));

DROP POLICY IF EXISTS "Leaders can manage own request" ON request;
CREATE POLICY "Leaders can manage own request"
  ON request FOR ALL
  USING (auth.uid() = client_id);

-- Musicians can create request
DROP POLICY IF EXISTS "Musicians can create request" ON request;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create request' AND tablename = 'request') THEN
    CREATE POLICY "Musicians can create request"
      ON request FOR INSERT
      WITH CHECK (auth.uid() = musician_id);
  END IF;
END
$$;

-- OFFER
DROP POLICY IF EXISTS "Musicians can read own offer" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can read own offer' AND tablename = 'offer') THEN
    CREATE POLICY "Musicians can read own offer"
      ON offer FOR SELECT
      USING (musician_id = auth.uid());
  END IF;
END
$$;

DROP POLICY IF EXISTS "Leaders can read offers for their request" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Leaders can read offers for their request' AND tablename = 'offer') THEN
    CREATE POLICY "Leaders can read offers for their request"
      ON offer FOR SELECT
      USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid()));
  END IF;
END
$$;

DROP POLICY IF EXISTS "Musicians can create offers" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create offers' AND tablename = 'offer') THEN
    CREATE POLICY "Musicians can create offers"
      ON offer FOR INSERT
      WITH CHECK (musician_id = auth.uid());
  END IF;
END
$$;

DROP POLICY IF EXISTS "Musicians can update own offers" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can update own offers' AND tablename = 'offer') THEN
    CREATE POLICY "Musicians can update own offers"
      ON offer FOR UPDATE
      USING (musician_id = auth.uid());
  END IF;
END
$$;

DROP POLICY IF EXISTS "Leaders can update offers for their request" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Leaders can update offers for their request' AND tablename = 'offer') THEN
    CREATE POLICY "Leaders can update offers for their request"
      ON offer FOR UPDATE
      USING (request_id IN (SELECT id FROM request WHERE client_id = auth.uid()));
  END IF;
END
$$;

DROP POLICY IF EXISTS "Musicians can delete own offers" ON offer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can delete own offers' AND tablename = 'offer') THEN
    CREATE POLICY "Musicians can delete own offers"
      ON offer FOR DELETE
      USING (musician_id = auth.uid());
  END IF;
END
$$;

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Users can read own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "Users can update own notifications"
      ON notifications FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert notifications' AND tablename = 'notifications') THEN
    CREATE POLICY "System can insert notifications"
      ON notifications FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- MUSICIAN AVAILABILITY
DROP POLICY IF EXISTS "Musicians can manage their own availability" ON musician_availability;
CREATE POLICY "Musicians can manage their own availability"
  ON musician_availability FOR ALL
  USING (auth.uid()::uuid = musician_id);

DROP POLICY IF EXISTS "Admins can manage all availability" ON musician_availability;
CREATE POLICY "Admins can manage all availability"
  ON musician_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Musicians can read own availability" ON musician_availability;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can read own availability' AND tablename = 'musician_availability') THEN
    CREATE POLICY "Musicians can read own availability"
      ON musician_availability FOR SELECT
      USING (auth.uid() = musician_id);
  END IF;
END
$$;

-- USER BALANCES
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own balance' AND tablename = 'user_balances') THEN
    CREATE POLICY "Users can view own balance"
      ON user_balances FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Admins can view all balances" ON user_balances;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all balances' AND tablename = 'user_balances') THEN
    CREATE POLICY "Admins can view all balances"
      ON user_balances FOR SELECT
      USING (
         EXISTS (
           SELECT 1 FROM users
           WHERE id = auth.uid() AND role = 'admin'
         )
      );
  END IF;
END
$$;

-- USER TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'user_transactions') THEN
    CREATE POLICY "Users can view own transactions"
      ON user_transactions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Admins can manage transactions" ON user_transactions;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage transactions' AND tablename = 'user_transactions') THEN
    CREATE POLICY "Admins can manage transactions"
      ON user_transactions FOR ALL
      USING (
         EXISTS (
           SELECT 1 FROM users
           WHERE id = auth.uid() AND role = 'admin'
         )
      );
  END IF;
END
$$;

-- ADMIN ACTIONS
DROP POLICY IF EXISTS "Admins can manage admin actions" ON admin_actions;
CREATE POLICY "Admins can manage admin actions"
  ON admin_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view admin actions' AND tablename = 'admin_actions') THEN
    CREATE POLICY "Admins can view admin actions"
      ON admin_actions FOR SELECT
      USING (auth.role() = 'admin');
  END IF;
END
$$;

-- PRICING CONFIG
DROP POLICY IF EXISTS "Everyone can read active pricing config" ON pricing_config;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Everyone can read active pricing config' AND tablename = 'pricing_config') THEN
    CREATE POLICY "Everyone can read active pricing config"
      ON pricing_config FOR SELECT
      USING (is_active = TRUE);
  END IF;
END
$$;

DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage pricing config' AND tablename = 'pricing_config') THEN
    CREATE POLICY "Admins can manage pricing config"
      ON pricing_config FOR ALL
      USING (
         EXISTS (
           SELECT 1 FROM users
           WHERE id = auth.uid() AND role = 'admin'
         )
      );
  END IF;
END
$$;