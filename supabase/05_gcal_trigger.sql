-- =============================================
-- FULLSHINE - Google Calendar Sync via pg_net
-- Orden: 05 de 07
-- IMPORTANTE: Reemplazar SUPABASE_PROJECT_ID con tu ID real
-- =============================================

-- Trigger function: fires Edge Function on booking changes
create or replace function trigger_gcal_sync()
returns trigger language plpgsql security definer as $$
declare
  v_edge_url text;
  v_payload jsonb;
begin
  -- Build Edge Function URL
  -- IMPORTANTE: Reemplazar 'TU_PROJECT_ID' con el ID real de tu proyecto Supabase
  v_edge_url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/';

  if TG_OP = 'INSERT' and new.status in ('pending', 'confirmed') then
    v_payload := jsonb_build_object(
      'booking_id', new.id,
      'action', 'create'
    );
    perform net.http_post(
      url := v_edge_url || 'create-gcal-event',
      body := v_payload,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  elsif TG_OP = 'UPDATE' and new.status = 'cancelled' and old.status != 'cancelled' then
    v_payload := jsonb_build_object(
      'booking_id', new.id,
      'gcal_event_id', new.gcal_event_id,
      'action', 'delete'
    );
    perform net.http_post(
      url := v_edge_url || 'delete-gcal-event',
      body := v_payload,
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;

  return new;
end;
$$;

create trigger trg_booking_gcal_sync
  after insert or update of status on bookings
  for each row execute function trigger_gcal_sync();
