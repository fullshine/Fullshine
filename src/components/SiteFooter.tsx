import Link from 'next/link'
import Image from 'next/image'

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-10 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Fullshine" width={36} height={36} className="rounded-full" />
          <div>
            <p className="font-bold text-sm text-white">FULLSHINE Detailing Premium</p>
            <a
              href="https://maps.google.com/?q=Camilo+Henriquez+381,+Concepci%C3%B3n"
              target="_blank" rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Camilo Henríquez 381, Concepción
            </a>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500">
          <a href="https://wa.me/56933654943" target="_blank" rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400 transition-colors">
            +56 9 3365 4943
          </a>
          <span className="mx-2">·</span>
          <a href="mailto:fullshinechile@gmail.com" className="hover:text-gray-300 transition-colors">
            fullshinechile@gmail.com
          </a>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Fullshine. Todos los derechos reservados.</p>
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </footer>
  )
}
