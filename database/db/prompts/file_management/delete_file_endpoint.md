### Endpoint para eliminar un archivo

**Propósito:** Este endpoint permitirá a un usuario autorizado eliminar un archivo del sistema.

**Método HTTP:** `DELETE`

**Ruta:** `/api/files/:file_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `file_id`: UUID del archivo a eliminar.

**Lógica del Backend:**
1.  Recibir la solicitud `DELETE` con el `file_id` en la URL.
2.  Validar el `file_id`.
3.  Conectar a la base de datos para obtener los metadatos del archivo (ruta de almacenamiento).
4.  Eliminar el archivo del sistema de almacenamiento (local, S3, GCS).
5.  Eliminar los metadatos del archivo de la tabla `files` o `storage` en la base de datos.
6.  Manejar posibles errores (ej. archivo no encontrado, error de eliminación).
7.  Devolver una respuesta 204 No Content si la eliminación fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo usuarios autorizados (ej. el propietario del archivo o un administrador) puedan eliminarlo.
-   Implementar una confirmación antes de la eliminación para evitar borrados accidentales.
-   Considerar la eliminación lógica (marcar como inactivo) en lugar de la eliminación física si se necesita mantener un historial o si el archivo está referenciado en otros lugares.

**Tablas/Funciones de BD involucradas:**
-   `files` o `storage` (tabla, eliminación)