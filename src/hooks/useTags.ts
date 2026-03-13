import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Tag } from '../types/database.types'

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTags()
  }, [])

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')
      if (error) throw error
      setTags(data || [])
    } catch (err) {
      console.error('Error loading tags:', err)
    } finally {
      setLoading(false)
    }
  }

  const createTag = async (name: string, color: string) => {
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: name.trim(), color }])
      .select()
      .single()
    if (error) throw error
    await loadTags()
    return data as Tag
  }

  const updateTag = async (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => {
    const { error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
    if (error) throw error
    await loadTags()
  }

  const deleteTag = async (id: string) => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)
    if (error) throw error
    await loadTags()
  }

  // Helper: get tags by array of ids
  const getTagsById = (ids: string[]) => tags.filter(t => ids.includes(t.id))

  return { tags, loading, createTag, updateTag, deleteTag, getTagsById, reload: loadTags }
}
