import { DragDropContext, DropResult } from '@hello-pangea/dnd'
import { useState } from 'react'
import BoardColumn from './BoardColumn'
import ProjectModal from '../projects/ProjectModal'
import { useProjects } from '../../hooks/useProjects'
import type { ProjectFlow } from '../../types/database.types'

type BoardType = 'development' | 'administrative'

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

export default function KanbanBoard({ boardType }: Props) {
  const { projects, loading, updateProjectFlow } = useProjects()
  const [selectedProject, setSelectedProject] = useState<{project: any; flow: ProjectFlow} | null>(null)

  const phases = PHASES[boardType]

  // Agrupar proyectos por fase
  const getProjectsByPhase = (phaseId: string) => {
    return projects
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

    const newPhase = destination.droppableId

    try {
      await updateProjectFlow(draggableId, newPhase)
    } catch (error) {
      console.error('Error moving project:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map((phase) => (
            <BoardColumn
              key={phase.id}
              phase={phase}
              projects={getProjectsByPhase(phase.id)}
              onProjectClick={setSelectedProject}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal
          project={selectedProject.project}
          flows={(selectedProject.project as any).project_flows || []}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  )
}