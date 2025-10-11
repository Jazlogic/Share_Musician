-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action character varying NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_actions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_admin_actions_admin_id FOREIGN KEY (admin_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_admin_actions_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.churches (
  churches_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  location character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT churches_pkey PRIMARY KEY (churches_id)
);
CREATE TABLE public.client_metrics (
  client_id uuid NOT NULL,
  total_canceled_by_client integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  total_rejected integer DEFAULT 0,
  total_expired integer DEFAULT 0,
  total_in_dispute integer DEFAULT 0,
  total_archived integer DEFAULT 0,
  updated_by uuid,
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_metrics_pkey PRIMARY KEY (client_id),
  CONSTRAINT fk_client_metrics FOREIGN KEY (client_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.email_verifications (
  verification_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  email character varying NOT NULL,
  pin character varying NOT NULL,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '00:10:00'::interval),
  verified boolean DEFAULT false,
  CONSTRAINT email_verifications_pkey PRIMARY KEY (verification_id),
  CONSTRAINT email_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.event_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  CONSTRAINT event_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.instruments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  category character varying,
  icon text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT instruments_pkey PRIMARY KEY (id)
);
CREATE TABLE public.musician_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  musician_id uuid NOT NULL,
  event_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT musician_availability_pkey PRIMARY KEY (id),
  CONSTRAINT fk_musician_availability_musician_id FOREIGN KEY (musician_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.musician_metrics (
  musician_id uuid NOT NULL,
  total_canceled_by_musician integer DEFAULT 0,
  total_completed integer DEFAULT 0,
  total_rejected integer DEFAULT 0,
  total_in_dispute integer DEFAULT 0,
  total_archived integer DEFAULT 0,
  updated_by uuid,
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT musician_metrics_pkey PRIMARY KEY (musician_id),
  CONSTRAINT fk_musician_metrics FOREIGN KEY (musician_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.musician_tariffs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category character varying NOT NULL UNIQUE,
  hourly_rate numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT musician_tariffs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.offer (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  musician_id uuid NOT NULL,
  message text,
  price numeric,
  status USER-DEFINED NOT NULL DEFAULT 'SENT'::offer_status,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  CONSTRAINT offer_pkey PRIMARY KEY (id),
  CONSTRAINT fk_offer_request FOREIGN KEY (request_id) REFERENCES public.request(id),
  CONSTRAINT fk_offer_musician FOREIGN KEY (musician_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_offer_musician_id FOREIGN KEY (musician_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.posts (
  post_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  content text,
  postkey character varying DEFAULT NULL::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (post_id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.pricing_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  base_hourly_rate numeric NOT NULL DEFAULT 500.00,
  minimum_hours numeric NOT NULL DEFAULT 2.00,
  maximum_hours numeric NOT NULL DEFAULT 12.00,
  platform_commission numeric NOT NULL DEFAULT 0.1500,
  service_fee numeric NOT NULL DEFAULT 100.00,
  tax_rate numeric NOT NULL DEFAULT 0.1800,
  currency character varying NOT NULL DEFAULT 'DOP'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pricing_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.request (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  musician_id uuid,
  title character varying NOT NULL,
  description text NOT NULL,
  category character varying,
  location jsonb,
  event_date timestamp without time zone,
  start_time time without time zone,
  end_time time without time zone,
  event_duration interval,
  price numeric,
  tip numeric,
  status USER-DEFINED NOT NULL DEFAULT 'CREATED'::request_status,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  expiration_date timestamp without time zone,
  cancellation_reason text,
  client_rating integer CHECK (client_rating >= 1 AND client_rating <= 5),
  musician_rating integer CHECK (musician_rating >= 1 AND musician_rating <= 5),
  client_comment text,
  musician_comment text,
  is_public boolean DEFAULT true,
  reopened_from_id uuid,
  event_type_id uuid,
  duration interval,
  base_rate numeric,
  duration_hours numeric,
  distance_km numeric,
  experience_factor numeric,
  instrument_factor numeric,
  system_fee numeric,
  total_price numeric,
  extra_amount numeric DEFAULT 0,
  cancelled_by USER-DEFINED,
  CONSTRAINT request_pkey PRIMARY KEY (id),
  CONSTRAINT fk_request_client FOREIGN KEY (client_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_request_musician FOREIGN KEY (musician_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_request_reopened FOREIGN KEY (reopened_from_id) REFERENCES public.request(id),
  CONSTRAINT fk_requests_client_id FOREIGN KEY (client_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_requests_event_type_id FOREIGN KEY (event_type_id) REFERENCES public.event_types(id)
);
CREATE TABLE public.request_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  old_status USER-DEFINED,
  new_status USER-DEFINED NOT NULL,
  user_id uuid,
  updated_by uuid,
  user_type USER-DEFINED,
  change_date timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT request_history_pkey PRIMARY KEY (id),
  CONSTRAINT fk_history_request FOREIGN KEY (request_id) REFERENCES public.request(id)
);
CREATE TABLE public.request_instruments (
  request_id uuid NOT NULL,
  instrument_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT request_instruments_pkey PRIMARY KEY (instrument_id, request_id),
  CONSTRAINT fk_request_instruments_request FOREIGN KEY (request_id) REFERENCES public.request(id),
  CONSTRAINT fk_request_instruments_instrument FOREIGN KEY (instrument_id) REFERENCES public.instruments(id)
);
CREATE TABLE public.request_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  old_status USER-DEFINED,
  new_status USER-DEFINED NOT NULL,
  changed_by uuid,
  change_reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT request_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT fk_request_status_history_request_id FOREIGN KEY (request_id) REFERENCES public.request(id),
  CONSTRAINT fk_request_status_history_changed_by FOREIGN KEY (changed_by) REFERENCES public.users(user_id)
);
CREATE TABLE public.user_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_earnings numeric DEFAULT 0.00,
  pending_earnings numeric DEFAULT 0.00,
  available_balance numeric DEFAULT 0.00,
  total_withdrawn numeric DEFAULT 0.00,
  currency character varying DEFAULT 'DOP'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_balances_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_balances_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.user_instruments (
  user_id uuid NOT NULL,
  instrument_id uuid NOT NULL,
  skill_level character varying,
  experience_years numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_instruments_pkey PRIMARY KEY (instrument_id, user_id)
);
CREATE TABLE public.user_passwords (
  password_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  password character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_passwords_pkey PRIMARY KEY (password_id),
  CONSTRAINT user_passwords_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.user_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_id uuid,
  offer_id uuid,
  type USER-DEFINED NOT NULL,
  amount numeric NOT NULL,
  description text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::transaction_status,
  provider character varying,
  currency character varying DEFAULT 'DOP'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_transactions_user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT fk_user_transactions_request_id FOREIGN KEY (request_id) REFERENCES public.request(id),
  CONSTRAINT fk_user_transactions_offer_id FOREIGN KEY (offer_id) REFERENCES public.offer(id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying NOT NULL,
  active_role character varying DEFAULT 'musician'::character varying CHECK (active_role::text = ANY (ARRAY['leader'::character varying, 'musician'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'pending'::character varying, 'rejected'::character varying]::text[])),
  church_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email_verified boolean DEFAULT false,
  verification_token character varying UNIQUE,
  profilekey character varying DEFAULT NULL::character varying,
  reset_password_token character varying,
  reset_password_expires_at timestamp with time zone,
  verification_token_expires_at timestamp with time zone,
  role USER-DEFINED NOT NULL DEFAULT 'leader'::user_role,
  CONSTRAINT users_pkey PRIMARY KEY (user_id),
  CONSTRAINT users_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(churches_id)
);