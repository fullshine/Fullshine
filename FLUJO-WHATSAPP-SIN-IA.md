# Fullshine: atención guiada con Green API, sin IA

El código quedó preparado en el repositorio compartido. No utiliza Claude, OpenAI ni otra API de inteligencia artificial para responder. Continúan los costos de Green API, alojamiento y publicidad que correspondan a los planes contratados.

## Conversación

1. El cliente escribe por la promoción o elige la opción 1 en el menú inicial.
2. El asistente solicita marca y modelo.
3. Solicita categoría: sedán/hatchback, SUV/camioneta o XL. Silverado, F-150 y 4Runner se clasifican directamente como XL; el menú indica que cualquier vehículo de tres corridas también es XL.
4. Informa el precio, atención en taller y duración de 5–6 horas. Exige escribir **ACEPTO** para continuar. Un «sí» ambiguo no se registra como aceptación.
5. Solicita fecha y preferencia de las 09:00 o 14:00, o «por coordinar».
6. Pausa el asistente y avisa al responsable con vehículo, categoría, precio, aceptación y preferencia. La solicitud no equivale a reserva confirmada.

Las preguntas frecuentes sobre dirección, domicilio, contenido, duración y vigencia reciben respuestas preparadas sin perder el paso actual. **CAMBIAR** permite corregir el vehículo y borra la aceptación anterior. **0** deriva a una persona. Ante adjuntos que requieren evaluación o dos respuestas no reconocidas, también deriva. El flujo no interpreta lenguaje libre como una IA.

## Oferta

| Categoría | Precio |
|---|---:|
| Sedán/hatchback | $169.990 |
| SUV/camioneta | $189.000 |
| XL | $209.990 |

Pulido abrillantador + limpieza de tapiz Platino, exclusivamente en Camilo Henríquez 381, Concepción. Tapiz sin desmontaje. No promete eliminación total de manchas o rayas.

Basta reservar hasta el 31 de octubre de 2026 inclusive, hora de Chile; el trabajo puede realizarse después. Consultar o cotizar no equivale a reservar. Al vencer la promoción, el flujo deriva para revisar reservas anteriores sin ofrecer precios promocionales a nuevas reservas.

## Validación local

- 23 pruebas aprobadas: precios, categorías XL, aceptación, rechazo, cambios, preguntas frecuentes, derivación humana, adjuntos, pausa, deduplicación y vencimiento en hora de Chile.
- Revisión de tipos TypeScript aprobada.
- Pruebas con servicios simulados: no se enviaron mensajes reales ni se comprobó la entrega del aviso al propio número del negocio.

## Puesta en marcha pendiente

1. Verificar la existencia de las tablas de `supabase/14_agent_conversations.sql`.
2. Aplicar `supabase/32_guided_whatsapp.sql`. Agrega el campo donde se guarda el paso de la conversación; no modifica reservas.
3. Publicar los cambios del repositorio en Vercel. Los archivos principales son `src/lib/agent/guided-flow.ts` y `src/lib/agent/index.ts`.
4. Configurar en Vercel `AGENT_WEBHOOK_SECRET` y, solo cuando esté todo listo, `AGENT_ENABLED=true`. Las claves de Green API y Supabase deben seguir disponibles en producción. No se necesitan `ANTHROPIC_API_KEY` ni `OPENAI_API_KEY`.
5. Configurar el webhook de Green API hacia `/api/whatsapp/agent`, usando el secreto del entorno conforme a la ruta existente. Revisar primero el destino actual para no interrumpir otra integración.
6. Los avisos usan `AGENT_HANDOFF_PHONE` si está configurado; de lo contrario, el número del negocio. Verificar que lleguen al +56 9 3365 4943 desde la instancia actual.
7. Probar desde un teléfono distinto, completar una conversación, verificar el aviso y confirmar que el bot no vuelva a intervenir. Los comandos `pausar <número>` y `activar <número>` son para el administrador; reactivar reinicia el flujo.
8. Publicar la campaña después de verificar el circuito completo.

## Límites actuales

El asistente no consulta disponibilidad ni crea reservas. El responsable debe verificar el límite de dos vehículos diarios, coordinar la entrega y registrar el importe promocional en el kanban. No se alteró la agenda existente ni se agregó el paquete al formulario genérico de reservas.

Los estados del flujo se guardan en Supabase; el historial conserva la deduplicación previa. Todavía es necesaria una prueba de extremo a extremo y de recuperación ante fallos de envío/conexión antes de operar sin supervisión.

No se realizaron despliegues, cambios en Vercel o Green API, migraciones de producción ni publicación de anuncios durante esta implementación.
