import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import type { Comment } from '../../types/database.types'

interface Props {
  projectId: string
}

interface CommentWithUser extends Comment {
  user?: { full_name: string; role: string } | null
}

export default function CommentsSection({ projectId }: Props) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('comment_author') ?? '')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadComments() }, [projectId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:users(full_name, role)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const name = authorName.trim()
    if (name) localStorage.setItem('comment_author', name)

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ project_id: projectId, content: newComment.trim() }])

      if (error) throw error
      setNewComment('')
      await loadComments()
    } catch (err) {
      console.error('Error creating comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-sm text-gray-600">Cargando comentarios...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 border space-y-2">
        <input
          type="text"
          value={authorName}
          onChange={e => setAuthorName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">💬</p>
            <p>No hay comentarios aún</p>
            <p className="text-sm">Sé el primero en comentar</p>
          </div>
        ) : (
          comments.map(comment => {
            const displayName = comment.user?.full_name || 'Anónimo'
            const initial = displayName.charAt(0).toUpperCase()
            return (
              <div key={comment.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{displayName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString('es-PE', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
