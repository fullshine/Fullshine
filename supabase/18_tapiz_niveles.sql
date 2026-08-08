-- =============================================
-- FULLSHINE - Tapiz en tres niveles
--
--   · Se conserva el servicio de limpieza de tapiz de ASIENTOS tal como está.
--   · La higienización profunda actual pasa a llamarse "Tapiz Platino"
--     y MANTIENE sus precios.
--   · Tapiz Gold  = Platino + $30.000  (agrega desmontaje de asientos)
--   · Tapiz Elite = Gold    + $30.000  (agrega sellado de plásticos)
--
-- Los precios de Gold y Elite se calculan DESDE los de Platino, así que
-- funcionan cualquiera sean los valores actuales.
-- Es idempotente: se puede ejecutar más de una vez sin duplicar nada.
-- =============================================

DO $$
DECLARE
  v_platino_id UUID;
  v_gold_id    UUID := 'aa000002-0000-4000-8000-000000000002';
  v_elite_id   UUID := 'aa000003-0000-4000-8000-000000000003';
  v_horas      NUMERIC;
BEGIN

  -- ── 1. Ubicar la higienización profunda actual ──────────────────────────
  SELECT id, duration_hours INTO v_platino_id, v_horas
  FROM services
  WHERE category = 'tapiz'
    AND (name ILIKE '%higieniz%' OR name ILIKE '%profund%')
    AND id NOT IN (v_gold_id, v_elite_id)
  ORDER BY name
  LIMIT 1;

  IF v_platino_id IS NULL THEN
    RAISE EXCEPTION
      'No se encontró el servicio de higienización profunda en la categoría tapiz. Revisa: SELECT id, name FROM services WHERE category = ''tapiz'';';
  END IF;

  RAISE NOTICE 'Servicio base encontrado: %', v_platino_id;

  -- ── 2. La higienización profunda pasa a ser Tapiz Platino ───────────────
  UPDATE services
  SET name = 'Tapiz Platino',
      description = E'Limpieza profunda de asientos, techo y suelo · Sin desmontaje de asientos · Extracción de manchas y olores · Paneles de puerta y maletero · Higienización completa del interior',
      updated_at = NOW()
  WHERE id = v_platino_id;

  -- ── 3. Tapiz Gold ───────────────────────────────────────────────────────
  INSERT INTO services (id, name, description, category, duration_hours, is_active)
  VALUES (
    v_gold_id,
    'Tapiz Gold',
    E'Todo lo del Platino · CON desmontaje de asientos · Permite llegar a rieles, bases y zonas que de otra forma quedan sin lavar · Higienización total del habitáculo',
    'tapiz',
    COALESCE(v_horas, 3) + 1,
    true
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = true;

  -- ── 4. Tapiz Elite ──────────────────────────────────────────────────────
  INSERT INTO services (id, name, description, category, duration_hours, is_active)
  VALUES (
    v_elite_id,
    'Tapiz Elite',
    E'Todo lo del Gold · MÁS sellado de plásticos interiores · Protege tableros, consolas y paneles del sol y el desgaste · Facilita la limpieza posterior',
    'tapiz',
    COALESCE(v_horas, 3) + 2,
    true
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description,
        is_active = true;

  -- ── 5. Precios derivados del Platino ────────────────────────────────────
  -- Gold = Platino + 30.000
  INSERT INTO service_prices (service_id, vehicle_type, price_clp)
  SELECT v_gold_id, p.vehicle_type, p.price_clp + 30000
  FROM service_prices p
  WHERE p.service_id = v_platino_id
  ON CONFLICT (service_id, vehicle_type) DO UPDATE
    SET price_clp = EXCLUDED.price_clp;

  -- Elite = Platino + 60.000
  INSERT INTO service_prices (service_id, vehicle_type, price_clp)
  SELECT v_elite_id, p.vehicle_type, p.price_clp + 60000
  FROM service_prices p
  WHERE p.service_id = v_platino_id
  ON CONFLICT (service_id, vehicle_type) DO UPDATE
    SET price_clp = EXCLUDED.price_clp;

  RAISE NOTICE 'Tapiz Gold y Elite creados con precios derivados.';
END $$;

-- =============================================
-- VERIFICACIÓN — debe mostrar los tres niveles escalonados
-- =============================================
SELECT s.name, p.vehicle_type, p.price_clp
FROM services s
JOIN service_prices p ON p.service_id = s.id
WHERE s.category = 'tapiz'
ORDER BY p.vehicle_type, p.price_clp;
