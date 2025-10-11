-- =====================================================================================================================
-- Migración: V1.0.11__test_request_flow.sql 2025-10-11 12:28 p.m. JASBOOTSTUDIOS (CORREGIDA)
-- Descripción: Este script de migración tiene como objetivo probar el flujo completo de creación de una solicitud
--              en el sistema, desde la inserción de usuarios hasta la creación de la solicitud, sus instrumentos
--              asociados y las notificaciones correspondientes. Se busca verificar la integridad de los datos
--              y el correcto funcionamiento de las relaciones entre tablas.
--
--              Cada paso está exhaustivamente comentado para facilitar la comprensión y el seguimiento del flujo.
--              CORRECCIÓN: Script actualizado para ser compatible con la estructura actual de la base de datos.
-- =====================================================================================================================

-- ---------------------------------------------------------------------------------------------------------------------
-- PASO 0: Configuración inicial y verificación de datos necesarios
-- Descripción: Se deshabilitan temporalmente las políticas RLS y se verifican/crean los datos necesarios.
-- ---------------------------------------------------------------------------------------------------------------------

-- Deshabilitar temporalmente RLS para permitir inserciones de datos de prueba
SET session_replication_role = replica;

-- ---------------------------------------------------------------------------------------------------------------------
-- PASO 1: Inserción de Usuarios de Prueba
-- Descripción: Se insertarán dos usuarios de prueba: un cliente que creará la solicitud y un músico que, opcionalmente,
--              podría realizar una oferta. Esto simula los roles principales en el flujo de solicitudes.
-- ---------------------------------------------------------------------------------------------------------------------

-- 1.1. Declaración de variables para almacenar los IDs de los usuarios.
--      Es crucial almacenar estos UUIDs para poder referenciarlos en las inserciones posteriores.
DO $$
DECLARE
    client_user_id UUID;
    musician_user_id UUID;
    test_request_id UUID;
    instrument_guitarra_acustica_id UUID;
    instrument_piano_id UUID;
    notification_id UUID;
    event_type_concierto_id UUID; -- Variable para almacenar el ID del tipo de evento 'Concierto'
