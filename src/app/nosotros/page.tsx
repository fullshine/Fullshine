import Link from 'next/link'
import Image from 'next/image'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import { BUSINESS, SITE_URL, buildMetadata, schemaBreadcrumb, schemaFAQ, jsonLd } from '@/lib/seo'

export const revalidate = 86400

const PATH = '/nosotros'

export const metadata = buildMetadata({
  title: 'Quiénes somos | Fullshine Detailing Premium, Concepción',
  description:
    'Fullshine es un taller de detailing en Concepción dirigido por Juan Sáez, especialista en corrección de pintura. Más de 300 vehículos tratados. Diagnosticamos con instrumentos antes de intervenir.',
  path: PATH,
  keywords: [
    'Fullshine Concepción',
    'taller detailing Concepción',
    'Juan Sáez detailing',
    'especialista corrección de pintura Concepción',
  ],
  image: `${SITE_URL}/juan-medidor.jpg`,
})

const PROCESO = [
  {
    n: '01',
    t: 'Diagnóstico con instrumentos',
    d: 'Medimos el espesor de la laca panel por panel con un medidor profesional, y revisamos la pintura bajo luz LED de inspección. Sin ese dato, cualquier recomendación es una suposición.',
  },
  {
    n: '02',
    t: 'Te mostramos los números',
    d: 'Ves las mediciones en la pantalla del instrumento al mismo tiempo que nosotros. No hay caja negra ni informes que no se entienden.',
  },
  {
    n: '03',
    t: 'Prescribimos el tratamiento',
    d: 'Recomendamos solo lo que corresponde según lo que muestran los datos. A veces la conclusión es que el vehículo no necesita nada, y también lo decimos.',
  },
  {
    n: '04',
    t: 'Ejecutamos y documentamos',
    d: 'Trabajamos un vehículo a la vez. En los tratamientos cerámicos entregamos un certificado digital con código verificable y fecha de vencimiento de la garantía.',
  },
]

const FAQS = [
  {
    q: '¿Quién atiende en Fullshine?',
    a: 'Juan Sáez, especialista en corrección de pintura, realiza personalmente los diagnósticos y supervisa cada trabajo. Lleva más de 300 vehículos tratados en Concepción.',
  },
  {
    q: '¿Qué productos utilizan?',
    a: 'Para los tratamientos cerámicos trabajamos con Nasiol ZR53, una cerámica certificada 10H con resistencia térmica hasta 150 °C y tres años de duración de fábrica, extensible a cinco con el programa de mantención semestral.',
  },
  {
    q: '¿Ofrecen algún tipo de garantía?',
    a: 'Sí. Cada tratamiento cerámico incluye un certificado digital con código único, verificable en línea, que registra la fecha de aplicación y el vencimiento de la cobertura. La garantía se mantiene vigente aplicando el booster cerámico cada seis meses.',
  },
  {
    q: '¿Por qué el diagnóstico es gratuito?',
    a: 'Porque preferimos que decidas con datos. Un diagnóstico honesto a veces significa perder una venta —cuando el auto no necesita el tratamiento— pero gana un cliente que vuelve y que recomienda. Es una decisión comercial, no un acto de generosidad.',
  },
]

const MIGAS = [
  { name: 'Inicio', path: '/' },
  { name: 'Quiénes somos', path: PATH },
]

export default function Nosotros() {
  const schemaPersona = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}${PATH}#aboutpage`,
    name: 'Quiénes somos — Fullshine Detailing Premium',
    url: `${SITE_URL}${PATH}`,
    about: { '@id': `${SITE_URL}/#business` },
    mainEntity: {
      '@type': 'Person',
      name: 'Juan Sáez',
      jobTitle: 'Especialista en corrección de pintura automotriz',
      worksFor: { '@id': `${SITE_URL}/#business` },
      image: `${SITE_URL}/juan-medidor.jpg`,
      knowsAbout: [
        'Corrección de pintura automotriz',
        'Medición de espesor de laca',
        'Tratamiento cerámico Nasiol ZR53',
        'Descontaminación de pintura',
      ],
    },
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(schemaPersona, schemaFAQ(FAQS), schemaBreadcrumb(MIGAS))}
      />
      <SiteNav />

      <main>
        <section className="pt-32 pb-14 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-3xl mx-auto">
            <Breadcrumbs items={MIGAS} />
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              Ningún médico receta<br />
              <span className="text-amber-400">antes de diagnosticar</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed">
              Fullshine nació de una molestia concreta: en el detailing casi todo el mundo vende
              un pulido sin haber medido nada. Y la capa de laca que protege tu pintura es finita
              — cada corrección consume una parte que no vuelve.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Por eso trabajamos al revés que el resto. Primero medimos, después recomendamos.
            </p>
          </div>
        </section>

        {/* QUIÉN — E-E-A-T */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-amber-500/25">
                <Image
                  src="/juan-medidor.jpg"
                  alt="Juan Sáez midiendo el espesor de laca de un vehículo en el taller Fullshine de Concepción"
                  fill sizes="144px" className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-1">Juan Sáez</h2>
                <p className="text-amber-400 font-semibold text-sm mb-1">
                  Especialista en corrección de pintura
                </p>
                <p className="text-gray-500 text-sm mb-5">
                  Más de 300 vehículos tratados en Concepción
                </p>
                <p className="text-gray-400 leading-relaxed">
                  El diagnóstico lo hago yo, contigo al lado. Vas a ver las mediciones en la
                  pantalla del instrumento al mismo tiempo que yo, y te voy a decir exactamente
                  lo que veo — aunque la conclusión sea que tu auto no necesita nada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESO */}
        <section className="py-14 px-4 bg-gray-900/40 border-y border-white/5">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-10">Cómo trabajamos</h2>
            <ol className="space-y-8">
              {PROCESO.map(p => (
                <li key={p.n} className="flex gap-5">
                  <span className="text-amber-400 font-black text-lg shrink-0 w-8">{p.n}</span>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{p.t}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* DATOS DUROS */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { v: '5,0★', l: 'Calificación en Google' },
              { v: '82', l: 'Reseñas verificadas' },
              { v: '300+', l: 'Vehículos tratados' },
              { v: '10H', l: 'Dureza Nasiol ZR53' },
            ].map(s => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-gray-900/60 p-5">
                <p className="text-2xl font-black text-amber-400">{s.v}</p>
                <p className="mt-1 text-xs text-gray-500 leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4">
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

        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Ven a conocer tu pintura</h2>
            <p className="text-gray-400 mb-8">
              15 minutos, sin costo. Te vas sabiendo qué necesita tu auto — y qué no.
            </p>
            <Link href="/diagnostico"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105">
              Agendar diagnóstico gratuito
            </Link>
            <p className="mt-8 text-sm text-gray-500">
              {BUSINESS.street}, {BUSINESS.city} · {BUSINESS.phoneDisplay}
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
