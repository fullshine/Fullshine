-- Configuración tributaria mensual (remanente, PPM, etc.)
CREATE TABLE IF NOT EXISTS tax_periods (
  month            TEXT PRIMARY KEY,  -- 'YYYY-MM'
  remanente        INTEGER NOT NULL DEFAULT 0,
  ppm_rate         NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  precios_con_iva  BOOLEAN NOT NULL DEFAULT FALSE,
  iva_credito_rcv  INTEGER NOT NULL DEFAULT 0,
  rcv_filename     TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Migración: agregar columnas a tabla existente (idempotente)
ALTER TABLE tax_periods
  ADD COLUMN IF NOT EXISTS iva_credito_rcv INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rcv_filename TEXT,
  ADD COLUMN IF NOT EXISTS rcv_total INTEGER NOT NULL DEFAULT 0;
