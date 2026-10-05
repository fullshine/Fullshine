-- Cerámico de 1 año. Mantiene los servicios de 3 años existentes.
BEGIN;
INSERT INTO services (id,name,description,category,duration_hours,is_active,active,bookable_online) VALUES ('cc000001-0000-4000-8000-000000000001','Tratamiento Cerámico 1 año','Proceso: Lavado técnico de carrocería, descontaminación de emblemas y rendijas, llantas y guardafangos, descontaminación química y mecánica de laca, pulido avanzado, protección cerámica de pintura Nasiol Metal Coat (1 año de duración). Incluye: Limpieza interior profunda de cortesía.','ceramico',8,true,true,true) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, is_active=true;
INSERT INTO service_prices (service_id,vehicle_type,price_clp) VALUES
('cc000001-0000-4000-8000-000000000001','hatch_sedan',200000),
('cc000001-0000-4000-8000-000000000001','suv_camioneta',250000),
('cc000001-0000-4000-8000-000000000001','pickup_xl',300000)
ON CONFLICT (service_id,vehicle_type) DO UPDATE SET price_clp=EXCLUDED.price_clp;
COMMIT;
