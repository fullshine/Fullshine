import {catalogReply, type CatalogService, type SalesState} from '@/lib/agent/catalog-flow'
const now = new Date('2026-10-22T15:00:00Z')
const services: CatalogService[] = [
 {id:'p',name:'Tapiz Platino',category:'tapiz',description:'Limpieza sin desmontaje',duration_hours:3,prices:[{vehicle_type:'hatch_sedan',price_clp:100000},{vehicle_type:'pickup_xl',price_clp:150000}]},
 {id:'g',name:'Tapiz Gold',category:'tapiz',duration_hours:4,prices:[{vehicle_type:'hatch_sedan',price_clp:130000}]},
 {id:'free',name:'Revisión gratis',category:'revision',duration_hours:0.5,prices:[{vehicle_type:'hatch_sedan',price_clp:0}]},
 {id:'private',name:'Convenio privado',category:'automotora',prices:[{vehicle_type:'hatch_sedan',price_clp:1}]},
 {id:'c1',name:'Cerámico Platino 1 año',category:'ceramico',duration_hours:8,prices:[]},
 {id:'c3',name:'Cerámico Platino 3 años',category:'ceramico',duration_hours:8,prices:[]},
]
const run=(s: SalesState|null,text:string,cat=services)=>catalogReply(s,text,cat,now)
function quote(category='tapiz', vehicle='Toyota Corolla', type='1') {
 let r=run(null,category)
 for(const msg of ['1','1',vehicle])r=run(r.state,msg)
 if(r.state.step==='category')r=run(r.state,type)
 return r
}
beforeEach(()=>jest.useFakeTimers().setSystemTime(now))
afterEach(()=>jest.useRealTimers())
test('navega categoría, plan, detalles, vehículo, aceptación y derivación sin reservar',()=>{
 let r=quote()
 expect(r.reply).toContain('$100.000')
 expect(run(r.state,'sí').state).not.toMatchObject({accepted:true})
 r=run(r.state,'ACEPTO'); expect(r.state).toMatchObject({accepted:true,step:'schedule'})
 r=run(r.state,'mañana 09:00');expect(r.handoff).toBe(true)
 expect(r.handoffContext).toContain('Tapiz Platino')
 expect(r.handoffContext).toContain('$100.000')
 expect(r.reply).toContain('Aún no hay una hora reservada')
})
test('revisión gratuita conserva precio cero',()=>{expect(quote('revision').reply).toContain('$0')})
test('nombres de categoría de la web y protección cerámica separada',()=>{
 let r=run(null,'cerámico');expect(r.state.step).toBe('years')
 r=run(r.state,'2');expect(r.reply).toContain('3 años');expect(r.reply).not.toContain('1 año')
})
test('oculta convenios privados e inactivos incluso con selección previa',()=>{
 const r=run(null,'servicios',[...services,{id:'off',name:'Oculto',category:'lavado_detallado',is_active:false,prices:[]}])
 expect(r.reply).not.toMatch(/Convenio|Lavado|automotora/)
 expect(run({version:2,step:'detail',misses:0,serviceId:'private'},'1').handoff).toBe(true)
})
test('XL prevalece y no usa precio de otra categoría si falta',()=>{
 expect(quote('tapiz','Ford F150').reply).toContain('$150.000')
 expect(quote('tapiz','Toyota RAV4','2').handoff).toBe(true)
})
test('cambio de precio invalida aceptación y pide confirmación nueva',()=>{
 let r=quote();r=run(r.state,'ACEPTO')
 const changed=services.map(s=>s.id==='p'?{...s,prices:[{vehicle_type:'hatch_sedan',price_clp:110000}]}:s)
 r=run(r.state,'mañana',changed)
 expect(r.handoff).toBe(false);expect(r.state).toMatchObject({accepted:false,step:'accept'})
 expect(r.reply).toContain('$110.000')
})
test('cambiar y volver borran la aceptación',()=>{
 const r=run(quote().state,'ACEPTO')
 for(const command of ['volver','cambiar'])expect(run(r.state,command).state).toMatchObject({step:'vehicle',accepted:false})
 expect(run(r.state,'menú').state).not.toHaveProperty('accepted')
})
test('números del menú apuntan a los IDs vistos aunque se reordene el catálogo',()=>{
 const r=run(null,'tapiz')
 expect(run(r.state,'1',[...services].reverse()).reply).toContain('Tapiz Platino')
})
test('catálogo normal sigue disponible tras octubre y promoción respeta vencimiento',()=>{
 const later=new Date('2026-11-02T15:00:00Z')
 expect(catalogReply(null,'tapiz',services,later).handoff).toBe(false)
 expect(catalogReply(null,'promo',services,later).handoff).toBe(true)
})
test('conserva campaña en curso y permite salir al catálogo',()=>{
 const s:SalesState={version:1,step:'vehicle',misses:0}
 expect(run(s,'Toyota RAV4').state).toMatchObject({version:1,step:'category'})
 expect(run(s,'servicios').state).toMatchObject({version:2,step:'categories'})
})
test.each(['0','stop','[el cliente envió una imagen]','¿A domicilio?'])('deriva sin inventar ante %s',text=>expect(run(quote().state,text).handoff).toBe(true))
test('caída de catálogo y servicio retirado no inventan precios',()=>{
 expect(run(null,'servicios',[]).handoff).toBe(true)
 expect(run(quote().state,'ACEPTO',[]).handoff).toBe(true)
})
