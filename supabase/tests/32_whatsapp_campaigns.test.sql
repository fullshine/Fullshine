-- Ejecutar SOLO en base de pruebas después de migración 32. Todo se revierte.
begin;
do $$
declare l uuid; j uuid; n integer;
begin
  l:=public.wa_ingest('56900000001','Prueba','test:incoming:1','pulido y tapiz',now(),false,'pulido_tapiz',false,false,'Bienvenida');
  perform public.wa_ingest('56900000001','Prueba','test:incoming:1','pulido y tapiz',now(),false,'pulido_tapiz',false,false,'Bienvenida');
  select count(*) into n from public.wa_events where lead_id=l;
  assert n=1, 'Evento duplicado';
  select count(*) into n from public.wa_outbox where lead_id=l;
  assert n=1, 'Bienvenida duplicada';
  select id into j from public.wa_outbox where lead_id=l;
  perform public.wa_claim(j);
  select count(*) into n from public.wa_claim(j);
  assert n=0, 'Envío reclamado dos veces';
  perform public.wa_finish(j,'test-provider-1');
  j:=public.wa_quote(l,169990,'Cotización de prueba revisada',true);
  perform public.wa_claim(j);
  perform public.wa_finish(j,'test-provider-2');
  select count(*) into n from public.wa_outbox where quote_id=j and status='queued';
  assert n=2, 'Seguimientos no programados';
  perform public.wa_finish(j,'test-provider-2');
  select count(*) into n from public.wa_outbox where quote_id=j;
  assert n=2, 'Seguimientos duplicados';
  perform public.wa_ingest('56900000001',null,'test:human:1','Yo atiendo',now(),true,'unknown',false,false,'');
  assert (select paused from public.wa_leads where id=l), 'No pausó intervención humana';
  assert not exists(select 1 from public.wa_outbox where lead_id=l and status='queued'), 'No canceló seguimientos';
  perform public.wa_ingest('56900000001','Prueba','test:stop:1','No me escribas',now(),false,'unknown',true,false,'');
  assert (select opted_out and stage='cerrado' from public.wa_leads where id=l), 'No respetó baja';
  begin
    perform public.wa_quote(l,10000,'No debe enviar esta cotización',true);
    raise exception 'La baja permitió cotizar';
  exception when raise_exception then
    if SQLERRM='La baja permitió cotizar' then raise; end if;
  end;
end $$;
rollback;
