-- =============================================
-- FULLSHINE - Estado de pago de las facturas del portal de socios
-- =============================================

ALTER TABLE partner_documents ADD COLUMN IF NOT EXISTS pagada    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE partner_documents ADD COLUMN IF NOT EXISTS pagada_at TIMESTAMPTZ;

COMMENT ON COLUMN partner_documents.pagada IS 'Solo aplica a documentos de tipo factura.';

CREATE INDEX IF NOT EXISTS idx_docs_pagada
  ON partner_documents (partner_id, pagada)
  WHERE tipo = 'factura';

-- Verificación:
-- SELECT titulo, monto_clp, pagada, pagada_at
-- FROM partner_documents WHERE tipo = 'factura' ORDER BY created_at DESC;
