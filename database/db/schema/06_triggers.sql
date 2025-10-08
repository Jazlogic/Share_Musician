-- Este disparador (trigger) se activa automáticamente antes de que se realice una operación de ACTUALIZACIÓN (UPDATE) en la tabla 'users'.
-- Su propósito principal es asegurar que la columna 'updated_at' de la fila afectada se actualice con la marca de tiempo actual.
-- Esto es útil para llevar un registro de cuándo fue la última vez que se modificó un registro de usuario.
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'requests'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la solicitud con la marca de tiempo actual,
-- registrando así la última modificación de una solicitud.
CREATE TRIGGER trg_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'offers'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la oferta con la marca de tiempo actual,
-- registrando así la última modificación de una oferta.
CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'notifications'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la notificación con la marca de tiempo actual,
-- registrando así la última modificación de una notificación.
CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'musician_availability'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la disponibilidad del músico con la marca de tiempo actual,
-- registrando así la última modificación de la disponibilidad.
CREATE TRIGGER trg_musician_availability_updated_at BEFORE UPDATE ON musician_availability FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'pricing_config'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la configuración de precios con la marca de tiempo actual,
-- registrando así la última modificación de la configuración.
CREATE TRIGGER trg_pricing_config_updated_at BEFORE UPDATE ON pricing_config FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'user_balances'.
-- Su función es actualizar automáticamente la columna 'updated_at' del balance del usuario con la marca de tiempo actual,
-- registrando así la última modificación del balance.
CREATE TRIGGER trg_user_balances_updated_at BEFORE UPDATE ON user_balances FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de ACTUALIZACIÓN en la tabla 'user_transactions'.
-- Su función es actualizar automáticamente la columna 'updated_at' de la transacción del usuario con la marca de tiempo actual,
-- registrando así la última modificación de la transacción.
CREATE TRIGGER trg_user_transactions_updated_at BEFORE UPDATE ON user_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- Este disparador se activa ANTES de una operación de INSERCIÓN o ACTUALIZACIÓN en la tabla 'requests'.
-- Su propósito es calcular el precio de la solicitud de evento utilizando la función 'calculate_request_price()'
-- y almacenar el resultado en la columna 'price' de la solicitud.
CREATE TRIGGER trg_calculate_request_price BEFORE INSERT OR UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION calculate_request_price();
-- Este disparador se activa DESPUÉS de una operación de INSERCIÓN o ACTUALIZACIÓN en la tabla 'user_transactions'.
-- Su función es actualizar el balance del usuario asociado a la transacción,
-- utilizando la función 'update_user_balance()' para reflejar los cambios en el balance.
CREATE TRIGGER trg_user_transactions_after_insert_update AFTER INSERT OR UPDATE ON user_transactions FOR EACH ROW EXECUTE FUNCTION update_user_balance();
-- Este disparador se activa DESPUÉS de una operación de INSERCIÓN en la tabla 'requests'.
-- Su propósito es notificar a los músicos sobre una nueva solicitud de evento,
-- utilizando la función 'notify_musicians_new_request()' para enviar las notificaciones pertinentes.
CREATE TRIGGER trg_notify_musicians_new_request AFTER INSERT ON requests FOR EACH ROW EXECUTE FUNCTION notify_musicians_new_request();
-- Este disparador se activa DESPUÉS de una operación de INSERCIÓN en la tabla 'offers'.
-- Su propósito es notificar al líder de la solicitud cuando un músico ha realizado una nueva oferta,
-- utilizando la función 'notify_leader_new_offer()' para generar la notificación.
CREATE TRIGGER trg_notify_leader_new_offer AFTER INSERT ON offers FOR EACH ROW EXECUTE FUNCTION notify_leader_new_offer();
-- Este disparador se activa DESPUÉS de una operación de ACTUALIZACIÓN en la tabla 'offers'.
-- Su propósito es notificar al músico cuya oferta ha sido seleccionada (aceptada) para un evento,
-- utilizando la función 'notify_musician_offer_selected()' para enviar la notificación correspondiente.
CREATE TRIGGER trg_notify_musician_offer_selected AFTER UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION notify_musician_offer_selected();

-- Este disparador se activa DESPUÉS de una operación de ACTUALIZACIÓN en la tabla 'requests'.
-- Su propósito es notificar al líder y al músico cuando el estado de la solicitud cambia a 'IN_PROGRESS',
-- utilizando la función 'notify_event_status_change()' para enviar las notificaciones pertinentes.
CREATE TRIGGER trg_notify_event_status_change AFTER UPDATE ON requests FOR EACH ROW WHEN (NEW.status = 'IN_PROGRESS' AND OLD.status IS DISTINCT FROM 'IN_PROGRESS') EXECUTE FUNCTION notify_event_status_change();