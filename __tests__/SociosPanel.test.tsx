import { fireEvent, render, screen } from '@testing-library/react'
import SociosPanel from '@/components/admin/SociosPanel'
const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
jest.mock('@/actions/socios', () => ({ subirDocumento: jest.fn(), eliminarDocumento: jest.fn(), getEnlaceDocumento: jest.fn(), marcarPago: jest.fn() }))
const socios = [
  { id: 'concecars', slug: 'concecars', name: 'Automotora Concecars', service_category: 'automotora_concecars', activo: true },
  { id: 'fortia', slug: 'fortia', name: 'Automotora Fortia', service_category: 'automotora', activo: true },
]
test('cambiar de socio solicita su historial y mantiene la selección ligada a los datos', () => {
  const { rerender } = render(<SociosPanel socios={socios} documentos={[]} socioActivo="concecars" />)
  fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'fortia' } })
  expect(push).toHaveBeenCalledWith('/admin/socios?socio=fortia', { scroll: false })
  rerender(<SociosPanel socios={socios} documentos={[]} socioActivo="fortia" />)
  expect(screen.getAllByRole('combobox')[0]).toHaveValue('fortia')
  expect(screen.getByText(/Documentos de Automotora Fortia/)).toBeInTheDocument()
})
