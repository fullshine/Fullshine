import Link from 'next/link'
import Image from 'next/image'
import SiteFooter from '@/components/SiteFooter'
import GalleryCarousel from '@/components/GalleryCarousel'
import PixelEvent, { WhatsAppTrackedLink } from '@/components/PixelEvent'
import Reveal from '@/components/Reveal'
import { BUSINESS, buildMetadata, schemaService, schemaFAQ, jsonLd } from '@/lib/seo'
import { isPromoActive, promoPrice, formatCLP, PROMO_CERAMICO, PROMO_SHORT } from '@/lib/promo'

export const revalidate = 3600

const PATH = '/proteccion-auto-nuevo'

/** Camino A — para quien duda: revisión gratuita primero. */
const CTA = '/reservar?categoria=revision'
/** Camino B — para quien ya decidió: reserva directa del tratamiento. */
const CTA_DIRECTO = '/reservar?categoria=ceramico'

/** WhatsApp con instrucción concreta: pedir marca, modelo y año baja la fricción. */
const WA = `https://wa.me/${BUSINESS.whatsapp}?text=` +
  encodeURIComponent('Hola, compré un auto nuevo y quiero saber cuánto cuesta protegerlo. Mi vehículo es: ')

export const metadata = buildMetadata({
  title: '¿Compraste auto nuevo? No esperes a que se raye — Fullshine Concepción',
  description:
    'Revisamos tu auto nuevo GRATIS en 15 minutos y te mostramos qué protección necesita realmente su pintura. Concepción, San Pedro de la Paz y alrededores.',
  path: PATH,
  keywords: [
    'proteger pintura auto nuevo',
    'cerámico auto nuevo Concepción',
    'tratamiento cerámico auto recién comprado',
    'proteccion pintura auto 0km Chile',
  ],
})

// ── Contenido ────────────────────────────────────────────────────────────────

const REVISAMOS = [
  'Estado real de la pintura, medido con instrumento',
  'Micro-rayas invisibles a simple vista',
  'Contaminación ferrosa del transporte',
  'Marcas del lavado de entrega de la concesionaria',
  'Estado de plásticos, gomas y llantas',
  'Qué protección tiene tu auto hoy, si es que tiene alguna',
]

const VERDADES = [
  {
    t: 'Viajó más de lo que crees',
    d: 'Entre la planta y la concesionaria, el vehículo va en barco, tren y camión, muchas veces a la intemperie. Ese trayecto deja contaminación ferrosa incrustada en la pintura que ningún lavado normal remueve.',
  },
  {
    t: 'El lavado de entrega deja marcas',
    d: 'La preparación para la entrega suele hacerse rápido y con materiales compartidos entre muchos autos. Es una de las fuentes más comunes de micro-rayas en un vehículo con cero kilómetros.',
  },
  {
    t: 'Los primeros meses son los que más daño hacen',
    d: 'La mayoría de las marcas de un auto no vienen del uso: vienen del lavado. Un año de esponjas y rodillos deja una red de marcas circulares que después hay que pulir — y pulir consume barniz que no vuelve.',
  },
  {
    t: 'Sobre pintura nueva todo rinde más',
    d: 'Aplicar cerámica sobre una pintura sana es mucho más simple que sobre una castigada: no hay que corregir defectos antes. Y esa corrección es justamente la parte cara del trabajo.',
  },
]

const POR_QUE = [
  { i: '🔬', t: 'Inspección profesional', d: 'Revisamos y medimos la pintura antes de recomendar cualquier tratamiento.' },
  { i: '🛡️', t: 'Protección certificada', d: 'Cerámica Nasiol ZR53 de 10H, con 3 años de garantía de fábrica.' },
  { i: '📜', t: 'Certificado digital', d: 'Cada tratamiento entrega un código único verificable en línea.' },
  { i: '🏆', t: 'Detailing especializado', d: 'No somos un lavado de autos. Preparamos, corregimos y protegemos vehículos.' },
]

