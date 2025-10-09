-- Función: set_updated_at()
-- Propósito: Actualiza automáticamente la columna 'updated_at' de una tabla al momento actual.
-- Uso: Se utiliza como un TRIGGER BEFORE UPDATE en cualquier tabla que tenga una columna 'updated_at'.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW(); -- Establece el valor de la columna 'updated_at' del nuevo registro a la fecha y hora actuales.
  RETURN NEW; -- Retorna el nuevo registro modificado para que la operación de actualización continúe.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL, el lenguaje de procedimiento de PostgreSQL.

-- Función: calculate_request_price()
-- Propósito: Calcula el precio total de una solicitud de evento, incluyendo tarifas base, duración, factores y comisiones.
-- Uso: Se utiliza como un TRIGGER BEFORE INSERT en la tabla 'requests' para establecer los valores de precio antes de que se guarde la solicitud.
CREATE OR REPLACE FUNCTION calculate_request_price()
RETURNS TRIGGER AS $$
DECLARE
  base NUMERIC(12,2); -- Declara una variable para almacenar la tarifa base por hora del músico.
  hours NUMERIC(6,2); -- Declara una variable para almacenar la duración del evento en horas.
  distance NUMERIC(8,2); -- Declara una variable para almacenar la distancia del evento en kilómetros.
  exp_factor NUMERIC(4,2) := 1; -- Declara y inicializa un factor de experiencia (por defecto 1).
  instr_factor NUMERIC(4,2) := 1; -- Declara y inicializa un factor de instrumento (por defecto 1).
  fee NUMERIC(12,2); -- Declara una variable para almacenar la comisión del sistema.
  total NUMERIC(12,2); -- Declara una variable para almacenar el precio total antes de la comisión.
BEGIN
  -- Obtiene la tarifa por hora base de la tabla 'musician_tariffs' según el tipo de evento de la nueva solicitud.
  SELECT hourly_rate INTO base
  FROM musician_tariffs
  WHERE category = NEW.event_type
  LIMIT 1;

  -- Calcula la duración del evento en horas a partir de la diferencia entre la hora de fin y la hora de inicio.
  hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

  -- Extrae la distancia en kilómetros del campo JSONB 'location' de la nueva solicitud. Si no existe, usa 0.
  distance := COALESCE((NEW.location->>'distance_km')::NUMERIC, 0);

  -- Calcula el precio total multiplicando la tarifa base, las horas y los factores de experiencia e instrumento.
  total := (base * hours * exp_factor * instr_factor);

  -- Calcula la comisión del sistema, que es el 10% del precio total.
  fee := total * 0.10;

  -- Asigna los valores calculados a las columnas correspondientes del nuevo registro de la solicitud.
  NEW.base_rate := base;
  NEW.duration_hours := hours;
  NEW.distance_km := distance;
  NEW.experience_factor := exp_factor;
  NEW.instrument_factor := instr_factor;
  NEW.system_fee := fee;
  NEW.total_price := total + fee; -- El precio final es el total más la comisión del sistema.

  RETURN NEW; -- Retorna el nuevo registro modificado para que se inserte en la tabla 'requests'.
END;
$$ LANGUAGE plpgsql;

-- Función: calculate_event_price()
-- Propósito: Calcula el precio total de un evento, incluyendo tarifas base, duración, factores y comisiones.
-- Uso: Se utiliza como un TRIGGER BEFORE INSERT O UPDATE en la tabla 'events' para establecer los valores de precio.
CREATE OR REPLACE FUNCTION calculate_event_price()
RETURNS TRIGGER AS $$
DECLARE
  base NUMERIC(12,2); -- Declara una variable para almacenar la tarifa base por hora del músico.
  hours NUMERIC(6,2); -- Declara una variable para almacenar la duración del evento en horas.
  distance NUMERIC(8,2); -- Declara una variable para almacenar la distancia del evento en kilómetros.
  exp_factor NUMERIC(4,2) := 1; -- Declara y inicializa un factor de experiencia (por defecto 1).
  instr_factor NUMERIC(4,2) := 1; -- Declara y inicializa un factor de instrumento (por defecto 1).
  fee NUMERIC(12,2); -- Declara una variable para almacenar la comisión del sistema.
  total NUMERIC(12,2); -- Declara una variable para almacenar el precio total antes de la comisión.
