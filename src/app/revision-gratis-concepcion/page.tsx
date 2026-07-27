import Link from 'next/link'
import { Metadata } from 'next'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'
import GalleryCarousel from '@/components/GalleryCarousel'
import PixelEvent from '@/components/PixelEvent'

export const revalidate = 3600

const WA_LINK =
  'https://wa.me/56933654943?text=' +
  encodeURIComponent('Hola, quiero agendar mi revisión GRATIS del auto 🚗')

export const metadata: Metadata = {
  title: 'Revisión Gratis de tu Auto en Concepción | Diagnóstico — Fullshine',
  description:
    'Revisión y diagnóstico GRATIS de la pintura de tu auto en Concepción: medición de espesor de laca, evaluación de rayas y contaminación. Sin costo y sin compromiso.',
  alternates: { canonical: 'https://www.fullshine.autos/revision-gratis-concepcion' },
  openGraph: {
    title: 'Revisión Gratis de tu Auto en Concepción — Fullshine',
    description:
      'Medimos el espesor de laca, evaluamos qué rayas salen y detectamos contaminación. Diagnóstico profesional sin costo.',
    url: 'https://www.fullshine.autos/revision-gratis-concepcion',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: 'https://www.fullshine.autos/hero-jaguar.jpg', width: 1600, height: 900 }],
  },
}

const QUE_REVISAMOS = [
  {
    icon: '📏',
    title: 'Espesor real de la laca',
    desc: 'Con medidor profesional. Sabrás si tu pintura es original, si fue repintada y cuánto margen hay para pulir con seguridad.',
  },
  {
    icon: '🔍',
    title: 'Qué rayas salen y cuáles no',
    desc: 'Bajo luz de inspección revisamos rayón por rayón y te decimos con honestidad qué se corrige y qué no.',
  },
  {
    icon: '🧪',
    title: 'Nivel de contaminación',
    desc: 'Detectamos partículas ferrosas, barro bituminoso y contaminantes adheridos que no se ven a simple vista.',
  },
  {
    icon: '💧',
    title: 'Estado de la protección',
    desc: 'Si ya tienes cerámica o cera, medimos cómo está funcionando y cuánta vida útil le queda.',
  },
  {
    icon: '🪟',
    title: 'Vidrios, plásticos y llantas',
    desc: 'Revisamos manchas de agua en vidrios, plásticos decolorados y el estado general de las llantas.',
  },
  {
    icon: '📋',
    title: 'Diagnóstico honesto',
    desc: 'Te decimos qué necesita tu auto de verdad y qué no. Si no necesitas nada, también te lo decimos.',
  },
]

const PASOS = [
  { n: '1', t: 'Agendas por WhatsApp', d: 'Nos escribes y coordinamos día y hora. Toma menos de 1 minuto.' },
  { n: '2', t: 'Traes tu auto', d: 'En nuestro taller de Camilo Henríquez 381, Concepción. La revisión toma 15-20 minutos.' },
  { n: '3', t: 'Revisamos juntos', d: 'Te mostramos en el momento lo que encontramos, con el medidor y la luz de inspección en mano.' },
  { n: '4', t: 'Recibes tu diagnóstico', d: 'Con recomendaciones claras y presupuesto exacto si decides avanzar. Sin presión.' },
]

const FAQS = [
  {
    q: '¿Realmente es gratis? ¿Cuál es la trampa?',
    a: 'Es completamente gratis y sin compromiso. Lo hacemos porque sabemos que cuando el cliente ve el estado real de su pintura, entiende el valor de un trabajo bien hecho. Si después de la revisión no quieres nada, no pasa nada.',
  },
  {
    q: '¿Cuánto dura la revisión?',
    a: 'Entre 15 y 20 minutos. Es una inspección técnica, no un lavado — puedes esperar mientras la hacemos.',
  },
  {
    q: '¿Tengo que traer el auto limpio?',
    a: 'No es necesario. De hecho, verlo en su estado normal nos ayuda a evaluar mejor el nivel de contaminación real.',
  },
  {
    q: '¿Sirve si mi auto es nuevo?',
    a: 'Sí, y mucho. En autos nuevos verificamos que la pintura de fábrica esté sana antes de aplicar cualquier protección — es el mejor momento para sellar.',
  },
  {
    q: '¿Me van a presionar para comprar algo?',
    a: 'No. Te damos el diagnóstico, te explicamos las opciones y tú decides. Muchos clientes se van con una recomendación de mantención que pueden hacer ellos mismos en casa.',
  },
]

