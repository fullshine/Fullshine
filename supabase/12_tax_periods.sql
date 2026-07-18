-- Configuración tributaria mensual (remanente, PPM, etc.)
CREATE TABLE IF NOT EXISTS tax_periods (
  month           TEXT PRIMARY KEY,  -- 'YYYY-MM'
  remanente       INTEGER NOT NULL DEFAULT 0,
  ppm_rate        NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  precios_con_iva BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
