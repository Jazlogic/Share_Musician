CREATE TYPE user_role AS ENUM ('client', 'musician', 'leader', 'admin');

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

CREATE TYPE offer_status AS ENUM ('SENT', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'SELECTED');

CREATE TYPE transaction_type AS ENUM ('earning', 'withdrawal', 'refund', 'bonus');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');