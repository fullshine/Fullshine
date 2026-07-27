import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import Reveal, { CountUp } from '@/components/Reveal'

export const revalidate = 3600

const CTA_URL = '/reservar?categoria=revision'
const WA_URL =
  'https://wa.me/56933654943?text=' +
  encodeURIComponent('Hola, quiero agendar mi diagnóstico gratuito de pintura 🚗')

export const metadata: Metadata = {
  title: '¿Vale la pena pulir tu auto? Diagnóstico GRATIS — Fullshine Concepción',
  description:
    'Medimos el espesor real de la laca, detectamos rayones corregibles y contaminación invisible. Diagnóstico profesional de pintura sin costo en Concepción. 15-20 minutos.',
  // Landing exclusiva para campañas pagadas
  robots: { index: false, follow: true },
  openGraph: {
    title: '¿Vale la pena pulir tu auto? Descúbrelo gratis',
    description:
      'Diagnóstico profesional de pintura con instrumentos. Sin costo, sin compromiso. Concepción.',
    url: 'https://www.fullshine.autos/diagnostico',
    siteName: 'Fullshine Premium Detailing',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: 'https://www.fullshine.autos/galeria/trabajo-1.jpg', width: 1200, height: 900 }],
  },
}

// ── Datos ────────────────────────────────────────────────────────────────────

const RAZONES = [
  {
    n: '01',
    t: 'No todos los autos necesitan pulido',
    d: 'Muchas pinturas solo requieren descontaminación. Pulir sin necesidad es desgastar laca que nunca vuelve.',
  },
  {
    n: '02',
    t: 'Tu auto puede estar repintado',
    d: 'Una zona repintada tiene un espesor distinto. Tratarla igual que la pintura de fábrica es un riesgo real.',
  },
  {
    n: '03',
    t: 'Un mal pulido reduce la laca',
    d: 'La capa transparente es finita —se mide en micras. Cada pulido agresivo consume parte de ella para siempre.',
  },
  {
    n: '04',
    t: 'Hay rayones que salen sin agredir',
    d: 'Buena parte de las marcas se corrigen con procesos suaves. Saber cuáles evita trabajos innecesarios.',
  },
]

const INCLUYE = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M3 12h4l3-8 4 16 3-8h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    t: 'Medición del espesor',
    d: 'Medidor profesional de capa. Sabrás en micras cuánta laca tiene tu auto y cuánto margen real hay para corregir.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    ),
    t: 'Evaluación de rayones',
    d: 'Bajo luz de inspección revisamos panel por panel: qué desaparece, qué se atenúa y qué no tiene solución.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9Z" strokeLinejoin="round" />
      </svg>
    ),
    t: 'Detección de contaminación',
    d: 'Partículas ferrosas, barro bituminoso y residuos incrustados que no se ven a simple vista pero dañan la pintura.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
      </svg>
    ),
    t: 'Recomendación personalizada',
    d: 'Te decimos exactamente qué necesita tu auto —y qué no. Con honestidad, aunque la respuesta sea "no hagas nada".',
  },
]

const PASOS = [
  { n: 1, t: 'Reservas online', d: 'Eliges día y hora en menos de un minuto. Confirmación inmediata por WhatsApp.' },
  { n: 2, t: 'Inspección profesional', d: 'En taller, con medidor de capa y luz de inspección. Toma 15 a 20 minutos.' },
  { n: 3, t: 'Vemos juntos el resultado', d: 'Te mostramos en el momento el estado real de tu pintura, con los números a la vista.' },
  { n: 4, t: 'Recibes la recomendación', d: 'Qué tratamiento corresponde, qué riesgos hay y cuánto costaría. Sin presión.' },
]

const CHECKLIST = [
  'Estado general de la pintura',
  'Espesor real de la laca (en micras)',
  'Nivel de corrección recomendado',
  'Riesgos detectados',
  'Tratamiento sugerido y alternativas',
]

const RESENAS = [
  { n: 'Cata Mayorga', t: 'Hace 3 años llevé mi auto y tuve una muy buena experiencia, por lo que volví luego de un cambio de vehículo. Quedé encantada con el resultado.' },
  { n: 'Jorge Bizama', t: 'El lavado y pulido dejó el auto como nuevo, hasta sacó manchas de pintura de topones. El dueño explicó paso a paso lo que iba realizando.' },
  { n: 'Jonathan Ramírez', t: 'Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.' },
]

const FOTOS = ['/galeria/trabajo-2.jpg', '/galeria/trabajo-5.jpg', '/galeria/trabajo-4.jpg', '/galeria/trabajo-3.jpg']

// ── Botón CTA reutilizable ───────────────────────────────────────────────────

