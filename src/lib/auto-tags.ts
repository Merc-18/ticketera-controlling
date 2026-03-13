import { supabase } from './supabase'

// Mapeo de valores internos a nombres legibles (para matching con tags)
const PRIORITY_NAMES: Record<string, string[]> = {
  urgent: ['urgente', 'urgent'],
  high:   ['alta', 'high'],
  medium: ['media', 'medium'],
  low:    ['baja', 'low'],
}

const TYPE_NAMES: Record<string, string[]> = {
  development:    ['development', 'desarrollo', 'backend', 'frontend'],
  administrative: ['administrative', 'administrativo', 'admin'],
  dual:           ['dual'],
}

/**
 * Returns tag IDs that match the project's priority and type.
 * Area and requestType are intentionally excluded — they are already
 * shown as separate badges on the project card, so including them
 * here would create duplicate labels.
 */
export async function getAutoTagIds(params: {
  priority?: string | null
  projectType?: string | null
}): Promise<string[]> {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name')

  if (error || !tags) return []

  const candidates = new Set<string>()

  if (params.priority) {
    const aliases = PRIORITY_NAMES[params.priority] ?? [params.priority.toLowerCase()]
    aliases.forEach(a => candidates.add(a))
  }

  if (params.projectType) {
    const aliases = TYPE_NAMES[params.projectType] ?? [params.projectType.toLowerCase()]
    aliases.forEach(a => candidates.add(a))
  }

  return tags
    .filter(t => candidates.has(t.name.toLowerCase()))
    .map(t => t.id)
}
