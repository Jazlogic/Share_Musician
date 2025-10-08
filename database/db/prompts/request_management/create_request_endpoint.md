### Endpoint para crear una nueva solicitud (Request)

**Propósito:** Este endpoint permitirá a un líder crear una nueva solicitud de evento, especificando los detalles del evento, instrumentos requeridos y otros parámetros.

**Método HTTP:** `POST`

**Ruta:** `/api/requests` (ejemplo)

**Parámetros de la solicitud (en el cuerpo):**
-   `leader_id`: UUID del líder que crea la solicitud (obtenido del token de autenticación).
-   `event_type_id`: UUID del tipo de evento.
-   `event_date`: Fecha y hora del evento.
-   `duration_minutes`: Duración estimada del evento en minutos.
-   `location`: Ubicación del evento (puede ser un objeto JSONB con lat/lon o dirección).
-   `notes`: Notas adicionales para el músico.
-   `required_instruments`: Array de objetos con `instrument_id` y `quantity`.
-   `budget`: Presupuesto opcional para el evento.

**Lógica del Backend:**
1.  Recibir la solicitud `POST`.
2.  Validar los datos de entrada, asegurando que todos los campos obligatorios estén presentes y sean válidos.
3.  Conectar a la base de datos.
4.  Insertar la nueva solicitud en la tabla `requests`.
5.  Insertar los instrumentos requeridos en la tabla `request_instruments`.
6.  Calcular el precio inicial de la solicitud (posiblemente llamando a `calculate_request_price`).
7.  Establecer el estado inicial de la solicitud como `CREATED`.
8.  Manejar posibles errores (ej. `event_type_id` inválido, `instrument_id` inválido).
9.  Devolver una respuesta con el ID de la nueva solicitud creada y un estado 201 Created.

**Consideraciones:**
-   Autenticación y autorización para asegurar que solo los líderes puedan crear solicitudes.
-   Manejo de transacciones para asegurar la atomicidad de la creación de la solicitud y sus instrumentos.
-   Posiblemente, un trigger en la base de datos para notificar a los músicos relevantes sobre la nueva solicitud (usando `notify_musicians_new_request`).

**Tablas/Funciones de BD involucradas:**
-   `requests` (tabla, inserción)
-   `request_instruments` (tabla, inserción)
-   `event_types` (tabla, para validar `event_type_id`)
-   `instruments` (tabla, para validar `instrument_id`)
-   `calculate_request_price()` (función, para calcular el precio)
-   `notify_musicians_new_request()` (función, llamada por trigger)