INSERT INTO event_types (id, name) VALUES
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Concierto'),
  ('b2c3d4e5-f6a7-8901-2345-67890abcdef0', 'Boda'),
  ('c3d4e5f6-a7b8-9012-3456-7890abcdef01', 'Evento Privado');

INSERT INTO instruments (id, name) VALUES
  ('f1e2d3c4-b5a6-7890-1234-567890abcdef', 'Guitarra'),
  ('e2d3c4b5-a6f7-8901-2345-67890abcdef0', 'Piano'),
  ('d3c4b5a6-f7e8-9012-3456-7890abcdef01', 'Batería');

INSERT INTO requests (
  id,
  leader_id,
  title,
  event_type_id,
  event_date,
  start_time,
  end_time,
  location,
  description,
  total_price,
  status,
  is_public
) VALUES (
  '1a2b3c4d-5e6f-7890-1234-567890abcdef',
  '00000000-0000-0000-0000-000000000001', -- Assuming a dummy leader_id for testing
  'Concierto de Rock en el Parque',
  'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  '2024-12-25',
  '19:00:00',
  '22:00:00',
  '{"address": "Parque Central", "latitude": 40.7128, "longitude": -74.0060}',
  'Un concierto de rock al aire libre para celebrar la Navidad.',
  1500.00,
  'CREATED',
  TRUE
);

INSERT INTO request_instruments (request_id, instrument_id) VALUES
  ('1a2b3c4d-5e6f-7890-1234-567890abcdef', 'f1e2d3c4-b5a6-7890-1234-567890abcdef');

select * from requests;
select * from request_instruments;
select * from instruments;
select * from event_types;
