import { catalogReply, type CatalogService, type SalesState } from '@/lib/agent/catalog-flow'
const now = new Date('2026-10-25T15:00:00Z')
const services: CatalogService[] = [
 {id:'p',name:'Tapiz Platino',category:'tapiz',description:'Limpieza sin desmontaje',duration_hours:3,prices:[{vehicle_type:'hatch_sedan',price_clp:100000},{vehicle_type:'pickup_xl',price_clp:150000}]},
 {id:'g',name:'Tapiz Gold',category:'tapiz',duration_hours:4,prices:[{vehicle_type:'hatch_sedan',price_clp:130000}]},
 {id:'free',name:'Revisión gratis',category:'revision',duration_hours:0.5,prices:[{vehicle_type:'hatch_sedan',price_clp:0}]},
 {id:'private',name:'Convenio Fortia',category:'automotora',prices:[{vehicle_type:'hatch_sedan',price_clp:1}]},
 {id:'private2',name:'Convenio Concecars',category:'automotora_concecars',prices:[{vehicle_type:'hatch_sedan',price_clp:2}]},
 {id:'off',name:'Oculto',category:'tapiz',is_active:false,prices:[]},
 {id:'c1',name:'Cerámico Platino 1 año',category:'ceramico',duration_hours:8,prices:[{vehicle_type:'hatch_sedan',price_clp:200000}]},
 {id:'c3',name:'Cerámico Platino 3 años',category:'ceramico',duration_hours:8,prices:[{vehicle_type:'hatch_sedan',price_clp:300000}]},
]
const run = (s: SalesState | null, text: string, catalog=services) => catalogReply(s,text,catalog,now)
beforeEach(()=>jest.useFakeTimers().setSystemTime(now))
afterEach(()=>jest.useRealTimers())
test.each(['Quiero saber cuánto sale limpiar el tapiz','precio lavado de tapiz','tapiz'])('precios en primera respuesta: %s',text=>{
 const r=run(null,text)
 expect(r.state.step).toBe('plans');expect(r.reply).toContain('$100.000');expect(r.reply).toContain('$130.000')
 expect(r.reply).not.toContain('marca y modelo');expect(r.reply).not.toContain('Oculto')
})
test('saludo pide servicio, no modelo; precio ambiguo pide solo el servicio',()=>{
 expect(run(null,'hola').state.step).toBe('home')
 expect(run(null,'hola').reply).not.toContain('marca y modelo')
 expect(run(null,'cuánto cuesta').reply).toContain('qué servicio')
})
test('cerámicos muestra ambas duraciones con precios sin menú intermedio',()=>{
 const r=run(null,'precio cerámico');expect(r.reply).toContain('$200.000');expect(r.reply).toContain('$300.000');expect(r.state.step).toBe('plans')
})
test('precio cero no se convierte en consultar y convenios nunca se muestran',()=>{
 expect(run(null,'revisión').reply).toContain('$0')
 expect(run(null,'servicios').reply).not.toMatch(/Fortia|Concecars|automotora/)
 expect(run({version:2,step:'detail',serviceId:'private2',misses:0},'agendar').handoff).toBe(true)
})
test('tipo declarado filtra precios sin adivinar modelo',()=>{
 const r=run(null,'precio de tapiz para sedán');expect(r.reply).toContain('$100.000');expect(r.reply).not.toContain('$150.000')
 expect(run(null,'tapiz para Toyota RAV4').reply).toContain('SUV/camioneta: consultar')
})
test('elige por nombre y por número conserva IDs con catálogo reordenado',()=>{
 const r=run(null,'tapiz')
 expect(run(r.state,'Gold').reply).toContain('Tapiz Gold')
 expect(run(r.state,'1',[...services].reverse()).reply).toContain('Tapiz Platino')
})
test('servicio exacto recibe precio directo y permite solicitarlo por nombre',()=>{
 const r=run(null,'cuánto cuesta Tapiz Gold');expect(r.state.step).toBe('detail');expect(r.reply).toContain('$130.000')
 expect(run(run(null,'tapiz').state,'agendar Gold').state.step).toBe('vehicle')
 expect(run(null,'quiero reservar Tapiz Gold').reply).toContain('$130.000')
})
test('fecha de octubre sigue siendo una fecha en la agenda de la campaña',()=>{
 const r=run({version:1,step:'schedule',vehicle:'Toyota RAV4',category:'suv_camioneta',accepted:true,misses:0},'28 octubre 14:00')
 expect(r.handoff).toBe(true);expect(r.handoffContext).toContain('28 octubre 14:00')
})
function booking(vehicle='Toyota Corolla sedán') {
 let r=run(null,'tapiz'); r=run(r.state,'agendar 1');expect(r.state.step).toBe('vehicle')
 return run(r.state,vehicle)
}
test('reserva sin ACEPTO ni aceptación inventada, deriva con precio y sin confirmar cupo',()=>{
 let r=booking();expect(r.state.step).toBe('schedule');expect(r.reply).toContain('$100.000')
 r=run(r.state,'mañana 09:00');expect(r.handoff).toBe(true)
 expect(r.handoffContext).toContain('Solicita agendar: sí');expect(r.handoffContext).toContain('$100.000')
 expect(r.handoffContext).toContain('confirmar con el cliente');expect(r.state).not.toHaveProperty('accepted')
 expect(r.reply).toContain('Aún no hay una hora reservada')
})
test('pide tamaño solo si falta y XL prevalece',()=>{
 let r=booking('Toyota Corolla');expect(r.state.step).toBe('category')
 r=run(r.state,'1');expect(r.state.step).toBe('schedule')
 expect(booking('Ford F150 sedán').reply).toContain('$150.000')
})
test('falta de precio deriva sin inventar ni usar tarifa de otra categoría',()=>{
 const r=booking('Toyota RAV4 SUV');expect(r.handoff).toBe(true);expect(r.handoffContext).toContain('Precio no disponible')
})
test('cambio de precio antes del cierre muestra actualización y vuelve a pedir preferencia',()=>{
 const r=booking()
 const changed=services.map(s=>s.id==='p'?{...s,prices:[{vehicle_type:'hatch_sedan',price_clp:110000}]}:s)
 const updated=run(r.state,'mañana',changed)
 expect(updated.handoff).toBe(false);expect(updated.reply).toContain('$110.000');expect(updated.state).not.toHaveProperty('preference', 'mañana')
 expect(run(updated.state,'mañana',changed).handoff).toBe(true)
})
test('retirar servicio y caída del catálogo no inventan precios',()=>{
 expect(run(booking().state,'mañana',[]).handoff).toBe(true)
 expect(run(null,'tapiz',[]).handoff).toBe(true)
 expect(run(null,'promo',[]).reply).toContain('$169.990')
})
test.each(['0','Quiero hablar con una persona','stop','[el cliente envió una imagen]','¿A domicilio?'])('derivación: %s',text=>expect(run(booking().state,text).handoff).toBe(true))
test('negación no solicita reserva',()=>{
 const r=run(run(run(null,'tapiz').state,'1').state,'no quiero reservar')
 expect(r.handoff).toBe(false);expect(r.state).not.toHaveProperty('bookingRequested',true)
})
test('promoción muestra tres precios antes de pedir datos y respeta vencimiento',()=>{
 const r=run(null,'Hola, vi la promoción del reel')
 for(const price of ['$169.990','$189.000','$209.990'])expect(r.reply).toContain(price)
 expect(r.state.step).toBe('detail')
 expect(catalogReply(r.state,'agendar',services,new Date('2026-11-01T03:00:00Z')).handoff).toBe(true)
 expect(catalogReply(null,'tapiz',services,new Date('2026-11-01T03:00:00Z')).reply).toContain('$100.000')
})
test('reserva promoción sin aceptación obligatoria y mantiene FAQ',()=>{
 let r=run(null,'promo');r=run(r.state,'quiero reservar');r=run(r.state,'Toyota RAV4');r=run(r.state,'2')
 expect(r.state.step).toBe('schedule');expect(r.reply).toContain('$189.000')
 const faq=run(r.state,'¿A domicilio?');expect(faq.state).toEqual(r.state);expect(faq.reply).toContain('exclusivamente en taller')
 r=run(r.state,'por coordinar');expect(r.handoff).toBe(true);expect(r.state).not.toHaveProperty('accepted')
})
test('CAMBIAR borra precio y preferencia sin perder servicio',()=>{
 const r=run(booking().state,'cambiar');expect(r.state).toMatchObject({step:'vehicle',serviceId:'p'})
 expect(r.state).not.toHaveProperty('quote',expect.any(String));expect(r.state).not.toHaveProperty('vehicle',expect.any(String))
})
test('migra conversaciones de campaña ya en agenda sin inventar aceptación',()=>{
 const r=run({version:1,step:'schedule',vehicle:'Toyota RAV4',category:'suv_camioneta',accepted:true,misses:0},'mañana')
 expect(r.handoff).toBe(true);expect(r.handoffContext).toContain('Toyota RAV4');expect(r.state.version).toBe(3)
})
test('migra selector anterior conservando correspondencia del número mostrado',()=>{
 const r=run({version:2,step:'plans',category:'tapiz',options:['g','p'],misses:0},'1')
 expect(r.reply).toContain('Tapiz Gold')
})
test('clientes atrapados pidiendo vehículo pueden consultar precio inmediatamente',()=>{
 const r=run({version:2,step:'initial_vehicle',misses:1},'quiero saber el precio del tapiz')
 expect(r.reply).toContain('$100.000');expect(r.state.step).toBe('plans')
})
test('dos respuestas desconocidas derivan y no reinician conversaciones terminadas',()=>{
 const r=run(run(null,'hola').state,'???');expect(run(r.state,'???').handoff).toBe(true)
 expect(run({version:3,step:'done',misses:0},'hola').handoff).toBe(true)
})
