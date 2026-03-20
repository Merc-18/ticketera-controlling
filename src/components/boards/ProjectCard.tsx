import type { Project, ProjectFlow, User, Tag } from '../../types/database.types'

interface ProjectWithArea extends Project {
  requests?: { requester_area: string; request_number?: string } | null
}

interface Props {
  project: ProjectWithArea
  flow: ProjectFlow
  onClick: () => void
  users?: User[]
  tags?: Tag[]
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500',
  'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500',
]
function getAvatarColor(name: string) {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
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

function getDueDateBadge(dueDate?: string | null) {
  if (!dueDate) return null
  const today = new Date().toISOString().slice(0, 10)
  const diff = Math.ceil((new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000)
  if (diff < 0)  return { label: `⚠️ Vencido (${Math.abs(diff)}d)`, cls: 'bg-red-100 text-red-700 border border-red-200' }
  if (diff === 0) return { label: '🔴 Vence hoy',                   cls: 'bg-red-50 text-red-600 border border-red-200' }
  if (diff <= 3)  return { label: `⏰ ${diff}d`,                    cls: 'bg-orange-100 text-orange-700 border border-orange-200' }
  return { label: new Date(dueDate + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }), cls: 'bg-gray-100 text-gray-500 border border-gray-200' }
}

export default function ProjectCard({ project, flow, onClick, users = [], tags = [] }: Props) {
  const area = project.requests?.requester_area
  const requestNumber = project.requests?.request_number
  const areaColorClass = area ? (AREA_COLORS[area] ?? 'bg-gray-100 text-gray-600') : ''
  const dueBadge = getDueDateBadge(project.due_date)

  // Collect all assigned users across all flows (for dual projects, show both)
  const allFlows: Array<{ assigned_to: string | null; flow_type: string }> =
    (project as any).project_flows ?? [flow]
  const assignedUsers = allFlows
    .filter(f => f.assigned_to)
    .map(f => ({ user: users.find(u => u.id === f.assigned_to), flowType: f.flow_type }))
    .filter((x): x is { user: NonNullable<typeof x.user>; flowType: string } => Boolean(x.user))
    // deduplicate by user id
    .filter((x, i, arr) => arr.findIndex(y => y.user.id === x.user.id) === i)

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
        {dueBadge && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${dueBadge.cls}`}>
            {dueBadge.label}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {requestNumber && (
            <span className="font-mono text-gray-500 mr-1.5">{requestNumber}</span>
          )}
          {new Date(project.updated_at).toLocaleDateString('es-PE')}
        </span>
        {assignedUsers.length > 0 ? (
          <div className="flex items-center gap-1">
            {assignedUsers.map(({ user, flowType }) => (
              <div key={user.id} className="flex items-center gap-1" title={`${user.full_name} (${flowType === 'development' ? '💻' : '📋'})`}>
                <div className={`w-5 h-5 rounded-full ${getAvatarColor(user.full_name)} flex items-center justify-center text-white text-[9px] font-bold`}>
                  {getInitials(user.full_name)}
                </div>
              </div>
            ))}
            {assignedUsers.length === 1 && (
              <span className="text-gray-500 truncate max-w-[80px]">{assignedUsers[0].user.full_name.split(' ')[0]}</span>
            )}
          </div>
        ) : flow.assigned_to ? (
          <span>👤 Asignado</span>
        ) : null}
      </div>
    </div>
  )
}
