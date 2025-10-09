ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE musician_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Anyone can register" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own password" ON user_passwords FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own password" ON user_passwords FOR INSERT, UPDATE, DELETE USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own instruments" ON user_instruments FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Public can read user instruments" ON user_instruments FOR SELECT USING (true);

CREATE POLICY "Public can read public requests" ON requests FOR SELECT USING (status = 'CREATED' OR status = 'OFFER_RECEIVED');
CREATE POLICY "Leaders can manage own requests" ON requests FOR ALL USING (auth.uid()::text = leader_id::text);


CREATE POLICY "Musicians can read own offers" ON offers FOR SELECT USING (auth.uid()::text = musician_id::text);
CREATE POLICY "Leaders can read offers for their requests" ON offers FOR SELECT USING (EXISTS(SELECT 1 FROM requests WHERE requests.id = offers.request_id AND requests.leader_id::text = auth.uid()::text));
CREATE POLICY "Musicians can create offers" ON offers FOR INSERT WITH CHECK (auth.role() = 'musician');
CREATE POLICY "Musicians can update own offers" ON offers FOR UPDATE USING (auth.uid()::text = musician_id::text);
CREATE POLICY "Leaders can update offers for their requests" ON offers FOR UPDATE USING (EXISTS(SELECT 1 FROM requests WHERE requests.id = offers.request_id AND requests.leader_id::text = auth.uid()::text));

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Musicians can manage their own availability" ON musician_availability FOR ALL USING (auth.uid()::text = musician_id::text);
CREATE POLICY "Admins can manage all availability" ON musician_availability FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));

CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can view all balances" ON user_balances FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));
CREATE POLICY "Users can view own transactions" ON user_transactions FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Admins can manage transactions" ON user_transactions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));

CREATE POLICY "Admins can manage admin actions" ON admin_actions FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text::uuid AND users.role = 'admin'));