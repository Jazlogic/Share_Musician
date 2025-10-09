### Endpoint para actualizar una publicación

**Propósito:** Este endpoint permitirá a un usuario autorizado actualizar una publicación existente.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/posts/:post_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `post_id`: UUID de la publicación a actualizar.

**Parámetros de la solicitud (en el cuerpo):**
-   `title`: Nuevo título de la publicación (opcional).
-   `content`: Nuevo contenido de la publicación (opcional).
-   `category`: Nueva categoría de la publicación (opcional).
-   `tags`: Array de nuevas etiquetas asociadas a la publicación (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `post_id` en la URL y los datos a actualizar en el cuerpo.
2.  Validar el `post_id` y los datos de entrada.
3.  Conectar a la base de datos.
4.  Actualizar los campos correspondientes en la tabla `posts` para la publicación con el `post_id` proporcionado.
5.  Si se proporcionan `tags`, actualizar la tabla `post_tags` (puede implicar eliminar/insertar/actualizar).
6.  Manejar posibles errores (ej. `post_id` no encontrado, datos inválidos).
7.  Devolver una respuesta 200 OK si la actualización fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el autor de la publicación o un administrador pueda actualizarla.
-   Manejo de transacciones para asegurar la atomicidad de las actualizaciones en múltiples tablas.

**Tablas/Funciones de BD involucradas:**
-   `posts` (tabla, actualización)
-   `post_tags` (tabla, actualización/inserción/eliminación, opcional)