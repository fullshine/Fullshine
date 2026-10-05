import Link from 'next/link'

export default function CeramicYearPromo() {
  return (
    <aside aria-label="Promoción de tratamiento cerámico de 1 año"
      className="rounded-2xl border border-amber-400/40 bg-gray-950/90 px-5 py-5 text-center shadow-lg shadow-amber-500/10">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Promoción Fullshine</p>
      <p className="mt-2 text-4xl font-black text-amber-400 md:text-5xl">50% de descuento</p>
      <p className="mt-2 text-lg font-semibold text-white">En tratamiento cerámico de 1 año</p>
      <p className="mt-1 text-sm text-gray-300">Protección Nasiol Metal Coat.</p>
      <Link href="/reservar?categoria=ceramico"
        className="mt-4 inline-block rounded-full bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400">
        Reservar cerámico de 1 año
      </Link>
    </aside>
  )
}
