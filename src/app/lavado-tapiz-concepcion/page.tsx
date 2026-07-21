import Link from 'next/link'
import { Metadata } from 'next'
import { getServicesByCategory } from '@/actions/bookings'
import { formatCurrency } from '@/lib/utils'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Lavado de Tapiz en Concepción | A Domicilio — Fullshine',
  description: 'Lavado de tapiz profesional en Concepción y San Pedro de la Paz. Limpieza profunda de asientos, alfombras y techo. A domicilio sin costo adicional. Reserva online.',
  alternates: { canonical: 'https://www.fullshine.autos/lavado-tapiz-concepcion' },
  openGraph: {
    title: 'Lavado de Tapiz en Concepción | A Domicilio — Fullshine',
    description: 'Lavado de tapiz a domicilio en Concepción. Asientos, alfombras y techo. Sin costo adicional por el desplazamiento. Reserva online 24/7.',
    url: 'https://www.fullshine.autos/lavado-tapiz-concepcion',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
  },
}

const INCLUYE = [
  { icon: '💺', title: 'Asientos tela o cuero', desc: 'Extracción de manchas, polvo, bacterias y malos olores. Tratamiento especial para cuero.' },
  { icon: '🏠', title: 'Alfombras y pisos', desc: 'Lavado profundo con extractora de toda la superficie de piso, incluyendo bajo los asientos.' },
  { icon: '🪟', title: 'Techo interior', desc: 'Limpieza del cielo del auto eliminando manchas de grasa y humedad.' },
  { icon: '🚪', title: 'Paneles de puerta', desc: 'Limpieza de tapizado de puertas, apoyabrazos y bolsillos laterales.' },
  { icon: '🎒', title: 'Maletero', desc: 'Lavado completo del maletero incluyendo laterales y tapa.' },
  { icon: '✨', title: 'Tratamiento de olores', desc: 'Neutralización de olores a tabaco, mascota o humedad con productos específicos.' },
]

const FAQS = [
  { q: '¿Cuánto tarda en secar el tapiz?', a: 'El tiempo de secado es de 4 a 8 horas dependiendo de la temperatura y ventilación. Recomendamos entregar el auto en la mañana para retirarlo en la tarde con todo seco.' },
  { q: '¿El servicio a domicilio tiene costo adicional?', a: 'No. El precio es el mismo ya sea en taller o a domicilio dentro de Concepción y San Pedro de la Paz. Solo necesitamos un espacio para trabajar.' },
  { q: '¿Pueden eliminar el olor a tabaco o a mascota?', a: 'Sí. Usamos productos específicos de neutralización de olores que atacan la fuente del olor, no solo lo cubren. En casos muy intensos puede requerir más de una sesión.' },
  { q: '¿Qué pasa si hay manchas muy antiguas o profundas?', a: 'La mayoría de las manchas se eliminan o reducen significativamente. En la reserva puedes indicarnos el tipo de mancha para que llevemos los productos adecuados.' },
]

export default async function LavadoTapizPage() {
  const result = await getServicesByCategory('tapiz')
  const services = result.data ?? []

  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Lavado de Tapiz Concepción',
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
    description: 'Lavado de tapiz profesional a domicilio en Concepción. Asientos, alfombras, techo y paneles. Sin costo adicional por desplazamiento.',
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
            Lavado de Tapiz{' '}<br />
            <span className="text-amber-400">en Concepción</span>
          </h1>
          <p className="text-gray-300 text-lg mb-4 max-w-xl mx-auto">
            Limpieza profunda del interior de tu auto — asientos, alfombras, techo y paneles. <strong className="text-white">A domicilio sin costo extra</strong> dentro de Concepción y San Pedro de la Paz.
          </p>
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            🏠 A domicilio sin costo adicional
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reservar" className="bg-amber-500 hover:bg-amber-400 text-black font-black text-lg px-8 py-4 rounded-full transition-all hover:scale-105">
              Reservar ahora
            </Link>
            <a href="https://wa.me/56933654943?text=Hola%2C%20quiero%20cotizar%20lavado%20de%20tapiz" target="_blank" rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-8 py-4 rounded-full transition-colors">
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">¿Qué incluye el lavado de tapiz?</h2>
          <p className="text-gray-400 text-center mb-12">Cubrimos cada rincón del interior de tu vehículo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INCLUYE.map(item => (
              <div key={item.title} className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-colors">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      {services.length > 0 && (
        <section className="py-20 px-4 bg-gray-900/50 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Precios por tipo de vehículo</h2>
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
                            <p className="font-black text-amber-400">{formatCurrency(byType[type])}</p>
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
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Preguntas frecuentes</h2>
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
      <section className="py-20 px-4 text-center bg-gray-900/50 border-t border-white/5">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">¿Interior sucio o con olores?</h2>
          <p className="text-gray-400 mb-8">Lo dejamos impecable. Vamos donde tú estés en Concepción y San Pedro de la Paz.</p>
          <Link href="/reservar" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/20">
            Reservar lavado de tapiz
          </Link>
          <p className="mt-4 text-gray-500 text-sm">Solo 20% de anticipo · Confirmación inmediata</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
