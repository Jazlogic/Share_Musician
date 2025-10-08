### Endpoint para que un músico rechace una oferta

**Propósito:** Este endpoint permitirá a un músico rechazar una oferta que le ha sido enviada para una solicitud de evento.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/offers/:offer_id/reject` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `musician_id`: UUID del músico que rechaza la oferta (obtenido del token de autenticación).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `offer_id` en la URL.
2.  Validar el `offer_id`.
3.  Conectar a la base de datos.
4.  Verificar que la oferta existe y que el `musician_id` coincide con el músico al que se le hizo la oferta.
5.  Actualizar el estado de la oferta a `REJECTED` en la tabla `offers`.
6.  Manejar posibles errores (ej. oferta no encontrada, músico no autorizado, oferta ya aceptada/rechazada).
7.  Devolver una respuesta 200 OK si el rechazo fue exitoso.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el músico al que se le hizo la oferta pueda rechazarla.
-   Posiblemente, notificar al líder sobre el rechazo de la oferta.

**Tablas/Funciones de BD involucradas:**
-   `offers` (tabla, actualización del `status`)