export default function RevisionGratisPage() {
  const schemaService = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Revisión y diagnóstico gratis de pintura automotriz',
    serviceType: 'Inspección de pintura y diagnóstico de detailing',
    provider: {
      '@type': 'AutomotiveBusiness',
      name: 'Fullshine Detailing Premium',
      url: 'https://www.fullshine.autos',
      telephone: '+56933654943',
      sameAs: ['https://www.instagram.com/fullshinespp'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Camilo Henríquez 381',
        addressLocality: 'Concepción',
        addressRegion: 'Biobío',
        addressCountry: 'CL',
      },
    },
    areaServed: ['Concepción', 'San Pedro de la Paz'],
    description:
      'Revisión gratuita de la pintura del vehículo: medición de espesor de laca, evaluación de rayones, nivel de contaminación y estado de la protección.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CLP',
      description: 'Revisión y diagnóstico sin costo ni compromiso',
    },
  }

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://www.fullshine.autos' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Revisión Gratis en Concepción',
        item: 'https://www.fullshine.autos/revision-gratis-concepcion',
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([schemaService, schemaFAQ, schemaBreadcrumb]) }}
      />
      <PixelEvent
        event="ViewContent"
        contentName="Revisión gratis Concepción (orgánico)"
        contentCategory="revision"
      />
      <SiteNav />
      <WhatsAppButton />

      {/* HERO */}
      <section className="pt-32 pb-16 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block bg-green-500/15 border border-green-500/30 text-green-400 text-sm font-black uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
            100% gratis · Sin compromiso
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
            Revisión gratis{' '}<br className="hidden md:block" />
            <span className="text-amber-400">de tu auto en Concepción</span>
          </h1>
          <p className="text-gray-300 text-lg mb-3 max-w-xl mx-auto leading-relaxed">
            Medimos el <strong className="text-white">espesor real de tu laca</strong>, evaluamos qué rayones
            se pueden corregir y detectamos la contaminación que no se ve a simple vista.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Diagnóstico profesional · 15-20 minutos · Camilo Henríquez 381, Concepción
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/reservar?categoria=revision"
              className="bg-green-500 hover:bg-green-400 text-black font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-green-500/25"
            >
              Agendar mi revisión gratis
            </Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-lg px-10 py-4 rounded-full transition-colors"
            >
              Prefiero WhatsApp
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">Horarios cada 1 hora, de 09:00 a 18:00</p>
          <p className="text-gray-600 text-xs mt-5">⭐ 5.0 en Google con 82 reseñas verificadas</p>
        </div>
      </section>

      {/* POR QUÉ IMPORTA */}
      <section className="py-16 px-4 border-y border-white/5 bg-gray-900/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Nadie debería pagar un servicio sin saber qué necesita su auto
          </h2>
          <p className="text-gray-400 leading-relaxed">
            La mayoría de los talleres te cotizan por teléfono, sin ver el vehículo. Nosotros preferimos
            revisarlo primero: hay autos que necesitan un pulido de corrección completo y otros que solo
            requieren una mantención simple. <strong className="text-white">Saberlo antes te ahorra plata</strong> y
            te evita pagar por algo que no necesitas.
          </p>
        </div>
      </section>

      {/* QUÉ REVISAMOS */}
      <section id="que-revisamos" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Qué revisamos</h2>
          <p className="text-gray-400 text-center mb-12">
            Una inspección técnica real, con instrumentos — no una mirada a ojo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {QUE_REVISAMOS.map((item, i) => (
              <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-6">
                <p className="text-3xl mb-3">{item.icon}</p>
                <p className="font-bold text-white mb-2">{item.title}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="py-20 px-4 bg-gray-900/40 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">Cómo funciona</h2>
          <div className="space-y-6">
            {PASOS.map(p => (
              <div key={p.n} className="flex gap-5 items-start">
                <span className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 font-black flex items-center justify-center shrink-0">
                  {p.n}
                </span>
                <div className="border-l border-white/10 pl-5 pb-2 flex-1">
                  <p className="font-semibold text-white mb-1">{p.t}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Trabajos que empezaron con una revisión</h2>
          <p className="text-gray-400 text-center mb-10">Autos reales que pasaron por Fullshine</p>
          <GalleryCarousel />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-900/40 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">Preguntas frecuentes</h2>
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

      {/* CTA FINAL */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Descubre qué necesita tu auto</h2>
          <p className="text-gray-400 mb-8">
            Sin costo, sin compromiso y con un diagnóstico honesto. Agenda en menos de 1 minuto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/reservar?categoria=revision"
              className="bg-green-500 hover:bg-green-400 text-black font-black text-xl px-12 py-5 rounded-full transition-all hover:scale-105 shadow-lg shadow-green-500/25"
            >
              Agendar revisión gratis
            </Link>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-white/40 text-white font-semibold text-xl px-12 py-5 rounded-full transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <p className="mt-5 text-gray-600 text-sm">
            Camilo Henríquez 381, Concepción · Lun–Vie 09:00–18:00 · Sáb 09:00–14:00
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
