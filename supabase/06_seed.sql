-- =============================================
-- FULLSHINE - Seed Data
-- Orden: 06 de 07
-- =============================================

-- Services seed
insert into services (id, name, description, category, duration_minutes, is_active) values
-- Exterior
('c1000001-0000-0000-0000-000000000001', 'Lavado Exterior', 'Lavado completo exterior con espuma activa', 'exterior', 60, true),
('c1000001-0000-0000-0000-000000000002', 'Pulido Simple', 'Pulido de un paso para brillar la pintura', 'exterior', 120, true),
('c1000001-0000-0000-0000-000000000003', 'Pulido Profesional', 'Corrección de pintura en 2 pasos', 'exterior', 240, true),
('c1000001-0000-0000-0000-000000000004', 'Sellado Cerámico', 'Protección cerámica de larga duración', 'exterior', 300, true),
('c1000001-0000-0000-0000-000000000005', 'Descontaminación', 'Remoción de hierro y contaminantes de la pintura', 'exterior', 90, true),
-- Interior
('c1000001-0000-0000-0000-000000000006', 'Limpieza Interior', 'Aspirado y limpieza general del habitáculo', 'interior', 90, true),
('c1000001-0000-0000-0000-000000000007', 'Detailing Interior', 'Limpieza profunda tapizados, plásticos y vidrios', 'interior', 180, true),
('c1000001-0000-0000-0000-000000000008', 'Limpieza de Motor', 'Lavado y desengrasado del compartimento motor', 'interior', 120, true),
-- Full
('c1000001-0000-0000-0000-000000000009', 'Full Detailing Básico', 'Exterior + interior completo', 'full', 240, true),
('c1000001-0000-0000-0000-000000000010', 'Full Detailing Premium', 'Pulido profesional + interior profundo', 'full', 360, true),
-- Premium
('c1000001-0000-0000-0000-000000000011', 'Paint Correction', 'Corrección de pintura nivel show car', 'premium', 480, true),
('c1000001-0000-0000-0000-000000000012', 'Nano Cerámica Premium', 'Aplicación cerámica de alta durabilidad (2 años)', 'premium', 420, true),
-- Add-ons
('c1000001-0000-0000-0000-000000000013', 'Tratamiento de Llantas', 'Limpieza y protección de llantas y neumáticos', 'add_on', 45, true);

-- Prices seed (price in CLP)
-- Lavado Exterior
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000001', 'sedan', 12000),
('c1000001-0000-0000-0000-000000000001', 'suv', 15000),
('c1000001-0000-0000-0000-000000000001', 'pickup', 15000),
('c1000001-0000-0000-0000-000000000001', 'van', 18000),
('c1000001-0000-0000-0000-000000000001', 'hatchback', 12000),
('c1000001-0000-0000-0000-000000000001', 'coupe', 12000);

-- Pulido Simple
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000002', 'sedan', 45000),
('c1000001-0000-0000-0000-000000000002', 'suv', 55000),
('c1000001-0000-0000-0000-000000000002', 'pickup', 55000),
('c1000001-0000-0000-0000-000000000002', 'van', 65000),
('c1000001-0000-0000-0000-000000000002', 'hatchback', 40000),
('c1000001-0000-0000-0000-000000000002', 'coupe', 45000);

-- Pulido Profesional
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000003', 'sedan', 90000),
('c1000001-0000-0000-0000-000000000003', 'suv', 110000),
('c1000001-0000-0000-0000-000000000003', 'pickup', 110000),
('c1000001-0000-0000-0000-000000000003', 'van', 130000),
('c1000001-0000-0000-0000-000000000003', 'hatchback', 80000),
('c1000001-0000-0000-0000-000000000003', 'coupe', 90000);

-- Sellado Cerámico
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000004', 'sedan', 150000),
('c1000001-0000-0000-0000-000000000004', 'suv', 180000),
('c1000001-0000-0000-0000-000000000004', 'pickup', 180000),
('c1000001-0000-0000-0000-000000000004', 'van', 220000),
('c1000001-0000-0000-0000-000000000004', 'hatchback', 140000),
('c1000001-0000-0000-0000-000000000004', 'coupe', 150000);

-- Limpieza Interior
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000006', 'sedan', 30000),
('c1000001-0000-0000-0000-000000000006', 'suv', 38000),
('c1000001-0000-0000-0000-000000000006', 'pickup', 35000),
('c1000001-0000-0000-0000-000000000006', 'van', 45000),
('c1000001-0000-0000-0000-000000000006', 'hatchback', 28000),
('c1000001-0000-0000-0000-000000000006', 'coupe', 30000);

-- Detailing Interior
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000007', 'sedan', 70000),
('c1000001-0000-0000-0000-000000000007', 'suv', 85000),
('c1000001-0000-0000-0000-000000000007', 'pickup', 80000),
('c1000001-0000-0000-0000-000000000007', 'van', 100000),
('c1000001-0000-0000-0000-000000000007', 'hatchback', 65000),
('c1000001-0000-0000-0000-000000000007', 'coupe', 70000);

-- Full Detailing Básico
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000009', 'sedan', 80000),
('c1000001-0000-0000-0000-000000000009', 'suv', 100000),
('c1000001-0000-0000-0000-000000000009', 'pickup', 95000),
('c1000001-0000-0000-0000-000000000009', 'van', 120000),
('c1000001-0000-0000-0000-000000000009', 'hatchback', 75000),
('c1000001-0000-0000-0000-000000000009', 'coupe', 80000);

-- Full Detailing Premium
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000010', 'sedan', 170000),
('c1000001-0000-0000-0000-000000000010', 'suv', 210000),
('c1000001-0000-0000-0000-000000000010', 'pickup', 200000),
('c1000001-0000-0000-0000-000000000010', 'van', 250000),
('c1000001-0000-0000-0000-000000000010', 'hatchback', 160000),
('c1000001-0000-0000-0000-000000000010', 'coupe', 170000);

-- Tratamiento de Llantas
insert into service_prices (service_id, vehicle_type, price) values
('c1000001-0000-0000-0000-000000000013', 'sedan', 20000),
('c1000001-0000-0000-0000-000000000013', 'suv', 25000),
('c1000001-0000-0000-0000-000000000013', 'pickup', 25000),
('c1000001-0000-0000-0000-000000000013', 'van', 30000),
('c1000001-0000-0000-0000-000000000013', 'hatchback', 20000),
('c1000001-0000-0000-0000-000000000013', 'coupe', 20000);
