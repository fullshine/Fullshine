import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import GalleryCarousel from '@/components/GalleryCarousel'
import {
  BUSINESS, buildMetadata, schemaService, schemaFAQ, schemaBreadcrumb, jsonLd,
} from '@/lib/seo'

export const revalidate = 3600

const PATH = '/detailing-concepcion'

export const metadata = buildMetadata({
  title: 'Detailing en Concepción | Taller de Estética Automotriz — Fullshine',
  description:
    'Taller de detailing automotriz en Concepción centro. Tratamiento cerámico, corrección de pintura, lavado detallado y limpieza de tapiz. Diagnóstico gratuito con medición de espesor de laca. 5,0 ★ en Google.',
  path: PATH,
  keywords: [
    'detailing Concepción',
    'detailing automotriz Concepción',
    'estética automotriz Concepción',
    'taller de detailing Concepción',
    'pulido automotriz Concepción',
    'lavado premium Concepción',
  ],
})

const SERVICIOS = [
  {
    href: '/sellado-ceramico-concepcion',
    titulo: 'Tratamiento cerámico',
    desc: 'Protección Nasiol ZR53 10H con 3 años de garantía de fábrica, extensible a 5 con mantenciones semestrales.',
    precio: 'Desde $300.000',
  },
  {
    href: '/pulido-auto-concepcion',
    titulo: 'Pulido y corrección de pintura',
    desc: 'Eliminamos rayones, hologramas y oxidación. Siempre con medición previa de espesor de laca.',
    precio: 'Consultar',
  },
  {
    href: '/lavado-detallado-concepcion',
    titulo: 'Lavado detallado',
    desc: 'Lavado técnico con descontaminación química y mecánica. Muy por encima de un lavado convencional.',
    precio: 'Consultar',
  },
  {
    href: '/lavado-tapiz-concepcion',
    titulo: 'Limpieza de tapiz e interior',
    desc: 'Lavado profundo de tapices, alfombras y superficies interiores con equipos profesionales.',
    precio: 'Consultar',
  },
]

const DIFERENCIAS = [
  {
    titulo: 'Medimos antes de intervenir',
    desc: 'Somos el único taller de la zona que mide el espesor real de la laca con instrumento profesional antes de recomendar un pulido. La capa transparente es finita y no se regenera: pulir sin medir es trabajar a ciegas.',
  },
  {
    titulo: 'Certificado digital de garantía',
    desc: 'Cada tratamiento cerámico se entrega con un certificado digital de código único, verificable en línea, con la fecha de aplicación y el vencimiento de la cobertura.',
  },
  {
    titulo: 'Precios públicos',
    desc: 'Nuestros valores están publicados en el sitio. No hay que escribir para "cotizar" ni negociar. Sabes cuánto cuesta antes de venir.',
  },
  {
    titulo: 'Taller propio con iluminación de inspección',
    desc: 'Trabajamos en local cerrado con luces LED hexagonales, que revelan defectos de pintura invisibles bajo luz normal. No trabajamos a la intemperie.',
  },
]

const FAQS = [
  {
    q: '¿Dónde queda su taller de detailing en Concepción?',
    a: 'Estamos en Camilo Henríquez 381, Concepción centro. Atendemos de lunes a viernes de 09:00 a 18:00 y sábados de 09:00 a 14:00, siempre con hora reservada. También atendemos clientes de San Pedro de la Paz, Chiguayante, Talcahuano y Hualpén.',
  },
  {
    q: '¿Qué diferencia hay entre detailing y un lavado de autos común?',
    a: 'Un lavado retira la suciedad de la superficie y toma menos de una hora. El detailing trabaja sobre el estado de la pintura: descontaminación química y mecánica, corrección de defectos y aplicación de protección. Un servicio de detailing puede tomar entre 4 horas y 2 días según el trabajo, y el resultado dura años en vez de días.',
  },
  {
    q: '¿Cuánto cuesta un servicio de detailing en Concepción?',
    a: 'Depende del servicio. El tratamiento cerámico parte en $300.000, y el lavado detallado y la limpieza de tapiz tienen valores menores según el tipo de vehículo. Todos nuestros precios están publicados en el sitio. El diagnóstico previo de la pintura no tiene costo.',
  },
  {
    q: '¿Necesito reservar hora o puedo llegar directamente?',
    a: 'Siempre con hora reservada. Trabajamos un vehículo a la vez para poder dedicarle el tiempo que requiere, así que no atendemos por orden de llegada. Puedes reservar en línea en menos de un minuto y recibes confirmación inmediata por WhatsApp.',
  },
  {
    q: '¿Atienden vehículos de alta gama?',
    a: 'Sí. Trabajamos regularmente con vehículos premium y deportivos. El proceso es el mismo para todos: medición de espesor de laca, evaluación bajo luz de inspección y recomendación basada en datos, no en el valor del auto.',
  },
]

