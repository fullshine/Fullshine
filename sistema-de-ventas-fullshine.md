# Sistema de ventas Fullshine

**Objetivo:** que el flujo de clientes deje de depender de que tú hagas algo cada mes.

---

## El diagnóstico

Hoy tu negocio funciona así: cuando hay anuncios corriendo, entran clientes.
Cuando se apagan, el mes empieza en cero. Es un negocio de **caza**: cada venta
requiere salir a buscarla de nuevo.

Un sistema de ventas convierte eso en **agricultura**: siembras una vez y la misma
plantación produce varias cosechas. La diferencia no es de esfuerzo, es de estructura.

Tienes cuatro fuentes posibles. Casi todos los talleres usan solo la más cara.

| Motor | Costo por cliente | Velocidad | ¿Se apaga si dejas de invertir? |
|---|---|---|---|
| 1. Mantención de clientes cerámico | ~$0 | Inmediata | No |
| 2. Reactivación de base | ~$0 | 1-2 semanas | No |
| 3. Referidos | Solo si funciona | Continua | No |
| 4. Anuncios pagados | El más alto | Inmediata | **Sí** |

Estás a punto de encender el motor 4 sin haber tocado los tres primeros.
Eso no está mal — pero es empezar por el más caro.

---

## Motor 1 — Calendario de mantención cerámica ⭐ EMPEZAR AQUÍ

### Por qué este primero

Tienes entre 20 y 50 clientes con tratamiento cerámico. Cada uno necesita su
**Booster cada 6 meses** — y eso no es un argumento de venta que te inventaste:
es una condición técnica que **ya les prometiste por escrito** en el certificado
de garantía que reciben por WhatsApp.

O sea que hoy tienes gente que:

- Ya te compró (te conoce y confía)
- Necesita el servicio (no hay que convencerlos de nada)
- Tiene una fecha objetiva de vencimiento
- Está registrada en tu base de datos con teléfono

Y nadie los está contactando. **Eso es plata sobre la mesa.**

### Los números

Con ~35 clientes de cerámico y una adopción realista del 40-50% el primer año:

| | |
|---|---|
| Mantenciones al año | 28 – 35 |
| Ticket promedio (mix Essential/Signature) | ~$130.000 |
| **Ingreso anual del motor** | **$3,6M – $4,5M CLP** |

Y crece solo: cada cerámico nuevo que vendas suma dos mantenciones anuales
para siempre. En dos años este motor puede sostener buena parte de tu mes fijo.

### Cómo funciona

```
Cliente completa un cerámico
        ↓
   (5 meses después)
        ↓
Mensaje: "Tu garantía necesita el booster el próximo mes"
        ↓
   (si no responde, 15 días después)
        ↓
Mensaje 2, distinto ángulo
        ↓
   (si no responde)
        ↓
Aparece en tu panel de "Mantenciones pendientes" para llamada personal
```

Todo automático hasta el último paso.

### El mensaje (mes 5)

> 💎 *Hola [Nombre], te escribo del taller.*
>
> Hace 6 meses aplicamos el tratamiento cerámico a tu [Vehículo], y según tu
> certificado de garantía **[FS-2026-0012]** corresponde la mantención semestral.
>
> No es un trámite: el booster es lo que mantiene la hidrofobia y el brillo, y
> es la condición para que tu garantía de 3 años siga vigente.
>
> Tengo estos horarios disponibles la próxima semana: [link]
>
> Si prefieres esperar un poco más, no hay problema — solo avísame para dejarlo
> anotado y que la garantía no se caiga.

**Por qué funciona:** no vende, *recuerda un compromiso mutuo*. El cliente no
siente que le están ofreciendo algo, siente que le están cuidando algo que ya pagó.

---

## Motor 2 — Reactivación de base

Tienes entre 100 y 300 clientes históricos. La mayoría no ha vuelto simplemente
porque **nadie les dio un motivo ni una fecha**.

Segmenta por tiempo desde la última visita y manda un mensaje distinto a cada grupo:

| Segmento | Mensaje | Objetivo |
|---|---|---|
| **3 a 6 meses** | "Tu auto ya debe estar pidiendo un lavado técnico" | Lavado detallado |
| **6 a 12 meses** | "Te invito a un diagnóstico gratis, veamos cómo está tu pintura hoy" | Diagnóstico → pulido o cerámico |
| **Más de 12 meses** | "Han pasado varias cosas en el taller desde tu última visita" + fotos | Reconexión |

