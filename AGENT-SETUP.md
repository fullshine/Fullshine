# Agente IA de WhatsApp — Guía de activación

El agente responde el WhatsApp de Fullshine 24/7: cotiza con precios reales de la base de datos, empuja a reservar y deriva a humano cuando corresponde. Está **apagado por defecto** hasta completar estos pasos.

## Paso 1 — Ejecutar la migración SQL

En Supabase → SQL Editor, pega y ejecuta el contenido de:
`supabase/14_agent_conversations.sql`

## Paso 2 — Obtener API key de Anthropic

1. Entra a https://console.anthropic.com
2. Crea una cuenta (o inicia sesión) → API Keys → Create Key
3. Copia la key (empieza con `sk-ant-`)
4. Carga saldo mínimo (USD $5 dura meses con el volumen de un taller)

## Paso 3 — Variables de entorno en Vercel

Vercel → proyecto fullshine → Settings → Environment Variables. Agregar:

| Variable | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | tu key `sk-ant-...` |
| `AGENT_ENABLED` | `true` |
| `AGENT_WEBHOOK_SECRET` | un token aleatorio largo (ej: genera uno en https://generate-secret.vercel.app/32) |
| `AGENT_MODEL` | `claude-haiku-4-5-20251001` (opcional, es el default) |

Después de agregarlas: **Redeploy** (las env vars solo aplican en deploys nuevos).

## Paso 4 — Configurar el webhook en GreenAPI

1. Entra a tu consola de GreenAPI → tu instancia → Settings
2. **webhookUrl**: `https://www.fullshine.autos/api/whatsapp/agent?token=TU_AGENT_WEBHOOK_SECRET` (el mismo token del paso 3)
3. Activa **solo** el evento `incomingMessageReceived` (deja los demás en "no")
4. Guarda

## Paso 5 — Probar

Desde un celular que NO sea el del negocio, escribe al WhatsApp de Fullshine:
- "Hola, cuánto cuesta el cerámico para un SUV?" → debe cotizar Gold SUV con precio real
- "quiero hablar con una persona" → debe derivar y te llega alerta al número del negocio

## Comandos de administrador

Desde el WhatsApp del negocio (+56 9 3365 4943), escribiéndole al mismo número:

- `pausar 912345678` — el bot deja de responder a ese cliente (tú tomas la conversación)
- `activar 912345678` — el bot vuelve a atenderlo
- `bot estado` — últimas 10 conversaciones y su estado

Cuando el bot deriva solo (cliente pide humano, reclamo, etc.), se pausa automáticamente y te avisa.

## Apagado de emergencia

Vercel → Environment Variables → `AGENT_ENABLED` = `false` → Redeploy. El webhook sigue recibiendo pero no responde nada.

## Guardrails incluidos

- Nunca inicia conversaciones — solo responde a quien escribe primero (clave anti-baneo)
- Máximo 40 respuestas por contacto en 24h
- Delay de 2-5 segundos antes de responder (comportamiento humano)
- Ignora grupos, estados y mensajes de más de 5 minutos
- Deduplicación: los reintentos de GreenAPI no generan respuestas dobles
- Precios siempre desde Supabase con la promo vigente — el modelo tiene prohibido inventar
- No confirma fechas de cita (eso solo por el link de reserva con disponibilidad real)

## Costos estimados

Claude Haiku: ~$0.001-0.003 USD por respuesta. Con 300 mensajes/mes ≈ **menos de $1 USD/mes**.
