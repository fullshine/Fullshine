'use client'

import { useState, useRef, useTransition } from 'react'
import { postular } from '@/actions/postulaciones'

const AREAS = [
  'Detailing y corrección de pintura',
  'Lavado y preparación',
  'Limpieza de interiores y tapiz',
  'Atención de clientes / administración',
  'Otra',
]

const COMUNAS = [
  'Concepción', 'San Pedro de la Paz', 'Chiguayante',
  'Talcahuano', 'Hualpén', 'Otra',
]

export default function PostulacionForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [enviado, setEnviado] = useState(false)
  const [archivo, setArchivo] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const datos = new FormData(e.currentTarget)

    startTransition(async () => {
      const r = await postular(datos)
      if (!r.success) { setError(r.error ?? 'Error al enviar'); return }
      setEnviado(true)
      formRef.current?.reset()
      setArchivo(null)
    })
  }

  if (enviado) {
    return (
      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-10 text-center">
        <p className="text-4xl mb-4" aria-hidden>✅</p>
        <h3 className="text-2xl font-black text-white mb-3">Postulación recibida</h3>
        <p className="text-white/60 leading-relaxed">
          Gracias por tu interés en Fullshine. Revisamos todas las postulaciones
          y te contactamos por WhatsApp si tu perfil calza con lo que buscamos.
        </p>
        <button
          onClick={() => setEnviado(false)}
          className="mt-7 text-sm font-medium text-amber-400 underline underline-offset-4"
        >
          Enviar otra postulación
        </button>
      </div>
    )
  }

  const campo = 'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/25 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
  const etiqueta = 'block text-sm font-medium text-white/70 mb-1.5'

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={etiqueta}>Nombre completo *</label>
          <input id="full_name" name="full_name" required className={campo} placeholder="Juan Pérez" />
        </div>
        <div>
          <label htmlFor="phone" className={etiqueta}>WhatsApp *</label>
          <input id="phone" name="phone" type="tel" required className={campo} placeholder="9 1234 5678" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={etiqueta}>
            Correo <span className="font-normal text-white/30">(opcional)</span>
          </label>
          <input id="email" name="email" type="email" className={campo} placeholder="juan@correo.com" />
        </div>
        <div>
          <label htmlFor="comuna" className={etiqueta}>¿Dónde vives?</label>
          <select id="comuna" name="comuna" className={campo} defaultValue="">
            <option value="" disabled>Selecciona…</option>
            {COMUNAS.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="area" className={etiqueta}>¿En qué te gustaría trabajar?</label>
        <select id="area" name="area" className={campo} defaultValue="">
          <option value="" disabled>Selecciona…</option>
          {AREAS.map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="experiencia" className={etiqueta}>
          Cuéntanos de ti
        </label>
        <textarea
          id="experiencia" name="experiencia" rows={4} className={`${campo} resize-none`}
          placeholder="¿Tienes experiencia en detailing, lavado o rubro automotriz? ¿Qué te interesa de este trabajo? No importa si recién partes: cuéntanos igual."
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="tiene_licencia"
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-500" />
        <span className="text-sm text-white/60">
          Tengo licencia de conducir clase B vigente
        </span>
      </label>

      {/* CV */}
      <div>
        <label htmlFor="cv" className={etiqueta}>
          Currículum <span className="font-normal text-white/30">(opcional, máx. 5 MB)</span>
        </label>
        <input
          id="cv" name="cv" type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={e => setArchivo(e.target.files?.[0]?.name ?? null)}
          className="block w-full text-sm text-white/50 file:mr-4 file:rounded-full file:border-0 file:bg-amber-500 file:px-5 file:py-2.5 file:text-sm file:font-bold file:text-black hover:file:bg-amber-400 file:cursor-pointer cursor-pointer"
        />
        <p className="mt-2 text-xs text-white/35">
          {archivo
            ? `Seleccionado: ${archivo}`
            : 'PDF, Word o una foto del documento. Si no tienes CV a mano, igual puedes postular.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-amber-500 py-4 font-black text-black transition-all hover:bg-amber-400 disabled:opacity-50">
        {pending ? 'Enviando…' : 'ENVIAR POSTULACIÓN'}
      </button>

      <p className="text-xs leading-relaxed text-white/35">
        Tus datos se usan solo para evaluar tu postulación y no se comparten con
        terceros. Puedes pedirnos que los eliminemos cuando quieras.{' '}
        <a href="/politica-privacidad" target="_blank" rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-white/60">
          Política de privacidad
        </a>
      </p>
    </form>
  )
}
