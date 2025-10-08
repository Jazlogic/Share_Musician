### Endpoint para eliminar una iglesia

**Propósito:** Este endpoint permitirá a un usuario autorizado eliminar una iglesia del sistema.

**Método HTTP:** `DELETE`

**Ruta:** `/api/churches/:church_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `church_id`: UUID de la iglesia a eliminar.

**Lógica del Backend:**
1.  Recibir la solicitud `DELETE` con el `church_id` en la URL.
2.  Validar el `church_id`.
3.  Conectar a la base de datos.
4.  Eliminar la iglesia de la tabla `churches`.
5.  Considerar la eliminación en cascada o la invalidación de registros relacionados (ej. eventos asociados a la iglesia, usuarios vinculados).
6.  Manejar posibles errores (ej. `church_id` no encontrado).
7.  Devolver una respuesta 204 No Content si la eliminación fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo usuarios con permisos adecuados (ej. administradores) puedan eliminar iglesias.
-   Implementar una confirmación antes de la eliminación para evitar borrados accidentales.
-   Considerar la eliminación lógica (marcar como inactiva) en lugar de la eliminación física si se necesita mantener un historial.

**Tablas/Funciones de BD involucradas:**
-   `churches` (tabla, eliminación)