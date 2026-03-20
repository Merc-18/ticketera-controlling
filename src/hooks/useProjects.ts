import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, ProjectFlow } from '../types/database.types'
import { logActivity } from './useActivityLog'
import { getAutoTagIds } from '../lib/auto-tags'

type StatusFilter = 'active' | 'completed' | 'archived'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')

  useEffect(() => {
    loadProjects(statusFilter)
  }, [statusFilter])

  const loadProjects = async (status: StatusFilter = statusFilter) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_flows (*),
          requests (requester_area, requester_name, request_type, request_number)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      // Leer estado actual para detectar cambios
      const current = projects.find(p => p.id === projectId)

      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      if (error) throw error

      // Registrar actividad según qué cambió
      if (updates.status && current?.status !== updates.status) {
        await logActivity(projectId, 'status_changed', { from: current?.status, to: updates.status })

        // SLA + Lead Time al completar
        if (updates.status === 'completed') {
          const { data: slaLog } = await supabase
            .from('activity_logs')
            .select('created_at, details')
            .eq('project_id', projectId)
            .eq('action', 'sla_started')
            .order('created_at', { ascending: true })
            .limit(1)
            .single()

          if (slaLog) {
            const now = Date.now()
            const approvalDate = new Date(slaLog.created_at).getTime()
            const daysElapsed = Math.ceil((now - approvalDate) / (1000 * 60 * 60 * 24))
            const dueDate = (slaLog.details as any)?.sla_due_date
            const onTime = dueDate ? new Date() <= new Date(dueDate + 'T23:59:59') : undefined

            // Lead time: desde creación del request hasta hoy
            let leadTimeDays: number | undefined
            let approvalWaitDays: number | undefined
            if (current?.request_id) {
              const { data: req } = await supabase
                .from('requests')
                .select('created_at')
                .eq('id', current.request_id)
                .single()
              if (req) {
                const requestCreated = new Date(req.created_at).getTime()
                leadTimeDays = Math.ceil((now - requestCreated) / (1000 * 60 * 60 * 24))
                approvalWaitDays = Math.ceil((approvalDate - requestCreated) / (1000 * 60 * 60 * 24))
              }
            }

            await logActivity(projectId, 'sla_completed', {
              cycle_time_days: daysElapsed,
              due_date: dueDate,
              on_time: onTime,
              ...(leadTimeDays !== undefined && { lead_time_days: leadTimeDays }),
              ...(approvalWaitDays !== undefined && { approval_wait_days: approvalWaitDays }),
            })
          }
        }
      } else if (updates.is_blocked === true) {
        await logActivity(projectId, 'blocked', { reason: updates.blocked_reason })
      } else if (updates.is_blocked === false) {
        await logActivity(projectId, 'unblocked', {})
      } else if (updates.priority && current?.priority !== updates.priority) {
        await logActivity(projectId, 'priority_changed', { from: current?.priority, to: updates.priority })
      } else if (updates.title || updates.description || updates.estimated_hours !== undefined || updates.actual_hours !== undefined) {
        const changed = Object.keys(updates).filter(k => k !== 'updated_at')
        await logActivity(projectId, 'edited', { fields: changed })
      }

      await loadProjects()
    } catch (err: any) {
      console.error('Error updating project:', err)
      throw err
    }
  }

  const updateFlowDetails = async (flowId: string, updates: { progress?: number; assigned_to?: string }) => {
    try {
      const { error } = await supabase
        .from('project_flows')
        .update({ ...updates })
        .eq('id', flowId)

      if (error) throw error
      await loadProjects()
    } catch (err: any) {
      console.error('Error updating flow details:', err)
      throw err
    }
  }

  const PHASE_PROGRESS: Record<string, number> = {
    // development
    backlog: 0, design: 20, dev: 40, testing: 60, deploy: 80, done: 100,
    // administrative
    ready_to_start: 20, discovery: 40, build: 60, uat_validation: 80, deployed: 100,
  }

  const updateProjectFlow = async (flowId: string, newPhase: string) => {
    try {
      // Encontrar la fase actual para registrar el cambio
      let projectId: string | undefined
      let fromPhase: string | undefined
      for (const p of projects) {
        const flow = (p as any).project_flows?.find((f: ProjectFlow) => f.id === flowId)
        if (flow) { projectId = p.id; fromPhase = flow.current_phase; break }
      }

      const newProgress = PHASE_PROGRESS[newPhase] ?? 0

      const { error } = await supabase
        .from('project_flows')
        .update({ current_phase: newPhase, progress: newProgress })
        .eq('id', flowId)

      if (error) throw error

      if (projectId) {
        // Calcular tiempo en la fase anterior
        const { data: lastLog } = await supabase
          .from('activity_logs')
          .select('created_at')
          .eq('project_id', projectId)
          .in('action', ['phase_changed', 'sla_started', 'created'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const duration_ms = lastLog
          ? Date.now() - new Date(lastLog.created_at).getTime()
          : undefined

        await logActivity(projectId, 'phase_changed', { from: fromPhase, to: newPhase, duration_ms })
      }

      await loadProjects()
    } catch (err: any) {
      console.error('Error updating project flow:', err)
      throw err
    }
  }

  const createProject = async (projectData: {
    title: string
    description: string
    project_type: 'development' | 'administrative' | 'dual'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    estimated_hours?: number
    start_date?: string
    due_date?: string
  }) => {
    try {
      const autoTagIds = await getAutoTagIds({
        priority:    projectData.priority,
        projectType: projectData.project_type,
      })

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: projectData.title.trim(),
          description: projectData.description.trim(),
          project_type: projectData.project_type,
          priority: projectData.priority,
          status: 'active',
          is_blocked: false,
          tag_ids: autoTagIds,
          estimated_hours: projectData.estimated_hours || null,
          start_date: projectData.start_date || null,
          due_date: projectData.due_date || null,
        }])
        .select()
        .single()

      if (projectError) throw projectError

      const flows = []
      if (projectData.project_type === 'development' || projectData.project_type === 'dual') {
        flows.push({ project_id: project.id, flow_type: 'development', current_phase: 'backlog', progress: 0 })
      }
      if (projectData.project_type === 'administrative' || projectData.project_type === 'dual') {
        flows.push({ project_id: project.id, flow_type: 'administrative', current_phase: 'backlog', progress: 0 })
      }

      const { error: flowsError } = await supabase.from('project_flows').insert(flows)
      if (flowsError) throw flowsError

      await logActivity(project.id, 'created', { title: project.title })
      await loadProjects()
      return project
    } catch (err: any) {
      console.error('Error creating project:', err)
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    reload: () => loadProjects(statusFilter),
    updateProject,
    updateProjectFlow,
    updateFlowDetails,
    createProject,
  }
}
