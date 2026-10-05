import { fireEvent, render, screen, within } from '@testing-library/react'
import ServicesTabs from '@/components/ServicesTabs'

const makeService = (level: string, year: number) => ({
  id: `${level}-${year}`,
  name: `Tratamiento Cerámico ${level} ${year} ${year === 1 ? 'año' : 'años'}`,
  category: 'ceramico',
  description: `Proceso: Pulido avanzado y protección Nasiol ${year === 1 ? 'Metal Coat' : 'ZR53'}. Incluye: Limpieza interior profunda de cortesía.`,
  prices: [{ vehicle_type: 'hatch_sedan', price_clp: 200000 }],
})

it('ordena los planes, separa duraciones y enlaza la reserva al servicio exacto', () => {
  render(<ServicesTabs orderedCategories={['ceramico']} grouped={{ ceramico: [3, 1].flatMap(year => ['Elite', 'Gold', 'Platino'].map(level => makeService(level, year))) }} />)
  const links = screen.getAllByRole('link', { name: /^Reservar Tratamiento/ })
  expect(links.map(link => link.getAttribute('href'))).toEqual(['Platino-1', 'Gold-1', 'Elite-1'].map(id => `/reservar?categoria=ceramico&servicio=${id}`))
  const eliteCard = links[2].parentElement!.parentElement!
  expect(within(eliteCard).getByText('✓ Sellado de plásticos externos e internos y llantas')).toBeInTheDocument()
  expect(within(links[0].parentElement!.parentElement!).queryByText('✓ Sellado cerámico de vidrios')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '3 años · ZR53' }))
  expect(screen.getByRole('button', { name: '3 años · ZR53' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getAllByRole('link', { name: /^Reservar Tratamiento/ }).map(link => link.getAttribute('href'))).toEqual(['Platino-3', 'Gold-3', 'Elite-3'].map(id => `/reservar?categoria=ceramico&servicio=${id}`))
  expect(screen.queryByText('Tratamiento Cerámico Gold 1 año')).not.toBeInTheDocument()
  fireEvent.click(screen.getAllByRole('button', { name: 'ver más' })[0])
  expect(screen.getByText('Pulido avanzado y protección Nasiol ZR53.')).toBeInTheDocument()
})
