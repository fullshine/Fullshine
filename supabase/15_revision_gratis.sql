-- =============================================
-- FULLSHINE - Servicio "Revisión y Diagnóstico Gratis"
-- Horarios cada 1 hora de 09:00 a 18:00 (lun-vie) / 09:00 a 14:00 (sáb)
-- =============================================

-- 1. Nueva categoría en el enum (si aún no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'revision'
      AND enumtypid = 'service_category'::regtype
  ) THEN
    ALTER TYPE service_category ADD VALUE 'revision';
  END IF;
END$$;

-- 2. El servicio (precio $0, duración 0.5 h = 30 min)
INSERT INTO services (id, name, description, category, duration_hours, is_active)
VALUES (
  'rev00001-0000-0000-0000-000000000001',
  'Revisión y Diagnóstico GRATIS',
  E'Medición de espesor de laca · Evaluación de rayones bajo luz de inspección · Nivel de contaminación de la pintura · Estado de la protección actual · Diagnóstico honesto con recomendaciones. Sin costo y sin compromiso. Duración: 15-20 minutos.',
  'revision',
  0.5,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Precio $0 para todos los tipos de vehículo
INSERT INTO service_prices (service_id, vehicle_type, price_clp)
VALUES
  ('rev00001-0000-0000-0000-000000000001', 'hatch_sedan',   0),
  ('rev00001-0000-0000-0000-000000000001', 'suv_camioneta', 0),
  ('rev00001-0000-0000-0000-000000000001', 'pickup_xl',     0)
ON CONFLICT (service_id, vehicle_type) DO NOTHING;
