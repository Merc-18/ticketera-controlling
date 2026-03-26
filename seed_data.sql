-- ============================================================
-- SEED DATA v3 - Ticketera Controlling Gilat
-- Novedades vs v2:
--   · Usuarios demo con UUIDs fijos (sin depender de auth)
--   · assigned_to en project_flows
--   · Activity logs: assigned, reassigned, due_date_changed, comment_added
--   · Comentarios con UUIDs fijos (para cross-referencia en logs)
--   · Checklist items para proyectos clave
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Desactivar FK checks para insertar usuarios demo sin auth
SET session_replication_role = 'replica';

-- ============================================================
-- 0. CLEANUP
-- ============================================================
DELETE FROM activity_logs;
DELETE FROM comments;
DELETE FROM checklist_items;
DELETE FROM project_flows;
UPDATE requests SET project_id = NULL WHERE project_id IS NOT NULL;
DELETE FROM projects;
DELETE FROM requests;

-- ============================================================
-- 1. USUARIOS DEMO
-- (UUIDs fijos — visibles en asignaciones de Actividad)
-- ============================================================
INSERT INTO users (id, email, full_name, role, is_active, created_at, updated_at)
VALUES
  ('aaaaaaaa-0001-0000-0000-000000000001', 'luis.garcia@gilat.pe',   'Luis García',      'developer', true, '2025-01-10 08:00:00+00', '2025-01-10 08:00:00+00'),
  ('aaaaaaaa-0002-0000-0000-000000000001', 'maria.rodriguez@gilat.pe','María Rodríguez', 'developer', true, '2025-01-10 08:00:00+00', '2025-01-10 08:00:00+00'),
  ('aaaaaaaa-0003-0000-0000-000000000001', 'pedro.castillo@gilat.pe', 'Pedro Castillo',  'developer', true, '2025-03-01 08:00:00+00', '2025-03-01 08:00:00+00')
ON CONFLICT (id) DO UPDATE SET
  full_name  = EXCLUDED.full_name,
  role       = EXCLUDED.role,
  is_active  = EXCLUDED.is_active;

-- ============================================================
-- 2. REQUESTS
-- ============================================================

-- Aprobadas con código
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0011-0000-0000-000000000001', 'REQ26-011', 'Ana Torres',    'ana.torres@gilat.pe', 'DDC',
 'Dashboard / Visualización (Streamlit)',
 'Interno', 'Power BI',
 'Crear dashboard de KPIs operacionales para monitoreo en tiempo real de servicios activos. Incluir métricas de SLA, disponibilidad por región y alertas automáticas.',
 'Incluir drill-down por área y comparativo mes anterior.',
 '2025-10-01', '2025-10-07', true, 'approved',
 '2025-10-01 08:00:00+00', '2025-10-05 10:00:00+00'),

('11111111-0022-0000-0000-000000000001', 'REQ26-022', 'Carlos Mamani', 'c.mamani@gilat.pe',  'SAQ',
 'Automatización con IA',
 'Interno', 'Power Automate',
 'Automatizar el proceso de envío de notificaciones de corte de servicio a clientes con personalización por segmento usando IA.',
 'Integrar con sistema CRM existente. Contemplar notificaciones por SMS y email.',
 '2025-10-05', '2025-10-14', true, 'approved',
 '2025-10-05 09:00:00+00', '2025-10-08 11:00:00+00'),

('11111111-0044-0000-0000-000000000001', 'REQ26-044', 'Miguel Ramos',  'm.ramos@gilat.pe',   'ATC',
 'Bug / Corrección',
 'Interno', 'BD (Access, Sql)',
 'Error en módulo de facturación que genera duplicados en facturas de clientes corporativos. Afecta cálculo de IGV en facturas mayores a S/10,000.',
 '🔴 URGENTE — Afecta 15% de las facturas del mes. Requiere coordinación directa con el equipo.',
 '2025-10-12', '2025-10-14', true, 'approved',
 '2025-10-12 11:00:00+00', '2025-10-14 08:00:00+00'),

('11111111-0045-0000-0000-000000000001', 'REQ26-045', 'Sofia Vargas',  's.vargas@gilat.pe',  'AASS',
 'Generación de documentos (PDF / Word / Excel), Organización y gestión de archivos',
 'Interno', 'Power Apps',
 'Digitalizar el proceso de registro de instalaciones de campo con firma digital, geolocalización y generación automática de actas en PDF organizadas por proyecto.',
 'Requiere app compatible con Android. Debe funcionar offline.',
 '2025-10-15', '2025-10-22', true, 'approved',
 '2025-10-15 14:00:00+00', '2025-10-18 10:00:00+00'),

('11111111-0046-0000-0000-000000000001', 'REQ26-046', 'Roberto Silva', 'r.silva@gilat.pe',   'DDC',
 'Extracción de datos (PDF / Excel / Web), Consolidación y transformación de datos',
 'Cliente', 'Sharepoint',
 'Integrar portal de clientes con sistema de tickets internos. Extracción diaria de datos de múltiples fuentes y consolidación en reporte unificado para visibilidad en tiempo real.',
 'Solicitado por cliente corporativo Banco BCP. Reporte consolidado en Excel y vista web.',
 '2025-11-01', '2025-11-10', true, 'approved',
 '2025-11-01 09:00:00+00', '2025-11-03 11:00:00+00'),

