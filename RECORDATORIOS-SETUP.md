# Recordatorios automáticos por WhatsApp

Envía dos mensajes sin que tengas que hacer nada:

- **El día anterior** — recordatorio con dirección, mapa y **petición de confirmación**
- **2 horas antes** — aviso corto el mismo día *(requiere el paso 4, opcional)*

---

## Paso 1 — Ejecutar el SQL en Supabase

Supabase → **SQL Editor** → pega el contenido de `supabase/16_recordatorios.sql` → **Run**.

Agrega dos columnas a `bookings` (`reminder_24h_at` y `reminder_2h_at`) que evitan
que un mismo cliente reciba el recordatorio dos veces.

Para verificar:

```sql
SELECT id, scheduled_at, reminder_24h_at, reminder_2h_at
FROM bookings ORDER BY scheduled_at DESC LIMIT 5;
```

Las dos columnas nuevas deben aparecer en `null`.

---

## Paso 2 — Crear el secreto del cron

Sirve para que nadie más pueda disparar los envíos llamando a la URL.

En PowerShell, genera una clave al azar:

```powershell
-join ((48..57) + (97..122) | Get-Random -Count 40 | % {[char]$_})
```

Copia el resultado y cárgalo en Vercel:

```powershell
cd C:\Users\centr\OneDrive\Escritorio\fullshine
npx vercel env add CRON_SECRET production
```

> Este sí es un valor **secreto**. No lo compartas ni lo subas a GitHub.

---

## Paso 3 — Desplegar

```powershell
git add .
git commit -m "recordatorios automaticos por whatsapp"
npx vercel --prod
```

El archivo `vercel.json` deja programada una ejecución diaria a las **13:00 UTC**
(09:00 en Chile en invierno, 10:00 en verano). En esa corrida se envían los
recordatorios de **todas las citas del día siguiente**.

Para confirmar que quedó activo: Vercel → proyecto → pestaña **Cron Jobs**.

---

## Paso 4 — Recordatorio de 2 horas *(opcional)*

El plan gratuito de Vercel permite **una sola ejecución diaria**, así que el aviso
de 2 horas antes necesita un disparador externo. Se hace con un servicio gratuito:

1. Entra a **cron-job.org** y crea una cuenta
2. **Create cronjob**
3. Configura:

   | Campo | Valor |
   |---|---|
   | Title | `Fullshine recordatorios` |
   | URL | `https://www.fullshine.autos/api/cron/recordatorios` |
   | Schedule | Cada hora, entre las 08:00 y las 20:00 |
   | Timezone | `America/Santiago` |

4. En la pestaña **Advanced** → **Headers**, agrega:

   | Header | Valor |
   |---|---|
   | `Authorization` | `Bearer TU_CRON_SECRET` |

5. Guarda y activa

Con esto el endpoint corre cada hora y ambos recordatorios funcionan.
El de 24 h sigue sin duplicarse: la columna de control lo impide.

---

## Paso 5 — Probar que funciona

**Prueba manual** (reemplaza el secreto):

```powershell
curl.exe -H "Authorization: Bearer TU_CRON_SECRET" https://www.fullshine.autos/api/cron/recordatorios
```

Respuesta esperada:

```json
{
  "ejecutado": "2026-07-27T13:00:00.000Z",
  "recordatorios_24h": [],
  "recordatorios_2h": [],
  "errores": []
}
```

**Prueba real:** crea una reserva de prueba **para mañana** con tu propio número,
ejecuta el comando de arriba y revisa tu WhatsApp. El ID de la reserva debe
aparecer dentro de `recordatorios_24h`. Después borra la reserva del kanban.

---

## Qué mensaje recibe el cliente

**El día anterior:**

> ⏰ *Recordatorio Fullshine*
>
> ¡Hola Juan! Mañana te esperamos:
>
> 🛠️ *Revisión y Diagnóstico GRATIS*
> 📅 martes, 28 de julio de 2026
> 🕐 15:00
> 📍 Camilo Henríquez 381, Concepción
>
> 🗺️ Cómo llegar: *(link a Google Maps)*
>
> El diagnóstico toma entre 15 y 20 minutos y no tiene costo. Solo trae el auto como esté — no hace falta lavarlo antes.
>
> 👉 *¿Confirmas que vienes?* Respóndeme *SÍ* para dejar tu hora asegurada.
> Si te surgió algo, avísame y la movemos sin problema. 🙌

**2 horas antes:**

> 🚗 ¡Hola Juan! Te esperamos hoy a las *15:00*.
>
> 📍 Camilo Henríquez 381, Concepción
> 🗺️ *(link a Google Maps)*
>
> Si vas atrasado no te preocupes, solo avísame por aquí.

---

## Por qué se pide confirmación

No es un detalle de cortesía. Quien responde "SÍ" asiste bastante más que quien
solo recibe el aviso: el acto de responder genera un compromiso.

Y tiene un segundo beneficio, igual de valioso: el que **no** puede venir te lo dice
con un día de anticipación, y liberas ese cupo en vez de descubrirlo cuando nadie llega.

Ese mensaje llega a tu WhatsApp normal — vas a tener que responderlos tú, o dejar
que lo haga el agente IA cuando lo actives (`AGENT-SETUP.md`).

---

## Reglas de seguridad que aplica el endpoint

- Solo recuerda citas en estado `pending` o `confirmed`. Las canceladas y
  completadas se saltan.
- Cada envío se marca con fecha y hora. Aunque el cron corra 12 veces al día,
  nadie recibe dos veces el mismo mensaje.
- Sin la cabecera `Authorization` correcta, devuelve 401. El cron interno de
  Vercel se autentica solo.
- Si un cliente no tiene teléfono registrado, se salta y queda anotado en `errores`
  en lugar de romper toda la ejecución.
