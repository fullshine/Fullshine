-- =============================================
-- FULLSHINE - Reservas incompletas (recuperación de carritos abandonados)
--
-- Guarda los datos de contacto de quien empezó a reservar y no terminó,
-- para poder escribirle y ayudarle a completar.
--
-- ⚠️ Solo se guarda si la persona aceptó explícitamente el aviso del
-- formulario. El consentimiento queda registrado en `consintio`.
-- =============================================

CREATE TABLE IF NOT EXISTS booking_drafts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- El teléfono es la clave natural: una persona, un borrador.
  phone          TEXT NOT NULL UNIQUE,
  full_name      TEXT,

  vehicle_make   TEXT,
  vehicle_model  TEXT,
  vehicle_type   TEXT,

  service_id     UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name   TEXT,
  booking_date   DATE,
  slot_start     TEXT,

  -- Hasta dónde llegó: sirve para saber qué le faltaba
  paso_alcanzado TEXT,

  -- pendiente  → abandonó, nadie lo ha contactado
  -- contactado → le escribimos, sin respuesta aún
  -- convertido → terminó reservando
  -- descartado → no corresponde insistir
  estado         TEXT NOT NULL DEFAULT 'pendiente',

  consintio      BOOLEAN NOT NULL DEFAULT true,
  contactado_at  TIMESTAMPTZ,
  convertido_at  TIMESTAMPTZ,
  booking_id     UUID REFERENCES bookings(id) ON DELETE SET NULL,
  notas          TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT booking_drafts_estado_valido
    CHECK (estado IN ('pendiente','contactado','convertido','descartado'))
);

CREATE INDEX IF NOT EXISTS idx_drafts_estado  ON booking_drafts (estado);
CREATE INDEX IF NOT EXISTS idx_drafts_creado  ON booking_drafts (created_at DESC);

ALTER TABLE booking_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS drafts_admin_all ON booking_drafts;
CREATE POLICY drafts_admin_all ON booking_drafts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- VERIFICACIÓN
--   SELECT estado, COUNT(*) FROM booking_drafts GROUP BY estado;
-- =============================================
