'use client'

import { useState, useRef, useTransition } from 'react'
import {
  subirDocumento, eliminarDocumento, getEnlaceDocumento,
  type Socio, type Documento,
} from '@/actions/socios'
import { formatCurrency } from '@/lib/utils'

const TIPOS = [
  { v: 'factura', l: '🧾 Factura' },
  { v: 'foto',    l: '📷 Registro fotográfico' },
  { v: 'informe', l: '📋 Informe' },
  { v: 'otro',    l: '📎 Otro' },
]

export default function SociosPanel({
  socios, documentos, socioActivo,
}: {
  socios: Socio[]
  documentos: Documento[]
  socioActivo: string
}) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [tipo, setTipo] = useState('factura')
  const [archivos, setArchivos] = useState<number>(0)
  const formRef = useRef<HTMLFormElement>(null)

  const socio = socios.find(s => s.id === socioActivo) ?? socios[0]

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const datos = new FormData(e.currentTarget)
    setMsg('Subiendo…')
    startTransition(async () => {
      const r = await subirDocumento(datos)
      if (!r.success) { setMsg(`Error: ${r.error}`); return }
      setMsg('✅ Documento cargado')
      formRef.current?.reset()
      setArchivos(0)
    })
  }

  function abrir(path: string) {
    startTransition(async () => {
      const r = await getEnlaceDocumento(path)
      if (!r.success || !r.url) { setMsg(`Error: ${r.error}`); return }
      window.open(r.url, '_blank', 'noopener')
    })
  }

  function borrar(id: string, titulo: string) {
    if (!confirm(`¿Eliminar "${titulo}"? El archivo se borra definitivamente.`)) return
    startTransition(async () => {
      const r = await eliminarDocumento(id)
      setMsg(r.success ? 'Documento eliminado' : `Error: ${r.error}`)
    })
  }

  const campo = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

  if (socios.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        No hay socios registrados. Ejecuta <code>supabase/22_portal_socios.sql</code> en Supabase.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Formulario de carga */}
      <form ref={formRef} onSubmit={onSubmit}
        className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-bold text-gray-900">Subir documento</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Socio</label>
            <select name="partner_id" defaultValue={socio?.id} className={campo} required>
              {socios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
            <select name="tipo" value={tipo} onChange={e => setTipo(e.target.value)} className={campo}>
              {TIPOS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Título *</label>
          <input name="titulo" className={campo} required
            placeholder={tipo === 'factura' ? 'Factura semana del 12 al 16 de agosto' : 'Antes y después — Peugeot 3008'} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Patente <span className="text-gray-400">(opcional)</span>
            </label>
            <input name="patente" className={`${campo} uppercase`} placeholder="ABCD12" />
          </div>
          {tipo === 'factura' && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Período</label>
                <input name="periodo" className={campo} placeholder="2026-08" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Monto</label>
                <input name="monto_clp" className={campo} placeholder="450000" inputMode="numeric" />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción <span className="text-gray-400">(opcional)</span>
          </label>
          <textarea name="descripcion" rows={2} className={`${campo} resize-none`} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Archivos * <span className="text-gray-400">(máx. 10 MB c/u · puedes seleccionar varios)</span>
          </label>
          <input name="archivos" type="file" multiple required
            accept=".pdf,.xml,.jpg,.jpeg,.png,.webp,.xlsx"
            onChange={e => setArchivos(e.target.files?.length ?? 0)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:cursor-pointer cursor-pointer" />
          {archivos > 1 && (
            <p className="mt-1.5 text-xs text-gray-500">
              {archivos} archivos seleccionados. Cada uno se guarda por separado.
            </p>
          )}
        </div>

        <button type="submit" disabled={pending}
          className="w-full rounded-lg bg-brand-500 py-2.5 font-bold text-white disabled:opacity-50">
          {pending ? 'Subiendo…' : 'Subir'}
        </button>

        {msg && <p className="text-center text-sm text-gray-600">{msg}</p>}
      </form>

      {/* Listado */}
      <div>
        <h2 className="mb-3 font-bold text-gray-900">
          Documentos cargados <span className="text-gray-400">({documentos.length})</span>
        </h2>

        {documentos.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Todavía no hay documentos.
          </div>
        ) : (
          <div className="space-y-2">
            {documentos.map(d => (
              <div key={d.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <span className="text-xl" aria-hidden>
                  {TIPOS.find(t => t.v === d.tipo)?.l.split(' ')[0] ?? '📎'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{d.titulo}</p>
                  <p className="text-xs text-gray-500">
                    {d.created_at.substring(0, 10)}
                    {d.periodo && ` · ${d.periodo}`}
                    {d.patente && ` · ${d.patente}`}
                    {d.monto_clp ? ` · ${formatCurrency(d.monto_clp)}` : ''}
                  </p>
                </div>
                <button disabled={pending} onClick={() => abrir(d.file_path)}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 disabled:opacity-50">
                  Ver
                </button>
                <button disabled={pending} onClick={() => borrar(d.id, d.titulo)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 disabled:opacity-50">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
