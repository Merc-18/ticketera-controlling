-- ============================================================
-- SEED DATA v2 - Ticketera Controlling Gilat
-- Actualizado para reflejar todos los cambios implementados:
--   · Nuevos tipos de requerimiento (needs_code flow)
--   · Urgencia via prefijo 🔴 URGENTE en observations
--   · SLA tracking: sla_started / sla_completed en activity_logs
--   · duration_ms en phase_changed logs
--   · Sin estimated_hours / actual_hours en proyectos
--   · rejection_reason en solicitudes rechazadas
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Limpiar datos existentes
DELETE FROM activity_logs;
DELETE FROM comments;
DELETE FROM checklist_items;
DELETE FROM project_flows;
UPDATE requests SET project_id = NULL WHERE project_id IS NOT NULL;
DELETE FROM projects;
DELETE FROM requests;

-- ============================================================
-- 1. REQUESTS
-- ============================================================

-- Aprobadas con código
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0011-0000-0000-000000000001', 'REQ-011', 'Ana Torres',    'ana.torres@gilat.pe', 'DDC',
 'Dashboard / Visualización (Streamlit)',
 'Interno', 'Power BI',
 'Crear dashboard de KPIs operacionales para monitoreo en tiempo real de servicios activos. Incluir métricas de SLA, disponibilidad por región y alertas automáticas.',
 'Incluir drill-down por área y comparativo mes anterior.',
 '2025-10-01', '2025-10-07', true, 'approved',
 '2025-10-01 08:00:00+00', '2025-10-05 10:00:00+00'),

('11111111-0022-0000-0000-000000000001', 'REQ-022', 'Carlos Mamani', 'c.mamani@gilat.pe',  'SAQ',
 'Automatización con IA',
 'Interno', 'Power Automate',
 'Automatizar el proceso de envío de notificaciones de corte de servicio a clientes con personalización por segmento usando IA.',
 'Integrar con sistema CRM existente. Contemplar notificaciones por SMS y email.',
 '2025-10-05', '2025-10-14', true, 'approved',
 '2025-10-05 09:00:00+00', '2025-10-08 11:00:00+00'),

('11111111-0044-0000-0000-000000000001', 'REQ-044', 'Miguel Ramos',  'm.ramos@gilat.pe',   'ATC',
 'Bug / Corrección',
 'Interno', 'BD (Access, Sql)',
 'Error en módulo de facturación que genera duplicados en facturas de clientes corporativos. Afecta cálculo de IGV en facturas mayores a S/10,000.',
 '🔴 URGENTE — Afecta 15% de las facturas del mes. Requiere coordinación directa con el equipo.',
 '2025-10-12', '2025-10-14', true, 'approved',
 '2025-10-12 11:00:00+00', '2025-10-14 08:00:00+00'),

('11111111-0045-0000-0000-000000000001', 'REQ-045', 'Sofia Vargas',  's.vargas@gilat.pe',  'AASS',
 'Generación de documentos (PDF / Word / Excel), Organización y gestión de archivos',
 'Interno', 'Power Apps',
 'Digitalizar el proceso de registro de instalaciones de campo con firma digital, geolocalización y generación automática de actas en PDF organizadas por proyecto.',
 'Requiere app compatible con Android. Debe funcionar offline.',
 '2025-10-15', '2025-10-22', true, 'approved',
 '2025-10-15 14:00:00+00', '2025-10-18 10:00:00+00'),

('11111111-0046-0000-0000-000000000001', 'REQ-046', 'Roberto Silva', 'r.silva@gilat.pe',   'DDC',
 'Extracción de datos (PDF / Excel / Web), Consolidación y transformación de datos',
 'Cliente', 'Sharepoint',
 'Integrar portal de clientes con sistema de tickets internos. Extracción diaria de datos de múltiples fuentes y consolidación en reporte unificado para visibilidad en tiempo real.',
 'Solicitado por cliente corporativo Banco BCP. Reporte consolidado en Excel y vista web.',
 '2025-11-01', '2025-11-10', true, 'approved',
 '2025-11-01 09:00:00+00', '2025-11-03 11:00:00+00'),

