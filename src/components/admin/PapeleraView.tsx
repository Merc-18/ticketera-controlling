import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../../hooks/useActivityLog'

interface DeletedProject {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_type: 'development' | 'administrative' | 'dual'
  updated_at: string
  project_number?: string
  requests?: { request_number: string } | null
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: '🔴 Urgente', high: '🟠 Alta', medium: '🟡 Media', low: '🟢 Baja',
}

const TYPE_LABEL: Record<string, string> = {
  development: '💻 Dev', administrative: '📋 Admin', dual: '🔄 Dual',
}

export default function PapeleraView() {
  const [projects, setProjects] = useState<DeletedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('id, title, priority, project_type, updated_at, project_number, requests(request_number)')
      .eq('status', 'deleted')
      .order('updated_at', { ascending: false })
    setProjects((data as DeletedProject[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const restore = async (id: string) => {
    setRestoring(true)
    try {
      await supabase
        .from('projects')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', id)
      await logActivity(id, 'project_restored', {})
      setConfirmRestore(null)
      await load()
    } finally {
      setRestoring(false)
    }
  }

  const permanentDelete = async (id: string) => {
    setDeleting(true)
    try {
      await supabase.from('projects').delete().eq('id', id)
      setConfirmDelete(null)
      await load()
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">🗑 Papelera</h3>
          <p className="text-sm text-gray-500 mt-0.5">Proyectos eliminados — podés restaurarlos o eliminarlos permanentemente</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={load}
            className="px-3 py-1 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-4xl mb-3">🗑</p>
          <p className="text-gray-500 font-medium">La papelera está vacía</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => {
            const code = p.requests?.request_number ?? p.project_number
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    {code && (
                      <span className="font-mono text-xs text-gray-400">{code}</span>
                    )}
                    <p className="font-medium text-gray-900 truncate">{p.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{TYPE_LABEL[p.project_type]}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{PRIORITY_LABEL[p.priority]}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">
                        Eliminado {new Date(p.updated_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setConfirmRestore(p.id)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                  >
                    ↩ Restaurar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                  >
                    Eliminar definitivo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Confirm restore */}
      {confirmRestore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">↩ Restaurar proyecto</h3>
            <p className="text-sm text-gray-600 mb-6">
              El proyecto volverá a estar <span className="font-semibold text-green-600">activo</span> y visible en los boards.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRestore(null)}
                disabled={restoring}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => restore(confirmRestore)}
                disabled={restoring}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm disabled:opacity-50"
              >
                {restoring ? 'Restaurando...' : 'Sí, restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm permanent delete */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">⚠️ Eliminar permanentemente</h3>
            <p className="text-sm text-gray-600 mb-6">
              Esta acción <span className="font-semibold text-red-600">no se puede deshacer</span>. El proyecto y todos sus datos serán eliminados definitivamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => permanentDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition text-sm disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
