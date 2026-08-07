import Link from 'next/link'
import { Metadata } from 'next'
import { getServicesByCategory } from '@/actions/bookings'
import { formatCurrency } from '@/lib/utils'
import { isPromoActive, promoPrice, formatCLP, PROMO_OTROS } from '@/lib/promo'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Pulido Auto Concepción | Corrección de Pintura — Fullshine',
  description: 'Pulido profesional y corrección de pintura en Concepción y San Pedro de la Paz. Eliminamos rayones, hologramas y oxidación. Resultados visibles desde la primera sesión.',
  alternates: { canonical: 'https://www.fullshine.autos/pulido-auto-concepcion' },
  openGraph: {
    title: 'Pulido Auto Concepción | Corrección de Pintura — Fullshine',
    description: 'Pulido y corrección de pintura profesional en Concepción. Rayones, hologramas y oxidación eliminados. Reserva online.',
    url: 'https://www.fullshine.autos/pulido-auto-concepcion',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
  },
}

const TIPOS = [
  { icon: '✨', name: 'Pulido de mantenimiento', desc: 'Para autos con buen estado de pintura. Elimina holograma, micro-rayaduras y revitaliza el brillo. Ideal como paso previo a un sellado.' },
  { icon: '⚡', name: 'Corrección de pintura', desc: 'Para autos con rayones visibles, oxidación o pintura opaca. Proceso de una o dos pasadas que recupera el estado original de la pintura.' },
  { icon: '🔧', name: 'Pulido de focos', desc: 'Restaura focos amarillos u opacos a su estado claro original, mejorando visibilidad y estética.' },
]

const PROCESO = [
  { n: '01', title: 'Lavado y evaluación', desc: 'Lavado técnico completo y evaluación del estado real de la pintura con luz de inspección.' },
  { n: '02', title: 'Descontaminación', desc: 'Eliminamos contaminantes ferrosos y barro bituminoso adherido a la pintura.' },
  { n: '03', title: 'Pulido a máquina', desc: 'Trabajo con pulidoras de órbita doble y pastas de diferentes cortes según la profundidad del daño.' },
  { n: '04', title: 'Inspección bajo luz', desc: 'Revisamos cada panel bajo luz de inspección para asegurar que no queden marcas.' },
  { n: '05', title: 'Sellado protector', desc: 'Opcional: aplicamos cera carnauba o sellado sintético para proteger el trabajo recién realizado.' },
]

const FAQS = [
  { q: '¿El pulido elimina todos los rayones?', a: 'Depende de la profundidad. Los rayones superficiales (que no llegan a la base) se eliminan completamente. Los profundos se reducen significativamente pero no desaparecen del todo — para esos casos existe el retoque de pintura.' },
  { q: '¿Con qué frecuencia debo pulir mi auto?', a: 'Un auto bien cuidado puede pulirse cada 1-2 años. Si tienes sellado cerámico, el pulido es menos frecuente ya que la cerámica protege la pintura.' },
  { q: '¿El pulido adelgaza la pintura?', a: 'Con equipos modernos y pasta correcta, el desgaste es mínimo. Un auto puede pulirse muchas veces a lo largo de su vida sin problema. Usamos técnicas de un solo paso cuando es posible para minimizar el desgaste.' },
  { q: '¿Cuánto tiempo demora?', a: 'Un pulido de mantenimiento toma 3-5 horas. Una corrección completa puede tomar 1-2 días dependiendo del estado de la pintura y el tamaño del vehículo.' },
]

export default async function PulidoAutoPage() {
  const result = await getServicesByCategory('pulido')
  const services = result.data ?? []
  const promo = isPromoActive() && PROMO_OTROS > 0

  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Pulido Auto Concepción',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Fullshine Detailing Premium',
      url: 'https://www.fullshine.autos',
      telephone: '+56933654943',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Camilo Henríquez 381',
        addressLocality: 'Concepción',
        addressRegion: 'Biobío',
        addressCountry: 'CL',
      },
    },
    areaServed: ['Concepción', 'San Pedro de la Paz'],
    description: 'Pulido y corrección de pintura profesional en Concepción. Eliminamos rayones, hologramas y oxidación.',
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaService) }} />
      <SiteNav />
      <WhatsAppButton />

      {/* HERO */}
      <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">Concepción &amp; San Pedro de la Paz</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            Pulido y Corrección{' '}<br />
            <span className="text-amber-400">de Pintura</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Recuperamos el brillo original de tu auto eliminando rayones finos, hologramas y oxidación con máquinas profesionales y pastas de alta gama.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservar" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105">
              Reservar ahora
            </Link>
            <a href="https://wa.me/56933654943?text=Hola%2C%20quiero%20cotizar%20un%20pulido%20para%20mi%20auto" target="_blank" rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* TIPOS DE PULIDO */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Tipos de pulido</h2>
          <p className="text-gray-400 text-center mb-12">Elegimos el tipo adecuado según el estado real de tu pintura</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIPOS.map(tipo => (
              <div key={tipo.name} className="bg-gray-900 border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-colors">
                <div className="text-3xl mb-3">{tipo.icon}</div>
                <h3 className="font-bold text-white mb-2">{tipo.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{tipo.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESO */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nuestro proceso de pulido</h2>
          <div className="space-y-6">
            {PROCESO.map(step => (
              <div key={step.n} className="flex gap-5 items-start">
                <span className="text-amber-500 font-black text-2xl tabular-nums shrink-0 w-10 text-right">{step.n}</span>
                <div className="border-l border-white/10 pl-5 pb-6">
                  <p className="font-semibold text-white mb-1">{step.title}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      {services.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Precios por tipo de vehículo</h2>
            {promo && <p className="text-center text-green-400 font-bold text-sm mb-8 -mt-6">10% OFF aplicado — válido hasta el 31 de julio</p>}
            <div className="space-y-4">
              {services.map(service => {
                const prices = (service.prices ?? []) as { vehicle_type: string; price_clp: number }[]
                const byType: Record<string, number> = {}
                prices.forEach(p => { byType[p.vehicle_type] = p.price_clp })
                return (
                  <div key={service.id} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                    <p className="font-bold text-white mb-4">{service.name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[['hatch_sedan', 'Hatch / Sedan'], ['suv_camioneta', 'SUV / Camioneta'], ['pickup_xl', 'Pickup XL']].map(([type, label]) => (
                        byType[type] ? (
                          <div key={type} className="text-center bg-gray-800/50 rounded-xl p-3">
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            {promo ? (
                              <>
                                <p className="text-xs text-gray-500 line-through">{formatCurrency(byType[type])}</p>
                                <p className="font-black text-amber-400">{formatCLP(promoPrice(byType[type], PROMO_OTROS))}</p>
                              </>
                            ) : (
                              <p className="font-black text-amber-400">{formatCurrency(byType[type])}</p>
                            )}
                          </div>
                        ) : null
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Preguntas frecuentes sobre pulido</h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                <p className="font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Tu pintura necesita una segunda vida?</h2>
          <p className="text-gray-400 mb-8">Agenda hoy. Confirmación inmediata por WhatsApp.</p>
          <Link href="/reservar" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
            Reservar pulido
          </Link>
          <p className="mt-4 text-gray-500 text-sm">Concepción y San Pedro de la Paz · Solo 20% de anticipo</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
