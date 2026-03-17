import { useState, useEffect } from 'react'
import { useTags } from '../../hooks/useTags'
import { supabase } from '../../lib/supabase'
import type { Tag } from '../../types/database.types'

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316',
  '#f59e0b','#10b981','#0ea5e9','#14b8a6','#64748b',
]

const DEDICATED_FIELDS = [
  { label: 'Prioridad',   values: 'LOW · MEDIUM · HIGH · URGENT',  color: 'bg-yellow-100 text-yellow-800' },
  { label: 'Área',        values: 'SAQ · DDC · QA · ATC · AASS',   color: 'bg-blue-100 text-blue-800'   },
  { label: 'Responsable', values: 'Nombre del usuario asignado',    color: 'bg-purple-100 text-purple-800' },
  { label: 'Fecha límite',values: 'Vencido / Vence hoy / X días',  color: 'bg-orange-100 text-orange-800' },
]

export default function TagManagement() {
  const { tags, loading, createTag, updateTag, deleteTag } = useTags()
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [saving, setSaving]     = useState(false)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editName, setEditName]       = useState('')
  const [editColor, setEditColor]     = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [usageMap, setUsageMap] = useState<Record<string, number>>({})

  useEffect(() => {
    loadUsage()
  }, [tags])

  const loadUsage = async () => {
    if (tags.length === 0) return
    const { data } = await supabase
      .from('projects')
      .select('tag_ids')
    if (!data) return
    const counts: Record<string, number> = {}
    for (const project of data) {
      for (const id of (project.tag_ids ?? [])) {
        counts[id] = (counts[id] ?? 0) + 1
      }
    }
    setUsageMap(counts)
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await createTag(newName, newColor)
      setNewName('')
      setNewColor(PRESET_COLORS[0])
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    try {
      await updateTag(id, { name: editName.trim(), color: editColor })
      setEditingId(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTag(id)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Gestión de Etiquetas</h3>
          <p className="text-sm text-gray-500 mt-0.5">Crea y administra las etiquetas para clasificar proyectos</p>
        </div>
      </div>

      {/* Aviso campos dedicados */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-800 mb-2">
          ⚠️ Estos datos ya tienen campo propio en la tarjeta — no crear etiquetas para ellos:
        </p>
        <div className="flex flex-wrap gap-2">
          {DEDICATED_FIELDS.map(f => (
            <div key={f.label} className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-3 py-1.5">
              <span className="text-xs font-semibold text-gray-700">{f.label}:</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${f.color}`}>{f.values}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-amber-700 mt-2">
          Las etiquetas deben usarse para categorías temáticas como: tecnología, tipo de proceso, dominio funcional, etc.
        </p>
      </div>

      {/* Crear nueva etiqueta */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">Nueva etiqueta</h4>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre de la etiqueta..."
            className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {/* Color presets */}
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-6 h-6 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={newColor}
              onChange={e => setNewColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0"
              title="Color personalizado"
            />
          </div>
          {/* Preview */}
          {newName && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: newColor }}>
              {newName}
            </span>
          )}
          <button
            onClick={handleCreate}
            disabled={saving || !newName.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Creando...' : '+ Crear'}
          </button>
        </div>
      </div>

      {/* Lista de tags */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {tags.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-3xl mb-2">🏷️</p>
            <p className="font-medium">No hay etiquetas aún</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Etiqueta</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Color</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Usos</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tags.map(tag => {
                const usos = usageMap[tag.id] ?? 0
                return (
                  <tr key={tag.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingId === tag.id ? (
                        <input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleUpdate(tag.id)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-primary w-40"
                          autoFocus
                        />
                      ) : (
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === tag.id ? (
                        <div className="flex items-center gap-1.5">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c}
                              onClick={() => setEditColor(c)}
                              className={`w-5 h-5 rounded-full transition-transform ${editColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                          <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-0" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: tag.color }} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {usos > 0 ? (
                        <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                          {usos} proyecto{usos !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin uso</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === tag.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(tag.id)}
                            className="px-3 py-1 bg-primary text-white rounded text-xs font-semibold hover:bg-blue-700 transition"
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : confirmDelete === tag.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">
                            {usos > 0 ? `Se quitará de ${usos} proyecto${usos !== 1 ? 's' : ''}. ¿Eliminar?` : '¿Eliminar?'}
                          </span>
                          <button onClick={() => handleDelete(tag.id)} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-semibold hover:bg-red-600 transition">Sí</button>
                          <button onClick={() => setConfirmDelete(null)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200 transition">No</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => startEdit(tag)} className="text-xs text-blue-600 hover:underline">Editar</button>
                          <button onClick={() => setConfirmDelete(tag.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
