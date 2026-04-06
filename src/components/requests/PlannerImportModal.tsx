import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { useRequests } from '../../hooks/useRequests'
import { toast } from '../../lib/toast'

interface PlannerRow {
  'Task Name'?: string
  'Bucket Name'?: string
  'Assigned To'?: string
  'Created By'?: string
  'Start date'?: string
  'Due date'?: string
  'Progress'?: string | number
  'Completed Date'?: string
  'Labels'?: string
  'Description'?: string
  'Priority'?: string
  [key: string]: any
}

interface ParsedRow {
  title: string
  requester_name: string
  bucket: string
  assigned_to: string
  start_date: string
  due_date: string
  description: string
  labels: string
  progress: number
  completed: boolean
  original_priority: string
}

function parseExcelDate(value: any): string {
  if (!value) return ''
  // Excel serial number
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000))
    return date.toISOString().slice(0, 10)
  }
  // Already a string like "01/15/2026" or "2026-01-15"
  const str = String(value).trim()
  if (!str) return ''
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  } catch { /* ignore */ }
  return ''
}

function parseProgress(value: any): number {
  if (!value) return 0
  const n = Number(String(value).replace('%', '').trim())
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n))
}

function buildObservations(row: ParsedRow): string {
  const parts: string[] = []
  if (row.bucket)      parts.push(`Bucket: ${row.bucket}`)
  if (row.assigned_to) parts.push(`Asignado a: ${row.assigned_to}`)
  if (row.labels)      parts.push(`Labels: ${row.labels}`)
  if (row.progress > 0) parts.push(`Progreso en Planner: ${row.progress}%`)
  if (row.completed)   parts.push(`Completado en Planner`)
  if (row.original_priority) parts.push(`Prioridad en Planner: ${row.original_priority}`)
  return parts.join(' · ')
}

export default function PlannerImportModal({ onClose }: { onClose: () => void }) {
  const { createRequest } = useRequests()
  const inputRef = useRef<HTMLInputElement>(null)

  const [rows, setRows] = useState<ParsedRow[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [imported, setImported] = useState(0)
  const [step, setStep] = useState<'upload' | 'preview'>('upload')

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json: PlannerRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })

        const parsed: ParsedRow[] = json
          .filter(r => r['Task Name'] && String(r['Task Name']).trim())
          .map(r => {
            const taskName    = String(r['Task Name'] ?? '').trim()
            const assignedTo  = String(r['Assigned To'] ?? '').trim()
            const title       = assignedTo ? `${taskName} — ${assignedTo}` : taskName
            const completedDate = parseExcelDate(r['Completed Date'])

            return {
              title,
              requester_name: String(r['Created By'] ?? 'Importado de Planner').trim() || 'Importado de Planner',
              bucket:         String(r['Bucket Name'] ?? '').trim(),
              assigned_to:    assignedTo,
              start_date:     parseExcelDate(r['Start date']),
              due_date:       parseExcelDate(r['Due date']),
              description:    String(r['Description'] ?? '').trim() || taskName,
              labels:         String(r['Labels'] ?? '').trim(),
              progress:       parseProgress(r['Progress']),
              completed:      !!completedDate,
              original_priority: String(r['Priority'] ?? '').trim(),
            }
          })

        setRows(parsed)
        setSelected(new Set(parsed.map((_, i) => i)))
        setStep('preview')
      } catch (err) {
        toast.error('Error al leer el archivo. Verifica que sea un Excel válido de Planner.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((_, i) => i)))
  }

  const toggleRow = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleImport = async () => {
    const toImport = rows.filter((_, i) => selected.has(i))
    if (toImport.length === 0) return
    setImporting(true)

    let count = 0
    for (const row of toImport) {
      try {
        await createRequest({
          requester_name:       row.requester_name,
          requester_email:      '',
          requester_area:       'DDC',
          request_type:         row.bucket || 'Otro',
          origin:               'Interno',
          data_system_involved: '',
          description:          row.description,
          observations:         buildObservations(row),
          request_date:         new Date().toISOString().slice(0, 10),
          requested_date:       row.due_date || undefined,
          needs_code:           false,
          status:               'pending',
        })
        count++
      } catch (err) {
        console.error('Error importing row:', row.title, err)
      }
    }

    setImported(count)
    setImporting(false)
    setDone(true)
    toast.success(`${count} solicitudes importadas correctamente`)
  }

  // ── Done screen ──
  if (done) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{imported} solicitudes importadas</h2>
          <p className="text-gray-500 text-sm mb-6">
            Aparecen en la pestaña <strong>Pendientes</strong> listas para aprobar o rechazar.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📥 Importar desde Planner</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Las tareas importadas quedarán como solicitudes <strong>pendientes</strong> con prioridad <strong>baja</strong>
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Step: upload */}
        {step === 'upload' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition cursor-pointer w-full max-w-md"
              onClick={() => inputRef.current?.click()}
            >
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-700 font-semibold mb-1">Arrastra el Excel aquí</p>
              <p className="text-gray-400 text-sm mb-4">o haz clic para seleccionar el archivo</p>
              <p className="text-xs text-gray-400">Exporta desde Planner → Exportar plan a Excel (.xlsx)</p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              />
            </div>
          </div>
        )}

        {/* Step: preview */}
        {step === 'preview' && (
          <>
            {/* Toolbar */}
            <div className="px-6 py-3 border-b bg-gray-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selected.size === rows.length}
                    onChange={toggleAll}
                    className="w-4 h-4 accent-primary"
                  />
                  Seleccionar todo
                </label>
                <span className="text-xs text-gray-400">{selected.size} de {rows.length} seleccionadas</span>
              </div>
              <button
                onClick={() => { setStep('upload'); setRows([]); setSelected(new Set()) }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Cambiar archivo
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0">
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="text-left px-4 py-3">Título</th>
                    <th className="text-left px-4 py-3">Solicitante</th>
                    <th className="text-left px-4 py-3">Bucket</th>
                    <th className="text-left px-4 py-3">Inicio</th>
                    <th className="text-left px-4 py-3">Vence</th>
                    <th className="text-left px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => toggleRow(i)}
                      className={`cursor-pointer transition ${selected.has(i) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={selected.has(i)}
                          onChange={() => toggleRow(i)}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 accent-primary"
                        />
                      </td>
                      <td className="px-4 py-2.5 max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{row.title}</p>
                        {row.description && row.description !== row.title && (
                          <p className="text-xs text-gray-400 truncate">{row.description}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{row.requester_name}</td>
                      <td className="px-4 py-2.5">
                        {row.bucket && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{row.bucket}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{row.start_date || '—'}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{row.due_date || '—'}</td>
                      <td className="px-4 py-2.5">
                        {row.completed ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">Completado</span>
                        ) : row.progress > 0 ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{row.progress}%</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-500">
                Todas las solicitudes se importarán con prioridad <strong>🟢 Baja</strong> y área <strong>DDC</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={selected.size === 0 || importing}
                  className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                      Importando...
                    </>
                  ) : (
                    `📥 Importar ${selected.size} solicitud${selected.size !== 1 ? 'es' : ''}`
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
