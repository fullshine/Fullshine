export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  revision: 'Revisión gratis', lavado_detallado: 'Lavado', tapiz: 'Tapiz',
  pulido: 'Pulidos', ceramico: 'Cerámico', mantencion: 'Mantención',
  adicional: 'Adicionales', precompra: 'Precompra',
}
export const SERVICE_CATEGORY_ORDER = ['revision', 'lavado_detallado', 'tapiz', 'pulido', 'ceramico', 'mantencion', 'adicional', 'precompra']
export function orderedServiceCategories(services: { category: string }[]): string[] {
  const present = new Set(services.map(service => service.category))
  return [...SERVICE_CATEGORY_ORDER.filter(category => present.has(category)), ...Array.from(present).filter(category => !SERVICE_CATEGORY_ORDER.includes(category))]
}
export function compareServicePlans(a: { name: string }, b: { name: string }): number {
  const rank = (name: string) => {
    const index = ['platino', 'gold', 'elite'].findIndex(level => name.toLowerCase().includes(level))
    return index < 0 ? 3 : index
  }
  return rank(a.name) - rank(b.name) || a.name.localeCompare(b.name, 'es')
}