BEGIN
  -- Obtiene la tarifa por hora base de la tabla 'musician_tariffs' según el tipo de evento del nuevo/actualizado evento.
  SELECT hourly_rate INTO base
  FROM musician_tariffs
  WHERE category = NEW.event_type
  LIMIT 1;

  -- Calcula la duración del evento en horas a partir de la diferencia entre la hora de fin y la hora de inicio.
  hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

  -- Extrae la distancia en kilómetros del campo JSONB 'location' del nuevo/actualizado evento. Si no existe, usa 0.
  distance := COALESCE((NEW.location->>'distance_km')::NUMERIC, 0);

  -- Calcula el precio total multiplicando la tarifa base, las horas y los factores de experiencia e instrumento.
  total := (base * hours * exp_factor * instr_factor);

  -- Calcula la comisión del sistema, que es el 10% del precio total.
  fee := total * 0.10;

  -- Asigna los valores calculados a las columnas correspondientes del nuevo/actualizado registro del evento.
  NEW.base_rate := base;
  NEW.duration_hours := hours;
  NEW.distance_km := distance;
  NEW.experience_factor := exp_factor;
  NEW.instrument_factor := instr_factor;
  NEW.system_fee := fee;
  NEW.total_price := total + fee; -- El precio final es el total más la comisión del sistema.

  RETURN NEW; -- Retorna el nuevo registro modificado para que se inserte/actualice en la tabla 'events'.
END;
$$ LANGUAGE plpgsql;

-- Función: update_user_balance()
-- Propósito: Actualiza el balance de un usuario después de una transacción.
-- Uso: Se utiliza como un TRIGGER AFTER INSERT en la tabla 'transactions' para ajustar el balance del usuario afectado.
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualiza el balance del usuario sumando el monto de la nueva transacción.
  UPDATE users
  SET balance = balance + NEW.amount
  WHERE id = NEW.user_id;

  RETURN NEW; -- Retorna el nuevo registro de la transacción.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL;


-- ==============================
-- DISTANCE CALCULATION
-- ==============================
-- Función: calculate_distance_km(lat1, lon1, lat2, lon2)
-- Propósito: Calcula la distancia en kilómetros entre dos puntos geográficos utilizando la fórmula de Haversine.
-- Parámetros:
--   lat1: Latitud del primer punto.
--   lon1: Longitud del primer punto.
--   lat2: Latitud del segundo punto.
--   lon2: Longitud del segundo punto.
-- Retorna: La distancia en kilómetros como un valor numérico.
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS NUMERIC AS $$
DECLARE
  R INTEGER := 6371; -- Radio de la Tierra en kilómetros.
  dLat DOUBLE PRECISION := RADIANS(lat2 - lat1); -- Diferencia de latitud en radianes.
  dLon DOUBLE PRECISION := RADIANS(lon2 - lon1); -- Diferencia de longitud en radianes.
  a DOUBLE PRECISION; -- Variable intermedia para la fórmula de Haversine.
  c DOUBLE PRECISION; -- Variable intermedia para la fórmula de Haversine.
  d NUMERIC; -- Distancia final en kilómetros.
