-- Agregar columnas para tracking de pagos Flow
-- Ejecutar en Supabase Dashboard > SQL Editor

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS flow_payment_id TEXT DEFAULT NULL;

-- payment_status: null = sin pago iniciado, 'paid' = pagado confirmado por Flow
-- flow_payment_id: número de orden de Flow (flowOrder), para trazabilidad
