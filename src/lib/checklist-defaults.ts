export const DEFAULT_CHECKLIST: Record<string, Record<string, string[]>> = {
  development: {
    backlog: [
      'Definir requerimientos con el solicitante',
      'Estimar horas de desarrollo',
      'Priorizar en el sprint',
    ],
    design: [
      'Crear wireframes o mockups',
      'Revisar diseño con el equipo',
      'Aprobar diseño final',
    ],
    dev: [
      'Implementar la funcionalidad',
      'Code review por otro developer',
      'Pruebas unitarias',
    ],
    testing: [
      'Pruebas funcionales completas',
      'Pruebas de regresión',
      'Documentar resultados',
    ],
    deploy: [
      'Preparar release notes',
      'Deploy a producción',
      'Smoke test en producción',
    ],
    done: [
      'Notificar al solicitante',
      'Cerrar el ticket',
    ],
  },
  administrative: {
    backlog: [
      'Revisar la solicitud',
      'Definir alcance',
      'Asignar responsable',
    ],
    ready_to_start: [
      'Confirmar recursos disponibles',
      'Notificar inicio al solicitante',
    ],
    discovery: [
      'Levantar información del proceso',
      'Identificar stakeholders',
      'Documentar proceso actual (AS-IS)',
    ],
    design: [
      'Diseñar solución (TO-BE)',
      'Validar con stakeholders',
      'Aprobar diseño de la solución',
    ],
    build: [
      'Ejecutar plan de acción',
      'Documentar avances',
    ],
    uat_validation: [
      'Pruebas con usuario final',
      'Validar resultados con el solicitante',
      'Obtener firma de conformidad',
    ],
    deployed: [
      'Entregar al usuario',
      'Documentar solución final',
    ],
  },
}
