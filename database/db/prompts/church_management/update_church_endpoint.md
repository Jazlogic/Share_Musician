### Endpoint para actualizar los detalles de una iglesia

**Propósito:** Este endpoint permitirá a un usuario autorizado actualizar la información de una iglesia existente.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/churches/:church_id` (ejemplo)

**Parámetros de la solicitud (en la URL):**
-   `church_id`: UUID de la iglesia a actualizar.

**Parámetros de la solicitud (en el cuerpo):**
-   `name`: Nuevo nombre de la iglesia (opcional).
-   `address`: Nueva dirección de la iglesia (opcional).
-   `city`: Nueva ciudad (opcional).
-   `state`: Nuevo estado/provincia (opcional).
-   `zip_code`: Nuevo código postal (opcional).
-   `country`: Nuevo país (opcional).
-   `contact_email`: Nuevo correo electrónico de contacto (opcional).
-   `contact_phone`: Nuevo número de teléfono de contacto (opcional).
-   `website`: Nuevo sitio web (opcional).
-   `description`: Nueva descripción (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `church_id` en la URL y los datos a actualizar en el cuerpo.
2.  Validar el `church_id` y los datos de entrada.
3.  Conectar a la base de datos.
4.  Actualizar los campos correspondientes en la tabla `churches` para la iglesia con el `church_id` proporcionado.
5.  Manejar posibles errores (ej. `church_id` no encontrado, datos inválidos).
6.  Devolver una respuesta 200 OK si la actualización fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo usuarios autorizados (ej. administradores o líderes de esa iglesia) puedan actualizar la información.

**Tablas/Funciones de BD involucradas:**
-   `churches` (tabla, actualización)