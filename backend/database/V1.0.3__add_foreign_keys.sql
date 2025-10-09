-- ==============================
-- Migration: Add foreign keys from deploy.sql schema
-- ==============================

-- Foreign Keys for REQUESTS
ALTER TABLE requests ADD CONSTRAINT fk_requests_leader_id FOREIGN KEY (leader_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE requests ADD CONSTRAINT fk_requests_event_type_id FOREIGN KEY (event_type_id) REFERENCES event_types(id) ON DELETE CASCADE;

-- Foreign Keys for OFFERS
ALTER TABLE offers ADD CONSTRAINT fk_offers_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE;
ALTER TABLE offers ADD CONSTRAINT fk_offers_musician_id FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE request_status_history ADD CONSTRAINT fk_request_status_history_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE;
ALTER TABLE request_status_history ADD CONSTRAINT fk_request_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE musician_availability ADD CONSTRAINT fk_musician_availability_musician_id FOREIGN KEY (musician_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE user_balances ADD CONSTRAINT fk_user_balances_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;
ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_offer_id FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL;

ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_admin_id FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
