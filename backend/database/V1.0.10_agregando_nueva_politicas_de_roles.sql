-- ===============================================
-- MIGRACIÓN: Soporte Multirol para Usuarios
-- ===============================================

-- 1 Crear nueva tabla user_roles (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
    CREATE TABLE user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      role user_role NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (user_id, role)
    );
  END IF;
END
$$;

COMMENT ON TABLE user_roles IS 'Tabla intermedia que permite asignar múltiples roles a un mismo usuario. Ej: un músico también puede ser cliente.';


-- 2 Migrar roles actuales desde la tabla users (si tenía un campo role)
INSERT INTO user_roles (user_id, role)
SELECT user_id, role::user_role
FROM users
WHERE role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = users.user_id AND ur.role = users.role::user_role
  );

-- (Opcional) puedes mantener el campo "role" en users como "rol principal"
COMMENT ON COLUMN users.role IS 'Rol principal del usuario. Los roles adicionales se almacenan en user_roles.';


-- 3 Actualizar políticas RLS de la tabla "request"
-- -----------------------------------------------

-- Eliminar políticas viejas relacionadas con creación de solicitudes
DROP POLICY IF EXISTS "Musicians can create request" ON request;
DROP POLICY IF EXISTS "Leaders can manage own request" ON request;

--  Nueva política: permitir crear solicitudes a usuarios que tengan rol de client o musician
CREATE POLICY "Users with client or musician role can create requests"
  ON request FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('client', 'musician')
    )
  );

--  Nueva política: permitir gestionar sus propias solicitudes (lectura, edición, cancelación)
CREATE POLICY "Users can manage their own requests"
  ON request FOR ALL
  USING (auth.uid() = client_id);


-- 4 (Opcional) Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active requests' AND tablename = 'request') THEN
    CREATE POLICY "Public can read active requests"
      ON request FOR SELECT
      USING (status IN ('CREATED', 'OFFER_RECEIVED'));
  END IF;
END
$$;


-- 5 Ajuste opcional para endpoint de autenticación (si usas Supabase)
-- Permitir a nuevos usuarios registrar múltiples roles desde el inicio
COMMENT ON POLICY "Users with client or musician role can create requests" ON request IS
  'Permite a músicos y clientes crear solicitudes de contratación sin duplicar cuentas.';


-- ===============================================
-- FIN DE MIGRACIÓN
-- ===============================================
-- Resultado:
--  - Ahora los usuarios pueden tener múltiples roles (client, musician, leader, admin)
--  - Los músicos pueden crear solicitudes como clientes
--  - Se mantiene la seguridad de RLS
-- ===============================================

-- ============================ 2025-10-10  4:51 p.m.
-- Añadir la columna price_factor a la tabla instruments 
ALTER TABLE instruments
ADD COLUMN price_factor DECIMAL(5, 2) DEFAULT 1.0;

-- Añadir la columna price_factor a la tabla event_types
ALTER TABLE event_types
ADD COLUMN price_factor DECIMAL(5, 2) DEFAULT 1.0;
