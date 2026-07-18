-- Tabla de certificados digitales
CREATE TABLE IF NOT EXISTS certificates (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL,
  certificate_code  TEXT UNIQUE NOT NULL,
  customer_name     TEXT NOT NULL,
  vehicle_brand     TEXT NOT NULL,
  vehicle_model     TEXT NOT NULL,
  vehicle_plate     TEXT,
  service_name      TEXT NOT NULL,
  product_name      TEXT NOT NULL DEFAULT 'Nasiol ZR53',
  applied_at        DATE NOT NULL,
  warranty_years    INTEGER NOT NULL DEFAULT 3,
  expires_at        DATE NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
