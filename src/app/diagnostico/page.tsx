import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import Reveal, { CountUp } from '@/components/Reveal'

export const revalidate = 3600

const CTA_URL = '/reservar?categoria=revision'

/**
 * Loop corto (8s) de la medición real.
 * Requiere buena calidad: grabar en horizontal o vertical directo desde el celular
 * (NO reenviado por WhatsApp, que recomprime a 560px).
 * Guardarlo en  public/video/medicion.mp4  y cambiar esta constante a esa ruta.
 * Mientras sea null se muestra el instrumento gráfico.
 */
const VIDEO_MEDICION: string | null = null
const WA_URL =
  'https://wa.me/56933654943?text=' +
  encodeURIComponent('Hola, quiero agendar mi diagnóstico gratuito de pintura 🚗')

export const metadata: Metadata = {
  title: '¿Vale la pena pulir tu auto? Descúbrelo gratis en 15 minutos — Fullshine',
  description:
    'Diagnóstico profesional de pintura en Concepción. Medimos el espesor real de la laca con instrumento certificado antes de recomendar cualquier tratamiento. Gratis, 15 minutos.',
  robots: { index: false, follow: true },
  openGraph: {
    title: '¿Vale la pena pulir tu auto? Descúbrelo GRATIS en 15 minutos',
    description:
      'Antes de intervenir tu pintura, la analizamos con instrumentos. Diagnóstico profesional sin costo en Concepción.',
    url: 'https://www.fullshine.autos/diagnostico',
    siteName: 'Fullshine Premium Detailing',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: 'https://www.fullshine.autos/galeria/hero-diagnostico.jpg', width: 1600, height: 1200 }],
  },
}

// ── Contenido ────────────────────────────────────────────────────────────────

const DESCUBRIRAS = [
  {
    q: '¿La pintura de tu auto es original?',
    d: 'El espesor delata si un panel fue repintado. Descubrirlo cambia por completo cómo debe tratarse — y también cuánto vale tu auto al momento de venderlo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
        <path d="M12 3 4 6v6c0 4.4 3.4 8.4 8 9 4.6-.6 8-4.6 8-9V6l-8-3Z" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: '¿Es seguro pulir tu vehículo?',
    d: 'La capa de laca es finita y no se regenera. Medimos cuántas micras quedan para saber si tu auto tolera una corrección o si pulir sería un riesgo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
        <path d="M3 12h4l3-8 4 16 3-8h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    q: '¿Qué rayones se pueden eliminar?',
    d: 'Bajo luz de inspección revisamos panel por panel y te mostramos con honestidad cuáles desaparecen, cuáles se atenúan y cuáles no tienen vuelta atrás.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    q: '¿Cuál es el mejor tratamiento para tu pintura?',
    d: 'Con los datos sobre la mesa te decimos qué necesita tu auto de verdad. A veces es un cerámico. A veces solo una descontaminación. A veces, nada.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
        <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
      </svg>
    ),
  },
]

const PASOS = [
  { n: 1, t: 'Reservas tu hora', d: 'Eliges día y horario en menos de un minuto. Confirmación inmediata por WhatsApp.' },
  { n: 2, t: 'Evaluamos tu pintura', d: 'Medidor de espesor y luz de inspección, panel por panel. La evaluación toma 15 a 20 minutos.' },
  { n: 3, t: 'Revisamos juntos los datos', d: 'Te mostramos las mediciones en el momento. Los números están a la vista, no hay caja negra.' },
  { n: 4, t: 'Prescribimos el tratamiento', d: 'Qué corresponde hacer, qué riesgos existen y cuánto costaría. Decides tú, sin presión.' },
]

const INFORME = [
  'Estado general de la pintura',
  'Espesor real de la laca, en micras',
  'Zonas repintadas detectadas',
  'Nivel de corrección recomendado',
  'Riesgos identificados',
  'Tratamiento prescrito y alternativas',
]

