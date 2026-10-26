import { createAdminClient } from '@/lib/supabase/server'
import { catalogReply, type CatalogService, type SalesState, type SalesResult } from './catalog-flow'

export async function salesReply(previous: SalesState | null | undefined, text: string): Promise<SalesResult> {
  try {
    const { data, error } = await createAdminClient().from('services')
      .select('id,name,category,description,duration_hours,is_active,prices:service_prices(vehicle_type,price_clp)')
      .eq('is_active', true)
    if (error) throw new Error('Catálogo no disponible')
    return catalogReply(previous, text, (data ?? []) as CatalogService[])
  } catch {
    // The approved campaign can still respond; ordinary prices are never invented.
    return catalogReply(previous, text, [])
  }
}
