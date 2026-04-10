import { motion } from 'framer-motion'

interface Props {
  message: string
  variant?: 'info' | 'warning' | 'success' | 'error'
}

const colors = {
  info: { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)', text: '#67e8f9', icon: '🤖' },
  warning: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)', text: '#fcd34d', icon: '⚠️' },
  success: { border: '#10b981', bg: 'rgba(16,185,129,0.08)', text: '#6ee7b7', icon: '✅' },
  error: { border: '#ef4444', bg: 'rgba(239,68,68,0.08)', text: '#fca5a5', icon: '🚨' },
}

export default function AuraMessage({ message, variant = 'info' }: Props) {
  const c = colors[variant]
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-lg p-4 flex gap-3 items-start"
      style={{ border: `1px solid ${c.border}40`, background: c.bg }}
    >
      <div className="text-xl shrink-0 aria-idle">{c.icon}</div>
      <div>
        <div className="text-xs hud-font mb-1" style={{ color: c.border }}>AURA</div>
        <p className="text-sm leading-relaxed" style={{ color: c.text }}>{message}</p>
      </div>
    </motion.div>
  )
}
