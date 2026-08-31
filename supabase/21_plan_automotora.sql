-- =============================================
-- FULLSHINE - Planes para automotoras (B2B)
--
-- Tres servicios con tarifa preferencial, reservables solo desde el acceso
-- privado /socios/fortia. La categoría 'automotora' se excluye de la web
-- pública, así que estos valores no quedan visibles para clientes finales.
--
-- El recargo de pickup/XL se resuelve con la estructura de precios por tipo
-- de vehículo que ya existe: no hace falta lógica adicional.
-- =============================================

INSERT INTO services (id, name, description, category, duration_hours, is_active)
VALUES
  (
    'ab000001-0000-4000-8000-000000000001',
    'Plan Pulido + Interior',
    E'Pulido abrillantador 3 en 1 · Descontaminación química y mecánica de carrocería · Llantas, vidrios y emblemas · Encerado premium · Interior completo: asientos, cielo, puertas, plásticos y cueros · Aromatización final',
    'automotora', 8, true
  ),
  (
    'ab000002-0000-4000-8000-000000000002',
    'Plan Lavado Detallado',
    E'Terminación Full Supremo · Lavado premium · Descontaminación de ruedas · Cera sintética premium hasta 6 meses · Sellado de neumáticos · Interior: aspirado profundo, ductos, cueros y plásticos · Cielo de tapiz de cortesía',
    'automotora', 5, true
  ),
  (
    'ab000003-0000-4000-8000-000000000003',
    'Plan Lavado para Entrega',
    E'Lavado exterior con Snow Foam · Encerado · Hidratación de neumáticos y plásticos exteriores · Aspirado y limpieza interior básica · Preparación final para entrega al cliente',
    'automotora', 2, true
  )
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      duration_hours = EXCLUDED.duration_hours,
      is_active = true;

-- ── Tarifas preferenciales ──────────────────────────────────────────────
-- hatch_sedan y suv_camioneta comparten tarifa plana.
-- pickup_xl lleva el recargo acordado en la propuesta.
INSERT INTO service_prices (service_id, vehicle_type, price_clp) VALUES
  ('ab000001-0000-4000-8000-000000000001', 'hatch_sedan',   110000),
  ('ab000001-0000-4000-8000-000000000001', 'suv_camioneta', 110000),
  ('ab000001-0000-4000-8000-000000000001', 'pickup_xl',     140000),

  ('ab000002-0000-4000-8000-000000000002', 'hatch_sedan',    45000),
  ('ab000002-0000-4000-8000-000000000002', 'suv_camioneta',  45000),
  ('ab000002-0000-4000-8000-000000000002', 'pickup_xl',      55000),

  ('ab000003-0000-4000-8000-000000000003', 'hatch_sedan',    20000),
  ('ab000003-0000-4000-8000-000000000003', 'suv_camioneta',  20000),
  ('ab000003-0000-4000-8000-000000000003', 'pickup_xl',      25000)
ON CONFLICT (service_id, vehicle_type) DO UPDATE
  SET price_clp = EXCLUDED.price_clp;

-- =============================================
-- VERIFICACIÓN
-- =============================================
SELECT s.name, p.vehicle_type, p.price_clp
FROM services s
JOIN service_prices p ON p.service_id = s.id
WHERE s.category = 'automotora'
ORDER BY p.price_clp DESC, s.name;
