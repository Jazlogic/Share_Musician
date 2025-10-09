### Endpoint para eliminar una publicación

**Propósito:** Este endpoint permitirá a un usuario autorizado eliminar una publicación del sistema.

**Método HTTP:** `DELETE`

**Ruta:** `/api/posts/:post_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `post_id`: UUID de la publicación a eliminar.

**Lógica del Backend:**
1.  Recibir la solicitud `DELETE` con el `post_id` en la URL.
2.  Validar el `post_id`.
3.  Conectar a la base de datos.
4.  Eliminar la publicación de la tabla `posts`.
5.  Considerar la eliminación en cascada o la invalidación de registros relacionados (ej. comentarios, etiquetas asociadas).
6.  Manejar posibles errores (ej. `post_id` no encontrado).
7.  Devolver una respuesta 204 No Content si la eliminación fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el autor de la publicación o un administrador pueda eliminarla.
-   Implementar una confirmación antes de la eliminación para evitar borrados accidentales.
-   Considerar la eliminación lógica (marcar como inactiva) en lugar de la eliminación física si se necesita mantener un historial.

**Tablas/Funciones de BD involucradas:**
-   `posts` (tabla, eliminación)
-   `post_tags` (tabla, eliminación, opcional)