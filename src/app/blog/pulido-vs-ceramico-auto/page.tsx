import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPost } from '@/lib/blog'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

const SLUG = 'pulido-vs-ceramico-auto'

export const metadata: Metadata = {
  title: 'Pulido vs sellado cerámico: ¿cuál necesita tu auto? — Fullshine',
  description: 'Diferencia real entre pulido y sellado cerámico. Cuándo usar cada uno, si puedes combinarlos y cuál conviene según el estado actual de la pintura de tu auto.',
  alternates: { canonical: `https://www.fullshine.autos/blog/${SLUG}` },
  openGraph: {
    title: 'Pulido vs sellado cerámico: ¿cuál necesita tu auto?',
    description: 'La diferencia real, cuándo usar cada uno y cómo combinarlos.',
    url: `https://www.fullshine.autos/blog/${SLUG}`,
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'article',
  },
}

const COMPARACION = [
  { aspecto: '¿Qué hace?', pulido: 'Corrige defectos de pintura existentes (rayones, hologramas, oxidación)', ceramico: 'Protege la pintura de daños futuros (lluvia, sol, polvo, rayones leves)' },
  { aspecto: '¿Elimina rayones?', pulido: 'Sí, rayones superficiales (capa de barniz)', ceramico: 'No — solo previene que aparezcan nuevos' },
  { aspecto: '¿Agrega brillo?', pulido: 'Sí — recupera el brillo original de fábrica', ceramico: 'Sí — agrega profundidad y efecto espejo al brillo existente' },
  { aspecto: '¿Cuánto dura?', pulido: 'El resultado es permanente hasta que aparezcan nuevos defectos', ceramico: '3 a 5 años con el producto correcto (Nasiol ZR53)' },
  { aspecto: '¿Precio aprox.?', pulido: '$80.000 – $200.000 según nivel', ceramico: '$300.000 – $500.000+ según paquete' },
  { aspecto: '¿Se puede combinar?', pulido: 'Sí — siempre va antes del cerámico', ceramico: 'Sí — rinde mejor sobre una pintura ya pulida' },
]

const FAQ_ITEMS = [
  {
    q: '¿Puedo aplicar cerámica sin pulir primero?',
    a: 'Técnicamente sí, pero no es recomendable. La cerámica sella el estado actual de la pintura. Si hay rayones u hologramas, quedarán atrapados bajo la capa de protección y serán mucho más difíciles de corregir después.',
  },
  {
    q: '¿El pulido daña la pintura?',
    a: 'Un pulido bien hecho en manos de un profesional no daña la pintura. El error ocurre cuando se pule en exceso o con máquinas incorrectas. En Fullshine hacemos un análisis del espesor de la pintura antes de pulir.',
  },
  {
    q: '¿Con qué frecuencia debo pulir mi auto?',
    a: 'Depende del uso. Un auto con cerámica de calidad necesita pulido cada 3-5 años. Sin cerámica, anualmente es razonable si el auto está expuesto a intemperie o tráfico frecuente.',
  },
  {
    q: '¿El pulido quita la cerámica anterior?',
    a: 'Sí. Si tu auto ya tiene cerámica y la quieres renovar, el proceso incluye quitar la capa anterior con un pulido y luego aplicar la nueva cerámica. Por eso elegir una cerámica de larga duración desde el inicio es importante.',
  },
]