/**
 * Reseñas REALES de Google. No se inventan testimonios.
 * Cuando tengas una reseña de un cliente con auto nuevo, reemplaza la primera
 * por esa: va a rendir mucho más en esta landing por identificación directa.
 */
const RESENAS = [
  { n: 'Jonathan Ramírez', t: 'Trabajo prolijo, resultados de alto nivel y gran preocupación por los detalles. 100% recomendable.' },
  { n: 'Jorge Bizama', t: 'El lavado y pulido dejó el auto como nuevo, hasta sacó manchas de pintura de topones. El dueño explicó paso a paso lo que iba realizando.' },
  { n: 'Cata Mayorga', t: 'Hace 3 años llevé mi auto y tuve una muy buena experiencia, por lo que volví luego de un cambio de vehículo. Quedé encantada con el resultado.' },
]

const FAQS = [
  {
    q: '¿Cuándo conviene aplicar el cerámico en un auto nuevo?',
    a: 'Lo antes posible, idealmente antes del primer lavado. Mientras menos lavados haya recibido, menos micro-rayas tendrá y menos corrección necesitará antes de sellar. Igual conviene pasar primero por el diagnóstico gratuito: revisamos el estado real de la pintura antes de recomendar nada.',
  },
  {
    q: '¿Un auto nuevo necesita pulido antes del cerámico?',
    a: 'Depende de cómo llegó. Muchos vehículos nuevos solo requieren descontaminación y un pulido de realce muy suave. Otros llegan con marcas del lavado de entrega y necesitan corrección. Eso se determina midiendo y revisando bajo luz de inspección, no a ojo.',
  },
  {
    q: '¿Cuánto cuesta proteger un auto nuevo?',
    a: 'Los paquetes cerámicos parten en $300.000 (Platino), $350.000 (Gold) y $500.000 (Elite). En un auto nuevo, al requerir menos corrección, el trabajo suele ubicarse en el rango base del paquete elegido. El diagnóstico previo no tiene costo.',
  },
  {
    q: '¿La concesionaria no le puso algo ya?',
    a: 'Muchas concesionarias ofrecen un sellado o abrillantado en la entrega. Suelen ser productos de baja duración —semanas o pocos meses— muy distintos de una cerámica de 10H con tres años de garantía. Si te aplicaron algo, tráelo: lo revisamos y te decimos qué protección tiene realmente hoy.',
  },
  {
    q: '¿Cuánto dura la protección?',
    a: 'La cerámica Nasiol ZR53 tiene 3 años de duración de fábrica, extensibles a 5 aplicando el booster de mantención cada 6 meses. Cada tratamiento entrega un certificado digital con código verificable.',
  },
  {
    q: '¿Cuánto tiempo tengo que dejar el auto?',
    a: 'Entre 1 y 2 días según el paquete. La cerámica necesita curado en ambiente controlado, y ese plazo no se puede acelerar sin comprometer el resultado.',
  },
]

const TIERS = [
  { n: 'Platino', p: 300000, d: 'Protección esencial de la pintura' },
  { n: 'Gold', p: 350000, d: 'Suma sellado cerámico de vidrios', top: true },
  { n: 'Elite', p: 500000, d: 'Suma plásticos y llantas' },
]

/**
 * Tabla comparativa: qué incluye cada paquete, fila por fila.
 * Ver lo que NO incluye un paquete es lo que empuja al siguiente — por eso
 * conviene mostrar las cruces y no solo los ticks.
 */
const COMPARATIVA: { f: string; platino: boolean; gold: boolean; elite: boolean }[] = [
  { f: 'Lavado técnico y descontaminación',       platino: true,  gold: true,  elite: true },
  { f: 'Pulido de corrección de pintura',          platino: true,  gold: true,  elite: true },
  { f: 'Cerámica Nasiol ZR53 10H en carrocería',   platino: true,  gold: true,  elite: true },
  { f: 'Certificado digital de garantía',          platino: true,  gold: true,  elite: true },
  { f: 'Limpieza interior de cortesía',            platino: true,  gold: true,  elite: true },
  { f: 'Sellado cerámico de vidrios',              platino: false, gold: true,  elite: true },
  { f: 'Sellado cerámico de plásticos exteriores', platino: false, gold: false, elite: true },
  { f: 'Sellado cerámico de llantas',              platino: false, gold: false, elite: true },
]

