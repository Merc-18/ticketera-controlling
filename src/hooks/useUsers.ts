import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../types/database.types'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  /**
   * Crea un nuevo usuario via supabase.auth.signUp.
   * Si el proyecto NO requiere confirmación de email, la sesión del admin
   * se reemplaza por la del nuevo usuario → retorna sessionLost: true
   * para que el componente avise al usuario que debe re-loguearse.
   */
  const createUser = async (userData: {
    email: string
    password: string
    full_name: string
    role: 'superadmin' | 'admin' | 'developer' | 'viewer'
  }): Promise<{ sessionLost: boolean }> => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (signUpError) throw signUpError
    if (!data.user) throw new Error('No se pudo crear el usuario en auth')

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: true,
      })

    if (insertError) throw insertError

    // Si se creó una sesión nueva (confirmación de email desactivada),
    // cerrarla para que el admin tenga que re-loguearse.
    if (data.session) {
      await supabase.auth.signOut()
      return { sessionLost: true }
    }

    await loadUsers()
    return { sessionLost: false }
  }

  const updateUser = async (
    userId: string,
    updates: {
      full_name?: string
      role?: 'superadmin' | 'admin' | 'developer' | 'viewer'
      is_active?: boolean
    }
  ) => {
    const { is_active, ...baseUpdates } = updates

    // Actualizar campos base (full_name, role) siempre
    if (Object.keys(baseUpdates).length > 0) {
      const { error } = await supabase
        .from('users')
        .update({ ...baseUpdates, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
    }

    // Actualizar is_active por separado — si falla, la columna aún no existe
    if (is_active !== undefined) {
      const { error } = await supabase
        .from('users')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) {
        if (error.message.includes('is_active') || error.code === '42703') {
          throw new Error(
            'La columna "is_active" no existe aún. Ejecuta la migración en Supabase SQL Editor:\n\n' +
            'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;'
          )
        }
        throw error
      }
    }

    await loadUsers()
  }

  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
    if (error) throw error
    await loadUsers()
  }

  const activeUsers = users.filter(u => u.is_active !== false)

  return {
    users,
    activeUsers,
    loading,
    error,
    reload: loadUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
