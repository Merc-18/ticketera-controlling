import { useActivityLog } from '../../hooks/useActivityLog'

const ACTION_LABELS: Record<string, string> = {
  status_changed:   'Estado cambiado',
  phase_changed:    'Fase movida',
  priority_changed: 'Prioridad cambiada',
  blocked:          'Proyecto bloqueado',
  unblocked:        'Proyecto desbloqueado',
  edited:           'Proyecto editado',
}

const ACTION_ICONS: Record<string, string> = {
  status_changed:   '🔄',
  phase_changed:    '➡️',
  priority_changed: '⚡',
  blocked:          '🚫',
  unblocked:        '✅',
  edited:           '✏️',
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
      {logs.map((log) => (
        <div key={log.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
          <span className="text-lg flex-shrink-0 mt-0.5">
            {ACTION_ICONS[log.action] ?? '📝'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              {ACTION_LABELS[log.action] ?? log.action}
              {(log.details as any)?.to && (
                <span className="font-semibold text-gray-900"> → {(log.details as any).to}</span>
              )}
              {(log.details as any)?.from && (log.details as any)?.to && (
                <span className="text-gray-500 text-xs"> (antes: {(log.details as any).from})</span>
              )}
            </p>
            {(log.details as any)?.reason && (
              <p className="text-xs text-gray-500 mt-0.5 italic">"{(log.details as any).reason}"</p>
            )}
            {(log.details as any)?.fields && (
              <p className="text-xs text-gray-500 mt-0.5">
                Campos: {(log.details as any).fields.join(', ')}
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
      ))}
    </div>
  )
}
