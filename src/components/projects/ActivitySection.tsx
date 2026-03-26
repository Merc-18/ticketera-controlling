import { useActivityLog } from '../../hooks/useActivityLog'
import { useUsers } from '../../hooks/useUsers'

const ACTION_LABELS: Record<string, string> = {
  status_changed:   'Estado cambiado',
  phase_changed:    'Fase movida',
  priority_changed: 'Prioridad cambiada',
  blocked:          'Proyecto bloqueado',
  unblocked:        'Proyecto desbloqueado',
  edited:           'Proyecto editado',
  sla_started:      'SLA iniciado',
  sla_completed:    'SLA completado',
  assigned:         'Responsable asignado',
  reassigned:       'Responsable reasignado',
  comment_added:    'Comentario agregado',
  due_date_changed: 'Fecha de vencimiento cambiada',
  project_deleted:  'Proyecto eliminado',
  project_restored: 'Proyecto restaurado',
}

const ACTION_ICONS: Record<string, string> = {
  status_changed:   '🔄',
  phase_changed:    '➡️',
  priority_changed: '⚡',
  blocked:          '🚫',
  unblocked:        '✅',
  edited:           '✏️',
  sla_started:      '⏱',
  sla_completed:    '🏁',
  assigned:         '👤',
  reassigned:       '🔀',
  comment_added:    '💬',
  due_date_changed: '📅',
  project_deleted:  '🗑',
  project_restored: '↩️',
}

const PHASE_LABELS: Record<string, string> = {
  backlog: 'Backlog', design: 'Design', dev: 'Development',
  testing: 'Testing', deploy: 'Deploy', done: 'Done',
  ready_to_start: 'Ready to Start', discovery: 'Discovery',
  build: 'Build', uat_validation: 'UAT/Validation', deployed: 'Deployed',
}

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  if (hours < 1) return 'menos de 1 hora'
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`
}

interface Props {
  projectId: string
}

export default function ActivitySection({ projectId }: Props) {
  const { logs, loading } = useActivityLog(projectId)
  const { users } = useUsers()
  const userName = (id: string | null) => id ? (users.find(u => u.id === id)?.full_name ?? id.slice(0, 8)) : '—'

  if (loading) {
    return <div className="text-center py-8 text-gray-400 text-sm">Cargando actividad...</div>
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm font-medium">Sin actividad registrada aún</p>
        <p className="text-xs mt-1">Los cambios aparecerán aquí automáticamente</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {logs.map((log) => {
        const d = log.details as any
        return (
          <div key={log.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
            <span className="text-lg flex-shrink-0 mt-0.5">
              {ACTION_ICONS[log.action] ?? '📝'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                {ACTION_LABELS[log.action] ?? log.action}
                {d?.to && !['assigned', 'reassigned', 'due_date_changed'].includes(log.action) && (
                  <span className="font-semibold text-gray-900">
                    {' → '}{PHASE_LABELS[d.to] ?? d.to}
                  </span>
                )}
                {d?.from && d?.to && !['assigned', 'reassigned', 'due_date_changed'].includes(log.action) && (
                  <span className="text-gray-500 text-xs">
                    {' '}(desde: {PHASE_LABELS[d.from] ?? d.from})
                  </span>
                )}
              </p>

              {/* Duración en fase anterior */}
              {log.action === 'phase_changed' && d?.duration_ms && (
                <p className="text-xs text-blue-500 mt-0.5">
                  Tiempo en {PHASE_LABELS[d.from] ?? d.from}: <span className="font-medium">{formatDuration(d.duration_ms)}</span>
                </p>
              )}

              {/* SLA iniciado */}
              {log.action === 'sla_started' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {d?.request_number && <span>Solicitud {d.request_number} · </span>}
                  {d?.sla_target_date
                    ? <>Fecha límite: <span className="font-medium">{new Date(d.sla_target_date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                    : 'Sin fecha límite definida'
                  }
                </p>
              )}

              {/* SLA completado */}
              {log.action === 'sla_completed' && (
                <div className="mt-0.5 space-y-0.5">
                  <p className={`text-xs font-medium ${d?.on_time === true ? 'text-green-600' : d?.on_time === false ? 'text-red-500' : 'text-gray-500'}`}>
                    {d?.on_time === true && '✓ Entregado a tiempo'}
                    {d?.on_time === false && '⚠ Fuera de SLA'}
                    {d?.on_time === undefined && 'Completado'}
                  </p>
                  {/* Cycle Time: aprobación → completado */}
                  {(d?.cycle_time_days ?? d?.days_elapsed) !== undefined && (
                    <p className="text-xs text-gray-500">
                      🔄 <span className="font-medium">Cycle Time:</span> {d.cycle_time_days ?? d.days_elapsed}d
                      <span className="text-gray-400"> (aprobación → entrega)</span>
                    </p>
                  )}
                  {/* Lead Time: solicitud → completado */}
                  {d?.lead_time_days !== undefined && (
                    <p className="text-xs text-gray-500">
                      📦 <span className="font-medium">Lead Time:</span> {d.lead_time_days}d
                      <span className="text-gray-400"> (solicitud → entrega)</span>
                      {d?.approval_wait_days !== undefined && (
                        <span className="text-gray-400"> · espera aprobación: {d.approval_wait_days}d</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Assigned / Reassigned */}
              {(log.action === 'assigned' || log.action === 'reassigned') && (
                <div className="mt-0.5 space-y-0.5">
                  {log.action === 'reassigned' && d?.from && (
                    <p className="text-xs text-gray-500">
                      Anterior: <span className="font-medium">{userName(d.from)}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Asignado a: <span className="font-medium text-blue-700">{userName(d?.to)}</span>
                    {d?.flow_type && (
                      <span className="text-gray-400 ml-1">({d.flow_type === 'development' ? '💻' : '📋'})</span>
                    )}
                  </p>
                </div>
              )}

              {/* Comment added */}
              {log.action === 'comment_added' && d?.preview && (
                <p className="text-xs text-gray-500 mt-0.5 italic line-clamp-2">
                  "{d.preview}{d.preview.length >= 80 ? '…' : ''}"
                </p>
              )}

              {/* Due date changed */}
              {log.action === 'due_date_changed' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {d?.from
                    ? <span>Anterior: <span className="font-medium">{new Date(d.from + 'T00:00:00').toLocaleDateString('es-PE')}</span> → </span>
                    : <span>Sin fecha → </span>
                  }
                  {d?.to
                    ? <span className="font-medium">{new Date(d.to + 'T00:00:00').toLocaleDateString('es-PE')}</span>
                    : <span>Sin fecha</span>
                  }
                </p>
              )}

              {d?.reason && (
                <p className="text-xs text-gray-500 mt-0.5 italic">"{d.reason}"</p>
              )}
              {d?.fields && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Campos: {d.fields.join(', ')}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {new Date(log.created_at).toLocaleString('es-PE', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', hour12: false,
                })}
                {log.user_id && (
                  <span className="ml-1 text-gray-400">· por <span className="font-medium text-gray-500">{userName(log.user_id)}</span></span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
