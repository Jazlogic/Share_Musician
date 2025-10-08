### Endpoint para el registro de un nuevo usuario

**Propósito:** Este endpoint permitirá a un nuevo usuario registrarse en el sistema, creando una nueva cuenta de usuario y su contraseña asociada.

**Método HTTP:** `POST`

**Ruta:** `/api/auth/register` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `name`: Nombre completo del usuario.
-   `email`: Dirección de correo electrónico del usuario (debe ser única).
-   `password`: Contraseña del usuario.
-   `role`: Rol inicial del usuario (ej. `LEADER`, `MUSICIAN`).

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con los datos de registro.
2.  Validar los datos de entrada (ej. formato de email, longitud de contraseña, unicidad del email).
3.  Conectar a la base de datos.
4.  Hashear la contraseña del usuario.
5.  Insertar el nuevo usuario en la tabla `users`.
6.  Insertar la contraseña hasheada en la tabla `user_passwords`.
7.  Manejar posibles errores (ej. email ya registrado, datos inválidos).
8.  Devolver una respuesta 201 Created con un token de autenticación (JWT) y los datos básicos del usuario, o un mensaje de éxito.

**Consideraciones:**
-   Implementar un buen algoritmo de hasheo de contraseñas (ej. bcrypt).
-   Considerar el envío de un correo electrónico de verificación después del registro.
-   Definir claramente los roles de usuario y sus permisos.

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla, inserción)
-   `user_passwords` (tabla, inserción)