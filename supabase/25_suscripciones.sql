-- ============================================================
-- 25 · Suscripciones anuales de lavado
-- ============================================================
-- El cliente paga la anualidad por adelantado y tiene derecho a un
-- lavado semanal o mensual según su plan. Los lavados los registra el
-- administrador a mano: no pasan por el sistema de reservas.
--
-- Ejecutar completo en el SQL Editor de Supabase. Es idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  access_code     TEXT NOT NULL,

  nombre          TEXT NOT NULL,
  telefono        TEXT,
  email           TEXT,
  vehiculo        TEXT,
  patente         TEXT,

  -- 'semanal' = 52 lavados al año · 'mensual' = 12 al año
  frecuencia      TEXT NOT NULL DEFAULT 'mensual'
                    CHECK (frecuencia IN ('semanal', 'mensual')),

  -- Se puede sobrescribir si el plan vendido no calza con el estándar.
  lavados_totales INT  NOT NULL DEFAULT 12,

  monto_clp       INT  NOT NULL DEFAULT 0,
  inicio          DATE NOT NULL,
  termino         DATE NOT NULL,
  activa          BOOLEAN NOT NULL DEFAULT TRUE,
  notas           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_activa ON subscriptions(activa, termino);


-- Cada lavado consumido del plan.
CREATE TABLE IF NOT EXISTS subscription_washes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  detalle         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_washes_sub
  ON subscription_washes(subscription_id, fecha DESC);


-- Servicios fuera del plan hechos durante el año (pulido, tapiz, cerámico...).
CREATE TABLE IF NOT EXISTS subscription_extras (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  fecha           DATE NOT NULL,
  descripcion     TEXT NOT NULL,
  precio_clp      INT  NOT NULL DEFAULT 0,
  pagado          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_extras_sub
  ON subscription_extras(subscription_id, fecha DESC);


-- ── RLS: solo el service_role entra. El portal del cliente pasa por
--    server actions, nunca directo desde el navegador. ──

ALTER TABLE subscriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_washes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_extras  ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['subscriptions', 'subscription_washes', 'subscription_extras']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = t AND policyname = t || '_service_role'
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON %I FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE)',
        t || '_service_role', t
      );
    END IF;
  END LOOP;
END $$;


-- ── Verificación ──
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
    WHERE table_name IN ('subscriptions','subscription_washes','subscription_extras')) AS tablas_creadas,
  (SELECT COUNT(*) FROM subscriptions) AS suscripciones;
