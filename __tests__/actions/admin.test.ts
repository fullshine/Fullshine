import { getDashboardStats, getBookings, getCustomers } from '@/actions/admin'

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: (cols?: string, opts?: object) => {
        const chain = {
          eq: () => chain,
          gte: () => chain,
          lte: () => chain,
          not: () => chain,
          in: () => chain,
          ilike: () => chain,
          order: () => chain,
          single: async () => ({ data: null, error: null }),
          data: [],
          error: null,
          count: 5,
        }
        // For count queries
        if (opts && (opts as any).count === 'exact') {
          return { ...chain, count: 3, data: null, error: null }
        }
        // For revenue queries
        if (table === 'bookings' && cols?.includes('total_price')) {
          return { ...chain, data: [{ total_price: 50000 }, { total_price: 30000 }] }
        }
        return chain
      },
      update: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
    auth: {
      signInWithPassword: async () => ({ data: {}, error: null }),
      signOut: async () => ({ error: null }),
    },
  }),
  createClient: () => ({
    auth: {
      signInWithPassword: async () => ({ error: null }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null } }),
    },
  }),
}))

jest.mock('@/lib/whatsapp', () => ({
  sendCancellationToClient: jest.fn().mockResolvedValue({}),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('getDashboardStats', () => {
  it('returns stats object', async () => {
    const result = await getDashboardStats()
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('stats have required fields', async () => {
    const result = await getDashboardStats()
    if (result.data) {
      expect(typeof result.data.bookings_today).toBe('number')
      expect(typeof result.data.bookings_week).toBe('number')
      expect(typeof result.data.revenue_month).toBe('number')
      expect(typeof result.data.pending_bookings).toBe('number')
      expect(typeof result.data.confirmed_bookings).toBe('number')
    }
  })
})

describe('getBookings', () => {
  it('returns bookings array', async () => {
    const result = await getBookings()
    expect(result.success).toBe(true)
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('accepts status filter', async () => {
    const result = await getBookings({ status: 'pending' })
    expect(result.success).toBe(true)
  })

  it('accepts date filter', async () => {
    const result = await getBookings({ date: '2024-12-01' })
    expect(result.success).toBe(true)
  })
})

describe('getCustomers', () => {
  it('returns customers array', async () => {
    const result = await getCustomers()
    expect(result.success).toBe(true)
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('accepts search parameter', async () => {
    const result = await getCustomers('Juan')
    expect(result.success).toBe(true)
  })
})
