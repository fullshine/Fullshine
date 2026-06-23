-- =============================================
-- FULLSHINE - Triggers
-- Orden: 04 de 07
-- =============================================

-- updated_at auto-update trigger
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_customers_updated_at
  before update on customers
  for each row execute function update_updated_at();

create trigger trg_vehicles_updated_at
  before update on vehicles
  for each row execute function update_updated_at();

create trigger trg_bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();

-- Auto-create user record when auth user is created
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
