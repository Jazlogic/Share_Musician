### Endpoint para actualizar el perfil de un usuario

**Propósito:** Este endpoint permitirá a un usuario actualizar la información de su perfil, como su nombre, ubicación, instrumentos, etc.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/users/:user_id/profile` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `name`: Nuevo nombre del usuario (opcional).
-   `location`: Nueva ubicación del usuario (opcional).
-   `bio`: Nueva biografía del usuario (opcional).
-   `instruments`: Array de objetos con `instrument_id` y `proficiency_level` (opcional, para músicos).
-   `tariffs`: Array de objetos con `instrument_id` y `price_per_hour` (opcional, para músicos).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `user_id` en la URL y los datos a actualizar en el cuerpo.
2.  Validar el `user_id` y los datos de entrada.
3.  Conectar a la base de datos.
4.  Actualizar los campos correspondientes en la tabla `users`.
5.  Si se proporcionan `instruments`, actualizar la tabla `user_instruments` (puede implicar eliminar/insertar/actualizar).
6.  Si se proporcionan `tariffs`, actualizar la tabla `musician_tariffs` (puede implicar eliminar/insertar/actualizar).
7.  Manejar posibles errores (ej. `user_id` no encontrado, datos inválidos).
8.  Devolver una respuesta 200 OK si la actualización fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que un usuario solo pueda actualizar su propio perfil.
-   Manejo de transacciones para asegurar la atomicidad de las actualizaciones en múltiples tablas.

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla, actualización)
-   `user_instruments` (tabla, actualización/inserción/eliminación)
-   `musician_tariffs` (tabla, actualización/inserción/eliminación)