('11111111-0058-0000-0000-000000000001', 'REQ26-058', 'Juan Flores',   'j.flores@gilat.pe',  'ATC',
 'Automatización con IA',
 'Interno', 'Otro',
 'Implementar modelo de machine learning para predecir fallas de equipos en campo antes de que ocurran. Entrenamiento con datos históricos 2022-2025.',
 '🔴 URGENTE — Datos históricos disponibles y listos. Requiere coordinación directa con el equipo.',
 '2025-11-10', '2025-11-19', true, 'approved',
 '2025-11-10 08:00:00+00', '2025-11-12 10:00:00+00');

-- Aprobadas sin código
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0033-0000-0000-000000000001', 'REQ26-033', 'Lucía Quispe',  'l.quispe@gilat.pe',  'QA',
 'Reporte',
 'Interno', 'Excel',
 'Generar reporte mensual automático de incidencias por área y tipo de falla para distribución a gerencias.',
 NULL,
 '2025-10-10', NULL, false, 'approved',
 '2025-10-10 10:00:00+00', '2025-10-12 09:00:00+00'),

('11111111-0057-0000-0000-000000000001', 'REQ26-057', 'Patricia Luna', 'p.luna@gilat.pe',    'SAQ',
 'Mejora de proceso',
 'Regulatorio', 'Excel',
 'Actualizar proceso de validación de contratos según nueva normativa OSIPTEL 2025. Incluye revisión de formularios y flujos de aprobación.',
 'Plazo regulatorio: 31 Ene 2026.',
 '2025-11-05', NULL, false, 'approved',
 '2025-11-05 10:00:00+00', '2025-11-07 09:00:00+00');

-- Pendientes
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0069-0000-0000-000000000001', 'REQ26-069', 'Diana Chávez',  'd.chavez@gilat.pe',  'QA',
 'Capacitación',
 'Interno', 'Power BI',
 'Capacitación en uso avanzado de Power BI para el equipo de QA. 10 personas, nivel intermedio.',
 'Preferencia horario tarde, semanas impares.',
 '2025-12-01', NULL, false, 'pending',
 '2025-12-01 09:00:00+00', '2025-12-01 09:00:00+00'),

('11111111-0070-0000-0000-000000000001', 'REQ26-070', 'Andrés Cano',   'a.cano@gilat.pe',    'DDC',
 'Consolidación y transformación de datos, Extracción de datos (PDF / Excel / Web)',
 'Interno', 'BD (Access, Sql)',
 'Extracción y consolidación de datos desde múltiples fuentes operacionales para reportes de cierre mensual. Tiempo de respuesta actual supera los 30 segundos.',
 '🔴 URGENTE — Impacta el cierre contable mensual. Requiere coordinación directa con el equipo.',
 '2026-01-05', '2026-01-14', true, 'pending',
 '2026-01-05 10:00:00+00', '2026-01-05 10:00:00+00'),

('11111111-0071-0000-0000-000000000001', 'REQ26-071', 'Carla Medina',  'c.medina@gilat.pe',  'AASS',
 'Acceso / Permiso',
 'Interno', 'Sharepoint',
 'Solicitud de acceso a carpetas de contratos vigentes para tres nuevas incorporaciones del área AASS.',
 NULL,
 '2026-01-08', NULL, false, 'pending',
 '2026-01-08 11:00:00+00', '2026-01-08 11:00:00+00'),

('11111111-0073-0000-0000-000000000001', 'REQ26-073', 'Fernando Ríos', 'f.rios@gilat.pe',    'DDC',
 'Dashboard / Visualización (Streamlit)',
 'Interno', 'Power BI',
 'Solicitud de nuevo dashboard de seguimiento de indicadores de calidad de red para el equipo DDC.',
 NULL,
 '2026-02-10', '2026-03-07', true, 'pending',
 '2026-02-10 09:00:00+00', '2026-02-10 09:00:00+00');

-- Completada (para demostrar lead time)
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0030-0000-0000-000000000001', 'REQ26-030', 'Lucía Quispe', 'l.quispe@gilat.pe', 'QA',
 'Reporte / Informe ejecutivo',
 'Interno', 'Power BI',
 'Automatizar el reporte mensual de calidad de servicio con métricas de disponibilidad, MTTR y SLA por cliente. Distribución automática a gerencias.',
 'Incluir comparativo mes anterior y semáforo de alerta.',
 '2025-06-02', '2025-08-20', true, 'approved',
 '2025-06-02 09:00:00+00', '2025-06-06 10:00:00+00');

-- Rechazada
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, rejection_reason, created_at, updated_at)
VALUES
('11111111-0072-0000-0000-000000000001', 'REQ26-072', 'Héctor Bravo',  'h.bravo@gilat.pe',   'ATC',
 'Utilidad interna / Herramienta propia',
 'Interno', 'Otro',
 'Desarrollo de sistema de realidad aumentada para guiar técnicos en instalaciones de equipos satelitales en campo.',
 'Tecnología experimental. Sin casos de uso validados internamente.',
 '2025-09-15', NULL, true, 'rejected',
 'La tecnología propuesta es experimental y excede el alcance actual del equipo de Controlling. Se recomienda revisar en el próximo ciclo de planificación estratégica FY2027.',
 '2025-09-15 08:00:00+00', '2025-09-20 10:00:00+00');

-- ============================================================
-- 3. PROJECTS
-- ============================================================

INSERT INTO projects (id, request_id, title, description, project_type, priority, status, start_date, due_date, is_blocked, blocked_reason, blocked_since, tag_ids, created_at, updated_at)
VALUES