const RESENAS = [
  { n: 'Cata Mayorga', t: 'Hace 3 años llevé mi auto y tuve una muy buena experiencia, por lo que volví luego de un cambio de vehículo. Quedé encantada con el resultado.' },
  { n: 'Jorge Bizama', t: 'El lavado y pulido dejó el auto como nuevo, hasta sacó manchas de pintura de topones. El dueño explicó paso a paso lo que iba realizando.' },
  { n: 'Jonathan Ramírez', t: 'Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.' },
]

const FOTOS = ['/galeria/trabajo-2.jpg', '/galeria/trabajo-5.jpg', '/galeria/trabajo-4.jpg', '/galeria/trabajo-3.jpg']

// ── CTA ──────────────────────────────────────────────────────────────────────

function CTA({ children, size = 'lg' }: { children: React.ReactNode; size?: 'lg' | 'xl' }) {
  return (
    <Link
      href={CTA_URL}
      className={`group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-[#00E37A] text-center font-black leading-tight text-black
        transition-all duration-300 hover:scale-[1.03] hover:bg-[#22ff92]
        shadow-[0_0_34px_-6px_rgba(0,227,122,.6)] hover:shadow-[0_0_55px_-6px_rgba(0,227,122,.85)]
        focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00E37A]/40
        ${size === 'xl' ? 'px-8 py-5 text-base sm:px-12 sm:text-xl' : 'px-7 py-4 text-sm sm:text-base'}`}
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
    serviceType: 'Inspección y medición de espesor de pintura',
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
    <div className="min-h-screen overflow-x-hidden bg-[#05070A] text-white antialiased selection:bg-[#00E37A] selection:text-black">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ══════ HERO ══════ */}
      <header className="relative flex min-h-[100svh] items-center justify-center px-5 py-24">
        <Image
          src="/galeria/hero-diagnostico.jpg"
          alt="Ferrari bajo las luces LED de inspección del taller Fullshine en Concepción"
          fill priority sizes="100vw"
          className="scale-105 object-cover object-[50%_62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-[#05070A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,.8)_100%)]" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <Image src="/logo.png" alt="Fullshine Premium Detailing" width={88} height={88}
              className="mx-auto mb-8 drop-shadow-[0_0_45px_rgba(255,255,255,.3)]" priority />
          </Reveal>

          <Reveal delay={120}>
            <p className="mb-7 text-[10px] font-bold uppercase tracking-[0.4em] text-[#00E37A] sm:text-xs">
              Centro de diagnóstico de pintura automotriz
            </p>
          </Reveal>

          <Reveal delay={220}>
            <h1 className="text-[2.5rem] font-black leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-[5rem]">
              ¿VALE LA PENA<br />PULIR TU AUTO?
            </h1>
          </Reveal>

          <Reveal delay={330}>
            <p className="mx-auto mt-7 max-w-2xl text-xl font-bold leading-snug text-white/80 sm:text-3xl">
              Hay una forma de saberlo.
            </p>
          </Reveal>

          <Reveal delay={430}>
            <p className="mt-3 text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E37A] via-[#8affc9] to-[#00E37A]">
                GRATIS.
              </span>
              <span className="block text-white/90 sm:ml-3 sm:inline">En 15 minutos.</span>
            </p>
          </Reveal>

          <Reveal delay={540}>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Antes de recomendar cualquier tratamiento diagnosticamos tu pintura con instrumentos:
              medimos el espesor real de la laca, evaluamos qué rayones son corregibles
              e identificamos contaminación invisible.
              <span className="text-white"> Después prescribimos — no antes.</span>
            </p>
          </Reveal>

          <Reveal delay={660}>
            <div className="mt-11">
              <CTA size="xl">QUIERO SABER SI MI AUTO NECESITA UN PULIDO</CTA>
            </div>
            <p className="mt-6 text-xs tracking-wide text-white/35 sm:text-sm">
              Sin costo · Sin compromiso · Camilo Henríquez 381, Concepción
            </p>
          </Reveal>
        </div>

        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden>
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#00E37A]/35 pt-2">
            <div className="h-2 w-1 rounded-full bg-[#00E37A]/70" />
          </div>
        </div>
      </header>

      {/* ══════ BARRA DE CONFIANZA ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] py-10 backdrop-blur-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-5 md:grid-cols-4">
          {[
            { v: <CountUp to={5} decimals={1} suffix="★" />, l: 'Google' },
            { v: <CountUp to={82} />, l: 'Reseñas verificadas' },
            { v: <><CountUp to={15} />′</>, l: 'Duración' },
            { v: '$0', l: 'Costo' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 90} className="text-center">
              <p className="text-2xl font-black tabular-nums text-[#FFC107] sm:text-3xl">{s.v}</p>
              <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-white/40">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════ EL MÉTODO — posicionamiento ══════ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00E37A]">Nuestro método</p>
            <h2 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              Ningún médico receta<br className="hidden sm:block" /> antes de diagnosticar.
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              Un arquitecto no construye sin medir. Un mecánico no cambia piezas sin escanear.
              Y sin embargo, la mayoría de los talleres de detailing te vende un pulido
              <span className="text-white"> sin haber visto tu auto</span>.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="mx-auto mt-7 max-w-2xl text-lg font-semibold leading-relaxed text-white sm:text-xl">
              En Fullshine hacemos lo contrario: antes de intervenir la pintura de tu vehículo,
              realizamos un diagnóstico profesional para recomendar
              <span className="text-[#00E37A]"> solo el tratamiento que realmente necesita</span>.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════ EL INSTRUMENTO ══════ */}
      <section className="relative overflow-hidden border-y border-white/[0.07] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent px-5 py-28 sm:py-36">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#00E37A]/[0.09] blur-[130px]" />

        <div className="relative mx-auto max-w-5xl">
          <Reveal className="text-center">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">
              El instrumento
            </p>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Medimos en micras.<br />
              <span className="text-white/40">No a ojo.</span>
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              La capa transparente que protege tu pintura tiene un espesor medible — y finito.
              Cada pulido consume parte de ella <span className="text-white">para siempre</span>.
            </p>
          </Reveal>

          {/* ── El medidor, en grande ── */}
          <Reveal delay={180}>
            <div className="relative mx-auto mt-16 max-w-2xl">
              {/* halo */}
              <div className="pointer-events-none absolute -inset-10 rounded-[48px] bg-[#00E37A]/[0.08] blur-3xl" />

              {VIDEO_MEDICION ? (
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#080B10] shadow-[0_40px_120px_-40px_rgba(0,227,122,.45)]">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E37A]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                        Midiendo en vivo
                      </span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                      Ferrari Portofino
                    </span>
                  </div>
                  <video
                    src={VIDEO_MEDICION}
                    poster="/video/medicion-poster.jpg"
                    autoPlay muted loop playsInline preload="metadata"
                    aria-label="Medición del espesor de laca con medidor profesional sobre un Ferrari en el taller Fullshine"
                    className="block w-full"
                  />
                  <p className="border-t border-white/[0.07] px-5 py-4 text-center text-sm text-white/45">
                    Medición real en nuestro taller, panel por panel.
                    <span className="block text-white/70">
                      Cada zona da un número distinto. Por eso se mide todo.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#12171F] to-[#080B10] p-7 shadow-[0_40px_120px_-40px_rgba(0,227,122,.45)] sm:p-10">
                  {/* barra superior del aparato */}
                  <div className="mb-7 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#00E37A]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/45">
                        Midiendo
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/25">
                      Capó · Panel 01
                    </span>
                  </div>

                  {/* pantalla LCD */}
                  <div className="relative rounded-2xl border border-[#00E37A]/20 bg-[#03070A] px-6 py-10 text-center shadow-[inset_0_0_60px_-20px_rgba(0,227,122,.5)] sm:py-14">
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(0,227,122,.12),transparent_65%)]" />
                    <p className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-[#00E37A]/60">
                      Espesor de laca
                    </p>
                    <p className="relative mt-4 font-black tabular-nums leading-none text-[#00E37A] drop-shadow-[0_0_35px_rgba(0,227,122,.65)]">
                      <CountUp to={143} className="text-[5.5rem] sm:text-[9rem]" />
                      <span className="ml-2 align-top text-2xl font-bold text-[#00E37A]/60 sm:text-4xl">μm</span>
                    </p>

                    {/* escala */}
                    <div className="relative mx-auto mt-9 max-w-sm">
                      <div className="flex h-2.5 overflow-hidden rounded-full">
                        <div className="w-[28%] bg-red-500/70" />
                        <div className="w-[22%] bg-[#FFC107]/70" />
                        <div className="w-[50%] bg-[#00E37A]/70" />
                      </div>
                      {/* aguja */}
                      <div className="absolute -top-1.5 left-[62%] h-5 w-0.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,.9)]" />
                      <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span className="text-red-400/70">Crítico</span>
                        <span className="text-[#FFC107]/70">Límite</span>
                        <span className="text-[#00E37A]/70">Seguro</span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-7 text-center text-sm leading-relaxed text-white/45">
                    Lectura real de un vehículo evaluado en el taller.
                    <span className="block text-white/70">
                      Con 143 μm hay margen suficiente para una corrección segura.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={280}>
            <p className="mx-auto mt-14 max-w-2xl text-center leading-relaxed text-white/55">
              Con un medidor de espesor profesional obtenemos la lectura exacta de cada panel.
              Eso nos permite saber si tu auto fue repintado, cuánto margen real hay para corregir
              y hasta dónde es seguro llegar. <span className="text-white">Sin adivinar.</span>
            </p>
          </Reveal>

          {/* ── ¿Sabías que...? ── */}
          <Reveal delay={340}>
            <div className="relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-[26px] border border-[#FFC107]/30 bg-gradient-to-br from-[#FFC107]/[0.09] to-transparent p-9 sm:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFC107]/10 blur-3xl" />
              <div className="relative">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">
                  ¿Sabías que…?
                </p>
                <p className="text-2xl font-black leading-[1.25] tracking-tight sm:text-[2rem]">
                  Cada pulido elimina una pequeña parte del barniz de tu vehículo.
                </p>
                <p className="mt-5 text-xl font-bold leading-snug text-[#FFC107] sm:text-2xl">
                  Ese espesor nunca vuelve.
                </p>
                <p className="mt-7 text-base leading-relaxed text-white/55 sm:text-lg">
                  Por eso primero medimos. Después recomendamos.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={360}>
            <div className="mx-auto mt-11 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { v: '±1', l: 'micra de precisión' },
                { v: '100%', l: 'de los paneles' },
                { v: '15′', l: 'y lo sabes' },
              ].map(x => (
                <div key={x.l} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-center">
                  <p className="text-xl font-black text-[#00E37A]">{x.v}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{x.l}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* ── Informe ── */}
          <Reveal delay={200}>
            <div className="relative mx-auto mt-20 max-w-2xl overflow-hidden rounded-[26px] border border-[#00E37A]/25 bg-[#080C11]/90 p-8 backdrop-blur sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#00E37A]/10 blur-3xl" />
              <div className="relative">
                <div className="mb-7 flex items-center gap-3 border-b border-white/[0.08] pb-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00E37A]/15 text-[#00E37A]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                      <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                      <path d="M9 8h6M9 12h6M9 16h3" strokeLinecap="round" />
                    </svg>
                  </span>
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-white/70">
                    Tu informe incluye
                  </p>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {INFORME.map(item => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00E37A]/15 text-[10px] font-black text-[#00E37A]">✓</span>
                      <span className="text-sm text-white/75">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 border-t border-white/[0.06] pt-5 text-xs leading-relaxed text-white/35">
                  Explicado en simple, con los números a la vista. Sin tecnicismos innecesarios
                  y sin venderte algo que tu auto no necesita.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ QUÉ DESCUBRIRÁS ══════ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00E37A]">Lo que descubrirás</p>
            <h2 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              ¿Qué descubrirás<br className="hidden sm:block" /> en tu diagnóstico?
            </h2>
            <p className="mt-6 text-white/50">Cuatro respuestas que hoy nadie te está dando.</p>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {DESCUBRIRAS.map((c, i) => (
              <Reveal key={c.q} delay={i * 110}>
                <article className="group h-full rounded-2xl border border-white/[0.08] bg-[#0A0E14]/80 p-8 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-[#00E37A]/35 hover:shadow-[0_24px_60px_-28px_rgba(0,227,122,.4)] sm:p-9">
                  <div className="mb-7 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00E37A]/25 bg-[#00E37A]/10 text-[#00E37A] transition-transform duration-500 group-hover:scale-110">
                    {c.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-bold leading-snug sm:text-2xl">{c.q}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{c.d}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <div className="mt-14 text-center">
              <CTA>QUIERO SABER SI MI AUTO NECESITA UN PULIDO</CTA>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ POR QUÉ IMPORTA ══════ */}
      <section className="relative overflow-hidden px-5 pb-28 sm:pb-36">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-[#FFC107]/25 bg-gradient-to-b from-[#FFC107]/[0.07] to-transparent p-9 sm:p-14">
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[#FFC107]/[0.09] blur-3xl" />

              <div className="relative">
                <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">
                  Por qué importa
                </p>
                <h2 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-[2.75rem]">
                  ¿Qué pasa si no<br className="hidden sm:block" /> diagnosticas antes?
                </h2>

                <p className="mt-8 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                  Un pulido realizado sobre una pintura demasiado delgada puede reducir aún más
                  el espesor del barniz. Y el barniz <span className="text-white">no se regenera</span>:
                  lo que se retira, no vuelve.
                </p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
                  Por eso primero medimos y después recomendamos el tratamiento adecuado.
                  No es una precaución excesiva — es el orden correcto de las cosas.
                </p>

                <div className="mt-11 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                      Sin diagnóstico
                    </p>
                    <ul className="space-y-3 text-sm text-white/55">
                      {[
                        'Se pule "por si acaso", sin saber cuánta laca queda',
                        'Un panel repintado pasa desapercibido',
                        'Se paga por una corrección que quizá no era necesaria',
                        'El daño solo aparece meses después',
                      ].map(t => (
                        <li key={t} className="flex gap-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#00E37A]/25 bg-[#00E37A]/[0.05] p-6">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00E37A]">
                      Con diagnóstico
                    </p>
                    <ul className="space-y-3 text-sm text-white/70">
                      {[
                        'Sabes exactamente cuántas micras tiene cada panel',
                        'Se detecta cualquier zona repintada antes de intervenir',
                        'Se prescribe solo el tratamiento que corresponde',
                        'Decides con datos, no con una corazonada',
                      ].map(t => (
                        <li key={t} className="flex gap-3">
                          <span className="mt-0.5 text-[#00E37A]">✓</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p className="mt-9 text-sm italic leading-relaxed text-white/40">
                  A veces el diagnóstico concluye que tu auto no necesita un pulido.
                  También te lo vamos a decir.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ CÓMO FUNCIONA ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#FFC107]">El protocolo</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">¿Cómo funciona?</h2>
            <p className="mt-5 text-white/45">Cuatro pasos. Siempre en este orden.</p>
          </Reveal>

          <ol className="mt-16">
            {PASOS.map((p, i) => (
              <Reveal key={p.n} delay={i * 110}>
                <li className="flex gap-6 rounded-2xl p-4 transition-colors duration-300 hover:bg-white/[0.03] sm:p-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#00E37A]/30 bg-[#00E37A]/10 text-lg font-black text-[#00E37A]">
                      {p.n}
                    </span>
                    {i < PASOS.length - 1 && (
                      <span className="mt-2 w-px flex-1 bg-gradient-to-b from-[#00E37A]/25 to-transparent" />
                    )}
                  </div>
                  <div className="pb-7 pt-2.5">
                    <h3 className="mb-2 text-lg font-bold">{p.t}</h3>
                    <p className="text-sm leading-relaxed text-white/50">{p.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════ PRUEBA SOCIAL ══════ */}
      <section className="px-5 py-28 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <div className="mb-3 text-2xl tracking-[0.2em] text-[#FFC107]" aria-label="5 de 5 estrellas">★★★★★</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">5.0 en Google</h2>
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

          <Reveal delay={150}>
            <p className="mb-7 mt-20 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
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
                    fill loading="lazy" sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-25" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ QUIÉN TE ATIENDE ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex flex-col items-center gap-9 text-center sm:flex-row sm:items-center sm:gap-11 sm:text-left">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border border-[#00E37A]/25 sm:h-40 sm:w-40">
                <Image
                  src="/juan-medidor.jpg"
                  alt="Juan Sáez midiendo el espesor de laca de un Ferrari en el taller Fullshine"
                  fill loading="lazy" sizes="160px"
                  className="object-cover"
                />
              </div>

              <div>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00E37A]">
                  Quién te atiende
                </p>
                <p className="text-2xl font-black tracking-tight sm:text-3xl">Juan Sáez</p>
                <p className="mt-1.5 text-sm font-semibold text-white/60">
                  Especialista en corrección de pintura
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Más de 300 vehículos tratados en Concepción
                </p>
                <p className="mt-6 text-base leading-relaxed text-white/55">
                  El diagnóstico lo hago yo, contigo al lado. Vas a ver las mediciones
                  en la pantalla del instrumento al mismo tiempo que yo, y te voy a decir
                  exactamente lo que veo — aunque la conclusión sea que tu auto no necesita nada.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ CTA FINAL ══════ */}
      <section className="relative overflow-hidden px-5 py-32 sm:py-44">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00E37A]/10 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              ¿Vale la pena<br />pulir tu auto?
            </h2>
            <p className="mt-5 text-xl font-bold text-[#FFC107] sm:text-2xl">
              Deja de suponerlo.
            </p>
            <p className="mt-4 text-2xl font-black text-[#00E37A] sm:text-3xl">
              Descúbrelo gratis en 15 minutos.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-12">
              <CTA size="xl">QUIERO SABER SI MI AUTO NECESITA UN PULIDO</CTA>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-8 text-sm text-white/35">Sin costo · Sin compromiso · Sin presión de venta</p>
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

      {/* ══════ FOOTER MÍNIMO ══════ */}
      <footer className="border-t border-white/[0.07] px-5 py-12 text-center">
        <Image src="/logo.png" alt="Fullshine" width={44} height={44} className="mx-auto mb-5 rounded-full opacity-60" />
        <p className="text-sm font-bold tracking-[0.2em] text-white/60">FULLSHINE PREMIUM DETAILING</p>
        <p className="mt-2 text-xs text-white/30">
          Camilo Henríquez 381, Concepción · Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
        </p>
        <p className="mt-5 text-[11px] text-white/20">© 2026 Fullshine. Todos los derechos reservados.</p>
      </footer>

      {/* ══════ CTA STICKY MÓVIL ══════ */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05070A]/92 p-3 backdrop-blur-lg sm:hidden">
        <Link
          href={CTA_URL}
          className="block rounded-full bg-[#00E37A] py-4 text-center text-[15px] font-black text-black shadow-[0_0_28px_-6px_rgba(0,227,122,.7)]"
        >
          QUIERO MI DIAGNÓSTICO GRATUITO
        </Link>
      </div>
      <div className="h-20 sm:hidden" aria-hidden />
    </div>
  )
}
