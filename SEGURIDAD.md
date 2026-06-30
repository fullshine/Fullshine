# Evaluación de seguridad — fullshine.autos
**Fecha:** 28 junio 2026

---

## Resumen ejecutivo

El sitio tiene una postura de seguridad **media-buena** para un negocio local. No hay vulnerabilidades críticas evidentes, pero existen 3 problemas reales que deben corregirse, y varios riesgos menores.

---

## Problemas críticos (corregir ahora)

### 🔴 1. Las Server Actions de admin NO verifican autenticación

**El problema más serio.** Funciones como `moveBookingStage`, `sendPaymentLink`, `deleteCustomer`, `getDashboardStats` usan `createAdminClient()` — que usa la `SERVICE_ROLE_KEY` de Supabase, la cual **bypasea todas las RLS policies**. Pero ninguna de estas funciones verifica primero si el usuario que llama está autenticado.

En Next.js, las Server Actions son endpoints HTTP accesibles directamente. Cualquier persona que inspeccione el tráfico de red puede llamarlas desde fuera del browser.

**Impacto:** Un atacante podría eliminar clientes, cambiar estados de reservas, o extraer toda la base de datos sin autenticarse.

**Fix:**
```ts
// Al inicio de cada server action de admin:
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { success: false, error: 'No autorizado' }
```

### 🔴 2. El webhook de Flow.cl no existe

El archivo `flow.ts` configura `urlConfirmation: /api/flow/webhook` pero **esa ruta no existe en el código**. Esto significa que Flow nunca puede confirmar pagos recibidos — los pagos caen al vacío sin actualizar el estado de la reserva en la base de datos.

Además, cuando se implemente, el webhook DEBE verificar la firma HMAC antes de procesar cualquier actualización de pago. Sin esto, cualquiera podría enviar un POST falso marcando reservas como "pagadas".

### 🔴 3. Webhook de WhatsApp acepta cualquier POST sin verificación

```ts
// Actual — acepta cualquier cuerpo sin validar origen
export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('WhatsApp webhook:', JSON.stringify(body))
  return NextResponse.json({ status: 'ok' })
}
```

Actualmente solo hace log, no ejecuta lógica de negocio, así que el riesgo real es bajo. Pero si en el futuro procesa acciones, necesita verificar la firma `X-Hub-Signature-256` de Meta.

---

## Problemas medios

### 🟡 4. El middleware de autenticación es débil

```ts
const hasSession = request.cookies.getAll().some(c =>
  c.name.startsWith('sb-') && c.name.includes('auth-token')
)
```

Esto solo verifica si existe una cookie con ese nombre — **no verifica que sea válida**. Un atacante podría forjar una cookie `sb-fake-auth-token=cualquier_cosa` y pasar el middleware.

**Fix:** Verificar la sesión con Supabase, no solo la existencia de la cookie:
```ts
const supabase = createServerClient(...)
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/admin/login')
```

### 🟡 5. El endpoint `/api/push/subscribe` es público y sin autenticación

Cualquiera puede registrar su propio navegador como destinatario de push notifications del admin. Si envías notificaciones de nuevas reservas a todos los suscritos, un atacante podría suscribirse y recibir datos de clientes en tiempo real.

**Fix:** Solo aceptar suscripciones push si el usuario está autenticado como admin.

### 🟡 6. El token de verificación de Meta webhook está hardcodeado

```ts
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? 'fullshine_webhook_2024'
```

Si `META_WEBHOOK_VERIFY_TOKEN` no está seteado en Vercel, usa `'fullshine_webhook_2024'` por defecto — un valor predecible y público (visible en el código si el repo es público).

**Fix:** Eliminar el fallback. Si no está seteado, el webhook debe fallar con error.

---

## Riesgos bajos (pero a tener en cuenta)

### 🟢 7. El callback de Google Calendar no verifica state CSRF

El flujo OAuth de Google no incluye un parámetro `state` para prevenir ataques CSRF. Un atacante podría forzar al admin a conectar el calendario de otra cuenta. Riesgo bajo porque requiere que el atacante tenga acceso físico o social al admin.

### 🟢 8. No hay rate limiting en el formulario de reservas

Un bot podría crear cientos de reservas falsas, llenando el calendario y recibiendo mensajes de WhatsApp. Supabase no tiene rate limiting por defecto en inserts via service role.

**Fix simple:** Agregar un honeypot field oculto en el formulario, o verificar que el teléfono tenga formato chileno válido antes de procesar.

### 🟢 9. `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicas

Esto es normal e intencional en Supabase — la anon key tiene permisos limitados por las RLS policies. No es un problema **siempre que las RLS policies estén bien configuradas**. Verificar en el dashboard de Supabase que las tablas `bookings`, `customers`, `vehicles` tengan RLS activado.

---

## Lo que está bien

✅ Contraseñas manejadas por Supabase Auth (bcrypt, no almacenadas en texto plano)
✅ Firma HMAC-SHA256 correctamente implementada para Flow.cl
✅ Variables de entorno sensibles (SERVICE_ROLE_KEY, FLOW keys, GREEN_API) solo en Vercel
✅ No hay SQL injection posible — Supabase usa queries parametrizadas
✅ HTTPS forzado por Vercel en producción
✅ No hay secretos en el código fuente (salvo el token de webhook con fallback)

---

## Plan de acción priorizado

| # | Problema | Urgencia | Tiempo estimado |
|---|---|---|---|
| 1 | Agregar verificación de auth en server actions de admin | Alta | 30 min |
| 2 | Crear ruta `/api/flow/webhook` con verificación HMAC | Alta | 1 hora |
| 3 | Mejorar middleware con verificación real de sesión | Alta | 20 min |
| 4 | Proteger endpoint push subscribe con auth | Media | 15 min |
| 5 | Eliminar fallback del token de Meta webhook | Baja | 5 min |
| 6 | Rate limiting en formulario de reservas | Baja | 1 hora |
