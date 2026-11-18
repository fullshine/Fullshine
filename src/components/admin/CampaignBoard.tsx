'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getCampaignHistory, editCampaignLead, quoteCampaignLead } from '@/actions/campaigns'
import { CAMPAIGNS, STAGES, type Lead, type Campaign, type Stage } from '@/lib/campaigns/rules'

type History = Awaited<ReturnType<typeof getCampaignHistory>>
const date = (s: string) => new Date(s).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'short' })
const statusLabels: Record<string,string> = { queued:'Programado', sending:'Enviando', sent:'Aceptado por WhatsApp', cancelled:'Cancelado', uncertain:'Verificar envío' }

export default function CampaignBoard({ leads, error, enabled }: { leads: Lead[]; error: string | null; enabled: boolean }) {
  const router = useRouter()
  const [filter,setFilter] = useState('all')
  const [selected,setSelected] = useState<Lead|null>(null)
  const [history,setHistory] = useState<History|null>(null)
  const [detail,setDetail] = useState('')
  const [price,setPrice] = useState('')
  const [followups,setFollowups] = useState(true)
  const [message,setMessage] = useState('')
  const [pending,start] = useTransition()
  const filtered = leads.filter(l => filter === 'all' || l.campaign === filter)

  function open(lead: Lead) {
    setSelected({...lead}); setHistory(null); setMessage(''); setPrice(lead.quoted_price?.toString() ?? '')
    setDetail(`Para tu ${lead.vehicle || '[vehículo]'}, te ofrecemos ${CAMPAIGNS[lead.campaign]}.\nIncluye: [detallar alcance].\nTiempo estimado: [duración].\nTaller en Camilo Henríquez, Concepción.`)
    setFollowups(!lead.paused)
    start(async () => { try { setHistory(await getCampaignHistory(lead.id)) } catch { setMessage('No se pudo cargar el historial') } })
  }
  function save() {
    if (!selected) return
    start(async () => {
      const result = await editCampaignLead(selected)
      setMessage(result.success ? 'Guardado. Los mensajes pendientes anteriores se cancelaron.' : result.error ?? 'Error')
      if (result.success) { setHistory(await getCampaignHistory(selected.id)); router.refresh() }
    })
  }
  function send() {
    if (!selected) return
    if (/\[[^\]]+\]/.test(detail)) { setMessage('Completa los campos entre corchetes antes de enviar.'); return }
    start(async () => {
      const result = await quoteCampaignLead({id:selected.id,price:Number(price),detail,followups})
      setMessage(result.success ? 'Cotización enviada. Revisa los seguimientos en el historial.' : result.error ?? 'Error')
      setHistory(await getCampaignHistory(selected.id)); router.refresh()
    })
  }
  return <section className="mb-10" aria-label="Campañas de WhatsApp">
    <div className="flex flex-wrap gap-3 items-center justify-between mb-3">
      <div><h2 className="text-xl font-bold">Consultas de WhatsApp</h2><p className="text-sm text-gray-600">Hasta 200 contactos recientes · {filtered.length} en esta vista</p></div>
      <div className="flex gap-2"><select aria-label="Filtrar campaña" value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded p-2"><option value="all">Todas las campañas</option>{Object.entries(CAMPAIGNS).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><button className="border rounded px-3" onClick={()=>router.refresh()}>Actualizar</button></div>
    </div>
    {!enabled && <p className="p-3 bg-amber-50 text-amber-900 rounded mb-3">Modo revisión: los envíos de campañas están desactivados.</p>}
    {error ? <p role="alert" className="p-3 text-red-700 bg-red-50">{error}</p> : <div className="flex overflow-x-auto gap-3 pb-3">
      {Object.entries(STAGES).map(([stage,label])=><div key={stage} className="min-w-[220px] w-[220px] bg-gray-200/60 rounded-xl p-3 shrink-0">
        <h3 className="font-semibold mb-3">{label} <span className="text-gray-500">{filtered.filter(l=>l.stage===stage).length}</span></h3>
        {filtered.filter(l=>l.stage===stage).map(lead=><button key={lead.id} onClick={()=>open(lead)} className="w-full text-left p-3 mb-2 bg-white rounded-lg border shadow-sm hover:border-orange-500">
          <p className="font-semibold truncate">{lead.customer_name || `+${lead.phone}`}</p>
          <p className="text-xs text-orange-700 my-1">{CAMPAIGNS[lead.campaign]}</p>
          <p className="text-sm">{lead.vehicle || 'Vehículo por confirmar'}</p>
          <p className="text-xs text-gray-500 mt-2">{lead.opted_out ? 'No contactar' : lead.paused ? 'Atención humana' : 'Automatización habilitada'}</p>
          {lead.last_inbound_at && <p className="text-xs text-gray-400">Último mensaje: {date(lead.last_inbound_at)}</p>}
        </button>)}
      </div>)}
    </div>}
    {selected && <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Ficha de consulta">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto p-6">
        <div className="flex justify-between"><h3 className="font-bold text-xl">{selected.customer_name || 'Consulta'} · +{selected.phone}</h3><button onClick={()=>setSelected(null)} aria-label="Cerrar ficha">Cerrar ✕</button></div>
        <p className="text-sm text-gray-500 my-3">Horarios de seguimiento: lunes a viernes 09–19 h, sábado 09–14 h, hora de Chile.</p>
        {message && <p role="status" className="bg-blue-50 p-3 rounded my-3">{message}</p>}
        <div className="grid grid-cols-2 gap-3">
          <label>Campaña<select className="border rounded p-2 w-full" value={selected.campaign} onChange={e=>setSelected({...selected,campaign:e.target.value as Campaign})}>{Object.entries(CAMPAIGNS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label>Etapa<select className="border rounded p-2 w-full" value={selected.stage} onChange={e=>setSelected({...selected,stage:e.target.value as Stage})}>{Object.entries(STAGES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label className="col-span-2">Vehículo<input className="border rounded p-2 w-full" value={selected.vehicle} onChange={e=>setSelected({...selected,vehicle:e.target.value})}/></label>
          <label className="col-span-2">Notas y próxima acción<textarea className="border rounded p-2 w-full" value={selected.notes} onChange={e=>setSelected({...selected,notes:e.target.value})}/></label>
        </div>
        <label className="block my-3"><input type="checkbox" checked={selected.paused} disabled={selected.opted_out} onChange={e=>setSelected({...selected,paused:e.target.checked})}/> Pausar automatización / tomar conversación</label>
        <button disabled={pending} onClick={save} className="px-4 py-2 rounded bg-gray-900 text-white disabled:opacity-50">Guardar ficha</button>
        <a className="ml-3 text-green-700 underline" href={`https://wa.me/${selected.phone}`} target="_blank" rel="noreferrer">Abrir WhatsApp</a>
        <p className="text-xs text-gray-500 my-2">Guardar cancela los envíos pendientes. Marcar «Agendado» aquí no crea una reserva: regístrala en el tablero de reservas.</p>
        <hr className="my-5"/><h4 className="font-bold">Cotización para enviar</h4>
        <p className="text-sm text-gray-500 my-2">Guarda primero los cambios de campaña y vehículo. Revisa alcance y precio antes del envío.</p>
        <textarea aria-label="Detalle de cotización" className="w-full border rounded p-3 min-h-[150px]" value={detail} onChange={e=>setDetail(e.target.value)}/>
        <label>Valor total CLP<input type="number" min="1" aria-label="Valor total CLP" className="w-full border rounded p-2" value={price} onChange={e=>setPrice(e.target.value)}/></label>
        <p className="text-xs text-gray-500 mt-2">Se agregará el total y la pregunta: «¿Qué día te acomodaría traerlo? Revisaremos disponibilidad antes de confirmar».</p>
        <label className="block my-3"><input type="checkbox" checked={followups} onChange={e=>setFollowups(e.target.checked)}/> Activar seguimiento automático a las 24 y 72 h si no responde (reanuda automatización).</label>
        <button disabled={pending || !enabled || selected.opted_out} onClick={send} className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50">Enviar cotización por WhatsApp</button>
        <hr className="my-5"/><h4 className="font-bold mb-3">Historial y próximos mensajes</h4>
        {history?.outbox.map(j=><div key={j.id} className="border rounded p-3 mb-2 text-sm"><p className="font-semibold">{statusLabels[j.status] ?? j.status} · {date(j.due_at)}</p><p className="whitespace-pre-wrap">{j.body}</p>{j.error && <p className="text-red-700">{j.error}</p>}</div>)}
        {history?.events.map(e=><div key={e.id} className="bg-gray-50 p-3 rounded mb-2 text-sm"><p className="text-gray-500">{e.direction==='human'?'Respuesta manual':'Cliente'} · {date(e.occurred_at)}</p><p className="whitespace-pre-wrap">{e.body}</p></div>)}
      </div>
    </div>}
  </section>
}
