import { useActivityLog } from '../../hooks/useActivityLog'

const ACTION_LABELS: Record<string, string> = {
  status_changed:   'Estado cambiado',
  phase_changed:    'Fase movida',
  priority_changed: 'Prioridad cambiada',
  blocked:          'Proyecto bloqueado',
  unblocked:        'Proyecto desbloqueado',
  edited:           'Proyecto editado',
  sla_started:      'SLA iniciado',
  sla_completed:    'SLA completado',
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
                {d?.to && (
                  <span className="font-semibold text-gray-900">
                    {' → '}{PHASE_LABELS[d.to] ?? d.to}
                  </span>
                )}
                {d?.from && d?.to && (
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
                  {d?.sla_due_date
                    ? <>Fecha límite: <span className="font-medium">{new Date(d.sla_due_date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span></>
                    : 'Sin fecha límite definida'
                  }
                </p>
              )}

              {/* SLA completado */}
              {log.action === 'sla_completed' && (
                <p className={`text-xs mt-0.5 font-medium ${d?.on_time === true ? 'text-green-600' : d?.on_time === false ? 'text-red-500' : 'text-gray-500'}`}>
                  {d?.on_time === true && '✓ Entregado a tiempo'}
                  {d?.on_time === false && '⚠ Fuera de SLA'}
                  {d?.on_time === undefined && 'Completado'}
                  {d?.days_elapsed !== undefined && <span className="font-normal text-gray-400"> · {d.days_elapsed} días desde aprobación</span>}
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
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
