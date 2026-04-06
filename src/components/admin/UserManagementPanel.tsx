import { useState } from 'react'
import { useUsers } from '../../hooks/useUsers'
import { useAuth } from '../../hooks/useAuth'
import UserModal from './UserModal'
import { getAvatarColor, getInitials } from '../../lib/constants'
import type { User } from '../../types/database.types'

type RoleOption = 'superadmin' | 'admin' | 'developer' | 'viewer'
type RoleFilter = 'all' | 'superadmin' | 'admin' | 'developer' | 'viewer' | 'inactive'

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  admin:      'bg-red-100 text-red-800 border-red-200',
  developer:  'bg-blue-100 text-blue-800 border-blue-200',
  viewer:     'bg-gray-100 text-gray-700 border-gray-200',
}

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'Superadmin',
  admin:      'Admin',
  developer:  'Usuario',
  viewer:     'Viewer',
}

export default function UserManagementPanel() {
  const { users, loading, error, reload, createUser, updateUser, deleteUser } = useUsers()
  const { user: currentUser } = useAuth()
  const currentUserRole = (currentUser?.role ?? 'viewer') as RoleOption
  const isSuperAdmin = currentUserRole === 'superadmin'

  const [filter, setFilter]       = useState<RoleFilter>('all')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<User | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<User | null>(null)

  // Admins cannot see superadmin users
  const visibleUsers = isSuperAdmin
    ? users
    : users.filter(u => u.role !== 'superadmin')

  const filtered = visibleUsers.filter(u => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'inactive') return u.is_active === false
    if (filter === 'all')      return u.is_active !== false
    return u.role === filter && u.is_active !== false
  })

  const stats = {
    total:      visibleUsers.filter(u => u.is_active !== false).length,
    superadmin: users.filter(u => u.role === 'superadmin' && u.is_active !== false).length,
    admin:      visibleUsers.filter(u => u.role === 'admin'      && u.is_active !== false).length,
    developer:  visibleUsers.filter(u => u.role === 'developer'  && u.is_active !== false).length,
    viewer:     visibleUsers.filter(u => u.role === 'viewer'     && u.is_active !== false).length,
    inactive:   visibleUsers.filter(u => u.is_active === false).length,
  }

  const handleCreate = async (data: { email: string; password: string; full_name: string; role: RoleOption }) => {
    const result = await createUser(data)
    if (result.sessionLost) {
      setActionMsg('Usuario creado. Tu sesión fue cerrada — vuelve a iniciar sesión.')
    } else {
      setActionMsg(`Usuario "${data.full_name}" creado exitosamente.`)
      setTimeout(() => setActionMsg(null), 4000)
    }
    return result
  }

  const handleUpdate = async (userId: string, data: { full_name?: string; role?: RoleOption; is_active?: boolean }) => {
    await updateUser(userId, data)
    setActionMsg('Usuario actualizado correctamente.')
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleDelete = async (u: User) => {
    await deleteUser(u.id)
    setConfirmDelete(null)
    setActionMsg(`Usuario "${u.full_name}" eliminado.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  const handleToggleActive = async (u: User) => {
    const newState = u.is_active === false
    await updateUser(u.id, { is_active: newState })
    setActionMsg(`Usuario "${u.full_name}" ${newState ? 'activado' : 'desactivado'}.`)
    setTimeout(() => setActionMsg(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        Error al cargar usuarios: {error}
        <button onClick={reload} className="ml-3 underline text-sm">Reintentar</button>
      </div>
    )
  }

  // Filter buttons shown based on role
  const filterOptions: { key: RoleFilter; label: string }[] = [
    { key: 'all',       label: 'Todos' },
    ...(isSuperAdmin ? [{ key: 'superadmin' as RoleFilter, label: 'Superadmin' }] : []),
    { key: 'admin',     label: 'Admin' },
    { key: 'developer', label: 'Usuario' },
    { key: 'viewer',    label: 'Viewer' },
    { key: 'inactive',  label: '🔒 Inactivos' },
  ]

  return (
    <div className="space-y-5">
      {/* Mensaje de acción */}
      {actionMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 flex items-center justify-between">
          <span>✅ {actionMsg}</span>
          <button onClick={() => setActionMsg(null)} className="text-green-600 hover:text-green-800 ml-4">✕</button>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total Activos', value: stats.total,      color: 'border-blue-500',    icon: '👥', show: true },
          { label: 'Superadmins',   value: stats.superadmin, color: 'border-yellow-500',  icon: '⭐', show: isSuperAdmin },
          { label: 'Admins',        value: stats.admin,      color: 'border-red-500',     icon: '🔑', show: true },
          { label: 'Usuarios',      value: stats.developer,  color: 'border-blue-400',    icon: '💻', show: true },
          { label: 'Viewers',       value: stats.viewer,     color: 'border-gray-400',    icon: '👁️', show: true },
          { label: 'Inactivos',     value: stats.inactive,   color: 'border-orange-400',  icon: '🔒', show: true },
        ].filter(s => s.show).map(s => (
          <div key={s.label} className={`bg-white rounded-xl border-l-4 ${s.color} p-4 shadow-sm flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar nombre o email..."
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-52"
          />
          <button
            onClick={() => { setEditing(null); setShowModal(true) }}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition flex items-center gap-1.5 shadow-sm"
          >
            ➕ Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3">Usuario</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rol</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Creado</th>
                <th className="text-right px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(u => {
                // Admins cannot edit superadmin users (shouldn't appear, but guard anyway)
                const canEdit = isSuperAdmin || u.role !== 'superadmin'
                return (
                  <tr key={u.id} className={`hover:bg-gray-50 transition ${u.is_active === false ? 'opacity-60' : ''}`}>
                    {/* Avatar + Nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(u.full_name)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                          {getInitials(u.full_name)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{u.full_name}</span>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    {/* Rol */}
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${ROLE_BADGE[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                    </td>
                    {/* Estado */}
                    <td className="px-4 py-3">
                      {u.is_active !== false ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    {/* Creado */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('es-PE')}
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-3">
                      {canEdit ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditing(u); setShowModal(true) }}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              u.is_active !== false
                                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {u.is_active !== false ? '🔒 Desactivar' : '✅ Activar'}
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => setConfirmDelete(u)}
                              className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                            >
                              🗑 Eliminar
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-right">🔒 Solo Superadmin</p>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 text-right">
        {filtered.length} usuario{filtered.length !== 1 ? 's' : ''} mostrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">🗑 Eliminar usuario</h3>
            <p className="text-gray-600 text-sm mb-1">
              ¿Estás seguro que deseas eliminar a <strong>{confirmDelete.full_name}</strong>?
            </p>
            <p className="text-red-600 text-xs mb-5">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editing ?? undefined}
          currentUserRole={currentUserRole}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
