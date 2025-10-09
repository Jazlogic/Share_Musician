-- ==============================
-- Migration: Alter users.role column to use user_role ENUM
-- ==============================

-- Temporarily drop RLS policies that depend on the 'role' column
DROP POLICY IF EXISTS "Admins can manage all availability" ON musician_availability;
DROP POLICY IF EXISTS "Admins can view all balances" ON user_balances;
DROP POLICY IF EXISTS "Admins can manage transactions" ON user_transactions;
DROP POLICY IF EXISTS "Admins can manage admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Musicians can create offers" ON offers;

-- Step 1: Rename the existing 'role' column
ALTER TABLE users RENAME COLUMN role TO old_role;

-- Step 2: Add the new 'role' column with the ENUM type
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'leader';

-- Step 3: Update the new 'role' column with values from the old 'role' column
UPDATE users SET role = old_role::user_role;

-- Step 4: Drop the old 'role' column
ALTER TABLE users DROP COLUMN old_role;

-- Step 5: Add the NOT NULL constraint back to the new 'role' column (if it was temporarily removed)
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

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

CREATE POLICY "Musicians can create offers"
  ON offers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'musician'
    )
  );