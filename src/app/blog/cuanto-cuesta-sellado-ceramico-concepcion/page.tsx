import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost } from '@/lib/blog'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

const SLUG = 'cuanto-cuesta-sellado-ceramico-concepcion'

export const metadata: Metadata = {
  title: '¿Cuánto cuesta el sellado cerámico en Concepción? Guía 2026 — Fullshine',
  description: 'Precios reales del sellado cerámico en Concepción 2026. Qué incluye cada paquete, por qué varía el precio y cómo elegir el servicio correcto para tu auto.',
  alternates: { canonical: `https://www.fullshine.autos/blog/${SLUG}` },
  openGraph: {
    title: '¿Cuánto cuesta el sellado cerámico en Concepción? Guía 2026',
    description: 'Precios reales, qué incluye y cómo elegir el paquete correcto.',
    url: `https://www.fullshine.autos/blog/${SLUG}`,
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'article',
  },
}

const PRECIOS = [
  { nivel: 'Básico / entrada', rango: '$150.000 – $220.000', incluye: 'Solo aplicación de cerámica de bajo costo. Sin pulido previo. Duración real: 6-12 meses.' },
  { nivel: 'Intermedio', rango: '$250.000 – $380.000', incluye: 'Lavado técnico + cerámica de calidad media. Duración real: 1-2 años.' },
  { nivel: 'Premium (Fullshine)', rango: '$300.000 – $500.000+', incluye: 'Descontaminación + pulido + Nasiol ZR53 (9H). Duración real: 3-5 años.' },
]

const FAQ_ITEMS = [
  {
    q: '¿Por qué hay cerámicos desde $80.000 en Instagram?',
    a: 'El precio muy bajo suele indicar que se aplica una cerámica de baja concentración (spray cerámico), sin preparación de la pintura. El resultado dura semanas o pocos meses, no años. Una cerámica real de 9H como Nasiol ZR53 requiere una preparación seria que toma horas.',
  },
  {
    q: '¿Puedo poner cerámica sin haber pulido antes?',
    a: 'Técnicamente sí, pero es un error: la cerámica sella el estado actual de la pintura — si tiene rayones u hologramas, los dejará encapsulados para siempre. Por eso en Fullshine siempre incluimos pulido antes de aplicar la cerámica.',
  },
  {
    q: '¿Vale la pena la diferencia de precio entre Platino y Elite?',
    a: 'Depende del uso del auto. Si lo expones a intemperie, polvo o rayones frecuentes, el Elite con sellado de vidrios, plásticos y llantas tiene mucho sentido. Para uso normal en ciudad, el Gold o Platino son excelentes opciones.',
  },
  {
    q: '¿Cuánto tiempo dura el proceso completo?',
    a: 'El proceso completo toma entre 1 y 2 días: la preparación de la pintura es el paso más importante y más largo. Trabajar rápido en esto es una señal de alarma.',
  },
]

