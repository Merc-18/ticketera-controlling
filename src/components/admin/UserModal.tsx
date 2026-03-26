import { useState } from 'react'
import type { User } from '../../types/database.types'

type RoleOption = 'admin' | 'developer' | 'viewer'

interface Props {
  user?: User           // Si se pasa → modo edición; si no → modo creación
  onClose: () => void
  onCreate?: (data: { email: string; password: string; full_name: string; role: RoleOption }) => Promise<{ sessionLost: boolean }>
  onUpdate?: (userId: string, data: { full_name?: string; role?: RoleOption; is_active?: boolean }) => Promise<void>
}

const ROLES: { value: RoleOption; label: string; desc: string; color: string }[] = [
  { value: 'admin',     label: 'Admin',     desc: 'Acceso total: gestión de usuarios, proyectos y configuración', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'developer', label: 'Developer', desc: 'Gestión de proyectos, actualizar fases y progreso',             color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'viewer',    label: 'Viewer',    desc: 'Solo lectura: puede ver proyectos y dashboard',                 color: 'bg-gray-100 text-gray-700 border-gray-200' },
]

export default function UserModal({ user, onClose, onCreate, onUpdate }: Props) {
  const isEdit = !!user

  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [email,    setEmail]    = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<RoleOption>(user?.role ?? 'developer')
  const [isActive, setIsActive] = useState(user?.is_active !== false)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('El nombre es requerido'); return }
    if (!isEdit && !email.trim()) { setError('El email es requerido'); return }
    if (!isEdit && password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setSaving(true)
    setError(null)
    try {
      if (isEdit && onUpdate && user) {
        await onUpdate(user.id, { full_name: fullName.trim(), role, is_active: isActive })
        onClose()
      } else if (!isEdit && onCreate) {
        const result = await onCreate({ email: email.trim(), password, full_name: fullName.trim(), role })
        if (result.sessionLost) {
          // La sesión del admin fue reemplazada → el ProtectedRoute redirigirá a login
          // No cerramos el modal; el app se encargará
        } else {
          onClose()
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Ej: María García"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Email (solo en creación) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Contraseña (solo en creación) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rol *</label>
            <div className="space-y-2">
              {ROLES.map(r => (
                <label
                  key={r.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    role === r.value ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${r.color} mr-2`}>
                      {r.label}
                    </span>
                    <span className="text-xs text-gray-500">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Activo / Inactivo (solo en edición) */}
          {isEdit && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
              <div>
                <p className="text-sm font-medium text-gray-700">Estado del usuario</p>
                <p className="text-xs text-gray-500">Los usuarios inactivos no pueden iniciar sesión</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Aviso creación */}
          {!isEdit && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
              <strong>Nota:</strong> Si la confirmación de email está desactivada en Supabase, tu sesión
              se cerrará automáticamente al crear el usuario. Vuelve a iniciar sesión con tu cuenta de admin.
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition"
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
