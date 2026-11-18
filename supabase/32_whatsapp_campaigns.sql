-- Campañas: ejecutar después de las migraciones existentes. No activa envíos.
begin;
create table public.wa_leads (
  id uuid primary key default gen_random_uuid(), phone text not null unique check (phone ~ '^56[0-9]{9}$'),
  customer_name text, campaign text not null default 'unknown' check (campaign in ('unknown','pulido_tapiz','ceramico')),
  stage text not null default 'nuevo' check (stage in ('nuevo','cotizado','seguimiento','reserva_pendiente','agendado','cerrado','realizado')),
  vehicle text not null default '', notes text not null default '', paused boolean not null default false,
  opted_out boolean not null default false, quoted_price integer check (quoted_price > 0),
  last_inbound_at timestamptz, updated_at timestamptz not null default now()
);
create table public.wa_events (
  id text primary key, lead_id uuid not null references public.wa_leads(id),
  direction text not null check (direction in ('incoming','human')), body text not null,
  occurred_at timestamptz not null, created_at timestamptz not null default now()
);
create table public.wa_outbox (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.wa_leads(id),
  kind text not null check (kind in ('welcome','quote','followup1','followup2')),
  body text not null, due_at timestamptz not null default now(),
  status text not null default 'queued' check (status in ('queued','sending','sent','cancelled','uncertain')),
  quote_id uuid references public.wa_outbox(id), provider_id text, error text,
  created_at timestamptz not null default now(), sent_at timestamptz, claimed_at timestamptz,
  unique(quote_id,kind)
);
create index wa_outbox_due on public.wa_outbox(due_at) where status = 'queued';
alter table public.wa_leads enable row level security;
alter table public.wa_events enable row level security;
alter table public.wa_outbox enable row level security;
-- Acceso exclusivamente desde backend, con autorización de staff en las acciones.
revoke all on public.wa_leads, public.wa_events, public.wa_outbox from anon, authenticated;
grant all on public.wa_leads, public.wa_events, public.wa_outbox to service_role;

create function public.wa_ingest(p_phone text, p_name text, p_id text, p_text text,
  p_at timestamptz, p_human boolean, p_campaign text, p_stop boolean, p_handoff boolean, p_welcome text)
returns uuid language plpgsql set search_path = public as $$
declare l wa_leads; inserted integer; was_new boolean;
begin
  -- Serializa eventos por contacto, incluso antes de crear la fila.
  perform pg_advisory_xact_lock(hashtextextended(p_phone, 0));
  select * into l from wa_leads where phone = p_phone for update;
  was_new := not found;
  -- Una respuesta manual a un contacto ajeno a campañas no crea un interesado.
  if was_new and p_human then return null; end if;
  if was_new then
    insert into wa_leads(phone,customer_name) values(p_phone,p_name) returning * into l;
  end if;
  insert into wa_events(id,lead_id,direction,body,occurred_at)
    values(p_id,l.id,case when p_human then 'human' else 'incoming' end,p_text,p_at)
    on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return l.id; end if;
  -- Eventos antiguos se conservan sin revertir una conversación más reciente.
  if p_at < coalesce(l.last_inbound_at,'epoch'::timestamptz) and not p_human then return l.id; end if;
  update wa_outbox set status='cancelled' where lead_id=l.id and status='queued';
  update wa_leads set
    customer_name=case when p_human then customer_name else coalesce(nullif(p_name,''),customer_name) end,
    campaign=case when campaign='unknown' and p_campaign<>'unknown' then p_campaign else campaign end,
    last_inbound_at=case when p_human then last_inbound_at else p_at end,
    paused=paused or p_human or p_stop or p_handoff,
    opted_out=opted_out or p_stop,
    stage=case when p_stop then 'cerrado' else stage end, updated_at=now()
    where id=l.id returning * into l;
  if was_new and not l.paused and p_at > now()-interval '5 minutes' then
    insert into wa_outbox(lead_id,kind,body) values(l.id,'welcome',p_welcome);
  end if;
  return l.id;
end $$;

create function public.wa_edit(p_id uuid, p_campaign text, p_stage text, p_vehicle text, p_notes text, p_paused boolean)
returns void language plpgsql set search_path = public as $$
declare l wa_leads;
begin
  select * into strict l from wa_leads where id=p_id for update;
  if l.opted_out and not p_paused then raise exception 'El contacto solicitó no recibir mensajes'; end if;
  update wa_leads set campaign=p_campaign, stage=p_stage, vehicle=p_vehicle, notes=p_notes,
    paused=p_paused, updated_at=now() where id=p_id;
  -- Cambiar etapa/atención invalida mensajes anteriores; reactivar no los resucita.
  update wa_outbox set status='cancelled' where lead_id=p_id and status='queued';
end $$;

