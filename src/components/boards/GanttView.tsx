import type { Project, ProjectFlow } from '../../types/database.types'

interface ProjectWithRelations extends Project {
  project_flows?: ProjectFlow[]
  requests?: { requester_area: string; requester_name: string; request_type: string } | null
}

interface Props {
  projects: ProjectWithRelations[]
  boardType: 'development' | 'administrative'
  onProjectClick: (item: { project: ProjectWithRelations; flow: ProjectFlow }) => void
}

const PRIORITY_BAR: Record<string, string> = {
  urgent: 'bg-red-500',
  high:   'bg-orange-400',
  medium: 'bg-blue-500',
  low:    'bg-green-500',
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢',
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function exportGanttCSV(items: Array<{ project: ProjectWithRelations; flow: ProjectFlow }>) {
  const PRIORITY_ES: Record<string, string> = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja' }
  const headers = ['Título', 'Prioridad', 'Área', 'Inicio', 'Vencimiento', 'Progreso', 'Fase']
  const rows = items.map(({ project, flow }) => [
    project.title,
    PRIORITY_ES[project.priority] ?? project.priority,
    project.requests?.requester_area ?? '',
    project.start_date ?? project.created_at?.slice(0, 10) ?? '',
    project.due_date ?? '',
    `${flow.progress}%`,
    flow.current_phase,
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `proyectos-gantt-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function GanttView({ projects, boardType, onProjectClick }: Props) {
  const today = new Date()

  const items = projects
    .map(project => {
      const flow = (project.project_flows ?? []).find(f => f.flow_type === boardType)
      return flow ? { project, flow } : null
    })
    .filter(Boolean) as Array<{ project: ProjectWithRelations; flow: ProjectFlow }>

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-5xl mb-3">📅</span>
        <p className="text-lg font-medium">No hay proyectos para mostrar</p>
      </div>
    )
  }

  // Calcular rango de tiempo
  const starts = items.map(({ project }) => new Date(project.start_date ?? project.created_at))
  const ends   = items.map(({ project }) => project.due_date ? new Date(project.due_date + 'T00:00:00') : today)

  const rangeStart = startOfMonth(new Date(Math.min(...starts.map(d => d.getTime()))))
  const rawRangeEnd = new Date(Math.max(...ends.map(d => d.getTime()), today.getTime()))
  const rangeEnd   = startOfMonth(addMonths(rawRangeEnd, 1))

  const totalMonths = monthsBetween(rangeStart, rangeEnd)
  const totalMs     = rangeEnd.getTime() - rangeStart.getTime()

  // Generate month headers
  const monthHeaders: { label: string; date: Date }[] = []
  for (let i = 0; i < totalMonths; i++) {
    const d = addMonths(rangeStart, i)
    monthHeaders.push({ label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, date: d })
  }

  // Today marker position
  const todayPct = Math.min(
    100,
    Math.max(0, (today.getTime() - rangeStart.getTime()) / totalMs * 100)
  )

  const LEFT_W = 220

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-gray-50 text-xs text-gray-500">
        <span className="font-semibold">Leyenda:</span>
        {Object.entries(PRIORITY_LABEL).map(([k, icon]) => (
          <span key={k} className="flex items-center gap-1">
            {icon} <span className="capitalize">{k === 'urgent' ? 'Urgente' : k === 'high' ? 'Alta' : k === 'medium' ? 'Media' : 'Baja'}</span>
          </span>
        ))}
        <span className="ml-auto">
          <span className="inline-block w-3 h-3 bg-red-400 opacity-40 mr-1 rounded-sm" />Hoy
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: `${LEFT_W + totalMonths * 80}px` }}>

          {/* Month headers */}
          <div className="flex border-b bg-gray-50">
            <div style={{ width: LEFT_W, minWidth: LEFT_W }} className="shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 border-r">
              Proyecto
            </div>
            <div className="flex flex-1 relative">
              {monthHeaders.map((m, i) => (
                <div
                  key={i}
                  style={{ width: `${100 / totalMonths}%` }}
                  className="text-center text-xs text-gray-500 py-2 border-r border-gray-200 shrink-0"
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {items.map(({ project, flow }) => {
              const start = new Date(project.start_date ?? project.created_at)
              const end   = project.due_date ? new Date(project.due_date + 'T00:00:00') : today

              const leftPct  = Math.max(0, (start.getTime() - rangeStart.getTime()) / totalMs * 100)
              const widthPct = Math.max(0.5, Math.min(100 - leftPct, (end.getTime() - start.getTime()) / totalMs * 100))

              const barColor = PRIORITY_BAR[project.priority]
              const isOverdue = project.due_date && project.due_date < today.toISOString().slice(0, 10) && project.status === 'active'

              return (
                <div
                  key={project.id}
                  onClick={() => onProjectClick({ project, flow })}
                  className="flex items-center hover:bg-blue-50 cursor-pointer transition-colors group"
                  style={{ height: 44 }}
                >
                  {/* Project name */}
                  <div
                    style={{ width: LEFT_W, minWidth: LEFT_W }}
                    className="shrink-0 px-4 flex items-center gap-2 border-r"
                  >
                    {project.is_blocked && <span className="text-red-500 text-xs shrink-0">🚫</span>}
                    <span className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700">
                      {PRIORITY_LABEL[project.priority]} {project.title}
                    </span>
                  </div>

                  {/* Timeline bar area */}
                  <div className="flex-1 relative h-full flex items-center">
                    {/* Month grid lines */}
                    {monthHeaders.map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-r border-gray-100"
                        style={{ left: `${(i + 1) / totalMonths * 100}%` }}
                      />
                    ))}

                    {/* Today line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-400 opacity-40 z-10"
                      style={{ left: `${todayPct}%` }}
                    />

                    {/* Project bar */}
                    <div
                      className={`absolute h-6 rounded-md ${barColor} ${isOverdue ? 'ring-2 ring-red-400 ring-offset-1' : ''} opacity-80 hover:opacity-100 transition-opacity flex items-center px-2 overflow-hidden`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: 8 }}
                      title={`${project.title}\nInicio: ${start.toLocaleDateString('es-PE')}\nFin: ${end.toLocaleDateString('es-PE')}\nProgreso: ${flow.progress}%`}
                    >
                      <span className="text-white text-xs font-medium truncate hidden sm:block">
                        {flow.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>{items.length} proyecto{items.length !== 1 ? 's' : ''} · Arrastra horizontalmente para ver el timeline completo</span>
        <button
          onClick={() => exportGanttCSV(items)}
          className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:bg-gray-100 transition"
        >
          ⬇ Exportar CSV
        </button>
      </div>
    </div>
  )
}
