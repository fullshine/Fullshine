-- Explicitar la duración de los planes ZR53 en sus títulos.
BEGIN;
UPDATE services SET name='Tratamiento Cerámico Platino 3 años' WHERE id='f5a6f859-3d71-43cc-8be8-e09bc532c2c9';
UPDATE services SET name='Tratamiento Cerámico Gold 3 años' WHERE id='304a44d3-8d35-4b7f-b548-aeaf64b9eb14';
UPDATE services SET name='Tratamiento Cerámico Elite 3 años' WHERE id='fa9dbbd0-6860-4b59-a76f-5f48e049c6b9';
COMMIT;
