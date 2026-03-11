import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  total: number
  byStatus: { active: number; completed: number; archived: number }
  byPriority: { urgent: number; high: number; medium: number; low: number }
  byArea: Record<string, number>
  byType: { development: number; administrative: number; dual: number }
  blocked: number
  overdue: number
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('status, priority, project_type, is_blocked, due_date, requests(requester_area)')

    if (!data) { setLoading(false); return }

    const byStatus   = { active: 0, completed: 0, archived: 0 }
    const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 }
    const byArea: Record<string, number> = {}
    const byType     = { development: 0, administrative: 0, dual: 0 }
    let blocked = 0, overdue = 0
    const today = new Date().toISOString().slice(0, 10)

    for (const p of data) {
      byStatus[p.status as keyof typeof byStatus]++
      byPriority[p.priority as keyof typeof byPriority]++
      byType[p.project_type as keyof typeof byType]++
      if (p.is_blocked) blocked++
      if (p.due_date && p.due_date < today && p.status === 'active') overdue++
      const area = (p as any).requests?.requester_area
      if (area) byArea[area] = (byArea[area] ?? 0) + 1
    }

    setStats({ total: data.length, byStatus, byPriority, byArea, byType, blocked, overdue })
    setLoading(false)
  }

  return { stats, loading, reload: load }
}
