# Calendario de mantención cerámica

Convierte cada tratamiento cerámico en una venta recurrente cada 6 meses,
sin que tengas que acordarte de nada.

---

## Cómo funciona

```
Completas un cerámico en el CRM
            ↓
  Se programa solo a 6 meses
            ↓
   30 días antes → 1er aviso por WhatsApp
            ↓  (sin respuesta)
     15 días después → 2º aviso, otro ángulo
            ↓  (sin respuesta)
  Queda en el panel para llamada personal
            ↓
   Cuando viene y se completa la mantención
            ↓
  Se programa la siguiente a 6 meses  ← el ciclo se mantiene solo
```

---

## Puesta en marcha

### 1. Ejecutar el SQL

Supabase → **SQL Editor** → pega `supabase/17_calendario_mantencion.sql` → **Run**.

Crea la tabla, el trigger automático y **carga de una vez todos los cerámicos
que ya tienes completados** en el sistema.

Verifica cuántos quedaron programados:

```sql
SELECT status, COUNT(*) FROM maintenance_schedule GROUP BY status;
```

### 2. Desplegar

```powershell
cd C:\Users\centr\OneDrive\Escritorio\fullshine
git add .
git commit -m "calendario de mantencion ceramica + carga de trabajos historicos"
npx vercel --prod
```

### 3. Cargar tus clientes históricos

Aquí está el trabajo manual, y es el que más rinde.

**CRM → botón morado "📚 Cargar trabajos históricos"**

Ese formulario:

- Entra el trabajo directo como **completado** (no pasa por el kanban)
- Acepta cualquier fecha pasada
- **No envía ningún WhatsApp** al cliente
- Si el servicio es cerámico, **le programa la mantención automáticamente**
- Conserva servicio y fecha entre cargas, para meter varios seguidos rápido

Carga tus 20-50 clientes de cerámico con la fecha real en que se los hiciste.
En cuanto guardes cada uno, aparece en el calendario con su fecha de mantención.

> **Ojo con las fechas.** Si aplicaste un cerámico hace 8 meses, la mantención
> aparecerá como **vencida** y el sistema le escribirá en la siguiente corrida.
> Eso es correcto — pero revisa la lista antes de disparar los avisos, para
> sacar autos vendidos o clientes que ya no corresponden.

---

## El panel: `/admin/mantenciones`

Arriba, cuatro números: vencidas, próximas a vencer, activas y completadas.
Más abajo cada cliente con su fecha y su estado.

**Acciones por cliente:**

| Botón | Qué hace |
|---|---|
| 💬 Enviar recordatorio | Manda el WhatsApp ahora, sin esperar al cron |
| 📅 Agendó hora | Marca que ya reservó (deja de recibir avisos) |
| ⏳ Posponer 3 meses | El cliente pidió esperar. Se corre la fecha y se reinicia el ciclo |
| ✕ No le interesa | Lo saca del calendario |
| Abrir chat | Abre WhatsApp con ese cliente |

Y arriba, **⚡ Enviar avisos pendientes** corre el motor completo a mano.
Úsalo la primera vez para ver qué haría, con la lista ya depurada.

---

## Los mensajes

**Primer aviso (30 días antes):**

> 💎 *Hola Juan, te escribo desde Fullshine.*
>
> Hace 6 meses aplicamos el tratamiento cerámico a tu *Mazda CX-5*, así que en
> agosto de 2026 corresponde la mantención semestral.
>
> No es un trámite: el booster es lo que mantiene la hidrofobia y el brillo, y es
> la condición para que tu garantía de 3 años siga vigente.
>
> 👉 Puedes agendar tu hora acá: *(link)*
>
> Si prefieres esperar un poco más no hay problema — solo avísame y lo dejo
> anotado para que la garantía no se caiga. 🙌

**Segundo aviso (15 días después, si no respondió):**

> Hola Juan 👋
>
> Te escribí hace unas semanas por la mantención de tu *Mazda CX-5*. No quiero
> insistir, solo dejarte una alternativa:
>
> Si no estás seguro de que le haga falta, pásate y *revisamos el estado del
> coating sin costo*. Medimos la hidrofobia, revisamos el brillo y te digo con
> honestidad si conviene hacer la mantención ahora o si puede esperar.
>
> A veces la respuesta es que puede esperar. También te lo voy a decir.

El segundo no repite la oferta: cambia de ángulo y baja la barrera a cero.
Y el cierre honesto es el que más reactiva al indeciso.

---

## Protecciones incluidas

- **Máximo 25 mensajes por corrida.** Protege tu número de WhatsApp de un bloqueo.
  Si tienes 60 mantenciones vencidas, salen en tandas a lo largo de varios días.
- **Nadie recibe el mismo aviso dos veces**, aunque el cron corra varias veces.
- **Después de 2 avisos sin respuesta**, deja de escribir solo. Queda en el panel
  para que decidas si vale una llamada.
- Todo va en el mismo cron diario de los recordatorios: **no necesitas configurar
  nada nuevo** si ya montaste `RECORDATORIOS-SETUP.md`.

---

## Un tema pendiente que hay que resolver

El archivo `supabase/01_schema.sql` **no refleja la base de datos real**. Se quedó
desactualizado y varias funciones del proyecto se escribieron creyéndole.

Diferencias detectadas hasta ahora:

| Tabla | El archivo dice | La base real usa |
|---|---|---|
| `bookings` | `scheduled_at`, `estimated_end_at` | `booking_date`, `slot_start`, `slot_end` |
| `bookings` | `total_price`, `notes` | `total_price_clp`, `customer_notes` |
| `vehicles` | `make`, `license_plate` | `brand`, `plate` *(por confirmar)* |

Esto ya causó dos errores: el del certificado y el de la carga histórica.
El código nuevo está escrito contra las columnas reales y además lee ambos
nombres donde hay duda, así que funciona — pero conviene cerrarlo del todo.

Ejecuta esto en Supabase y pásame el resultado. Con eso actualizo el archivo de
esquema y reviso si queda alguna función apuntando a columnas inexistentes:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('bookings','vehicles','customers','services')
ORDER BY table_name, ordinal_position;
```
