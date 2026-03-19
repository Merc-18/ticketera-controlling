import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Request } from '../types/database.types'
import { DEFAULT_CHECKLIST } from '../lib/checklist-defaults'
import { getAutoTagIds } from '../lib/auto-tags'
import { logActivity } from './useActivityLog'

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
      // Convert empty date strings to null to avoid DB type errors
      const cleanedData = {
        ...requestData,
        request_date: requestData.request_date || null,
        requested_date: requestData.requested_date || null,
      }
      const { data, error } = await supabase
        .from('requests')
        .insert([cleanedData])
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
  title?: string
  start_date?: string
  due_date?: string
  assigned_dev?: string
  assigned_admin?: string
}) => {
  try {
    // 1. Obtener el request
    const { data: request, error: requestError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError) throw requestError

    // 2. Auto-tags based on priority and project type
    // (area is already shown as a separate badge on the card)
    const autoTagIds = await getAutoTagIds({
      priority:    projectData.priority,
      projectType: projectData.project_type,
    })

    // 3. Crear el proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        request_id: requestId,
        title: projectData.title?.trim() || `${request.request_type} - ${request.requester_area}`,
        description: request.description,
        project_type: projectData.project_type,
        priority: projectData.priority,
        status: 'active',
        is_blocked: false,
        tag_ids: autoTagIds,
        start_date: projectData.start_date || null,
        due_date: projectData.due_date || null,
      }])
      .select()
      .single()

    if (projectError) throw projectError

    // Log SLA start
    await logActivity(project.id, 'sla_started', {
      sla_due_date: projectData.due_date || null,
      request_number: request.request_number,
    })

    // 3. Crear los flujos según el tipo de proyecto
    const flows = []
    
    if (projectData.project_type === 'development' || projectData.project_type === 'dual') {
      flows.push({
        project_id: project.id,
        flow_type: 'development',
        current_phase: 'backlog',
        progress: 0,
        assigned_to: projectData.assigned_dev || null,
      })
    }

    if (projectData.project_type === 'administrative' || projectData.project_type === 'dual') {
      flows.push({
        project_id: project.id,
        flow_type: 'administrative',
        current_phase: 'backlog',
        progress: 0,
        assigned_to: projectData.assigned_admin || null,
      })
    }

    const { data: createdFlows, error: flowsError } = await supabase
      .from('project_flows')
      .insert(flows)
      .select()

    if (flowsError) throw flowsError

    // 3b. Crear checklist items por defecto para cada flujo y fase
    const checklistItems: {
      project_flow_id: string
      phase: string
      description: string
      completed: boolean
      order_index: number
    }[] = []

    for (const flow of createdFlows || []) {
      const flowDefaults = DEFAULT_CHECKLIST[flow.flow_type as 'development' | 'administrative'] || {}
      for (const [phase, descriptions] of Object.entries(flowDefaults)) {
        descriptions.forEach((description, idx) => {
          checklistItems.push({
            project_flow_id: flow.id,
            phase,
            description,
            completed: false,
            order_index: idx,
          })
        })
      }
    }

    if (checklistItems.length > 0) {
      const { error: checklistError } = await supabase
        .from('checklist_items')
        .insert(checklistItems)
      if (checklistError) throw checklistError
    }

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