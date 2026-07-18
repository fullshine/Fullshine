-- Mantención Cerámica Essential y Signature
-- Precios almacenados CON IVA incluido:
--   Essential:  $89.990 + 19% IVA = $107.088
--   Signature: $149.990 + 19% IVA = $178.488

INSERT INTO services (id, name, description, category, duration_hours, is_active)
VALUES
  (
    'mc000001-0000-0000-0000-000000000001',
    'Mantención Cerámica Essential',
    E'Lavado técnico · Descontaminación química · Booster cerámico · Limpieza de vidrios · Revitalizador de neumáticos · Informe del estado del coating · Limpieza interior',
    'ceramico',
    5,
    true
  ),
  (
    'mc000002-0000-0000-0000-000000000002',
    'Mantención Cerámica Signature',
    E'Todo lo del Essential más: Clay Bar (si corresponde) · Pulido de realce ultrafino · Booster cerámico premium · Limpieza técnica de vidrios · Revitalización de plásticos · Aspirado interior · Aromatización Premium · Reporte fotográfico · Revisión integral del tratamiento',
    'ceramico',
    8,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Precios — precio único para todos los tipos de vehículo (flat rate)
INSERT INTO service_prices (service_id, vehicle_type, price_clp)
VALUES
  -- Essential: $107.088 (con IVA)
  ('mc000001-0000-0000-0000-000000000001', 'hatch_sedan',    107088),
  ('mc000001-0000-0000-0000-000000000001', 'suv_camioneta',  107088),
  ('mc000001-0000-0000-0000-000000000001', 'pickup_xl',      107088),

  -- Signature: $178.488 (con IVA)
  ('mc000002-0000-0000-0000-000000000002', 'hatch_sedan',    178488),
  ('mc000002-0000-0000-0000-000000000002', 'suv_camioneta',  178488),
  ('mc000002-0000-0000-0000-000000000002', 'pickup_xl',      178488)
ON CONFLICT (service_id, vehicle_type) DO NOTHING;