const MIGAS = [
  { name: 'Inicio', path: '/' },
  { name: 'Detailing en Concepción', path: PATH },
]

export default function DetailingConcepcion() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          schemaService({
            name: 'Detailing automotriz en Concepción',
            serviceType: 'Detailing y estética automotriz',
            alternateName: ['Estética automotriz Concepción', 'Detallado de autos Concepción'],
            description:
              'Servicios de detailing automotriz en Concepción: tratamiento cerámico, corrección de pintura, lavado detallado y limpieza de tapiz. Con diagnóstico previo por medición de espesor de laca.',
            path: PATH,
          }),
          schemaFAQ(FAQS),
          schemaBreadcrumb(MIGAS)
        )}
      />
      <SiteNav />

      <main>
        {/* HERO */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={MIGAS} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">
              Camilo Henríquez 381 · Concepción centro
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Detailing en <span className="text-amber-400">Concepción</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl">
              Taller de estética automotriz en pleno centro de Concepción. Trabajamos un vehículo
              a la vez, con iluminación LED de inspección e instrumentos de medición.
              <strong className="text-white"> Diagnosticamos la pintura antes de intervenirla</strong> —
              y a veces la conclusión es que tu auto no necesita nada.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">
              Atendemos clientes de Concepción, San Pedro de la Paz, Chiguayante, Talcahuano y
              Hualpén. <strong className="text-gray-200">5,0 estrellas con 82 reseñas verificadas</strong> en Google.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/diagnostico"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105 text-center">
                Diagnóstico gratuito
              </Link>
              <a href={`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre sus servicios de detailing')}`}
                target="_blank" rel="noopener noreferrer"
                className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors text-center">
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-3">Nuestros servicios de detailing</h2>
            <p className="text-gray-400 mb-10 max-w-2xl">
              Cada servicio tiene su propia página con el detalle del proceso, los valores y las
              preguntas frecuentes.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {SERVICIOS.map(s => (
                <Link key={s.href} href={s.href}
                  className="group rounded-2xl border border-white/10 bg-gray-900/60 p-6 transition-all hover:border-amber-500/40 hover:bg-gray-900">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                    {s.titulo}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <span className="text-amber-400 text-sm font-semibold">{s.precio} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Trabajos realizados en nuestro taller</h2>
            <GalleryCarousel />
          </div>
        </section>

        {/* DIFERENCIADORES — E-E-A-T */}
        <section className="py-16 px-4 bg-gray-900/40 border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-10">
              Por qué elegir Fullshine en Concepción
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {DIFERENCIAS.map(d => (
                <div key={d.titulo}>
                  <h3 className="text-lg font-bold text-amber-400 mb-2">{d.titulo}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-10">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {FAQS.map(f => (
                <details key={f.q} className="group rounded-2xl border border-white/10 bg-gray-900/60 p-6">
                  <summary className="cursor-pointer font-bold text-white marker:content-none flex justify-between items-start gap-4">
                    {f.q}
                    <span aria-hidden="true" className="text-amber-400 shrink-0 transition-transform group-open:rotate-45">＋</span>
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed text-sm">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA + comunas (enlazado interno) */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">¿Vale la pena tratar tu pintura?</h2>
            <p className="text-gray-400 mb-8">
              Te lo decimos gratis, con instrumento, en 15 minutos.
            </p>
            <Link href="/diagnostico"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105">
              Agendar diagnóstico gratuito
            </Link>
            <p className="mt-10 text-sm text-gray-500">
              También atendemos en{' '}
              <Link href="/detailing-san-pedro-de-la-paz" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
                San Pedro de la Paz
              </Link>
              , Chiguayante, Talcahuano y Hualpén.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
