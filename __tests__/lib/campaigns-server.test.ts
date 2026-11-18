/** @jest-environment node */
import { ingestCampaignEvent, dispatchCampaignMessages } from '@/lib/campaigns/server'
import { createAdminClient } from '@/lib/supabase/server'
jest.mock('@/lib/supabase/server', () => ({ createAdminClient: jest.fn() }))
const rpc = jest.fn()
beforeEach(() => {
  jest.clearAllMocks()
  ;(createAdminClient as jest.Mock).mockReturnValue({ rpc })
  rpc.mockResolvedValue({ error: null })
})
const event = () => ({ typeWebhook:'incomingMessageReceived', idMessage:'msg-1', timestamp:Math.floor(Date.now()/1000), senderData:{chatId:'56911112222@c.us',senderName:'Cliente'}, messageData:{typeMessage:'textMessage',textMessageData:{textMessage:'Quiero pulido y tapiz'}} })
it('persiste identificación y texto para deduplicación transaccional', async () => {
  await ingestCampaignEvent(event())
  expect(rpc).toHaveBeenCalledWith('wa_ingest',expect.objectContaining({p_campaign:'pulido_tapiz',p_id:'incomingMessageReceived:msg-1',p_human:false}))
})
it('una respuesta manual pausa, un eco de API nunca pausa', async () => {
  await ingestCampaignEvent({...event(),typeWebhook:'outgoingMessageReceived'})
  expect(rpc).toHaveBeenCalledWith('wa_ingest',expect.objectContaining({p_human:true}))
  rpc.mockClear()
  await ingestCampaignEvent({...event(),typeWebhook:'outgoingAPIMessageReceived'})
  expect(rpc).not.toHaveBeenCalled()
})
it('ignora grupos y mensajes de otro formato de teléfono', async () => {
  await ingestCampaignEvent({...event(),senderData:{chatId:'123@g.us'}})
  expect(rpc).not.toHaveBeenCalled()
})
it('propaga fallas de persistencia para permitir reintento de webhook', async () => {
  rpc.mockResolvedValue({error:{message:'database unavailable'}})
  await expect(ingestCampaignEvent(event())).rejects.toThrow('registrar')
})
it('registra una baja sin depender de un modelo de IA', async () => {
  const e = event(); e.messageData.textMessageData.textMessage='No me escribas más'
  await ingestCampaignEvent(e)
  expect(rpc).toHaveBeenCalledWith('wa_ingest',expect.objectContaining({p_stop:true}))
})
it('no procesa envíos si el interruptor está apagado', async () => {
  const old = process.env.CAMPAIGNS_SEND_ENABLED
  process.env.CAMPAIGNS_SEND_ENABLED='false'
  try {
    expect(await dispatchCampaignMessages()).toEqual({sent:0,disabled:true})
    expect(createAdminClient).not.toHaveBeenCalled()
  } finally { if(old===undefined) delete process.env.CAMPAIGNS_SEND_ENABLED; else process.env.CAMPAIGNS_SEND_ENABLED=old }
})

function chain(result: unknown) {
  const q: any = { then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve) }
  for (const method of ['update','select','eq','lt','lte','order','limit','single']) q[method] = jest.fn(() => q)
  return q
}
describe('Cola de envíos', () => {
  const oldFetch = global.fetch
  const oldEnabled = process.env.CAMPAIGNS_ENABLED
  const oldSend = process.env.CAMPAIGNS_SEND_ENABLED
  const oldInstance = process.env.GREEN_API_INSTANCE_ID
  const oldToken = process.env.GREEN_API_TOKEN
  beforeEach(() => {
    process.env.CAMPAIGNS_ENABLED = 'true'; process.env.CAMPAIGNS_SEND_ENABLED = 'true'
    process.env.GREEN_API_INSTANCE_ID = 'test'; process.env.GREEN_API_TOKEN = 'test-token'
  })
  afterEach(() => {
    global.fetch = oldFetch
    for (const [key,value] of Object.entries({CAMPAIGNS_ENABLED:oldEnabled,CAMPAIGNS_SEND_ENABLED:oldSend,GREEN_API_INSTANCE_ID:oldInstance,GREEN_API_TOKEN:oldToken})) {
      if(value === undefined) delete process.env[key]; else process.env[key] = value
    }
  })
  function setup(paused = false) {
    const resolution = chain({error:null})
    const from = jest.fn()
      .mockReturnValueOnce(chain({error:null}))
      .mockReturnValueOnce(chain({data:[{id:'job-1',kind:'welcome',due_at:new Date().toISOString()}],error:null}))
      .mockReturnValueOnce(chain({data:{phone:'56911112222',paused,opted_out:false,stage:'nuevo'},error:null}))
      .mockReturnValue(resolution)
    rpc.mockImplementation((name:string)=>Promise.resolve(name==='wa_claim' ? {data:[{id:'job-1',kind:'welcome',lead_id:'lead-1',body:'Hola'}],error:null} : {error:null}))
    ;(createAdminClient as jest.Mock).mockReturnValue({from,rpc})
    return resolution
  }
  it('registra el identificador del proveedor sólo después de aceptación', async () => {
    setup()
    global.fetch = jest.fn().mockResolvedValue({ok:true,json:async()=>({idMessage:'provider-1'})})
    expect(await dispatchCampaignMessages()).toEqual({sent:1,disabled:false})
    expect(rpc).toHaveBeenCalledWith('wa_finish',{p_id:'job-1',p_provider:'provider-1'})
  })
  it('un timeout queda incierto y no repite la llamada de envío', async () => {
    const resolution=setup()
    global.fetch = jest.fn().mockRejectedValue(new Error('timeout'))
    expect(await dispatchCampaignMessages()).toEqual({sent:0,disabled:false})
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(resolution.update).toHaveBeenCalledWith(expect.objectContaining({status:'uncertain'}))
    expect(rpc).not.toHaveBeenCalledWith('wa_finish',expect.anything())
  })
  it('revisa la pausa nuevamente antes de llamar al proveedor', async () => {
    const resolution=setup(true)
    global.fetch=jest.fn()
    await dispatchCampaignMessages()
    expect(global.fetch).not.toHaveBeenCalled()
    expect(resolution.update).toHaveBeenCalledWith({status:'cancelled'})
  })
})
