import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useUsers } from '../../hooks/useUsers'
import type { User } from '../../types/database.types'

interface FlowWithProject {
  id: string
  assigned_to: string
  flow_type: 'development' | 'administrative'
  current_phase: string
  progress: number
  project_id: string
  projects: {
    id: string
    title: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    status: string
    due_date: string | null
    is_blocked: boolean
  } | null
}

const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  high:   'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low:    'bg-green-100 text-green-800',
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '🔴 Urgente', high: '🟠 Alta', medium: '🟡 Media', low: '🟢 Baja',
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500',
]

function getAvatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
}

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return dueDate < new Date().toISOString().slice(0, 10)
}

export default function WorkloadView() {
  const { users, loading: usersLoading } = useUsers()
  const [flows, setFlows]     = useState<FlowWithProject[]>([])
  const [flowsLoading, setFlowsLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    setFlowsLoading(true)
    try {
      const { data, error } = await supabase
        .from('project_flows')
        .select(`
          id, assigned_to, flow_type, current_phase, progress, project_id,
          projects ( id, title, priority, status, due_date, is_blocked )
        `)
        .not('assigned_to', 'is', null)

      if (error) throw error
      setFlows((data as FlowWithProject[]) || [])
    } finally {
      setFlowsLoading(false)
    }
  }

  const loading = usersLoading || flowsLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Cargando carga de trabajo...</p>
        </div>
      </div>
    )
  }

  // Flujos activos (proyecto activo)
  const activeFlows = flows.filter(f => f.projects?.status === 'active')

  // Agrupar por assigned_to (UUID)
  const flowsByUserId: Record<string, FlowWithProject[]> = {}
  for (const f of activeFlows) {
    if (!f.assigned_to) continue
    if (!flowsByUserId[f.assigned_to]) flowsByUserId[f.assigned_to] = []
    flowsByUserId[f.assigned_to].push(f)
  }

  // Usuarios activos con sus flows
  const activeUsers = users.filter(u => u.is_active !== false)

  // Proyectos únicos por usuario (evitar duplicados por dual flow)
  function uniqueProjects(userFlows: FlowWithProject[]) {
    const seen = new Set<string>()
    return userFlows.filter(f => {
      if (seen.has(f.project_id)) return false
      seen.add(f.project_id)
      return true
    })
  }

  // Stats generales
  const totalAssigned   = Object.keys(flowsByUserId).length
  const unassignedCount = flows.filter(f => !f.assigned_to).length
  const overdueCount    = activeFlows.filter(f => isOverdue(f.projects?.due_date ?? null)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Carga de Trabajo del Equipo</h3>
          <p className="text-sm text-gray-500 mt-0.5">Proyectos activos asignados por persona</p>
        </div>
        <button
          onClick={loadFlows}
          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm"
        >
          ↺ Actualizar
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-l-4 border-blue-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{totalAssigned}</p>
          <p className="text-xs text-gray-500">Personas con proyectos</p>
        </div>
        <div className="bg-white rounded-xl border-l-4 border-green-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{activeFlows.length}</p>
          <p className="text-xs text-gray-500">Flujos activos asignados</p>
        </div>
        <div className="bg-white rounded-xl border-l-4 border-red-500 p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
          <p className="text-xs text-gray-500">Flujos vencidos</p>
        </div>
      </div>

      {/* Tarjetas por usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeUsers.map(user => {
          const userFlows    = flowsByUserId[user.id] ?? []
          const projects     = uniqueProjects(userFlows)
          const avgProgress  = userFlows.length
            ? Math.round(userFlows.reduce((s, f) => s + f.progress, 0) / userFlows.length)
            : 0
          const isExpanded   = expanded === user.id
          const blockedCount = projects.filter(f => f.projects?.is_blocked).length
          const overdueLocal = projects.filter(f => isOverdue(f.projects?.due_date ?? null)).length

          return (
            <UserCard
              key={user.id}
              user={user}
              flows={userFlows}
              projects={projects}
              avgProgress={avgProgress}
              blockedCount={blockedCount}
              overdueCount={overdueLocal}
              isExpanded={isExpanded}
              onToggle={() => setExpanded(isExpanded ? null : user.id)}
            />
          )
        })}

        {/* Sin asignados */}
        {activeUsers.length === 0 && (
          <div className="col-span-3 py-16 text-center text-gray-400 bg-white rounded-xl border">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No hay proyectos asignados</p>
            <p className="text-sm mt-1">Asigna responsables desde el detalle de cada proyecto</p>
          </div>
        )}
      </div>

      {unassignedCount > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {unassignedCount} flujo{unassignedCount !== 1 ? 's' : ''} activo{unassignedCount !== 1 ? 's' : ''} sin asignar
        </p>
      )}
    </div>
  )
}

