-- =============================================
-- FULLSHINE - Row Level Security
-- Orden: 02 de 07
-- =============================================

-- Enable RLS on all tables
alter table users enable row level security;
alter table customers enable row level security;
alter table vehicles enable row level security;
alter table services enable row level security;
alter table service_prices enable row level security;
alter table bookings enable row level security;
alter table settings enable row level security;

-- Helper function: is current user admin or staff?
create or replace function is_authenticated_staff()
returns boolean language sql security definer as $$
  select exists (
    select 1 from users
    where id = auth.uid()
    and role in ('admin', 'staff')
  );
$$;

-- CUSTOMERS: public can insert (for booking form), staff can read/update
create policy "public_insert_customers" on customers for insert with check (true);
create policy "staff_read_customers" on customers for select using (is_authenticated_staff());
create policy "staff_update_customers" on customers for update using (is_authenticated_staff());

-- VEHICLES: public can insert, staff can read/update
create policy "public_insert_vehicles" on vehicles for insert with check (true);
create policy "staff_read_vehicles" on vehicles for select using (is_authenticated_staff());
create policy "staff_update_vehicles" on vehicles for update using (is_authenticated_staff());

-- SERVICES: anyone can read active services
create policy "public_read_services" on services for select using (is_active = true);
create policy "staff_all_services" on services for all using (is_authenticated_staff());

-- SERVICE PRICES: anyone can read
create policy "public_read_prices" on service_prices for select using (true);
create policy "staff_all_prices" on service_prices for all using (is_authenticated_staff());

-- BOOKINGS: public can insert (booking form), staff can read/update
create policy "public_insert_bookings" on bookings for insert with check (true);
create policy "staff_read_bookings" on bookings for select using (is_authenticated_staff());
create policy "staff_update_bookings" on bookings for update using (is_authenticated_staff());

-- USERS: staff can read their own data
create policy "users_read_own" on users for select using (id = auth.uid());
create policy "staff_read_all_users" on users for select using (is_authenticated_staff());

-- SETTINGS: only admin
create policy "staff_all_settings" on settings for all using (is_authenticated_staff());
