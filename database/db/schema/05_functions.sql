CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_request_price()
RETURNS TRIGGER AS $$
DECLARE
  base NUMERIC(12,2);
  hours NUMERIC(6,2);
  distance NUMERIC(8,2);
  exp_factor NUMERIC(4,2) := 1;
  instr_factor NUMERIC(4,2) := 1;
  fee NUMERIC(12,2);
  total NUMERIC(12,2);
BEGIN
  SELECT hourly_rate INTO base
  FROM musician_tariffs
  WHERE category = NEW.event_type
  LIMIT 1;

  hours := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 3600;

  distance := COALESCE((NEW.location->>'distance_km')::NUMERIC, 0);

  total := (base * hours * exp_factor * instr_factor);

  fee := total * 0.10;

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

CREATE OR REPLACE FUNCTION calculate_event_price(
  p_start_time TIME,
  p_end_time TIME,
  p_custom_rate NUMERIC DEFAULT NULL
) RETURNS TABLE (
  hourly_rate NUMERIC(12,2),
  hours NUMERIC(6,2),
  subtotal NUMERIC(12,2),
  commission NUMERIC(12,2),
  service_fee NUMERIC(12,2),
  tax NUMERIC(12,2),
  total NUMERIC(12,2),
  musician_earnings NUMERIC(12,2)
) AS $$
DECLARE
  cfg pricing_config%ROWTYPE;
  rate NUMERIC(12,2);
  ev_hours NUMERIC(6,2);
  sub NUMERIC(12,2);
BEGIN
  SELECT * INTO cfg FROM pricing_config WHERE is_active = TRUE LIMIT 1;
  IF cfg IS NULL THEN
    RAISE EXCEPTION 'No active pricing configuration found';
  END IF;

  rate := COALESCE(p_custom_rate, cfg.base_hourly_rate);
  ev_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time))/3600.0;
  IF ev_hours <= 0 THEN ev_hours := cfg.minimum_hours; END IF;

  sub := ROUND(ev_hours * rate, 2);
  commission := ROUND(sub * cfg.platform_commission, 2);
  service_fee := cfg.service_fee;
  total := ROUND(sub + commission + service_fee, 2);
  tax := ROUND(total * cfg.tax_rate, 2);
  total := total + tax;
  musician_earnings := ROUND(sub - commission, 2);

  RETURN QUERY SELECT rate, ev_hours, sub, commission, service_fee, tax, total, musician_earnings;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed') THEN
    INSERT INTO user_balances (user_id, total_earnings, pending_earnings, available_balance, total_withdrawn, currency)
    VALUES (
      NEW.user_id,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      CASE WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      NEW.currency
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_earnings = user_balances.total_earnings + CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      pending_earnings = user_balances.pending_earnings + CASE WHEN NEW.type = 'earning' AND NEW.status = 'pending' THEN NEW.amount WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      available_balance = user_balances.available_balance + CASE WHEN NEW.type = 'earning' AND NEW.status = 'completed' THEN NEW.amount WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN -NEW.amount ELSE 0 END,
      total_withdrawn = user_balances.total_withdrawn + CASE WHEN NEW.type = 'withdrawal' AND NEW.status = 'completed' THEN NEW.amount ELSE 0 END,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==============================
-- DISTANCE CALCULATION
-- ==============================
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 FLOAT,
    lon1 FLOAT,
    lat2 FLOAT,
    lon2 FLOAT
)
RETURNS FLOAT AS $$
DECLARE
    R INT = 6371; -- Radius of Earth in kilometers
    dLat FLOAT = radians(lat2 - lat1);
    dLon FLOAT = radians(lon2 - lon1);
    a FLOAT = sin(dLat / 2) * sin(dLat / 2) +
              cos(radians(lat1)) * cos(radians(lat2)) *
              sin(dLon / 2) * sin(dLon / 2);
    c FLOAT = 2 * atan2(sqrt(a), sqrt(1 - a));
    distance FLOAT;