function CTA({ children, size = 'lg' }: { children: React.ReactNode; size?: 'lg' | 'xl' }) {
  return (
    <Link
      href={CTA_URL}
      className={`group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#00E37A] font-black text-black
        transition-all duration-300 hover:scale-[1.03] hover:bg-[#22ff92]
        shadow-[0_0_30px_-4px_rgba(0,227,122,.55)] hover:shadow-[0_0_50px_-4px_rgba(0,227,122,.8)]
        focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00E37A]/40
        ${size === 'xl' ? 'px-10 py-5 text-lg sm:text-xl' : 'px-8 py-4 text-base sm:text-lg'}`}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
    </Link>
  )
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function DiagnosticoLanding() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Diagnóstico profesional de pintura automotriz',
    serviceType: 'Inspección y medición de pintura',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Fullshine Premium Detailing',
      url: 'https://www.fullshine.autos',
      telephone: '+56933654943',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Camilo Henríquez 381',
        addressLocality: 'Concepción',
        addressRegion: 'Biobío',
        addressCountry: 'CL',
      },
      aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '82', bestRating: '5' },
    },
    areaServed: ['Concepción', 'San Pedro de la Paz'],
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'CLP' },
  }

  return (
    <div className="min-h-screen bg-[#05070A] text-white antialiased overflow-x-hidden selection:bg-[#00E37A] selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ══ HERO ══ */}
      <header className="relative min-h-[100svh] flex items-center justify-center px-5 py-24">
        <Image
          src="/galeria/trabajo-1.jpg"
          alt="Vehículo premium bajo luces de inspección en Fullshine Concepción"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-[#05070A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,.75)_100%)]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <Image src="/logo.png" alt="Fullshine Premium Detailing" width={92} height={92}
              className="mx-auto mb-9 drop-shadow-[0_0_45px_rgba(255,255,255,.28)]" priority />
          </Reveal>

          <Reveal delay={120}>
            <p className="mb-7 text-[10px] sm:text-xs font-bold uppercase tracking-[0.45em] text-[#00E37A]">
              Diagnóstico profesional de pintura
            </p>
          </Reveal>

          <Reveal delay={220}>
            <h1 className="text-[2.6rem] leading-[0.95] sm:text-6xl lg:text-[5.2rem] font-black tracking-[-0.03em]">
              ¿VALE LA PENA<br />PULIR TU AUTO?
            </h1>
          </Reveal>

          <Reveal delay={340}>
            <p className="mt-6 text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#00E37A] via-[#7dffbe] to-[#00E37A]">
              DESCÚBRELO GRATIS
            </p>
          </Reveal>

          <Reveal delay={460}>
            <p className="mx-auto mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-white/60">
              Antes de recomendar cualquier tratamiento, analizamos profesionalmente la pintura de tu vehículo.
              Medimos el espesor real de la laca, detectamos rayones corregibles e identificamos contaminación
              invisible. Y te mostramos exactamente qué necesita tu auto.
            </p>
          </Reveal>

          <Reveal delay={580}>
            <div className="mt-11">
              <CTA size="xl">AGENDAR MI DIAGNÓSTICO GRATUITO</CTA>
            </div>
            <p className="mt-6 text-xs sm:text-sm tracking-wide text-white/35">
              15-20 minutos · Sin costo · Sin compromiso · Camilo Henríquez 381, Concepción
            </p>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#00E37A]/35 pt-2">
            <div className="h-2 w-1 rounded-full bg-[#00E37A]/70" />
          </div>
        </div>
      </header>

      {/* ══ BARRA DE CONFIANZA ══ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] py-10 backdrop-blur-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
          {[
            { v: <CountUp to={5} decimals={1} suffix="★" />, l: 'Google' },
            { v: <CountUp to={82} suffix="" />, l: 'Reseñas verificadas' },
            { v: <><CountUp to={15} />-<CountUp to={20} /></>, l: 'Minutos' },
            { v: '$0', l: 'Costo del diagnóstico' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90} className="text-center">
              <p className="text-2xl sm:text-3xl font-black tabular-nums text-[#FFC107]">{s.v}</p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ 2. POR QUÉ REVISAR ANTES ══ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00E37A]">El método</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              ¿Por qué revisar<br className="hidden sm:block" /> antes de pulir?
            </h2>
            <p className="mt-6 text-white/50 leading-relaxed">
              La mayoría de los talleres te vende un pulido sin haber visto tu auto.
              Nosotros hacemos lo contrario: primero medimos, después recomendamos.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {RAZONES.map((r, i) => (
              <Reveal key={r.n} delay={i * 110}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 backdrop-blur-sm transition-all duration-500 hover:border-[#00E37A]/30 hover:bg-white/[0.045]">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00E37A]/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <p className="mb-4 text-sm font-black tracking-widest text-[#00E37A]/70">{r.n}</p>
                  <h3 className="mb-3 text-xl font-bold leading-snug">{r.t}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{r.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. QUÉ INCLUYE ══ */}
      <section className="relative border-y border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-transparent px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">Incluido</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">¿Qué incluye el diagnóstico?</h2>
            <p className="mt-6 text-white/50">Cuatro análisis técnicos con instrumentos profesionales.</p>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {INCLUYE.map((c, i) => (
              <Reveal key={c.t} delay={i * 110}>
                <article className="group h-full rounded-2xl border border-white/[0.08] bg-[#0A0E14]/80 p-8 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-[#00E37A]/35 hover:shadow-[0_20px_60px_-25px_rgba(0,227,122,.35)]">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[#00E37A]/25 bg-[#00E37A]/10 text-[#00E37A] transition-transform duration-500 group-hover:scale-110">
                    {c.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{c.t}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{c.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. CÓMO FUNCIONA ══ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00E37A]">Proceso</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">¿Cómo funciona?</h2>
          </Reveal>

          <ol className="mt-16 space-y-2">
            {PASOS.map((p, i) => (
              <Reveal key={p.n} delay={i * 110}>
                <li className="group flex gap-6 rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.03]">
                  <div className="flex flex-col items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00E37A]/30 bg-[#00E37A]/10 text-lg font-black text-[#00E37A]">
                      {p.n}
                    </span>
                    {i < PASOS.length - 1 && <span className="mt-2 w-px flex-1 bg-gradient-to-b from-[#00E37A]/25 to-transparent" />}
                  </div>
                  <div className="pb-6 pt-2">
                    <h3 className="mb-2 text-lg font-bold">{p.t}</h3>
                    <p className="text-sm leading-relaxed text-white/50">{p.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ 5. QUÉ RECIBIRÁS ══ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-[#FFC107]/25 bg-gradient-to-b from-[#FFC107]/[0.07] to-transparent p-9 sm:p-14">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#FFC107]/10 blur-3xl" />
              <div className="relative">
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">Tu informe</p>
                <h2 className="mb-9 text-3xl sm:text-4xl font-black tracking-tight">¿Qué recibirás?</h2>
                <ul className="space-y-4">
                  {CHECKLIST.map((item, i) => (
                    <Reveal key={item} delay={i * 90}>
                      <li className="flex items-start gap-4 border-b border-white/[0.06] pb-4">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00E37A]/15 text-xs font-black text-[#00E37A]">✓</span>
                        <span className="text-white/80">{item}</span>
                      </li>
                    </Reveal>
                  ))}
                </ul>
                <p className="mt-8 text-sm leading-relaxed text-white/40">
                  Todo explicado en simple, con los números a la vista. Sin tecnicismos innecesarios
                  y sin intentar venderte algo que tu auto no necesita.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 6. PRUEBA SOCIAL ══ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <div className="mb-3 text-2xl tracking-[0.2em] text-[#FFC107]" aria-label="5 de 5 estrellas">★★★★★</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">5.0 en Google</h2>
            <p className="mt-3 text-white/45">82 reseñas verificadas de clientes reales en Concepción</p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {RESENAS.map((r, i) => (
              <Reveal key={r.n} delay={i * 120}>
                <blockquote className="h-full rounded-2xl border border-white/[0.08] bg-[#0A0E14]/70 p-7 backdrop-blur">
                  <p className="text-sm leading-relaxed text-white/70">"{r.t}"</p>
                  <footer className="mt-5 text-xs font-semibold tracking-wide text-white/35">
                    {r.n} · Cliente verificado
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>

          {/* Trabajos reales */}
          <Reveal delay={150}>
            <p className="mt-20 mb-7 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
              Trabajos reales en nuestro taller
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {FOTOS.map((src, i) => (
              <Reveal key={src} delay={i * 100}>
                <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/[0.08]">
                  <Image
                    src={src}
                    alt="Vehículo tratado en Fullshine Premium Detailing, Concepción"
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-25" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. CTA FINAL ══ */}
      <section className="relative overflow-hidden px-5 py-32 sm:py-44">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E37A]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
              ¿Vale la pena<br />pulir tu auto?
            </h2>
            <p className="mt-6 text-2xl sm:text-3xl font-black text-[#00E37A]">Descúbrelo gratis.</p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12">
              <CTA size="xl">QUIERO MI DIAGNÓSTICO</CTA>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-8 text-sm text-white/35">
              Sin costo · Sin compromiso · 15 a 20 minutos
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block text-sm font-medium text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              ¿Prefieres escribirnos por WhatsApp?
            </a>
          </Reveal>
        </div>
      </section>

      {/* ══ FOOTER MÍNIMO ══ */}
      <footer className="border-t border-white/[0.07] px-5 py-12 text-center">
        <Image src="/logo.png" alt="Fullshine" width={44} height={44} className="mx-auto mb-5 rounded-full opacity-60" />
        <p className="text-sm font-bold tracking-[0.2em] text-white/60">FULLSHINE PREMIUM DETAILING</p>
        <p className="mt-2 text-xs text-white/30">
          Camilo Henríquez 381, Concepción · Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
        </p>
        <p className="mt-5 text-[11px] text-white/20">© 2026 Fullshine. Todos los derechos reservados.</p>
      </footer>

      {/* ══ CTA STICKY MÓVIL ══ */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05070A]/92 p-3 backdrop-blur-lg sm:hidden">
        <Link
          href={CTA_URL}
          className="block rounded-full bg-[#00E37A] py-4 text-center text-base font-black text-black shadow-[0_0_28px_-6px_rgba(0,227,122,.7)]"
        >
          AGENDAR DIAGNÓSTICO GRATIS
        </Link>
      </div>
      <div className="h-20 sm:hidden" aria-hidden />
    </div>
  )
}