-- === ACTIVOS - DEVELOPMENT ===
('22222222-0001-0000-0000-000000000001', '11111111-0011-0000-0000-000000000001',
 'Dashboard KPI Operacional',
 'Dashboard interactivo en Streamlit con métricas de SLA, disponibilidad de red y tiempos de resolución. Incluye alertas automáticas y drill-down por región.',
 'development', 'high', 'active',
 '2025-10-06', '2026-04-30',
 false, NULL, NULL, '{}',
 '2025-10-06 08:00:00+00', '2026-02-10 15:00:00+00'),

('22222222-0002-0000-0000-000000000001', '11111111-0022-0000-0000-000000000001',
 'Sistema de Notificaciones con IA',
 'Automatización con IA para envío personalizado de notificaciones a clientes afectados por cortes. Segmentación por tipo de cliente e historial de contacto.',
 'development', 'urgent', 'active',
 '2025-10-09', '2026-03-31',
 true, 'Pendiente de credenciales API del CRM por parte de IT. Sin ETA de resolución confirmada.', '2026-01-20 09:00:00+00', '{}',
 '2025-10-09 09:00:00+00', '2026-01-20 09:00:00+00'),

('22222222-0003-0000-0000-000000000001', '11111111-0044-0000-0000-000000000001',
 'Fix Duplicados en Facturación',
 'Corrección de bug crítico en módulo de facturación. Afecta cálculo de IGV en facturas corporativas >S/10,000. Validado con 500 facturas históricas.',
 'development', 'urgent', 'active',
 '2025-10-14', '2025-11-15',
 false, NULL, NULL, '{}',
 '2025-10-14 11:00:00+00', '2026-02-20 16:00:00+00'),

('22222222-0004-0000-0000-000000000001', '11111111-0058-0000-0000-000000000001',
 'Modelo Predictivo de Fallas (ML)',
 'Modelo de machine learning para predicción de fallas en equipos satelitales. Entrenamiento con datos históricos 2022-2025. Deployment en Azure ML.',
 'development', 'urgent', 'active',
 '2025-11-13', '2026-06-30',
 false, NULL, NULL, '{}',
 '2025-11-13 08:00:00+00', '2026-01-15 10:00:00+00'),

('22222222-0005-0000-0000-000000000001', NULL,
 'Migración Base de Datos Legado',
 'Migración de base de datos Access a SQL Server 2022. Limpieza de datos, validación de integridad y creación de índices para optimización de consultas.',
 'development', 'high', 'active',
 '2025-09-01', '2026-01-31',
 false, NULL, NULL, '{}',
 '2025-09-01 08:00:00+00', '2026-02-05 11:00:00+00'),

-- === ACTIVOS - ADMINISTRATIVE ===
('22222222-0006-0000-0000-000000000001', '11111111-0033-0000-0000-000000000001',
 'Reporte Automático de Incidencias',
 'Automatización de reporte mensual de incidencias. Extracción desde múltiples fuentes, consolidación en Excel y distribución automática a gerencias vía email.',
 'administrative', 'medium', 'active',
 '2025-10-13', '2026-03-31',
 false, NULL, NULL, '{}',
 '2025-10-13 10:00:00+00', '2026-01-25 09:00:00+00'),

('22222222-0007-0000-0000-000000000001', '11111111-0057-0000-0000-000000000001',
 'Actualización Proceso Contratos OSIPTEL',
 'Revisión y actualización del proceso de validación de contratos según normativa OSIPTEL 2025. Nuevos formularios, flujos de aprobación y capacitación al equipo.',
 'administrative', 'urgent', 'active',
 '2025-11-08', '2026-01-31',
 false, NULL, NULL, '{}',
 '2025-11-08 10:00:00+00', '2026-02-01 08:00:00+00'),

('22222222-0008-0000-0000-000000000001', NULL,
 'Programa de Onboarding Técnicos 2026',
 'Diseño y ejecución del programa de inducción para 20 nuevos técnicos de campo. Materiales, cronograma, evaluaciones y certificación interna.',
 'administrative', 'low', 'active',
 '2026-01-15', '2026-03-19',
 false, NULL, NULL, '{}',
 '2026-01-15 09:00:00+00', '2026-02-10 10:00:00+00'),

-- === ACTIVOS - DUAL ===
('22222222-0009-0000-0000-000000000001', '11111111-0045-0000-0000-000000000001',
 'App Móvil de Instalaciones de Campo',
 'Power Apps para registro digital de instalaciones con firma, geolocalización y generación de actas PDF. Incluye proceso administrativo de aprobación y cierre.',
 'dual', 'high', 'active',
 '2025-10-20', '2026-04-30',
 false, NULL, NULL, '{}',
 '2025-10-20 14:00:00+00', '2026-02-08 11:00:00+00'),

('22222222-0010-0000-0000-000000000001', '11111111-0046-0000-0000-000000000001',
 'Consolidación Datos Portal BCP',
 'Extracción y consolidación de datos de múltiples fuentes para el portal de cliente Banco BCP. Reporte unificado diario y vista web de estado de tickets.',
 'dual', 'high', 'active',
 '2025-11-04', '2026-05-31',
 false, NULL, NULL, '{}',
 '2025-11-04 09:00:00+00', '2026-01-30 14:00:00+00'),

-- === COMPLETADOS ===
('22222222-0016-0000-0000-000000000001', '11111111-0030-0000-0000-000000000001',
 'Reporte Calidad de Servicio Automatizado',
 'Dashboard automático de calidad de servicio mensual con métricas de disponibilidad, MTTR y SLA por cliente. Distribución vía email a gerencias.',
 'development', 'high', 'completed',
 '2025-06-06', '2025-08-20',
 false, NULL, NULL, '{}',
 '2025-06-06 10:00:00+00', '2025-08-10 16:00:00+00'),