('11111111-0058-0000-0000-000000000001', 'REQ-058', 'Juan Flores',   'j.flores@gilat.pe',  'ATC',
 'Automatización con IA',
 'Interno', 'Otro',
 'Implementar modelo de machine learning para predecir fallas de equipos en campo antes de que ocurran. Entrenamiento con datos históricos 2022-2025.',
 '🔴 URGENTE — Datos históricos disponibles y listos. Requiere coordinación directa con el equipo.',
 '2025-11-10', '2025-11-19', true, 'approved',
 '2025-11-10 08:00:00+00', '2025-11-12 10:00:00+00');

-- Aprobadas sin código
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0033-0000-0000-000000000001', 'REQ-033', 'Lucía Quispe',  'l.quispe@gilat.pe',  'QA',
 'Reporte',
 'Interno', 'Excel',
 'Generar reporte mensual automático de incidencias por área y tipo de falla para distribución a gerencias.',
 NULL,
 '2025-10-10', NULL, false, 'approved',
 '2025-10-10 10:00:00+00', '2025-10-12 09:00:00+00'),

('11111111-0057-0000-0000-000000000001', 'REQ-057', 'Patricia Luna', 'p.luna@gilat.pe',    'SAQ',
 'Mejora de proceso',
 'Regulatorio', 'Excel',
 'Actualizar proceso de validación de contratos según nueva normativa OSIPTEL 2025. Incluye revisión de formularios y flujos de aprobación.',
 'Plazo regulatorio: 31 Ene 2026.',
 '2025-11-05', NULL, false, 'approved',
 '2025-11-05 10:00:00+00', '2025-11-07 09:00:00+00');

-- Pendientes
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0069-0000-0000-000000000001', 'REQ-069', 'Diana Chávez',  'd.chavez@gilat.pe',  'QA',
 'Capacitación',
 'Interno', 'Power BI',
 'Capacitación en uso avanzado de Power BI para el equipo de QA. 10 personas, nivel intermedio.',
 'Preferencia horario tarde, semanas impares.',
 '2025-12-01', NULL, false, 'pending',
 '2025-12-01 09:00:00+00', '2025-12-01 09:00:00+00'),

('11111111-0070-0000-0000-000000000001', 'REQ-070', 'Andrés Cano',   'a.cano@gilat.pe',    'DDC',
 'Consolidación y transformación de datos, Extracción de datos (PDF / Excel / Web)',
 'Interno', 'BD (Access, Sql)',
 'Extracción y consolidación de datos desde múltiples fuentes operacionales para reportes de cierre mensual. Tiempo de respuesta actual supera los 30 segundos.',
 '🔴 URGENTE — Impacta el cierre contable mensual. Requiere coordinación directa con el equipo.',
 '2026-01-05', '2026-01-14', true, 'pending',
 '2026-01-05 10:00:00+00', '2026-01-05 10:00:00+00'),

('11111111-0071-0000-0000-000000000001', 'REQ-071', 'Carla Medina',  'c.medina@gilat.pe',  'AASS',
 'Acceso / Permiso',
 'Interno', 'Sharepoint',
 'Solicitud de acceso a carpetas de contratos vigentes para tres nuevas incorporaciones del área AASS.',
 NULL,
 '2026-01-08', NULL, false, 'pending',
 '2026-01-08 11:00:00+00', '2026-01-08 11:00:00+00');

-- Completada (para demostrar lead time tracking)
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, created_at, updated_at)
VALUES
('11111111-0030-0000-0000-000000000001', 'REQ-030', 'Lucía Quispe', 'l.quispe@gilat.pe', 'QA',
 'Reporte / Informe ejecutivo',
 'Interno', 'Power BI',
 'Automatizar el reporte mensual de calidad de servicio con métricas de disponibilidad, MTTR y SLA por cliente. Distribución automática a gerencias.',
 'Incluir comparativo mes anterior y semáforo de alerta.',
 '2025-06-02', '2025-08-20', true, 'approved',
 '2025-06-02 09:00:00+00', '2025-06-06 10:00:00+00');

