-- ============================================================
-- SEED DATA - Ticketera Controlling Gilat
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Limpiar datos existentes (opcional, comentar si no deseas borrar)
-- DELETE FROM activity_logs;
-- DELETE FROM checklist_items;
-- DELETE FROM comments;
-- DELETE FROM project_flows;
-- DELETE FROM projects;
-- DELETE FROM requests;

-- ============================================================
-- 1. REQUESTS (solicitudes)
-- ============================================================

INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES

-- Aprobadas (vinculadas a proyectos)
('11111111-0011-0000-0000-000000000001', 'REQ-011', 'Ana Torres', 'ana.torres@gilat.pe',    'DDC',  'Feature nueva',              'Interno',     'Power BI',       'Crear dashboard de KPIs operacionales para monitoreo en tiempo real de servicios activos.',       'Incluir métricas de SLA y disponibilidad.',  '2025-10-01', '2025-11-01', true,  'approved', '2025-10-01 08:00:00+00', '2025-10-05 10:00:00+00'),
('11111111-0022-0000-0000-000000000001', 'REQ-022', 'Carlos Mamani', 'c.mamani@gilat.pe',  'SAQ',  'Automatización',             'Interno',     'Power Automate', 'Automatizar el proceso de envío de notificaciones de corte de servicio a clientes.',              'Integrar con sistema CRM existente.',        '2025-10-05', '2025-10-25', true,  'approved', '2025-10-05 09:00:00+00', '2025-10-08 11:00:00+00'),
('11111111-0033-0000-0000-000000000001', 'REQ-033', 'Lucía Quispe',  'l.quispe@gilat.pe',  'QA',   'Reporte',                    'Interno',     'Excel',          'Generar reporte mensual automático de incidencias por área y tipo de falla.',                     NULL,                                         '2025-10-10', '2025-11-10', false, 'approved', '2025-10-10 10:00:00+00', '2025-10-12 09:00:00+00'),
('11111111-0044-0000-0000-000000000001', 'REQ-044', 'Miguel Ramos',  'm.ramos@gilat.pe',   'ATC',  'Bug / Error',                'Interno',     'BD (Access, Sql)','Error en módulo de facturación que genera duplicados en facturas de clientes corporativos.',     'Afecta a 15% de las facturas del mes.',      '2025-10-12', '2025-10-20', true,  'approved', '2025-10-12 11:00:00+00', '2025-10-14 08:00:00+00'),
('11111111-0045-0000-0000-000000000001', 'REQ-045', 'Sofia Vargas',  's.vargas@gilat.pe',  'AASS', 'Digitalización de proceso',  'Interno',     'Power Apps',     'Digitalizar el proceso de registro de instalaciones de campo con firma digital y geolocalización.', 'Requiere app móvil compatible con Android.', '2025-10-15', '2025-12-01', true,  'approved', '2025-10-15 14:00:00+00', '2025-10-18 10:00:00+00'),
('11111111-0046-0000-0000-000000000001', 'REQ-046', 'Roberto Silva', 'r.silva@gilat.pe',   'DDC',  'Integración de sistemas',    'Cliente',     'Sharepoint',     'Integrar portal de clientes con sistema de tickets internos para visibilidad en tiempo real.',     'Cliente corporativo Banco BCP solicita esto.','2025-11-01', '2026-01-15', true,  'approved', '2025-11-01 09:00:00+00', '2025-11-03 11:00:00+00'),
('11111111-0057-0000-0000-000000000001', 'REQ-057', 'Patricia Luna', 'p.luna@gilat.pe',    'SAQ',  'Mejora de proceso',          'Regulatorio', 'Excel',          'Actualizar proceso de validación de contratos según nueva normativa OSIPTEL 2025.',              'Plazo regulatorio: 31 Ene 2026.',            '2025-11-05', '2026-01-31', false, 'approved', '2025-11-05 10:00:00+00', '2025-11-07 09:00:00+00'),
('11111111-0058-0000-0000-000000000001', 'REQ-058', 'Juan Flores',   'j.flores@gilat.pe',  'ATC',  'Automatización con IA',      'Interno',     'Otro',           'Implementar modelo de ML para predecir fallas de equipos en campo antes de que ocurran.',         'Datos históricos disponibles desde 2022.',   '2025-11-10', '2026-03-01', true,  'approved', '2025-11-10 08:00:00+00', '2025-11-12 10:00:00+00'),