export default function ArticlePulidoVsCeramico() {
  const post = getPost(SLUG)
  if (!post) return notFound()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Pulido vs sellado cerámico: ¿cuál necesita tu auto?',
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
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">Pintura</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            Pulido vs sellado cerámico:<br />
            <span className="text-amber-400">¿cuál necesita tu auto?</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            La diferencia real entre ambos servicios, cuándo usar cada uno y por qué lo ideal es combinarlos en ese orden.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-white/5 pt-4">
            <span>Fullshine Detailing</span>
            <span>·</span>
            <span>8 de julio, 2026</span>
            <span>·</span>
            <span>5 min de lectura</span>
          </div>
        </div>
      </section>

      {/* CONTENIDO */}
      <article className="py-12 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-10">
            <p className="text-gray-300 text-lg leading-relaxed">
              La confusión entre pulido y cerámico es muy común — y costosa si eliges mal. Son servicios completamente distintos que hacen cosas distintas. Este artículo lo explica sin rodeos.
            </p>
          </div>

          {/* Explicación simple */}
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Pulido</p>
              <p className="text-2xl font-black text-white mb-3">Corrige el pasado</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                El pulido <strong className="text-white">elimina defectos existentes</strong> en la pintura: rayones superficiales, hologramas de lavados mal hechos, oxidación leve y pérdida de brillo. Es un proceso abrasivo controlado que remueve una microce de la capa de barniz.
              </p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Cerámico</p>
              <p className="text-2xl font-black text-white mb-3">Protege el futuro</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                El cerámico <strong className="text-white">no corrige nada</strong> — crea una capa dura encima de la pintura que protege de lluvia ácida, polvo, savia de árbol, rayones leves y rayos UV. Es como un escudo transparente.
              </p>
            </div>
          </div>

          {/* Cuándo usar cada uno */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">¿Cuándo usar cada uno?</h2>
            <div className="space-y-4">
              <Scenario
                emoji="🔵"
                title="Solo pulido — cuando la pintura tiene defectos y no quieres protección larga"
                desc="Tu auto tiene rayones, marcas de espejo retrovisor de otros autos o pérdida de brillo general. Quieres recuperar el aspecto original sin invertir en protección cerámica."
              />
              <Scenario
                emoji="🟡"
                title="Solo cerámico — cuando la pintura está perfecta y quieres mantenerla así"
                desc="Tu auto es nuevo, o acaba de salir de fábrica / concesionario. La pintura está impecable. El cerámico sellaría esa perfección y la mantendría así por años."
              />
              <Scenario
                emoji="⭐"
                title="Pulido + cerámico — la combinación ideal (la más recomendada)"
                desc="Primero corriges todos los defectos existentes con el pulido, dejando la pintura en su mejor estado posible. Luego el cerámico sella esa perfección y la protege. Este es el servicio completo de Fullshine."
                highlight
              />
            </div>
          </div>

          {/* Tabla comparativa */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Comparación directa</h2>
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 border-b border-white/5">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium w-1/3">Aspecto</th>
                    <th className="text-left px-4 py-3 text-blue-400 font-bold w-1/3">Pulido</th>
                    <th className="text-left px-4 py-3 text-amber-400 font-bold w-1/3">Cerámico</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARACION.map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/50'}`}>
                      <td className="px-4 py-3 text-gray-500">{row.aspecto}</td>
                      <td className="px-4 py-3 text-gray-300">{row.pulido}</td>
                      <td className="px-4 py-3 text-gray-300">{row.ceramico}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* El orden importa */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">El orden importa: siempre pulido primero</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Si decides hacer ambos, el orden es fijo y no se puede invertir. Primero el pulido, después el cerámico. ¿Por qué?
            </p>
            <div className="space-y-3">
              {[
                'La cerámica sella permanentemente el estado de la pintura. Si hay defectos debajo, quedan encapsulados.',
                'El pulido es un proceso abrasivo. Si lo haces después del cerámico, destruyes la capa de protección.',
                'Una pintura perfectamente pulida absorbe mejor la cerámica, logrando mejor adhesión y mayor duración.',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-gray-900 border border-white/5 rounded-xl px-4 py-3">
                  <span className="text-amber-400 shrink-0 mt-0.5 font-black">{i + 1}</span>
                  <p className="text-gray-300 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="mb-10 bg-gray-900 border border-white/5 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">¿Cómo saber qué necesita tu auto?</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Responde estas preguntas:</p>
            <div className="space-y-3">
              <DiagQuestion
                q="¿Tu auto tiene rayones visibles bajo la luz directa del sol?"
                a="Sí → necesitas pulido (mínimo), idealmente pulido + cerámico"
              />
              <DiagQuestion
                q="¿La pintura se ve opaca o sin profundidad?"
                a="Sí → necesitas pulido para recuperar el brillo antes de cualquier cerámico"
              />
              <DiagQuestion
                q="¿Tu auto es nuevo o con la pintura impecable?"
                a="Sí → cerámico solo es suficiente para proteger ese estado"
              />
              <DiagQuestion
                q="¿Quieres protección larga y no lavar tan seguido?"
                a="Sí → cerámico de calidad (Nasiol ZR53) es la solución correcta"
              />
            </div>
          </div>

          {/* Links a servicios */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Ver los servicios en detalle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/pulido-auto-concepcion"
                className="block bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl p-5 transition-all group">
                <p className="font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                  Pulido y corrección de pintura →
                </p>
                <p className="text-gray-400 text-sm">Tipos de pulido disponibles, proceso y precios según estado de la pintura.</p>
              </Link>
              <Link href="/sellado-ceramico-concepcion"
                className="block bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-5 transition-all group">
                <p className="font-bold text-white group-hover:text-amber-400 transition-colors mb-2">
                  Sellado cerámico Nasiol ZR53 →
                </p>
                <p className="text-gray-400 text-sm">Paquetes Platino, Gold y Elite con protección de 3 a 5 años.</p>
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="bg-gray-900 border border-white/5 rounded-2xl p-5">
                  <p className="font-semibold text-white mb-2">{faq.q}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">Fullshine · Concepción</p>
            <h2 className="text-2xl font-black text-white mb-3">¿No sabes cuál necesita tu auto?</h2>
            <p className="text-gray-400 text-sm mb-6">Escríbenos por WhatsApp con una foto y te decimos qué servicio tiene más sentido para tu caso.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/reservar"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-3 rounded-full transition-all hover:scale-105">
                Reservar ahora
              </Link>
              <Link href="/blog"
                className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3 rounded-full transition-colors">
                ← Ver todos los artículos
              </Link>
            </div>
          </div>

        </div>
      </article>

      <SiteFooter />
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Scenario({ emoji, title, desc, highlight }: { emoji: string; title: string; desc: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? 'bg-amber-500/5 border-amber-500/25' : 'bg-gray-900 border-white/5'}`}>
      <p className={`font-bold mb-2 ${highlight ? 'text-amber-400' : 'text-white'}`}>
        {emoji} {title}
      </p>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function DiagQuestion({ q, a }: { q: string; a: string }) {
  return (
    <div className="border border-white/5 rounded-xl px-4 py-3">
      <p className="text-white text-sm font-semibold mb-1">{q}</p>
      <p className="text-amber-400 text-sm">{a}</p>
    </div>
  )
}
