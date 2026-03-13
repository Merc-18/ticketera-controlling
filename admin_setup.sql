-- ============================================================
-- ADMIN SETUP - Ticketera Controlling Gilat
-- Ejecutar en Supabase SQL Editor (en orden)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. MIGRACIÓN: Agregar columna is_active a la tabla users
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Actualizar usuarios existentes (asegurarse que todos estén activos)
UPDATE public.users SET is_active = true WHERE is_active IS NULL;

SELECT 'Columna is_active agregada correctamente' AS resultado;


-- ──────────────────────────────────────────────────────────────
-- 2. USUARIOS DE PRUEBA
--    Crea 3 usuarios con diferentes roles para testing.
--    Contraseñas:
--      admin@gilat.pe     → Admin123!
--      developer@gilat.pe → Dev123!
--      viewer@gilat.pe    → View123!
-- ──────────────────────────────────────────────────────────────

-- Usuario 1: Admin
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  -- Verificar si ya existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gilat.pe') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'admin@gilat.pe',
      crypt('Admin123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}', false, '', '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (v_user_id, 'admin@gilat.pe', 'María García', 'admin', true, NOW(), NOW());

    RAISE NOTICE 'Usuario admin@gilat.pe creado correctamente';
  ELSE
    RAISE NOTICE 'Usuario admin@gilat.pe ya existe, omitiendo...';
  END IF;
END $$;


-- Usuario 2: Developer
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'developer@gilat.pe') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'developer@gilat.pe',
      crypt('Dev123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}', false, '', '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (v_user_id, 'developer@gilat.pe', 'Carlos López', 'developer', true, NOW(), NOW());

    RAISE NOTICE 'Usuario developer@gilat.pe creado correctamente';
  ELSE
    RAISE NOTICE 'Usuario developer@gilat.pe ya existe, omitiendo...';
  END IF;
END $$;


-- Usuario 3: Viewer
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'viewer@gilat.pe') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'viewer@gilat.pe',
      crypt('View123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}', false, '', '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (v_user_id, 'viewer@gilat.pe', 'Patricia Mendoza', 'viewer', true, NOW(), NOW());

    RAISE NOTICE 'Usuario viewer@gilat.pe creado correctamente';
  ELSE
    RAISE NOTICE 'Usuario viewer@gilat.pe ya existe, omitiendo...';
  END IF;
END $$;


-- Usuario 4: Developer adicional (para tener más variedad en la carga de trabajo)
DO $$
DECLARE
  v_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dev2@gilat.pe') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'dev2@gilat.pe',
      crypt('Dev123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}', false, '', '', '', ''
    );

    INSERT INTO public.users (id, email, full_name, role, is_active, created_at, updated_at)
    VALUES (v_user_id, 'dev2@gilat.pe', 'Roberto Díaz', 'developer', true, NOW(), NOW());

    RAISE NOTICE 'Usuario dev2@gilat.pe creado correctamente';
  ELSE
    RAISE NOTICE 'Usuario dev2@gilat.pe ya existe, omitiendo...';
  END IF;
END $$;


-- ──────────────────────────────────────────────────────────────
-- 3. ASIGNAR PROYECTOS DE PRUEBA a los nuevos usuarios
--    Actualiza assigned_to en project_flows con los nombres reales
-- ──────────────────────────────────────────────────────────────

-- Carlos López → flujos de desarrollo (Dashboard KPI + Fix Duplicados + Modelo ML)
UPDATE public.project_flows
SET assigned_to = (SELECT id FROM public.users WHERE email = 'developer@gilat.pe' LIMIT 1)
WHERE id IN (
  '33333333-0001-0000-0000-000000000001',  -- Dashboard KPI (testing)
  '33333333-0003-0000-0000-000000000001',  -- Fix Duplicados (deploy)
  '33333333-0004-0000-0000-000000000001'   -- Modelo ML (design)
)
AND (SELECT id FROM public.users WHERE email = 'developer@gilat.pe' LIMIT 1) IS NOT NULL;

-- Roberto Díaz → flujos de desarrollo (Notificaciones + Migración BD)
UPDATE public.project_flows
SET assigned_to = (SELECT id FROM public.users WHERE email = 'dev2@gilat.pe' LIMIT 1)
WHERE id IN (
  '33333333-0002-0000-0000-000000000001',  -- Notificaciones Corte (dev, bloqueado)
  '33333333-0005-0000-0000-000000000001'   -- Migración BD (dev)
)
AND (SELECT id FROM public.users WHERE email = 'dev2@gilat.pe' LIMIT 1) IS NOT NULL;

-- María García (admin) → flujos administrativos (Contratos OSIPTEL + App Instalaciones admin)
UPDATE public.project_flows
SET assigned_to = (SELECT id FROM public.users WHERE email = 'admin@gilat.pe' LIMIT 1)
WHERE id IN (
  '33333333-0007-0000-0000-000000000001',  -- Contratos OSIPTEL (design)
  '33333333-0010-0000-0000-000000000001'   -- App Instalaciones - admin flow (discovery)
)
AND (SELECT id FROM public.users WHERE email = 'admin@gilat.pe' LIMIT 1) IS NOT NULL;

-- Patricia Mendoza (viewer) → flujos administrativos (Reporte Incidencias + Onboarding)
UPDATE public.project_flows
SET assigned_to = (SELECT id FROM public.users WHERE email = 'viewer@gilat.pe' LIMIT 1)
WHERE id IN (
  '33333333-0006-0000-0000-000000000001',  -- Reporte Incidencias (build)
  '33333333-0008-0000-0000-000000000001'   -- Onboarding Técnicos (ready_to_start)
)
AND (SELECT id FROM public.users WHERE email = 'viewer@gilat.pe' LIMIT 1) IS NOT NULL;

SELECT 'Asignaciones de proyectos actualizadas' AS resultado;


-- ──────────────────────────────────────────────────────────────
-- 4. VERIFICACIÓN FINAL
-- ──────────────────────────────────────────────────────────────
SELECT
  u.full_name,
  u.email,
  u.role,
  u.is_active,
  COUNT(pf.id) AS proyectos_asignados
FROM public.users u
LEFT JOIN public.project_flows pf ON pf.assigned_to = u.id
GROUP BY u.id, u.full_name, u.email, u.role, u.is_active
ORDER BY u.role, u.full_name;
