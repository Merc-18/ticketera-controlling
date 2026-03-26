import type { Project, ProjectFlow } from '../../types/database.types'
import { PRIORITY_COLORS, AREA_COLORS, PHASE_LABELS } from '../../lib/constants'

interface ProjectWithRelations extends Project {
  project_flows?: ProjectFlow[]
  requests?: { requester_area: string; requester_name: string; request_type: string } | null
}

interface Props {
  projects: ProjectWithRelations[]
  boardType: 'development' | 'administrative'
  onProjectClick: (item: { project: ProjectWithRelations; flow: ProjectFlow }) => void
  status: 'completed' | 'archived'
}

export default function ProjectListView({ projects, boardType, onProjectClick, status }: Props) {
  const statusLabel = status === 'completed' ? 'completados' : 'archivados'
  const statusIcon = status === 'completed' ? '✅' : '📦'

  // Filtrar proyectos que tienen el flow del tipo del board
  const items = projects
    .map(project => {
      const flow = (project.project_flows ?? []).find(f => f.flow_type === boardType)
      return flow ? { project, flow } : null
    })
    .filter(Boolean) as Array<{ project: ProjectWithRelations; flow: ProjectFlow }>

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-5xl mb-3">{statusIcon}</span>
        <p className="text-lg font-medium">No hay proyectos {statusLabel}</p>
        <p className="text-sm mt-1">Los proyectos {statusLabel} aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        {items.length} proyecto{items.length !== 1 ? 's' : ''} {statusLabel}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(({ project, flow }) => {
          const area = project.requests?.requester_area
          const areaColorClass = area ? (AREA_COLORS[area] ?? 'bg-gray-100 text-gray-600') : ''

          return (
            <div
              key={project.id}
              onClick={() => onProjectClick({ project, flow })}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Título */}
              <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                {project.title}
              </h3>

              {/* Descripción */}
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                {project.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[project.priority]}`}>
                  {project.priority.toUpperCase()}
                </span>
                {area && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${areaColorClass}`}>
                    {area}
                  </span>
                )}
                {project.project_type === 'dual' && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    DUAL
                  </span>
                )}
              </div>

              {/* Última fase */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Última fase:</span>
                <span className="font-medium text-gray-700">
                  {PHASE_LABELS[flow.current_phase] ?? flow.current_phase}
                </span>
              </div>

              {/* Progreso */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progreso</span>
                  <span className="font-semibold text-gray-700">{flow.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${status === 'completed' ? 'bg-green-500' : 'bg-gray-400'}`}
                    style={{ width: `${flow.progress}%` }}
                  />
                </div>
              </div>

              {/* Fecha */}
              <p className="text-xs text-gray-400 mt-3">
                {status === 'completed' ? '✅' : '📦'} {new Date(project.updated_at).toLocaleDateString('es-PE')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
