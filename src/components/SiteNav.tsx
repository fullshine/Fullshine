import Link from 'next/link'
import Image from 'next/image'

export default function SiteNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image src="/logo.png" alt="Fullshine" width={40} height={40} className="rounded-full" />
          <div className="hidden sm:block">
            <p className="font-bold text-white leading-none tracking-wide text-sm">FULLSHINE</p>
            <p className="text-xs text-gray-400 tracking-widest uppercase">Detailing Premium</p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/#servicios" className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors">
            Ver todos los servicios
          </Link>
          <Link
            href="/reservar"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-5 py-2 rounded-full transition-colors shrink-0"
          >
            Reservar
          </Link>
        </div>
      </div>
    </nav>
  )
}
