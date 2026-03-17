-- ============================================================
-- TAGS CLEANUP - Eliminar etiquetas que duplican campos dedicados
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- La tarjeta ya muestra estos datos como campos propios:
--   • Prioridad  → LOW / MEDIUM / HIGH / URGENT
--   • Área       → SAQ / DDC / QA / ATC / AASS
--   • Responsable → avatar + nombre del asignado
--   • Fecha límite → badge de vencimiento
--
-- Por tanto, las siguientes etiquetas son redundantes y se eliminan:

-- "Urgente" duplica el campo de prioridad (priority = 'urgent')
DELETE FROM public.tags WHERE lower(name) = 'urgente';

-- Si en el futuro se crearon etiquetas con nombres de áreas, eliminarlas:
DELETE FROM public.tags WHERE lower(name) IN ('saq','ddc','qa','atc','aass');

-- Si se crearon etiquetas con niveles de prioridad:
DELETE FROM public.tags WHERE lower(name) IN ('low','medium','high','urgent','baja','media','alta');

-- Verificar resultado
SELECT id, name, color FROM public.tags ORDER BY name;
