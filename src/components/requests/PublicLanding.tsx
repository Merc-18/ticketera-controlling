import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Iniciar sesión</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu-email@gilat.com"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
          >
            {loading ? 'Ingresando...' : 'Ingresar al sistema'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">Solo para el equipo de Controlling</p>
      </div>
    </div>
  )
}

export default function PublicLanding() {
  const navigate    = useNavigate()
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-info flex flex-col">

      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">🎯 Ticketera Controlling</span>
          <span className="text-blue-200 text-sm hidden sm:inline">· Gilat</span>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition backdrop-blur-sm"
        >
          🔐 Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <p className="text-blue-100 text-lg">¿Qué deseas hacer?</p>
          </div>

          {/* Cards */}
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

          <p className="text-center text-blue-200 text-xs mt-10">
            Equipo Controlling · Gilat
          </p>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
