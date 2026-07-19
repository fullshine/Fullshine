import Link from 'next/link'
import { Metadata } from 'next'
import { POSTS } from '@/lib/blog'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppButton from '@/components/WhatsAppButton'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Blog de Detailing | Consejos y guías — Fullshine Concepción',
  description: 'Guías y consejos sobre detailing, sellado cerámico, pulido y cuidado del auto en Concepción. Todo lo que necesitas saber antes de reservar.',
  alternates: { canonical: 'https://www.fullshine.autos/blog' },
  openGraph: {
    title: 'Blog Fullshine — Detailing en Concepción',
    description: 'Guías reales sobre sellado cerámico, pulido y cuidado del auto en Concepción.',
    url: 'https://www.fullshine.autos/blog',
    siteName: 'Fullshine Detailing Premium',
    locale: 'es_CL',
    type: 'website',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />
      <WhatsAppButton />

      <section className="pt-32 pb-16 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-4">Fullshine · Concepción</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4">Blog de Detailing</h1>
          <p className="text-gray-400 text-lg">Guías honestas sobre sellado cerámico, pulido y cuidado del auto. Sin marketing vacío.</p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {POSTS.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="block bg-gray-900 border border-white/5 hover:border-amber-500/25 rounded-2xl p-6 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
                  {post.category}
                </span>
                <span className="text-gray-600 text-xs">{formatDate(post.date)}</span>
                <span className="text-gray-600 text-xs">· {post.readingTime} de lectura</span>
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{post.description}</p>
              <p className="mt-4 text-amber-500 text-sm font-semibold group-hover:translate-x-1 transition-transform inline-block">
                Leer artículo →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 text-center border-t border-white/5">
        <div className="max-w-lg mx-auto">
          <p className="text-gray-400 mb-4">¿Listo para el servicio?</p>
          <Link href="/reservar"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-4 rounded-full transition-all hover:scale-105">
            Reservar en Fullshine
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
