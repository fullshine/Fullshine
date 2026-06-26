# Fullshine Detailing — Estado del Proyecto

## Stack
- **Framework**: Next.js 14 App Router (Server Components)
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS — tema oscuro premium (bg-gray-950, amber-500)
- **Animaciones**: Framer Motion (`src/components/animations.tsx`)
- **WhatsApp**: Green API — teléfono: 56933654943
- **Repositorio**: github.com/fullshine/Fullshine (rama main)
- **Dominio objetivo**: fullshine.autos (a conectar en Netlify)

## Credenciales (NUNCA subir al repo)
- Supabase keys → `.env.local`
- Green API credentials → `.env.local`
- `.env.local` está en `.gitignore` ✅

## Archivos clave
| Archivo | Descripción |
|---|---|
| `src/app/page.tsx` | Homepage principal con todas las secciones |
| `src/components/animations.tsx` | FadeUp, FadeIn, StaggerList, StaggerItem, HoverCard, ParallaxSection |
| `public/truck.jpg` | Foto Ford Ranger brandizada (1600×881px) |
| `public/logo.png` | Logo Fullshine |
| `public/reviews/review-cata.jpg` | Toyota Corolla Cross blanco (reseña Cata) |
| `public/reviews/review-jorge.jpg` | Haval H6 gris (reseña Jorge) |
| `public/reviews/review-jonathan.jpg` | Chevrolet Colorado negro (reseña Jonathan) |
| `netlify.toml` | Configuración de deploy en Netlify |

## Secciones de la homepage
1. **NAV** — fijo, blur, logo + botón Reservar
2. **HERO** — pantalla completa, fade-in animado
3. **TRUCK SHOWCASE** — foto camioneta con parallax + texto overlay
4. **WHY US** — 4 tarjetas con hover lift
5. **SERVICES** — servicios desde Supabase, agrupados por categoría
6. **GOOGLE REVIEWS** — 3 reseñas reales con fotos de autos
7. **BUSINESS SUBSCRIPTION** — plan empresarial + CTA WhatsApp
8. **FOOTER** — contacto y copyright

## Reseñas Google
- Link perfil: https://share.google/CuDgbHdTZu1FF03yi
- Cata Mayorga J (5 meses) — Toyota Corolla Cross blanco
- Jorge Bizama Gallegos (5 meses) — Haval H6 gris
- Jonathan Ramirez Campos (6 meses) — Chevrolet Colorado negro

## Deploy — Netlify (PENDIENTE)
1. ✅ Código subido a GitHub
2. ⬜ Conectar repo en netlify.com → "Import from Git"
3. ⬜ Build command: `npm run build` / Publish dir: `.next`
4. ⬜ Agregar variables de entorno (copiar desde .env.local)
5. ⬜ Conectar dominio `fullshine.autos`

## Ubicaciones del negocio
- Concepción (taller)
- San Pedro de la Paz (a domicilio)
- Horario: Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