-- Pendientes
('11111111-0069-0000-0000-000000000001', 'REQ-069', 'Diana Chávez',  'd.chavez@gilat.pe',  'QA',   'Capacitación',               'Interno',     'Power BI',       'Capacitación en uso de Power BI para el equipo de QA (10 personas).',                            'Preferencia horario tarde.',                 '2025-12-01', '2026-02-28', false, 'pending',  '2025-12-01 09:00:00+00', '2025-12-01 09:00:00+00'),
('11111111-0070-0000-0000-000000000001', 'REQ-070', 'Andrés Cano',   'a.cano@gilat.pe',    'DDC',  'Mejora técnica',             'Interno',     'BD (Access, Sql)','Optimización de consultas lentas en base de datos de reportes operacionales.',                   'Tiempo de respuesta actual >30 segundos.',   '2026-01-05', '2026-02-15', true,  'pending',  '2026-01-05 10:00:00+00', '2026-01-05 10:00:00+00'),
('11111111-0071-0000-0000-000000000001', 'REQ-071', 'Carla Medina',  'c.medina@gilat.pe',  'AASS', 'Acceso / Permiso',           'Interno',     'Sharepoint',     'Solicitud de acceso a carpetas de contratos para nuevo personal de AASS.',                        NULL,                                         '2026-01-08', '2026-01-15', false, 'pending',  '2026-01-08 11:00:00+00', '2026-01-08 11:00:00+00'),

-- Rechazada
('11111111-0072-0000-0000-000000000001', 'REQ-072', 'Héctor Bravo',  'h.bravo@gilat.pe',   'ATC',  'Feature nueva',              'Interno',     'Otro',           'Solicitud de sistema de realidad aumentada para guiar técnicos en instalaciones.',                'Tecnología experimental.',                   '2025-09-15', '2025-11-01', true,  'rejected', '2025-09-15 08:00:00+00', '2025-09-20 10:00:00+00');

-- ============================================================
-- 2. PROJECTS
-- ============================================================

INSERT INTO projects (id, request_id, title, description, project_type, priority, status, estimated_hours, actual_hours, start_date, due_date, is_blocked, blocked_reason, blocked_since, tag_ids, created_at, updated_at)
VALUES

-- === ACTIVOS - DEVELOPMENT ===
('22222222-0001-0000-0000-000000000001', '11111111-0011-0000-0000-000000000001',
 'Dashboard KPI Operacional', 'Dashboard interactivo en Power BI con métricas de SLA, disponibilidad de red y tiempos de resolución. Incluye alertas automáticas y drill-down por región.',
 'development', 'high', 'active', 80, 35, '2025-10-06', '2026-02-28', false, NULL, NULL, '{}', '2025-10-06 08:00:00+00', '2026-02-10 15:00:00+00'),

('22222222-0002-0000-0000-000000000001', '11111111-0022-0000-0000-000000000001',
 'Sistema de Notificaciones de Corte', 'Automatización en Power Automate para envío de SMS y email a clientes afectados por cortes programados y emergenciales. Integración con CRM Salesforce.',
 'development', 'urgent', 'active', 40, 40, '2025-10-09', '2025-12-15', true, 'Pendiente de credenciales API de Salesforce por parte del equipo de IT. Sin ETA de resolución.', '2026-01-20 09:00:00+00', '{}', '2025-10-09 09:00:00+00', '2026-01-20 09:00:00+00'),

('22222222-0003-0000-0000-000000000001', '11111111-0044-0000-0000-000000000001',
 'Fix Duplicados Facturación', 'Corrección de bug crítico en módulo de facturación que genera registros duplicados. Afecta cálculo de IGV en facturas >S/10,000 para clientes corporativos.',
 'development', 'urgent', 'active', 20, 18, '2025-10-14', '2025-10-25', false, NULL, NULL, '{}', '2025-10-14 11:00:00+00', '2026-02-20 16:00:00+00'),

('22222222-0004-0000-0000-000000000001', '11111111-0058-0000-0000-000000000001',
 'Modelo Predictivo de Fallas (ML)', 'Desarrollo de modelo de machine learning para predicción de fallas en equipos satelitales. Entrenamiento con datos históricos 2022-2025. Deployment en Azure ML.',
 'development', 'medium', 'active', 200, 30, '2025-11-13', '2026-06-30', false, NULL, NULL, '{}', '2025-11-13 08:00:00+00', '2026-01-15 10:00:00+00'),

