-- ==============================
-- Migración: V1.0.12__fix_database_issues.sql
-- Descripción: Corrige problemas identificados en la base de datos para el flujo de solicitudes
-- Fecha: 2025-10-16
-- ==============================

-- 1. Corregir la función calculate_request_price para manejar mejor los errores
CREATE OR REPLACE FUNCTION calculate_request_price()
RETURNS TRIGGER AS $$
DECLARE
  base NUMERIC(12,2) := 50.0; -- Tarifa base por defecto
  hours NUMERIC(6,2);
  distance NUMERIC(8,2) := 0;
  exp_factor NUMERIC(4,2) := 1.0;
  instr_factor NUMERIC(4,2) := 1.0;
  event_factor NUMERIC(4,2) := 1.0;
  fee NUMERIC(12,2);
  total NUMERIC(12,2);
  event_category VARCHAR(255);
BEGIN
  -- Solo calcular si tenemos los datos necesarios
  IF NEW.start_time IS NULL OR NEW.end_time IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obtener el nombre del tipo de evento si existe
  IF NEW.event_type_id IS NOT NULL THEN
    SELECT name, COALESCE(price_factor, 1.0) INTO event_category, event_factor
    FROM event_types
    WHERE id = NEW.event_type_id;
  END IF;

  -- Calcular duración en horas
  hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;
  
  -- Si la duración es inválida, usar valores por defecto
  IF hours <= 0 THEN
    hours := 1.0;
  END IF;

  -- Obtener la distancia del location JSONB si existe
  IF NEW.location IS NOT NULL AND jsonb_typeof(NEW.location) = 'object' THEN
    distance := COALESCE((NEW.location->>'distance_km')::NUMERIC, 0);
  END IF;

  -- Calcular el precio total
  total := base * hours * exp_factor * instr_factor * event_factor;
  
  -- Calcular la comisión del sistema (10%)
  fee := total * 0.10;

  -- Asignar valores calculados
  NEW.base_rate := base;
  NEW.duration_hours := hours;
  NEW.distance_km := distance;
  NEW.experience_factor := exp_factor;
  NEW.instrument_factor := instr_factor;
  NEW.system_fee := fee;
  NEW.total_price := total + fee;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Corregir la función de notificación para nuevos requests
CREATE OR REPLACE FUNCTION notify_musicians_new_request()
RETURNS TRIGGER AS $$
DECLARE
  musician_rec RECORD;
BEGIN
  -- Solo notificar si la solicitud es pública y está en estado CREATED
  IF NEW.is_public = TRUE AND NEW.status = 'CREATED' THEN
    -- Iterar sobre músicos activos
    FOR musician_rec IN 
      SELECT u.user_id AS musician_id
      FROM users u
      WHERE u.role = 'musician' AND u.status = 'active'
    LOOP
      -- Crear notificación para el músico
      INSERT INTO notifications (user_id, type, title, message, link, is_read)
      VALUES (
        musician_rec.musician_id,
        'SYSTEM',
        'Nueva Solicitud Disponible',
        'Hay una nueva solicitud que podría interesarte: ' || NEW.title,
        '/requests/' || NEW.id::text,
        FALSE
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Corregir la función de notificación para nuevas ofertas
CREATE OR REPLACE FUNCTION notify_leader_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  client_id_val UUID;
  musician_name VARCHAR(255);
BEGIN
  -- Obtener el ID del cliente de la solicitud
  SELECT client_id INTO client_id_val
  FROM request
  WHERE id = NEW.request_id;

  -- Obtener el nombre del músico
  SELECT name INTO musician_name
  FROM users
  WHERE user_id = NEW.musician_id;

  -- Crear notificación para el cliente
  INSERT INTO notifications (user_id, type, title, message, link, is_read)
  VALUES (
    client_id_val,
    'SYSTEM',
    'Nueva Oferta Recibida',
    musician_name || ' ha hecho una oferta para tu solicitud.',
    '/requests/' || NEW.request_id::text,
    FALSE
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Asegurar que los triggers estén correctamente configurados
DROP TRIGGER IF EXISTS trg_calculate_request_price ON request;
CREATE TRIGGER trg_calculate_request_price 
  BEFORE INSERT OR UPDATE ON request 
  FOR EACH ROW 
  EXECUTE FUNCTION calculate_request_price();

DROP TRIGGER IF EXISTS trg_notify_musicians_new_request ON request;
CREATE TRIGGER trg_notify_musicians_new_request 
  AFTER INSERT ON request 
  FOR EACH ROW 
  EXECUTE FUNCTION notify_musicians_new_request();

DROP TRIGGER IF EXISTS trg_notify_leader_new_offer ON offer;
CREATE TRIGGER trg_notify_leader_new_offer 
  AFTER INSERT ON offer 
  FOR EACH ROW 
  EXECUTE FUNCTION notify_leader_new_offer();

-- 5. Agregar índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_request_status_public ON request(status, is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_request_event_date ON request(event_date);
CREATE INDEX IF NOT EXISTS idx_request_client_id ON request(client_id);
CREATE INDEX IF NOT EXISTS idx_offer_request_id ON offer(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- 6. Corregir datos de prueba si existen
UPDATE request SET 
  total_price = COALESCE(total_price, 0),
  base_rate = COALESCE(base_rate, 50.0),
  duration_hours = COALESCE(duration_hours, 1.0),
  system_fee = COALESCE(system_fee, total_price * 0.10)
WHERE total_price IS NULL OR base_rate IS NULL OR duration_hours IS NULL OR system_fee IS NULL;

-- 7. Asegurar que la configuración de precios esté activa
INSERT INTO pricing_config (
  id, base_hourly_rate, minimum_hours, maximum_hours, 
  platform_commission, service_fee, tax_rate, currency, is_active
) 
SELECT 
  gen_random_uuid(), 500.00, 1.00, 12.00, 0.1500, 50.00, 0.1800, 'DOP', true
WHERE NOT EXISTS (
  SELECT 1 FROM pricing_config WHERE is_active = true
);

-- 8. Comentarios finales
COMMENT ON FUNCTION calculate_request_price() IS 'Función corregida para calcular precios de solicitudes con manejo de errores mejorado';
COMMENT ON FUNCTION notify_musicians_new_request() IS 'Función corregida para notificar a músicos sobre nuevas solicitudes públicas';
COMMENT ON FUNCTION notify_leader_new_offer() IS 'Función corregida para notificar a clientes sobre nuevas ofertas';

-- Verificación final
DO $$
BEGIN
  RAISE NOTICE 'Migración V1.0.12 completada: Problemas de base de datos corregidos';
  RAISE NOTICE 'Triggers actualizados y funciones corregidas';
  RAISE NOTICE 'Índices de rendimiento agregados';
END
$$;
