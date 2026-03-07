import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Project, ProjectFlow } from '../types/database.types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_flows (*)
        `)
        .eq('status', 'active')
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

  const updateProjectFlow = async (
    flowId: string,
    newPhase: string
  ) => {
    try {
      const { error } = await supabase
        .from('project_flows')
        .update({ current_phase: newPhase })
        .eq('id', flowId)

      if (error) throw error
      
      // Recargar proyectos
      await loadProjects()
    } catch (err: any) {
      console.error('Error updating project flow:', err)
      throw err
    }
  }

  return {
    projects,
    loading,
    error,
    reload: loadProjects,
    updateProjectFlow
  }
}