('22222222-0011-0000-0000-000000000001', NULL,
 'Automatización Carga Datos SAP',
 'Script Python para carga automática de datos financieros desde SAP a DataWarehouse. Reducción de tiempo de procesamiento de 4 horas a 8 minutos.',
 'development', 'high', 'completed',
 '2025-07-01', '2025-09-30',
 false, NULL, NULL, '{}',
 '2025-07-01 08:00:00+00', '2025-10-02 16:00:00+00'),

('22222222-0012-0000-0000-000000000001', NULL,
 'Política de Seguridad de Información',
 'Actualización de política interna según ISO 27001. Revisión, aprobación por Gerencia y comunicación a todo el personal.',
 'administrative', 'medium', 'completed',
 '2025-08-01', '2025-10-31',
 false, NULL, NULL, '{}',
 '2025-08-01 09:00:00+00', '2025-11-03 11:00:00+00'),

('22222222-0013-0000-0000-000000000001', NULL,
 'Dashboard Ventas Q3 2025',
 'Dashboard Power BI para seguimiento de ventas del Q3 2025. Conectado a Salesforce con actualización diaria automática y alertas por email.',
 'development', 'medium', 'completed',
 '2025-07-15', '2025-09-30',
 false, NULL, NULL, '{}',
 '2025-07-15 10:00:00+00', '2025-09-18 14:00:00+00'),

-- === ARCHIVADOS ===
('22222222-0014-0000-0000-000000000001', NULL,
 'Migración SharePoint On-Premise a Cloud',
 'Proyecto pausado por decisión estratégica. Migración de SharePoint local a Microsoft 365 en espera de aprobación presupuestal FY2026.',
 'administrative', 'low', 'archived',
 '2025-06-01', NULL,
 false, NULL, NULL, '{}',
 '2025-06-01 08:00:00+00', '2025-10-15 09:00:00+00'),

('22222222-0015-0000-0000-000000000001', NULL,
 'Chatbot Atención al Cliente',
 'Prototipo de chatbot con IA para atención de primer nivel. Archivado tras evaluación: inversión requerida supera el presupuesto disponible del área.',
 'development', 'low', 'archived',
 '2025-05-01', NULL,
 false, NULL, NULL, '{}',
 '2025-05-01 09:00:00+00', '2025-08-20 11:00:00+00');

-- ============================================================
-- 4. PROJECT FLOWS (con assigned_to en los proyectos clave)
-- ============================================================

