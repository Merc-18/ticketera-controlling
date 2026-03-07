import { useState } from 'react'
import type { Project, ProjectFlow } from '../../types/database.types'
import CommentsSection from './CommentsSection'

interface Props {
  project: Project
  flows: ProjectFlow[]
  onClose: () => void
}

export default function ProjectModal({ project, flows, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }

  const phaseLabels = {
    // Development
    backlog: 'Backlog',
    design: 'Design',
    dev: 'Development',
    testing: 'Testing',
    deploy: 'Deploy',
    done: 'Done',
    // Administrative
    ready_to_start: 'Ready to Start',
    discovery: 'Discovery',
    build: 'Build',
    uat_validation: 'UAT/Validation',
    deployed: 'Deployed'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-50 border-b px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColors[project.priority]}`}>
                {project.priority.toUpperCase()}
              </span>
              {project.project_type === 'dual' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  DUAL FLOW
                </span>
              )}
              {project.is_blocked && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  🚫 BLOQUEADO
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b flex px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'details'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📋 Detalles
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
              activeTab === 'comments'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Comentarios
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700">{project.description}</p>
              </div>

              {/* Blocked Reason */}
              {project.is_blocked && project.blocked_reason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">🚫 Razón del Bloqueo</h3>
                  <p className="text-red-800">{project.blocked_reason}</p>
                  {project.blocked_since && (
                    <p className="text-sm text-red-600 mt-2">
                      Bloqueado desde: {new Date(project.blocked_since).toLocaleDateString('es-PE')}
                    </p>
                  )}
                </div>
              )}

              {/* Flows */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {flows.length > 1 ? 'Flujos del Proyecto' : 'Flujo del Proyecto'}
                </h3>
                
                <div className="space-y-4">
                  {flows.map(flow => (
                    <div key={flow.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          {flow.flow_type === 'development' ? '💻 Development' : '📋 Administrative'}
                        </h4>
                        <span className="text-sm text-gray-600">
                          Fase: <span className="font-medium">{phaseLabels[flow.current_phase as keyof typeof phaseLabels] || flow.current_phase}</span>
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>Progreso</span>
                          <span className="font-bold text-primary">{flow.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-300"
                            style={{ width: `${flow.progress}%` }}
                          />
                        </div>
                      </div>

                      {flow.assigned_to && (
                        <div className="mt-3 text-sm text-gray-600">
                          👤 Asignado a: <span className="font-medium">Usuario</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Progress (for dual flow) */}
              {flows.length > 1 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Progreso Total del Proyecto</h3>
                  <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                    <span>Promedio de ambos flujos</span>
                    <span className="font-bold text-xl text-blue-900">
                      {Math.round(flows.reduce((sum, f) => sum + f.progress, 0) / flows.length)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.round(flows.reduce((sum, f) => sum + f.progress, 0) / flows.length)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Time Estimates */}
              {(project.estimated_hours || project.actual_hours) && (
                <div className="grid grid-cols-2 gap-4">
                  {project.estimated_hours && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm text-gray-600 mb-1">Tiempo Estimado</p>
                      <p className="text-2xl font-bold text-gray-900">{project.estimated_hours}h</p>
                    </div>
                  )}
                  {project.actual_hours && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <p className="text-sm text-gray-600 mb-1">Tiempo Real</p>
                      <p className="text-2xl font-bold text-gray-900">{project.actual_hours}h</p>
                    </div>
                  )}
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Creado</p>
                  <p className="font-medium text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('es-PE')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Última actualización</p>
                  <p className="font-medium text-gray-900">
                    {new Date(project.updated_at).toLocaleDateString('es-PE')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CommentsSection projectId={project.id} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}