BEGIN
    distance = R * c;
    RETURN distance;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_travel_time_minutes(
    lat1 FLOAT,
    lon1 FLOAT,
    lat2 FLOAT,
    lon2 FLOAT
)
RETURNS FLOAT AS $$
DECLARE
    distance_km FLOAT;
    travel_time_minutes FLOAT;
BEGIN
    distance_km = calculate_distance_km(lat1, lon1, lat2, lon2);
    travel_time_minutes = distance_km * 3; -- 3 minutes per kilometer
    RETURN travel_time_minutes;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION manage_musician_availability(
    p_musician_id UUID,
    p_event_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_is_blocked BOOLEAN DEFAULT FALSE,
    p_reason VARCHAR(100) DEFAULT NULL,
    p_request_id UUID DEFAULT NULL,
    p_latitude DECIMAL(9,6) DEFAULT NULL,
    p_longitude DECIMAL(9,6) DEFAULT NULL,
    p_operation_type VARCHAR(10) -- 'INSERT', 'UPDATE', 'DELETE'
)
RETURNS VOID AS $$
BEGIN
    IF p_operation_type = 'INSERT' THEN
        INSERT INTO musician_availability (musician_id, event_date, start_time, end_time, is_blocked, reason, request_id, latitude, longitude)
        VALUES (p_musician_id, p_event_date, p_start_time, p_end_time, p_is_blocked, p_reason, p_request_id, p_latitude, p_longitude);
    ELSIF p_operation_type = 'UPDATE' THEN
        UPDATE musician_availability
        SET
            event_date = p_event_date,
            start_time = p_start_time,
            end_time = p_end_time,
            is_blocked = p_is_blocked,
            reason = p_reason,
            request_id = p_request_id,
            latitude = p_latitude,
            longitude = p_longitude,
            updated_at = NOW()
        WHERE musician_id = p_musician_id AND event_date = p_event_date AND start_time = p_start_time; -- Asumiendo que la combinación de estos es única para identificar un registro
    ELSIF p_operation_type = 'DELETE' THEN
        DELETE FROM musician_availability
        WHERE musician_id = p_musician_id AND event_date = p_event_date AND start_time = p_start_time;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- NOTIFICATIONS
-- ==============================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title VARCHAR,
  p_message TEXT,
  p_type VARCHAR DEFAULT 'info',
  p_data JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  n_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, data) VALUES (p_user_id, p_title, p_message, p_type, p_data) RETURNING id INTO n_id;
  RETURN n_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_musicians_new_request()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
  musician_home_lat DECIMAL(9,6);
  musician_home_lon DECIMAL(9,6);
  event_lat DECIMAL(9,6);
  event_lon DECIMAL(9,6);
  travel_time_min FLOAT;
  event_start_datetime TIMESTAMP WITH TIME ZONE;
  event_end_datetime TIMESTAMP WITH TIME ZONE;
  buffered_start_datetime TIMESTAMP WITH TIME ZONE;
  buffered_end_datetime TIMESTAMP WITH TIME ZONE;
  is_available BOOLEAN;
  last_event_info RECORD; -- To store last event's end time, lat, lon
  time_gap_hours FLOAT;
  origin_lat DECIMAL(9,6);
  origin_lon DECIMAL(9,6);
