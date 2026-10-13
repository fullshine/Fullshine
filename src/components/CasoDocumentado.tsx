import Link from 'next/link'

const VIDEOS = [
  {
    step: '01',
    title: 'La revisión inicial',
    description: 'El cliente comparte la revisión con Juan antes del trabajo y presenta el caso que llegó a Fullshine.',
    url: 'https://www.instagram.com/p/DeKcJAfTg1S/',
    embed: 'https://www.instagram.com/p/DeKcJAfTg1S/embed/',
  },
  {
    step: '02',
    title: 'El resultado y la entrega',
    description: 'En la segunda publicación, el cliente muestra cómo recibió su vehículo y cuenta su experiencia con Fullshine.',
    url: 'https://www.instagram.com/p/DeNygSnNz1-/',
    embed: 'https://www.instagram.com/p/DeNygSnNz1-/embed/',
  },
]

export default function CasoDocumentado() {
  return (
    <section id="caso-documentado" aria-labelledby="caso-titulo" className="bg-gray-900/50 border-y border-white/10 px-4 py-14 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Un caso real · Concepción</p>
          <h2 id="caso-titulo" className="mt-3 text-3xl sm:text-4xl font-bold text-white">De la revisión al resultado</h2>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Ale Ormeño compartió en Instagram la revisión de su vehículo con Juan y, después,
            el resultado del trabajo en Fullshine. Dos publicaciones del mismo caso para conocer el punto de partida y la entrega.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {VIDEOS.map(video => (
            <article key={video.step} className="min-w-0 rounded-2xl border border-white/10 bg-gray-950 p-4 sm:p-6">
              <p className="text-sm font-bold text-amber-400">{video.step}</p>
              <h3 className="mt-2 text-xl font-bold text-white">{video.title}</h3>
              <p className="mt-2 mb-5 text-sm text-gray-300 leading-relaxed">{video.description}</p>
              <iframe src={video.embed} title={video.title + ' · Caso Fullshine en Instagram'}
                loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                className="block w-full h-[570px] sm:h-[620px] rounded-xl border-0 bg-white" />
              <a href={video.url} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-amber-400 underline underline-offset-4 hover:text-amber-300">
                Ver publicación original en Instagram ↗
              </a>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-7 md:grid-cols-2">
          <div>
            <h3 className="font-bold text-white">La experiencia, contada por el cliente</h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              En su publicación del resultado, Ale relata que el trabajo tomó un día y medio
              y expresa su satisfacción con la entrega. Ese tiempo corresponde a este caso;
              la duración de cada servicio depende del vehículo y del trabajo necesario.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white">¿Quieres saber qué necesita tu pintura?</h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">Comienza con una evaluación. Te explicamos las alternativas y los límites del tratamiento antes de recomendarlo.</p>
            <Link href="/revision-gratis-concepcion" className="mt-4 inline-block rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-black hover:bg-amber-400">
              Agendar diagnóstico gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
