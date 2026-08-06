import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import Breadcrumbs from '@/components/Breadcrumbs'
import GalleryCarousel from '@/components/GalleryCarousel'
import {
  BUSINESS, buildMetadata, schemaService, schemaFAQ, schemaBreadcrumb, jsonLd,
} from '@/lib/seo'

export const revalidate = 3600

const PATH = '/detailing-san-pedro-de-la-paz'

export const metadata = buildMetadata({
  title: 'Detailing y Tratamiento Cerámico en San Pedro de la Paz — Fullshine',
  description:
    'Detailing automotriz para San Pedro de la Paz: tratamiento cerámico, pulido y lavado detallado. Taller a 10 minutos por el Puente Llacolén. Diagnóstico gratuito con medición de espesor de laca.',
  path: PATH,
  keywords: [
    'detailing San Pedro de la Paz',
    'tratamiento cerámico San Pedro de la Paz',
    'sellado cerámico San Pedro',
    'pulido de autos San Pedro de la Paz',
    'lavado detallado San Pedro de la Paz',
    'estética automotriz San Pedro',
  ],
})

const FAQS = [
  {
    q: '¿Atienden clientes de San Pedro de la Paz?',
    a: 'Sí, es una parte importante de nuestros clientes. Nuestro taller está en Camilo Henríquez 381, Concepción centro, a unos 10 a 15 minutos desde San Pedro cruzando el Puente Llacolén o el Puente Juan Pablo II, según el sector.',
  },
  {
    q: '¿Cuánto cuesta un tratamiento cerámico en San Pedro de la Paz?',
    a: 'El mismo valor que en Concepción: desde $300.000 el paquete Platino, $350.000 el Gold y $500.000 el Elite. No cobramos diferencia por comuna. El precio final depende del tipo de vehículo y del estado de la pintura, que evaluamos en el diagnóstico gratuito.',
  },
  {
    q: '¿Tengo que dejar el auto todo el día?',
    a: 'Depende del servicio. Un lavado detallado toma algunas horas. Un tratamiento cerámico requiere entre 1 y 2 días, porque la cerámica necesita tiempo de curado en ambiente controlado. Te decimos el plazo exacto al momento de reservar, para que puedas organizarte.',
  },
  {
    q: '¿Conviene venir desde San Pedro solo por el diagnóstico?',
    a: 'El diagnóstico toma 15 a 20 minutos y no tiene costo ni compromiso. Te vas sabiendo el espesor real de tu laca, si algún panel fue repintado y qué rayones son corregibles. Muchos clientes vienen solo por eso y deciden después, con calma. A veces la conclusión es que su auto no necesita nada — y también se lo decimos.',
  },
  {
    q: '¿Qué servicios de detailing hacen?',
    a: 'Tratamiento cerámico Nasiol ZR53, corrección y pulido de pintura, lavado detallado con descontaminación, limpieza profunda de tapiz e interior, y mantención semestral de tratamientos cerámicos.',
  },
]

const MIGAS = [
  { name: 'Inicio', path: '/' },
  { name: 'Detailing en San Pedro de la Paz', path: PATH },
]

export default function DetailingSanPedro() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          schemaService({
            name: 'Detailing automotriz para San Pedro de la Paz',
            serviceType: 'Detailing y estética automotriz',
            alternateName: ['Tratamiento cerámico San Pedro de la Paz'],
            description:
              'Servicios de detailing para clientes de San Pedro de la Paz: tratamiento cerámico Nasiol ZR53, corrección de pintura, lavado detallado y limpieza de tapiz. Taller en Concepción centro.',
            path: PATH,
          }),
          schemaFAQ(FAQS),
          schemaBreadcrumb(MIGAS)
        )}
      />
      <SiteNav />

      <main>
        <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={MIGAS} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">
              A 10 minutos por el Puente Llacolén
            </p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Detailing en <span className="text-amber-400">San Pedro de la Paz</span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-2xl">
              Tratamiento cerámico, corrección de pintura y lavado detallado para vehículos de
              San Pedro de la Paz. Nuestro taller está en Camilo Henríquez 381, Concepción
              centro — a 10 o 15 minutos cruzando el puente.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">
              <strong className="text-gray-200">Mismo precio que en Concepción</strong>, sin recargo
              por comuna. Y antes de cotizarte nada, medimos el espesor real de tu laca con
              instrumento profesional. Gratis, en 15 minutos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/diagnostico"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105 text-center">
                Diagnóstico gratuito
              </Link>
              <a href={`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent('Hola, soy de San Pedro de la Paz y quiero información sobre detailing')}`}
                target="_blank" rel="noopener noreferrer"
                className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors text-center">
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* CÓMO LLEGAR */}
        <section className="py-14 px-4 bg-gray-900/40 border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Cómo llegar desde San Pedro de la Paz</h2>
            <div className="grid gap-6 sm:grid-cols-3 text-sm">
              <div>
                <h3 className="font-bold text-amber-400 mb-2">Desde Villa San Pedro y Candelaria</h3>
                <p className="text-gray-400 leading-relaxed">
                  Puente Llacolén hacia Concepción, luego Chacabuco y Camilo Henríquez.
                  Alrededor de 10 minutos sin congestión.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-amber-400 mb-2">Desde Andalué y Lomas Coloradas</h3>
                <p className="text-gray-400 leading-relaxed">
                  Ruta 160 hacia el norte, luego Puente Juan Pablo II. Entre 15 y 20 minutos
                  según el horario.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-amber-400 mb-2">Dirección exacta</h3>
                <p className="text-gray-400 leading-relaxed">
                  {BUSINESS.street}, {BUSINESS.city}.{' '}
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(`${BUSINESS.street}, ${BUSINESS.city}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
                    Abrir en Google Maps
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black mb-6">Trabajos realizados</h2>
            <GalleryCarousel />
          </div>
        </section>

        {/* SERVICIOS — enlazado interno */}
        <section className="py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-8">Servicios disponibles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { href: '/sellado-ceramico-concepcion', t: 'Tratamiento cerámico', d: 'Nasiol ZR53 10H · Desde $300.000' },
                { href: '/pulido-auto-concepcion', t: 'Pulido y corrección de pintura', d: 'Con medición previa de espesor' },
                { href: '/lavado-detallado-concepcion', t: 'Lavado detallado', d: 'Descontaminación química y mecánica' },
                { href: '/lavado-tapiz-concepcion', t: 'Limpieza de tapiz e interior', d: 'Lavado profundo con equipo profesional' },
              ].map(s => (
                <Link key={s.href} href={s.href}
                  className="group rounded-2xl border border-white/10 bg-gray-900/60 p-6 transition-all hover:border-amber-500/40">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-amber-400 transition-colors">{s.t}</h3>
                  <p className="text-gray-400 text-sm">{s.d}</p>
                </Link>
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

        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black mb-4">Cruza el puente y sal sabiendo</h2>
            <p className="text-gray-400 mb-8">
              15 minutos, sin costo, sin compromiso. Te vas con los números de tu pintura.
            </p>
            <Link href="/diagnostico"
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105">
              Agendar diagnóstico gratuito
            </Link>
            <p className="mt-10 text-sm text-gray-500">
              Ver también{' '}
              <Link href="/detailing-concepcion" className="text-amber-400 hover:text-amber-300 underline underline-offset-4">
                detailing en Concepción
              </Link>.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
