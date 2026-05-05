import { useState, useEffect } from 'react'
import { getGlobalTimer, onBroadcastChange } from '../../lib/gameState'

export default function GlobalTimerBadge() {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    function update() {
      const t = getGlobalTimer()
      if (!t || !t.active) { setRemaining(null); return }
      const secs = Math.max(0, Math.round((t.endsAt - Date.now()) / 1000))
      setRemaining(secs)
    }
    update()
    const id = setInterval(update, 1000)
    const unsub = onBroadcastChange(() => update())
    return () => { clearInterval(id); unsub() }
  }, [])

  if (remaining === null) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isUrgent = remaining < 120
  const isDone = remaining === 0

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg hud-font text-xs font-bold ${isDone ? 'blink' : ''}`}
      style={{
        background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`,
        color: isUrgent ? '#ef4444' : '#f59e0b',
      }}
    >
      ⏰ {isDone ? 'ZEIT ABGELAUFEN!' : `${mins}:${String(secs).padStart(2, '0')}`}
    </div>
  )
}
