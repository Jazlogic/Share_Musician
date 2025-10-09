### Endpoint para que un líder rechace una oferta

**Propósito:** Este endpoint permitirá al líder de una solicitud rechazar una oferta específica que ha recibido de un músico.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/requests/:request_id/offers/:offer_id/reject` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   No se requieren parámetros adicionales en el cuerpo, ya que el `request_id` y el `offer_id` se obtienen de la URL.

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `request_id` y `offer_id` en la URL.
2.  Validar el `request_id` y `offer_id`.
3.  Conectar a la base de datos.
4.  Verificar que la oferta existe y pertenece a la solicitud.
5.  Verificar que el usuario que realiza la acción es el líder de la solicitud.
6.  Actualizar el estado de la oferta a `REJECTED` en la tabla `offers`.
7.  Manejar posibles errores (ej. oferta no encontrada, solicitud no encontrada, oferta ya aceptada/rechazada).
8.  Devolver una respuesta 200 OK si el rechazo fue exitoso.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder pueda rechazar ofertas.
-   Posiblemente, notificar al músico cuya oferta fue rechazada.

**Tablas/Funciones de BD involucradas:**
-   `offers` (tabla, actualización del `status`)