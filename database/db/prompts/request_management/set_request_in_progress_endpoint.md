### Endpoint para actualizar el estado de una solicitud a 'IN_PROGRESS'

**Propósito:** Este endpoint permitirá actualizar el estado de una solicitud específica a 'IN_PROGRESS'. Al hacerlo, se activará automáticamente el trigger `trg_notify_event_status_change` en la base de datos, que a su vez llamará a la función `notify_event_status_change()` para enviar notificaciones al líder y al músico.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/requests/:request_id/set-in-progress` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   No se requieren parámetros adicionales en el cuerpo, ya que el nuevo estado es fijo (`IN_PROGRESS`). El `request_id` se obtiene de la URL.

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `request_id` en la URL.
2.  Validar el `request_id`.
3.  Conectar a la base de datos.
4.  Ejecutar una consulta `UPDATE` en la tabla `requests` para cambiar el `status` a 'IN_PROGRESS' para el `request_id` dado.
5.  Manejar posibles errores (ej. `request_id` no encontrado, estado actual no permite la transición a `IN_PROGRESS`).
6.  Devolver una respuesta adecuada (ej. 200 OK si la actualización fue exitosa, 404 si el `request_id` no existe, 400 si la transición de estado no es válida).

**Consideraciones:**
-   Asegurar que solo los usuarios autorizados (ej. administradores o el músico/líder en ciertas condiciones) puedan realizar esta acción.
-   La lógica de negocio para la transición de estados debe ser manejada cuidadosamente. Por ejemplo, una solicitud solo debería poder pasar a `IN_PROGRESS` desde ciertos estados previos (ej. `CONFIRMED`).
-   El trigger de la base de datos se encargará de las notificaciones, por lo que la lógica del endpoint se centrará en la actualización del estado.

**Tablas/Funciones de BD involucradas:**
-   `requests` (tabla, para actualizar el `status`)
-   `trg_notify_event_status_change` (trigger, se activa automáticamente)
-   `notify_event_status_change()` (función, llamada por el trigger)