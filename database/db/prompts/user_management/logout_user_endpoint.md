### Endpoint para el cierre de sesión de usuarios

**Propósito:** Este endpoint permitirá a un usuario cerrar su sesión, invalidando su token de autenticación o eliminándolo del almacenamiento del cliente.

**Método HTTP:** `POST`

**Ruta:** `/api/auth/logout` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   No se requieren parámetros en el cuerpo, ya que la acción se basa en el token de autenticación presente en los encabezados.

**Lógica del Backend:**
1.  Recibir la solicitud `POST`.
2.  Extraer el token de autenticación de los encabezados.
3.  Si se utiliza una lista negra de tokens (blacklist), añadir el token actual a la lista negra para invalidarlo.
4.  Si el token es de corta duración y no se usa blacklist, simplemente se puede devolver un mensaje de éxito, ya que el cliente será responsable de eliminar el token.
5.  Devolver una respuesta 200 OK con un mensaje de éxito.

**Consideraciones:**
-   La implementación dependerá de cómo se gestione la autenticación (ej. JWT con o sin lista negra, sesiones).
-   Asegurar que la comunicación se realice a través de HTTPS.

**Tablas/Funciones de BD involucradas:**
-   Ninguna tabla de BD directamente, a menos que se implemente una tabla para la lista negra de tokens.