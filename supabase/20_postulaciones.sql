-- =============================================
-- FULLSHINE - Trabaja con nosotros
--
-- Tabla de postulaciones + bucket privado para los currículums.
-- El bucket es PRIVADO: los CV contienen datos personales y no deben
-- quedar accesibles con solo conocer la URL.
-- =============================================

CREATE TABLE IF NOT EXISTS job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  comuna        TEXT,

  -- Área de interés: detailing, lavado, administracion, otro
  area          TEXT,
  experiencia   TEXT,          -- descripción libre
  tiene_licencia BOOLEAN DEFAULT false,

  cv_path       TEXT,          -- ruta dentro del bucket 'cvs'
  cv_nombre     TEXT,          -- nombre original del archivo

  -- nueva | revisada | contactada | descartada
  estado        TEXT NOT NULL DEFAULT 'nueva',
  notas         TEXT,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT job_applications_estado_valido
    CHECK (estado IN ('nueva','revisada','contactada','descartada'))
);

CREATE INDEX IF NOT EXISTS idx_postulaciones_estado ON job_applications (estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_fecha  ON job_applications (created_at DESC);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS postulaciones_admin_all ON job_applications;
CREATE POLICY postulaciones_admin_all ON job_applications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Bucket privado para los CV ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cvs', 'cvs', false, 5242880,
  ARRAY['application/pdf','application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg','image/png']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 5242880,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Solo el service role (el servidor) sube y descarga. Nadie más.
DROP POLICY IF EXISTS cvs_admin_lectura ON storage.objects;
CREATE POLICY cvs_admin_lectura ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cvs');

-- =============================================
-- VERIFICACIÓN
--   SELECT estado, COUNT(*) FROM job_applications GROUP BY estado;
--   SELECT id, public FROM storage.buckets WHERE id = 'cvs';
-- =============================================
