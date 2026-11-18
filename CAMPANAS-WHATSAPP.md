# Campañas WhatsApp para Fullshine

Implementación preparada el 17 de noviembre de 2026. No publicada ni conectada a la base de producción desde esta sesión.

## Qué incorpora

- Consultas comerciales en `/admin/kanban`, encima de las reservas existentes; filtro por pulido + tapiz, cerámico y por identificar.
- Registro de mensajes nuevos, campaña, vehículo editable, notas, precio, etapa y estado de atención humana.
- Bienvenida automática que solicita datos. La clasificación usa el texto del mensaje, no atribución verificada de Meta Ads. Si menciona ambas campañas queda por identificar.
- Cotización revisada y enviada por el administrador desde la ficha. No inventa categorías de precios, condiciones de cerámico ni disponibilidad. Completar el detalle y precio antes del envío.
- Seguimientos a las 24 y 72 horas desde la aceptación del envío por GREEN-API, si se selecciona esa opción. Se cancelan con una respuesta, intervención humana, baja o reserva. Lunes a viernes 09–19 h y sábado 09–14 h, America/Santiago. Fuera de horario se espera al siguiente procesamiento habilitado.
- Los eventos de mensajes enviados desde el teléfono pausan la conversación. Los ecos `outgoingAPIMessageReceived` no lo hacen.
- Crear o cambiar una reserva actualiza la consulta del mismo teléfono y cancela seguimientos; cambiar manualmente la etapa comercial NO crea una reserva.
- Cola durable, deduplicación de eventos y exclusión de envíos concurrentes por contacto. Un timeout no se reintenta automáticamente: se muestra para revisión.
- Autenticación real de usuario y rol admin/staff en cada acción. Tablas y funciones accesibles solo al backend con service role.

## Incorporar al proyecto original

Esta copia de trabajo se creó porque la carpeta original no es editable desde la sesión. Los cambios no están aplicados en `C:\Users\centr\Documents\Codex\2026-10-21\re\work\fullshine`.

El parche `fullshine-campanas.patch` contiene exclusivamente esta implementación (sin claves, dependencias ni cambios preexistentes). Desde la carpeta original:

```powershell
git --git-dir=.git --work-tree=. apply --check "RUTA_COMPLETA\fullshine-campanas.patch"
git --git-dir=.git --work-tree=. apply "RUTA_COMPLETA\fullshine-campanas.patch"
```

## Preparar antes de activar

1. Aplicar `supabase/32_whatsapp_campaigns.sql` en Supabase, primero en un entorno de prueba. La migración es transaccional y de una sola ejecución. No se ejecutó durante la preparación.
2. Mantener las variables GREEN_API_INSTANCE_ID, GREEN_API_TOKEN, GREEN_API_URL y las de Supabase existentes. No colocar claves en variables NEXT_PUBLIC ni en el código.
3. Definir `CAMPAIGNS_ENABLED=true` y `CAMPAIGNS_SEND_ENABLED=false` para revisar recepción e interfaz sin enviar. Con `CAMPAIGNS_ENABLED=true`, este flujo reemplaza al agente IA en la misma ruta; no requiere Anthropic.
4. Conservar el webhook `/api/whatsapp/agent`. Preferir `webhookUrlToken` con `Bearer <AGENT_WEBHOOK_SECRET>`; la URL con `?token=` existente continúa funcionando. Activar `incomingWebhook=yes` y `outgoingMessageWebhook=yes`. No hace falta activar ecos API. No cambiar el webhook a `/api/whatsapp/webhook`, que es la ruta heredada de Meta.
5. Configurar un programador del servidor que invoque `GET /api/cron/campanas` cada 5 minutos, con `Authorization: Bearer <CRON_SECRET>`. Verificar que el plan del proveedor admita esa frecuencia. El cron diario de recordatorios existente no se altera. Sin este programador no se garantiza el seguimiento a tiempo.
6. Probar con una instancia/número de prueba: mensaje de cada campaña, mensaje ambiguo, adjunto, respuesta manual, baja, evento duplicado y creación de reserva. Verificar que sólo haya una bienvenida, y ninguna respuesta automática tras una baja.
7. Completar y revisar precios/alcance vigentes. Cambiar `CAMPAIGNS_SEND_ENABLED=true` sólo en el entorno donde se quieran habilitar los envíos; desplegar nuevamente.

Los mensajes en cola del modo revisión deben revisarse/cancelarse antes de habilitar envíos para evitar saludos atrasados. Para pausar el bot de un contacto usar «Pausar automatización» en la ficha y guardar. Guardar una ficha cancela los mensajes aún pendientes; reactivar no los recrea. El interruptor de apagado es `CAMPAIGNS_SEND_ENABLED=false` y redeploy. No es necesario borrar tablas para apagar.

## Pruebas

```powershell
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/jest/bin/jest.js --runInBand --cacheDirectory .jest-cache --runTestsByPath __tests__/lib/campaigns.test.ts __tests__/lib/campaigns-server.test.ts
```

Las pruebas de integración SQL están en `supabase/tests/32_whatsapp_campaigns.test.sql`; ejecutar tras la migración en una base de pruebas. Usan datos sintéticos y terminan con ROLLBACK. La comprobación de TypeScript y las pruebas unitarias no sustituyen validar la migración y el webhook en un despliegue de prueba.

## Límites explícitos

- Una ficha por teléfono, hasta 200 recientes visibles. No se importa historial anterior ni se extrae automáticamente vehículo/año de texto libre. Tras la bienvenida, Juan revisa los datos y cotiza desde la ficha.
- La respuesta a adjuntos y solicitudes humanas se deriva sin analizar fotos/audio. La ficha muestra la marca del adjunto, no descarga el archivo.
- No hay cotización totalmente automática ni confirmación de disponibilidad. Requieren primero definir categorías y tarifas vigentes.
- No se puede retirar un mensaje que el proveedor ya esté enviando justo cuando entra una respuesta. Se cancelan los pendientes y se comprueba la pausa antes de cada envío.
- `sent` significa aceptado por GREEN-API, no entrega/lectura comprobada. Los envíos inciertos necesitan revisión humana; no se auto-reintentan. Si una ejecución se interrumpe, el próximo cron los marca tras 10 minutos.
- Para resolver un envío incierto, verificar primero en WhatsApp. En Supabase, actualizar sólo el ID revisado a `sent` (si llegó) o `cancelled` (si no llegó). No volverlo a `queued`. No se programan seguimientos retroactivos al resolverlo manualmente.
- Si una consulta ya tenía reserva antes de instalar el cambio, marcarla manualmente agendada/pausada; el trigger sincroniza las reservas creadas o actualizadas después de instalarse.

## Referencias de integración

- https://green-api.com/en/docs/api/receiving/technology-webhook-endpoint/
- https://green-api.com/en/docs/api/receiving/notifications-format/outgoing-message/OutgoingMessage/
- https://green-api.com/en/docs/api/receiving/notifications-format/outgoing-message/OutgoingApiMessage/
