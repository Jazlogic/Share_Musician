### Endpoint para obtener detalles de una iglesia por ID

**Propósito:** Este endpoint permitirá obtener la información detallada de una iglesia específica utilizando su ID.

**Método HTTP:** `GET`

**Ruta:** `/api/churches/:church_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `church_id`: UUID de la iglesia cuyos detalles se desean obtener.

**Lógica del Backend:**
1.  Recibir la solicitud `GET` con el `church_id` en la URL.
2.  Validar el `church_id`.
3.  Conectar a la base de datos.
4.  Consultar la tabla `churches` para obtener los datos de la iglesia.
5.  Manejar el caso en que el `church_id` no exista (devolver 404 Not Found).
6.  Formatear los resultados en un objeto JSON.
7.  Devolver la respuesta al cliente.

**Consideraciones:**
-   Considerar si esta información debe ser pública o si requiere algún tipo de autenticación/autorización.

**Tablas/Funciones de BD involucradas:**
-   `churches` (tabla)