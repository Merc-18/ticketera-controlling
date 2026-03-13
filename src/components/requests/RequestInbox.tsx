import { useState } from 'react'
import { useRequests } from '../../hooks/useRequests'
import { useUsers } from '../../hooks/useUsers'
import type { Request } from '../../types/database.types'

export default function RequestInbox() {
  const { requests, loading, approveRequest, rejectRequest } = useRequests()
  const { activeUsers } = useUsers()
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [sameUser, setSameUser] = useState(false)
  const [approveData, setApproveData] = useState({
    project_type: 'development' as 'development' | 'administrative' | 'dual',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    title: '',
    estimated_hours: '',
    start_date: '',
    due_date: '',
    assigned_dev: '',
    assigned_admin: '',
  })

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')
  const rejectedRequests = requests.filter(r => r.status === 'rejected')

  const handleApprove = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      await approveRequest(selectedRequest.id, {
        ...approveData,
        estimated_hours: approveData.estimated_hours ? Number(approveData.estimated_hours) : undefined,
        start_date: approveData.start_date || undefined,
        due_date: approveData.due_date || undefined,
        assigned_dev:   approveData.assigned_dev   || undefined,
        assigned_admin: sameUser
          ? (approveData.assigned_dev || undefined)
          : (approveData.assigned_admin || undefined),
      })
      setShowApproveModal(false)
      setSelectedRequest(null)
      setSameUser(false)
    } catch (err) {
      alert('Error al aprobar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return

    setActionLoading(true)
    try {
      await rejectRequest(selectedRequest.id, rejectionReason)
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedRequest(null)
    } catch (err) {
      alert('Error al rechazar la solicitud')
    } finally {
      setActionLoading(false)
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium">
          Pendientes ({pendingRequests.length})
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Aprobadas ({approvedRequests.length})
        </button>
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
          Rechazadas ({rejectedRequests.length})
        </button>
      </div>

      {/* Request List */}
      <div className="grid gap-4">
        {pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay solicitudes pendientes</p>
          </div>
        ) : (
          pendingRequests.map(request => (
            <div
              key={request.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-primary">{request.request_number}</p>
                  <p className="font-semibold text-gray-900">{request.requester_name}</p>
                  <p className="text-sm text-gray-600">{request.requester_area}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}>
                  Pendiente
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Tipo:</span> {request.request_type}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                    setApproveData(d => ({ ...d, title: `${request.request_type} - ${request.requester_area}` }))
                    setShowApproveModal(true)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition disabled:opacity-50"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequest(request)
                    setShowRejectModal(true)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  ✕ Rechazar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && !showRejectModal && !showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalle de Solicitud</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Número</p>
                  <p className="font-mono font-bold text-primary">{selectedRequest.request_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[selectedRequest.status]}`}>
                    {selectedRequest.status === 'pending' && 'Pendiente'}
                    {selectedRequest.status === 'approved' && 'Aprobado'}
                    {selectedRequest.status === 'rejected' && 'Rechazado'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Solicitante</p>
                <p className="font-medium">{selectedRequest.requester_name}</p>
                {selectedRequest.requester_email && (
                  <p className="text-sm text-gray-600">{selectedRequest.requester_email}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">Área</p>
                <p className="font-medium">{selectedRequest.requester_area}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Tipo de Requerimiento</p>
                <p className="font-medium">{selectedRequest.request_type}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Origen</p>
                <p className="font-medium">{selectedRequest.origin}</p>
              </div>

              {selectedRequest.data_system_involved && (
                <div>
                  <p className="text-sm text-gray-600">Sistema Involucrado</p>
                  <p className="font-medium">{selectedRequest.data_system_involved}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Descripción</p>
                <p className="text-gray-900">{selectedRequest.description}</p>
              </div>

              {selectedRequest.observations && (
                <div>
                  <p className="text-sm text-gray-600">Observaciones</p>
                  <p className="text-gray-900">{selectedRequest.observations}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRequest.needs_code}
                  disabled
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Requiere código</span>
              </div>

              {selectedRequest.requested_date && (
                <div>
                  <p className="text-sm text-gray-600">Fecha Límite</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.requested_date).toLocaleDateString('es-PE')}
                  </p>
                </div>
              )}
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setApproveData(d => ({ ...d, title: `${selectedRequest.request_type} - ${selectedRequest.requester_area}` }))
                    setShowApproveModal(true)
                  }}
                  disabled={actionLoading}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                >
                  ✓ Aprobar
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  ✕ Rechazar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rechazar Solicitud</h2>
            
            <p className="text-gray-600 mb-4">
              Solicitud: <span className="font-mono font-bold text-primary">{selectedRequest.request_number}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón del Rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                placeholder="Explica por qué se rechaza esta solicitud..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || actionLoading}
                className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {actionLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">✅ Aprobar y Crear Proyecto</h2>
              <button onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Info solicitud */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm">
              <p className="font-medium text-blue-900">{selectedRequest.request_number} · {selectedRequest.requester_name}</p>
              <p className="text-blue-700">{selectedRequest.request_type} · {selectedRequest.requester_area}</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={approveData.title}
                  onChange={e => setApproveData(d => ({ ...d, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre del proyecto"
                />
              </div>

              {/* Tipo + Prioridad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-red-500">*</span></label>
                  <select
                    value={approveData.project_type}
                    onChange={e => setApproveData(d => ({ ...d, project_type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="development">💻 Development</option>
                    <option value="administrative">📋 Administrative</option>
                    <option value="dual">🔄 Dual Flow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad <span className="text-red-500">*</span></label>
                  <select
                    value={approveData.priority}
                    onChange={e => setApproveData(d => ({ ...d, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">🟢 Baja</option>
                    <option value="medium">🟡 Media</option>
                    <option value="high">🟠 Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>
              </div>

              {/* Horas estimadas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                <input
                  type="number" min="0"
                  value={approveData.estimated_hours}
                  onChange={e => setApproveData(d => ({ ...d, estimated_hours: e.target.value }))}
                  placeholder="ej. 40"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={approveData.start_date}
                    onChange={e => setApproveData(d => ({ ...d, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={approveData.due_date}
                    onChange={e => setApproveData(d => ({ ...d, due_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* ── Asignación de responsables ── */}
              {activeUsers.length > 0 && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-700">👤 Asignación de responsables</p>

                  {/* Development / único */}
                  {(approveData.project_type === 'development' || approveData.project_type === 'dual') && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {approveData.project_type === 'dual' ? '💻 Responsable Development' : '👤 Responsable'}
                      </label>
                      <select
                        value={approveData.assigned_dev}
                        onChange={e => setApproveData(d => ({ ...d, assigned_dev: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="">— Sin asignar —</option>
                        {activeUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Dual: mismo usuario toggle + admin dropdown */}
                  {approveData.project_type === 'dual' && (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={sameUser}
                          onChange={e => setSameUser(e.target.checked)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-xs text-gray-600">Usar el mismo responsable para ambos flujos</span>
                      </label>

                      {!sameUser && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">📋 Responsable Administrative</label>
                          <select
                            value={approveData.assigned_admin}
                            onChange={e => setApproveData(d => ({ ...d, assigned_admin: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                          >
                            <option value="">— Sin asignar —</option>
                            {activeUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {sameUser && approveData.assigned_dev && (
                        <p className="text-xs text-blue-600 bg-blue-50 rounded px-3 py-2">
                          Ambos flujos asignados a: <strong>{activeUsers.find(u => u.id === approveData.assigned_dev)?.full_name}</strong>
                        </p>
                      )}
                    </>
                  )}

                  {/* Administrative solo */}
                  {approveData.project_type === 'administrative' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">👤 Responsable</label>
                      <select
                        value={approveData.assigned_admin}
                        onChange={e => setApproveData(d => ({ ...d, assigned_admin: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary bg-white"
                      >
                        <option value="">— Sin asignar —</option>
                        {activeUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading || !approveData.title.trim()}
                className="flex-1 bg-green-500 text-white py-2.5 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                {actionLoading ? 'Creando proyecto...' : '✅ Aprobar y crear proyecto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}