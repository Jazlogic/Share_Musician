-- ==============================
-- Migration: Add RLS policies (corregido)
-- ==============================

-- 1️⃣ Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- 2️⃣ Políticas por tabla

-- USERS
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can register" ON users;
CREATE POLICY "Anyone can register"
  ON users FOR INSERT
  WITH CHECK (true);

-- USER PASSWORDS
DROP POLICY IF EXISTS "Users can read own password" ON user_passwords;
CREATE POLICY "Users can read own password"
  ON user_passwords FOR SELECT
  USING (auth.uid()::uuid = user_id);
-- Users can insert own password
DROP POLICY IF EXISTS "Users can insert own password" ON user_passwords;
CREATE POLICY "Users can insert own password"
  ON user_passwords
  FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);
-- Users can update own password
DROP POLICY IF EXISTS "Users can update own password" ON user_passwords;
CREATE POLICY "Users can update own password"
  ON user_passwords
  FOR UPDATE
  USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);
-- Users can delete own password
DROP POLICY IF EXISTS "Users can delete own password" ON user_passwords;
CREATE POLICY "Users can delete own password"
  ON user_passwords
  FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- USER INSTRUMENTS
DROP POLICY IF EXISTS "Users can manage own instruments" ON user_instruments;
CREATE POLICY "Users can manage own instruments"
  ON user_instruments FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public can read user instruments" ON user_instruments;
CREATE POLICY "Public can read user instruments"
  ON user_instruments FOR SELECT
  USING (true);

-- REQUESTS
DROP POLICY IF EXISTS "Public can read public requests" ON requests;
CREATE POLICY "Public can read public requests"
  ON requests FOR SELECT
  USING (status IN ('CREATED', 'OFFER_RECEIVED'));

DROP POLICY IF EXISTS "Leaders can manage own requests" ON requests;
CREATE POLICY "Leaders can manage own requests"
  ON requests FOR ALL
  USING (auth.uid() = leader_id);

-- OFFERS
DROP POLICY IF EXISTS "Musicians can read own offers" ON offers;
CREATE POLICY "Musicians can read own offers"
  ON offers FOR SELECT
  USING (auth.uid() = musician_id);

DROP POLICY IF EXISTS "Leaders can read offers for their requests" ON offers;
CREATE POLICY "Leaders can read offers for their requests"
  ON offers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = offers.request_id
      AND requests.leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Musicians can create offers" ON offers;
CREATE POLICY "Musicians can create offers"
  ON offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()
      AND users.role = 'musician'
    )
  );

DROP POLICY IF EXISTS "Musicians can update own offers" ON offers;
CREATE POLICY "Musicians can update own offers"
  ON offers FOR UPDATE
  USING (auth.uid() = musician_id);

DROP POLICY IF EXISTS "Leaders can update offers for their requests" ON offers;
CREATE POLICY "Leaders can update offers for their requests"
  ON offers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM requests
      WHERE requests.id = offers.request_id
      AND requests.leader_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Musicians can delete own offers" ON offers;
CREATE POLICY "Musicians can delete own offers"
  ON offers FOR DELETE
  USING (auth.uid() = musician_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

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

-- USER BALANCES
DROP POLICY IF EXISTS "Users can view own balance" ON user_balances;
CREATE POLICY "Users can view own balance"
  ON user_balances FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can view all balances" ON user_balances;
CREATE POLICY "Admins can view all balances"
  ON user_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- USER TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;
CREATE POLICY "Users can view own transactions"
  ON user_transactions FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can manage transactions" ON user_transactions;
CREATE POLICY "Admins can manage transactions"
  ON user_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

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

-- PRICING CONFIG
DROP POLICY IF EXISTS "Everyone can read active pricing config" ON pricing_config;
CREATE POLICY "Everyone can read active pricing config"
  ON pricing_config FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
CREATE POLICY "Admins can manage pricing config"
  ON pricing_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );