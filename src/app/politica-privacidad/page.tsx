import Link from 'next/link'
import { Metadata } from 'next'
import SiteNav from '@/components/SiteNav'
import SiteFooter from '@/components/SiteFooter'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Política de Privacidad — Fullshine Detailing Premium',
  description:
    'Cómo Fullshine Detailing Premium recopila, usa y protege los datos personales de sus clientes en Concepción, Chile.',
  alternates: { canonical: 'https://www.fullshine.autos/politica-privacidad' },
  robots: { index: true, follow: true },
}

const ACTUALIZADO = '5 de agosto de 2026'

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-3">{titulo}</h2>
      <div className="space-y-3 text-gray-400 leading-relaxed">{children}</div>
    </section>
  )
}

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SiteNav />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Política de Privacidad</h1>
          <p className="text-sm text-gray-500 mb-10">Última actualización: {ACTUALIZADO}</p>

          <Seccion titulo="Quiénes somos">
            <p>
              <strong className="text-white">Fullshine Detailing Premium</strong>, con taller en
              Camilo Henríquez 381, Concepción, Región del Biobío, Chile, es responsable del
              tratamiento de los datos personales descritos en este documento.
            </p>
            <p>
              Para cualquier consulta sobre tus datos puedes escribirnos al WhatsApp{' '}
              <a href="https://wa.me/56933654943" className="text-amber-400 hover:text-amber-300">
                +56 9 3365 4943
              </a>{' '}
              o al correo{' '}
              <a href="mailto:contacto@fullshine.autos" className="text-amber-400 hover:text-amber-300">
                contacto@fullshine.autos
              </a>.
            </p>
          </Seccion>

          <Seccion titulo="Qué datos recopilamos">
            <p>Solo pedimos lo necesario para atenderte:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-200">Datos de contacto:</strong> nombre, número de WhatsApp y, si nos lo das, correo electrónico.</li>
              <li><strong className="text-gray-200">Datos del vehículo:</strong> marca, modelo, año, color y patente cuando corresponde.</li>
              <li><strong className="text-gray-200">Datos de la reserva:</strong> servicio solicitado, fecha, hora y notas que nos indiques.</li>
              <li><strong className="text-gray-200">Datos técnicos de navegación:</strong> páginas visitadas y datos anónimos de uso del sitio.</li>
            </ul>
            <p>
              <strong className="text-white">No solicitamos ni almacenamos datos de tarjetas de
              crédito ni claves bancarias.</strong> Los pagos en línea se procesan a través de
              Flow, que gestiona esa información directamente en su propia plataforma.
            </p>
          </Seccion>

          <Seccion titulo="Para qué los usamos">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Gestionar tu reserva y coordinar el servicio.</li>
              <li>Enviarte confirmaciones y recordatorios de tu cita por WhatsApp.</li>
              <li>Emitir el certificado digital de garantía en los tratamientos cerámicos.</li>
              <li>Avisarte cuando corresponde la mantención semestral de tu tratamiento.</li>
              <li>Responder tus consultas y solicitarte una opinión sobre el servicio.</li>
              <li>Entender qué páginas del sitio funcionan mejor, con datos agregados.</li>
            </ul>
            <p>
              <strong className="text-white">No vendemos tus datos a terceros</strong>, ni los
              cedemos con fines publicitarios ajenos a Fullshine.
            </p>
          </Seccion>

          <Seccion titulo="Con quién los compartimos">
            <p>Solo con los proveedores necesarios para que el servicio funcione:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-200">Supabase</strong> — almacenamiento de la base de datos de reservas.</li>
              <li><strong className="text-gray-200">Vercel</strong> — alojamiento del sitio web.</li>
              <li><strong className="text-gray-200">Green API</strong> — envío de los mensajes de WhatsApp.</li>
              <li><strong className="text-gray-200">Flow</strong> — procesamiento de pagos en línea.</li>
              <li><strong className="text-gray-200">Google y Meta</strong> — medición de audiencia y publicidad.</li>
            </ul>
            <p>
              Algunos de estos servicios almacenan información en servidores fuera de Chile.
              Al usar nuestro sitio y contratar nuestros servicios, aceptas esa transferencia.
            </p>
          </Seccion>

          <Seccion titulo="Publicidad y cookies">
            <p>
              Usamos el <strong className="text-gray-200">Píxel de Meta</strong> y herramientas de
              analítica para medir el resultado de nuestros anuncios y mostrar publicidad a personas
              que visitaron el sitio. Estas herramientas usan cookies y tecnologías similares.
            </p>
            <p>
              Puedes desactivar las cookies desde la configuración de tu navegador, y gestionar la
              publicidad personalizada desde las preferencias de anuncios de{' '}
              <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300">Meta</a> y{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300">Google</a>.
            </p>
          </Seccion>

          <Seccion titulo="Mensajes por WhatsApp">
            <p>
              Al reservar nos autorizas a escribirte por WhatsApp para confirmar tu hora,
              recordarte la cita y avisarte de la mantención de tu tratamiento.
            </p>
            <p>
              <strong className="text-white">Puedes pedirnos que dejemos de escribirte en
              cualquier momento</strong>, respondiendo &quot;BAJA&quot; a cualquiera de nuestros
              mensajes. Lo respetamos de inmediato y sin preguntas.
            </p>
          </Seccion>

          <Seccion titulo="Cuánto tiempo los guardamos">
            <p>
              Conservamos los datos de tus servicios mientras exista relación comercial y por el
              tiempo necesario para respaldar garantías —los tratamientos cerámicos tienen hasta
              5 años de cobertura— y para cumplir obligaciones tributarias y legales.
            </p>
          </Seccion>

          <Seccion titulo="Tus derechos">
            <p>
              Conforme a la legislación chilena sobre protección de datos personales, puedes
              solicitarnos en cualquier momento:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-gray-200">Acceder</strong> a los datos que tenemos sobre ti.</li>
              <li><strong className="text-gray-200">Rectificar</strong> los que estén equivocados o desactualizados.</li>
              <li><strong className="text-gray-200">Eliminar</strong> tus datos, salvo aquellos que debamos conservar por ley.</li>
              <li><strong className="text-gray-200">Oponerte</strong> al envío de comunicaciones comerciales.</li>
            </ul>
            <p>
              Escríbenos por WhatsApp o correo y respondemos dentro de los siguientes días hábiles.
              No cobramos por ejercer estos derechos.
            </p>
          </Seccion>

          <Seccion titulo="Seguridad">
            <p>
              Tu información se almacena en servidores con conexión cifrada y acceso restringido.
              Solo el personal de Fullshine puede consultarla, y únicamente para atender tu servicio.
            </p>
          </Seccion>

          <Seccion titulo="Cambios a esta política">
            <p>
              Si modificamos este documento, actualizaremos la fecha del encabezado. Los cambios
              relevantes se anunciarán en el sitio.
            </p>
          </Seccion>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link href="/" className="text-amber-400 hover:text-amber-300 font-medium">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
