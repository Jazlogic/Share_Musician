-- ==============================
-- DEFAULT DATA (seed minimal)
-- ==============================
-- Seed instruments (examples)
INSERT INTO instruments (id, name, category) VALUES
  (gen_random_uuid(), 'Guitarra', 'cuerda') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Piano', 'tecla') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Bateria', 'percusion') ON CONFLICT DO NOTHING,
  (gen_random_uuid(), 'Voz', 'voz') ON CONFLICT DO NOTHING;

-- Seed pricing config if none exists
INSERT INTO pricing_config (id, base_hourly_rate, minimum_hours, maximum_hours, platform_commission, service_fee, tax_rate, currency, is_active)
SELECT gen_random_uuid(), 500.00, 2.00, 12.00, 0.1500, 100.00, 0.1800, 'DOP', TRUE
WHERE NOT EXISTS (SELECT 1 FROM pricing_config WHERE is_active = TRUE);

-- Default data for musician_tariffs
INSERT INTO musician_tariffs (category, hourly_rate) VALUES
    ('Soloist', 50.00),
    ('Duo', 80.00),
    ('Trio', 120.00),
    ('Quartet', 180.00),
    ('Band', 250.00)
ON CONFLICT (category) DO NOTHING;