function Marca({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-amber-400" aria-label="Incluido">✓</span>
  ) : (
    <span className="text-white/15" aria-label="No incluido">—</span>
  )
}

function BotonCTA({ children, grande = false }: { children: React.ReactNode; grande?: boolean }) {
  return (
    <Link href={CTA}
      className={`inline-flex items-center gap-2.5 rounded-full bg-amber-500 font-black text-black shadow-[0_0_34px_-6px_rgba(245,158,11,.6)] transition-all hover:scale-[1.03] hover:bg-amber-400 ${
        grande ? 'px-8 py-5 text-base sm:px-12 sm:text-xl' : 'px-7 py-4 text-sm sm:text-base'
      }`}>
      {children}
      <span aria-hidden>→</span>
    </Link>
  )
}

export default function ProteccionAutoNuevo() {
  const promo = isPromoActive() && PROMO_CERAMICO > 0

  return (
    <div className="min-h-screen bg-[#05070A] text-white antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          schemaService({
            name: 'Protección de pintura para autos nuevos en Concepción',
            serviceType: 'Tratamiento cerámico para vehículos nuevos',
            description:
              'Diagnóstico gratuito y tratamiento cerámico Nasiol ZR53 para vehículos recién comprados en Concepción, San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén.',
            path: PATH,
            offers: TIERS.map(t => ({ name: `Cerámico ${t.n}`, price: t.p })),
          }),
          schemaFAQ(FAQS)
        )}
      />
      <PixelEvent event="ViewContent" contentName="Landing protección auto nuevo" contentCategory="ceramico" />

      {/* ══════ HERO ══════ */}
      <header className="relative flex min-h-[94svh] items-center justify-center px-5 py-24">
        <Image
          src="/galeria/hero-diagnostico.jpg"
          alt="Vehículo bajo las luces LED de inspección del taller Fullshine en Concepción"
          fill priority sizes="100vw"
          className="scale-105 object-cover object-[58%_45%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/78 to-[#05070A]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Reveal>
            <Image src="/logo.png" alt="Fullshine Detailing Premium"
              width={72} height={72} priority
              className="mx-auto mb-7 drop-shadow-[0_0_45px_rgba(255,255,255,.3)]" />
          </Reveal>

          <Reveal delay={120}>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400 sm:text-xs">
              Para autos recién comprados
            </p>
          </Reveal>

          <Reveal delay={200}>
            <h1 className="text-[2.1rem] font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
              ¿Compraste un auto nuevo?<br />
              <span className="text-amber-400">No esperes a que se raye para protegerlo.</span>
            </h1>
          </Reveal>

          <Reveal delay={340}>
            <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Revisamos tu vehículo <strong className="text-white">GRATIS en 15 minutos</strong> y
              te mostramos qué protección necesita realmente su pintura.
            </p>
          </Reveal>

          <Reveal delay={470}>
            <div className="mt-10">
              <BotonCTA grande>QUIERO REVISAR MI AUTO GRATIS</BotonCTA>
            </div>
            <p className="mt-6 text-xs tracking-wide text-white/40 sm:text-sm">
              📍 Concepción · 15 minutos · Sin compromiso
            </p>
            {/* Atajo para quien ya decidió y no quiere el paso intermedio */}
            <a href="#planes"
              className="mt-5 inline-block text-sm font-medium text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-amber-400">
              ¿Ya sabes que lo quieres proteger? Ver planes y precios
            </a>
          </Reveal>
        </div>
      </header>

      {/* ══════ EL ARGUMENTO CENTRAL ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
              La pintura de tu auto nunca va a estar mejor que hoy.
            </p>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-amber-400 sm:text-2xl">
              Y por eso protegerla ahora es mucho más fácil que recuperarla después.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════ OJO CON EL AUTO NUEVO ══════ */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="rounded-[26px] border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] to-transparent p-8 sm:p-12">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
                ⚠️ Ojo con el «auto nuevo»
              </p>
              <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                Que tenga 0 km no significa<br className="hidden sm:block" /> que la pintura esté perfecta.
              </h2>
              <p className="mt-7 leading-relaxed text-white/60">
                Durante el transporte, el almacenamiento y la preparación para la entrega, un
                vehículo puede acumular contaminación y marcas de lavado. No se ven a simple
                vista — se ven bajo iluminación de inspección.
              </p>
              <p className="mt-4 leading-relaxed text-white/60">
                Por eso <strong className="text-white">revisamos el vehículo antes de protegerlo</strong>,
                y no al revés.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {VERDADES.map((v, i) => (
              <Reveal key={v.t} delay={i * 90}>
                <article className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
                  <h3 className="mb-3 text-lg font-bold leading-snug text-white">{v.t}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{v.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TRÁELO ANTES DE LAVARLO ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              ¿Tu auto salió recién<br />de la concesionaria?
            </h2>
            <p className="mt-6 text-xl font-bold text-amber-400 sm:text-2xl">
              Tráelo antes de lavarlo.
            </p>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-white/55">
              Cada lavado agrega marcas. Si lo traes tal como salió de la concesionaria,
              podemos ver exactamente cómo te lo entregaron y qué corresponde hacer —
              antes de que se sume nada más.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════ LA OFERTA PRINCIPAL: EL DIAGNÓSTICO ══════ */}
      <section className="px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-400">
              🔎 Nuestra propuesta
            </p>
            <h2 className="text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              ¿No sabes qué tratamiento<br className="hidden sm:block" /> necesita tu auto?
            </h2>
            <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/60">
              No queremos venderte el tratamiento más caro.{' '}
              <strong className="text-white">Queremos revisar tu auto primero.</strong>
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-12 rounded-[26px] border border-amber-500/25 bg-[#0A0E14]/80 p-8 sm:p-12">
              <p className="mb-7 text-sm font-bold uppercase tracking-[0.15em] text-white/70">
                En 15 minutos revisamos
              </p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {REVISAMOS.map(item => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-black text-amber-400">
                      ✓
                    </span>
                    <span className="text-sm leading-relaxed text-white/75">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-9 border-t border-white/[0.08] pt-7 text-base leading-relaxed text-white/70">
                Y te recomendamos qué hacer —{' '}
                <strong className="text-amber-400">incluso si lo mejor es no hacer nada todavía</strong>.
              </p>

              <div className="mt-9 text-center">
                <BotonCTA grande>AGENDAR REVISIÓN GRATIS</BotonCTA>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ TESTIMONIOS ══════ */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center">
            <div className="mb-3 text-2xl tracking-[0.2em] text-amber-400" aria-label="5 de 5 estrellas">★★★★★</div>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">5,0 en Google</h2>
            <p className="mt-3 text-white/45">82 reseñas verificadas de clientes reales en Concepción</p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {RESENAS.map((r, i) => (
              <Reveal key={r.n} delay={i * 110}>
                <blockquote className="h-full rounded-2xl border border-white/[0.08] bg-[#0A0E14]/70 p-7">
                  <div className="mb-3 text-sm tracking-widest text-amber-400" aria-hidden>★★★★★</div>
                  <p className="text-sm leading-relaxed text-white/70">&laquo;{r.t}&raquo;</p>
                  <footer className="mt-5 text-xs font-semibold tracking-wide text-white/35">
                    {r.n} · Cliente verificado
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ POR QUÉ FULLSHINE ══════ */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              ¿Por qué proteger tu auto con Fullshine?
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {POR_QUE.map((p, i) => (
              <Reveal key={p.t} delay={i * 90}>
                <div className="flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
                  <span className="text-3xl" aria-hidden>{p.i}</span>
                  <div>
                    <h3 className="mb-1.5 font-bold text-white">{p.t}</h3>
                    <p className="text-sm leading-relaxed text-white/50">{p.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <p className="mx-auto mt-12 max-w-2xl text-center text-xl font-bold leading-snug text-white sm:text-2xl">
              No somos un lavado de autos.<br />
              <span className="text-amber-400">Preparamos, corregimos y protegemos vehículos.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════ GALERÍA ══════ */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
              Trabajos reales en nuestro taller
            </p>
          </Reveal>
          <GalleryCarousel />
        </div>
      </section>

      {/* ══════ PRECIOS — después de la educación ══════ */}
      <section id="planes" className="scroll-mt-16 border-y border-white/[0.07] bg-white/[0.02] px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              ¿Qué protección podemos aplicar?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/50">
              El paquete se define después del diagnóstico, según lo que tu auto realmente necesite.
            </p>
            {promo && (
              <p className="mt-6 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-black text-green-400">
                🔥 {PROMO_SHORT} · solo por hoy
              </p>
            )}
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {TIERS.map(t => (
              <Reveal key={t.n}>
                <div className={`h-full rounded-2xl border p-7 ${
                  t.top ? 'border-amber-500/40 bg-amber-500/[0.06]' : 'border-white/[0.08] bg-[#0A0E14]/70'
                }`}>
                  {t.top && (
                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-amber-400">
                      El más elegido
                    </p>
                  )}
                  <p className="text-lg font-black">{t.n}</p>
                  <p className="mt-1 text-sm text-white/45">{t.d}</p>
                  <div className="mt-5">
                    {promo ? (
                      <>
                        <p className="text-sm text-white/30 line-through">{formatCLP(t.p)}</p>
                        <p className="text-2xl font-black text-green-400">
                          {formatCLP(promoPrice(t.p, PROMO_CERAMICO))}
                        </p>
                      </>
                    ) : (
                      <p className="text-2xl font-black text-amber-400">desde {formatCLP(t.p)}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Tabla comparativa — para quien quiere decidir sin hablar con nadie */}
          <Reveal delay={150}>
            <div className="mt-14 overflow-x-auto">
              <table className="w-full min-w-[560px] border-separate border-spacing-0 text-left">
                <caption className="sr-only">
                  Comparación de los paquetes de tratamiento cerámico Platino, Gold y Elite
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="pb-4 pr-4 text-xs font-bold uppercase tracking-wider text-white/40">
                      Qué incluye
                    </th>
                    {TIERS.map(t => (
                      <th key={t.n} scope="col"
                        className={`pb-4 text-center text-sm font-black ${t.top ? 'text-amber-400' : 'text-white'}`}>
                        {t.n}
                        {t.top && (
                          <span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-amber-400/70">
                            Más elegido
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIVA.map((row, i) => (
                    <tr key={row.f} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <th scope="row" className="rounded-l-lg py-3.5 pl-4 pr-4 text-sm font-normal text-white/70">
                        {row.f}
                      </th>
                      <td className="py-3.5 text-center text-lg"><Marca ok={row.platino} /></td>
                      <td className={`py-3.5 text-center text-lg ${TIERS[1].top ? 'bg-amber-500/[0.04]' : ''}`}>
                        <Marca ok={row.gold} />
                      </td>
                      <td className="rounded-r-lg py-3.5 text-center text-lg"><Marca ok={row.elite} /></td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="pt-6 pl-4 pr-4 text-sm font-bold text-white">
                      Precio desde
                    </th>
                    {TIERS.map(t => (
                      <td key={t.n} className="pt-6 text-center">
                        {promo ? (
                          <>
                            <span className="block text-xs text-white/30 line-through">{formatCLP(t.p)}</span>
                            <span className="block text-lg font-black text-green-400">
                              {formatCLP(promoPrice(t.p, PROMO_CERAMICO))}
                            </span>
                          </>
                        ) : (
                          <span className="block text-lg font-black text-amber-400">{formatCLP(t.p)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-white/45">
              El valor final depende del tipo de vehículo y del estado real de la pintura.
              En un auto nuevo, al requerir menos corrección, el trabajo suele quedar en el
              rango base del paquete.
            </p>
          </Reveal>

          {/* ── Los dos caminos ── */}
          <Reveal delay={300}>
            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.06] p-7 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Ya sé lo que quiero
                </p>
                <p className="mt-3 text-lg font-bold leading-snug">
                  Reservar mi tratamiento
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  Eliges el paquete y agendas. El estado de la pintura lo revisamos igual
                  al recibir el vehículo.
                </p>
                <Link href={CTA_DIRECTO}
                  className="mt-6 inline-block rounded-full bg-amber-500 px-7 py-3.5 text-sm font-black text-black transition-all hover:scale-[1.03] hover:bg-amber-400">
                  RESERVAR TRATAMIENTO →
                </Link>
              </div>

              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.02] p-7 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Prefiero ver primero
                </p>
                <p className="mt-3 text-lg font-bold leading-snug">
                  Revisión gratuita
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  15 minutos. Revisamos la pintura, te mostramos lo que encontramos y
                  recomendamos el paquete que corresponde.
                </p>
                <Link href={CTA}
                  className="mt-6 inline-block rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white/50 hover:bg-white/5">
                  REVISAR GRATIS →
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="mb-10 text-3xl font-black tracking-tight sm:text-4xl">
              Preguntas frecuentes
            </h2>
          </Reveal>
          <div className="space-y-4">
            {FAQS.map(f => (
              <Reveal key={f.q}>
                <details className="group rounded-2xl border border-white/[0.08] bg-[#0A0E14]/70 p-6">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 font-bold marker:content-none">
                    {f.q}
                    <span aria-hidden className="shrink-0 text-amber-400 transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-white/55">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA FINAL ══════ */}
      <section className="relative overflow-hidden px-5 py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Primero lo revisamos.<br />Después decides.
            </h2>
            <p className="mt-6 text-lg text-white/55">
              15 minutos, sin costo y sin compromiso. Te vas sabiendo exactamente
              cómo está la pintura de tu auto nuevo.
            </p>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <BotonCTA grande>QUIERO REVISAR MI AUTO GRATIS</BotonCTA>
              <Link href={CTA_DIRECTO}
                className="rounded-full border border-white/25 px-8 py-5 text-base font-bold text-white transition-colors hover:border-white/50 hover:bg-white/5">
                Reservar tratamiento
              </Link>
            </div>
          </Reveal>

          {/* CTA de WhatsApp con instrucción concreta */}
          <Reveal delay={300}>
            <div className="mx-auto mt-14 max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7">
              <p className="font-bold text-white">
                💬 ¿Quieres saber cuánto cuesta proteger tu auto?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Escríbenos por WhatsApp con la <strong className="text-white/80">marca, modelo y año</strong> de
                tu vehículo y te respondemos con el valor.
              </p>
              <WhatsAppTrackedLink
                href={WA}
                source="Landing auto nuevo — WhatsApp con datos"
                className="mt-5 inline-block rounded-full border border-white/20 px-7 py-3 text-sm font-bold text-white transition-colors hover:border-white/40 hover:bg-white/5"
              >
                HABLAR CON FULLSHINE
              </WhatsAppTrackedLink>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <p className="mt-10 text-sm text-white/35">
              {BUSINESS.street}, {BUSINESS.city} · Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
            </p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />

      {/* CTA sticky móvil */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05070A]/92 p-3 backdrop-blur-lg sm:hidden">
        <Link href={CTA}
          className="block rounded-full bg-amber-500 py-4 text-center text-[15px] font-black text-black">
          REVISAR MI AUTO GRATIS
        </Link>
      </div>
      <div className="h-20 sm:hidden" aria-hidden />
    </div>
  )
}
