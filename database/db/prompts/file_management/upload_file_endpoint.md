### Endpoint para subir archivos

**Propósito:** Este endpoint permitirá a los usuarios subir archivos (por ejemplo, imágenes de perfil, archivos de audio, documentos) al sistema.

**Método HTTP:** `POST`

**Ruta:** `/api/upload` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `file`: El archivo a subir (multipart/form-data).
-   `file_type`: Tipo de archivo (ej. 'image', 'audio', 'document') para categorización y validación (opcional).
-   `associated_id`: ID de la entidad a la que se asocia el archivo (ej. `user_id` para una imagen de perfil, `post_id` para un archivo adjunto a una publicación) (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `POST` con el archivo y metadatos.
2.  Validar el archivo (ej. tamaño, tipo de archivo permitido).
3.  Procesar el archivo subido (ej. guardarlo en un sistema de almacenamiento de archivos como S3, Google Cloud Storage, o en el sistema de archivos local).
4.  Generar un nombre de archivo único y una URL de acceso.
5.  Almacenar los metadatos del archivo (nombre original, nombre guardado, URL, tipo, tamaño, `associated_id`) en una tabla `files` o `storage` en la base de datos.
6.  Manejar posibles errores (ej. archivo demasiado grande, tipo de archivo no permitido, error de almacenamiento).
7.  Devolver una respuesta 201 Created con la URL del archivo subido y sus metadatos.

**Consideraciones:**
-   Autenticación y autorización para controlar quién puede subir archivos.
-   Implementar validación de seguridad para prevenir la subida de archivos maliciosos.
-   Considerar el uso de un servicio de almacenamiento en la nube para escalabilidad y durabilidad.
-   Manejo de miniaturas o diferentes tamaños de imagen si se suben imágenes.

**Tablas/Funciones de BD involucradas:**
-   `files` o `storage` (tabla, inserción)