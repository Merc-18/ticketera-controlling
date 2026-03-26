import { useState } from 'react'
import type { Project, ProjectFlow } from '../../types/database.types'
import { PRIORITY_COLORS, PHASE_LABELS, PRIORITY_LABEL } from '../../lib/constants'

interface ProjectWithRelations extends Project {
  project_flows?: ProjectFlow[]
  requests?: { requester_area: string; requester_name: string; request_type: string } | null
}

interface Props {
  projects: ProjectWithRelations[]
  boardType: 'development' | 'administrative'
  onProjectClick: (item: { project: ProjectWithRelations; flow: ProjectFlow }) => void
  loading?: boolean
}

type SortKey = 'title' | 'priority' | 'area' | 'phase' | 'progress' | 'due_date' | 'created_at'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

function exportTableCSV(sorted: Array<{ project: ProjectWithRelations; flow: ProjectFlow }>) {
  const PRIORITY_ES: Record<string, string> = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja' }
  const headers = ['Título', 'Prioridad', 'Área', 'Fase', 'Progreso', 'Vencimiento', 'Creado']
  const rows = sorted.map(({ project, flow }) => [
    project.title,
    PRIORITY_ES[project.priority] ?? project.priority,
    project.requests?.requester_area ?? '',
    PHASE_LABELS[flow.current_phase] ?? flow.current_phase,
    `${flow.progress}%`,
    project.due_date ?? '',
    new Date(project.created_at).toLocaleDateString('es-PE'),
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `proyectos-tabla-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TableView({ projects, boardType, onProjectClick, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const items = projects
    .map(project => {
      const flow = (project.project_flows ?? []).find(f => f.flow_type === boardType)
      return flow ? { project, flow } : null
    })
    .filter(Boolean) as Array<{ project: ProjectWithRelations; flow: ProjectFlow }>

  const sorted = [...items].sort((a, b) => {
    let cmp = 0
    const pa = a.project, pb = b.project
    if (sortKey === 'title')      cmp = pa.title.localeCompare(pb.title)
    if (sortKey === 'priority')   cmp = PRIORITY_ORDER[pa.priority] - PRIORITY_ORDER[pb.priority]
    if (sortKey === 'area')       cmp = ((pa.requests?.requester_area ?? '') > (pb.requests?.requester_area ?? '') ? 1 : -1)
    if (sortKey === 'phase')      cmp = (a.flow.current_phase > b.flow.current_phase ? 1 : -1)
    if (sortKey === 'progress')   cmp = a.flow.progress - b.flow.progress
    if (sortKey === 'due_date')   cmp = ((pa.due_date ?? '9999') > (pb.due_date ?? '9999') ? 1 : -1)
    if (sortKey === 'created_at') cmp = (pa.created_at > pb.created_at ? 1 : -1)
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortHeader({ k, label }: { k: SortKey; label: string }) {
    const active = sortKey === k
    return (
      <th
        onClick={() => toggleSort(k)}
        className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer select-none hover:bg-gray-100 transition whitespace-nowrap"
      >
        <span className="flex items-center gap-1">
          {label}
          <span className="text-gray-400">
            {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </span>
      </th>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden animate-pulse">
        <div className="bg-gray-50 border-b h-10" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center border-b px-4 gap-6" style={{ height: 52 }}>
            <div className="flex-1 h-3 bg-gray-200 rounded" style={{ maxWidth: 220 }} />
            <div className="h-5 w-14 bg-gray-100 rounded" />
            <div className="w-12 h-3 bg-gray-100 rounded" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full" />
              <div className="w-8 h-3 bg-gray-100 rounded" />
            </div>
            <div className="w-16 h-3 bg-gray-100 rounded" />
            <div className="w-16 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <span className="text-5xl mb-3">📋</span>
        <p className="text-lg font-medium">No hay proyectos para mostrar</p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <SortHeader k="title"      label="Título" />
              <SortHeader k="priority"   label="Prioridad" />
              <SortHeader k="area"       label="Área" />
              <SortHeader k="phase"      label="Fase" />
              <SortHeader k="progress"   label="Progreso" />
              <SortHeader k="due_date"   label="Vencimiento" />
              <SortHeader k="created_at" label="Creado" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map(({ project, flow }) => {
              const area = project.requests?.requester_area
              const isOverdue = project.due_date && project.due_date < today && project.status === 'active'
              return (
                <tr
                  key={project.id}
                  onClick={() => onProjectClick({ project, flow })}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  {/* Título */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex items-start gap-2">
                      {project.is_blocked && <span title="Bloqueado" className="text-red-500 shrink-0">🚫</span>}
                      <span className="font-medium text-gray-900 line-clamp-2">{project.title}</span>
                    </div>
                  </td>

                  {/* Prioridad */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${PRIORITY_COLORS[project.priority]}`}>
                      {PRIORITY_LABEL[project.priority]}
                    </span>
                  </td>

                  {/* Área */}
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">
                    {area ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* Fase */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700 font-medium">
                    {PHASE_LABELS[flow.current_phase] ?? flow.current_phase}
                  </td>

                  {/* Progreso */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${flow.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{flow.progress}%</span>
                    </div>
                  </td>

                  {/* Vencimiento */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {project.due_date ? (
                      <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                        {isOverdue && '⚠️ '}
                        {new Date(project.due_date + 'T00:00:00').toLocaleDateString('es-PE')}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Creado */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                    {new Date(project.created_at).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
        <span>{sorted.length} proyecto{sorted.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => exportTableCSV(sorted)}
          className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:bg-gray-100 transition"
        >
          ⬇ Exportar CSV
        </button>
      </div>
    </div>
  )
}
