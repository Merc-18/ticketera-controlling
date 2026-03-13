-- ============================================================
-- TAGS MIGRATION - Ticketera Controlling Gilat
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Crear tabla de tags
CREATE TABLE IF NOT EXISTS public.tags (
  id      uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name    text        NOT NULL,
  color   text        NOT NULL DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Índice para búsqueda por nombre
CREATE UNIQUE INDEX IF NOT EXISTS tags_name_idx ON public.tags (lower(name));

-- 2. Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden leer tags
CREATE POLICY "Authenticated users can read tags"
  ON public.tags FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden crear/editar/eliminar tags
CREATE POLICY "Admins can manage tags"
  ON public.tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Tags de ejemplo
INSERT INTO public.tags (name, color) VALUES
  ('Backend',    '#6366f1'),
  ('Frontend',   '#8b5cf6'),
  ('BD/Datos',   '#0ea5e9'),
  ('Integración','#f97316'),
  ('Regulatorio','#ef4444'),
  ('Urgente',    '#dc2626'),
  ('Mejora',     '#10b981'),
  ('Bug Fix',    '#f59e0b')
ON CONFLICT DO NOTHING;

SELECT 'Tags migration completada' AS resultado;
SELECT id, name, color FROM public.tags ORDER BY name;
