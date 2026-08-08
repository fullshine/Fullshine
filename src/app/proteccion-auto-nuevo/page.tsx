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

const CTA = '/reservar?categoria=revision'
const WA = `https://wa.me/${BUSINESS.whatsapp}?text=` +
  encodeURIComponent('Hola, acabo de comprar un auto nuevo y quiero protegerlo 🚗')

export const metadata = buildMetadata({
  title: '¿Compraste auto nuevo? Protege la pintura desde el día uno — Fullshine Concepción',
  description:
    'Tratamiento cerámico para autos nuevos en Concepción. En pintura de fábrica no hay que corregir nada, así que el trabajo rinde más. Diagnóstico gratuito antes de decidir.',
  path: PATH,
  keywords: [
    'proteger pintura auto nuevo',
    'cerámico auto nuevo Concepción',
    'tratamiento cerámico auto recién comprado',
    'proteccion pintura auto 0km Chile',
  ],
})

const VERDADES = [
  {
    t: 'Tu auto nuevo no salió perfecto de la fábrica',
    d: 'Entre la planta y la concesionaria, el vehículo viaja en barco, tren y camión, muchas veces a la intemperie. Llega con contaminación ferrosa incrustada en la pintura, y muchas veces con micro-rayas del lavado de entrega. No se ven a simple vista: se ven bajo luz de inspección.',
  },
  {
    t: 'Los primeros meses son los que más daño hacen',
    d: 'La mayoría de las micro-rayas de un auto no vienen del uso, vienen del lavado. Un año de lavados con esponja y rodillos deja una red de marcas circulares que después hay que pulir — y pulir consume barniz que no se recupera.',
  },
  {
    t: 'Sobre pintura nueva, el cerámico rinde más',
    d: 'Aplicar cerámica sobre una pintura sana es mucho más simple que sobre una castigada: no hay que corregir defectos antes. El resultado es mejor y el sellado queda protegiendo el acabado original de fábrica, no una versión ya desgastada.',
  },
  {
    t: 'Y protege el valor de reventa',
    d: 'La pintura es lo primero que mira quien compra un auto usado. Un vehículo con el acabado original intacto y certificado de tratamiento se vende mejor y más rápido que uno con la pintura opaca y rayada.',
  },
]

