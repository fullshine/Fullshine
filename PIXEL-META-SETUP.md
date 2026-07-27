# Pixel de Meta — Fullshine

El código ya está listo y desplegado. **Falta un solo dato: tu ID de Pixel.**
Mientras la variable no exista, el píxel no carga (no rompe nada, simplemente no mide).

---

## Paso 1 — Encontrar tu ID de Pixel

Como ya tienes una campaña corriendo, es muy probable que el píxel exista.

1. Entra a **business.facebook.com/events_manager**
2. En la columna izquierda vas a ver tus orígenes de datos. Busca uno con ícono de globo
   llamado algo como *"Pixel de Fullshine"* o *"Fullshine Detailing"*
3. Haz clic encima. El **ID aparece justo debajo del nombre**: son 15 o 16 dígitos,
   por ejemplo `1234567890123456`
4. Cópialo

**Si no aparece ninguno**, créalo:

1. En el Administrador de Eventos, botón verde **"Conectar orígenes de datos"**
2. Elige **Web** → *Siguiente*
3. Nombre: `Fullshine Web`
4. Cuando te pregunte cómo conectarlo, elige **"Instalar el código manualmente"**
   (no uses la integración por partners — nuestro código ya está escrito)
5. Copia el ID que aparece arriba del bloque de código y **cierra el asistente**.
   No necesitas pegar nada de lo que Meta te muestra.

---

## Paso 2 — Cargar el ID en Vercel

1. Entra a **vercel.com** → proyecto **fullshine** → pestaña **Settings**
2. Menú lateral: **Environment Variables**
3. Crea una variable nueva:

   | Campo | Valor |
   |---|---|
   | Key | `NEXT_PUBLIC_META_PIXEL_ID` |
   | Value | *(tu ID de 15-16 dígitos, solo números)* |
   | Environments | marca **Production**, **Preview** y **Development** |

4. **Save**

> ⚠️ Este valor es público por diseño — cualquiera puede verlo en el código de la página.
> Es normal y así funciona el píxel. No lo confundas con las claves de Supabase o Green API,
> que sí son secretas y **nunca** deben salir de las variables de entorno.

---

## Paso 3 — Volver a desplegar

Las variables solo se aplican en un despliegue nuevo:

```powershell
cd C:\Users\centr\OneDrive\Escritorio\fullshine
npx vercel --prod
```

---

## Paso 4 — Verificar que mide

1. Instala la extensión **Meta Pixel Helper** en Chrome
   (Chrome Web Store → buscar "Meta Pixel Helper")
2. Abre `https://www.fullshine.autos/diagnostico`
3. El ícono de la extensión debe ponerse azul y mostrar **2 eventos**: `PageView` y `ViewContent`
4. Haz una reserva de prueba completa. Al confirmar debe aparecer **Lead**

En el Administrador de Eventos, los eventos tardan **hasta 20 minutos** en aparecer
en el panel. En la pestaña **"Probar eventos"** aparecen en tiempo real — usa esa
para verificar.

---

## Qué mide cada evento

| Evento | Cuándo se dispara | Para qué sirve |
|---|---|---|
| `PageView` | Cada página, incluida la navegación interna | Base de todos los públicos |
| `ViewContent` | Al abrir `/diagnostico`, `/oferta-tratamiento-ceramico` o `/revision-gratis-concepcion` | Público de retargeting: vieron la oferta pero no reservaron |
| `InitiateCheckout` | Al avanzar del primer paso del formulario | Mide abandono: cuántos empiezan vs. cuántos terminan |
| `Lead` | Al confirmar una **revisión gratis** | **El evento de optimización de tus campañas** |
| `Schedule` | Al confirmar un servicio **pagado**, con el valor real en CLP | Mide ingreso atribuible a los anuncios |
| `Contact` | Clic en cualquier botón de WhatsApp | Leads que prefieren escribir antes que reservar |

---

## Paso 5 — Configurar la campaña para usar `Lead`

Esto es lo que realmente mejora el rendimiento. Sin este paso, Meta sigue
optimizando por clics en vez de por reservas.

1. Administrador de Anuncios → tu campaña → **Editar**
2. Objetivo de la campaña: **Clientes potenciales**
3. En el conjunto de anuncios → **Ubicación de la conversión: Sitio web**
4. **Evento de conversión: `Lead`**
5. URL de destino del anuncio: `https://www.fullshine.autos/diagnostico`

> Meta necesita alrededor de **50 conversiones en 7 días** para salir de la fase de
> aprendizaje y optimizar bien. Con el volumen de un taller local eso puede tomar
> varias semanas. Mientras tanto, si el conjunto acumula muy pocos `Lead`, puedes
> optimizar temporalmente por `InitiateCheckout`, que ocurre más seguido, y cambiar
> a `Lead` cuando haya suficiente historial.

---

## Paso 6 — Verificar el dominio (recomendado)

Sin esto, iOS limita bastante la medición desde iPhone — que es donde está buena
parte de tu tráfico.

1. Administrador de Eventos → **Configuración del negocio** → **Seguridad de la marca** → **Dominios**
2. **Agregar** → `fullshine.autos`
3. Elige verificación por **metaetiqueta de DNS TXT** o **etiqueta HTML**
4. Si eliges la etiqueta HTML, pásame el código y lo agrego a `layout.tsx`
   (ahí ya está la verificación de Google, va en el mismo lugar)

Después de verificar, configura los **eventos web agregados**: pon `Lead` como
evento de máxima prioridad en la lista de 8 eventos.

---

## Públicos que vale la pena crear

Una vez que el píxel tenga 2-3 semanas de datos:

- **Retargeting caliente** — `ViewContent` en los últimos 30 días, excluyendo `Lead`.
  Son los que miraron la landing y no agendaron. Público pequeño pero el más barato de convertir.
- **Abandono de formulario** — `InitiateCheckout` sin `Lead`, últimos 14 días.
  Estuvieron a un paso. Anuncio ideal: recordatorio simple con la dirección del taller.
- **Público similar (Lookalike)** — 1% de Chile basado en tus `Lead`.
  Necesita mínimo 100 leads para funcionar bien; guárdalo para más adelante.
- **Excluir clientes** — quienes dispararon `Schedule`. No tiene sentido pagar por
  mostrarle el diagnóstico gratis a alguien que ya te compró.

---

## Nota sobre lo que el píxel **no** va a capturar

Entre un 20% y un 30% de las conversiones se pierden por bloqueadores de anuncios,
Safari con protección de rastreo, y usuarios de iPhone que rechazaron el seguimiento.

La solución es la **API de Conversiones** (envío servidor-a-servidor desde Supabase,
que no depende del navegador). Es el siguiente escalón cuando tengas volumen suficiente
para que la diferencia importe. Avísame cuando quieras montarla.
