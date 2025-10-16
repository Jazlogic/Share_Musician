-- ==============================
-- Migración: V1.0.13__test_complete_flow.sql
-- Descripción: Prueba completa del flujo de creación de solicitudes
-- Fecha: 2025-10-16
-- ==============================

-- Deshabilitar RLS temporalmente para pruebas
SET session_replication_role = replica;

DO $$
DECLARE
    test_client_id UUID;
    test_musician_id UUID;
    test_request_id UUID;
    test_offer_id UUID;
    test_event_type_id UUID;
    test_instrument_id UUID;
    test_notification_id UUID;
BEGIN
    RAISE NOTICE '=== INICIANDO PRUEBA COMPLETA DEL FLUJO DE SOLICITUDES ===';

    -- 1. Crear usuarios de prueba
    RAISE NOTICE '1. Creando usuarios de prueba...';
    
    INSERT INTO users (user_id, name, email, phone, role, status, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Cliente Test', 'cliente.test@example.com', '+18091111111', 'client', 'active', NOW(), NOW())
    RETURNING user_id INTO test_client_id;
    RAISE NOTICE 'Cliente creado con ID: %', test_client_id;

    INSERT INTO users (user_id, name, email, phone, role, status, created_at, updated_at)
    VALUES (gen_random_uuid(), 'Músico Test', 'musico.test@example.com', '+18092222222', 'musician', 'active', NOW(), NOW())
    RETURNING user_id INTO test_musician_id;
    RAISE NOTICE 'Músico creado con ID: %', test_musician_id;

    -- 2. Verificar/Crear tipo de evento
    RAISE NOTICE '2. Verificando tipo de evento...';
    SELECT id INTO test_event_type_id FROM event_types WHERE name = 'Concierto';
    IF test_event_type_id IS NULL THEN
        INSERT INTO event_types (id, name, price_factor)
        VALUES (gen_random_uuid(), 'Concierto', 1.20)
        RETURNING id INTO test_event_type_id;
        RAISE NOTICE 'Tipo de evento "Concierto" creado con ID: %', test_event_type_id;
    ELSE
        RAISE NOTICE 'Tipo de evento "Concierto" encontrado con ID: %', test_event_type_id;
    END IF;

    -- 3. Verificar/Crear instrumento
    RAISE NOTICE '3. Verificando instrumento...';
    SELECT id INTO test_instrument_id FROM instruments WHERE name = 'Guitarra Acústica';
    IF test_instrument_id IS NULL THEN
        INSERT INTO instruments (id, name, category, price_factor)
        VALUES (gen_random_uuid(), 'Guitarra Acústica', 'cuerda', 1.0)
        RETURNING id INTO test_instrument_id;
        RAISE NOTICE 'Instrumento "Guitarra Acústica" creado con ID: %', test_instrument_id;
    ELSE
        RAISE NOTICE 'Instrumento "Guitarra Acústica" encontrado con ID: %', test_instrument_id;
    END IF;

    -- 4. Crear solicitud
    RAISE NOTICE '4. Creando solicitud de prueba...';
    INSERT INTO request (
        id, client_id, title, description, event_type_id,
        event_date, start_time, end_time, location,
        status, is_public, created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        test_client_id,
        'Concierto de Prueba',
        'Solicitud de prueba para verificar el flujo completo',
        test_event_type_id,
        '2025-10-25'::DATE,
        '19:00:00'::TIME,
        '22:00:00'::TIME,
        '{"address": "Sala de Pruebas", "latitude": 18.48605, "longitude": -69.93121}'::JSONB,
        'CREATED',
        TRUE,
        NOW(),
        NOW()
    )
    RETURNING id INTO test_request_id;
    RAISE NOTICE 'Solicitud creada con ID: %', test_request_id;

    -- 5. Asociar instrumento a la solicitud
    RAISE NOTICE '5. Asociando instrumento a la solicitud...';
    INSERT INTO request_instruments (request_id, instrument_id, created_at)
    VALUES (test_request_id, test_instrument_id, NOW());
    RAISE NOTICE 'Instrumento asociado correctamente';

    -- 6. Verificar que se creó la notificación para el músico
    RAISE NOTICE '6. Verificando notificaciones...';
    SELECT id INTO test_notification_id FROM notifications 
    WHERE user_id = test_musician_id AND link = '/requests/' || test_request_id::text;
    
    IF test_notification_id IS NOT NULL THEN
        RAISE NOTICE 'Notificación para músico creada correctamente con ID: %', test_notification_id;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró notificación para el músico';
    END IF;

    -- 7. Crear oferta del músico
    RAISE NOTICE '7. Creando oferta del músico...';
    INSERT INTO offer (
        id, request_id, musician_id, message, price, status, created_at
    ) VALUES (
        gen_random_uuid(),
        test_request_id,
        test_musician_id,
        'Me interesa mucho esta solicitud. Tengo experiencia con guitarra acústica.',
        450.00,
        'SENT',
        NOW()
    )
    RETURNING id INTO test_offer_id;
    RAISE NOTICE 'Oferta creada con ID: %', test_offer_id;

    -- 8. Verificar que se creó la notificación para el cliente
    RAISE NOTICE '8. Verificando notificación de oferta...';
    SELECT id INTO test_notification_id FROM notifications 
    WHERE user_id = test_client_id AND link = '/requests/' || test_request_id::text AND title = 'Nueva Oferta Recibida';
    
    IF test_notification_id IS NOT NULL THEN
        RAISE NOTICE 'Notificación de oferta para cliente creada correctamente con ID: %', test_notification_id;
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontró notificación de oferta para el cliente';
    END IF;

    -- 9. Verificar datos finales
    RAISE NOTICE '9. Verificando datos finales...';
    
    -- Verificar solicitud
    PERFORM 1 FROM request WHERE id = test_request_id AND status = 'CREATED';
    IF FOUND THEN
        RAISE NOTICE '✓ Solicitud verificada correctamente';
    ELSE
        RAISE NOTICE '✗ ERROR: Solicitud no encontrada o estado incorrecto';
    END IF;

    -- Verificar oferta
    PERFORM 1 FROM offer WHERE id = test_offer_id AND status = 'SENT';
    IF FOUND THEN
        RAISE NOTICE '✓ Oferta verificada correctamente';
    ELSE
        RAISE NOTICE '✗ ERROR: Oferta no encontrada o estado incorrecto';
    END IF;

    -- Verificar instrumentos asociados
    PERFORM 1 FROM request_instruments WHERE request_id = test_request_id AND instrument_id = test_instrument_id;
    IF FOUND THEN
        RAISE NOTICE '✓ Instrumentos asociados correctamente';
    ELSE
        RAISE NOTICE '✗ ERROR: Instrumentos no asociados correctamente';
    END IF;

    -- Verificar notificaciones
    PERFORM 1 FROM notifications WHERE user_id = test_musician_id AND type = 'SYSTEM';
    IF FOUND THEN
        RAISE NOTICE '✓ Notificaciones para músico creadas';
    ELSE
        RAISE NOTICE '✗ ERROR: No se crearon notificaciones para el músico';
    END IF;

    RAISE NOTICE '=== PRUEBA COMPLETA DEL FLUJO FINALIZADA ===';
    RAISE NOTICE 'Solicitud ID: %', test_request_id;
    RAISE NOTICE 'Oferta ID: %', test_offer_id;
    RAISE NOTICE 'Cliente ID: %', test_client_id;
    RAISE NOTICE 'Músico ID: %', test_musician_id;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR EN LA PRUEBA: %', SQLERRM;
        RAISE;
END
$$;

-- Restaurar RLS
SET session_replication_role = DEFAULT;

-- Mostrar resumen de datos de prueba
SELECT 
    'Solicitudes de prueba' as tipo,
    COUNT(*) as cantidad
FROM request 
WHERE title LIKE '%Prueba%' OR title LIKE '%Test%'

UNION ALL

SELECT 
    'Ofertas de prueba' as tipo,
    COUNT(*) as cantidad
FROM offer o
JOIN request r ON o.request_id = r.id
WHERE r.title LIKE '%Prueba%' OR r.title LIKE '%Test%'

UNION ALL

SELECT 
    'Notificaciones de prueba' as tipo,
    COUNT(*) as cantidad
FROM notifications n
JOIN users u ON n.user_id = u.user_id
WHERE u.email LIKE '%test%' OR u.email LIKE '%prueba%';

-- Mostrar configuración de precios activa
SELECT 
    base_hourly_rate,
    platform_commission,
    service_fee,
    currency,
    is_active
FROM pricing_config 
WHERE is_active = true;
