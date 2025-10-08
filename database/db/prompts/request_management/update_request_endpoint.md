### Endpoint para actualizar una solicitud existente

**Propósito:** Este endpoint permitirá al líder de una solicitud modificar los detalles de una solicitud existente, siempre y cuando su estado lo permita.

**Método HTTP:** `PUT` o `PATCH`

**Ruta:** `/api/requests/:request_id` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `event_type_id`: Nuevo UUID del tipo de evento (opcional).
-   `event_date`: Nueva fecha y hora del evento (opcional).
-   `duration_minutes`: Nueva duración estimada del evento en minutos (opcional).
-   `location`: Nueva ubicación del evento (opcional).
-   `notes`: Nuevas notas adicionales (opcional).
-   `required_instruments`: Nuevo array de objetos con `instrument_id` y `quantity` (opcional, puede requerir lógica de actualización/eliminación).
-   `budget`: Nuevo presupuesto (opcional).

**Lógica del Backend:**
1.  Recibir la solicitud `PUT`/`PATCH` con el `request_id` en la URL y los datos a actualizar en el cuerpo.
2.  Validar el `request_id` y los datos de entrada.
3.  Conectar a la base de datos.
4.  Verificar el estado actual de la solicitud para asegurar que se puede modificar (ej. no se puede modificar si ya está `CONFIRMED` o `IN_PROGRESS`).
5.  Actualizar los campos correspondientes en la tabla `requests`.
6.  Si `required_instruments` se proporciona, actualizar la tabla `request_instruments` (esto podría implicar eliminar los existentes e insertar los nuevos, o realizar un `UPSERT`).
7.  Recalcular el precio de la solicitud si los campos relevantes han cambiado (llamando a `calculate_request_price`).
8.  Manejar posibles errores (ej. `request_id` no encontrado, estado no modificable, datos inválidos).
9.  Devolver una respuesta 200 OK si la actualización fue exitosa.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo el líder de la solicitud pueda modificarla.
-   Manejo de transacciones para asegurar la atomicidad de la actualización.
-   La lógica para actualizar `request_instruments` puede ser compleja y debe ser robusta.

**Tablas/Funciones de BD involucradas:**
-   `requests` (tabla, actualización)
-   `request_instruments` (tabla, actualización/inserción/eliminación)
-   `calculate_request_price()` (función, si es necesario recalcular el precio)