BEGIN
  -- Fórmula de Haversine para calcular la distancia angular entre dos puntos.
  a := SIN(dLat / 2) * SIN(dLat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(dLon / 2) * SIN(dLon / 2);
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  d := R * c; -- Distancia en kilómetros.

  RETURN d; -- Retorna la distancia calculada.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- Función: calculate_travel_time_minutes(lat1, lon1, lat2, lon2)
-- Propósito: Calcula el tiempo de viaje estimado en minutos entre dos puntos geográficos.
-- Parámetros:
--   lat1: Latitud del punto de origen.
--   lon1: Longitud del punto de origen.
--   lat2: Latitud del punto de destino.
--   lon2: Longitud del punto de destino.
-- Retorna: El tiempo de viaje estimado en minutos como un valor numérico.
CREATE OR REPLACE FUNCTION calculate_travel_time_minutes(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS NUMERIC AS $$
DECLARE
  distance_km NUMERIC; -- Distancia calculada en kilómetros.
  travel_speed_kmh NUMERIC := 60; -- Velocidad de viaje promedio en km/h (ajustable).
  travel_time_hours NUMERIC; -- Tiempo de viaje en horas.
  travel_time_minutes NUMERIC; -- Tiempo de viaje en minutos.
BEGIN
  -- Calcula la distancia en kilómetros utilizando la función calculate_distance_km.
  distance_km := calculate_distance_km(lat1, lon1, lat2, lon2);

  -- Calcula el tiempo de viaje en horas.
  travel_time_hours := distance_km / travel_speed_kmh;

  -- Convierte el tiempo de viaje a minutos.
  travel_time_minutes := travel_time_hours * 60;

  RETURN travel_time_minutes; -- Retorna el tiempo de viaje en minutos.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- Función: manage_musician_availability(p_musician_id, p_start_time, p_end_time, p_action, p_availability_id)
-- Propósito: Permite a los músicos gestionar sus franjas de disponibilidad bloqueadas (insertar, actualizar, eliminar).
-- Parámetros:
--   p_musician_id: ID del músico.
--   p_start_time: Hora de inicio de la franja de disponibilidad.
--   p_end_time: Hora de fin de la franja de disponibilidad.
--   p_action: Acción a realizar ('INSERT', 'UPDATE', 'DELETE').
--   p_availability_id: ID de la franja de disponibilidad a actualizar o eliminar (opcional).
CREATE OR REPLACE FUNCTION manage_musician_availability(
  p_musician_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE,
  p_action TEXT,
  p_availability_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  IF p_action = 'INSERT' THEN
    -- Inserta una nueva franja de disponibilidad bloqueada para el músico.
    INSERT INTO musician_availability (musician_id, start_time, end_time, is_blocked)
    VALUES (p_musician_id, p_start_time, p_end_time, TRUE);
  ELSIF p_action = 'UPDATE' THEN
    -- Actualiza una franja de disponibilidad existente.
    UPDATE musician_availability
    SET
      start_time = p_start_time,
      end_time = p_end_time,
      updated_at = NOW() -- Actualiza la marca de tiempo de actualización.
    WHERE id = p_availability_id AND musician_id = p_musician_id;
  ELSIF p_action = 'DELETE' THEN
    -- Elimina una franja de disponibilidad existente.
    DELETE FROM musician_availability
    WHERE id = p_availability_id AND musician_id = p_musician_id;
  ELSE
    -- Lanza una excepción si la acción no es válida.
    RAISE EXCEPTION 'Acción no válida. Use INSERT, UPDATE o DELETE.';
  END IF;
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- ==============================
-- NOTIFICATIONS
-- ==============================

-- Función: create_notification(p_user_id, p_type, p_title, p_message, p_link)
-- Propósito: Crea una nueva notificación para un usuario específico.
-- Parámetros:
--   p_user_id: ID del usuario que recibirá la notificación.
--   p_type: Tipo de notificación (ej. 'request', 'offer', 'info').
--   p_title: Título de la notificación.
--   p_message: Contenido del mensaje de la notificación.
--   p_link: Enlace asociado a la notificación (opcional).
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_message TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Inserta una nueva notificación en la tabla 'notifications'.
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link);
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- Función: notify_musicians_new_request()
-- Propósito: Notifica a los músicos activos sobre una nueva solicitud de evento, aplicando filtros de disponibilidad, tiempo de viaje y buffers.
-- Uso: Se utiliza como un TRIGGER AFTER INSERT en la tabla 'requests'.
CREATE OR REPLACE FUNCTION notify_musicians_new_request()
RETURNS TRIGGER AS $$
DECLARE
  musician_rec RECORD; -- Variable para iterar sobre los músicos.
  req_start_buffer TIMESTAMP WITH TIME ZONE; -- Hora de inicio de la solicitud con buffer.
  req_end_buffer TIMESTAMP WITH TIME ZONE; -- Hora de fin de la solicitud con buffer.
  musician_home_lat DOUBLE PRECISION; -- Latitud del hogar del músico.
  musician_home_lon DOUBLE PRECISION; -- Longitud del hogar del músico.
  event_lat DOUBLE PRECISION; -- Latitud del evento.
  event_lon DOUBLE PRECISION; -- Longitud del evento.
  travel_time_min NUMERIC; -- Tiempo de viaje en minutos.
  last_event_end_time TIMESTAMP WITH TIME ZONE; -- Hora de fin del último evento del músico.
  last_event_lat DOUBLE PRECISION; -- Latitud del último evento del músico.
  last_event_lon DOUBLE PRECISION; -- Longitud del último evento del músico.
  time_gap INTERVAL; -- Brecha de tiempo entre eventos.
  travel_origin_lat DOUBLE PRECISION; -- Latitud de origen para el cálculo del viaje.
  travel_origin_lon DOUBLE PRECISION; -- Longitud de origen para el cálculo del viaje.
BEGIN
  -- Extrae la latitud y longitud del evento de la nueva solicitud.
  event_lat := (NEW.location->>'latitude')::DOUBLE PRECISION;
  event_lon := (NEW.location->>'longitude')::DOUBLE PRECISION;

  -- Itera sobre todos los músicos activos.
  FOR musician_rec IN SELECT u.id AS musician_id, u.home_latitude, u.home_longitude
                      FROM users u
                      WHERE u.is_musician = TRUE AND u.is_active = TRUE
  LOOP
    -- Inicializa las variables de latitud y longitud del hogar del músico.
    musician_home_lat := musician_rec.home_latitude;
    musician_home_lon := musician_rec.home_longitude;

    -- Obtiene el último evento confirmado del músico.
    SELECT ma.end_time, ma.latitude, ma.longitude
    INTO last_event_end_time, last_event_lat, last_event_lon
    FROM musician_availability ma
    WHERE ma.musician_id = musician_rec.musician_id
      AND ma.is_blocked = FALSE -- Considera solo eventos confirmados, no bloqueos manuales
      AND ma.end_time < NEW.start_time -- Eventos que terminaron antes de la nueva solicitud
    ORDER BY ma.end_time DESC
    LIMIT 1;

    -- Determina el origen del viaje para el cálculo del tiempo.
    IF last_event_end_time IS NOT NULL THEN
      time_gap := NEW.start_time - last_event_end_time;
      IF time_gap <= INTERVAL '1 hour' THEN
        -- Si la brecha es de 1 hora o menos, el origen es el último evento.
        travel_origin_lat := last_event_lat;
        travel_origin_lon := last_event_lon;
      ELSIF time_gap > INTERVAL '3 hours' THEN
        -- Si la brecha es de más de 3 horas, el origen es el hogar del músico.
        travel_origin_lat := musician_home_lat;
        travel_origin_lon := musician_home_lon;
      ELSE
        -- En otros casos, el origen es el hogar del músico.
        travel_origin_lat := musician_home_lat;
        travel_origin_lon := musician_home_lon;
      END IF;
    ELSE
      -- Si no hay eventos previos, el origen es el hogar del músico.
      travel_origin_lat := musician_home_lat;
      travel_origin_lon := musician_home_lon;
    END IF;

    -- Calcula el tiempo de viaje desde el origen determinado hasta el evento.
    travel_time_min := calculate_travel_time_minutes(
      travel_origin_lat, travel_origin_lon,
      event_lat, event_lon
    );

    -- Ajusta las horas de inicio y fin de la solicitud con un buffer de 1 hora y el tiempo de viaje.
    req_start_buffer := NEW.start_time - (travel_time_min * INTERVAL '1 minute') - INTERVAL '1 hour';
    req_end_buffer := NEW.end_time + (travel_time_min * INTERVAL '1 minute') + INTERVAL '1 hour';

    -- Verifica si el músico está disponible para la nueva solicitud (con buffers y tiempo de viaje).
    IF NOT EXISTS (
      SELECT 1
      FROM musician_availability ma
      WHERE ma.musician_id = musician_rec.musician_id
        AND (
          (ma.start_time, ma.end_time) OVERLAPS (req_start_buffer, req_end_buffer)
        )
    ) THEN
      -- Si está disponible, crea una notificación para el músico.
      PERFORM create_notification(
        musician_rec.musician_id,
        'request',
        'Nueva Solicitud de Evento',
        'Hay una nueva solicitud de evento disponible que coincide con tu perfil.',
        '/requests/' || NEW.id
      );
    END IF;
  END LOOP;

  RETURN NEW; -- Retorna el nuevo registro de la solicitud.
END;
$$ LANGUAGE plpgsql;

-- Función: notify_leader_new_offer()
-- Propósito: Notifica al líder de una solicitud cuando un músico hace una oferta.
-- Uso: Se utiliza como un TRIGGER AFTER INSERT en la tabla 'offers'.
CREATE OR REPLACE FUNCTION notify_leader_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  leader_id UUID; -- ID del líder de la solicitud.
  musician_name VARCHAR(255); -- Nombre del músico que hizo la oferta.
BEGIN
  -- Obtiene el ID del líder de la solicitud asociada a la nueva oferta.
  SELECT user_id INTO leader_id
  FROM requests
  WHERE id = NEW.request_id;

  -- Obtiene el nombre del músico que hizo la oferta.
  SELECT name INTO musician_name
  FROM users
  WHERE id = NEW.musician_id;

  -- Crea una notificación para el líder de la solicitud.
  PERFORM create_notification(
    leader_id,
    'offer',
    'Nueva Oferta Recibida',
    'El músico ' || musician_name || ' ha hecho una oferta para tu solicitud.',
    '/requests/' || NEW.request_id
  );

  RETURN NEW; -- Retorna el nuevo registro de la oferta.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- Función: notify_musician_offer_selected()
-- Propósito: Notifica a un músico cuando su oferta ha sido seleccionada para una solicitud.
-- Uso: Se utiliza como un TRIGGER AFTER UPDATE en la tabla 'offers' cuando el estado cambia a 'accepted'.
CREATE OR REPLACE FUNCTION notify_musician_offer_selected()
RETURNS TRIGGER AS $$
DECLARE
  request_title VARCHAR(255); -- Título de la solicitud.
BEGIN
  -- Verifica si la oferta ha sido aceptada.
  IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
    -- Obtiene el título de la solicitud asociada.
    SELECT title INTO request_title
    FROM requests
    WHERE id = NEW.request_id;

    -- Crea una notificación para el músico cuya oferta fue seleccionada.
    PERFORM create_notification(
      NEW.musician_id,
      'offer_accepted',
      '¡Tu Oferta Ha Sido Aceptada!',
      'Tu oferta para la solicitud ' || request_title || ' ha sido seleccionada.',
      '/offers/' || NEW.id
    );
  END IF;

  RETURN NEW; -- Retorna el nuevo registro de la oferta.
END;
$$ LANGUAGE plpgsql; -- Especifica que la función está escrita en PL/pgSQL.

-- Función: notify_event_status_change()
-- Propósito: Notifica al líder y al músico cuando el estado de una solicitud cambia a IN_PROGRESS.
-- Uso: Se utiliza como un TRIGGER AFTER UPDATE en la tabla 'requests'.
CREATE OR REPLACE FUNCTION notify_event_status_change()
RETURNS TRIGGER AS $$
DECLARE
  musician_id_val UUID;
  leader_name VARCHAR(255);
  musician_name VARCHAR(255);
  event_date_str TEXT;
BEGIN
  -- Solo procede si el estado cambia a 'IN_PROGRESS'
  IF NEW.status = 'IN_PROGRESS' AND OLD.status IS DISTINCT FROM 'IN_PROGRESS' THEN
    -- Obtener el ID del músico de la oferta aceptada para esta solicitud
    SELECT musician_id INTO musician_id_val
    FROM offers
    WHERE request_id = NEW.id AND status = 'ACCEPTED'
    LIMIT 1;

    -- Obtener nombres del líder y del músico
    SELECT name INTO leader_name FROM users WHERE id = NEW.leader_id;
    SELECT name INTO musician_name FROM users WHERE id = musician_id_val;

    -- Formatear la fecha del evento
    event_date_str := TO_CHAR(NEW.event_date, 'DD/MM/YYYY HH24:MI');

    -- Notificar al líder
    PERFORM create_notification(
      NEW.leader_id,
      'request_update',
      'Evento en Progreso: ' || event_date_str,
      'Tu solicitud para el evento del ' || event_date_str || ' con ' || musician_name || ' ha comenzado.',
      '/requests/' || NEW.id
    );

    -- Notificar al músico
    PERFORM create_notification(
      musician_id_val,
      'request_update',
      'Evento en Progreso: ' || event_date_str,
      'El evento del ' || event_date_str || ' con ' || leader_name || ' ha comenzado.',
      '/requests/' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: send_event_reminder(p_request_id UUID)
-- Propósito: Envía un recordatorio al líder y al músico 10 minutos antes del inicio de un evento.
-- Uso: Esta función debe ser invocada por un sistema de tareas programadas externo (ej. cron job).
CREATE OR REPLACE FUNCTION send_event_reminder(
  p_request_id UUID
) RETURNS VOID AS $$
DECLARE
  musician_id_val UUID;
  leader_id_val UUID;
  leader_name VARCHAR(255);
  musician_name VARCHAR(255);
  event_date_val TIMESTAMP WITH TIME ZONE;
  event_date_str TEXT;
BEGIN
  -- Obtener detalles de la solicitud
  SELECT leader_id, event_date
  INTO leader_id_val, event_date_val
  FROM requests
  WHERE id = p_request_id;

  -- Obtener el ID del músico de la oferta aceptada para esta solicitud
  SELECT musician_id INTO musician_id_val
  FROM offers
  WHERE request_id = p_request_id AND status = 'ACCEPTED'
  LIMIT 1;

  -- Si no se encuentra la solicitud o el músico, salir
  IF leader_id_val IS NULL OR musician_id_val IS NULL THEN
    RETURN;
  END IF;

  -- Obtener nombres del líder y del músico
  SELECT name INTO leader_name FROM users WHERE id = leader_id_val;
  SELECT name INTO musician_name FROM users WHERE id = musician_id_val;

  -- Formatear la fecha del evento
  event_date_str := TO_CHAR(event_date_val, 'DD/MM/YYYY HH24:MI');

  -- Notificar al líder
  PERFORM create_notification(
    leader_id_val,
    'event_reminder',
    'Recordatorio: Evento Próximo - ' || event_date_str,
    'Tu evento con ' || musician_name || ' comienza en 10 minutos.',
    '/requests/' || p_request_id
  );

  -- Notificar al músico
  PERFORM create_notification(
    musician_id_val,
    'event_reminder',
    'Recordatorio: Evento Próximo - ' || event_date_str,
    'Tu evento con ' || leader_name || ' comienza en 10 minutos.',
    '/requests/' || p_request_id
  );
END;
$$ LANGUAGE plpgsql;