create function public.wa_quote(p_id uuid, p_price integer, p_body text, p_followups boolean)
returns uuid language plpgsql set search_path = public as $$
declare l wa_leads; job uuid;
begin
  select * into strict l from wa_leads where id=p_id for update;
  if l.opted_out or l.stage in ('agendado','cerrado','realizado') then raise exception 'Contacto cerrado o ya agendado'; end if;
  if exists(select 1 from wa_outbox where lead_id=p_id and status in ('queued','sending','uncertain') and kind='quote') then
    raise exception 'Ya existe una cotización pendiente o con envío por verificar';
  end if;
  if p_price<=0 or length(trim(p_body))<10 then raise exception 'Cotización incompleta'; end if;
  update wa_outbox set status='cancelled' where lead_id=p_id and status='queued';
  update wa_leads set quoted_price=p_price, paused=not p_followups, updated_at=now() where id=p_id;
  insert into wa_outbox(lead_id,kind,body) values(p_id,'quote',p_body) returning id into job;
  return job;
end $$;

create function public.wa_claim(p_id uuid)
returns setof wa_outbox language plpgsql set search_path = public as $$
declare j wa_outbox; l wa_leads;
begin
  select * into j from wa_outbox where id=p_id;
  if not found then return; end if;
  select * into l from wa_leads where id=j.lead_id for update;
  select * into j from wa_outbox where id=p_id for update;
  if j.status<>'queued' or j.due_at>now() then return; end if;
  if l.opted_out or l.stage in ('reserva_pendiente','agendado','cerrado','realizado') or
     (l.paused and j.kind<>'quote') then
    update wa_outbox set status='cancelled' where id=j.id; return;
  end if;
  if exists(select 1 from wa_outbox where lead_id=l.id and status in ('sending','uncertain')) then return; end if;
  update wa_outbox set status='sending',claimed_at=now() where id=j.id returning * into j;
  return next j;
end $$;

create function public.wa_finish(p_id uuid, p_provider text)
returns void language plpgsql set search_path = public as $$
declare j wa_outbox; l wa_leads; label text;
begin
  select * into strict j from wa_outbox where id=p_id;
  select * into strict l from wa_leads where id=j.lead_id for update;
  select * into j from wa_outbox where id=p_id for update;
  if j.status<>'sending' then return; end if;
  update wa_outbox set status='sent', sent_at=now(), provider_id=p_provider where id=p_id;
  if l.opted_out or l.stage in ('reserva_pendiente','agendado','cerrado','realizado') then return; end if;
  if j.kind='quote' then
    update wa_leads set stage='cotizado',updated_at=now() where id=l.id;
    if l.paused or l.updated_at>j.created_at then return; end if;
    label := case l.campaign when 'pulido_tapiz' then 'pulido + limpieza de tapiz' when 'ceramico' then 'tratamiento cerámico' else 'servicio cotizado' end;
    insert into wa_outbox(lead_id,kind,body,due_at,quote_id) values
      (l.id,'followup1','Hola 👋 Soy el asistente de Fullshine. ¿Te quedó alguna duda sobre el '||label||'? Si quieres avanzar, Juan puede revisar fechas para ti.',now()+interval '24 hours',j.id),
      (l.id,'followup2','Hola, te contactamos desde Fullshine. ¿Sigues pensando en realizar el '||label||' o prefieres dejarlo para más adelante?',now()+interval '72 hours',j.id)
      on conflict do nothing;
  elsif j.kind='followup1' and not l.paused then
    update wa_leads set stage='seguimiento',updated_at=now() where id=l.id;
  end if;
end $$;

revoke execute on function public.wa_ingest(text,text,text,text,timestamptz,boolean,text,boolean,boolean,text),
 public.wa_edit(uuid,text,text,text,text,boolean), public.wa_quote(uuid,integer,text,boolean),
 public.wa_claim(uuid), public.wa_finish(uuid,text) from public, anon, authenticated;
grant execute on function public.wa_ingest(text,text,text,text,timestamptz,boolean,text,boolean,boolean,text),
 public.wa_edit(uuid,text,text,text,text,boolean), public.wa_quote(uuid,integer,text,boolean),
 public.wa_claim(uuid), public.wa_finish(uuid,text) to service_role;

-- La reserva existente es la fuente de verdad: corta seguimientos al agendar.
create function public.wa_booking_changed() returns trigger
language plpgsql security definer set search_path = public as $$
declare ph text; lead uuid; next_stage text;
begin
  select regexp_replace(phone,'[^0-9]','','g') into ph from customers where id=new.customer_id;
  if length(ph)=9 then ph:='56'||ph; end if;
  select id into lead from wa_leads where phone=ph for update;
  if lead is null then return new; end if;
  next_stage:=case new.status::text when 'pending' then 'reserva_pendiente'
    when 'cancelled' then 'cerrado' when 'completed' then 'realizado'
    when 'review_sent' then 'realizado' else 'agendado' end;
  update wa_leads set stage=case when opted_out then 'cerrado' else next_stage end,paused=true,updated_at=now() where id=lead;
  update wa_outbox set status='cancelled' where lead_id=lead and status='queued';
  return new;
end $$;
revoke execute on function public.wa_booking_changed() from public, anon, authenticated;
create trigger wa_booking_campaign after insert or update of status on public.bookings
  for each row execute function public.wa_booking_changed();
commit;
