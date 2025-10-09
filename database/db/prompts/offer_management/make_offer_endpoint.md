### Endpoint para que un músico haga una oferta en una solicitud

**Propósito:** Este endpoint permitirá a un músico enviar una oferta para una solicitud de evento específica, indicando su interés y el precio propuesto.

**Método HTTP:** `POST`

**Ruta:** `/api/requests/:request_id/offers` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `musician_id`: UUID del músico que hace la oferta (obtenido del token de autenticación).
-   `price`: Precio propuesto por el músico para el evento.
-   `message`: Mensaje opcional del músico al líder.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el `request_id` en la URL y los detalles de la oferta en el cuerpo.
2.  Validar el `request_id` y los datos de la oferta (ej. `price` debe ser positivo).
3.  Conectar a la base de datos.
4.  Verificar que la solicitud existe y está en un estado que permite recibir ofertas (ej. `CREATED`).
5.  Verificar que el `musician_id` es válido y que el músico no ha hecho ya una oferta para esta solicitud.
6.  Insertar la nueva oferta en la tabla `offers` con el estado `PENDING`.
7.  Actualizar el estado de la solicitud a `OFFER_RECEIVED` en la tabla `requests` si es la primera oferta.
8.  Notificar al líder sobre la nueva oferta (usando `notify_leader_new_offer`).
9.  Manejar posibles errores (ej. solicitud no encontrada, músico ya ofertó, datos inválidos).
10. Devolver una respuesta 201 Created con el ID de la nueva oferta.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo los músicos puedan hacer ofertas.
-   Manejo de transacciones para asegurar la atomicidad de la inserción de la oferta y la actualización del estado de la solicitud.

**Tablas/Funciones de BD involucradas:**
-   `offers` (tabla, inserción)
-   `requests` (tabla, actualización del `status`)
-   `notify_leader_new_offer()` (función, para notificar al líder)