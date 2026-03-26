import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import type { Comment } from '../../types/database.types'
import { logActivity } from '../../hooks/useActivityLog'
import { useUsers } from '../../hooks/useUsers'
import { sendNotification } from '../../lib/notifications'

interface Props {
  projectId: string
}

interface CommentWithUser extends Comment {
  user?: { full_name: string; role: string } | null
}

function renderContent(text: string) {
  const parts = text.split(/(@\w+)/g)
  return parts.map((part, i) =>
    /^@\w+$/.test(part)
      ? <span key={i} className="text-blue-600 font-semibold">{part}</span>
      : <span key={i}>{part}</span>
  )
}

export default function CommentsSection({ projectId }: Props) {
  const { activeUsers } = useUsers()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart ?? val.length
    const textBefore = val.slice(0, cursor)
    const match = textBefore.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1].toLowerCase())
      setShowMentions(true)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
    setNewComment(val)
  }

  const handleMentionSelect = (fullName: string) => {
    const firstName = fullName.split(' ')[0]
    const cursor = textareaRef.current?.selectionStart ?? newComment.length
    const before = newComment.slice(0, cursor).replace(/@(\w*)$/, `@${firstName} `)
    const after  = newComment.slice(cursor)
    setNewComment(before + after)
    setShowMentions(false)
    setMentionQuery('')
    textareaRef.current?.focus()
  }

  const mentionedUsers = showMentions
    ? activeUsers.filter(u =>
        u.full_name.split(' ')[0].toLowerCase().startsWith(mentionQuery)
      )
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .insert([{ project_id: projectId, content: newComment.trim() }])
        .select()
        .single()

      if (error) throw error

      await logActivity(projectId, 'comment_added', {
        comment_id: comment.id,
        preview: newComment.trim().slice(0, 80),
      })

      // Notificar a usuarios mencionados
      const mentions = [...newComment.matchAll(/@(\w+)/g)].map(m => m[1].toLowerCase())
      const toNotify = activeUsers.filter(u =>
        mentions.includes(u.full_name.split(' ')[0].toLowerCase())
      )
      for (const user of toNotify) {
        await sendNotification({
          userId:    user.id,
          type:      'mention',
          title:     'Te mencionaron en un comentario',
          message:   newComment.trim().slice(0, 80),
          projectId,
        })
      }

      setNewComment('')
      setShowMentions(false)
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
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleTextChange}
            onKeyDown={e => { if (e.key === 'Escape') setShowMentions(false) }}
            placeholder="Escribe un comentario... usa @nombre para mencionar a alguien"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
          />
          {/* Mention dropdown */}
          {showMentions && mentionedUsers.length > 0 && (
            <div className="absolute left-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] py-1 max-h-40 overflow-y-auto">
              <p className="px-3 py-1 text-[10px] text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-100">
                Mencionar
              </p>
              {mentionedUsers.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); handleMentionSelect(u.full_name) }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-800 hover:bg-blue-50 transition"
                >
                  @{u.full_name.split(' ')[0]}
                  <span className="text-xs text-gray-400 ml-1">{u.full_name.split(' ').slice(1).join(' ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Usa @ para mencionar a un colega</p>
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
                    <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {renderContent(comment.content)}
                    </p>
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
