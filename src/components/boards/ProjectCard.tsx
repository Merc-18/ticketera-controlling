import type { Project, ProjectFlow } from '../../types/database.types'

interface Props {
  project: Project
  flow: ProjectFlow
  onClick: () => void
}

export default function ProjectCard({ project, flow, onClick }: Props) {
  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1">
          {project.title}
        </h3>
        {project.is_blocked && (
          <span className="text-red-500 text-lg ml-2" title={project.blocked_reason || 'Bloqueado'}>
            🚫
          </span>
        )}
      </div>

      {/* Descripción */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Prioridad */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[project.priority]}`}>
          {project.priority.toUpperCase()}
        </span>
        
        {project.project_type === 'dual' && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
            DUAL FLOW
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progreso</span>
          <span className="font-medium">{flow.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${flow.progress}%` }}
          />
        </div>
      </div>

      {/* Footer - Assigned */}
      {flow.assigned_to && (
        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <span>👤</span>
          <span>Asignado</span>
        </div>
      )}
    </div>
  )
}