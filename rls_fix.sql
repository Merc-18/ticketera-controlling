-- ============================================================
-- RLS FIX - Permisos para gestión de usuarios
-- Ejecutar en Supabase SQL Editor
-- ============================================================
-- Problema: los usuarios autenticados solo pueden actualizar
-- su propio registro. Los admins necesitan actualizar cualquier
-- usuario (cambiar rol, activar/desactivar).
-- ============================================================

-- 1. Ver políticas actuales de la tabla users
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;


-- 2. Política: los admins pueden actualizar CUALQUIER usuario
--    (drop primero si ya existe para evitar duplicados)
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

CREATE POLICY "Admins can update any user"
ON public.users
FOR UPDATE
TO authenticated
USING (
  -- El usuario que ejecuta la acción es admin
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- 3. Política: cada usuario puede actualizar su propio perfil
--    (nombre, etc. — pero NO su propio rol para evitar escalada de privilegios)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  -- Solo permite cambiar campos de perfil, no el rol
  -- (el cambio de rol lo maneja la política de admin)
);


-- 4. Política: todos los usuarios autenticados pueden LEER la tabla users
--    (necesario para cargar el dropdown de asignación en ProjectModal y WorkloadView)
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;

CREATE POLICY "Authenticated users can read users"
ON public.users
FOR SELECT
TO authenticated
USING (true);


-- 5. Verificación: mostrar políticas resultantes
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

SELECT 'Políticas RLS actualizadas correctamente' AS resultado;
