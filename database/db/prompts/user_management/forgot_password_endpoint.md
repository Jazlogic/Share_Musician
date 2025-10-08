### Endpoint para solicitar restablecimiento de contraseña

**Propósito:** Este endpoint permitirá a un usuario solicitar un restablecimiento de contraseña si ha olvidado la suya. Se enviará un correo electrónico con un enlace o código para restablecer la contraseña.

**Método HTTP:** `POST`

**Ruta:** `/api/auth/forgot-password` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `email`: Dirección de correo electrónico del usuario que solicita el restablecimiento.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el email del usuario.
2.  Validar el email.
3.  Conectar a la base de datos.
4.  Buscar el usuario por `email` en la tabla `users`.
5.  Generar un token único y con fecha de expiración para el restablecimiento de contraseña.
6.  Almacenar este token asociado al usuario en una tabla temporal o en la tabla `users` (ej. `reset_password_token`, `reset_password_expires_at`).
7.  Enviar un correo electrónico al usuario con un enlace que contenga este token.
8.  Manejar posibles errores (ej. email no registrado).
9.  Devolver una respuesta 200 OK con un mensaje indicando que se ha enviado un correo electrónico (sin revelar si el email existe o no por seguridad).

**Consideraciones:**
-   El token debe ser seguro (aleatorio y difícil de adivinar) y tener una fecha de expiración corta.
-   El enlace en el correo electrónico debe apuntar a una página del frontend donde el usuario pueda introducir su nueva contraseña.
-   Implementar un mecanismo para evitar el abuso de esta funcionalidad (ej. limitar el número de solicitudes por email en un período de tiempo).

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla, para buscar usuario y almacenar token de restablecimiento)