BEGIN
    RAISE NOTICE 'Iniciando la migración V1.0.11__test_request_flow.sql (CORREGIDA)';

    -- 1.2. Inserción del usuario CLIENTE
    --      Este usuario será el que cree la solicitud de servicio.
    RAISE NOTICE 'Insertando usuario cliente...';
    INSERT INTO users (user_id, name, email, phone, role, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Cliente de Prueba', 'cliente.prueba@example.com', '+18091112222', 'client', NOW(), NOW())
    RETURNING user_id INTO client_user_id;
    RAISE NOTICE 'Usuario cliente insertado con ID: %', client_user_id;

    -- 1.3. Inserción del usuario MÚSICO
    --      Este usuario podría ser el que reciba la notificación y realice una oferta.
    RAISE NOTICE 'Insertando usuario músico...';
    INSERT INTO users (user_id, name, email, phone, role, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Músico de Prueba', 'musico.prueba@example.com', '+18093334444', 'musician', NOW(), NOW())
    RETURNING user_id INTO musician_user_id;
    RAISE NOTICE 'Usuario músico insertado con ID: %', musician_user_id;

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 1.5: Verificar/Crear tipos de eventos e instrumentos necesarios
    -- Descripción: Se asegura que existan los tipos de eventos e instrumentos necesarios para la prueba.
    -- ---------------------------------------------------------------------------------------------------------------------
    
    -- Verificar si existe el tipo de evento 'Concierto', si no, crearlo
    RAISE NOTICE 'Verificando tipo de evento "Concierto"...';
    SELECT id INTO event_type_concierto_id FROM event_types WHERE name = 'Concierto';
    
    IF event_type_concierto_id IS NULL THEN
        RAISE NOTICE 'Tipo de evento "Concierto" no existe, creándolo...';
        INSERT INTO event_types (id, name, price_factor) VALUES
        (gen_random_uuid(), 'Concierto', 1.20)
        RETURNING id INTO event_type_concierto_id;
    END IF;
    RAISE NOTICE 'ID del tipo de evento "Concierto": %', event_type_concierto_id;

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 2: Inserción de una Solicitud (Request)
    -- Descripción: Se crea una nueva solicitud de servicio por parte del cliente. Esta solicitud incluirá detalles
    --              como título, descripción, ubicación, fecha y estado inicial.
    -- ---------------------------------------------------------------------------------------------------------------------

    RAISE NOTICE 'Insertando nueva solicitud...';
    INSERT INTO request (
        id, client_id, title, description, event_type_id, 
        event_date, start_time, end_time, location, 
        status, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), 
        client_user_id, 
        'Concierto Benéfico', 
        'Se necesita un grupo musical para un evento benéfico en el parque central.', 
        event_type_concierto_id, 
        '2024-12-25'::DATE, 
        '19:00:00'::TIME WITH TIME ZONE, 
        '22:00:00'::TIME WITH TIME ZONE, 
        '{"address": "Parque Central, Santo Domingo", "latitude": 18.48605, "longitude": -69.93121}'::JSONB, 
        'CREATED'::request_status, 
        NOW(), 
        NOW()
    )
    RETURNING id INTO test_request_id;
    RAISE NOTICE 'Solicitud insertada con ID: %', test_request_id;

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 3: Verificar/Crear Instrumentos y Asociarlos a la Solicitud
    -- Descripción: Se verifican/crean los instrumentos necesarios y se asocian a la solicitud.
    -- ---------------------------------------------------------------------------------------------------------------------
    
    -- Verificar si existe 'Guitarra Acústica', si no, crearlo
    RAISE NOTICE 'Verificando instrumento "Guitarra Acústica"...';
    SELECT id INTO instrument_guitarra_acustica_id FROM instruments WHERE name = 'Guitarra Acústica';
    
    IF instrument_guitarra_acustica_id IS NULL THEN
        RAISE NOTICE 'Instrumento "Guitarra Acústica" no existe, creándolo...';
        INSERT INTO instruments (id, name, category, price_factor) VALUES
        (gen_random_uuid(), 'Guitarra Acústica', 'cuerda', 1.0)
        RETURNING id INTO instrument_guitarra_acustica_id;
    END IF;

    -- Verificar si existe 'Piano', si no, crearlo
    RAISE NOTICE 'Verificando instrumento "Piano"...';
    SELECT id INTO instrument_piano_id FROM instruments WHERE name = 'Piano';
    
    IF instrument_piano_id IS NULL THEN
        RAISE NOTICE 'Instrumento "Piano" no existe, creándolo...';
        INSERT INTO instruments (id, name, category, price_factor) VALUES
        (gen_random_uuid(), 'Piano', 'teclado', 1.2)
        RETURNING id INTO instrument_piano_id;
    END IF;

    RAISE NOTICE 'Insertando instrumentos para la solicitud...';
    INSERT INTO request_instruments (request_id, instrument_id, created_at) VALUES
    (test_request_id, instrument_guitarra_acustica_id, NOW()),
    (test_request_id, instrument_piano_id, NOW());
    RAISE NOTICE 'Instrumentos asociados a la solicitud: Guitarra Acústica y Piano.';

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 4: Inserción de Notificaciones
    -- Descripción: Se crean notificaciones relacionadas con la nueva solicitud. Por ejemplo, una notificación
    --              para el cliente que creó la solicitud y otra para el músico (si aplica).
    -- ---------------------------------------------------------------------------------------------------------------------
    RAISE NOTICE 'Insertando notificaciones...';
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES
    (gen_random_uuid(), client_user_id, 'SYSTEM'::notification_type, 'Solicitud Creada Exitosamente', 'Tu solicitud "Concierto Benéfico" ha sido creada y está a la espera de ofertas.', '/requests/' || test_request_id::text, FALSE, NOW())
    RETURNING id INTO notification_id;
    RAISE NOTICE 'Notificación para el cliente insertada con ID: %', notification_id;

    -- Opcional: Notificación para el músico sobre una nueva solicitud relevante
    -- (Esta lógica podría ser más compleja en un sistema real, filtrando por instrumentos/ubicación)
    INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES
    (gen_random_uuid(), musician_user_id, 'SYSTEM'::notification_type, 'Nueva Solicitud Disponible', 'Hay una nueva solicitud "Concierto Benéfico" que podría interesarte.', '/requests/' || test_request_id::text, FALSE, NOW());
    RAISE NOTICE 'Notificación para el músico insertada.';

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 5: Inserción de una Oferta (Offer) por parte del Músico
    -- Descripción: El músico de prueba realiza una oferta a la solicitud creada por el cliente.
    --              Esto simula la interacción de un músico interesado en la solicitud.
    -- ---------------------------------------------------------------------------------------------------------------------
    RAISE NOTICE 'Insertando oferta del músico...';
    INSERT INTO offer (id, request_id, musician_id, price, message, status, created_at) VALUES
    (gen_random_uuid(), test_request_id, musician_user_id, 450.00, '¡Hola! Estoy interesado en tu solicitud. Tengo experiencia con ambos instrumentos.', 'SENT'::offer_status, NOW());
    RAISE NOTICE 'Oferta del músico insertada.';

    -- ---------------------------------------------------------------------------------------------------------------------
    -- PASO 6: Verificación (Opcional - solo para fines de depuración/prueba)
    -- Descripción: Se pueden añadir sentencias SELECT para verificar que los datos se hayan insertado correctamente.
    --              Estas sentencias no son parte de la migración en sí, pero son útiles durante el desarrollo.
    -- ---------------------------------------------------------------------------------------------------------------------
    RAISE NOTICE 'Verificando inserciones...';
    PERFORM * FROM users WHERE user_id = client_user_id;
    PERFORM * FROM users WHERE user_id = musician_user_id;
    PERFORM * FROM request WHERE id = test_request_id;
    PERFORM ri.request_id, ri.instrument_id FROM request_instruments ri WHERE ri.request_id = test_request_id;
    PERFORM * FROM notifications WHERE user_id = client_user_id AND link = '/requests/' || test_request_id::text;
    PERFORM * FROM notifications WHERE user_id = musician_user_id AND link = '/requests/' || test_request_id::text;
    PERFORM * FROM offer WHERE offer.request_id = test_request_id AND offer.musician_id = musician_user_id;

    RAISE NOTICE 'Migración V1.0.11__test_request_flow.sql completada exitosamente.';
END $$;

-- Restaurar las políticas RLS
SET session_replication_role = DEFAULT;
-- =====================================================================================================================
-- Migración: V1.0.11__test_request_flow.sql 2025-10-11 12:28 p.m. JASBOOTSTUDIOS (CORREGIDA)
-- Descripción: Este script de migración tiene como objetivo probar el flujo completo de creación de una solicitud
--              desde el inicio hasta la finalización, incluyendo la inserción de instrumentos, notificaciones,
--              y la inserción de una oferta por parte del músico.
--              
--              CORRECCIONES APLICADAS:
--              - Compatibilidad con estructura actual de la base de datos
--              - Manejo de políticas RLS para datos de prueba
--              - Verificación/creación de tipos de eventos e instrumentos
--              - Uso correcto de tipos de datos (TIME WITH TIME ZONE, JSONB, ENUMs)
--              - Validación de referencias antes de usar
-- ===================================================================================================================== 