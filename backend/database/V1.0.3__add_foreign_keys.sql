-- ==============================
-- Migración: Añadir claves foráneas del esquema deploy.sql
-- ==============================

-- Claves Foráneas para REQUEST
-- Añade la clave foránea `fk_requests_client_id` a la tabla `request`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_requests_client_id' AND table_name = 'request') THEN
    ALTER TABLE request ADD CONSTRAINT fk_requests_client_id FOREIGN KEY (client_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añade la clave foránea `fk_requests_event_type_id` a la tabla `request`, referenciando `event_types(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_requests_event_type_id' AND table_name = 'request') THEN
    ALTER TABLE request ADD CONSTRAINT fk_requests_event_type_id FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Claves Foráneas para OFFER
-- Añade la clave foránea `fk_offer_request` a la tabla `offer`, referenciando `request(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_offer_request' AND table_name = 'offer') THEN
    ALTER TABLE offer ADD CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añade la clave foránea `fk_offer_musician_id` a la tabla `offer`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_offer_musician_id' AND table_name = 'offer') THEN
    ALTER TABLE offer ADD CONSTRAINT fk_offer_musician_id FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Claves Foráneas para REQUEST_STATUS_HISTORY
-- Añade la clave foránea `fk_request_status_history_request_id` a la tabla `request_status_history`, referenciando `request(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_request_status_history_request_id' AND table_name = 'request_status_history') THEN
    ALTER TABLE request_status_history ADD CONSTRAINT fk_request_status_history_request_id FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añade la clave foránea `fk_request_status_history_changed_by` a la tabla `request_status_history`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_request_status_history_changed_by' AND table_name = 'request_status_history') THEN
    ALTER TABLE request_status_history ADD CONSTRAINT fk_request_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Claves Foráneas para NOTIFICATIONS
-- Añade la clave foránea `fk_notifications_user_id` a la tabla `notifications`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_notifications_user_id' AND table_name = 'notifications') THEN
    ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Claves Foráneas para MUSICIAN_AVAILABILITY
-- Añade la clave foránea `fk_musician_availability_musician_id` a la tabla `musician_availability`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_musician_availability_musician_id' AND table_name = 'musician_availability') THEN
    ALTER TABLE musician_availability ADD CONSTRAINT fk_musician_availability_musician_id FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Claves Foráneas para USER_BALANCES
-- Añade la clave foránea `fk_user_balances_user_id` a la tabla `user_balances`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_balances_user_id' AND table_name = 'user_balances') THEN
    ALTER TABLE user_balances ADD CONSTRAINT fk_user_balances_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Claves Foráneas para USER_TRANSACTIONS
-- Añade la clave foránea `fk_user_transactions_user_id` a la tabla `user_transactions`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_transactions_user_id' AND table_name = 'user_transactions') THEN
    ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añade la clave foránea `fk_user_transactions_request_id` a la tabla `user_transactions`, referenciando `request(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_transactions_request_id' AND table_name = 'user_transactions') THEN
    ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_request_id FOREIGN KEY (request_id) REFERENCES request(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Añade la clave foránea `fk_user_transactions_offer_id` a la tabla `user_transactions`, referenciando `offer(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_user_transactions_offer_id' AND table_name = 'user_transactions') THEN
    ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_offer_id FOREIGN KEY (offer_id) REFERENCES offer(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Claves Foráneas para ADMIN_ACTIONS
-- Añade la clave foránea `fk_admin_actions_admin_id` a la tabla `admin_actions`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_admin_actions_admin_id' AND table_name = 'admin_actions') THEN
    ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_admin_id FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añade la clave foránea `fk_admin_actions_user_id` a la tabla `admin_actions`, referenciando `users(user_id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_admin_actions_user_id' AND table_name = 'admin_actions') THEN
    ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Añadir clave foránea a la tabla offer para musician_id
-- Añade la clave foránea `fk_offer_musician` a la tabla `offer`, referenciando `musician_profiles(id)`.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_offer_musician' AND table_name = 'offer') THEN
    ALTER TABLE offer ADD CONSTRAINT fk_offer_musician FOREIGN KEY (musician_id) REFERENCES musician_profiles(id) ON DELETE CASCADE;
  END IF;
END
$$;
