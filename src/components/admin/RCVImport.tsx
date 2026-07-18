'use client'

import { useState, useRef, useTransition } from 'react'
import { saveRCVData, clearRCVData } from '@/actions/tax'

interface RCVRow {
  nro: string
  razonSocial: string
  folio: string
  fechaDocto: string
  montoNeto: number
  ivaRecuperable: number
  montoTotal: number
}

function fmtCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function parseCSV(text: string): RCVRow[] {
  const lines = text.trim().split('\n').slice(1) // skip header
  return lines.map(line => {
    const cols = line.split(';')
    return {
      nro:            cols[0]?.trim() ?? '',
      razonSocial:    cols[3]?.trim() ?? '',
      folio:          cols[4]?.trim() ?? '',
      fechaDocto:     cols[5]?.trim() ?? '',
      montoNeto:      parseInt(cols[9]?.trim()  || '0') || 0,
      ivaRecuperable: parseInt(cols[10]?.trim() || '0') || 0,
      montoTotal:     parseInt(cols[13]?.trim() || '0') || 0,
    }
  }).filter(r => r.razonSocial)
}

export default function RCVImport({
  onIVAChange,
  month,
  initialFileName = null,
}: {
  onIVAChange: (iva: number) => void
  month: string
  initialFileName?: string | null
}) {
  const [rows, setRows]       = useState<RCVRow[]>([])
  const [fileName, setFileName] = useState<string | null>(initialFileName)
  const [error, setError]     = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [, startTransition]   = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const totalNeto  = rows.reduce((s, r) => s + r.montoNeto, 0)
  const totalIVA   = rows.reduce((s, r) => s + r.ivaRecuperable, 0)
  const totalTotal = rows.reduce((s, r) => s + r.montoTotal, 0)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) { setError('El archivo debe ser .csv'); return }

    setError(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const text = ev.target?.result as string
        const parsed = parseCSV(text)
        if (parsed.length === 0) { setError('No se encontraron registros en el archivo'); return }
        setRows(parsed)
        const ivaTotal = parsed.reduce((s, r) => s + r.ivaRecuperable, 0)
        onIVAChange(ivaTotal)
        // Guardar en DB automáticamente para persistir entre navegaciones
        setSaving(true)
        startTransition(async () => {
          await saveRCVData(month, ivaTotal, file.name)
          setSaving(false)
        })
      } catch {
        setError('Error al leer el archivo — verifica que sea el RCV de compras del SII')
      }
    }
    reader.readAsText(file, 'latin1')
  }

  function handleClear() {
    setRows([])
    setFileName(null)
    setError(null)
    onIVAChange(0)
    if (inputRef.current) inputRef.current.value = ''
    startTransition(async () => {
      await clearRCVData(month)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">RCV Compras — SII</p>
            {saving && <span className="text-xs text-gray-400">Guardando…</span>}
            {!saving && fileName && rows.length === 0 && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                📂 {fileName} — sube el archivo para ver los detalles
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {fileName && rows.length > 0
              ? `✓ ${fileName}`
              : fileName
              ? 'IVA crédito guardado del mes anterior'
              : 'Sube el archivo CSV del Registro de Compras del SII'}
          </p>
        </div>
        {rows.length > 0 ? (
          <button onClick={handleClear}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            Limpiar
          </button>
        ) : (
          <label className="cursor-pointer text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 font-medium">
            + Subir CSV
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {rows.length === 0 && !error && (
        <div className="px-4 py-8 text-center">
          <p className="text-2xl mb-2">📂</p>
          <p className="text-sm text-gray-500 font-medium">¿Cómo descargo el archivo?</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
            SII → Servicios Online → Registro de Compras y Ventas → Registro de Compras → Exportar CSV
          </p>
          <label className="mt-4 inline-block cursor-pointer text-sm px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:bg-gray-50">
            Seleccionar archivo CSV
            <input ref={inputRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
        </div>
      )}

      {rows.length > 0 && (
        <>
          {/* Resumen IVA destacado */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50 border-b border-gray-100">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-gray-400">Documentos</p>
              <p className="text-lg font-black text-gray-800">{rows.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-gray-400">Neto total</p>
              <p className="text-lg font-black text-gray-800">{fmtCLP(totalNeto)}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-green-600 font-semibold">IVA Crédito</p>
              <p className="text-lg font-black text-green-600">{fmtCLP(totalIVA)}</p>
            </div>
          </div>

          {/* Tabla de compras */}
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">#</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">Proveedor</th>
                  <th className="text-left px-3 py-2 text-gray-500 font-medium">Fecha</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium">Neto</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium text-green-600">IVA</th>
                  <th className="text-right px-3 py-2 text-gray-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-400">{row.nro}</td>
                    <td className="px-3 py-2 text-gray-700 max-w-[140px] truncate">{row.razonSocial}</td>
                    <td className="px-3 py-2 text-gray-500">{row.fechaDocto}</td>
                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{fmtCLP(row.montoNeto)}</td>
                    <td className="px-3 py-2 text-right text-green-600 font-semibold tabular-nums">{fmtCLP(row.ivaRecuperable)}</td>
                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{fmtCLP(row.montoTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-white border-t-2 border-gray-200">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-xs font-bold text-gray-600">Total</td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-gray-800 tabular-nums">{fmtCLP(totalNeto)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-green-600 tabular-nums">{fmtCLP(totalIVA)}</td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-gray-800 tabular-nums">{fmtCLP(totalTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