**Regla de oro:** manda por tandas de 20-30 al día, nunca todos de golpe.
WhatsApp bloquea números que envían decenas de mensajes idénticos en poco tiempo,
y perder tu número sería mucho peor que ganar tres clientes.

Con 200 clientes y una respuesta típica del 5-15%, esperas **10 a 30 reservas**
en las primeras semanas. Es un pozo que se agota — pero se puede repetir cada
4 o 6 meses.

---

## Motor 3 — Referidos

Tienes 5,0 estrellas con 82 reseñas. Tus clientes están encantados y **nadie
les ha pedido nunca que te recomienden**.

### El momento exacto

No pidas el referido por mensaje días después. Pídelo **cuando entregas el auto**,
que es el instante de máxima satisfacción — la persona está mirando su auto
brillando y sintiendo que valió la pena.

### La mecánica

> "Si conoces a alguien que le sirva, mándale mi WhatsApp. A quien venga de tu
> parte le hago el diagnóstico completo y **tú tienes $20.000 de descuento en tu
> próximo servicio**."

Ambos ganan. Tú pagas solo si funciona. Y el costo por cliente es una fracción
de lo que te cuesta en Meta.

Después reforzarlo por WhatsApp 3 días más tarde, junto con la solicitud de reseña
de Google que ya tienes en el kanban.

---

## Motor 4 — Anuncios pagados

Ya está armado (ver `campana-diagnostico-gratis.md`). Es el motor más rápido
y el único que te permite crecer por encima de tu base actual.

Pero recuerda lo que es: **alquiler, no propiedad.** El día que dejas de pagar,
se apaga. Por eso conviene que financie a los otros tres, no al revés.

---

## Nivel 5 — Fullshine Club (el paso siguiente)

Los cuatro motores anteriores mejoran mucho tu flujo, pero siguen siendo
transacciones sueltas. El único ingreso *verdaderamente* siempre activo es el
**recurrente**.

Ya tienes el concepto diseñado (`demo-fullshine-club.html`) y decidiste dejarlo
para después. Era la decisión correcta en ese momento — pero el orden natural es:

1. Haz funcionar el calendario de mantención (Motor 1)
2. Cuando 15-20 clientes estén viniendo cada 6 meses de forma consistente…
3. …convertir eso en una suscripción mensual deja de ser un salto de fe

El Club no es un producto nuevo: es empaquetar lo que ya estará ocurriendo.

---

## Orden de construcción — 6 semanas

| Semana | Qué se hace | Quién |
|---|---|---|
| **1** | Calendario de mantención cerámica: base de datos, automatización y panel | Yo construyo |
| **1** | Lanzar campaña Meta al diagnóstico | Tú |
| **2** | Revisar la lista de clientes cerámico y depurarla (autos vendidos, etc.) | Tú |
| **2-3** | Sistema de referidos: mensaje automático post-entrega + control de canjes | Yo construyo |
| **3-4** | Reactivación: segmentar la base y enviar por tandas | Los dos |
| **5** | Primera revisión de números reales de todos los motores | Los dos |
| **6** | Decidir si el Club entra en operación | Los dos |

---

## Los cuatro números que hay que mirar

Todo lo demás es ruido.

1. **Diagnósticos agendados por semana** — mide si entra gente
2. **% que efectivamente llega** — mide si el recordatorio funciona
3. **% que compra después del diagnóstico** — mide tu conversión en el taller
4. **Cuántos clientes vuelven una segunda vez** — mide si el sistema funciona de verdad

El cuarto es el más importante y el que casi nadie mide. Un negocio donde nadie
vuelve necesita clientes nuevos todos los meses para siempre. Uno donde vuelven
crece incluso en un mes malo de captación.

---

## Lo que yo construiría primero, si solo pudiera hacer una cosa

**El calendario de mantención cerámica.**

Es el único motor donde el cliente ya te compró, ya confía, ya necesita el servicio,
y donde tú ya te comprometiste por escrito a recordárselo.

No hay que convencer a nadie de nada. Solo hay que aparecer a tiempo.
