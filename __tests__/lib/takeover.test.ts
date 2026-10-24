process.env.AGENT_ENABLED='true'
process.env.AGENT_WEBHOOK_SECRET='test-secret'
const record:{status:string;flow_state:Record<string,unknown>}={status:'active',flow_state:{}}
let dbError=false
jest.mock('@/lib/supabase/server',()=>({createAdminClient:()=>({from:()=>({
  upsert:async(value:typeof record)=>{if(!dbError)Object.assign(record,value);return {error:dbError?{}:null}},
  select:()=>({eq:()=>({maybeSingle:async()=>({data:record,error:dbError?{}:null})})}),
})})}))
jest.mock('@/lib/agent',()=>({processIncomingMessage:jest.fn(),handleAdminCommand:jest.fn().mockResolvedValue(null)}))
jest.mock('@/lib/whatsapp',()=>({sendRawMessage:jest.fn()}))
import {pauseForHuman,canSendAgentMessage} from '@/lib/agent/takeover'
import {processIncomingMessage} from '@/lib/agent'
import {sendRawMessage} from '@/lib/whatsapp'
const {POST} = require('@/app/api/whatsapp/agent/route')
import {NextRequest} from 'next/server'
const event=(type='outgoingMessageReceived',chatId='56911111111@c.us',timestamp=Math.floor(Date.now()/1000))=>new NextRequest('https://test.local/api/whatsapp/agent?token=test-secret',{method:'POST',body:JSON.stringify({typeWebhook:type,idMessage:'m1',timestamp,senderData:{chatId},messageData:{typeMessage:'textMessage',textMessageData:{textMessage:'hola'}}})})
beforeEach(()=>{record.status='active';record.flow_state={};dbError=false;jest.clearAllMocks()})
test('mensaje manual pausa sin responder y los siguientes mensajes del cliente no lo reactivan',async()=>{
 const response=await POST(event());expect(await response.json()).toEqual({status:'human_takeover'})
 expect(record.status).toBe('paused');expect(await canSendAgentMessage('56911111111',true)).toBe(false)
 expect(sendRawMessage).not.toHaveBeenCalled();expect(processIncomingMessage).not.toHaveBeenCalled()
})
test.each(['outgoingAPIMessageReceived','outgoingMessageStatus'])('ignora %s sin pausar',async(type)=>{
 expect((await POST(event(type))).status).toBe(200);expect(record.status).toBe('active')
})
test('no pausa grupos ni mensajes antiguos',async()=>{
 await POST(event('outgoingMessageReceived','group@g.us'));await POST(event('outgoingMessageReceived','56911111111@c.us',1))
 expect(record.status).toBe('active')
})
test('la pausa falla con 503 para que el proveedor reintente',async()=>{dbError=true;expect((await POST(event())).status).toBe(503)})
test('si falla la lectura de estado se impide el envío',async()=>{dbError=true;expect(await canSendAgentMessage('56911111111')).toBe(false)})
test('permite el aviso final de derivación automática pero nunca tras intervención humana',async()=>{
 record.status='paused';expect(await canSendAgentMessage('56911111111',true)).toBe(true)
 await pauseForHuman('56911111111');expect(await canSendAgentMessage('56911111111',true)).toBe(false)
})
test('cancela una respuesta preparada si el humano interviene durante la espera',async()=>{
 jest.useFakeTimers()
 ;(processIncomingMessage as jest.Mock).mockResolvedValue({reply:'respuesta del bot',handoff:false})
 const pending=POST(event('incomingMessageReceived'))
 await jest.advanceTimersByTimeAsync(0)
 await pauseForHuman('56911111111')
 await jest.runAllTimersAsync()
 expect(await (await pending).json()).toEqual({status:'paused'})
 expect(sendRawMessage).not.toHaveBeenCalled()
 jest.useRealTimers()
})
