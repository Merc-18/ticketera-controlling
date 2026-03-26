import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useChecklist } from '../../hooks/useChecklist'
import type { ProjectFlow } from '../../types/database.types'
import { PHASE_LABELS } from '../../lib/constants'

const DEV_PHASES = ['backlog', 'design', 'dev', 'testing', 'deploy', 'done']
const ADMIN_PHASES = ['backlog', 'ready_to_start', 'discovery', 'design', 'build', 'uat_validation', 'deployed']

interface Props {
  flow: ProjectFlow
  onProgressUpdate?: () => void
}

export default function ChecklistSection({ flow, onProgressUpdate }: Props) {
  const { items, loading, toggleItem, addItem, deleteItem, reorderItems } = useChecklist(flow.id)

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination || source.droppableId !== destination.droppableId) return
    if (source.index === destination.index) return
    reorderItems(source.droppableId, source.index, destination.index)
  }
  const [newItemText, setNewItemText] = useState<Record<string, string>>({})
  const [expandedPhase, setExpandedPhase] = useState<string | null>(flow.current_phase)
  const [saving, setSaving] = useState<string | null>(null)

  const phases = flow.flow_type === 'development' ? DEV_PHASES : ADMIN_PHASES

  const itemsByPhase = phases.reduce((acc, phase) => {
    acc[phase] = items.filter(i => i.phase === phase)
    return acc
  }, {} as Record<string, typeof items>)

  const handleToggle = async (itemId: string, completed: boolean) => {
    setSaving(itemId)
    await toggleItem(itemId, completed)
    setSaving(null)
    onProgressUpdate?.()
  }

  const handleAdd = async (phase: string) => {
    const text = newItemText[phase]?.trim()
    if (!text) return
    await addItem(phase, text)
    setNewItemText(prev => ({ ...prev, [phase]: '' }))
  }

  if (loading) {
    return <p className="text-xs text-gray-400 py-2">Cargando checklist...</p>
  }

  const totalItems = items.length
  const completedItems = items.filter(i => i.completed).length

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
    <div className="space-y-1.5 mt-3">
      {/* Resumen global */}
      {totalItems > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{completedItems} de {totalItems} completados</span>
          <span className="font-semibold text-blue-600">
            {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%
          </span>
        </div>
      )}

      {phases.map(phase => {
        const phaseItems = itemsByPhase[phase] || []
        const isCurrentPhase = phase === flow.current_phase
        const isExpanded = expandedPhase === phase
        const completedCount = phaseItems.filter(i => i.completed).length
        const allDone = phaseItems.length > 0 && completedCount === phaseItems.length

        return (
          <div
            key={phase}
            className={`border rounded-lg overflow-hidden ${
              isCurrentPhase ? 'border-blue-300' : allDone ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <button
              onClick={() => setExpandedPhase(isExpanded ? null : phase)}
              className={`w-full px-3 py-2 flex items-center justify-between text-sm font-medium transition ${
                isCurrentPhase
                  ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  : allDone
                  ? 'bg-green-50 text-green-800 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {isCurrentPhase && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                {allDone && !isCurrentPhase && <span className="text-green-500">✓</span>}
                <span>{PHASE_LABELS[phase]}</span>
                {isCurrentPhase && (
                  <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-normal">
                    Fase actual
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {phaseItems.length > 0 && (
                  <span className={`text-xs ${allDone ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                    {completedCount}/{phaseItems.length}
                  </span>
                )}
                <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-1.5 bg-white">
                {phaseItems.length === 0 && (
                  <p className="text-xs text-gray-400 italic mb-2">
                    Sin items. Agrega uno a continuación.
                  </p>
                )}

                <Droppable droppableId={phase}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                      {phaseItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-start gap-2.5 group py-0.5 rounded ${
                                snapshot.isDragging ? 'bg-blue-50 shadow-sm' : ''
                              } ${saving === item.id ? 'opacity-50' : ''}`}
                            >
                              <span
                                {...provided.dragHandleProps}
                                className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mt-0.5 shrink-0 text-xs select-none"
                                title="Arrastrar para reordenar"
                              >
                                ⠿
                              </span>
                              <input
                                type="checkbox"
                                checked={item.completed}
                                disabled={saving === item.id}
                                onChange={() => handleToggle(item.id, !item.completed)}
                                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer flex-shrink-0"
                              />
                              <span
                                className={`text-sm leading-snug flex-1 ${
                                  item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                                }`}
                              >
                                {item.description}
                              </span>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition text-xs ml-1 flex-shrink-0"
                                title="Eliminar item"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Agregar nuevo item */}
                <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                  <input
                    type="text"
                    value={newItemText[phase] || ''}
                    onChange={e => setNewItemText(prev => ({ ...prev, [phase]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(phase)}
                    placeholder="Agregar item..."
                    className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleAdd(phase)}
                    disabled={!newItemText[phase]?.trim()}
                    className="text-xs px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
    </DragDropContext>
  )
}
