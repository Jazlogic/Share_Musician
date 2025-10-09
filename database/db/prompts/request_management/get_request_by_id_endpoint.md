### Endpoint para obtener una solicitud por ID

**Propósito:** Este endpoint permitirá obtener los detalles completos de una solicitud específica utilizando su ID.

**Método HTTP:** `GET`

**Ruta:** `/api/requests/:request_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `request_id`: UUID de la solicitud a recuperar.

**Lógica del Backend:**
1.  Recibir la solicitud `GET` con el `request_id` en la URL.
2.  Validar el `request_id`.
3.  Conectar a la base de datos.
4.  Consultar la tabla `requests` y tablas relacionadas (ej. `request_instruments`, `offers`, `users` para líder y músico) para obtener todos los detalles de la solicitud.
5.  Manejar el caso en que el `request_id` no exista (devolver 404 Not Found).
6.  Formatear los resultados en un objeto JSON.
7.  Devolver la respuesta al cliente.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder de la solicitud, el músico asignado o un administrador puedan ver los detalles.
-   Considerar la posibilidad de incluir información adicional como el historial de estado de la solicitud (`request_status_history`).

**Tablas/Vistas de BD involucradas:**
-   `requests` (tabla)
-   `request_instruments` (tabla)
-   `offers` (tabla)
-   `users` (tabla)
-   `request_status_history` (tabla, opcional)