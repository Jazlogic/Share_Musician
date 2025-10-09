### Endpoint para crear una nueva publicación

**Propósito:** Este endpoint permitirá a un usuario autenticado crear una nueva publicación (por ejemplo, un anuncio, una noticia, un blog, etc.).

**Método HTTP:** `POST`

**Ruta:** `/api/posts` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `title`: Título de la publicación (obligatorio).
-   `content`: Contenido de la publicación (obligatorio).
-   `author_id`: ID del autor de la publicación (se puede obtener del token de autenticación).
-   `category`: Categoría de la publicación (opcional).
-   `tags`: Array de etiquetas asociadas a la publicación (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con los datos de la nueva publicación.
2.  Validar los datos de entrada (ej. campos obligatorios, longitud del título/contenido).
3.  Conectar a la base de datos.
4.  Insertar los datos de la nueva publicación en la tabla `posts`.
5.  Si se proporcionan `tags`, insertar las relaciones en una tabla `post_tags`.
6.  Manejar posibles errores (ej. datos inválidos).
7.  Devolver una respuesta 201 Created con los datos de la publicación recién creada.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo usuarios autorizados puedan crear publicaciones.
-   Manejo de transacciones si se insertan datos en múltiples tablas (ej. `posts` y `post_tags`).

**Tablas/Funciones de BD involucradas:**
-   `posts` (tabla, inserción)
-   `post_tags` (tabla, inserción, opcional)