export default function ArticleCeramicoCosto() {
  const post = getPost(SLUG)
  if (!post) return notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '¿Cuánto cuesta el sellado cerámico en Concepción? Guía de precios 2026',
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Fullshine Detailing Premium' },
    publisher: {
      '@type': 'Organization',
      name: 'Fullshine Detailing Premium',
      url: 'https://www.fullshine.autos',
      logo: { '@type': 'ImageObject', url: 'https://www.fullshine.autos/logo.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.fullshine.autos/blog/${SLUG}` },
  }

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([schema, schemaFAQ]) }} />
      <SiteNav />
      <WhatsAppButton />

      {/* HERO */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Blog</Link>
            <span className="text-gray-700">/</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">Cerámico</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            ¿Cuánto cuesta el sellado cerámico en Concepción?<br />
            <span className="text-amber-400">Guía de precios 2026</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            Precios reales del mercado, qué incluye cada nivel de servicio y por qué la diferencia de precio importa más de lo que crees.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-white/5 pt-4">
            <span>Fullshine Detailing</span>
            <span>·</span>
            <span>1 de julio, 2026</span>
            <span>·</span>
            <span>6 min de lectura</span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <article className="py-12 px-4">
        <div className="max-w-3xl mx-auto prose-custom">

          <Section>
            <p className="text-gray-300 text-lg leading-relaxed">
              Si buscas "sellado cerámico Concepción" en Google, encontrarás precios que van desde <strong className="text-white">$80.000 hasta $600.000</strong>. Una diferencia enorme. Este artículo explica por qué existe esa diferencia, qué recibes en cada rango y cómo elegir sin arrepentirte.
            </p>
          </Section>

          <Section title="Rangos de precio en Concepción (2026)">
            <p className="text-gray-400 leading-relaxed mb-6">
              El mercado en Concepción y San Pedro de la Paz tiene tres grandes niveles. El precio varía principalmente por la calidad de la cerámica usada, la preparación de la pintura incluida y la experiencia del detailer.
            </p>
            <div className="space-y-4">
              {PRECIOS.map((p, i) => (
                <div key={i} className={`rounded-2xl p-5 border ${i === 2 ? 'bg-amber-500/5 border-amber-500/25' : 'bg-gray-900 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-bold ${i === 2 ? 'text-amber-400' : 'text-white'}`}>{p.nivel}</p>
                    <p className={`font-black text-lg ${i === 2 ? 'text-amber-400' : 'text-white'}`}>{p.rango}</p>
                  </div>
                  <p className="text-gray-400 text-sm">{p.incluye}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="¿De qué depende el precio exacto?">
            <p className="text-gray-400 leading-relaxed mb-4">El precio final de un sellado cerámico varía por cuatro factores principales:</p>
            <div className="space-y-5">
              <Factor
                n="1" title="Tipo de vehículo"
                desc="Un Hatch o Sedan tiene menos superficie a cubrir que un SUV o una camioneta doble cabina. La diferencia de precio entre tipos de vehículo suele ser de $20.000 a $80.000 en el mismo paquete."
              />
              <Factor
                n="2" title="La cerámica que se usa"
                desc='No todas las cerámicas son iguales. Las spray cerámicas cuestan poco y duran poco. Una cerámica de capa como el Nasiol ZR53 (9H de dureza) cuesta más, pero dura 3 a 5 años. Siempre pregunta qué producto específico usan.'
              />
              <Factor
                n="3" title="La preparación de la pintura"
                desc="Este es el factor que más varía entre servicios. Un cerámico serio incluye descontaminación química, remoción de barro bituminoso y pulido de corrección antes de aplicar la cerámica. Si no se hace, el resultado es mediocre."
              />
              <Factor
                n="4" title="Los extras incluidos"
                desc="Sellado de vidrios, plásticos y llantas son servicios adicionales que en paquetes premium vienen incluidos. Cada uno agrega protección a zonas que los cerámicos básicos no cubren."
              />
            </div>
          </Section>

          <Section title="Los paquetes de Fullshine">
            <p className="text-gray-400 leading-relaxed mb-6">
              En Fullshine trabajamos con <strong className="text-white">Nasiol ZR53</strong>, una cerámica alemana de 9H con 3 a 5 años de garantía de duración. Todos nuestros paquetes incluyen descontaminación y pulido previo — sin eso, no aplicamos cerámica.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🥈', name: 'Platino', desde: '$300.000', nota: 'Ideal para autos en buen estado que quieren protección básica de alta calidad.' },
                { icon: '🥇', name: 'Gold', desde: '$350.000', popular: true, nota: 'El más elegido. Agrega sellado de vidrios para visibilidad perfecta bajo la lluvia.' },
                { icon: '👑', name: 'Elite', desde: '$500.000', nota: 'Protección total: pintura, vidrios, plásticos y llantas cubiertos.' },
              ].map(pkg => (
                <div key={pkg.name} className={`rounded-xl p-4 border text-center ${pkg.popular ? 'bg-amber-500/10 border-amber-500/30' : 'bg-gray-900 border-white/5'}`}>
                  <p className="text-2xl mb-1">{pkg.icon}</p>
                  <p className={`font-black text-lg mb-0.5 ${pkg.popular ? 'text-amber-400' : 'text-white'}`}>{pkg.name}</p>
                  <p className={`font-bold text-sm mb-3 ${pkg.popular ? 'text-amber-300/70' : 'text-gray-500'}`}>desde {pkg.desde}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{pkg.nota}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/sellado-ceramico-concepcion"
                className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-full transition-all hover:scale-105 text-sm">
                Ver todos los detalles del cerámico →
              </Link>
            </div>
          </Section>

          <Section title="¿Qué señales advierten un mal servicio?">
            <div className="space-y-3">
              {[
                'Precio muy bajo sin explicar qué cerámica usan',
                'No incluyen pulido antes de aplicar la cerámica',
                'El proceso completo dura menos de un día',
                'No pueden mostrar trabajos anteriores con fotos reales',
                'No especifican la marca y modelo de la cerámica',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3">
                  <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
                  <p className="text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Conclusión">
            <p className="text-gray-300 leading-relaxed">
              El sellado cerámico en Concepción tiene un rango real de <strong className="text-white">$300.000 a $500.000+</strong> para un servicio de calidad que dure años. Por debajo de eso, probablemente estés pagando por una protección temporaria que se irá en meses.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              La pregunta correcta no es "¿cuánto cuesta el cerámico más barato?" sino "¿cuánto quiero que dure la protección y cuántas veces quiero volver a pagar?". Una cerámica de 3-5 años sale mucho más económica a largo plazo que repetir un servicio barato cada año.
            </p>
          </Section>

          {/* FAQ */}
          <Section title="Preguntas frecuentes">
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                  <p className="font-semibold text-white mb-2">{faq.q}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <div className="mt-12 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Fullshine · Concepción</p>
            <h2 className="text-2xl font-black text-white mb-3">¿Quieres un presupuesto exacto para tu auto?</h2>
            <p className="text-gray-400 text-sm mb-6">Reserva online o escríbenos por WhatsApp. Confirmación inmediata.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/reservar"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-full transition-all hover:scale-105">
                Reservar ahora
              </Link>
              <Link href="/sellado-ceramico-concepcion"
                className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3 rounded-full transition-colors">
                Ver paquetes cerámicos
              </Link>
            </div>
          </div>

        </div>
      </article>

      <SiteFooter />
    </div>
  )
}

// ─── Componentes de layout del artículo ──────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      {title && <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>}
      {children}
    </div>
  )
}

function Factor({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 mt-0.5">{n}</span>
      <div>
        <p className="font-semibold text-white mb-1">{title}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
