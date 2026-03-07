import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Request } from '../types/database.types'

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests(data || [])
    } catch (err) {
      console.error('Error loading requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (requestData: Partial<Request>) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert([requestData])
        .select()
        .single()

      if (error) throw error
      await loadRequests()
      return data
    } catch (err) {
      console.error('Error creating request:', err)
      throw err
    }
  }

const approveRequest = async (requestId: string, projectData: {
  project_type: 'development' | 'administrative' | 'dual'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}) => {
  try {
    // 1. Obtener el request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError) throw requestError

    // 2. Crear el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        request_id: requestId,
        title: `${request.request_type} - ${request.requester_area}`,
        description: request.description,
        project_type: projectData.project_type,
        priority: projectData.priority,
        status: 'active',
        is_blocked: false,
        tag_ids: []
      }])
      .select()
      .single()

    if (projectError) throw projectError

    // 3. Crear los flujos según el tipo de proyecto
    const flows = []
    
    if (projectData.project_type === 'development' || projectData.project_type === 'dual') {
      flows.push({
        project_id: project.id,
        flow_type: 'development',
        current_phase: 'backlog',
        progress: 0
      })
    }
    
    if (projectData.project_type === 'administrative' || projectData.project_type === 'dual') {
      flows.push({
        project_id: project.id,
        flow_type: 'administrative',
        current_phase: 'backlog',
        progress: 0
      })
    }

    const { error: flowsError } = await supabase
      .from('project_flows')
      .insert(flows)

    if (flowsError) throw flowsError

    // 4. Actualizar el request como aprobado
    const { error: updateError } = await supabase
      .from('requests')
      .update({ 
        status: 'approved',
        project_id: project.id
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    await loadRequests()
  } catch (err) {
    console.error('Error approving request:', err)
    throw err
  }
}

  const rejectRequest = async (requestId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', requestId)

      if (error) throw error
      await loadRequests()
    } catch (err) {
      console.error('Error rejecting request:', err)
      throw err
    }
  }

  const getRequestByNumber = async (requestNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('request_number', requestNumber)
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error getting request:', err)
      return null
    }
  }

  return {
    requests,
    loading,
    createRequest,
    approveRequest,
    rejectRequest,
    getRequestByNumber,
    reload: loadRequests
  }
}