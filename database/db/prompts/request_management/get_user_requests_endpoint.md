### Endpoint para obtener todas las solicitudes de un usuario

**Propósito:** Este endpoint permitirá a un usuario autenticado obtener una lista de todas las solicitudes de eventos en las que está involucrado, ya sea como líder (creador de la solicitud) o como músico (con una oferta aceptada o pendiente).

**Método HTTP:** `GET`

**Ruta:** `/api/users/:user_id/requests` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `user_id`: UUID del usuario (obtenido del token de autenticación).

**Parámetros de consulta (opcionales):**
-   `role`: Filtrar por rol (`leader` o `musician`).
-   `status`: Filtrar por estado de la solicitud (ej. `CREATED`, `CONFIRMED`, `IN_PROGRESS`).
-   `limit`, `offset`: Para paginación.

**Lógica del Backend:**
1.  Recibir la solicitud `GET` con el `user_id` en la URL.
2.  Validar el `user_id` (debe coincidir con el usuario autenticado o ser un administrador).
3.  Conectar a la base de datos.
4.  Realizar una consulta que combine solicitudes donde el usuario es el `leader_id` y solicitudes donde el usuario es el `musician_id` en una oferta `ACCEPTED`.
5.  Aplicar filtros y paginación si se proporcionan.
6.  Formatear los resultados en un array de objetos JSON.
7.  Devolver la respuesta al cliente.

**Consideraciones:**
-   Autenticación y autorización para asegurar que un usuario solo pueda ver sus propias solicitudes o que un administrador pueda ver todas.
-   La consulta puede ser compleja, por lo que se debe optimizar para el rendimiento (posiblemente utilizando la vista materializada `request_overview` o uniendo `requests` y `offers`).

**Tablas/Vistas de BD involucradas:**
-   `requests` (tabla)
-   `offers` (tabla)
-   `request_overview` (vista materializada, para optimización)