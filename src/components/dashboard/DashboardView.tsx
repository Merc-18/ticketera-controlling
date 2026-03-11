import { useDashboardData } from '../../hooks/useDashboardData'

function StatCard({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: string
}) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${color} p-5 shadow-sm flex items-center gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function HBarChart({ title, items }: {
  title: string
  items: { label: string; value: number; color: string }[]
}) {
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">{title}</h3>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-24 shrink-0 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 w-5 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardView() {
  const { stats, loading, reload } = useDashboardData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const priorityItems = [
    { label: '🔴 Urgente', value: stats.byPriority.urgent, color: 'bg-red-500' },
    { label: '🟠 Alta',    value: stats.byPriority.high,   color: 'bg-orange-500' },
    { label: '🟡 Media',   value: stats.byPriority.medium, color: 'bg-yellow-400' },
    { label: '🟢 Baja',    value: stats.byPriority.low,    color: 'bg-green-500' },
  ]

  const typeItems = [
    { label: '💻 Development',  value: stats.byType.development,  color: 'bg-blue-500' },
    { label: '📋 Administrative', value: stats.byType.administrative, color: 'bg-purple-500' },
    { label: '🔀 Dual',         value: stats.byType.dual,         color: 'bg-indigo-400' },
  ]

  const areaItems = Object.entries(stats.byArea)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => {
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500', 'bg-pink-500']
      return { label, value, color: colors[i % colors.length] }
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📈 Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Resumen general de todos los proyectos</p>
        </div>
        <button
          onClick={reload}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition shadow-sm"
        >
          ↺ Actualizar
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total"       value={stats.total}            icon="📊" color="border-blue-500" />
        <StatCard label="Activos"     value={stats.byStatus.active}   icon="🟢" color="border-green-500" />
        <StatCard label="Completados" value={stats.byStatus.completed} icon="✅" color="border-emerald-500" />
        <StatCard label="Archivados"  value={stats.byStatus.archived}  icon="📦" color="border-gray-400" />
        <StatCard label="Bloqueados"  value={stats.blocked}            icon="🚫" color="border-red-500" />
        <StatCard label="Vencidos"    value={stats.overdue}            icon="⚠️" color="border-orange-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HBarChart title="Por Prioridad" items={priorityItems} />
        <HBarChart title="Por Tipo" items={typeItems} />
        {areaItems.length > 0
          ? <HBarChart title="Por Área" items={areaItems} />
          : (
            <div className="bg-white rounded-xl border p-5 shadow-sm flex items-center justify-center text-gray-400 text-sm">
              Sin datos de área disponibles
            </div>
          )
        }
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Estado de proyectos</h3>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'Activos',     value: stats.byStatus.active,    pct: stats.total ? Math.round(stats.byStatus.active / stats.total * 100) : 0,    bg: 'bg-green-100',   text: 'text-green-800',   bar: 'bg-green-500' },
            { label: 'Completados', value: stats.byStatus.completed,  pct: stats.total ? Math.round(stats.byStatus.completed / stats.total * 100) : 0,  bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' },
            { label: 'Archivados',  value: stats.byStatus.archived,   pct: stats.total ? Math.round(stats.byStatus.archived / stats.total * 100) : 0,   bg: 'bg-gray-100',    text: 'text-gray-600',    bar: 'bg-gray-400' },
          ].map(s => (
            <div key={s.label} className={`flex-1 min-w-[140px] rounded-lg p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className={`text-sm ${s.text} font-medium`}>{s.label}</p>
              <div className="mt-2 bg-white bg-opacity-60 rounded-full h-2">
                <div className={`h-2 rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
              </div>
              <p className={`text-xs mt-1 ${s.text} opacity-70`}>{s.pct}% del total</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
