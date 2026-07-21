-- =============================================
-- FULLSHINE - Agente IA de WhatsApp
-- Memoria de conversaciones + dedupe de mensajes
-- =============================================

CREATE TABLE IF NOT EXISTS agent_conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone text NOT NULL UNIQUE,             -- solo dígitos, ej: 56912345678
  customer_name text,                     -- nombre del perfil de WhatsApp
  status text NOT NULL DEFAULT 'active'   -- active | paused (derivado a humano)
    CHECK (status IN ('active', 'paused')),
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  green_msg_id text UNIQUE,               -- idMessage de GreenAPI (dedupe de reintentos)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_conv
  ON agent_messages (conversation_id, created_at DESC);

-- RLS: sin políticas públicas — solo el service role (backend) accede
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
