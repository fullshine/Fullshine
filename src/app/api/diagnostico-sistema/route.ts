import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Diagnóstico del sistema.
 *
 * Revisa de una sola pasada las tres cosas que han venido fallando:
 *   1. Qué columnas tienen realmente las tablas
 *   2. Qué estados acepta la columna `status` de bookings
 *   3. Si Green API está conectado y con credenciales válidas
 *
 * Uso:
 *   curl.exe -H "Authorization: Bearer TU_CRON_SECRET" \
 *     https://www.fullshine.autos/api/diagnostico-sistema
 */

const ESTADOS_KANBAN = [
  'pending', 'payment_received', 'confirmed',
  'in_progress', 'completed', 'review_sent', 'cancelled',
]

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const out: Record<string, unknown> = { momento: new Date().toISOString() }

  // ── 1. Columnas reales de cada tabla ────────────────────────────────────
  const columnas: Record<string, string[] | string> = {}
  for (const tabla of ['bookings', 'vehicles', 'customers', 'services', 'maintenance_schedule']) {
    const { data, error } = await supabase.from(tabla).select('*').limit(1)
    if (error) columnas[tabla] = `ERROR: ${error.message}`
    else if (!data?.length) columnas[tabla] = '(tabla vacía, sin filas para inspeccionar)'
    else columnas[tabla] = Object.keys(data[0]).sort()
  }
  out.columnas = columnas

  // ── 2. Qué estados acepta bookings.status ───────────────────────────────
  // Se prueba cada estado contra un id inexistente: si el valor no es válido,
  // Postgres responde antes de buscar la fila. Nunca modifica datos reales.
  const estados: Record<string, string> = {}
  const idFalso = '00000000-0000-4000-8000-000000000000'
  for (const estado of ESTADOS_KANBAN) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: estado })
      .eq('id', idFalso)
    estados[estado] = error ? `RECHAZADO: ${error.message}` : 'aceptado'
  }
  out.estados_permitidos = estados

  // ── 3. Green API ────────────────────────────────────────────────────────
  const instancia = process.env.GREEN_API_INSTANCE_ID
  const token = process.env.GREEN_API_TOKEN
  const apiUrl = process.env.GREEN_API_URL ?? 'https://7107.api.greenapi.com'

  if (!instancia || !token) {
    out.green_api = {
      configurado: false,
      detalle: 'Faltan GREEN_API_INSTANCE_ID o GREEN_API_TOKEN en las variables de entorno',
    }
  } else {
    try {
      const res = await fetch(`${apiUrl}/waInstance${instancia}/getStateInstance/${token}`)
      const cuerpo = await res.text()
      out.green_api = {
        configurado: true,
        http: res.status,
        // 'authorized' = todo bien. 'notAuthorized' = hay que reescanear el QR.
        respuesta: cuerpo.substring(0, 300),
      }
    } catch (e) {
      out.green_api = { configurado: true, error: (e as Error).message }
    }
  }

  // ── 4. Otras variables críticas (solo si existen, nunca su valor) ───────
  out.variables = Object.fromEntries(
    [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'GREEN_API_INSTANCE_ID',
      'GREEN_API_TOKEN',
      'NEXT_PUBLIC_META_PIXEL_ID',
      'CRON_SECRET',
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_BRANCH_PHONE',
    ].map(k => [k, process.env[k] ? 'definida' : 'FALTA'])
  )

  return NextResponse.json(out, { status: 200 })
}
