import { getAvailableSlots, getServices } from '@/actions/bookings'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => {
            if (table === 'services') {
              return {
                data: {
                  id: 'c1000001-0000-0000-0000-000000000001',
                  name: 'Lavado Exterior',
                  category: 'exterior',
                  duration_minutes: 60,
                  is_active: true,
                  prices: [
                    { vehicle_type: 'sedan', price: 12000 },
                    { vehicle_type: 'suv', price: 15000 },
                  ],
                },
                error: null,
              }
            }
            return { data: null, error: { message: 'not found' } }
          },
          order: () => ({
            order: () => ({ data: [], error: null }),
          }),
        }),
        order: () => ({
          order: () => ({
            data: [
              {
                id: 'c1000001-0000-0000-0000-000000000001',
                name: 'Lavado Exterior',
                description: 'Lavado completo exterior',
                category: 'exterior',
                duration_minutes: 60,
                prices: [{ vehicle_type: 'sedan', price: 12000 }],
              },
            ],
            error: null,
          }),
        }),
        gte: () => ({
          lte: () => ({
            not: async () => ({ data: [], error: null }),
          }),
        }),
        ilike: () => ({ data: [], error: null }),
      }),
      upsert: () => ({
        select: () => ({
          single: async () => ({ data: { id: 'customer-id' }, error: null }),
        }),
      }),
      rpc: async () => ({ data: 'booking-id', error: null }),
    }),
    rpc: async () => ({ data: 'booking-id', error: null }),
  }),
}))

jest.mock('@/lib/whatsapp', () => ({
  sendBookingConfirmationToClient: jest.fn().mockResolvedValue({}),
  sendNewBookingToAdmin: jest.fn().mockResolvedValue({}),
  sendCancellationToClient: jest.fn().mockResolvedValue({}),
}))

describe('getServices', () => {
  it('returns services list', async () => {
    const result = await getServices()
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('returns services with prices', async () => {
    const result = await getServices()
    if (result.data && result.data.length > 0) {
      expect(result.data[0]).toHaveProperty('id')
      expect(result.data[0]).toHaveProperty('name')
      expect(result.data[0]).toHaveProperty('prices')
    }
  })
})

describe('getAvailableSlots', () => {
  it('returns empty slots for Sunday', async () => {
    // Find next Sunday
    const d = new Date()
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7))
    const sunday = d.toISOString().split('T')[0]
    const result = await getAvailableSlots(sunday, 'c1000001-0000-0000-0000-000000000001')
    expect(result.success).toBe(true)
    expect(result.data?.slots).toHaveLength(0)
  })

  it('returns slots for a weekday', async () => {
    // Find next Monday
    const d = new Date()
    const daysToMonday = (8 - d.getDay()) % 7 || 7
    d.setDate(d.getDate() + daysToMonday)
    const monday = d.toISOString().split('T')[0]
    const result = await getAvailableSlots(monday, 'c1000001-0000-0000-0000-000000000001')
    expect(result.success).toBe(true)
    expect(result.data?.slots.length).toBeGreaterThan(0)
  })

  it('slot structure is valid', async () => {
    const d = new Date()
    const daysToMonday = (8 - d.getDay()) % 7 || 7
    d.setDate(d.getDate() + daysToMonday)
    const monday = d.toISOString().split('T')[0]
    const result = await getAvailableSlots(monday, 'c1000001-0000-0000-0000-000000000001')
    if (result.data?.slots.length) {
      const slot = result.data.slots[0]
      expect(slot).toHaveProperty('start')
      expect(slot).toHaveProperty('end')
      expect(slot).toHaveProperty('available')
      expect(typeof slot.available).toBe('boolean')
    }
  })
})
