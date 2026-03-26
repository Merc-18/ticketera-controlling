import { useState, useEffect } from 'react'
import { subscribeToast } from '../../lib/toast'

interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string }

const STYLES: Record<Toast['type'], string> = {
  success: 'bg-green-600',
  error:   'bg-red-600',
  info:    'bg-gray-800',
}

const ICONS: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return subscribeToast(t => {
      setToasts(prev => [...prev, t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3500)
    })
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-sm font-medium text-white pointer-events-auto ${STYLES[t.type]}`}
        >
          <span className="text-base leading-none">{ICONS[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
