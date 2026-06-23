import { cn, formatCurrency, getVehicleTypeLabel, getStatusLabel, getStatusColor } from '@/lib/utils'

describe('cn (className merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
  it('resolves tailwind conflicts', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })
})

describe('formatCurrency', () => {
  it('formats CLP correctly', () => {
    const result = formatCurrency(12000)
    expect(result).toContain('12')
    expect(result).toContain('000')
  })
  it('handles zero', () => {
    const result = formatCurrency(0)
    expect(result).toBeDefined()
  })
  it('handles large amounts', () => {
    const result = formatCurrency(150000)
    expect(result).toContain('150')
  })
})

describe('getVehicleTypeLabel', () => {
  it('returns sedan label', () => {
    expect(getVehicleTypeLabel('sedan')).toBe('Sedán')
  })
  it('returns suv label', () => {
    expect(getVehicleTypeLabel('suv')).toBe('SUV')
  })
  it('returns pickup label', () => {
    expect(getVehicleTypeLabel('pickup')).toBe('Pickup')
  })
  it('returns van label', () => {
    expect(getVehicleTypeLabel('van')).toBe('Van')
  })
  it('returns hatchback label', () => {
    expect(getVehicleTypeLabel('hatchback')).toBe('Hatchback')
  })
  it('returns coupe label', () => {
    expect(getVehicleTypeLabel('coupe')).toBe('Coupé')
  })
  it('returns original for unknown type', () => {
    expect(getVehicleTypeLabel('unknown')).toBe('unknown')
  })
})

describe('getStatusLabel', () => {
  it('returns pending label', () => {
    expect(getStatusLabel('pending')).toBe('Pendiente')
  })
  it('returns confirmed label', () => {
    expect(getStatusLabel('confirmed')).toBe('Confirmado')
  })
  it('returns in_progress label', () => {
    expect(getStatusLabel('in_progress')).toBe('En progreso')
  })
  it('returns completed label', () => {
    expect(getStatusLabel('completed')).toBe('Completado')
  })
  it('returns cancelled label', () => {
    expect(getStatusLabel('cancelled')).toBe('Cancelado')
  })
})

describe('getStatusColor', () => {
  it('returns yellow for pending', () => {
    expect(getStatusColor('pending')).toContain('yellow')
  })
  it('returns blue for confirmed', () => {
    expect(getStatusColor('confirmed')).toContain('blue')
  })
  it('returns green for completed', () => {
    expect(getStatusColor('completed')).toContain('green')
  })
  it('returns red for cancelled', () => {
    expect(getStatusColor('cancelled')).toContain('red')
  })
  it('returns gray for unknown', () => {
    expect(getStatusColor('unknown')).toContain('gray')
  })
})
