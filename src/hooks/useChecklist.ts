import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { ChecklistItem } from '../types/database.types'

export function useChecklist(flowId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (flowId) loadItems()
  }, [flowId])

  const loadItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('project_flow_id', flowId)
        .order('order_index')

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('Error loading checklist:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (itemId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', itemId)

      if (error) throw error

      const updated = items.map(i =>
        i.id === itemId ? { ...i, completed, completed_at: completed ? new Date().toISOString() : undefined } : i
      )
      setItems(updated)

      // Recalcular progreso del flujo
      const total = updated.length
      const done = updated.filter(i => i.completed).length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0

      await supabase
        .from('project_flows')
        .update({ progress })
        .eq('id', flowId)
    } catch (err) {
      console.error('Error toggling checklist item:', err)
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      const updated = items.filter(i => i.id !== itemId)
      setItems(updated)

      // Recalcular progreso
      const total = updated.length
      const done = updated.filter(i => i.completed).length
      const progress = total > 0 ? Math.round((done / total) * 100) : 0

      await supabase
        .from('project_flows')
        .update({ progress })
        .eq('id', flowId)
    } catch (err) {
      console.error('Error deleting checklist item:', err)
      throw err
    }
  }

  const addItem = async (phase: string, description: string) => {
    try {
      const phaseItems = items.filter(i => i.phase === phase)
      const { data, error } = await supabase
        .from('checklist_items')
        .insert([{
          project_flow_id: flowId,
          phase,
          description,
          completed: false,
          order_index: phaseItems.length,
        }])
        .select()
        .single()

      if (error) throw error
      setItems(prev => [...prev, data])
    } catch (err) {
      console.error('Error adding checklist item:', err)
      throw err
    }
  }

  const reorderItems = async (phase: string, fromIdx: number, toIdx: number) => {
    const others    = items.filter(i => i.phase !== phase)
    const phaseList = [...items.filter(i => i.phase === phase)]
    const [moved]   = phaseList.splice(fromIdx, 1)
    phaseList.splice(toIdx, 0, moved)
    const reordered = phaseList.map((item, idx) => ({ ...item, order_index: idx }))
    setItems([...others, ...reordered])
    await Promise.all(
      reordered.map(item =>
        supabase.from('checklist_items').update({ order_index: item.order_index }).eq('id', item.id)
      )
    )
  }

  return { items, loading, toggleItem, addItem, deleteItem, reorderItems, reload: loadItems }
}
