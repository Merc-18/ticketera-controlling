import type { Project, ProjectFlow } from '../../types/database.types'

interface ProjectWithArea extends Project {
  requests?: { requester_area: string } | null
}

interface Props {
  project: ProjectWithArea
  flow: ProjectFlow
  onClick: () => void
}

const PRIORITY_COLORS: Record<string, string> = {
  low:    'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high:   'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
}

const AREA_COLORS: Record<string, string> = {
  SAQ:  'bg-blue-100 text-blue-800',
  DDC:  'bg-purple-100 text-purple-800',
  QA:   'bg-teal-100 text-teal-800',
  ATC:  'bg-orange-100 text-orange-800',
  AASS: 'bg-pink-100 text-pink-800',
}

export default function ProjectCard({ project, flow, onClick }: Props) {
  const area = project.requests?.requester_area
  const areaColorClass = area ? (AREA_COLORS[area] ?? 'bg-gray-100 text-gray-600') : ''

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3.5 mb-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Título + blocked */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 leading-snug line-clamp-2">
          {project.title}
        </h3>
        {project.is_blocked && (
          <span className="text-red-500 text-base ml-2 flex-shrink-0" title={project.blocked_reason || 'Bloqueado'}>
            🚫
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[project.priority]}`}>
          {project.priority.toUpperCase()}
        </span>
        {area && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${areaColorClass}`}>
            {area}
          </span>
        )}
        {project.project_type === 'dual' && (
          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            DUAL
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progreso</span>
          <span className="font-semibold text-gray-700">{flow.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${flow.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(project.updated_at).toLocaleDateString('es-PE')}</span>
        {flow.assigned_to && <span>👤 Asignado</span>}
      </div>
    </div>
  )
}
