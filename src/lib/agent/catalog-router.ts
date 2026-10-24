import { createAdminClient } from '@/lib/supabase/server'
import { guidedReply } from './guided-flow'
import { catalogReply, type CatalogService, type SalesState, type SalesResult } from './catalog-flow'

export async function salesReply(previous: SalesState | null | undefined, text: string): Promise<SalesResult> {
  const value = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  if (previous?.version === 1 && !/^(menu|servicios|catalogo)$/.test(value) && !(previous.step === 'menu' && value === '2')) {
    return guidedReply(previous, text)
  }
  try {
    const {data, error} = await createAdminClient().from('services')
      .select('id,name,category,description,duration_hours,is_active,prices:service_prices(vehicle_type,price_clp)')
      .eq('is_active', true)
    if (error) throw new Error('Catálogo no disponible')
    return catalogReply(previous, text, (data ?? []) as CatalogService[])
  } catch {
    // Keep the campaign usable, but never invent standard prices on a catalog failure.
    return catalogReply(previous, text, [])
  }
}
