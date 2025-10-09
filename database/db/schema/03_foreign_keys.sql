ALTER TABLE request_status_history ADD CONSTRAINT fk_request_status_history_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE musician_availability ADD CONSTRAINT fk_musician_availability_musician_id FOREIGN KEY (musician_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE musician_availability ADD CONSTRAINT fk_musician_availability_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;
ALTER TABLE user_balances ADD CONSTRAINT fk_user_balances_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_request_id FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE SET NULL;
ALTER TABLE user_transactions ADD CONSTRAINT fk_user_transactions_offer_id FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE SET NULL;
ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_admin_id FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE admin_actions ADD CONSTRAINT fk_admin_actions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE requests
ADD CONSTRAINT fk_event_type
FOREIGN KEY (event_type_id) REFERENCES event_types(id);

-- Foreign Keys for REQUESTS
ALTER TABLE requests
ADD CONSTRAINT fk_leader
FOREIGN KEY (leader_id) REFERENCES users(id);