-- Rechazada
INSERT INTO requests (id, request_number, requester_name, requester_email, requester_area, request_type, origin, data_system_involved, description, observations, request_date, requested_date, needs_code, status, rejection_reason, created_at, updated_at)
VALUES
('11111111-0072-0000-0000-000000000001', 'REQ-072', 'Héctor Bravo',  'h.bravo@gilat.pe',   'ATC',
 'Utilidad interna / Herramienta propia',
 'Interno', 'Otro',
 'Desarrollo de sistema de realidad aumentada para guiar técnicos en instalaciones de equipos satelitales en campo.',
 'Tecnología experimental. Sin casos de uso validados internamente.',
 '2025-09-15', NULL, true, 'rejected',
 'La tecnología propuesta es experimental y excede el alcance actual del equipo de Controlling. Se recomienda revisar en el próximo ciclo de planificación estratégica FY2027.',
 '2025-09-15 08:00:00+00', '2025-09-20 10:00:00+00');

-- ============================================================
-- 2. PROJECTS (sin estimated_hours ni actual_hours)
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
 '2025-10-14', '2025-10-25',
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
-- 3. PROJECT FLOWS
-- ============================================================

INSERT INTO project_flows (id, project_id, flow_type, current_phase, progress, created_at, updated_at)
VALUES
('33333333-0001-0000-0000-000000000001', '22222222-0001-0000-0000-000000000001', 'development',   'testing',        60, '2025-10-06 08:00:00+00', '2026-02-10 15:00:00+00'),
('33333333-0002-0000-0000-000000000001', '22222222-0002-0000-0000-000000000001', 'development',   'dev',            40, '2025-10-09 09:00:00+00', '2026-01-20 09:00:00+00'),
('33333333-0003-0000-0000-000000000001', '22222222-0003-0000-0000-000000000001', 'development',   'deploy',         80, '2025-10-14 11:00:00+00', '2026-02-20 16:00:00+00'),
('33333333-0004-0000-0000-000000000001', '22222222-0004-0000-0000-000000000001', 'development',   'design',         20, '2025-11-13 08:00:00+00', '2026-01-15 10:00:00+00'),
('33333333-0005-0000-0000-000000000001', '22222222-0005-0000-0000-000000000001', 'development',   'dev',            40, '2025-09-01 08:00:00+00', '2026-02-05 11:00:00+00'),
('33333333-0006-0000-0000-000000000001', '22222222-0006-0000-0000-000000000001', 'administrative', 'build',         60, '2025-10-13 10:00:00+00', '2026-01-25 09:00:00+00'),
('33333333-0007-0000-0000-000000000001', '22222222-0007-0000-0000-000000000001', 'administrative', 'uat_validation', 80, '2025-11-08 10:00:00+00', '2026-02-01 08:00:00+00'),
('33333333-0008-0000-0000-000000000001', '22222222-0008-0000-0000-000000000001', 'administrative', 'ready_to_start', 20, '2026-01-15 09:00:00+00', '2026-02-10 10:00:00+00'),
('33333333-0009-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'development',   'dev',            40, '2025-10-20 14:00:00+00', '2026-02-08 11:00:00+00'),
('33333333-0010-0000-0000-000000000001', '22222222-0009-0000-0000-000000000001', 'administrative', 'discovery',     40, '2025-10-20 14:00:00+00', '2026-01-30 10:00:00+00'),
('33333333-0011-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'development',   'design',         20, '2025-11-04 09:00:00+00', '2026-01-30 14:00:00+00'),
('33333333-0012-0000-0000-000000000001', '22222222-0010-0000-0000-000000000001', 'administrative', 'ready_to_start', 20, '2025-11-04 09:00:00+00', '2026-01-28 11:00:00+00'),
('33333333-0016-0000-0000-000000000001', '22222222-0016-0000-0000-000000000001', 'development',   'done',          100, '2025-06-06 10:00:00+00', '2025-08-10 16:00:00+00'),
('33333333-0013-0000-0000-000000000001', '22222222-0011-0000-0000-000000000001', 'development',   'done',          100, '2025-07-01 08:00:00+00', '2025-10-02 16:00:00+00'),
('33333333-0014-0000-0000-000000000001', '22222222-0012-0000-0000-000000000001', 'administrative', 'deployed',      100, '2025-08-01 09:00:00+00', '2025-11-03 11:00:00+00'),
('33333333-0015-0000-0000-000000000001', '22222222-0013-0000-0000-000000000001', 'development',   'done',          100, '2025-07-15 10:00:00+00', '2025-09-18 14:00:00+00'),
('33333333-0018-0000-0000-000000000001', '22222222-0014-0000-0000-000000000001', 'administrative', 'discovery',     40, '2025-06-01 08:00:00+00', '2025-10-15 09:00:00+00'),
('33333333-0019-0000-0000-000000000001', '22222222-0015-0000-0000-000000000001', 'development',   'design',         20, '2025-05-01 09:00:00+00', '2025-08-20 11:00:00+00');

-- ============================================================
-- 4. ACTIVITY LOGS
-- Incluye: sla_started, phase_changed con duration_ms,
--          sla_completed con on_time, status_changed, blocked
-- ============================================================

INSERT INTO activity_logs (project_id, action, details, created_at)
VALUES

-- ── Dashboard KPI (22222222-0001) ──────────────────────────
('22222222-0001-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-04-30", "request_number": "REQ-011"}',
 '2025-10-06 08:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 172800000}',
 '2025-10-08 08:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 3283200000}',
 '2025-11-15 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 5702400000}',
 '2026-01-20 14:00:00+00'),

-- ── Notificaciones con IA (22222222-0002) ──────────────────
('22222222-0002-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-31", "request_number": "REQ-022"}',
 '2025-10-09 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 518400000}',
 '2025-10-15 09:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 4060800000}',
 '2025-12-01 11:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'blocked',
 '{"reason": "Pendiente de credenciales API del CRM. Sin ETA confirmada."}',
 '2026-01-20 09:00:00+00'),

-- ── Fix Duplicados Facturación (22222222-0003) ─────────────
('22222222-0003-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-10-25", "request_number": "REQ-044"}',
 '2025-10-14 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'priority_changed',
 '{"from": "high", "to": "urgent"}',
 '2025-10-15 08:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "dev", "duration_ms": 86400000}',
 '2025-10-15 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "dev", "to": "testing", "duration_ms": 2246400000}',
 '2025-11-11 10:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'phase_changed',
 '{"from": "testing", "to": "deploy", "duration_ms": 5875200000}',
 '2026-01-20 10:00:00+00'),

-- ── Modelo Predictivo ML (22222222-0004) ───────────────────
('22222222-0004-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-06-30", "request_number": "REQ-058"}',
 '2025-11-13 08:00:00+00'),
('22222222-0004-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 432000000}',
 '2025-11-18 08:00:00+00'),

-- ── Migración BD Legado (22222222-0005) ────────────────────
('22222222-0005-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-01-31", "request_number": null}',
 '2025-09-01 08:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 345600000}',
 '2025-09-05 08:00:00+00'),
('22222222-0005-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 2246400000}',
 '2025-10-01 09:00:00+00'),

-- ── Reporte Incidencias (22222222-0006) ────────────────────
('22222222-0006-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-31", "request_number": "REQ-033"}',
 '2025-10-13 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 259200000}',
 '2025-10-16 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "ready_to_start", "to": "discovery", "duration_ms": 1123200000}',
 '2025-11-29 10:00:00+00'),
('22222222-0006-0000-0000-000000000001', 'phase_changed',
 '{"from": "discovery", "to": "build", "duration_ms": 3456000000}',
 '2026-01-29 09:00:00+00'),

-- ── Contratos OSIPTEL (22222222-0007) ──────────────────────
('22222222-0007-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-01-31", "request_number": "REQ-057"}',
 '2025-11-08 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "discovery", "duration_ms": 259200000}',
 '2025-11-11 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "discovery", "to": "build", "duration_ms": 3110400000}',
 '2025-12-17 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'phase_changed',
 '{"from": "build", "to": "uat_validation", "duration_ms": 2764800000}',
 '2026-01-29 08:00:00+00'),

-- ── Onboarding Técnicos (22222222-0008) ────────────────────
('22222222-0008-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-03-19", "request_number": null}',
 '2026-01-15 09:00:00+00'),
('22222222-0008-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 2160000000}',
 '2026-02-10 09:00:00+00'),

-- ── App Instalaciones (22222222-0009) ──────────────────────
('22222222-0009-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-04-30", "request_number": "REQ-045"}',
 '2025-10-20 14:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "design", "duration_ms": 432000000}',
 '2025-10-25 14:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'phase_changed',
 '{"from": "design", "to": "dev", "duration_ms": 3974400000}',
 '2025-12-11 11:00:00+00'),

-- ── Portal BCP (22222222-0010) ─────────────────────────────
('22222222-0010-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2026-05-31", "request_number": "REQ-046"}',
 '2025-11-04 09:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'phase_changed',
 '{"from": "backlog", "to": "ready_to_start", "duration_ms": 518400000}',
 '2025-11-10 09:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'phase_changed',
 '{"from": "ready_to_start", "to": "design", "duration_ms": 3456000000}',
 '2025-12-20 15:00:00+00'),

-- ── Reporte Calidad Servicio - COMPLETADO con Lead Time (22222222-0016) ──
('22222222-0016-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-08-20", "request_number": "REQ-030"}',
 '2025-06-06 10:00:00+00'),
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

-- ── Automatización Carga SAP - COMPLETADO (22222222-0011) ──
('22222222-0011-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-09-30", "request_number": null}',
 '2025-07-01 08:00:00+00'),
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

-- ── Política Seguridad - COMPLETADO (22222222-0012) ────────
('22222222-0012-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-10-31", "request_number": null}',
 '2025-08-01 09:00:00+00'),
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

-- ── Dashboard Ventas Q3 - COMPLETADO (22222222-0013) ───────
('22222222-0013-0000-0000-000000000001', 'sla_started',
 '{"sla_due_date": "2025-09-30", "request_number": null}',
 '2025-07-15 10:00:00+00'),
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
-- 5. COMMENTS
-- ============================================================

INSERT INTO comments (project_id, content, created_at)
VALUES
('22222222-0001-0000-0000-000000000001', 'Se completó el modelado de datos. Pendiente validar con DDC los KPIs definitivos para la vista ejecutiva.', '2026-01-22 10:00:00+00'),
('22222222-0001-0000-0000-000000000001', 'UAT programado para semana del 17 de febrero. Se convocará a usuarios clave de cada área.', '2026-02-10 15:00:00+00'),
('22222222-0002-0000-0000-000000000001', 'IT confirmó que las credenciales API estarán disponibles el 15 de marzo. Reanudamos desarrollo en esa fecha.', '2026-01-22 11:00:00+00'),
('22222222-0003-0000-0000-000000000001', 'Fix aplicado en ambiente QA. Validado con 500 facturas históricas sin errores. En espera de ventana de deploy productivo.', '2026-02-18 16:00:00+00'),
('22222222-0004-0000-0000-000000000001', 'Dataset limpio y cargado en Azure Blob Storage. Iniciando fase de feature engineering esta semana.', '2026-01-15 10:00:00+00'),
('22222222-0007-0000-0000-000000000001', 'Reunión con Legal el 5 de febrero. Confirmaron que los cambios normativos afectan también al proceso de renovación automática.', '2026-02-06 09:00:00+00'),
('22222222-0009-0000-0000-000000000001', 'Primera versión de la app disponible en entorno de pruebas. Enviadas invitaciones a 5 técnicos piloto para validación en campo.', '2026-02-08 11:00:00+00'),
('22222222-0010-0000-0000-000000000001', 'Definida estructura del reporte consolidado con el cliente BCP. Aprobado el modelo de datos. Iniciando desarrollo del extractor.', '2026-01-30 14:00:00+00');

-- ============================================================
-- 6. LINK requests → projects (project_id)
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

-- ============================================================
-- FIN DEL SEED v2
-- ============================================================

SELECT
  'Seed v2 ejecutado correctamente!' AS resultado,
  (SELECT COUNT(*) FROM requests)     AS requests,
  (SELECT COUNT(*) FROM projects)     AS projects,
  (SELECT COUNT(*) FROM project_flows) AS flows,
  (SELECT COUNT(*) FROM activity_logs) AS activity_logs,
  (SELECT COUNT(*) FROM comments)     AS comments;
