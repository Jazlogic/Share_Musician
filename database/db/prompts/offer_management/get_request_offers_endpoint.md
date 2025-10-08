### Endpoint para obtener todas las ofertas de una solicitud

**Propósito:** Este endpoint permitirá al líder de una solicitud o a un administrador obtener una lista de todas las ofertas que se han realizado para una solicitud de evento específica.

**Método HTTP:** `GET`

**Ruta:** `/api/requests/:request_id/offers` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `request_id`: UUID de la solicitud para la cual se desean obtener las ofertas.

**Parámetros de consulta (opcionales):**
-   `status`: Filtrar por estado de la oferta (ej. `PENDING`, `ACCEPTED`, `REJECTED`).
-   `limit`, `offset`: Para paginación.

**Lógica del Backend:**
1.  Recibir la solicitud `GET` con el `request_id` en la URL.
2.  Validar el `request_id`.
3.  Conectar a la base de datos.
4.  Consultar la tabla `offers` filtrando por `request_id`.
5.  Opcionalmente, unir con la tabla `users` para obtener detalles del músico que hizo la oferta.
6.  Aplicar filtros y paginación si se proporcionan.
7.  Formatear los resultados en un array de objetos JSON.
8.  Devolver la respuesta al cliente.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder de la solicitud o un administrador puedan ver las ofertas.
-   Manejar el caso en que no haya ofertas para la solicitud.

**Tablas/Funciones de BD involucradas:**
-   `offers` (tabla)
-   `users` (tabla, para detalles del músico)