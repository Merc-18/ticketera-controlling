-- ============================================================
-- Seed: Datos de prueba completos
-- Cubre: requests (pending/approved/rejected), projects
--        (active/blocked/completed/archived), project_flows,
--        activity_logs (SLA + fases), notificaciones.
-- REQUIERE: al menos 1 usuario admin en la tabla users.
-- Ejecutar en: Supabase → SQL Editor
-- ============================================================

DO $$
DECLARE
  -- ── Usuarios ─────────────────────────────────────────────
  admin_id  uuid;
  dev_id    uuid;
  extra_id  uuid;

  -- ── Requests ─────────────────────────────────────────────
  req_p1 uuid; req_p2 uuid; req_p3 uuid;          -- pendientes
  req_a1 uuid; req_a2 uuid; req_a3 uuid;          -- aprobados → activos
  req_a4 uuid; req_a5 uuid;                        -- aprobados → activos
  req_c1 uuid; req_c2 uuid;                        -- aprobados → completados
  req_r1 uuid;                                     -- rechazado

  -- ── Projects ─────────────────────────────────────────────
  proj_a1 uuid; proj_a2 uuid; proj_a3 uuid;       -- activos
  proj_a4 uuid; proj_a5 uuid;                      -- activos
  proj_b1 uuid;                                    -- activo bloqueado
  proj_c1 uuid; proj_c2 uuid;                      -- completados
  proj_arch uuid;                                  -- archivado

  -- ── Flows ────────────────────────────────────────────────
  flow_a1  uuid; flow_a2  uuid;
  flow_a3  uuid; flow_a3b uuid;   -- dual
  flow_a4  uuid; flow_a5  uuid;
  flow_b1  uuid; flow_b1b uuid;   -- dual bloqueado
  flow_c1  uuid;
  flow_c2a uuid; flow_c2b uuid;   -- dual completado
  flow_arch uuid;

  today date := CURRENT_DATE;

