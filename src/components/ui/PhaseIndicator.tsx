interface Props {
  steps: string[]
  current: number
}

export default function PhaseIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-1 text-xs hud-font flex-wrap">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-slate-700">›</span>}
          <span
            style={{
              color: i < current ? '#10b981' : i === current ? '#06b6d4' : '#475569',
              fontWeight: i === current ? '700' : '400',
            }}
          >
            {i < current ? '✓' : `${i + 1}.`} {step}
          </span>
        </span>
      ))}
    </div>
  )
}