BEGIN
  -- Extraer latitud y longitud del evento de la nueva solicitud
  event_lat := (NEW.location->>'lat')::DECIMAL;
  event_lon := (NEW.location->>'lng')::DECIMAL;

  -- Combinar event_date con start_time y end_time para obtener timestamps completos
  event_start_datetime := NEW.event_date::DATE + NEW.start_time;
  event_end_datetime := NEW.event_date::DATE + NEW.end_time;

  FOR rec IN SELECT id, home_latitude, home_longitude FROM users WHERE role = 'musician' AND status = 'active' LOOP
    musician_home_lat := rec.home_latitude;
    musician_home_lon := rec.home_longitude;

    -- Initialize origin to musician's home
    origin_lat := musician_home_lat;
    origin_lon := musician_home_lon;

    -- Find the musician's last event or blocked time that ends before the new request starts
    SELECT (ma.event_date::DATE + ma.end_time) AS end_dt, ma.latitude, ma.longitude
    INTO last_event_info
    FROM musician_availability ma
    WHERE ma.musician_id = rec.id
      AND (ma.event_date::DATE + ma.end_time) < event_start_datetime
      AND ma.latitude IS NOT NULL
      AND ma.longitude IS NOT NULL
    ORDER BY (ma.event_date::DATE + ma.end_time) DESC
    LIMIT 1;

    IF last_event_info.end_dt IS NOT NULL THEN
      -- Calculate the time gap in hours
      time_gap_hours := EXTRACT(EPOCH FROM (event_start_datetime - last_event_info.end_dt)) / 3600;

      IF time_gap_hours <= 1 THEN
        -- If time gap is 1 hour or less, calculate travel from the last event's location
        origin_lat := last_event_info.latitude;
        origin_lon := last_event_info.longitude;
      ELSIF time_gap_hours > 3 THEN
        -- If time gap is more than 3 hours, calculate travel from musician's home (already set as default)
        -- No change needed for origin_lat, origin_lon as they are already set to home location
        NULL; -- Placeholder for clarity
      ELSE
        -- If time gap is between 1 and 3 hours, also calculate travel from musician's home
        NULL; -- Placeholder for clarity
      END IF;
    END IF;

    -- Calcular tiempo de viaje solo si la ubicación de origen y destino están disponibles
    IF origin_lat IS NOT NULL AND origin_lon IS NOT NULL AND event_lat IS NOT NULL AND event_lon IS NOT NULL THEN
      travel_time_min := calculate_travel_time_minutes(origin_lat, origin_lon, event_lat, event_lon);
    ELSE
      travel_time_min := 0; -- Default to 0 if location data is missing
    END IF;

    -- Add 1 hour buffer to the event start and end times, and include travel time before start
    buffered_start_datetime := event_start_datetime - INTERVAL '1 hour' - (travel_time_min || ' minutes')::INTERVAL;
    buffered_end_datetime := event_end_datetime + INTERVAL '1 hour';

    -- Check for availability: ensure the new request's buffered window does not overlap with any existing availability entry
    SELECT NOT EXISTS (
      SELECT 1
      FROM musician_availability ma
      WHERE ma.musician_id = rec.id
        AND (buffered_start_datetime, buffered_end_datetime) OVERLAPS
        (ma.event_date::DATE + ma.start_time, ma.event_date::DATE + ma.end_time)
    ) INTO is_available;

    -- If available, create a notification
    IF is_available THEN
      PERFORM create_notification(
        rec.id,
        'Nueva Solicitud de Evento',
        'Tienes una nueva solicitud de evento para ' || NEW.event_date || ' de ' || NEW.start_time || ' a ' || NEW.end_time || '. Tiempo de viaje estimado: ' || ROUND(travel_time_min) || ' minutos.',
        'request',
        jsonb_build_object(
          'request_id', NEW.id,
          'event_date', NEW.event_date,
          'start_time', NEW.start_time,
          'end_time', NEW.end_time,
          'travel_time_minutes', travel_time_min
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_leader_new_offer()
RETURNS TRIGGER AS $$
DECLARE
  leader_uuid UUID;
BEGIN
  SELECT leader_id INTO leader_uuid FROM requests WHERE id = NEW.request_id;
  IF leader_uuid IS NOT NULL THEN
    PERFORM create_notification(leader_uuid, 'Nueva oferta', 'Has recibido una nueva oferta para tu solicitud', 'new_offer', jsonb_build_object('offer_id', NEW.id, 'request_id', NEW.request_id, 'musician_id', NEW.musician_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_musician_offer_selected()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.status = 'SELECTED' AND OLD.status IS DISTINCT FROM 'SELECTED') OR (TG_OP = 'UPDATE' AND NEW.status = 'ACCEPTED' AND OLD.status IS DISTINCT FROM 'ACCEPTED') THEN
    PERFORM create_notification(NEW.musician_id, 'Oferta seleccionada', 'Tu oferta ha sido seleccionada', 'offer_selected', jsonb_build_object('offer_id', NEW.id, 'request_id', NEW.request_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;