-- ==============================
-- Migration: Add ENUM types from deploy.sql schema
-- ==============================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');
    END IF;
END
$$;

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

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'offer_status') THEN
        CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
    END IF;
END
$$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM ('SYSTEM', 'MESSAGE', 'ALERT');
    END IF;
END
$$;
