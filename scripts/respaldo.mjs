#!/usr/bin/env node
/**
 * Respaldo completo de la base de datos a tu computador.
 *
 *   node scripts/respaldo.mjs
 *
 * Descarga todas las tablas a `respaldos/AAAA-MM-DD/` en formato JSON y CSV.
 * El JSON sirve para restaurar; el CSV para abrirlo en Excel y revisar.
 *
 * Por qué existe: el plan gratuito de Supabase no hace respaldos. Si esa base
 * se corrompe o la cuenta se pierde, no hay de dónde recuperar los clientes,
 * las reservas ni los certificados de garantía.
 *
 * La carpeta `respaldos/` está en .gitignore: contiene teléfonos, correos y
 * patentes de clientes reales y NO debe subirse nunca a GitHub.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')

// Tablas a respaldar. Si creas una nueva, agrégala acá.
const TABLAS = [
  'customers',
  'vehicles',
  'services',
  'service_prices',
  'bookings',
  'booking_changes',
  'certificates',
  'maintenance_schedule',
  'expenses',
  'tax_periods',
  'partners',
  'partner_documents',
  'job_applications',
  'booking_drafts',
  'subscriptions',
  'subscription_vehicles',
  'subscription_washes',
  'subscription_extras',
  'app_config',
]

/** Cuántas carpetas de respaldo conservar antes de ir borrando las viejas. */
const CONSERVAR = 8

function leerEnv() {
  const ruta = join(RAIZ, '.env.local')
  if (!existsSync(ruta)) {
    console.error('✗ No encontré .env.local en', RAIZ)
    process.exit(1)
  }
  const env = {}
  for (const linea of readFileSync(ruta, 'utf8').split('\n')) {
    const limpia = linea.trim()
    if (!limpia || limpia.startsWith('#')) continue
    const i = limpia.indexOf('=')
    if (i === -1) continue
    env[limpia.slice(0, i).trim()] = limpia.slice(i + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

/** Convierte filas a CSV escapando comillas y saltos de línea. */
function aCsv(filas) {
  if (filas.length === 0) return ''
  const columnas = [...new Set(filas.flatMap(f => Object.keys(f)))]
  const celda = v => {
    if (v === null || v === undefined) return ''
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [
    columnas.join(','),
    ...filas.map(f => columnas.map(c => celda(f[c])).join(',')),
  ].join('\n')
}

/** Trae una tabla completa paginando de a 1000 filas. */
async function descargar(url, key, tabla) {
  const filas = []
  const porPagina = 1000

  for (let desde = 0; ; desde += porPagina) {
    const r = await fetch(`${url}/rest/v1/${tabla}?select=*`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Range: `${desde}-${desde + porPagina - 1}`,
      },
    })

    if (r.status === 404 || r.status === 400) return { omitida: true, filas: [] }
    if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)

    const lote = await r.json()
    filas.push(...lote)
    if (lote.length < porPagina) break
  }
  return { omitida: false, filas }
}

function limpiarViejos(dirBase) {
  const carpetas = readdirSync(dirBase, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^\d{4}-\d{2}-\d{2}/.test(d.name))
    .map(d => d.name)
    .sort()
    .reverse()

  for (const vieja of carpetas.slice(CONSERVAR)) {
    rmSync(join(dirBase, vieja), { recursive: true, force: true })
    console.log(`  · eliminado respaldo antiguo ${vieja}`)
  }
}

async function main() {
  const env = leerEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error('✗ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
    process.exit(1)
  }

  const sello = new Date().toLocaleString('sv-SE', { timeZone: 'America/Santiago' })
    .replace(' ', '_').replace(/:/g, '-')
  const dirBase = join(RAIZ, 'respaldos')
  const destino = join(dirBase, sello)
  mkdirSync(destino, { recursive: true })

  console.log(`\nRespaldo Fullshine — ${sello}\n`)

  const resumen = []
  let fallos = 0

  for (const tabla of TABLAS) {
    try {
      const { omitida, filas } = await descargar(url, key, tabla)

      if (omitida) {
        console.log(`  ~ ${tabla.padEnd(24)} no existe, se omite`)
        continue
      }

      writeFileSync(join(destino, `${tabla}.json`), JSON.stringify(filas, null, 2), 'utf8')
      if (filas.length > 0) {
        writeFileSync(join(destino, `${tabla}.csv`), aCsv(filas), 'utf8')
      }

      console.log(`  ✓ ${tabla.padEnd(24)} ${String(filas.length).padStart(5)} filas`)
      resumen.push({ tabla, filas: filas.length })
    } catch (e) {
      console.error(`  ✗ ${tabla.padEnd(24)} ${e.message}`)
      fallos++
    }
  }

  writeFileSync(
    join(destino, '_resumen.json'),
    JSON.stringify({ fecha: sello, tablas: resumen, fallos }, null, 2),
    'utf8'
  )

  const total = resumen.reduce((s, r) => s + r.filas, 0)
  console.log(`\n${total} filas guardadas en respaldos/${sello}`)
  if (fallos > 0) {
    console.error(`${fallos} tabla(s) fallaron. Revisa el detalle de arriba.`)
  }

  limpiarViejos(dirBase)
  console.log('')
  process.exit(fallos > 0 ? 1 : 0)
}

main().catch(e => {
  console.error('\n✗ El respaldo falló:', e.message)
  console.error('  Si dice fetch failed, revisa que Supabase esté Healthy.\n')
  process.exit(1)
})
