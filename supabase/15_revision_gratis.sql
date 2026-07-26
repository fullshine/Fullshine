-- =============================================
-- FULLSHINE - Servicio "Revisión y Diagnóstico Gratis"
-- Agenda PARALELA a los trabajos de detailing.
-- Horarios cada 1 hora de 09:00 a 18:00 (lun-vie) / 09:00 a 14:00 (sáb)
-- =============================================

-- El check original exigía price_clp > 0; la revisión es gratis, así que
-- permitimos el valor 0.
ALTER TABLE service_prices DROP CONSTRAINT IF EXISTS service_prices_price_clp_check;
ALTER TABLE service_prices ADD CONSTRAINT service_prices_price_clp_check CHECK (price_clp >= 0);

INSERT INTO services (id, name, description, category, duration_hours, is_active)
VALUES (
  'aa000001-0000-4000-8000-000000000001',
  'Revisión y Diagnóstico GRATIS',
  'Medición de espesor de laca · Evaluación de rayones bajo luz de inspección · Nivel de contaminación · Estado de la protección · Diagnóstico honesto. Sin costo ni compromiso. 15-20 minutos.',
  'revision',
  0.5,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Precio $0 para todos los tipos de vehículo
INSERT INTO service_prices (service_id, vehicle_type, price_clp)
VALUES
  ('aa000001-0000-4000-8000-000000000001', 'hatch_sedan',   0),
  ('aa000001-0000-4000-8000-000000000001', 'suv_camioneta', 0),
  ('aa000001-0000-4000-8000-000000000001', 'pickup_xl',     0)
ON CONFLICT (service_id, vehicle_type) DO NOTHING;

-- Verificación:
-- SELECT name, category, duration_hours FROM services WHERE category = 'revision';
