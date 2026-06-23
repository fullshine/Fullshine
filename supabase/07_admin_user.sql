-- =============================================
-- FULLSHINE - Crear Usuario Admin
-- Orden: 07 de 07
-- IMPORTANTE: Ejecutar DESPUÉS de crear el usuario en Supabase Auth Dashboard
-- (Authentication → Users → Add user)
-- Luego copiar el UUID del usuario creado y pegarlo abajo
-- =============================================

-- PASO 1: En Supabase Dashboard → Authentication → Users → Add user
-- Email: admin@fullshine.autos (o el que prefieras)
-- Password: el que elijas
-- Copiar el UUID generado

-- PASO 2: Ejecutar este script reemplazando EL_UUID_DEL_USUARIO_ADMIN
-- con el UUID real copiado del dashboard

-- update users set role = 'admin' where id = 'EL_UUID_DEL_USUARIO_ADMIN';

-- VERIFICAR que quedó bien:
-- select id, email, full_name, role from users;

-- Si el trigger no creó la fila automáticamente, insertar manualmente:
-- insert into users (id, email, full_name, role)
-- values ('EL_UUID_DEL_USUARIO_ADMIN', 'admin@fullshine.autos', 'Administrador Fullshine', 'admin')
-- on conflict (id) do update set role = 'admin';
