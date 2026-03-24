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
  sla: {
    total: number
    onTime: number
    late: number
    rate: number
    avgCycleTime: number | null
    avgLeadTime: number | null
  }
  completedByMonth: { month: string; total: number; onTime: number }[]
}

export function useDashboardData(periodDays: number | null = null) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [periodDays])

  async function load() {
    setLoading(true)

    // SLA logs: filter by period if specified
    let slaQuery = supabase
      .from('activity_logs')
      .select('details, created_at')
      .eq('action', 'sla_completed')
      .order('created_at', { ascending: true })

    if (periodDays !== null) {
      const since = new Date(Date.now() - periodDays * 86400000).toISOString()
      slaQuery = slaQuery.gte('created_at', since)
    }

    const [{ data: projects }, { data: slaLogs }] = await Promise.all([
      supabase
        .from('projects')
        .select('status, priority, project_type, is_blocked, due_date, requests(requester_area)'),
      slaQuery,
    ])

    // ── Projects stats ──────────────────────────────────────────────
    const byStatus   = { active: 0, completed: 0, archived: 0 }
    const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 }
    const byArea: Record<string, number> = {}
    const byType     = { development: 0, administrative: 0, dual: 0 }
    let blocked = 0, overdue = 0
    const today = new Date().toISOString().slice(0, 10)

    for (const p of projects ?? []) {
      byStatus[p.status as keyof typeof byStatus]++
      byPriority[p.priority as keyof typeof byPriority]++
      byType[p.project_type as keyof typeof byType]++
      if (p.is_blocked) blocked++
      if (p.due_date && p.due_date < today && p.status === 'active') overdue++
      const area = (p as any).requests?.requester_area
      if (area) byArea[area] = (byArea[area] ?? 0) + 1
    }

    // ── SLA / Cycle Time / Lead Time stats ───────────────────────────
    let onTime = 0, late = 0
    const cycleTimes: number[] = []
    const leadTimes: number[] = []
    const monthMap: Record<string, { total: number; onTime: number }> = {}

    for (const log of slaLogs ?? []) {
      const d = log.details as any
      const month = (log.created_at as string).slice(0, 7)

      if (d?.on_time === true) onTime++
      else if (d?.on_time === false) late++

      const ct = d?.cycle_time_days ?? d?.days_elapsed
      if (ct !== undefined) cycleTimes.push(Number(ct))
      if (d?.lead_time_days !== undefined) leadTimes.push(Number(d.lead_time_days))

      if (!monthMap[month]) monthMap[month] = { total: 0, onTime: 0 }
      monthMap[month].total++
      if (d?.on_time === true) monthMap[month].onTime++
    }

    const slaTotal = onTime + late
    const slaRate  = slaTotal > 0 ? Math.round((onTime / slaTotal) * 100) : 0
    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

    const completedByMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, v]) => ({
        month: new Date(month + '-15').toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }),
        ...v,
      }))

    setStats({
      total: (projects ?? []).length,
      byStatus, byPriority, byArea, byType, blocked, overdue,
      sla: { total: slaTotal, onTime, late, rate: slaRate, avgCycleTime: avg(cycleTimes), avgLeadTime: avg(leadTimes) },
      completedByMonth,
    })
    setLoading(false)
  }

  return { stats, loading, reload: load }
}