BEGIN
  -- ── Resolver usuarios ────────────────────────────────────
  SELECT id INTO admin_id FROM users WHERE role = 'admin'     AND is_active = true ORDER BY created_at LIMIT 1;
  SELECT id INTO dev_id   FROM users WHERE is_active = true   AND id <> admin_id   ORDER BY created_at LIMIT 1;
  IF dev_id   IS NULL THEN dev_id   := admin_id; END IF;
  SELECT id INTO extra_id FROM users WHERE is_active = true   AND id NOT IN (admin_id, dev_id) ORDER BY created_at LIMIT 1;
  IF extra_id IS NULL THEN extra_id := dev_id; END IF;

  -- ── Generar UUIDs ────────────────────────────────────────
  req_p1  := gen_random_uuid(); req_p2  := gen_random_uuid(); req_p3  := gen_random_uuid();
  req_a1  := gen_random_uuid(); req_a2  := gen_random_uuid(); req_a3  := gen_random_uuid();
  req_a4  := gen_random_uuid(); req_a5  := gen_random_uuid();
  req_c1  := gen_random_uuid(); req_c2  := gen_random_uuid();
  req_r1  := gen_random_uuid();

  proj_a1 := gen_random_uuid(); proj_a2 := gen_random_uuid(); proj_a3 := gen_random_uuid();
  proj_a4 := gen_random_uuid(); proj_a5 := gen_random_uuid();
  proj_b1 := gen_random_uuid();
  proj_c1 := gen_random_uuid(); proj_c2 := gen_random_uuid();
  proj_arch := gen_random_uuid();

  flow_a1  := gen_random_uuid(); flow_a2  := gen_random_uuid();
  flow_a3  := gen_random_uuid(); flow_a3b := gen_random_uuid();
  flow_a4  := gen_random_uuid(); flow_a5  := gen_random_uuid();
  flow_b1  := gen_random_uuid(); flow_b1b := gen_random_uuid();
  flow_c1  := gen_random_uuid();
  flow_c2a := gen_random_uuid(); flow_c2b := gen_random_uuid();
  flow_arch := gen_random_uuid();

  -- ══════════════════════════════════════════════════════════
  -- REQUESTS
  -- ══════════════════════════════════════════════════════════

  -- ── Pendientes ───────────────────────────────────────────
  INSERT INTO requests
    (id, request_number, status, request_type, origin,
     requester_name, requester_email, requester_area,
     description, needs_code, observations,
     data_system_involved, request_date, requested_date, created_at, updated_at)
  VALUES
    (req_p1, 'REQ26-T01', 'pending', 'Desarrollo de Software', 'Interno',
     'María Torres',  'mtorres@empresa.com',  'SAQ',
     'Necesitamos un módulo de alertas automáticas para stock bajo en almacén central. Debe integrarse con el sistema de inventario actual.',
     true, NULL, 'Sistema de Inventario (WMS)',
     today - 2, today + 14,
     NOW() - interval '2 days', NOW() - interval '2 days'),

    (req_p2, 'REQ26-T02', 'pending', 'Proceso Administrativo', 'Interno',
     'Carlos Ríos',   'crios@empresa.com',    'Finanzas',
     'Actualización del proceso de aprobación de gastos mayores a S/5,000. Incluye nuevo flujo de doble firma y registro en el ERP.',
     false, NULL, 'SAP ERP',
     today - 1, today + 7,
     NOW() - interval '1 day', NOW() - interval '1 day'),

    (req_p3, 'REQ26-T03', 'pending', 'Configuración de Sistema', 'Externo',
     'Ana Gutiérrez', 'agutierrez@cliente.com','Operaciones',
     'Falla crítica en el sistema de tracking de pedidos. Clientes no reciben confirmaciones de entrega. Afecta al 100% de las operaciones.',
     true,
     '🔴 URGENTE. Falla crítica en el sistema de tracking de pedidos. Clientes no reciben confirmaciones de entrega.',
     'Sistema Tracking (TMS)',
     today, today + 1,
     NOW() - interval '3 hours', NOW() - interval '3 hours');

  -- ── Aprobados → proyectos activos ────────────────────────
  INSERT INTO requests
    (id, request_number, status, request_type, origin,
     requester_name, requester_email, requester_area,
     description, needs_code, data_system_involved,
     request_date, requested_date, created_at, updated_at)
  VALUES
    (req_a1, 'REQ26-T04', 'approved', 'Desarrollo de Software', 'Interno',
     'Luis Mendoza',  'lmendoza@empresa.com', 'IT',
     'Desarrollo de API REST para integración con el ERP del proveedor logístico. Incluye autenticación OAuth2 y sincronización de órdenes en tiempo real.',
     true, 'ERP Interno / SAP Proveedor',
     today - 20, today + 10,
     NOW() - interval '20 days', NOW() - interval '18 days'),

    (req_a2, 'REQ26-T05', 'approved', 'Reporte / Análisis', 'Interno',
     'Sofía Castro',  'scastro@empresa.com',  'Ventas',
     'Dashboard interactivo de KPIs de ventas mensuales. Filtros por zona, producto y ejecutivo de cuenta. Exportación a Excel y PDF.',
     false, 'CRM / Power BI',
     today - 30, today + 20,
     NOW() - interval '30 days', NOW() - interval '28 days'),

    (req_a3, 'REQ26-T06', 'approved', 'Desarrollo de Software', 'Cliente',
     'Pedro Vargas',  'pvargas@empresa.com',  'Logística',
     'Plataforma de gestión de rutas con optimización automática (algoritmo genético). Incluye app móvil para conductores y panel web para supervisores.',
     true, 'GPS Tracker / Google Maps API',
     today - 15, today + 5,
     NOW() - interval '15 days', NOW() - interval '14 days'),

    (req_a4, 'REQ26-T07', 'approved', 'Proceso Administrativo', 'Regulatorio',
     'Diana Flores',  'dflores@empresa.com',  'RRHH',
     'Actualización del reglamento interno de teletrabajo según DS 027-2021-TR. Incluye modificación de contratos y actualización en el sistema HR.',
     false, 'HR System (BambooHR)',
     today - 10, today + 60,
     NOW() - interval '10 days', NOW() - interval '9 days'),

    (req_a5, 'REQ26-T08', 'approved', 'Configuración de Sistema', 'Regulatorio',
     'Jorge Ramírez', 'jramirez@empresa.com', 'Contabilidad',
     'Configuración del módulo de facturación electrónica según nuevos esquemas XML de SUNAT 2.1. Incluye integración con el proveedor OSE Efact.',
     true, 'ERP (SAP) / Efact OSE',
     today - 5, today + 45,
     NOW() - interval '5 days', NOW() - interval '4 days');

  -- ── Aprobados → proyectos completados ────────────────────
  INSERT INTO requests
    (id, request_number, status, request_type, origin,
     requester_name, requester_email, requester_area,
     description, needs_code, request_date, created_at, updated_at)
  VALUES
    (req_c1, 'REQ26-T09', 'approved', 'Desarrollo de Software', 'Interno',
     'Elena Núñez',   'enuñez@empresa.com',   'SAQ',
     'Módulo de reportes de producción diaria con exportación a Excel y envío automático por correo a gerencia.',
     true, today - 60,
     NOW() - interval '60 days', NOW() - interval '58 days'),

    (req_c2, 'REQ26-T10', 'approved', 'Proceso Administrativo', 'Interno',
     'Marco Delgado', 'mdelgado@empresa.com', 'Operaciones',
     'Rediseño completo del proceso de onboarding de nuevos proveedores. Formularios digitales, flujo de aprobación en 3 niveles y homologación automática.',
     false, today - 50,
     NOW() - interval '50 days', NOW() - interval '48 days');

  -- ── Rechazado ─────────────────────────────────────────────
  INSERT INTO requests
    (id, request_number, status, request_type, origin,
     requester_name, requester_email, requester_area,
     description, needs_code, rejection_reason,
     request_date, created_at, updated_at)
  VALUES
    (req_r1, 'REQ26-T11', 'rejected', 'Desarrollo de Software', 'Interno',
     'Roberto Silva', 'rsilva@empresa.com',   'Finanzas',
     'Aplicación móvil para control de gastos personales y viáticos de empleados con integración bancaria.',
     true,
     'La solicitud no se alinea con la estrategia tecnológica 2026. Existen herramientas corporativas (SAP Concur) que cubren esta necesidad. Se sugiere solicitar licencias adicionales al área IT.',
     today - 8,
     NOW() - interval '8 days', NOW() - interval '6 days');

  -- ══════════════════════════════════════════════════════════
  -- PROJECTS
  -- ══════════════════════════════════════════════════════════

  -- ── Activos ───────────────────────────────────────────────
  INSERT INTO projects
    (id, request_id, project_number, title, description,
     project_type, priority, status, is_blocked,
     start_date, due_date, sla_target_date, created_at, updated_at)
  VALUES
    -- Development | High | fase: dev (40%) | vence en 10 días
    (proj_a1, req_a1, 'INT26-T01',
     'API Integración ERP–Logística',
     'Endpoints REST con autenticación OAuth2 para sincronización bidireccional de órdenes de compra.',
     'development', 'high', 'active', false,
     today - 15, today + 10, today + 10,
     NOW() - interval '15 days', NOW() - interval '3 days'),

    -- Administrative | Medium | fase: build (60%) | vence en 20 días
    (proj_a2, req_a2, 'INT26-T02',
     'Dashboard KPIs de Ventas',
     'Panel interactivo con filtros por zona y producto. Stack: Power BI Embedded + React.',
     'administrative', 'medium', 'active', false,
     today - 25, today + 20, today + 20,
     NOW() - interval '25 days', NOW() - interval '5 days'),

    -- Dual | Urgent | dev: testing (60%) + admin: uat_validation (80%) | VENCIDO 3 días
    (proj_a3, req_a3, 'INT26-T03',
     'Plataforma Rutas Last-Mile',
     'Optimización de rutas con IA, app móvil Flutter para conductores y panel web Next.js para supervisores.',
     'dual', 'urgent', 'active', false,
     today - 14, today - 3, today - 3,
     NOW() - interval '14 days', NOW() - interval '1 day'),

    -- Administrative | Low | backlog | sin SLA (baja prioridad)
    (proj_a4, req_a4, 'INT26-T04',
     'Teletrabajo — Actualización Normativa',
     'Actualización de contratos y configuración en HR system según DS 027-2021-TR.',
     'administrative', 'low', 'active', false,
     today - 5, today + 60, NULL,
     NOW() - interval '5 days', NOW() - interval '5 days'),

    -- Development | High | fase: design (20%) | SLA en Q2
    (proj_a5, req_a5, 'INT26-T05',
     'Facturación Electrónica SUNAT 2.1',
     'Migración a nuevos esquemas XML con integración OSE Efact. Afecta módulos de ventas y compras.',
     'development', 'high', 'active', false,
     today - 3, today + 45, today + 45,
     NOW() - interval '3 days', NOW() - interval '3 days');

  -- ── Activo BLOQUEADO (dual) ───────────────────────────────
  INSERT INTO projects
    (id, project_number, title, description,
     project_type, priority, status,
     is_blocked, blocked_reason, blocked_since,
     start_date, due_date, sla_target_date, created_at, updated_at)
  VALUES
    (proj_b1, 'INT26-T06',
     'Portal Self-Service de Proveedores',
     'Nuevo portal para que proveedores gestionen órdenes de compra, facturas y homologación de forma autónoma.',
     'dual', 'high', 'active',
     true,
     'Pendiente aprobación de arquitectura de seguridad por Infosec. Ticket SEC-2026-089 abierto desde el 13/03.',
     NOW() - interval '2 days',
     today - 12, today + 8, today + 8,
     NOW() - interval '12 days', NOW() - interval '2 days');

  -- ── Completados ───────────────────────────────────────────
  INSERT INTO projects
    (id, request_id, project_number, title, description,
     project_type, priority, status, is_blocked,
     start_date, due_date, sla_target_date, created_at, updated_at)
  VALUES
    -- Completado A TIEMPO (cycle 45d, target today-8, completado today-10)
    (proj_c1, req_c1, 'INT26-T07',
     'Reportes de Producción Diaria',
     'Módulo de reportes automáticos con plantillas Excel dinámicas y envío programado a gerencia.',
     'development', 'medium', 'completed', false,
     today - 55, today - 8, today - 8,
     NOW() - interval '55 days', NOW() - interval '10 days'),

    -- Completado FUERA DE SLA (cycle 25d, target today-25, completado today-15)
    (proj_c2, req_c2, 'INT26-T08',
     'Onboarding Digital de Proveedores',
     'Proceso completamente digital con formularios, e-signatures y flujo de aprobación de 3 niveles.',
     'administrative', 'medium', 'completed', false,
     today - 40, today - 25, today - 25,
     NOW() - interval '40 days', NOW() - interval '15 days');

  -- ── Archivado ─────────────────────────────────────────────
  INSERT INTO projects
    (id, project_number, title, description,
     project_type, priority, status, is_blocked,
     start_date, created_at, updated_at)
  VALUES
    (proj_arch, 'INT26-T09',
     'Migración CRM Legacy → Salesforce',
     'Migración del CRM on-premise a Salesforce Cloud. Pausado por cambio de proveedor de implementación. Retomar Q3 2026.',
     'development', 'low', 'archived', false,
     today - 90,
     NOW() - interval '90 days', NOW() - interval '30 days');

  -- ── Actualizar project_id en requests ────────────────────
  UPDATE requests SET project_id = proj_a1 WHERE id = req_a1;
  UPDATE requests SET project_id = proj_a2 WHERE id = req_a2;
  UPDATE requests SET project_id = proj_a3 WHERE id = req_a3;
  UPDATE requests SET project_id = proj_a4 WHERE id = req_a4;
  UPDATE requests SET project_id = proj_a5 WHERE id = req_a5;
  UPDATE requests SET project_id = proj_c1  WHERE id = req_c1;
  UPDATE requests SET project_id = proj_c2  WHERE id = req_c2;

  -- ══════════════════════════════════════════════════════════
  -- PROJECT FLOWS
  -- ══════════════════════════════════════════════════════════
  INSERT INTO project_flows (id, project_id, flow_type, current_phase, progress, assigned_to)
  VALUES
    -- INT26-T01: development | dev (40%) | asignado a dev_id
    (flow_a1,  proj_a1, 'development',    'dev',            40,  dev_id),
    -- INT26-T02: administrative | build (60%) | asignado a admin_id
    (flow_a2,  proj_a2, 'administrative', 'build',          60,  admin_id),
    -- INT26-T03: dual — dev testing (60%) + admin uat_validation (80%)
    (flow_a3,  proj_a3, 'development',    'testing',        60,  dev_id),
    (flow_a3b, proj_a3, 'administrative', 'uat_validation', 80,  extra_id),
    -- INT26-T04: administrative | backlog | sin asignar
    (flow_a4,  proj_a4, 'administrative', 'backlog',        0,   NULL),
    -- INT26-T05: development | design (20%) | asignado a dev_id
    (flow_a5,  proj_a5, 'development',    'design',         20,  dev_id),
    -- INT26-T06: dual bloqueado — dev dev (40%) + admin build (60%)
    (flow_b1,  proj_b1, 'development',    'dev',            40,  dev_id),
    (flow_b1b, proj_b1, 'administrative', 'build',          60,  admin_id),
    -- INT26-T07: development completado (done 100%)
    (flow_c1,  proj_c1, 'development',    'done',          100,  dev_id),
    -- INT26-T08: dual completado — admin deployed (100%) + dev done (100%)
    (flow_c2a, proj_c2, 'administrative', 'deployed',      100,  admin_id),
    (flow_c2b, proj_c2, 'development',    'done',          100,  extra_id),
    -- INT26-T09: archivado — dev detenido en dev (30%)
    (flow_arch, proj_arch, 'development', 'dev',            30,  NULL);

  -- ══════════════════════════════════════════════════════════
  -- ACTIVITY LOGS
  -- ══════════════════════════════════════════════════════════

  -- ── Creación ──────────────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_a1,   'created', jsonb_build_object('title','API Integración ERP–Logística'),       NOW() - interval '15 days'),
    (proj_a2,   'created', jsonb_build_object('title','Dashboard KPIs de Ventas'),            NOW() - interval '25 days'),
    (proj_a3,   'created', jsonb_build_object('title','Plataforma Rutas Last-Mile'),          NOW() - interval '14 days'),
    (proj_a4,   'created', jsonb_build_object('title','Teletrabajo — Actualización'),        NOW() - interval '5 days'),
    (proj_a5,   'created', jsonb_build_object('title','Facturación Electrónica SUNAT 2.1'),   NOW() - interval '3 days'),
    (proj_b1,   'created', jsonb_build_object('title','Portal Self-Service de Proveedores'),  NOW() - interval '12 days'),
    (proj_c1,   'created', jsonb_build_object('title','Reportes de Producción Diaria'),       NOW() - interval '55 days'),
    (proj_c2,   'created', jsonb_build_object('title','Onboarding Digital de Proveedores'),   NOW() - interval '40 days'),
    (proj_arch, 'created', jsonb_build_object('title','Migración CRM Legacy → Salesforce'),   NOW() - interval '90 days');

  -- ── SLA Started ───────────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_a1, 'sla_started', jsonb_build_object('sla_formal_days',15,'sla_target_date',(today+10)::text,'request_number','REQ26-T04'), NOW() - interval '15 days'),
    (proj_a2, 'sla_started', jsonb_build_object('sla_formal_days',25,'sla_target_date',(today+20)::text,'request_number','REQ26-T05'), NOW() - interval '25 days'),
    (proj_a3, 'sla_started', jsonb_build_object('sla_formal_days',10,'sla_target_date',(today-3)::text, 'request_number','REQ26-T06'), NOW() - interval '14 days'),
    (proj_a5, 'sla_started', jsonb_build_object('sla_formal_days',30,'sla_target_date',(today+45)::text,'request_number','REQ26-T08'), NOW() - interval '3 days'),
    (proj_b1, 'sla_started', jsonb_build_object('sla_formal_days',15,'sla_target_date',(today+8)::text, 'request_number','INT26-T06'),  NOW() - interval '12 days'),
    (proj_c1, 'sla_started', jsonb_build_object('sla_formal_days',20,'sla_target_date',(today-8)::text, 'request_number','REQ26-T09'), NOW() - interval '55 days'),
    (proj_c2, 'sla_started', jsonb_build_object('sla_formal_days',20,'sla_target_date',(today-25)::text,'request_number','REQ26-T10'), NOW() - interval '40 days');

  -- ── Cambios de fase ───────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    -- proj_a1: backlog → design → dev
    (proj_a1, 'phase_changed', jsonb_build_object('from','backlog','to','design','duration_ms',172800000),   NOW() - interval '13 days'),
    (proj_a1, 'phase_changed', jsonb_build_object('from','design','to','dev','duration_ms',864000000),       NOW() - interval '3 days'),
    -- proj_a2: backlog → ready_to_start → discovery → build
    (proj_a2, 'phase_changed', jsonb_build_object('from','backlog','to','ready_to_start','duration_ms',86400000),  NOW() - interval '22 days'),
    (proj_a2, 'phase_changed', jsonb_build_object('from','ready_to_start','to','discovery','duration_ms',259200000), NOW() - interval '18 days'),
    (proj_a2, 'phase_changed', jsonb_build_object('from','discovery','to','build','duration_ms',432000000),  NOW() - interval '12 days'),
    -- proj_a3: backlog → design → dev → testing
    (proj_a3, 'phase_changed', jsonb_build_object('from','backlog','to','design','duration_ms',86400000),    NOW() - interval '12 days'),
    (proj_a3, 'phase_changed', jsonb_build_object('from','design','to','dev','duration_ms',259200000),       NOW() - interval '9 days'),
    (proj_a3, 'phase_changed', jsonb_build_object('from','dev','to','testing','duration_ms',345600000),      NOW() - interval '4 days'),
    -- proj_a5: backlog → design
    (proj_a5, 'phase_changed', jsonb_build_object('from','backlog','to','design','duration_ms',259200000),   NOW() - interval '2 days');

  -- ── Bloqueado ─────────────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_b1, 'blocked', jsonb_build_object(
      'reason','Pendiente aprobación de arquitectura de seguridad por Infosec. Ticket SEC-2026-089.'
    ), NOW() - interval '2 days');

  -- ── Priority changed ─────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_a3, 'priority_changed', jsonb_build_object('from','high','to','urgent'), NOW() - interval '10 days');

  -- ── SLA Completed (solo proyectos terminados) ─────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    -- INT26-T07: A TIEMPO — cycle 45d, target today-8, completado today-10 (antes del target)
    (proj_c1, 'sla_completed', jsonb_build_object(
      'cycle_time_days',  45,
      'due_date',         (today - 8)::text,
      'on_time',          true,
      'lead_time_days',   55,
      'approval_wait_days', 10
    ), NOW() - interval '10 days'),

    -- INT26-T08: FUERA DE SLA — cycle 25d, target today-25, completado today-15 (después del target)
    (proj_c2, 'sla_completed', jsonb_build_object(
      'cycle_time_days',  25,
      'due_date',         (today - 25)::text,
      'on_time',          false,
      'lead_time_days',   35,
      'approval_wait_days', 15
    ), NOW() - interval '15 days');

  -- ── Status changed → completed ────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_c1, 'status_changed', jsonb_build_object('from','active','to','completed'), NOW() - interval '10 days'),
    (proj_c2, 'status_changed', jsonb_build_object('from','active','to','completed'), NOW() - interval '15 days');

  -- ── Asignaciones ─────────────────────────────────────────
  INSERT INTO activity_logs (project_id, action, details, created_at) VALUES
    (proj_a1, 'assigned', jsonb_build_object('from',NULL,   'to',dev_id::text,   'flow_type','development'),   NOW() - interval '14 days'),
    (proj_a2, 'assigned', jsonb_build_object('from',NULL,   'to',admin_id::text, 'flow_type','administrative'),NOW() - interval '24 days'),
    (proj_a3, 'assigned', jsonb_build_object('from',NULL,   'to',dev_id::text,   'flow_type','development'),   NOW() - interval '13 days'),
    (proj_a3, 'assigned', jsonb_build_object('from',NULL,   'to',extra_id::text, 'flow_type','administrative'),NOW() - interval '13 days'),
    (proj_a5, 'assigned', jsonb_build_object('from',NULL,   'to',dev_id::text,   'flow_type','development'),   NOW() - interval '2 days');

  -- ══════════════════════════════════════════════════════════
  -- NOTIFICATIONS (para el usuario admin)
  -- ══════════════════════════════════════════════════════════
  INSERT INTO notifications (user_id, type, title, message, project_id, read, created_at) VALUES
    (admin_id, 'project_assigned', 'Proyecto asignado a vos',
     'API Integración ERP–Logística', proj_a1, false, NOW() - interval '14 days'),
    (admin_id, 'project_blocked',  'Proyecto bloqueado',
     'Portal Self-Service de Proveedores', proj_b1, false, NOW() - interval '2 days'),
    (dev_id,   'project_assigned', 'Proyecto asignado a vos',
     'Plataforma Rutas Last-Mile', proj_a3, true, NOW() - interval '13 days'),
    (dev_id,   'project_assigned', 'Proyecto asignado a vos',
     'Facturación Electrónica SUNAT 2.1', proj_a5, false, NOW() - interval '2 days');

  RAISE NOTICE '✅ Seed completado:';
  RAISE NOTICE '   • 11 requests (3 pending, 5 approved active, 2 approved completed, 1 rejected)';
  RAISE NOTICE '   • 9 projects (5 active, 1 blocked, 2 completed, 1 archived)';
  RAISE NOTICE '   • 12 project_flows';
  RAISE NOTICE '   • Activity logs: created, sla_started, phase_changed, blocked, sla_completed, assigned';
  RAISE NOTICE '   • 4 notifications';

END $$;
