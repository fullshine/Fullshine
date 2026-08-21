-- =============================================
-- FULLSHINE - Portal de socios comerciales
--
-- Espacio privado por empresa con: agendamiento, historial de vehículos
-- atendidos, registro fotográfico y documentos (facturas, informes).
--
-- El acceso es por código compartido, no por usuario y contraseña: son
-- documentos comerciales entre dos empresas que ya se conocen, y obligar a
-- gestionar contraseñas garantizaría que nadie use la herramienta.
-- =============================================

-- ── Socios ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,       -- va en la URL: /socios/<slug>
  name             TEXT NOT NULL,
  access_code      TEXT NOT NULL,              -- código compartido de acceso
  -- Categoría de servicios con las tarifas negociadas de este socio.
  -- Cada socio tiene la suya, así los precios nunca se cruzan.
  service_category TEXT NOT NULL,
  contacto_nombre  TEXT,
  contacto_email   TEXT,
  activo           BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Documentos del socio ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partner_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- factura | informe | foto | otro
  tipo        TEXT NOT NULL DEFAULT 'factura',
  titulo      TEXT NOT NULL,
  descripcion TEXT,

  patente     TEXT,                            -- para asociar a un vehículo
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  periodo     TEXT,                            -- para facturas: '2026-08'
  monto_clp   INTEGER,

  file_path   TEXT NOT NULL,                   -- ruta en el bucket 'socios'
  file_name   TEXT NOT NULL,
  file_size   INTEGER,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT partner_documents_tipo_valido
    CHECK (tipo IN ('factura','informe','foto','otro'))
);

CREATE INDEX IF NOT EXISTS idx_docs_partner  ON partner_documents (partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_docs_tipo     ON partner_documents (tipo);
CREATE INDEX IF NOT EXISTS idx_docs_patente  ON partner_documents (patente);

ALTER TABLE partners          ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS partners_admin_all ON partners;
CREATE POLICY partners_admin_all ON partners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS docs_admin_all ON partner_documents;
CREATE POLICY docs_admin_all ON partner_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Bucket privado ──────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'socios', 'socios', false, 10485760,
  ARRAY['application/pdf','application/xml','text/xml',
        'image/jpeg','image/png','image/webp',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 10485760,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ── Automotora Fortia ───────────────────────────────────────────────────
-- ⚠️ CAMBIA el access_code por uno propio antes de compartirlo.
INSERT INTO partners (slug, name, access_code, service_category, activo)
VALUES ('fortia', 'Automotora Fortia', 'FORTIA2026', 'automotora', true)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      service_category = EXCLUDED.service_category,
      activo = true;

-- =============================================
-- VERIFICACIÓN
--   SELECT slug, name, access_code, service_category FROM partners;
-- =============================================
SELECT slug, name, access_code, service_category, activo FROM partners;