const FAQS = [
  {
    q: '¿Cuándo conviene aplicar el cerámico en un auto nuevo?',
    a: 'Lo antes posible, idealmente dentro de los primeros meses. Mientras menos lavados haya recibido, menos micro-rayas tendrá y menos corrección necesitará antes de sellar. Igual conviene pasar primero por el diagnóstico gratuito: revisamos el estado real de la pintura antes de recomendar nada.',
  },
  {
    q: '¿Un auto nuevo necesita pulido antes del cerámico?',
    a: 'Depende de cómo llegó. Muchos vehículos nuevos solo requieren descontaminación y un pulido de realce muy suave. Otros llegan con marcas del lavado de entrega de la concesionaria y necesitan corrección. Eso se determina midiendo y revisando bajo luz de inspección, no a ojo.',
  },
  {
    q: '¿Cuánto cuesta proteger un auto nuevo?',
    a: 'Los paquetes cerámicos parten en $300.000 (Platino), $350.000 (Gold) y $500.000 (Elite). En un auto nuevo, al requerir menos corrección, el trabajo suele ubicarse en el rango base del paquete elegido.',
  },
  {
    q: '¿La concesionaria no le puso algo ya?',
    a: 'Muchas concesionarias ofrecen un sellado o abrillantado en la entrega. Suelen ser productos de baja duración — semanas o pocos meses — muy distintos de una cerámica de 10H con tres años de garantía. Si te aplicaron algo, tráelo: lo revisamos y te decimos qué protección tiene realmente hoy.',
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
              'Tratamiento cerámico Nasiol ZR53 para vehículos recién comprados en Concepción. Protege el acabado original de fábrica y el valor de reventa.',
            path: PATH,
            offers: [
              { name: 'Cerámico Platino', price: 300000 },
              { name: 'Cerámico Gold', price: 350000 },
              { name: 'Cerámico Elite', price: 500000 },
            ],
          }),
          schemaFAQ(FAQS)
        )}
      />
      <PixelEvent
        event="ViewContent"
        contentName="Landing protección auto nuevo"
        contentCategory="ceramico"
      />

      {/* HERO */}
      <header className="relative flex min-h-[92svh] items-center justify-center px-5 py-24">
        <Image
          src="/galeria/hero-ferrari.jpg"
          alt="Vehículo bajo luces de inspección en el taller Fullshine de Concepción"
          fill priority sizes="100vw"
          className="scale-105 object-cover object-[50%_62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-[#05070A]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Reveal>
            <Image src="/logo.png" alt="Fullshine Detailing Premium"
              width={76} height={76} priority
              className="mx-auto mb-8 drop-shadow-[0_0_45px_rgba(255,255,255,.3)]" />
          </Reveal>

          <Reveal delay={120}>
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400 sm:text-xs">
              Para autos recién comprados
            </p>
          </Reveal>

          <Reveal delay={200}>
            <h1 className="text-[2.4rem] font-black leading-[0.98] tracking-[-0.03em] sm:text-6xl">
              ¿COMPRASTE<br />AUTO NUEVO?
            </h1>
          </Reveal>

          <Reveal delay={320}>
            <p className="mx-auto mt-7 max-w-xl text-xl font-bold leading-snug text-amber-400 sm:text-3xl">
              La pintura nunca va a estar mejor que hoy.
            </p>
          </Reveal>

          <Reveal delay={440}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Protegerla ahora cuesta menos que recuperarla después. En pintura de fábrica
              casi no hay que corregir nada — y ese es justamente el trabajo caro.
            </p>
          </Reveal>

          <Reveal delay={560}>
            <div className="mt-11">
              <Link href={CTA}
                className="inline-flex items-center gap-2.5 rounded-full bg-amber-500 px-8 py-5 text-base font-black text-black shadow-[0_0_34px_-6px_rgba(245,158,11,.6)] transition-all hover:scale-[1.03] hover:bg-amber-400 sm:px-12 sm:text-xl">
                REVISAR MI AUTO GRATIS
                <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="mt-6 text-xs tracking-wide text-white/35 sm:text-sm">
              15 minutos · Sin costo · {BUSINESS.street}, {BUSINESS.city}
            </p>
          </Reveal>
        </div>
      </header>

      {/* LAS VERDADES */}
      <section className="px-5 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Cuatro cosas que<br className="hidden sm:block" /> nadie te dice en la entrega
            </h2>
          </Reveal>

          <div className="mt-14 space-y-8">
            {VERDADES.map((v, i) => (
              <Reveal key={v.t} delay={i * 100}>
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 sm:p-9">
                  <h3 className="mb-3 text-xl font-bold leading-snug text-amber-400 sm:text-2xl">
                    {v.t}
                  </h3>
                  <p className="leading-relaxed text-white/55">{v.d}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="border-y border-white/[0.07] bg-white/[0.02] px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Cuánto cuesta protegerlo
            </h2>
            {promo && (
              <p className="mt-4 inline-block rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-black text-green-400">
                🔥 {PROMO_SHORT} · solo por hoy
              </p>
            )}
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { n: 'Platino', p: 300000, d: 'Protección esencial de la pintura' },
              { n: 'Gold', p: 350000, d: 'Suma sellado de vidrios', top: true },
              { n: 'Elite', p: 500000, d: 'Suma plásticos y llantas' },
            ].map(t => (
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

          <Reveal delay={200}>
            <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-white/45">
              El valor final depende del tipo de vehículo y del estado real de la pintura.
              En un auto nuevo, al requerir menos corrección, el trabajo suele quedar en el
              rango base del paquete.
            </p>
          </Reveal>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="px-5 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">
              Trabajos reales en nuestro taller
            </p>
          </Reveal>
          <GalleryCarousel />
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-20">
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

      {/* CTA FINAL */}
      <section className="relative overflow-hidden px-5 py-28 text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="relative mx-auto max-w-2xl">
          <Reveal>
            <h2 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Primero lo revisamos.<br />Después decides.
            </h2>
            <p className="mt-6 text-lg text-white/55">
              Traélo y te decimos en 15 minutos qué protección necesita de verdad —
              y si conviene esperar, también te lo decimos.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-11">
              <Link href={CTA}
                className="inline-flex items-center gap-2.5 rounded-full bg-amber-500 px-10 py-5 text-lg font-black text-black transition-all hover:scale-[1.03] hover:bg-amber-400">
                REVISAR MI AUTO GRATIS
                <span aria-hidden>→</span>
              </Link>
            </div>
            <WhatsAppTrackedLink
              href={WA}
              source="Landing auto nuevo — CTA final"
              className="mt-8 inline-block text-sm font-medium text-white/45 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
            >
              ¿Prefieres escribirnos por WhatsApp?
            </WhatsAppTrackedLink>
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
