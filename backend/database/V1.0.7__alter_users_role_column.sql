-- ==============================
-- Migration: Alter users.role column to use user_role ENUM
-- ==============================

-- Esta migración tiene como objetivo modificar la columna 'role' de la tabla 'users'
-- para que utilice el nuevo tipo ENUM 'user_role', proporcionando una tipificación más estricta
-- y validación de roles de usuario.

-- Eliminar temporalmente las políticas RLS que dependen de la columna 'role'.
-- Esto es necesario para poder modificar la estructura de la tabla 'users' sin conflictos.
DROP POLICY IF EXISTS "Admins can manage all availability" ON musician_availability;
DROP POLICY IF EXISTS "Admins can view all balances" ON user_balances;
DROP POLICY IF EXISTS "Admins can manage transactions" ON user_transactions;
DROP POLICY IF EXISTS "Admins can manage admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can manage pricing config" ON pricing_config;
DROP POLICY IF EXISTS "Musicians can create offer" ON offer;

-- Paso 1: Renombrar la columna 'role' existente a 'old_role'.
-- Esto preserva los datos existentes mientras se prepara la adición de la nueva columna.
ALTER TABLE users RENAME COLUMN role TO old_role;

-- Paso 2: Añadir la nueva columna 'role' con el tipo ENUM 'user_role'.
-- Se establece un valor predeterminado de 'leader' y se marca como NOT NULL.
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'leader';

-- Paso 3: Actualizar la nueva columna 'role' con los valores de la columna 'old_role'.
-- Se realiza un casting explícito a 'user_role' para asegurar la compatibilidad de tipos.
UPDATE users SET role = old_role::user_role;

-- Paso 4: Eliminar la columna 'old_role' que ya no es necesaria.
ALTER TABLE users DROP COLUMN old_role;

-- Paso 5: Asegurar que la nueva columna 'role' mantenga la restricción NOT NULL.
-- Esto es crucial para la integridad de los datos.
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Recrear las políticas RLS que dependen de la columna 'role'.
-- Estas políticas se definen para asegurar que solo los administradores puedan gestionar
-- la disponibilidad de los músicos, ver balances, gestionar transacciones, etc.

-- Política RLS: Los administradores pueden gestionar toda la disponibilidad de los músicos.
CREATE POLICY "Admins can manage all availability"
  ON musician_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- Política RLS: Los administradores pueden ver todos los balances de los usuarios.
CREATE POLICY "Admins can view all balances"
  ON user_balances FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- Política RLS: Los administradores pueden gestionar las transacciones de los usuarios.
CREATE POLICY "Admins can manage transactions"
  ON user_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- Política RLS: Los administradores pueden gestionar las acciones de administración.
CREATE POLICY "Admins can manage admin actions"
  ON admin_actions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- Política RLS: Los administradores pueden gestionar la configuración de precios.
CREATE POLICY "Admins can manage pricing config"
  ON pricing_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.user_id = auth.uid()::uuid
      AND users.role = 'admin'
    )
  );

-- Añadir políticas RLS para los nuevos roles.
-- Política RLS: Los músicos pueden crear ofertas para solicitudes.
CREATE POLICY "Musicians can create offer" ON offer FOR INSERT WITH CHECK (musician_id = auth.uid());