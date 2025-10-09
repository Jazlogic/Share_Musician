### Endpoint para obtener el perfil de un usuario

**Propósito:** Este endpoint permitirá obtener la información del perfil de un usuario específico, incluyendo sus datos personales, roles, instrumentos, etc.

**Método HTTP:** `GET`

**Ruta:** `/api/users/:user_id/profile` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `user_id`: UUID del usuario cuyo perfil se desea obtener.

**Lógica del Backend:**
1.  Recibir la solicitud `GET` con el `user_id` en la URL.
2.  Validar el `user_id`.
3.  Conectar a la base de datos.
4.  Consultar la tabla `users` para obtener los datos básicos del usuario.
5.  Opcionalmente, consultar tablas relacionadas como `user_instruments` para obtener los instrumentos del músico, o `musician_tariffs` para sus tarifas.
6.  Manejar el caso en que el `user_id` no exista (devolver 404 Not Found).
7.  Formatear los resultados en un objeto JSON.
8.  Devolver la respuesta al cliente.

**Consideraciones:**
-   Autenticación y autorización para asegurar que un usuario solo pueda ver su propio perfil o que un administrador pueda ver cualquier perfil.
-   Considerar qué información es pública y cuál requiere autenticación o autorización especial.

**Tablas/Funciones de BD involucradas:**
-   `users` (tabla)
-   `user_instruments` (tabla, opcional)
-   `musician_tariffs` (tabla, opcional)