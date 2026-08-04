-- =============================================
-- FULLSHINE - Calendario de Mantención Cerámica
--
-- Cada tratamiento cerámico completado genera automáticamente una
-- mantención programada a 6 meses. Cuando esa mantención se completa,
-- se genera la siguiente. El ciclo se mantiene solo.
-- =============================================

-- ── Tabla ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- De dónde nació esta mantención (cerámico original o mantención anterior)
  origin_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id       UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id        UUID REFERENCES vehicles(id) ON DELETE SET NULL,

  applied_at        DATE NOT NULL,          -- cuándo se hizo el tratamiento
  due_at            DATE NOT NULL,          -- cuándo toca la mantención
  cycle             INTEGER NOT NULL DEFAULT 1,  -- 1ª, 2ª, 3ª mantención...

  -- pending    → aún no le toca
  -- contacted  → le escribimos, sin respuesta
  -- scheduled  → agendó su hora
  -- completed  → vino y se hizo la mantención
  -- declined   → dijo que no
  -- lost       → sin respuesta después de 2 intentos
  status            TEXT NOT NULL DEFAULT 'pending',

  contact_1_at      TIMESTAMPTZ,
  contact_2_at      TIMESTAMPTZ,
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL, -- reserva de la mantención
  notes             TEXT,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT maintenance_status_valido
    CHECK (status IN ('pending','contacted','scheduled','completed','declined','lost'))
);

CREATE INDEX IF NOT EXISTS idx_maintenance_due     ON maintenance_schedule (due_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_status  ON maintenance_schedule (status);
CREATE INDEX IF NOT EXISTS idx_maintenance_cliente ON maintenance_schedule (customer_id);

-- Evita duplicar la misma mantención si el trigger corre dos veces
CREATE UNIQUE INDEX IF NOT EXISTS idx_maintenance_origen_unico
  ON maintenance_schedule (origin_booking_id)
  WHERE origin_booking_id IS NOT NULL;

-- ── RLS: solo el service role (el servidor) toca esta tabla ──────────────
ALTER TABLE maintenance_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS maintenance_admin_all ON maintenance_schedule;
CREATE POLICY maintenance_admin_all ON maintenance_schedule
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Trigger: al completar un cerámico o una mantención, programa la próxima ──
CREATE OR REPLACE FUNCTION programar_mantencion()
RETURNS TRIGGER AS $$
DECLARE
  v_categoria TEXT;
  v_ciclo     INTEGER := 1;
BEGIN
  -- Solo nos interesa el momento en que la reserva pasa a 'completed'
  IF NEW.status <> 'completed' OR (TG_OP = 'UPDATE' AND OLD.status = 'completed') THEN
    RETURN NEW;
  END IF;

  SELECT category INTO v_categoria FROM services WHERE id = NEW.service_id;

  IF v_categoria NOT IN ('ceramico', 'mantencion') THEN
    RETURN NEW;
  END IF;

  -- Si viene de una mantención, el ciclo avanza
  IF v_categoria = 'mantencion' THEN
    SELECT COALESCE(MAX(cycle), 0) + 1 INTO v_ciclo
    FROM maintenance_schedule
    WHERE customer_id = NEW.customer_id;

    -- Cierra la mantención que estaba pendiente para este cliente
    UPDATE maintenance_schedule
    SET status = 'completed', booking_id = NEW.id, updated_at = NOW()
    WHERE customer_id = NEW.customer_id
      AND status IN ('pending', 'contacted', 'scheduled');
  END IF;

  INSERT INTO maintenance_schedule
    (origin_booking_id, customer_id, vehicle_id, applied_at, due_at, cycle)
  VALUES (
    NEW.id,
    NEW.customer_id,
    NEW.vehicle_id,
    NEW.booking_date,
    (NEW.booking_date + INTERVAL '6 months')::date,
    v_ciclo
  )
  ON CONFLICT (origin_booking_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_programar_mantencion ON bookings;
CREATE TRIGGER trg_programar_mantencion
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW EXECUTE FUNCTION programar_mantencion();

-- ── Backfill: cerámicos ya completados que nunca fueron programados ──────
INSERT INTO maintenance_schedule
  (origin_booking_id, customer_id, vehicle_id, applied_at, due_at, cycle, status)
SELECT
  b.id,
  b.customer_id,
  b.vehicle_id,
  b.booking_date,
  (b.booking_date + INTERVAL '6 months')::date,
  1,
  'pending'
FROM bookings b
JOIN services s ON s.id = b.service_id
WHERE s.category = 'ceramico'
  AND b.status = 'completed'
ON CONFLICT (origin_booking_id) DO NOTHING;

-- =============================================
-- VERIFICACIÓN
-- =============================================
-- Cuántas mantenciones quedaron programadas:
--   SELECT status, COUNT(*) FROM maintenance_schedule GROUP BY status;
--
-- Cuáles están vencidas o por vencer (las que hay que contactar):
--   SELECT m.due_at, c.full_name, c.phone, v.make, v.model, m.status
--   FROM maintenance_schedule m
--   JOIN customers c ON c.id = m.customer_id
--   LEFT JOIN vehicles v ON v.id = m.vehicle_id
--   WHERE m.status IN ('pending','contacted')
--   ORDER BY m.due_at;
