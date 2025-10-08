### Endpoint para aceptar una oferta de una solicitud

**Propósito:** Este endpoint permitirá al líder de una solicitud aceptar una oferta específica de un músico. Al aceptar una oferta, el estado de la solicitud cambiará a `OFFER_ACCEPTED` y se notificará al músico.

**Método HTTP:** `POST`

**Ruta:** `/api/requests/:request_id/offers/:offer_id/accept` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   No se requieren parámetros adicionales en el cuerpo, ya que el `request_id` y el `offer_id` se obtienen de la URL.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el `request_id` y `offer_id` en la URL.
2.  Validar el `request_id` y `offer_id`.
3.  Conectar a la base de datos.
4.  Verificar que la oferta existe y pertenece a la solicitud.
5.  Verificar que el usuario que realiza la acción es el líder de la solicitud.
6.  Actualizar el estado de la oferta a `ACCEPTED` en la tabla `offers`.
7.  Actualizar el estado de la solicitud a `OFFER_ACCEPTED` en la tabla `requests`.
8.  Registrar el cambio de estado en `request_status_history`.
9.  Notificar al músico cuya oferta fue aceptada (usando `notify_musician_offer_selected`).
10. Opcionalmente, rechazar automáticamente otras ofertas pendientes para la misma solicitud.
11. Manejar posibles errores (ej. oferta no encontrada, solicitud no encontrada, oferta ya aceptada/rechazada).
12. Devolver una respuesta 200 OK si la aceptación fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder pueda aceptar ofertas.
-   Manejo de transacciones para asegurar la atomicidad de las actualizaciones.

**Tablas/Funciones de BD involucradas:**
-   `requests` (tabla, actualización del `status`)
-   `offers` (tabla, actualización del `status`)
-   `request_status_history` (tabla, inserción)
-   `notify_musician_offer_selected()` (función, para notificar al músico)