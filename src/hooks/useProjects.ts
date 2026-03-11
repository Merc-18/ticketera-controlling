import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, ProjectFlow } from '../types/database.types'
import { logActivity } from './useActivityLog'

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
          requests (requester_area, requester_name, request_type)
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

  const updateProjectFlow = async (flowId: string, newPhase: string) => {
    try {
      // Encontrar la fase actual para registrar el cambio
      let projectId: string | undefined
      let fromPhase: string | undefined
      for (const p of projects) {
        const flow = (p as any).project_flows?.find((f: ProjectFlow) => f.id === flowId)
        if (flow) { projectId = p.id; fromPhase = flow.current_phase; break }
      }

      const { error } = await supabase
        .from('project_flows')
        .update({ current_phase: newPhase })
        .eq('id', flowId)

      if (error) throw error

      if (projectId) {
        await logActivity(projectId, 'phase_changed', { from: fromPhase, to: newPhase })
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
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: projectData.title.trim(),
          description: projectData.description.trim(),
          project_type: projectData.project_type,
          priority: projectData.priority,
          status: 'active',
          is_blocked: false,
          tag_ids: [],
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
