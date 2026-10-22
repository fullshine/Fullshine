-- Ejecutar después de 14_agent_conversations.sql, antes de activar el flujo.
-- Solo estado del asistente: no crea ni modifica reservas.
ALTER TABLE public.agent_conversations
  ADD COLUMN IF NOT EXISTS flow_state jsonb;
COMMENT ON COLUMN public.agent_conversations.flow_state IS
  'Estado del flujo guiado sin IA: vehículo, categoría, aceptación y preferencia. Solo backend (RLS existente).';