// ─── Sub-componente tarjeta de usuario ───────────────────────────────────────

function UserCard({
  user, flows, projects, avgProgress,
  blockedCount, overdueCount, isExpanded, onToggle,
}: {
  user: User
  flows: FlowWithProject[]
  projects: FlowWithProject[]
  avgProgress: number
  blockedCount: number
  overdueCount: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const displayName = user.full_name
  const AVATAR_COLORS = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-pink-500','bg-teal-500','bg-indigo-500']
  function getAvatarColor(n: string) {
    let h = 0; for (const c of n) h = c.charCodeAt(0) + ((h << 5) - h)
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
  }
  function getInitials(n: string) {
    return n.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
  }

  const ROLE_BADGE: Record<string, string> = {
    admin: 'bg-red-100 text-red-700', developer: 'bg-blue-100 text-blue-700', viewer: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(displayName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
            {getInitials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{displayName}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[user.role] ?? ''}`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold text-gray-900">{projects.length}</p>
            <p className="text-xs text-gray-400">proyecto{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Barra de progreso promedio */}
        {flows.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progreso promedio</span>
              <span className="font-semibold text-primary">{avgProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Alertas */}
        {(blockedCount > 0 || overdueCount > 0) && (
          <div className="flex gap-2 mt-3">
            {blockedCount > 0 && (
              <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                🚫 {blockedCount} bloqueado{blockedCount !== 1 ? 's' : ''}
              </span>
            )}
            {overdueCount > 0 && (
              <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200">
                ⚠️ {overdueCount} vencido{overdueCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Toggle proyectos */}
        {projects.length > 0 && (
          <button
            onClick={onToggle}
            className="mt-3 w-full text-xs text-gray-500 hover:text-primary flex items-center justify-center gap-1 py-1 rounded hover:bg-gray-50 transition"
          >
            {isExpanded ? '▲ Ocultar proyectos' : '▼ Ver proyectos'}
          </button>
        )}
      </div>

      {/* Lista de proyectos (expandible) */}
      {isExpanded && projects.length > 0 && (
        <div className="border-t divide-y">
          {projects.map(f => {
            const p = f.projects
            if (!p) return null
            const overdue = isOverdue(p.due_date)
            return (
              <div key={f.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGE[p.priority] ?? ''}`}>
                        {PRIORITY_LABEL[p.priority] ?? p.priority}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {f.flow_type === 'development' ? '💻' : '📋'} {f.current_phase}
                      </span>
                      {p.is_blocked && (
                        <span className="text-xs text-red-600">🚫 Bloqueado</span>
                      )}
                      {overdue && !p.is_blocked && (
                        <span className="text-xs text-orange-600">⚠️ Vencido</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{f.progress}%</p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${p.is_blocked ? 'bg-red-400' : overdue ? 'bg-orange-400' : 'bg-primary'}`}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {flows.length === 0 && (
        <div className="px-4 pb-4 text-xs text-gray-400 italic">Sin proyectos activos asignados</div>
      )}
    </div>
  )
}
