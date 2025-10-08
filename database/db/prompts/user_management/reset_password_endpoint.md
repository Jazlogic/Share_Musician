### Endpoint para restablecer la contraseña

**Propósito:** Este endpoint permitirá a un usuario establecer una nueva contraseña utilizando un token de restablecimiento de contraseña válido.

**Método HTTP:** `POST`

**Ruta:** `/api/auth/reset-password` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `token`: Token de restablecimiento de contraseña recibido por correo electrónico.
-   `new_password`: La nueva contraseña que el usuario desea establecer.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el token y la nueva contraseña.
2.  Validar la `new_password` (ej. longitud, complejidad).
3.  Conectar a la base de datos.
4.  Buscar el usuario asociado al `token` de restablecimiento de contraseña.
5.  Verificar que el token sea válido y no haya expirado.
6.  Hashear la `new_password`.
7.  Actualizar la contraseña hasheada del usuario en la tabla `user_passwords`.
8.  Invalidar el token de restablecimiento de contraseña (ej. eliminándolo o marcándolo como usado).
9.  Manejar posibles errores (ej. token inválido o expirado, nueva contraseña no cumple requisitos).
10. Devolver una respuesta 200 OK con un mensaje de éxito.

**Consideraciones:**
-   Asegurar que el token se invalide inmediatamente después de su uso.
-   Notificar al usuario por correo electrónico que su contraseña ha sido cambiada exitosamente.

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla, para buscar usuario y validar/invalidar token)
-   `user_passwords` (tabla, para actualizar contraseña)