INSERT INTO project_flows (id, project_id, flow_type, assigned_to, current_phase, progress, created_at, updated_at)
VALUES
-- Activos
('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', 'development',   'aaaaaaaa-0001-0000-0000-000000000001', 'testing',        60, '2025-10-06 08:00:00+00', '2026-02-10 15:00:00+00'),
('33333333-0002-0000-0000-000000000001', '22222222-0002-0000-0000-000000000001', 'development',   'aaaaaaaa-0002-0000-0000-000000000001', 'dev',            40, '2025-10-09 09:00:00+00', '2026-01-20 09:00:00+00'),
('33333333-0003-0000-0000-000000000001', '22222222-0003-0000-0000-000000000001', 'development',   'aaaaaaaa-0002-0000-0000-000000000001', 'deploy',         80, '2025-10-14 11:00:00+00', '2026-02-20 16:00:00+00'),
('33333333-0004-0000-0000-000000000001', '22222222-0004-0000-0000-000000000001', 'development',   'aaaaaaaa-0001-0000-0000-000000000001', 'design',         20, '2025-11-13 08:00:00+00', '2026-01-15 10:00:00+00'),
('33333333-0005-0000-0000-000000000001', '22222222-0005-0000-0000-000000000001', 'development',   NULL,                                   'dev',            40, '2025-09-01 08:00:00+00', '2026-02-05 11:00:00+00'),
('33333333-0006-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', 'administrative', 'aaaaaaaa-0003-0000-0000-000000000001', 'build',         60, '2025-10-13 10:00:00+00', '2026-01-25 09:00:00+00'),
('33333333-0007-0000-0000-000000000001', '22222222-0007-0000-0000-000000000001', 'administrative', 'aaaaaaaa-0002-0000-0000-000000000001', 'uat_validation', 80, '2025-11-08 10:00:00+00', '2026-02-01 08:00:00+00'),
('33333333-0008-0000-0000-000000000001', '22222222-0008-0000-0000-000000000001', 'administrative', NULL,                                   'ready_to_start', 20, '2026-01-15 09:00:00+00', '2026-02-10 10:00:00+00'),
-- Dual
('33333333-0009-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'development',   'aaaaaaaa-0001-0000-0000-000000000001', 'dev',            40, '2025-10-20 14:00:00+00', '2026-02-08 11:00:00+00'),
('33333333-0010-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'administrative', 'aaaaaaaa-0003-0000-0000-000000000001', 'discovery',     40, '2025-10-20 14:00:00+00', '2026-01-30 10:00:00+00'),
('33333333-0011-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'development',   'aaaaaaaa-0003-0000-0000-000000000001', 'design',         20, '2025-11-04 09:00:00+00', '2026-01-30 14:00:00+00'),
('33333333-0012-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'administrative', NULL,                                   'ready_to_start', 20, '2025-11-04 09:00:00+00', '2026-01-28 11:00:00+00'),
-- Completados
('33333333-0016-0000-0000-000000000001', '22222222-0016-0000-0000-000000000001', 'development',   'aaaaaaaa-0001-0000-0000-000000000001', 'done',          100, '2025-06-06 10:00:00+00', '2025-08-10 16:00:00+00'),
('33333333-0013-0000-0000-000000000001', '22222222-0011-0000-0000-000000000001', 'development',   'aaaaaaaa-0002-0000-0000-000000000001', 'done',          100, '2025-07-01 08:00:00+00', '2025-10-02 16:00:00+00'),
('33333333-0014-0000-0000-000000000001', '22222222-0012-0000-0000-000000000001', 'administrative', 'aaaaaaaa-0003-0000-0000-000000000001', 'deployed',      100, '2025-08-01 09:00:00+00', '2025-11-03 11:00:00+00'),
('33333333-0015-0000-0000-000000000001', '22222222-0013-0000-0000-000000000001', 'development',   'aaaaaaaa-0001-0000-0000-000000000001', 'done',          100, '2025-07-15 10:00:00+00', '2025-09-18 14:00:00+00'),
-- Archivados
('33333333-0018-0000-0000-000000000001', '22222222-0014-0000-0000-000000000001', 'administrative', NULL,                                   'discovery',     40, '2025-06-01 08:00:00+00', '2025-10-15 09:00:00+00'),
('33333333-0019-0000-0000-000000000001', '22222222-0015-0000-0000-000000000001', 'development',   NULL,                                   'design',         20, '2025-05-01 09:00:00+00', '2025-08-20 11:00:00+00');

-- ============================================================
-- 5. CHECKLIST ITEMS
-- ============================================================

-- Dashboard KPI — fase Testing
INSERT INTO checklist_items (project_flow_id, phase, description, completed, order_index, created_at, completed_at)
VALUES
('33333333-0001-0000-0000-000000000001', 'testing', 'Validar métricas con área DDC',         true,  1, '2026-01-21 09:00:00+00', '2026-01-28 11:00:00+00'),
('33333333-0001-0000-0000-000000000001', 'testing', 'Pruebas de carga con 50+ usuarios simultáneos', true,  2, '2026-01-21 09:00:00+00', '2026-02-04 14:00:00+00'),
('33333333-0001-0000-0000-000000000001', 'testing', 'Revisar drill-down por región en mobile', false, 3, '2026-01-21 09:00:00+00', NULL),
('33333333-0001-0000-0000-000000000001', 'testing', 'Sign-off de usuarios clave (Ana Torres)', false, 4, '2026-01-21 09:00:00+00', NULL);

-- Fix Facturación — fase Deploy
INSERT INTO checklist_items (project_flow_id, phase, description, completed, order_index, created_at, completed_at)
VALUES
('33333333-0003-0000-0000-000000000001', 'deploy', 'Backup completo de base de datos productiva', true,  1, '2026-02-15 09:00:00+00', '2026-02-17 08:00:00+00'),
('33333333-0003-0000-0000-000000000001', 'deploy', 'Deploy en ventana de mantenimiento nocturna', false, 2, '2026-02-15 09:00:00+00', NULL),
('33333333-0003-0000-0000-000000000001', 'deploy', 'Validar 100 facturas post-deploy',            false, 3, '2026-02-15 09:00:00+00', NULL),
('33333333-0003-0000-0000-000000000001', 'deploy', 'Comunicar a Miguel Ramos (ATC) resultado',    false, 4, '2026-02-15 09:00:00+00', NULL);

-- Contratos OSIPTEL — fase UAT Validation
INSERT INTO checklist_items (project_flow_id, phase, description, completed, order_index, created_at, completed_at)
VALUES
('33333333-0007-0000-0000-000000000001', 'uat_validation', 'Revisión legal de nuevos formularios',     true,  1, '2026-01-30 09:00:00+00', '2026-02-05 11:00:00+00'),
('33333333-0007-0000-0000-000000000001', 'uat_validation', 'Capacitación equipo SAQ (8 personas)',     true,  2, '2026-01-30 09:00:00+00', '2026-02-12 15:00:00+00'),
('33333333-0007-0000-0000-000000000001', 'uat_validation', 'Prueba piloto con 10 contratos reales',    false, 3, '2026-01-30 09:00:00+00', NULL),
('33333333-0007-0000-0000-000000000001', 'uat_validation', 'Aprobación final Gerencia Legal',          false, 4, '2026-01-30 09:00:00+00', NULL);

-- ============================================================
-- 6. COMMENTS (con UUIDs fijos para referenciar en logs)
-- ============================================================

INSERT INTO comments (id, project_id, content, created_at)
VALUES
('55555555-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001',
 'Se completó el modelado de datos. Pendiente validar con DDC los KPIs definitivos para la vista ejecutiva.',
 '2026-01-22 10:00:00+00'),

('55555555-0002-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001',
 'UAT programado para semana del 17 de febrero. Se convocará a usuarios clave de cada área.',
 '2026-02-10 15:00:00+00'),

('55555555-0003-0000-0000-000000000001', '22222222-0002-0000-0000-000000000001',
 'IT confirmó que las credenciales API estarán disponibles el 15 de marzo. Reanudamos desarrollo en esa fecha.',
 '2026-01-22 11:00:00+00'),

('55555555-0004-0000-0000-000000000001', '22222222-0003-0000-0000-000000000001',
 'Fix aplicado en ambiente QA. Validado con 500 facturas históricas sin errores. En espera de ventana de deploy productivo.',
 '2026-02-18 16:00:00+00'),

('55555555-0005-0000-0000-000000000001', '22222222-0003-0000-0000-000000000001',
 'Fecha de deploy confirmada: viernes 28 de febrero, ventana 01:00–03:00 AM. Coordinado con infraestructura.',
 '2026-02-20 09:00:00+00'),

('55555555-0006-0000-0000-000000000001', '22222222-0004-0000-0000-000000000001',
 'Dataset limpio y cargado en Azure Blob Storage. Iniciando fase de feature engineering esta semana.',
 '2026-01-15 10:00:00+00'),

('55555555-0007-0000-0000-000000000001', '22222222-0007-0000-0000-000000000001',
 'Reunión con Legal el 5 de febrero. Confirmaron que los cambios normativos afectan también al proceso de renovación automática.',
 '2026-02-06 09:00:00+00'),

('55555555-0008-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001',
 'Primera versión de la app disponible en entorno de pruebas. Enviadas invitaciones a 5 técnicos piloto para validación en campo.',
 '2026-02-08 11:00:00+00'),

('55555555-0009-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001',
 'Definida estructura del reporte consolidado con el cliente BCP. Aprobado el modelo de datos. Iniciando desarrollo del extractor.',
 '2026-01-30 14:00:00+00'),

('55555555-0010-0000-0000-000000000001', '22222222-0005-0000-0000-000000000001',
 'Migración del 60% de tablas completada. Encontramos campos con encoding ANSI mezclado — se requiere conversión manual en ~200 registros.',
 '2026-02-05 11:00:00+00');

-- ============================================================
-- 7. ACTIVITY LOGS
-- Incluye todos los tipos: sla_started, phase_changed,
--   assigned, reassigned, due_date_changed, comment_added,
--   blocked, priority_changed, sla_completed
-- ============================================================

INSERT INTO activity_logs (project_id, action, details, created_at)
VALUES

-- ══════════════════════════════════════════════════════
-- Dashboard KPI (22222222-0001) — Luis García asignado
-- ══════════════════════════════════════════════════════
('22222222-0001-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-04-30", "request_number": "REQ26-011"}',
 '2025-10-06 08:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-10-06 08:30:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 172800000}',
 '2025-10-08 08:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 3283200000}',
 '2025-11-15 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'due_date_changed',
 '{"from": "2026-03-31", "to": "2026-04-30"}',
 '2025-12-10 09:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 5702400000}',
 '2026-01-20 14:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0001-0000-0000-000000000001", "preview": "Se completó el modelado de datos. Pendiente validar con DDC los KPIs definitivos para la vista ejecutiva."}',
 '2026-01-22 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0002-0000-0000-000000000001", "preview": "UAT programado para semana del 17 de febrero. Se convocará a usuarios clave de cada área."}',
 '2026-02-10 15:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Notificaciones IA (22222222-0002) — bloqueado + reasignación
-- ══════════════════════════════════════════════════════
('22222222-0002-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-31", "request_number": "REQ26-022"}',
 '2025-10-09 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-10-09 09:30:00+00'),
('22222222-0002-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 518400000}',
 '2025-10-15 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 4060800000}',
 '2025-12-01 11:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'reassigned',
 '{"from": "aaaaaaaa-0001-0000-0000-000000000001", "to": "aaaaaaaa-0002-0000-0000-000000000001", "flow_type": "development"}',
 '2025-12-15 10:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'blocked',
 '{"reason": "Pendiente de credenciales API del CRM. Sin ETA confirmada."}',
 '2026-01-20 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0003-0000-0000-000000000001", "preview": "IT confirmó que las credenciales API estarán disponibles el 15 de marzo. Reanudamos desarrollo en esa fecha."}',
 '2026-01-22 11:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Fix Facturación (22222222-0003) — urgente, cambio de fecha, María asignada
-- ══════════════════════════════════════════════════════
('22222222-0003-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-11-15", "request_number": "REQ26-044"}',
 '2025-10-14 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0002-0000-0000-000000000001", "flow_type": "development"}',
 '2025-10-14 11:30:00+00'),
('22222222-0003-0000-0000-000000000001', 'priority_changed',
 '{"from": "high", "to": "urgent"}',
 '2025-10-15 08:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "dev", "duration_ms": 86400000}',
 '2025-10-15 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 2246400000}',
 '2025-11-11 10:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'due_date_changed',
 '{"from": "2025-10-25", "to": "2025-11-15"}',
 '2025-11-12 09:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "testing", "to": "deploy", "duration_ms": 5875200000}',
 '2026-01-20 10:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0004-0000-0000-000000000001", "preview": "Fix aplicado en ambiente QA. Validado con 500 facturas históricas sin errores. En espera de ventana de deploy productivo."}',
 '2026-02-18 16:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0005-0000-0000-000000000001", "preview": "Fecha de deploy confirmada: viernes 28 de febrero, ventana 01:00–03:00 AM. Coordinado con infraestructura."}',
 '2026-02-20 09:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Modelo Predictivo ML (22222222-0004)
-- ══════════════════════════════════════════════════════
('22222222-0004-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-06-30", "request_number": "REQ26-058"}',
 '2025-11-13 08:00:00+00'),
('22222222-0004-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-11-13 08:30:00+00'),
('22222222-0004-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 432000000}',
 '2025-11-18 08:00:00+00'),
('22222222-0004-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0006-0000-0000-000000000001", "preview": "Dataset limpio y cargado en Azure Blob Storage. Iniciando fase de feature engineering esta semana."}',
 '2026-01-15 10:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Migración BD Legado (22222222-0005) — sin responsable
-- ══════════════════════════════════════════════════════
('22222222-0005-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-01-31", "request_number": null}',
 '2025-09-01 08:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 345600000}',
 '2025-09-05 08:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 2246400000}',
 '2025-10-01 09:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'due_date_changed',
 '{"from": "2025-12-31", "to": "2026-01-31"}',
 '2025-12-20 10:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0010-0000-0000-000000000001", "preview": "Migración del 60% de tablas completada. Encontramos campos con encoding ANSI mezclado — se requiere conversión manual en ~200 r"}',
 '2026-02-05 11:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Reporte Incidencias (22222222-0006) — Pedro asignado
-- ══════════════════════════════════════════════════════
('22222222-0006-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-31", "request_number": "REQ26-033"}',
 '2025-10-13 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0003-0000-0000-000000000001", "flow_type": "administrative"}',
 '2025-10-13 10:30:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 259200000}',
 '2025-10-16 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "ready_to_start", "to": "discovery", "duration_ms": 1123200000}',
 '2025-11-29 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "discovery", "to": "build", "duration_ms": 3456000000}',
 '2026-01-29 09:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Contratos OSIPTEL (22222222-0007) — María, cambio de fecha
-- ══════════════════════════════════════════════════════
('22222222-0007-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-01-31", "request_number": "REQ26-057"}',
 '2025-11-08 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0002-0000-0000-000000000001", "flow_type": "administrative"}',
 '2025-11-08 10:30:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "discovery", "duration_ms": 259200000}',
 '2025-11-11 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "discovery", "to": "build", "duration_ms": 3110400000}',
 '2025-12-17 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'due_date_changed',
 '{"from": "2025-12-31", "to": "2026-01-31"}',
 '2025-12-22 09:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "build", "to": "uat_validation", "duration_ms": 2764800000}',
 '2026-01-29 08:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'reassigned',
 '{"from": "aaaaaaaa-0002-0000-0000-000000000001", "to": "aaaaaaaa-0002-0000-0000-000000000001", "flow_type": "administrative"}',
 '2026-01-29 09:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0007-0000-0000-000000000001", "preview": "Reunión con Legal el 5 de febrero. Confirmaron que los cambios normativos afectan también al proceso de renovación automática."}',
 '2026-02-06 09:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Onboarding Técnicos (22222222-0008)
-- ══════════════════════════════════════════════════════
('22222222-0008-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-19", "request_number": null}',
 '2026-01-15 09:00:00+00'),
('22222222-0008-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 2160000000}',
 '2026-02-10 09:00:00+00'),

-- ══════════════════════════════════════════════════════
-- App Instalaciones (22222222-0009) — DUAL: Luis (dev) + Pedro (admin)
-- ══════════════════════════════════════════════════════
('22222222-0009-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-04-30", "request_number": "REQ26-045"}',
 '2025-10-20 14:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-10-20 14:30:00+00'),
('22222222-0009-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0003-0000-0000-000000000001", "flow_type": "administrative"}',
 '2025-10-20 14:35:00+00'),
('22222222-0009-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 432000000}',
 '2025-10-25 14:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 3974400000}',
 '2025-12-11 11:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0008-0000-0000-000000000001", "preview": "Primera versión de la app disponible en entorno de pruebas. Enviadas invitaciones a 5 técnicos piloto para validación en campo."}',
 '2026-02-08 11:00:00+00'),

-- ══════════════════════════════════════════════════════
-- Portal BCP (22222222-0010) — Pedro (dev), cambio de fecha
-- ══════════════════════════════════════════════════════
('22222222-0010-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-05-31", "request_number": "REQ26-046"}',
 '2025-11-04 09:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0003-0000-0000-000000000001", "flow_type": "development"}',
 '2025-11-04 09:30:00+00'),
('22222222-0010-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 518400000}',
 '2025-11-10 09:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'phase_changed',
 '{"from": "ready_to_start", "to": "design", "duration_ms": 3456000000}',
 '2025-12-20 15:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'due_date_changed',
 '{"from": "2026-04-30", "to": "2026-05-31"}',
 '2026-01-28 10:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'comment_added',
 '{"comment_id": "55555555-0009-0000-0000-000000000001", "preview": "Definida estructura del reporte consolidado con el cliente BCP. Aprobado el modelo de datos. Iniciando desarrollo del extractor."}',
 '2026-01-30 14:00:00+00'),

-- ══════════════════════════════════════════════════════
-- COMPLETADO: Reporte Calidad (22222222-0016) — Lead Time demo
-- ══════════════════════════════════════════════════════
('22222222-0016-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-08-20", "request_number": "REQ26-030"}',
 '2025-06-06 10:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-06-06 10:30:00+00'),
('22222222-0016-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 259200000}',
 '2025-06-09 10:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 1209600000}',
 '2025-06-23 10:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 2592000000}',
 '2025-07-23 10:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'phase_changed',
 '{"from": "testing", "to": "done", "duration_ms": 1555200000}',
 '2025-08-10 16:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'status_changed',
 '{"from": "active", "to": "completed"}',
 '2025-08-10 16:00:00+00'),
('22222222-0016-0000-0000-000000000001', 'sla_completed',
 '{"cycle_time_days": 65, "due_date": "2025-08-20", "on_time": true, "lead_time_days": 69, "approval_wait_days": 4}',
 '2025-08-10 16:00:00+00'),

-- ══════════════════════════════════════════════════════
-- COMPLETADO: Automatización SAP (22222222-0011)
-- ══════════════════════════════════════════════════════
('22222222-0011-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-09-30", "request_number": null}',
 '2025-07-01 08:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0002-0000-0000-000000000001", "flow_type": "development"}',
 '2025-07-01 08:30:00+00'),
('22222222-0011-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 432000000}',
 '2025-07-06 08:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 2592000000}',
 '2025-08-05 10:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 2073600000}',
 '2025-09-29 10:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'phase_changed',
 '{"from": "testing", "to": "done", "duration_ms": 86400000}',
 '2025-09-30 10:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'status_changed',
 '{"from": "active", "to": "completed"}',
 '2025-10-02 16:00:00+00'),
('22222222-0011-0000-0000-000000000001', 'sla_completed',
 '{"cycle_time_days": 93, "due_date": "2025-09-30", "on_time": true}',
 '2025-10-02 16:00:00+00'),

-- ══════════════════════════════════════════════════════
-- COMPLETADO: Política Seguridad (22222222-0012) — FUERA DE SLA
-- ══════════════════════════════════════════════════════
('22222222-0012-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-10-31", "request_number": null}',
 '2025-08-01 09:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0003-0000-0000-000000000001", "flow_type": "administrative"}',
 '2025-08-01 09:30:00+00'),
('22222222-0012-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "discovery", "duration_ms": 604800000}',
 '2025-08-08 09:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'phase_changed',
 '{"from": "discovery", "to": "build", "duration_ms": 3456000000}',
 '2025-09-07 09:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'phase_changed',
 '{"from": "build", "to": "uat_validation", "duration_ms": 2073600000}',
 '2025-10-31 10:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'phase_changed',
 '{"from": "uat_validation", "to": "deployed", "duration_ms": 172800000}',
 '2025-11-02 10:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'status_changed',
 '{"from": "active", "to": "completed"}',
 '2025-11-03 11:00:00+00'),
('22222222-0012-0000-0000-000000000001', 'sla_completed',
 '{"cycle_time_days": 94, "due_date": "2025-10-31", "on_time": false}',
 '2025-11-03 11:00:00+00'),

-- ══════════════════════════════════════════════════════
-- COMPLETADO: Dashboard Ventas Q3 (22222222-0013) — A TIEMPO
-- ══════════════════════════════════════════════════════
('22222222-0013-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-09-30", "request_number": null}',
 '2025-07-15 10:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'assigned',
 '{"from": null, "to": "aaaaaaaa-0001-0000-0000-000000000001", "flow_type": "development"}',
 '2025-07-15 10:30:00+00'),
('22222222-0013-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 345600000}',
 '2025-07-19 10:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 1814400000}',
 '2025-08-08 10:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 2592000000}',
 '2025-09-07 14:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'phase_changed',
 '{"from": "testing", "to": "done", "duration_ms": 950400000}',
 '2025-09-18 14:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'status_changed',
 '{"from": "active", "to": "completed"}',
 '2025-09-18 14:00:00+00'),
('22222222-0013-0000-0000-000000000001', 'sla_completed',
 '{"cycle_time_days": 65, "due_date": "2025-09-30", "on_time": true}',
 '2025-09-18 14:00:00+00');

-- ============================================================
-- 8. LINK requests → projects
-- ============================================================

UPDATE requests SET project_id = '22222222-0001-0000-0000-000000000001' WHERE id = '11111111-0011-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0002-0000-0000-000000000001' WHERE id = '11111111-0022-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0003-0000-0000-000000000001' WHERE id = '11111111-0044-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0004-0000-0000-000000000001' WHERE id = '11111111-0058-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0006-0000-0000-000000000001' WHERE id = '11111111-0033-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0007-0000-0000-000000000001' WHERE id = '11111111-0057-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0009-0000-0000-000000000001' WHERE id = '11111111-0045-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0010-0000-0000-000000000001' WHERE id = '11111111-0046-0000-0000-000000000001';
UPDATE requests SET project_id = '22222222-0016-0000-0000-000000000001' WHERE id = '11111111-0030-0000-0000-000000000001';

-- Restaurar FK checks
SET session_replication_role = 'origin';

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  'Seed v3 ejecutado correctamente!' AS resultado,
  (SELECT COUNT(*) FROM users WHERE id::text LIKE 'aaaaaaaa%') AS usuarios_demo,
  (SELECT COUNT(*) FROM requests)                             AS requests,
  (SELECT COUNT(*) FROM projects)                             AS projects,
  (SELECT COUNT(*) FROM project_flows)                        AS flows,
  (SELECT COUNT(*) FROM project_flows WHERE assigned_to IS NOT NULL) AS flows_asignados,
  (SELECT COUNT(*) FROM checklist_items)                      AS checklist_items,
  (SELECT COUNT(*) FROM comments)                             AS comments,
  (SELECT COUNT(*) FROM activity_logs)                        AS activity_logs,
  (SELECT COUNT(*) FROM activity_logs WHERE action = 'assigned')       AS logs_assigned,
  (SELECT COUNT(*) FROM activity_logs WHERE action = 'reassigned')     AS logs_reassigned,
  (SELECT COUNT(*) FROM activity_logs WHERE action = 'due_date_changed') AS logs_due_date,
  (SELECT COUNT(*) FROM activity_logs WHERE action = 'comment_added')  AS logs_comments;
