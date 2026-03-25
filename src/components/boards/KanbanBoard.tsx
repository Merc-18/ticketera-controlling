import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useState, useEffect } from 'react'
import BoardColumn from './BoardColumn'
import ProjectListView from './ProjectListView'
import TableView from './TableView'
import GanttView from './GanttView'
import RoadmapView from './RoadmapView'
import ProjectModal from '../projects/ProjectModal'
import NewProjectModal from '../projects/NewProjectModal'
import { useProjects } from '../../hooks/useProjects'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'
import type { ProjectFlow } from '../../types/database.types'


type BoardType = 'development' | 'administrative'
type ViewMode  = 'kanban' | 'table' | 'gantt' | 'roadmap'

interface Props {
  boardType: BoardType
}

const PHASES = {
  development: [
    { id: 'backlog', title: '📋 Backlog', color: 'bg-gray-600' },
    { id: 'design', title: '📝 Design', color: 'bg-blue-600' },
    { id: 'dev', title: '💻 Development', color: 'bg-purple-600' },
    { id: 'testing', title: '🧪 Testing', color: 'bg-yellow-600' },
    { id: 'deploy', title: '🚀 Deploy', color: 'bg-green-600' },
    { id: 'done', title: '✅ Done', color: 'bg-emerald-700' },
  ],
  administrative: [
    { id: 'backlog', title: '📋 Backlog', color: 'bg-gray-600' },
    { id: 'ready_to_start', title: '🎯 Ready to Start', color: 'bg-blue-600' },
    { id: 'discovery', title: '🔍 Discovery', color: 'bg-indigo-600' },
    { id: 'design', title: '📝 Design', color: 'bg-purple-600' },
    { id: 'build', title: '🔨 Build', color: 'bg-orange-600' },
    { id: 'uat_validation', title: '✔️ UAT/Validation', color: 'bg-yellow-600' },
    { id: 'deployed', title: '🚀 Deployed', color: 'bg-green-600' },
  ],
}

const STATUS_OPTIONS = [
  { value: 'active',    label: '🟢 Activos',     activeClass: 'bg-blue-600 text-white' },
  { value: 'completed', label: '✅ Completados',  activeClass: 'bg-green-600 text-white' },
  { value: 'archived',  label: '📦 Archivados',   activeClass: 'bg-gray-600 text-white' },
] as const

const AREAS = ['AASS', 'ATC', 'DDC', 'QA', 'SAQ']

const PRIORITY_OPTS = [
  { value: 'all',    label: 'Prioridad' },
  { value: 'urgent', label: '🔴 Urgente' },
  { value: 'high',   label: '🟠 Alta' },
  { value: 'medium', label: '🟡 Media' },
  { value: 'low',    label: '🟢 Baja' },
]

const VIEW_MODES: { value: ViewMode; label: string; icon: string }[] = [
  { value: 'kanban',  label: 'Kanban',  icon: '⬛' },
  { value: 'table',   label: 'Tabla',   icon: '☰' },
  { value: 'gantt',   label: 'Gantt',   icon: '📅' },
  { value: 'roadmap', label: 'Roadmap', icon: '🗓' },
]

