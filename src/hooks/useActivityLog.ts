import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ActivityLog } from '../types/database.types'

export async function logActivity(projectId: string, action: string, details: Record<string, unknown> = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('activity_logs')
    .insert([{ project_id: projectId, action, details, user_id: user?.id ?? null }])
  if (error) console.warn('[ActivityLog] Error al registrar actividad:', error.message)
}

export function useActivityLog(projectId: string) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [projectId])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(50)
      setLogs(data || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  return { logs, loading, reload: loadLogs }
}
