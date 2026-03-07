import { useState } from 'react'
import { useRequests } from '../../hooks/useRequests'

const AREAS = ['SAQ', 'DDC', 'QA', 'ATC', 'AASS']

const SYSTEMS = [
  'Power BI',
  'Power Automate',
  'Power Apps',
  'Sharepoint',
  'BD (Access, Sql)',
  'Excel',
  'Otro'
]

const REQUEST_TYPES = {
  administrative: [
    'Reporte',
    'Acceso / Permiso',
    'Mejora de proceso',
    'Automatización',
    'Capacitación',
    'Otro'
  ],
  development: [
    'Automatización con IA',
    'Digitalización de proceso',
    'Integración de sistemas',
    'Feature nueva',
    'Bug / Error',
    'Mejora técnica',
    'Otro'
  ]
}

const ORIGINS = ['Interno', 'Externo', 'Regulatorio', 'Cliente', 'Otro']

export default function PublicRequestForm() {
  const { createRequest } = useRequests()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [requestNumber, setRequestNumber] = useState('')

  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    requester_area: '',
    request_type: '',
    origin: 'Interno' as const,
    data_system_involved: '',
    description: '',
    observations: '',
    request_date: '', // Fecha de solicitud
    requested_date: '', // Fecha límite
    needs_code: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createRequest({
        ...formData,
        status: 'pending'
      })

      setRequestNumber(result.request_number)
      setSuccess(true)
      
      // Reset form
      setFormData({
        requester_name: '',
        requester_email: '',
        requester_area: '',
        request_type: '',
        origin: 'Interno',
        data_system_involved: '',
        description: '',
        observations: '',
        request_date: '',
        requested_date: '',
        needs_code: false
      })
    } catch (err) {
      console.error('Error creating request:', err)
      alert('Error al crear la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const allRequestTypes = Array.from(new Set([...REQUEST_TYPES.administrative, ...REQUEST_TYPES.development]))

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-info flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Solicitud Creada!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu solicitud ha sido registrada exitosamente
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Número de seguimiento:</p>
            <p className="text-3xl font-bold text-primary">{requestNumber}</p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Guarda este número para rastrear el estado de tu solicitud
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Crear otra solicitud
            </button>
            <button
              onClick={() => window.location.href = '/tracking'}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Rastrear mi solicitud
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-info py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📝 Nueva Solicitud
            </h1>
            <p className="text-gray-600">
              Completa el formulario para crear una solicitud al equipo de Controlling
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Solicitante */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Información del Solicitante
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.requester_name}
                  onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.requester_email}
                  onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="juan.perez@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Área <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.requester_area}
                  onChange={(e) => setFormData({ ...formData, requester_area: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Selecciona un área</option>
                  {AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información de la Solicitud */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">
                Información de la Solicitud
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Requerimiento <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Selecciona un tipo</option>
                  {allRequestTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origen <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {ORIGINS.map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datos / Sistema Involucrado
                </label>
                <select
                  value={formData.data_system_involved}
                  onChange={(e) => setFormData({ ...formData, data_system_involved: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Selecciona un sistema</option>
                  {SYSTEMS.map(system => (
                    <option key={system} value={system}>{system}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Describe detalladamente tu solicitud..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Información adicional (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Solicitud <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.request_date}
                    onChange={(e) => setFormData({ ...formData, request_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Tentativa Límite
                  </label>
                  <input
                    type="date"
                    value={formData.requested_date}
                    onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="needs_code"
                  checked={formData.needs_code}
                  onChange={(e) => setFormData({ ...formData, needs_code: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="needs_code" className="text-sm font-medium text-gray-700">
                  ¿Se necesita código para este requerimiento?
                </label>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}