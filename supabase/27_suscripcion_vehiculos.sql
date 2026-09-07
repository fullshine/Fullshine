-- ============================================================
-- 27 · Varios vehículos por suscripción
-- ============================================================
-- Un cliente puede tener más de un auto en el mismo plan. Los vehículos
-- pasan de ser dos columnas de texto a una tabla propia, y cada lavado
-- puede indicar a cuál de los autos correspondió.
--
-- Las columnas `vehiculo` y `patente` de subscriptions se dejan en su
-- lugar: ya no se usan, pero borrarlas rompería cualquier consulta vieja
-- y no molestan donde están.
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  descripcion     TEXT NOT NULL,
  patente         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_vehicles_sub
  ON subscription_vehicles(subscription_id, created_at);

-- Cada lavado puede apuntar a un auto. Si se borra el auto, el lavado
-- sobrevive sin vehículo: el cupo consumido no se devuelve.
ALTER TABLE subscription_washes
  ADD COLUMN IF NOT EXISTS vehicle_id UUID
    REFERENCES subscription_vehicles(id) ON DELETE SET NULL;

ALTER TABLE subscription_vehicles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'subscription_vehicles'
      AND policyname = 'subscription_vehicles_service_role'
  ) THEN
    CREATE POLICY subscription_vehicles_service_role ON subscription_vehicles
      FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;


-- ── Traspaso del vehículo que ya estaba cargado ──
-- Solo para las suscripciones que todavía no tienen ninguno en la tabla nueva.
INSERT INTO subscription_vehicles (subscription_id, descripcion, patente)
SELECT s.id, s.vehiculo, s.patente
FROM subscriptions s
WHERE COALESCE(TRIM(s.vehiculo), '') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM subscription_vehicles v WHERE v.subscription_id = s.id
  );


-- ── Verificación ──
SELECT
  s.nombre,
  COUNT(v.id) AS vehiculos
FROM subscriptions s
LEFT JOIN subscription_vehicles v ON v.subscription_id = s.id
GROUP BY s.id, s.nombre
ORDER BY s.nombre;
