-- =============================================
-- FULLSHINE - Función Atómica Anti-Double-Booking
-- Orden: 03 de 07
-- =============================================

create or replace function create_booking_atomic(
  p_customer_id uuid,
  p_vehicle_id uuid,
  p_service_id uuid,
  p_scheduled_at timestamptz,
  p_estimated_end_at timestamptz,
  p_total_price integer,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_booking_id uuid;
  v_overlap_count integer;
begin
  -- Lock check: count overlapping active bookings
  select count(*) into v_overlap_count
  from bookings
  where status not in ('cancelled')
    and tstzrange(scheduled_at, estimated_end_at, '[)') &&
        tstzrange(p_scheduled_at, p_estimated_end_at, '[)');

  if v_overlap_count > 0 then
    raise exception 'slot_unavailable: The requested time slot overlaps with an existing booking'
      using errcode = 'P0001';
  end if;

  -- Insert booking
  insert into bookings (
    customer_id, vehicle_id, service_id,
    scheduled_at, estimated_end_at,
    total_price, notes, status
  ) values (
    p_customer_id, p_vehicle_id, p_service_id,
    p_scheduled_at, p_estimated_end_at,
    p_total_price, p_notes, 'pending'
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

-- Grant execute to anon and authenticated
grant execute on function create_booking_atomic to anon, authenticated;
