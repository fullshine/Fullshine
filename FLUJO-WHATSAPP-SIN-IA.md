# WhatsApp: precios primero

Green API transporta los mensajes. La conversación usa reglas y el catálogo de Supabase, sin llamadas a proveedores de IA.

## Cotización

- Un saludo pregunta qué servicio interesa, sin exigir marca y modelo.
- Una consulta como «cuánto sale el tapiz» muestra los planes con precios por tamaño en la primera respuesta.
- Un servicio con nombre exacto muestra directamente su detalle y valores.
- La promoción muestra sus tres precios y vigencia antes de solicitar datos.
- No se adivina el tamaño de un modelo. Si el cliente declara sedán, SUV o XL, se muestra esa categoría; los vehículos XL conocidos y de tres corridas tienen prioridad.
- Los números siguen disponibles para elegir planes, pero no son obligatorios: también se aceptan nombres y consultas habituales.

## Solicitud de reserva

«Agendar», «quiero reservar» o «agendar 1» inicia la solicitud. Se pide marca/modelo, tamaño si falta y preferencia de fecha. No se exige escribir ACEPTO. Solicitar una hora no se registra como aceptación contractual ni reserva confirmada.

El equipo recibe servicio, vehículo, cotización comunicada y preferencia. Debe confirmar precio, condiciones y disponibilidad. El bot no consulta agenda ni bloquea cupos.

## Continuidad y controles

- Las conversaciones de versiones 1 y 2 se convierten a versión 3 al recibir el próximo mensaje; los números ya mostrados mantienen sus identificadores.
- Las conversaciones pausadas siguen pausadas. La intervención humana, deduplicación y límites de respuestas se mantienen en el procesador existente.
- Solo se incluyen categorías públicas expresamente permitidas; los convenios de Fortia y Concecars están excluidos.
- Una tarifa faltante se informa como «consultar», nunca como cero. Si se intenta reservar, pasa al equipo.
- Un servicio retirado pasa al equipo. Un cambio de precio durante la solicitud muestra el nuevo valor antes de continuar.
- La campaña solo se ofrece dentro de la vigencia definida en `october-campaign.ts`. Consultas anteriores no prolongan su vigencia.
- Fotografías, audios, solicitudes de atención humana y dudas no reconocidas se derivan; el sistema no interpreta libremente todos los mensajes como un modelo de IA.

## Archivos y validación

El flujo activo es `catalog-flow.ts`, invocado por `catalog-router.ts`. `guided-flow.ts` conserva los tipos y la implementación histórica, pero el router ya no ejecuta ese recorrido.

Las pruebas de catálogo cubren precios iniciales, selección, reservas sin aceptación obligatoria, migración, tarifas faltantes, exclusión de convenios, vencimiento y cambios de precio. Las pruebas de atención humana comprueban pausa y deduplicación. No se envían mensajes de prueba a clientes.
