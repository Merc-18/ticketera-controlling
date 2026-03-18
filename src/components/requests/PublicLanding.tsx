import { useNavigate } from 'react-router-dom'

export default function PublicLanding() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-info flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">🎯 Controlling</h1>
          <p className="text-blue-100 text-lg">¿Qué deseas hacer?</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nueva Solicitud */}
          <button
            onClick={() => navigate('/request')}
            className="bg-white rounded-2xl p-8 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
              Nueva Solicitud
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Completa el formulario para enviar una solicitud al equipo de Controlling.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Ir al formulario
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Rastrear Solicitud */}
          <button
            onClick={() => navigate('/tracking')}
            className="bg-white rounded-2xl p-8 text-left shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
              Rastrear Solicitud
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Consulta el estado de una solicitud existente con tu número de seguimiento.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Ver estado
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-xs mt-10">
          Equipo Controlling · Gilat
        </p>
      </div>
    </div>
  )
}
