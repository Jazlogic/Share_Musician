### Endpoint para cancelar una solicitud

**Propósito:** Este endpoint permitirá al líder o a un administrador cancelar una solicitud de evento, cambiando su estado a `CANCELLED_BY_CLIENT` o `CANCELLED_BY_MUSICIAN`.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/requests/:request_id/cancel` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `cancellation_reason`: Razón de la cancelación (opcional).
-   `cancelled_by`: Indica quién cancela la solicitud (`CLIENT` o `MUSICIAN`).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `request_id` en la URL y la razón de cancelación en el cuerpo.
2.  Validar el `request_id` y la razón de cancelación.
3.  Conectar a la base de datos.
4.  Verificar el estado actual de la solicitud para asegurar que se puede cancelar.
5.  Actualizar el `status` de la solicitud en la tabla `requests` a `CANCELLED_BY_CLIENT` o `CANCELLED_BY_MUSICIAN` según corresponda.
6.  Registrar la cancelación en `request_status_history`.
7.  Manejar posibles errores (ej. `request_id` no encontrado, estado no cancelable).
8.  Devolver una respuesta 200 OK si la cancelación fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder o un administrador puedan cancelar la solicitud.
-   Posiblemente, notificar al músico (si ya hay uno asignado) sobre la cancelación.
-   Manejar la lógica de reembolsos o cargos por cancelación si aplica.

**Tablas/Funciones de BD involucradas:**
-   `requests` (tabla, actualización del `status`)
-   `request_status_history` (tabla, inserción)