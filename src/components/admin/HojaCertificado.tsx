import QRCode from 'qrcode'
import {
  TAREAS_POR_PLAN, DESTACADOS_POR_PLAN, urlGift, fechaLarga,
} from '@/lib/certificado'
import type { DatosCertificado } from '@/lib/certificado'
import BotonImprimir from './BotonImprimir'

/**
 * Hoja A4 del certificado de preparación.
 *
 * La comparten las dos rutas que lo generan: desde una reserva de convenio
 * y desde una factura ya cargada en el portal del socio. Lleva estilos
 * propios porque termina en papel o en un PDF que publica la automotora,
 * así que no puede depender del tema del panel.
 */
export default async function HojaCertificado(
  { d }: { d: DatosCertificado & { aviso: string | null } }
) {
  const tareas = TAREAS_POR_PLAN[d.plan] ?? { exterior: [], interior: [] }
  const destacados = DESTACADOS_POR_PLAN[d.plan] ?? []

  const qr = await QRCode.toString(urlGift(d.codigoGift), {
    type: 'svg', margin: 0, width: 140,
    color: { dark: '#0f172a', light: '#ffffff00' },
  })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="cert-barra">
        {d.aviso
          ? <span className="cert-aviso">⚠ {d.aviso}</span>
          : <span>Certificado {d.folio} · listo para guardar como PDF</span>}
        <BotonImprimir />
      </div>

      <div className="cert-hoja">
        <div className="cert-cab">
          <div className="cert-marca">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" />
            <div>
              <div className="cert-n">FULLSHINE</div>
              <div className="cert-s">Detailing Premium</div>
            </div>
          </div>
          <div className="cert-para">
            Preparado para
            <b>{d.socio}</b>
            Certificado {d.folio} · {fechaLarga(d.emitido)}
          </div>
        </div>

        <div className="cert-titular">
          <p className="cert-k">Certificado de preparación</p>
          <h1>Este vehículo fue preparado por especialistas</h1>
          <p>
            Antes de salir a la venta, esta unidad pasó por un proceso completo de detailing
            profesional en taller{d.horas > 0 ? `: ${d.horas} horas de trabajo técnico` : ''}.
            No es un lavado.
          </p>
        </div>

        <div className="cert-veh">
          <div><div className="e">Marca y modelo</div><div className="v">{d.marca} {d.modelo}</div></div>
          <div><div className="e">Año</div><div className="v">{d.anio ?? '—'}</div></div>
          <div><div className="e">Color</div><div className="v">{d.color ?? '—'}</div></div>
          <div><div className="e">Patente</div><div className="v">{d.patente ?? '—'}</div></div>
          <div><div className="e">Preparado el</div>
            <div className="v">{d.preparadoEl ? fechaLarga(d.preparadoEl) : '—'}</div></div>
        </div>

        <p className="cert-rot">Cómo se entrega el vehículo</p>
        <div className="cert-entrega">
          {destacados.map(x => (
            <div key={x.titulo} className="cert-eit">
              <div className="t"><span className="tick">✓</span>{x.titulo}</div>
              <div className="dsc">{x.detalle}</div>
            </div>
          ))}
        </div>

        <p className="cert-rot">Detalle del trabajo realizado</p>
        <div className="cert-dos">
          <div>
            <p className="cert-sub">Exterior</p>
            <ul className="cert-lista">
              {tareas.exterior.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div>
            <p className="cert-sub">Interior</p>
            <ul className="cert-lista">
              {tareas.interior.map(t => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </div>

        <div className="cert-gift">
          <div className="izq">
            <div className="et">Gift card</div>
            <div className="num">25<small>%</small></div>
            <div className="dd">de descuento<br />para el nuevo dueño</div>
          </div>
          <div className="med">
            <h2>Protege tu auto con tratamiento cerámico</h2>
            <p>
              Cerámica Nasiol ZR53 de 10H: 3 años de protección de fábrica, extensibles
              a 5 con la mantención semestral. Sella la pintura contra rayos UV,
              contaminación y micro-rayas del lavado.
            </p>
            <p className="cod">
              Código <span>{d.codigoGift}</span> · escanea o entra a fullshine.autos/giftcard
            </p>
            <p className="cond">
              Válida hasta el 31 de marzo de 2027 · Un uso por vehículo · Aplica sobre el valor
              de lista de los tratamientos cerámicos de 3 a 5 años · No acumulable con otras promociones.
            </p>
          </div>
          <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        </div>

        <div className="cert-pie-zona">
          <div className="cert-firma">
            <div className="f">
              <div className="linea" />
              <div className="q">Juan Sáez</div>
              <div className="dd">Fullshine Detailing Premium</div>
            </div>
            <div className="cert-sello">
              <b>Trabajo certificado</b>
              Camilo Henríquez 381, Concepción<br />
              +56 9 3365 4943 · fullshine.autos
            </div>
          </div>
          <div className="cert-pie">
            Este certificado detalla el trabajo de preparación realizado por Fullshine Detailing
            Premium sobre el vehículo individualizado. No constituye garantía sobre el estado
            mecánico ni estructural de la unidad.
          </div>
        </div>
      </div>
    </>
  )
}

const CSS = `
.cert-barra{background:#1e293b;color:#cbd5e1;padding:12px 20px;font-size:13px;
  text-align:center;display:flex;gap:14px;align-items:center;justify-content:center;flex-wrap:wrap}
.cert-aviso{color:#fbbf24;font-weight:600}
.cert-hoja{width:210mm;min-height:297mm;margin:22px auto;background:#fff;color:#0f172a;
  padding:13mm 14mm;display:flex;flex-direction:column;
  font-family:'Inter',system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)}
.cert-cab{display:flex;justify-content:space-between;align-items:center;
  border-bottom:2px solid #0f172a;padding-bottom:10px}
.cert-marca{display:flex;align-items:center;gap:10px}
.cert-marca img{width:42px;height:42px;object-fit:contain}
.cert-n{font-size:16px;font-weight:800;letter-spacing:.08em;line-height:1}
.cert-s{font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:#64748b;margin-top:3px}
.cert-para{text-align:right;font-size:9px;color:#64748b;line-height:1.5}
.cert-para b{display:block;font-size:12px;color:#0f172a;font-weight:700}
.cert-titular{text-align:center;padding:16px 0 13px}
.cert-k{font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#b26f05;margin:0}
.cert-titular h1{font-size:25px;font-weight:800;margin:5px 0 6px;letter-spacing:-.02em}
.cert-titular p{font-size:11px;color:#64748b;margin:0;line-height:1.55;max-width:74%;margin-inline:auto}
.cert-veh{background:#f8fafc;border-radius:6px;padding:11px 14px;
  display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.cert-veh .e{font-size:7.5px;text-transform:uppercase;letter-spacing:.09em;color:#94a3b8}
.cert-veh .v{font-size:11.5px;font-weight:700;margin-top:1px}
.cert-rot{font-size:8.5px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
  color:#b26f05;border-bottom:1px solid #e2e8f0;padding-bottom:3px;margin:13px 0 8px}
.cert-entrega{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.cert-eit{border:1px solid #e2e8f0;border-radius:6px;padding:9px 11px}
.cert-eit .t{font-size:10px;font-weight:700;display:flex;align-items:center;gap:5px}
.cert-eit .tick{color:#047857;font-weight:800}
.cert-eit .dsc{font-size:9px;color:#64748b;line-height:1.5;margin-top:3px}
.cert-dos{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.cert-lista{list-style:none;margin:0;padding:0}
.cert-lista li{font-size:9.5px;line-height:1.62;padding-left:13px;position:relative;color:#334155}
.cert-lista li::before{content:'';position:absolute;left:2px;top:6.5px;width:4px;height:4px;
  border-radius:50%;background:#b26f05}
.cert-sub{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  color:#64748b;margin:0 0 4px}
.cert-gift{margin-top:13px;display:flex;border-radius:9px;overflow:hidden;border:1.5px solid #0f172a}
.cert-gift .izq{background:#0f172a;color:#fff;padding:14px 16px;display:flex;
  flex-direction:column;justify-content:center;min-width:152px}
.cert-gift .et{font-size:7.5px;font-weight:700;letter-spacing:.22em;
  text-transform:uppercase;color:#f5b342}
.cert-gift .num{font-size:42px;font-weight:800;line-height:.9;margin:4px 0 2px;letter-spacing:-.04em}
.cert-gift .num small{font-size:20px;font-weight:700}
.cert-gift .izq .dd{font-size:8.5px;color:#cbd5e1;line-height:1.4}
.cert-gift .med{flex:1;padding:12px 15px;background:linear-gradient(105deg,#fffbeb,#fff)}
.cert-gift .med h2{font-size:14.5px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em;line-height:1.2}
.cert-gift .med p{font-size:9px;color:#475569;line-height:1.5;margin:0 0 5px}
.cert-gift .cod{font-size:8.5px;color:#64748b}
.cert-gift .cod span{font-weight:700;color:#0f172a;background:#fef3c7;
  padding:2px 7px;border-radius:3px;letter-spacing:.06em}
.cert-gift .cond{font-size:7px;color:#94a3b8;line-height:1.45;margin-top:5px}
.cert-gift .qr{padding:12px 14px;display:flex;align-items:center;justify-content:center;
  border-left:1px dashed #cbd5e1;background:#fff}
.cert-gift .qr svg{width:68px;height:68px;display:block}
.cert-pie-zona{margin-top:auto;padding-top:14px}
.cert-firma{display:flex;justify-content:space-between;align-items:flex-end;gap:20px}
.cert-firma .f{text-align:center;min-width:180px}
.cert-firma .linea{border-top:1px solid #0f172a;margin-bottom:4px}
.cert-firma .q{font-size:9.5px;font-weight:600}
.cert-firma .dd{font-size:8px;color:#64748b;margin-top:1px}
.cert-sello{text-align:right;font-size:8.5px;color:#64748b;line-height:1.5}
.cert-sello b{display:block;font-size:10px;color:#047857}
.cert-pie{margin-top:11px;border-top:1px solid #e2e8f0;padding-top:7px;
  font-size:7.5px;color:#94a3b8;line-height:1.5;text-align:center}
@page{size:A4;margin:0}
@media print{
  .cert-barra{display:none}
  .cert-hoja{margin:0;box-shadow:none;width:auto;min-height:auto}
  .cert-gift .izq{background:#0f172a !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cert-gift .med,.cert-veh{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`
