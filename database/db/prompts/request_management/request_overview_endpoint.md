### Endpoint para consultar la vista materializada `request_overview`

**Propósito:** Este endpoint permitirá consultar de manera eficiente la vista materializada `request_overview` para obtener un resumen de las solicitudes de eventos, incluyendo información clave del líder, el evento y el tipo de evento.

**Método HTTP:** `GET`

**Ruta:** `/api/requests/overview` (ejemplo)

**Parámetros de la solicitud (opcionales):**
-   `status`: Filtrar por estado de la solicitud (ej. `CREATED`, `CONFIRMED`, `IN_PROGRESS`).
-   `leader_id`: Filtrar por el ID del líder que creó la solicitud.
-   `event_type_name`: Filtrar por el nombre del tipo de evento.
-   `start_date`, `end_date`: Filtrar por rango de fechas del evento.
-   `limit`, `offset`: Para paginación.

**Lógica del Backend:**
1.  Recibir la solicitud GET.
2.  Extraer y validar los parámetros de consulta (filtros, paginación).
3.  Construir una consulta SQL para seleccionar datos de la vista materializada `request_overview`, aplicando los filtros y la paginación proporcionados.
4.  Ejecutar la consulta en la base de datos.
5.  Formatear los resultados de la consulta en un formato adecuado (ej. JSON).
6.  Devolver la respuesta al cliente.

**Consideraciones:**
-   La vista materializada `request_overview` ya está optimizada para lecturas rápidas, por lo que el enfoque principal del endpoint será la construcción eficiente de la consulta y el manejo de los parámetros.
-   Se debe considerar la seguridad y la autenticación para asegurar que solo los usuarios autorizados puedan acceder a esta información.
-   Implementar validación de entrada robusta para todos los parámetros de consulta.
-   Manejar casos donde no se encuentren resultados.

**Tablas/Vistas de BD involucradas:**
-   `request_overview` (vista materializada)