('22222222-0005-0000-0000-000000000001', NULL,
 'Migración Base de Datos Legado', 'Migración de base de datos Access a SQL Server 2022. Incluye limpieza de datos, validación de integridad y creación de nuevos índices para optimización.',
 'development', 'high', 'active', 120, 55, '2025-09-01', '2026-01-31', false, NULL, NULL, '{}', '2025-09-01 08:00:00+00', '2026-02-05 11:00:00+00'),

-- === ACTIVOS - ADMINISTRATIVE ===
('22222222-0006-0000-0000-000000000001', '11111111-0033-0000-0000-000000000001',
 'Reporte Automático de Incidencias', 'Automatización de reporte mensual de incidencias. Extracción desde múltiples fuentes, consolidación en Excel y distribución automática a gerencias.',
 'administrative', 'medium', 'active', 24, 8, '2025-10-13', '2026-03-31', false, NULL, NULL, '{}', '2025-10-13 10:00:00+00', '2026-01-25 09:00:00+00'),

('22222222-0007-0000-0000-000000000001', '11111111-0057-0000-0000-000000000001',
 'Actualización Proceso Contratos OSIPTEL', 'Revisión y actualización del proceso de validación de contratos según normativa OSIPTEL 2025. Incluye nuevos formularios, flujos de aprobación y capacitación.',
 'administrative', 'urgent', 'active', 60, 15, '2025-11-08', '2026-01-31', false, NULL, NULL, '{}', '2025-11-08 10:00:00+00', '2026-02-01 08:00:00+00'),

('22222222-0008-0000-0000-000000000001', NULL,
 'Programa de Onboarding Técnicos 2026', 'Diseño y ejecución del programa de inducción para 20 nuevos técnicos de campo. Incluye materiales, cronograma, evaluaciones y certificación interna.',
 'administrative', 'low', 'active', 40, 5, '2026-01-15', '2026-03-15', false, NULL, NULL, '{}', '2026-01-15 09:00:00+00', '2026-02-10 10:00:00+00'),

-- === ACTIVOS - DUAL ===
('22222222-0009-0000-0000-000000000001', '11111111-0045-0000-0000-000000000001',
 'App Móvil de Instalaciones de Campo', 'Aplicación Power Apps para registro digital de instalaciones con firma, geolocalización y fotos. Incluye proceso administrativo de aprobación y cierre.',
 'dual', 'high', 'active', 160, 60, '2025-10-20', '2026-04-30', false, NULL, NULL, '{}', '2025-10-20 14:00:00+00', '2026-02-08 11:00:00+00'),

('22222222-0010-0000-0000-000000000001', '11111111-0046-0000-0000-000000000001',
 'Portal Cliente - Integración Tickets', 'Integración del portal web de clientes con sistema interno de tickets. Incluye desarrollo de API REST, documentación técnica y proceso de gestión de solicitudes.',
 'dual', 'high', 'active', 180, 20, '2025-11-04', '2026-05-31', false, NULL, NULL, '{}', '2025-11-04 09:00:00+00', '2026-01-30 14:00:00+00'),

-- === COMPLETADOS ===
('22222222-0011-0000-0000-000000000001', NULL,
 'Automatización Carga Datos SAP', 'Script Python para carga automática de datos financieros desde SAP a DataWarehouse. Reducción de tiempo de 4 horas a 8 minutos.',
 'development', 'high', 'completed', 60, 58, '2025-07-01', '2025-09-30', false, NULL, NULL, '{}', '2025-07-01 08:00:00+00', '2025-10-02 16:00:00+00'),

('22222222-0012-0000-0000-000000000001', NULL,
 'Política de Seguridad de Información', 'Actualización de la política interna de seguridad de información según ISO 27001. Revisión, aprobación por Gerencia y comunicación a todo el personal.',
 'administrative', 'medium', 'completed', 30, 32, '2025-08-01', '2025-10-31', false, NULL, NULL, '{}', '2025-08-01 09:00:00+00', '2025-11-03 11:00:00+00'),

('22222222-0013-0000-0000-000000000001', NULL,
 'Dashboard Ventas Q3 2025', 'Dashboard Power BI para seguimiento de ventas del Q3 2025. Conectado a Salesforce con actualización diaria automática.',
 'development', 'medium', 'completed', 40, 38, '2025-07-15', '2025-09-15', false, NULL, NULL, '{}', '2025-07-15 10:00:00+00', '2025-09-18 14:00:00+00'),

-- === ARCHIVADOS ===
('22222222-0014-0000-0000-000000000001', NULL,
 'Migración SharePoint On-Premise a Cloud', 'Proyecto pausado por decisión estratégica. Migración de SharePoint local a Microsoft 365 en espera de aprobación presupuestal FY2026.',
 'administrative', 'low', 'archived', 200, 15, '2025-06-01', NULL, false, NULL, NULL, '{}', '2025-06-01 08:00:00+00', '2025-10-15 09:00:00+00'),

