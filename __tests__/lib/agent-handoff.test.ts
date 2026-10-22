process.env.AGENT_ENABLED = 'true'
delete process.env.ANTHROPIC_API_KEY
delete process.env.OPENAI_API_KEY

const state = {
  flow_state: {version:1,step:'schedule',vehicle:'Toyota RAV4',category:'suv_camioneta',accepted:true,misses:0},
  status: 'active', replies: 0, duplicate: false, pauseError: false,
  history: [{ role: 'user', content: 'Acepto $189.000, puedo dejar la RAV4 en taller.' }],
}
const updates: Record<string, unknown>[] = []
jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => ({
      select: (_columns: string, options?: {head?: boolean}) => ({
        eq: () => ({
          maybeSingle: async () => ({data: {id: 'c1', phone: '56911111111', status: state.status, flow_state: state.flow_state}}),
          eq: () => ({gte: async () => ({count: state.replies})}),
          order: () => ({limit: async () => ({data: [...state.history].reverse()})}),
        }),
      }),
      insert: async (message: {role: string}) => ({
        error: table === 'agent_messages' && message.role === 'user' && state.duplicate ? {code: '23505'} : null,
      }),
      update: (value: Record<string, unknown>) => ({
        eq: async () => {
          updates.push(value)
          if (value.status === 'paused' && !state.pauseError) state.status = 'paused'
          return {error: value.status === 'paused' && state.pauseError ? {message: 'unavailable'} : null}
        },
      }),
    }),
  }),
}))


const fetchMock = jest.fn()
global.fetch = fetchMock
const { processIncomingMessage } = require('@/lib/agent')

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date('2026-10-22T15:00:00Z'))
  state.status = 'active'; state.replies = 0; state.duplicate = false; state.pauseError = false
  updates.length = 0
  fetchMock.mockReset().mockResolvedValue({ok: true, json: async () => ({content: [{type: 'text', text: '[DERIVAR] Una persona confirmará tu fecha.'}]})})
})

test('deriva con contexto real, pausa y no vuelve a responder mientras el humano atiende', async () => {
  const first = await processIncomingMessage('56911111111', '23 octubre 14:00', 'm1')
  expect(first.handoff).toBe(true)
  expect(first.reply).not.toContain('[DERIVAR]')
  expect(first.handoffContext).toContain('RAV4')
  expect(state.status).toBe('paused')
  const next = await processIncomingMessage('56911111111', '¿Me confirmas?', 'm2')
  expect(next).toEqual({reply: null, handoff: false})
  expect(fetchMock).not.toHaveBeenCalled()
})

test('al alcanzar el límite diario también pausa antes de derivar', async () => {
  state.replies = 40
  const result = await processIncomingMessage('56911111111', 'Ayuda', 'm1')
  expect(result.handoff).toBe(true)
  expect(state.status).toBe('paused')
  expect(fetchMock).not.toHaveBeenCalled()
})

test('no reporta pausa exitosa si falla la base de datos', async () => {
  state.pauseError = true
  await expect(processIncomingMessage('56911111111', '23 octubre 14:00', 'm1')).rejects.toThrow('No se pudo guardar o pausar')
})

test('un reintento del mismo mensaje no genera otra respuesta', async () => {
  state.duplicate = true
  expect(await processIncomingMessage('56911111111', 'Acepto', 'm1')).toEqual({reply: null, handoff: false})
  expect(fetchMock).not.toHaveBeenCalled()
})

afterEach(() => jest.useRealTimers())
