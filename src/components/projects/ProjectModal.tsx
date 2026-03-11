import { useState, useEffect, useRef } from 'react'
import type { Project, ProjectFlow } from '../../types/database.types'
import CommentsSection from './CommentsSection'
import ChecklistSection from './ChecklistSection'
import ActivitySection from './ActivitySection'

interface Props {
  project: Project & { requests?: { requester_area: string; requester_name: string; request_type: string } | null }
  flows: ProjectFlow[]
  onClose: () => void
  onUpdate?: () => void
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  updateFlowDetails?: (flowId: string, updates: { progress?: number; assigned_to?: string }) => Promise<void>
}

const PHASE_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  design: 'Design',
  dev: 'Development',
  testing: 'Testing',
  deploy: 'Deploy',
  done: 'Done',
  ready_to_start: 'Ready to Start',
  discovery: 'Discovery',
  build: 'Build',
  uat_validation: 'UAT/Validation',
  deployed: 'Deployed',
}

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Baja',    color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'medium', label: 'Media',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'high',   label: 'Alta',    color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800 border-red-200' },
]

const AREA_COLORS: Record<string, string> = {
  SAQ:  'bg-blue-100 text-blue-800 border-blue-200',
  DDC:  'bg-purple-100 text-purple-800 border-purple-200',
  QA:   'bg-teal-100 text-teal-800 border-teal-200',
  ATC:  'bg-orange-100 text-orange-800 border-orange-200',
  AASS: 'bg-pink-100 text-pink-800 border-pink-200',
}