('22222222-0015-0000-0000-000000000001', NULL,
 'Chatbot Atención al Cliente', 'Prototipo de chatbot con IA para atención de primer nivel. Archivado tras evaluación: requiere inversión mayor al presupuesto disponible.',
 'development', 'low', 'archived', 300, 40, '2025-05-01', NULL, false, NULL, NULL, '{}', '2025-05-01 09:00:00+00', '2025-08-20 11:00:00+00');

-- ============================================================
-- 3. PROJECT FLOWS
-- ============================================================

INSERT INTO project_flows (id, project_id, flow_type, current_phase, progress, created_at, updated_at)
VALUES

-- Dev: Dashboard KPI (en testing)
('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', 'development', 'testing', 65, '2025-10-06 08:00:00+00', '2026-02-10 15:00:00+00'),

-- Dev: Notificaciones Corte (en dev, bloqueado)
('33333333-0002-0000-0000-000000000001', '22222222-0002-0000-0000-000000000001', 'development', 'dev', 50, '2025-10-09 09:00:00+00', '2026-01-20 09:00:00+00'),

-- Dev: Fix Duplicados (en deploy)
('33333333-0003-0000-0000-000000000001', '22222222-0003-0000-0000-000000000001', 'development', 'deploy', 85, '2025-10-14 11:00:00+00', '2026-02-20 16:00:00+00'),

-- Dev: Modelo ML (en design)
('33333333-0004-0000-0000-000000000001', '22222222-0004-0000-0000-000000000001', 'development', 'design', 15, '2025-11-13 08:00:00+00', '2026-01-15 10:00:00+00'),

-- Dev: Migración BD (en dev)
('33333333-0005-0000-0000-000000000001', '22222222-0005-0000-0000-000000000001', 'development', 'dev', 45, '2025-09-01 08:00:00+00', '2026-02-05 11:00:00+00'),

-- Admin: Reporte Incidencias (en build)
('33333333-0006-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', 'administrative', 'build', 35, '2025-10-13 10:00:00+00', '2026-01-25 09:00:00+00'),

-- Admin: Contratos OSIPTEL (en design)
('33333333-0007-0000-0000-000000000001', '22222222-0007-0000-0000-000000000001', 'administrative', 'design', 25, '2025-11-08 10:00:00+00', '2026-02-01 08:00:00+00'),

-- Admin: Onboarding Técnicos (en ready_to_start)
('33333333-0008-0000-0000-000000000001', '22222222-0008-0000-0000-000000000001', 'administrative', 'ready_to_start', 10, '2026-01-15 09:00:00+00', '2026-02-10 10:00:00+00'),

