### Endpoint para crear una nueva iglesia

**Propósito:** Este endpoint permitirá a un usuario (probablemente un administrador o un líder de iglesia) registrar una nueva iglesia en el sistema.

**Método HTTP:** `POST`

**Ruta:** `/api/churches` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `name`: Nombre de la iglesia (obligatorio).
-   `address`: Dirección de la iglesia (obligatorio).
-   `city`: Ciudad donde se encuentra la iglesia (obligatorio).
-   `state`: Estado/Provincia donde se encuentra la iglesia (obligatorio).
-   `zip_code`: Código postal de la iglesia (obligatorio).
-   `country`: País donde se encuentra la iglesia (obligatorio).
-   `contact_email`: Correo electrónico de contacto de la iglesia (opcional).
-   `contact_phone`: Número de teléfono de contacto de la iglesia (opcional).
-   `website`: Sitio web de la iglesia (opcional).
-   `description`: Descripción de la iglesia (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con los datos de la nueva iglesia.
2.  Validar los datos de entrada (ej. campos obligatorios, formato de email/teléfono).
3.  Conectar a la base de datos.
4.  Insertar los datos de la nueva iglesia en la tabla `churches`.
5.  Manejar posibles errores (ej. nombre de iglesia duplicado, datos inválidos).
6.  Devolver una respuesta 201 Created con los datos de la iglesia recién creada.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo usuarios autorizados puedan crear iglesias.
-   Posiblemente, asociar la iglesia con el usuario que la crea (ej. `created_by_user_id`).

**Tablas/Funciones de BD involucradas:**
-   `churches` (tabla, inserción)