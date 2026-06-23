-- =============================================
-- FULLSHINE - Schema Principal
-- Ejecutar en: Supabase SQL Editor
-- Orden: 01 de 07
-- =============================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists "pg_net";

-- Enums
create type user_role as enum ('admin', 'staff');
create type booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type vehicle_type as enum ('sedan', 'suv', 'pickup', 'van', 'hatchback', 'coupe');
create type service_category as enum ('exterior', 'interior', 'full', 'premium', 'add_on');

-- Users (extends Supabase Auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role user_role not null default 'staff',
  phone text,
  created_at timestamptz not null default now()
);

-- Customers
create table customers (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text,
  phone text not null unique,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vehicles
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  make text not null,
  model text not null,
  year integer not null check (year >= 1900 and year <= extract(year from now()) + 2),
  color text,
  license_plate text,
  vehicle_type vehicle_type not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, license_plate)
);

-- Services
create table services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category service_category not null,
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Service Prices (per vehicle type)
create table service_prices (
  id uuid primary key default uuid_generate_v4(),
  service_id uuid not null references services(id) on delete cascade,
  vehicle_type vehicle_type not null,
  price integer not null check (price >= 0),
  created_at timestamptz not null default now(),
  unique (service_id, vehicle_type)
);

-- Bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id),
  vehicle_id uuid not null references vehicles(id),
  service_id uuid not null references services(id),
  assigned_to uuid references users(id),
  status booking_status not null default 'pending',
  scheduled_at timestamptz not null,
  estimated_end_at timestamptz not null,
  total_price integer not null check (total_price >= 0),
  notes text,
  gcal_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Settings (key-value store for gcal tokens, etc.)
create table settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_bookings_scheduled_at on bookings(scheduled_at);
create index idx_bookings_status on bookings(status);
create index idx_bookings_customer_id on bookings(customer_id);
create index idx_vehicles_customer_id on vehicles(customer_id);
create index idx_customers_phone on customers(phone);
