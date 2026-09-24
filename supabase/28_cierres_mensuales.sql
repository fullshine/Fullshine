-- ============================================================
-- 28 · Cierre mensual
-- ============================================================
-- Registra lo que REALMENTE pasó cada mes, para contrastarlo con lo que
-- dice el sistema: cuánto entró al banco, cuánto se declaró al SII y
-- cuánto retiraron los socios.
--
-- NOTA sobre el módulo original: traía además una tabla `compras_insumos`.
-- No se crea a propósito — duplicaría `expenses` con category='insumos',
-- que ya usas en el panel de gastos. Dos tablas para lo mismo terminan en
-- cifras que no cuadran según dónde hayas anotado la compra.
--
-- Ejecutar completo en el SQL Editor de Supabase. Es idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS cierres_mensuales (
  periodo          TEXT PRIMARY KEY,   -- 'YYYY-MM', igual que tax_periods
  depositos_banco  INTEGER,            -- lo que entró al banco por ventas
  ventas_sii_neto  INTEGER,            -- F29 código 563
  iva_pagado       INTEGER,            -- F29 código 89
  ppm_pagado       INTEGER,            -- F29 código 62
  retiro_socios    INTEGER,            -- lo que retiraron los socios
  notas            TEXT,
  cerrado          BOOLEAN NOT NULL DEFAULT FALSE,
  cerrado_at       TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE cierres_mensuales IS
  'Cierre contable del mes. tax_periods guarda la CONFIGURACION para calcular '
  'el F29 (tasa PPM, remanente, credito RCV); esta guarda lo efectivamente '
  'declarado y depositado. Son cosas distintas y por eso conviven.';

ALTER TABLE cierres_mensuales ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cierres_mensuales' AND policyname = 'cierres_service_role'
  ) THEN
    CREATE POLICY cierres_service_role ON cierres_mensuales
      FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

-- ── Verificación ──
SELECT
  (SELECT COUNT(*) FROM information_schema.tables
    WHERE table_name = 'cierres_mensuales') AS tabla_creada,
  (SELECT COUNT(*) FROM expenses WHERE category = 'insumos') AS gastos_insumos_existentes;
