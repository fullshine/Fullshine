-- Agregar los nuevos valores al enum vehicle_type si no existen
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'hatch_sedan'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vehicle_type')) THEN
    ALTER TYPE vehicle_type ADD VALUE 'hatch_sedan';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'suv_camioneta'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vehicle_type')) THEN
    ALTER TYPE vehicle_type ADD VALUE 'suv_camioneta';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pickup_xl'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'vehicle_type')) THEN
    ALTER TYPE vehicle_type ADD VALUE 'pickup_xl';
  END IF;
END $$;
