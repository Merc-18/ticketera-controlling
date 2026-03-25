import { supabase } from './supabase'

export async function sendNotification(params: {
  userId: string
  type: string
  title: string
  message?: string
  projectId?: string
}) {
  const { error } = await supabase.from('notifications').insert([{
    user_id:    params.userId,
    type:       params.type,
    title:      params.title,
    message:    params.message ?? null,
    project_id: params.projectId ?? null,
  }])
  if (error) console.warn('[Notification] Error al enviar:', error.message)
}
