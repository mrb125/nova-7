import { motion } from 'framer-motion'

interface Props {
  title: string
  text: string
  wpEarned: number
  dosimeterDelta: number
  variant: 'best' | 'ok' | 'bad'
  hasJustification?: boolean
  onNext: () => void
}

const variantStyles = {
  best: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', label: '⭐ OPTIMALE ENTSCHEIDUNG', color: '#6ee7b7' },
  ok: { bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', label: '⚡ AKZEPTABLE ENTSCHEIDUNG', color: '#fcd34d' },
  bad: { bg: 'rgba(239,68,68,0.08)', border: '#ef4444', label: '⚠ SCHLECHTE ENTSCHEIDUNG', color: '#fca5a5' },
}

export default function FeedbackCard({ title, text, wpEarned, dosimeterDelta, variant, onNext }: Omit<Props, 'hasJustification'> & { hasJustification?: boolean }) {
  const s = variantStyles[variant]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-6"
      style={{ background: s.bg, border: `1px solid ${s.border}40` }}
    >
      <div className="hud-font text-sm font-bold mb-3" style={{ color: s.color }}>{s.label}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-300 text-sm leading-relaxed mb-5">{text}</p>

      <div className="flex gap-4 mb-3">
        <div className="flex-1 rounded-lg p-3 text-center" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="text-yellow-400 font-bold text-xl hud-font">+{wpEarned}</div>
          <div className="text-xs text-slate-400 hud-font">WISSENSPUNKTE</div>
        </div>
        <div className="flex-1 rounded-lg p-3 text-center" style={{
          background: dosimeterDelta === 0 ? 'rgba(16,185,129,0.1)' : dosimeterDelta <= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${dosimeterDelta === 0 ? 'rgba(16,185,129,0.2)' : dosimeterDelta <= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <div className="font-bold text-xl hud-font"
            style={{ color: dosimeterDelta === 0 ? '#6ee7b7' : dosimeterDelta <= 5 ? '#fcd34d' : '#fca5a5' }}>
            {dosimeterDelta === 0 ? '✓ Kein Schaden' : `+${dosimeterDelta} mSv`}
          </div>
          <div className="text-xs text-slate-400 hud-font">DOSIMETER</div>
        </div>
      </div>

      <div className="mb-5" />

      <button
        onClick={onNext}
        className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
          border: '1px solid rgba(6,182,212,0.3)',
        }}
      >
        NÄCHSTER SEKTOR →
      </button>
    </motion.div>
  )
}