export default function KanbanBoard({ boardType }: Props) {
  const { projects, loading, hasMore, loadMore, statusFilter, setStatusFilter, updateProjectFlow, updateProject, updateFlowDetails, createProject, deleteProject, reload } = useProjects()
  const { activeUsers } = useUsers()
  const { user: currentUser } = useAuth()
  const [selectedProject, setSelectedProject] = useState<{ project: any; flow: ProjectFlow } | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('all')
  const [myProjectsOnly, setMyProjectsOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')

  // Sincronizar selectedProject con datos frescos después de cada reload
  useEffect(() => {
    if (selectedProject) {
      const fresh = projects.find(p => p.id === selectedProject.project.id)
      if (fresh) {
        setSelectedProject(prev => prev ? { ...prev, project: fresh } : null)
      }
    }
  }, [projects])

  const phases = PHASES[boardType]


  const filteredProjects = projects.filter(project => {
    if (priorityFilter !== 'all' && project.priority !== priorityFilter) return false
    const area = (project as any).requests?.requester_area
    if (areaFilter !== 'all' && area !== areaFilter) return false
    if (myProjectsOnly && currentUser) {
      const flows: any[] = (project as any).project_flows ?? []
      const isAssigned = flows.some(f => f.assigned_to === currentUser.id)
      if (!isAssigned) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = project.title?.toLowerCase().includes(q)
      const numMatch   = (project as any).project_number?.toLowerCase().includes(q)
      const areaMatch  = area?.toLowerCase().includes(q)
      if (!titleMatch && !numMatch && !areaMatch) return false
    }
    return true
  })

  const getProjectsByPhase = (phaseId: string) => {
    return filteredProjects
      .map((project) => {
        const flow = ((project as any).project_flows as ProjectFlow[] || []).find(
          (f) => f.flow_type === boardType && f.current_phase === phaseId
        )
        return flow ? { project, flow } : null
      })
      .filter(Boolean) as Array<{ project: any; flow: ProjectFlow }>
  }

  const handleDragEnd = async (result: DropResult) => {
    const { destination, draggableId } = result
    if (!destination) return
    try {
      await updateProjectFlow(draggableId, destination.droppableId)
    } catch (error) {
      console.error('Error moving project:', error)
    }
  }

  const hasFilters = priorityFilter !== 'all' || areaFilter !== 'all' || myProjectsOnly || searchQuery.trim() !== ''
  const filteredCount = filteredProjects.length
  const totalCount = projects.length

  // Solo mostrar spinner en la carga inicial (sin proyectos aún)
  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  const boardTitle = boardType === 'development' ? '💻 Board Development' : '📋 Board Administrative'

  return (
    <>
      {/* Header: título + buscador */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{boardTitle}</h2>
          <p className="text-gray-500 text-xs mt-0.5">Arrastra y suelta los proyectos entre las columnas</p>
        </div>
        <input
          type="text"
          placeholder="Buscar por título, número o área..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white placeholder-gray-400 w-72"
        />
      </div>

      {/* Fila única: Vista + Filtros + Toggle de modo */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Vista:</span>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              statusFilter === opt.value
                ? opt.activeClass
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* Separador */}
        {statusFilter === 'active' && (
          <span className="text-gray-300 select-none">|</span>
        )}

        {/* Filtros de prioridad y área (solo en vista activa) */}
        {statusFilter === 'active' && (
          <>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer outline-none ${
                priorityFilter !== 'all'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {PRIORITY_OPTS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer outline-none ${
                areaFilter !== 'all'
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <option value="all">Área</option>
              {AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* Mis proyectos toggle */}
            <button
              onClick={() => setMyProjectsOnly(v => !v)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                myProjectsOnly
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👤 Mis proyectos
            </button>

            {hasFilters && (
              <>
                <button
                  onClick={() => { setPriorityFilter('all'); setAreaFilter('all'); setMyProjectsOnly(false); setSearchQuery('') }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  ✕ Limpiar
                </button>
                <span className="text-sm text-gray-500">
                  {filteredCount} de {totalCount}
                </span>
              </>
            )}
          </>
        )}

        {/* Nuevo proyecto + View mode toggle (derecha) */}
        <button
          onClick={() => setShowNewModal(true)}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition flex items-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Nuevo Proyecto
        </button>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {VIEW_MODES.map(vm => (
            <button
              key={vm.value}
              onClick={() => setViewMode(vm.value)}
              title={vm.label}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === vm.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {vm.icon} {vm.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── VISTA TABLA ── */}
      {viewMode === 'table' && (
        <TableView
          projects={filteredProjects as any}
          boardType={boardType}
          onProjectClick={setSelectedProject}
        />
      )}

      {/* ── VISTA GANTT ── */}
      {viewMode === 'gantt' && (
        <GanttView
          projects={filteredProjects as any}
          boardType={boardType}
          onProjectClick={setSelectedProject}
        />
      )}

      {/* ── VISTA ROADMAP ── */}
      {viewMode === 'roadmap' && (
        <RoadmapView
          projects={filteredProjects as any}
          onProjectClick={setSelectedProject}
        />
      )}

      {/* ── VISTA KANBAN ── */}
      {viewMode === 'kanban' && statusFilter === 'active' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {phases.map((phase) => (
              <BoardColumn
                key={phase.id}
                phase={phase}
                projects={getProjectsByPhase(phase.id)}
                onProjectClick={setSelectedProject}
                users={activeUsers}
                onAssign={(flowId, userId) => updateFlowDetails(flowId, { assigned_to: userId }).then(reload)}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      {/* Completados / Archivados en modo kanban */}
      {viewMode === 'kanban' && (statusFilter === 'completed' || statusFilter === 'archived') && (
        <ProjectListView
          projects={projects as any}
          boardType={boardType}
          onProjectClick={setSelectedProject}
          status={statusFilter}
        />
      )}

      {/* Cargar más */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm"
          >
            Cargar más proyectos...
          </button>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject.project}
          flows={(selectedProject.project as any).project_flows || []}
          onClose={() => setSelectedProject(null)}
          onUpdate={reload}
          onDelete={async (id) => { await deleteProject(id); setSelectedProject(null) }}
          updateProject={updateProject}
          updateFlowDetails={updateFlowDetails}
        />
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal
          boardType={boardType}
          onClose={() => setShowNewModal(false)}
          onCreate={createProject}
        />
      )}
    </>
  )
}
