-- ==============================
-- Migration: Add ENUM types from deploy.sql schema
-- ==============================

-- Define el tipo ENUM 'user_role' para especificar los diferentes roles de usuario en el sistema.
-- Los roles incluyen 'client', 'musician', 'leader' y 'admin'.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');
    END IF;
END
$$;

-- Define el tipo ENUM 'request_status' para rastrear el estado de las solicitudes de los clientes.
-- Incluye estados como 'CREATED', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'CONFIRMED',
-- 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_MUSICIAN',
-- 'REOPENED', 'EXPIRED' y 'ARCHIVED'.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
          'CREATED',
          'OFFER_RECEIVED',
          'OFFER_ACCEPTED',
          'CONFIRMED',
          'IN_PROGRESS',
          'COMPLETED',
          'CANCELLED_BY_CLIENT',
          'CANCELLED_BY_MUSICIAN',
          'REOPENED',
          'EXPIRED',
          'ARCHIVED'
        );
    END IF;
END
$$;

-- Define el tipo ENUM 'offer_status' para gestionar el estado de las ofertas realizadas por los músicos.
-- Los estados posibles son 'SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN' y 'SELECTED'.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');
    END IF;
END
$$;

-- Define el tipo ENUM 'transaction_type' para clasificar los diferentes tipos de transacciones financieras.
-- Incluye 'earning' (ganancia), 'withdrawal' (retiro), 'refund' (reembolso) y 'bonus'.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
    END IF;
END
$$;

-- Define el tipo ENUM 'transaction_status' para indicar el estado actual de una transacción.
-- Los estados son 'pending' (pendiente), 'completed' (completada), 'failed' (fallida) y 'cancelled' (cancelada).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    END IF;
END
$$;

-- Define el tipo ENUM 'notification_type' para categorizar los tipos de notificaciones enviadas a los usuarios.
-- Los tipos son 'SYSTEM' (sistema), 'MESSAGE' (mensaje) y 'ALERT' (alerta).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('SYSTEM', 'MESSAGE', 'ALERT');
    END IF;
END
$$;
