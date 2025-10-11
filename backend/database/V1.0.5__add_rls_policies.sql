-- ==============================
-- Migration: Add RLS policies (corregido)
-- Descripción: Habilita la Seguridad a Nivel de Fila (RLS) y define políticas de acceso detalladas
-- para todas las tablas críticas de la aplicación. Las políticas garantizan que los usuarios solo
-- accedan a los datos que les corresponden, basados en su rol y contexto de autenticación.
-- ==============================

-- 1 Habilitar RLS en todas las tablas
-- Explicación: RLS restringe el acceso a filas específicas basado en reglas definidas.
-- Se habilita en tablas sensibles para proteger la privacidad y la integridad de los datos.
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

-- 2 Políticas por tabla

-- USERS
-- Política: "Users can read own data"
-- Propósito: Permitir a los usuarios acceder a sus propios datos personales.
-- Lógica: Compara el ID del usuario autenticado (auth.uid()) con el user_id de la fila.
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

-- Política para que los usuarios puedan actualizar sus propios datos.
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

-- Política para permitir que cualquier persona se registre.
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
-- Política: "Users can read own user_passwords"
-- Propósito: Garantizar que los usuarios solo vean sus propias contraseñas (hash).
-- Importancia: Evita que los usuarios accedan a credenciales de otros usuarios.
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
-- Política para que los usuarios puedan insertar sus propias contraseñas.
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
-- Política para que los usuarios puedan actualizar sus propias contraseñas.
-- Users can update own password
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own password' AND tablename = 'user_passwords') THEN
    DROP POLICY "Users can update own password" ON user_passwords;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own password' AND tablename = 'user_passwords') THEN
    CREATE POLICY "Users can update own password"
      ON user_passwords
      FOR UPDATE
      USING (auth.uid()::uuid = user_id)
      WITH CHECK (auth.uid()::uuid = user_id);
  END IF;
END
$$;
-- Política para que los usuarios puedan eliminar sus propias contraseñas.
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
-- Política para que los usuarios puedan gestionar sus propios instrumentos (CRUD).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own instruments' AND tablename = 'user_instruments') THEN
    DROP POLICY "Users can manage own instruments" ON user_instruments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own instruments' AND tablename = 'user_instruments') THEN
    CREATE POLICY "Users can manage own instruments"
      ON user_instruments FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Política para que los usuarios puedan leer sus propios instrumentos.
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

-- Política para que el público pueda leer los instrumentos de los usuarios.
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
-- Política para que el público pueda leer solicitudes públicas.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read public request' AND tablename = 'request') THEN
    DROP POLICY "Public can read public request" ON request;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read public request' AND tablename = 'request') THEN
    CREATE POLICY "Public can read public request"
      ON request FOR SELECT
      USING (status IN ('CREATED', 'OFFER_RECEIVED'));
  END IF;
END
$$;

-- Política para que los líderes puedan gestionar sus propias solicitudes (CRUD).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Leaders can manage own request' AND tablename = 'request') THEN
    DROP POLICY "Leaders can manage own request" ON request;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Leaders can manage own request' AND tablename = 'request') THEN
    CREATE POLICY "Leaders can manage own request"
      ON request FOR ALL
      USING (auth.uid() = client_id);
  END IF;
END
$$;

-- Política para que los músicos puedan crear solicitudes.
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
-- Política para que los músicos puedan leer sus propias ofertas.
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

-- Política para que los líderes puedan leer ofertas para sus solicitudes.
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

-- Política para que los músicos puedan crear ofertas.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create offers' AND tablename = 'offer') THEN
    DROP POLICY "Musicians can create offers" ON offer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can create offers' AND tablename = 'offer') THEN
    CREATE POLICY "Musicians can create offers"
      ON offer FOR INSERT
      WITH CHECK (musician_id = auth.uid());
  END IF;
END
$$;

-- Política para que los músicos puedan actualizar sus propias ofertas.
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

-- Política para que los líderes puedan actualizar ofertas para sus solicitudes.
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

-- Política para que los músicos puedan eliminar sus propias ofertas.
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
-- Política para que los usuarios puedan leer sus propias notificaciones.
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

-- Política para que los usuarios puedan actualizar sus propias notificaciones.
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

-- Política para que el sistema pueda insertar notificaciones.
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
-- Política para que los músicos puedan gestionar su propia disponibilidad (CRUD).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can manage their own availability' AND tablename = 'musician_availability') THEN
    DROP POLICY "Musicians can manage their own availability" ON musician_availability;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Musicians can manage their own availability' AND tablename = 'musician_availability') THEN
    CREATE POLICY "Musicians can manage their own availability"
      ON musician_availability FOR ALL
      USING (auth.uid()::uuid = musician_id);
  END IF;
END
$$;

-- Política para que los administradores puedan gestionar toda la disponibilidad de los músicos (CRUD).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all availability' AND tablename = 'musician_availability') THEN
    DROP POLICY "Admins can manage all availability" ON musician_availability;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all availability' AND tablename = 'musician_availability') THEN
    CREATE POLICY "Admins can manage all availability"
      ON musician_availability FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );
  END IF;
END
$$;

-- Política para que los músicos puedan leer su propia disponibilidad.
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
-- Política para que los usuarios puedan ver su propio balance.
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

-- Política para que los administradores puedan ver todos los balances.
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
-- Política para que los usuarios puedan ver sus propias transacciones.
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

-- Política para que los administradores puedan gestionar transacciones (CRUD).
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
-- Política para que los administradores puedan gestionar acciones de administración (CRUD).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage admin actions' AND tablename = 'admin_actions') THEN
    DROP POLICY "Admins can manage admin actions" ON admin_actions;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage admin actions' AND tablename = 'admin_actions') THEN
    CREATE POLICY "Admins can manage admin actions"
      ON admin_actions FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.user_id = auth.uid()::uuid
          AND users.role = 'admin'
        )
      );
  END IF;
END
$$;

-- Política para que los administradores puedan ver acciones de administración.
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
-- Política para que todos puedan leer la configuración de precios activa.
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

-- Política para que los administradores puedan gestionar la configuración de precios (CRUD).
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