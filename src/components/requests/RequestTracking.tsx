import { useState } from 'react'
import { useRequests } from '../../hooks/useRequests'
import type { Request } from '../../types/database.types'

export default function RequestTracking() {
  const { getRequestByNumber } = useRequests()
  const [requestNumber, setRequestNumber] = useState('')
  const [request, setRequest] = useState<Request | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setRequest(null)

    try {
      const result = await getRequestByNumber(requestNumber.toUpperCase())
      if (result) {
        setRequest(result)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      console.error('Error searching request:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Pendiente' },
    approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Aprobado' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Rechazado' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-info py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔍 Rastrear Solicitud
            </h1>
            <p className="text-gray-600">
              Ingresa tu número de seguimiento para ver el estado de tu solicitud
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={requestNumber}
                onChange={(e) => setRequestNumber(e.target.value)}
                placeholder="REQ-001"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-mono"
              />
              <button
                type="submit"
                disabled={loading || !requestNumber}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </form>

          {/* Not Found */}
          {notFound && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800 font-medium mb-2">
                ❌ Solicitud no encontrada
              </p>
              <p className="text-sm text-red-600">
                Verifica que el número sea correcto
              </p>
            </div>
          )}

          {/* Request Found */}
          {request && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 ${statusColors[request.status].bg} ${statusColors[request.status].text} ${statusColors[request.status].border}`}>
                  <span className="text-2xl">
                    {request.status === 'pending' && '⏳'}
                    {request.status === 'approved' && '✅'}
                    {request.status === 'rejected' && '❌'}
                  </span>
                  <span className="font-bold text-lg">
                    {statusColors[request.status].label}
                  </span>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Número de Solicitud</p>
                  <p className="font-mono font-bold text-xl text-primary">{request.request_number}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Solicitante</p>
                    <p className="font-medium text-gray-900">{request.requester_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Área</p>
                    <p className="font-medium text-gray-900">{request.requester_area}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo</p>
                  <p className="font-medium text-gray-900">{request.request_type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Descripción</p>
                  <p className="text-gray-900">{request.description}</p>
                </div>

                {request.observations && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                    <p className="text-gray-900">{request.observations}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                    <p className="text-gray-900">
                      {new Date(request.created_at).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                  {request.requested_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fecha Límite</p>
                      <p className="text-gray-900">
                        {new Date(request.requested_date).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                  )}
                </div>

                {request.status === 'rejected' && request.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 mb-1 font-medium">Razón del Rechazo</p>
                    <p className="text-red-800">{request.rejection_reason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRequest(null)
                    setRequestNumber('')
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Buscar otra solicitud
                </button>
                <button
                  onClick={() => window.location.href = '/request'}
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Nueva solicitud
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}