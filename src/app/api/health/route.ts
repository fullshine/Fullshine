import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Chequeo de salud para monitoreo externo.
 *
 * Devuelve 200 si la base responde y 503 si no. Está pensado para apuntarle
 * un monitor gratuito (UptimeRobot y similares) cada 5 minutos: así te enteras
 * tú de una caída y no un cliente que quiso reservar.
 *
 * Es público a propósito — un monitor no puede autenticarse — así que NO
 * expone versiones, nombres de tablas, cadenas de conexión ni mensajes de
 * error internos. Solo si está vivo o no.
 */
export async function GET() {
  const inicio = Date.now()

  try {
    const supabase = createAdminClient()

    // Consulta mínima: cuenta filas sin traer datos. Toca la base de verdad
    // pero no mueve información de clientes.
    const { error } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      return NextResponse.json(
        { ok: false, base: 'sin respuesta', ms: Date.now() - inicio },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }

    return NextResponse.json(
      { ok: true, base: 'operativa', ms: Date.now() - inicio },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json(
      { ok: false, base: 'sin respuesta', ms: Date.now() - inicio },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