-- Dual: App Instalaciones - Dev flow (en dev) + Admin flow (en discovery)
('33333333-0009-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'development',   'dev',       38, '2025-10-20 14:00:00+00', '2026-02-08 11:00:00+00'),
('33333333-0010-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'administrative', 'discovery', 20, '2025-10-20 14:00:00+00', '2026-01-30 10:00:00+00'),

-- Dual: Portal Cliente - Dev flow (en design) + Admin flow (en ready_to_start)
('33333333-0011-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'development',   'design',        12, '2025-11-04 09:00:00+00', '2026-01-30 14:00:00+00'),
('33333333-0012-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'administrative', 'ready_to_start', 8,  '2025-11-04 09:00:00+00', '2026-01-28 11:00:00+00'),

-- Completados
('33333333-0013-0000-0000-000000000001', '22222222-0011-0000-0000-000000000001', 'development',   'done',     100, '2025-07-01 08:00:00+00', '2025-10-02 16:00:00+00'),
('33333333-0014-0000-0000-000000000001', '22222222-0012-0000-0000-000000000001', 'administrative','deployed', 100, '2025-08-01 09:00:00+00', '2025-11-03 11:00:00+00'),
('33333333-0015-0000-0000-000000000001', '22222222-0013-0000-0000-000000000001', 'development',   'done',     100, '2025-07-15 10:00:00+00', '2025-09-18 14:00:00+00'),

-- Archivados
('33333333-0016-0000-0000-000000000001', '22222222-0014-0000-0000-000000000001', 'administrative', 'discovery', 8,  '2025-06-01 08:00:00+00', '2025-10-15 09:00:00+00'),
('33333333-0017-0000-0000-000000000001', '22222222-0015-0000-0000-000000000001', 'development',   'design',    13, '2025-05-01 09:00:00+00', '2025-08-20 11:00:00+00');

-- ============================================================
-- 4. ACTIVITY LOGS
-- ============================================================

INSERT INTO activity_logs (project_id, action, details, created_at)
VALUES

-- Dashboard KPI
('22222222-0001-0000-0000-000000000001', 'phase_changed', '{"from": "design", "to": "dev"}',        '2025-11-15 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed', '{"from": "dev", "to": "testing"}',       '2026-01-20 14:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'edited',        '{"fields": ["estimated_hours"]}',         '2026-02-05 09:00:00+00'),

-- Notificaciones de Corte
('22222222-0002-0000-0000-000000000001', 'phase_changed', '{"from": "backlog", "to": "design"}',    '2025-10-15 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'phase_changed', '{"from": "design", "to": "dev"}',        '2025-12-01 11:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'blocked',       '{"reason": "Pendiente de credenciales API de Salesforce"}', '2026-01-20 09:00:00+00'),

-- Fix Duplicados
('22222222-0003-0000-0000-000000000001', 'phase_changed', '{"from": "backlog", "to": "dev"}',       '2025-10-14 12:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed', '{"from": "dev", "to": "testing"}',       '2025-11-10 16:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed', '{"from": "testing", "to": "deploy"}',    '2026-01-25 10:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'priority_changed', '{"from": "high", "to": "urgent"}',    '2025-10-15 08:00:00+00'),

-- App Instalaciones
('22222222-0009-0000-0000-000000000001', 'phase_changed', '{"from": "backlog", "to": "design"}',    '2025-10-25 09:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'phase_changed', '{"from": "design", "to": "dev"}',        '2025-12-10 11:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'edited',        '{"fields": ["description", "estimated_hours"]}', '2026-01-08 14:00:00+00'),

-- Portal Cliente
('22222222-0010-0000-0000-000000000001', 'phase_changed', '{"from": "backlog", "to": "ready_to_start"}', '2025-11-10 10:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'phase_changed', '{"from": "ready_to_start", "to": "design"}',  '2025-12-20 15:00:00+00'),

-- Migración BD
('22222222-0005-0000-0000-000000000001', 'phase_changed', '{"from": "backlog", "to": "design"}',    '2025-09-05 08:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'phase_changed', '{"from": "design", "to": "dev"}',        '2025-10-01 09:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'edited',        '{"fields": ["actual_hours"]}',            '2026-02-05 16:00:00+00'),

-- Completados
('22222222-0011-0000-0000-000000000001', 'phase_changed', '{"from": "testing", "to": "done"}',      '2025-09-30 17:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'status_changed','{"from": "active", "to": "completed"}',  '2025-10-02 16:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'phase_changed', '{"from": "uat_validation", "to": "deployed"}', '2025-11-01 10:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'status_changed','{"from": "active", "to": "completed"}',  '2025-11-03 11:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'status_changed','{"from": "active", "to": "completed"}',  '2025-09-18 14:00:00+00');

-- ============================================================
-- 5. COMMENTS (algunos comentarios de ejemplo)
-- ============================================================

INSERT INTO comments (project_id, content, created_at)
VALUES
('22222222-0001-0000-0000-000000000001', 'Se completó el modelado de datos. Pendiente validar con el área de DDC los KPIs definitivos para la vista ejecutiva.', '2026-01-22 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'UAT programado para la semana del 17 de febrero. Se convocará a los usuarios clave de cada área.', '2026-02-10 15:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'IT confirmó que las credenciales API estarán disponibles el 28 de febrero. Reanudamos desarrollo en marzo.', '2026-01-22 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'Fix aplicado en ambiente QA. Validado con 500 facturas históricas sin errores. En espera de ventana de deploy.', '2026-02-18 16:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'Primera versión de la app disponible en entorno de pruebas. Se enviaron invitaciones a 5 técnicos piloto.', '2026-02-08 11:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'Reunión con área Legal el 5 de febrero. Confirmaron que los cambios normativos afectan también al proceso de renovación.', '2026-02-06 09:00:00+00');

-- ============================================================
-- FIN DEL SEED
-- ============================================================

SELECT 'Seed ejecutado correctamente!' as resultado,
  (SELECT COUNT(*) FROM requests) as requests,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM project_flows) as flows,
  (SELECT COUNT(*) FROM activity_logs) as activity_logs,
  (SELECT COUNT(*) FROM comments) as comments;