export default function ProjectModal({ project, flows, onClose, onUpdate, updateProject, updateFlowDetails }: Props) {
  const [activeTab, setActiveTab] = useState<'details' | 'checklist' | 'comments' | 'activity'>('details')
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [showStatusConfirm, setShowStatusConfirm] = useState<'completed' | 'archived' | null>(null)

  const [editData, setEditData] = useState({
    title: project.title,
    description: project.description,
    priority: project.priority,
    estimated_hours: project.estimated_hours ?? '',
    actual_hours: project.actual_hours ?? '',
    start_date: project.start_date ?? '',
    due_date: project.due_date ?? '',
  })

  const [blockReason, setBlockReason] = useState(project.blocked_reason ?? '')
  const [flowEdits, setFlowEdits] = useState<Record<string, { progress: number; assigned_to: string }>>(
    () => Object.fromEntries(flows.map(f => [f.id, { progress: f.progress, assigned_to: f.assigned_to ?? '' }]))
  )
  const [flowSaved, setFlowSaved] = useState<Record<string, { progress: number; assigned_to: string }>>(
    () => Object.fromEntries(flows.map(f => [f.id, { progress: f.progress, assigned_to: f.assigned_to ?? '' }]))
  )
  const [savingFlow, setSavingFlow] = useState<string | null>(null)

  // Ref para acceder al flowSaved más reciente sin cierre estale
  const flowSavedRef = useRef(flowSaved)
  flowSavedRef.current = flowSaved

  // Cuando llegan datos frescos del servidor, sincronizar flowEdits y flowSaved
  // sin pisar edits pendientes que el usuario aún no guardó
  useEffect(() => {
    setFlowEdits(prev => {
      const next = { ...prev }
      flows.forEach(f => {
        const saved = flowSavedRef.current[f.id]
        const edit  = prev[f.id]
        // Sin cambios pendientes → actualizar con el valor fresco de la DB
        const noPendingChange =
          !edit ||
          (edit.progress === (saved?.progress ?? f.progress) &&
           edit.assigned_to.trim() === (saved?.assigned_to ?? '').trim())
        if (noPendingChange) {
          next[f.id] = { progress: f.progress, assigned_to: f.assigned_to ?? '' }
        }
      })
      return next
    })
    setFlowSaved(
      Object.fromEntries(flows.map(f => [f.id, { progress: f.progress, assigned_to: f.assigned_to ?? '' }]))
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flows])

  const priorityColor = PRIORITY_OPTIONS.find(p => p.value === project.priority)?.color ?? ''
  const area = project.requests?.requester_area
  const areaColor = area ? (AREA_COLORS[area] ?? 'bg-gray-100 text-gray-700 border-gray-200') : ''
  const requestType = project.requests?.request_type

  const handleSaveEdit = async () => {
    setSaving(true)
    try {
      await updateProject(project.id, {
        title: editData.title,
        description: editData.description,
        priority: editData.priority as Project['priority'],
        estimated_hours: editData.estimated_hours !== '' ? Number(editData.estimated_hours) : undefined,
        actual_hours: editData.actual_hours !== '' ? Number(editData.actual_hours) : undefined,
        start_date: editData.start_date || undefined,
        due_date: editData.due_date || undefined,
      })
      setEditMode(false)
      onUpdate?.()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleBlock = async () => {
    if (project.is_blocked) {
      setSaving(true)
      try {
        await updateProject(project.id, {
          is_blocked: false,
          blocked_reason: undefined,
          blocked_since: undefined,
        })
        onUpdate?.()
      } finally {
        setSaving(false)
      }
    } else {
      setShowStatusConfirm(null)
      setShowBlockForm(true)
    }
  }

  const handleBlock = async () => {
    if (!blockReason.trim()) return
    setSaving(true)
    try {
      await updateProject(project.id, {
        is_blocked: true,
        blocked_reason: blockReason,
        blocked_since: new Date().toISOString(),
      })
      setShowBlockForm(false)
      onUpdate?.()
    } finally {
      setSaving(false)
    }
  }

  const handleChangeStatus = async (status: 'completed' | 'archived') => {
    setSaving(true)
    try {
      await updateProject(project.id, { status })
      setShowStatusConfirm(null)
      onUpdate?.()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFlow = async (flowId: string) => {
    if (!updateFlowDetails) return
    setSavingFlow(flowId)
    try {
      const edit = flowEdits[flowId]
      await updateFlowDetails(flowId, {
        progress: edit.progress,
        assigned_to: edit.assigned_to.trim() || undefined,
      })
      // Actualizar el baseline para que isDirty vuelva a false
      setFlowSaved(prev => ({ ...prev, [flowId]: { ...edit } }))
      onUpdate?.()
    } finally {
      setSavingFlow(null)
    }
  }

  const openStatusConfirm = (status: 'completed' | 'archived') => {
    setShowBlockForm(false)
    setShowStatusConfirm(status)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <div className="bg-gray-50 border-b px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={editData.title}
                onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="text-2xl font-bold text-gray-900 w-full border-b-2 border-primary outline-none bg-transparent mb-2"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Prioridad */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityColor}`}>
                {project.priority.toUpperCase()}
              </span>
              {/* Área solicitante */}
              {area && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${areaColor}`}>
                  📍 {area}
                </span>
              )}
              {/* Solicitante */}
              {requestType && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  🏷️ {requestType}
                </span>
              )}
              {project.requests?.requester_name && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  👤 {project.requests.requester_name}
                </span>
              )}
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl ml-4">✕</button>
        </div>

        {/* ── TABS ── */}
        <div className="border-b flex px-6">
          {[
            { id: 'details',  label: '📋 Detalles' },
            { id: 'checklist', label: '✅ Checklist' },
            { id: 'comments', label: '💬 Comentarios' },
            { id: 'activity', label: '🕐 Actividad' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BANNERS (justo debajo de los tabs, fuera del scroll) ── */}

        {/* Banner: Formulario de bloqueo */}
        {showBlockForm && (
          <div className="bg-red-50 border-b-2 border-red-200 px-6 py-4 space-y-3">
            <h3 className="font-semibold text-red-900">🚫 Motivo del bloqueo</h3>
            <textarea
              rows={2}
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              placeholder="Describe por qué está bloqueado..."
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleBlock}
                disabled={!blockReason.trim() || saving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Confirmar bloqueo'}
              </button>
              <button
                onClick={() => { setShowBlockForm(false); setBlockReason(project.blocked_reason ?? '') }}
                className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Banner: Confirmación de completar / archivar */}
        {showStatusConfirm && (
          <div className={`border-b-2 px-6 py-4 space-y-2 ${
            showStatusConfirm === 'completed'
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-100 border-gray-300'
          }`}>
            <p className="font-semibold text-gray-900">
              {showStatusConfirm === 'completed' ? '✅ ¿Marcar como completado?' : '📦 ¿Archivar este proyecto?'}
            </p>
            <p className="text-sm text-gray-600">
              {showStatusConfirm === 'completed'
                ? 'El proyecto se moverá a "Completados" y dejará de aparecer en el board activo.'
                : 'El proyecto se moverá a "Archivados" y no aparecerá en el board activo.'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleChangeStatus(showStatusConfirm)}
                disabled={saving}
                className={`px-4 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${
                  showStatusConfirm === 'completed' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {saving ? 'Procesando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setShowStatusConfirm(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ── CONTENIDO SCROLLABLE ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">

              {/* Descripción */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                {editMode ? (
                  <textarea
                    rows={4}
                    value={editData.description}
                    onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                ) : (
                  <p className="text-gray-700">{project.description}</p>
                )}
              </div>

              {/* Prioridad y área (edit mode) */}
              {editMode && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Prioridad</h3>
                  <div className="flex gap-2 flex-wrap">
                    {PRIORITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setEditData(prev => ({ ...prev, priority: opt.value as Project['priority'] }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          editData.priority === opt.value
                            ? opt.color + ' ring-2 ring-offset-1 ring-blue-400'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Horas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Horas Estimadas</h3>
                  {editMode ? (
                    <input
                      type="number" min="0"
                      value={editData.estimated_hours}
                      onChange={e => setEditData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                      placeholder="ej. 16"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 border text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {project.estimated_hours ?? '—'}
                        {project.estimated_hours && <span className="text-base font-normal text-gray-500">h</span>}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Horas Reales</h3>
                  {editMode ? (
                    <input
                      type="number" min="0"
                      value={editData.actual_hours}
                      onChange={e => setEditData(prev => ({ ...prev, actual_hours: e.target.value }))}
                      placeholder="ej. 12"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 border text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {project.actual_hours ?? '—'}
                        {project.actual_hours && <span className="text-base font-normal text-gray-500">h</span>}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas de inicio y vencimiento */}
              {editMode ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Fecha de Inicio</h3>
                    <input
                      type="date"
                      value={editData.start_date}
                      onChange={e => setEditData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Fecha de Vencimiento</h3>
                    <input
                      type="date"
                      value={editData.due_date}
                      onChange={e => setEditData(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ) : (project.start_date || project.due_date) ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {project.start_date && (
                    <div>
                      <p className="text-gray-600">Inicio</p>
                      <p className="font-medium text-gray-900">
                        {new Date(project.start_date + 'T00:00:00').toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  )}
                  {project.due_date && (
                    <div>
                      <p className="text-gray-600">Vencimiento</p>
                      <p className={`font-medium ${
                        project.due_date < new Date().toISOString().slice(0, 10) && project.status === 'active'
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {new Date(project.due_date + 'T00:00:00').toLocaleDateString('es-PE')}
                        {project.due_date < new Date().toISOString().slice(0, 10) && project.status === 'active' && ' ⚠️'}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Razón del bloqueo (solo lectura) */}
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

              {/* Flujos */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {flows.length > 1 ? 'Flujos del Proyecto' : 'Flujo del Proyecto'}
                </h3>
                <div className="space-y-4">
                  {flows.map(flow => {
                    const fe = flowEdits[flow.id] ?? { progress: flow.progress, assigned_to: flow.assigned_to ?? '' }
                    const saved = flowSaved[flow.id] ?? { progress: flow.progress, assigned_to: flow.assigned_to ?? '' }
                    const isDirty = fe.progress !== saved.progress || fe.assigned_to.trim() !== saved.assigned_to.trim()
                    return (
                      <div key={flow.id} className="bg-gray-50 rounded-lg p-4 border space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">
                            {flow.flow_type === 'development' ? '💻 Development' : '📋 Administrative'}
                          </h4>
                          <span className="text-sm text-gray-600">
                            Fase: <span className="font-medium">{PHASE_LABELS[flow.current_phase] || flow.current_phase}</span>
                          </span>
                        </div>

                        {/* Progreso editable */}
                        <div>
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1.5">
                            <span>Progreso</span>
                            <span className="font-bold text-primary">{fe.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0" max="100" step="5"
                            value={fe.progress}
                            onChange={e => setFlowEdits(prev => ({
                              ...prev,
                              [flow.id]: { ...prev[flow.id], progress: Number(e.target.value) }
                            }))}
                            className="w-full accent-primary cursor-pointer"
                          />
                        </div>

                        {/* Assigned to */}
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Asignado a</label>
                          <input
                            type="text"
                            value={fe.assigned_to}
                            onChange={e => setFlowEdits(prev => ({
                              ...prev,
                              [flow.id]: { ...prev[flow.id], assigned_to: e.target.value }
                            }))}
                            placeholder="Nombre del responsable..."
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        {/* Guardar flujo */}
                        {updateFlowDetails && isDirty && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSaveFlow(flow.id)}
                              disabled={savingFlow === flow.id}
                              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-blue-600 disabled:opacity-50 transition"
                            >
                              {savingFlow === flow.id ? 'Guardando...' : '✓ Guardar cambios'}
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

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
                      style={{ width: `${Math.round(flows.reduce((sum, f) => sum + f.progress, 0) / flows.length)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Creado</p>
                  <p className="font-medium text-gray-900">{new Date(project.created_at).toLocaleDateString('es-PE')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Última actualización</p>
                  <p className="font-medium text-gray-900">{new Date(project.updated_at).toLocaleDateString('es-PE')}</p>
                </div>
              </div>
            </div>
          )}

          {/* CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-8">
              {flows.map(flow => (
                <div key={flow.id}>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {flow.flow_type === 'development' ? '💻 Development' : '📋 Administrative'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Marca los items completados. El progreso se actualiza automáticamente.
                  </p>
                  <ChecklistSection flow={flow} onProgressUpdate={onUpdate} />
                </div>
              ))}
            </div>
          )}

          {/* COMMENTS */}
          {activeTab === 'comments' && <CommentsSection projectId={project.id} />}

          {/* ACTIVITY */}
          {activeTab === 'activity' && <ActivitySection projectId={project.id} />}
        </div>

        {/* ── FOOTER ── */}
        <div className="bg-gray-50 border-t px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {!editMode && (
              <>
                <button
                  onClick={handleToggleBlock}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
                    project.is_blocked
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  {project.is_blocked ? '✅ Desbloquear' : '🚫 Bloquear'}
                </button>
                <button
                  onClick={() => openStatusConfirm('completed')}
                  disabled={saving || project.status === 'completed'}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 disabled:opacity-40 transition"
                >
                  ✅ Completar
                </button>
                <button
                  onClick={() => openStatusConfirm('archived')}
                  disabled={saving || project.status === 'archived'}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-40 transition"
                >
                  📦 Archivar
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setEditData({ title: project.title, description: project.description, priority: project.priority, estimated_hours: project.estimated_hours ?? '', actual_hours: project.actual_hours ?? '', start_date: project.start_date ?? '', due_date: project.due_date ?? '' })
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editData.title.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
