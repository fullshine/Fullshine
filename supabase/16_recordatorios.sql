-- =============================================
-- FULLSHINE - Recordatorios automáticos por WhatsApp
--
-- Dos columnas de control para que un mismo recordatorio
-- no se envíe dos veces aunque el cron corra varias veces.
-- =============================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_24h_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_2h_at  timestamptz;

COMMENT ON COLUMN bookings.reminder_24h_at IS 'Cuándo se envió el recordatorio del día anterior. NULL = no enviado.';
COMMENT ON COLUMN bookings.reminder_2h_at  IS 'Cuándo se envió el recordatorio de 2 horas antes. NULL = no enviado.';

-- Índice para que el cron encuentre rápido las citas pendientes de recordar.
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h
  ON bookings (booking_date)
  WHERE reminder_24h_at IS NULL;

-- Verificación:
-- SELECT id, booking_date, slot_start, reminder_24h_at, reminder_2h_at
-- FROM bookings ORDER BY booking_date DESC LIMIT 5;
