type ToastType = 'success' | 'error' | 'info'

interface ToastItem { id: number; type: ToastType; message: string }
type Listener = (t: ToastItem) => void

let counter = 0
const listeners: Listener[] = []

function emit(message: string, type: ToastType) {
  const item: ToastItem = { id: ++counter, type, message }
  listeners.forEach(fn => fn(item))
}

export const toast = {
  success: (msg: string) => emit(msg, 'success'),
  error:   (msg: string) => emit(msg, 'error'),
  info:    (msg: string) => emit(msg, 'info'),
}

export function subscribeToast(fn: Listener): () => void {
  listeners.push(fn)
  return () => { const i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1) }
}
