import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePendingCount(enabled = true) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled) return

    load()

    const channel = supabase
      .channel('pending_requests_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [enabled])

  async function load() {
    const { count: n } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    setCount(n ?? 0)
  }

  return count
}
