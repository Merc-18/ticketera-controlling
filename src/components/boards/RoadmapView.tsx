import { useMemo, useState } from 'react'

interface Project {
  id: string
  title: string
  priority: string
  project_type: string
  status: string
  is_blocked: boolean
  due_date: string | null
  sla_target_date?: string | null
  project_number?: string
  requests?: { requester_area?: string } | null
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: 'bg-red-100 border-red-400 text-red-800',
  high:   'bg-orange-100 border-orange-400 text-orange-800',
  medium: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  low:    'bg-green-100 border-green-400 text-green-800',
}

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-400', low: 'bg-green-500',
}

interface Props {
  projects: Project[]
  onProjectClick: (p: { project: Project; flow: any }) => void
}

function getQuarters(year: number) {
  return [
    { label: `Q1 ${year}`, months: [0, 1, 2],  start: `${year}-01-01`, end: `${year}-03-31` },
    { label: `Q2 ${year}`, months: [3, 4, 5],  start: `${year}-04-01`, end: `${year}-06-30` },
    { label: `Q3 ${year}`, months: [6, 7, 8],  start: `${year}-07-01`, end: `${year}-09-30` },
    { label: `Q4 ${year}`, months: [9, 10, 11], start: `${year}-10-01`, end: `${year}-12-31` },
  ]
}

export default function RoadmapView({ projects, onProjectClick }: Props) {
  const year = new Date().getFullYear()
  const [showYear, setShowYear] = useState(year)
  const quarters = getQuarters(showYear)
  const today = new Date().toISOString().slice(0, 10)

  const projectsByQuarter = useMemo(() => {
    const map: Record<string, Project[]> = {}
    for (const q of quarters) map[q.label] = []

    const noDate: Project[] = []

    for (const p of projects) {
      const date = p.sla_target_date || p.due_date
      if (!date) { noDate.push(p); continue }
      const matched = quarters.find(q => date >= q.start && date <= q.end)
      if (matched) map[matched.label].push(p)
      // If date doesn't match any quarter in showYear, skip (outside year)
    }
    return { byQuarter: map, noDate }
  }, [projects, showYear])

  const totalInYear = quarters.reduce((s, q) => s + (projectsByQuarter.byQuarter[q.label]?.length ?? 0), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowYear(y => y - 1)}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          ← {showYear - 1}
        </button>
        <span className="text-base font-bold text-gray-900">Roadmap {showYear}</span>
        <button
          onClick={() => setShowYear(y => y + 1)}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          {showYear + 1} →
        </button>
        <span className="text-sm text-gray-400 ml-2">{totalInYear} proyecto{totalInYear !== 1 ? 's' : ''} con SLA en {showYear}</span>
      </div>

      {/* Quarter grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quarters.map(q => {
          const qProjects = projectsByQuarter.byQuarter[q.label] ?? []
          const isPast    = q.end < today
          const isCurrent = q.start <= today && today <= q.end

          return (
            <div
              key={q.label}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
            >
              {/* Quarter header */}
              <div className={`px-4 py-3 flex items-center justify-between border-b ${
                isCurrent ? 'bg-primary/5 border-primary/20' : isPast ? 'bg-gray-50' : 'bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">{q.label}</span>
                  {isCurrent && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded-full font-medium">Actual</span>}
                  {isPast    && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">Pasado</span>}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  qProjects.length === 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700'
                }`}>
                  {qProjects.length}
                </span>
              </div>

              {/* Projects list */}
              <div className="flex-1 divide-y divide-gray-50 overflow-y-auto max-h-72">
                {qProjects.length === 0 ? (
                  <div className="py-8 text-center text-gray-300 text-sm">Sin proyectos</div>
                ) : (
                  qProjects
                    .sort((a, b) => {
                      const dateA = a.sla_target_date || a.due_date || ''
                      const dateB = b.sla_target_date || b.due_date || ''
                      return dateA.localeCompare(dateB)
                    })
                    .map(p => {
                      const date    = p.sla_target_date || p.due_date
                      const overdue = date && date < today && p.status === 'active'
                      return (
                        <button
                          key={p.id}
                          onClick={() => onProjectClick({ project: p, flow: (p as any).project_flows?.[0] })}
                          className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition"
                        >
                          <div className="flex items-start gap-2">
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[p.priority] ?? 'bg-gray-400'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate leading-snug">{p.title}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {p.is_blocked && <span className="text-[10px] text-red-500">🚫</span>}
                                {overdue      && <span className="text-[10px] text-orange-500">⚠️ Vencido</span>}
                                {date && (
                                  <span className={`text-[10px] ${overdue ? 'text-orange-500 font-semibold' : 'text-gray-400'}`}>
                                    {new Date(date + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                  </span>
                                )}
                                {p.requests?.requester_area && (
                                  <span className="text-[10px] text-gray-400 truncate">{p.requests.requester_area}</span>
                                )}
                              </div>
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${PRIORITY_COLOR[p.priority] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                              {p.priority === 'urgent' ? 'Urg' : p.priority === 'high' ? 'Alta' : p.priority === 'medium' ? 'Med' : 'Baja'}
                            </span>
                          </div>
                        </button>
                      )
                    })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sin fecha */}
      {projectsByQuarter.noDate.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-500 mb-3">Sin fecha de vencimiento ({projectsByQuarter.noDate.length})</p>
          <div className="flex flex-wrap gap-2">
            {projectsByQuarter.noDate.map(p => (
              <button
                key={p.id}
                onClick={() => onProjectClick({ project: p, flow: (p as any).project_flows?.[0] })}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[p.priority] ?? 'bg-gray-400'}`} />
                {p.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
