### Endpoint para cambiar la contraseña de un usuario

**Propósito:** Este endpoint permitirá a un usuario autenticado cambiar su contraseña actual por una nueva.

**Método HTTP:** `POST`

**Ruta:** `/api/users/:user_id/change-password` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `current_password`: La contraseña actual del usuario.
-   `new_password`: La nueva contraseña que el usuario desea establecer.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el `user_id` en la URL y las contraseñas en el cuerpo.
2.  Validar el `user_id` y las contraseñas (ej. `new_password` debe cumplir requisitos de complejidad).
3.  Conectar a la base de datos.
4.  Buscar la contraseña hasheada actual del usuario en la tabla `user_passwords`.
5.  Comparar la `current_password` proporcionada con la contraseña hasheada almacenada.
6.  Si la `current_password` es correcta:
    a.  Hashear la `new_password`.
    b.  Actualizar la contraseña hasheada en la tabla `user_passwords`.
7.  Manejar posibles errores (ej. `user_id` no encontrado, `current_password` incorrecta, `new_password` no cumple requisitos).
8.  Devolver una respuesta 200 OK con un mensaje de éxito.

**Consideraciones:**
-   Autenticación y autorización para asegurar que un usuario solo pueda cambiar su propia contraseña.
-   Invalidar cualquier token de sesión existente después de un cambio de contraseña exitoso para forzar al usuario a iniciar sesión nuevamente.

**Tablas/Funciones de BD involucradas:**
-   `user_passwords` (tabla, para verificar y actualizar contraseña)