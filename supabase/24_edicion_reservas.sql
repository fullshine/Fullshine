-- ============================================================
-- 24 · Edición de reservas y control de notificaciones
-- ============================================================
-- Ejecutar completo en el SQL Editor de Supabase.
-- Es idempotente: se puede volver a correr sin romper nada.
-- ============================================================

-- ── 1. Flags nuevos en bookings ─────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS notificaciones_activas BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN bookings.notificaciones_activas IS
  'Si es FALSE, esta reserva no genera ningún WhatsApp automático '
  '(confirmación, recordatorio, certificado, reseña, cancelación). '
  'Se usa sobre todo en convenios B2B, donde el titular de la reserva '
  'es la empresa y no el dueño del vehículo.';

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS precio_manual BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN bookings.precio_manual IS
  'TRUE cuando el monto fue escrito a mano en el panel. Evita que un '
  'cambio de servicio pise un precio negociado con el cliente.';

-- Las reservas de convenio nacen en silencio.
UPDATE bookings b
SET notificaciones_activas = FALSE
FROM services s
WHERE b.service_id = s.id
  AND s.category = 'automotora';


-- ── 2. Historial de cambios ─────────────────────────────────
-- Sirve para responder "¿por qué esta reserva quedó en $90.000?"
-- meses después. No se puede reconstruir hacia atrás, por eso
-- conviene tenerlo desde ahora.

CREATE TABLE IF NOT EXISTS booking_changes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  campo       TEXT NOT NULL,
  valor_antes TEXT,
  valor_luego TEXT,
  autor       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_changes_booking
  ON booking_changes(booking_id, created_at DESC);

ALTER TABLE booking_changes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'booking_changes' AND policyname = 'booking_changes_service_role'
  ) THEN
    CREATE POLICY booking_changes_service_role ON booking_changes
      FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;


-- ── 3. Configuración global del panel ───────────────────────
-- Tabla llave/valor para interruptores que aplican a todo el
-- sistema. Hoy solo guarda el modo silencioso.

CREATE TABLE IF NOT EXISTS app_config (
  clave      TEXT PRIMARY KEY,
  valor      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'app_config' AND policyname = 'app_config_service_role'
  ) THEN
    CREATE POLICY app_config_service_role ON app_config
      FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
  END IF;
END $$;

INSERT INTO app_config (clave, valor)
VALUES ('modo_silencioso', 'false')
ON CONFLICT (clave) DO NOTHING;


-- ── 4. Verificación ─────────────────────────────────────────

SELECT
  (SELECT COUNT(*) FROM information_schema.columns
    WHERE table_name = 'bookings'
      AND column_name IN ('notificaciones_activas', 'precio_manual')) AS columnas_nuevas,
  (SELECT COUNT(*) FROM bookings WHERE notificaciones_activas = FALSE) AS reservas_en_silencio,
  (SELECT valor FROM app_config WHERE clave = 'modo_silencioso')       AS modo_silencioso;
