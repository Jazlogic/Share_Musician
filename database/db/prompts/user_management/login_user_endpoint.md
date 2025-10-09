### Endpoint para el inicio de sesión de usuarios

**Propósito:** Este endpoint permitirá a un usuario autenticarse en el sistema proporcionando sus credenciales (email y contraseña) y recibir un token de autenticación.

**Método HTTP:** `POST`

**Ruta:** `/api/auth/login` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `email`: Dirección de correo electrónico del usuario.
-   `password`: Contraseña del usuario.

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con las credenciales del usuario.
2.  Validar los datos de entrada (ej. formato de email).
3.  Conectar a la base de datos.
4.  Buscar el usuario por `email` en la tabla `users`.
5.  Recuperar la contraseña hasheada de la tabla `user_passwords`.
6.  Comparar la contraseña proporcionada con la contraseña hasheada almacenada.
7.  Si las credenciales son válidas, generar un token de autenticación (JWT).
8.  Manejar posibles errores (ej. credenciales inválidas, usuario no encontrado).
9.  Devolver una respuesta 200 OK con el token de autenticación y los datos básicos del usuario.

**Consideraciones:**
-   Implementar un mecanismo seguro para la generación y gestión de tokens JWT.
-   Considerar la implementación de tasas limitadas para prevenir ataques de fuerza bruta.
-   Asegurar que la comunicación se realice a través de HTTPS.

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla, para buscar usuario)
-   `user_passwords` (tabla, para verificar contraseña)