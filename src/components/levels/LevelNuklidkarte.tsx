import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const ISOTOPES = [
  { id: 'c12', symbol: 'C-12', Z: 6, N: 6, A: 12, correct: 'stabil', hint: 'N/Z = 1,0 — auf der Stabilitätslinie' },
  { id: 'n16', symbol: 'N-16', Z: 7, N: 9, A: 16, correct: 'beta-minus', hint: 'N/Z = 1,29 — Neutronenüberschuss → β⁻' },
  { id: 'c11', symbol: 'C-11', Z: 6, N: 5, A: 11, correct: 'beta-plus', hint: 'N/Z = 0,83 — Protonenüberschuss → β⁺/EC' },
  { id: 'u238', symbol: 'U-238', Z: 92, N: 146, A: 238, correct: 'alpha', hint: 'Z > 83 → schwere Kerne zerfallen bevorzugt durch α' },
  { id: 'fe56', symbol: 'Fe-56', Z: 26, N: 30, A: 56, correct: 'stabil', hint: 'Höchste Bindungsenergie pro Nukleon — der stabilste Kern' },
]

const DECAY_OPTIONS = [
  { id: 'stabil', label: 'Stabil', icon: '✅', color: '#10b981' },
  { id: 'alpha', label: 'α-Zerfall', icon: 'α', color: '#f59e0b' },
  { id: 'beta-minus', label: 'β⁻-Zerfall', icon: 'β⁻', color: '#8b5cf6' },
  { id: 'beta-plus', label: 'β⁺-Zerfall / EC', icon: 'β⁺', color: '#06b6d4' },
]

const KEYWORDS = ['stabilitätslinie', 'neutronenüberschuss', 'protonenüberschuss', 'n/z-verhältnis', 'alpha', 'beta', 'schwer', 'bindungsenergie', 'ordnungszahl', 'magische zahlen']

export default function LevelNuklidkarte({ state: _state, onComplete }: LevelProps) {
  const [choices, setChoices] = useState<Record<string, string | null>>(
    Object.fromEntries(ISOTOPES.map(iso => [iso.id, null]))
  )
  const [phase, setPhase] = useState<'classify' | 'justify' | 'feedback'>('classify')
  const [justText, setJustText] = useState('')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)

  const allAnswered = Object.values(choices).every(v => v !== null)

  function handleConfirm() {
    const correct = ISOTOPES.filter(iso => choices[iso.id] === iso.correct).length
    let wp = correct * 2; let dos = 10
    if (correct >= 4) dos = 0
    else if (correct >= 2) dos = 5
    setWpResult(wp)
    setDosResult(dos)
    setPhase('justify')
  }

  function handleJustification(text: string) {
    setJustText(text)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR ZETA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Isotop-Datenbank wiederhergestellt. Stabilitätsanalyse abgeschlossen.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Nuklidkarte & Stabilität"
          text="Stabile Kerne liegen auf der Stabilitätslinie (leichte Kerne: N ≈ Z, schwere: N > Z). Neutronenüberschuss → β⁻-Zerfall (Neutron wird zu Proton). Protonenüberschuss → β⁺-Zerfall / Elektroneneinfang (Proton wird zu Neutron). Kerne mit Z > 83 sind alle instabil und zerfallen bevorzugt durch α-Zerfall. Fe-56 hat die höchste Bindungsenergie pro Nukleon."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { choices },
            justification: justText,
            justificationScore: 0,
          })}
        />
      </div>
    )
  }

  if (phase === 'justify') {
    return (
      <JustificationField
        question="Erkläre, wie man anhand des N/Z-Verhältnisses die Zerfallsart eines Kerns vorhersagen kann."
        keywords={KEYWORDS}
        onSubmit={handleJustification}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Klassifizierung']} current={0} />
      <div className="glass-panel p-5">
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor ZETA.</strong> AURA: „Isotop-Datenbank beschädigt. Klassifiziere die folgenden 5 Isotope: stabil oder Zerfall?"
        </p>
      </div>

      <AuraMessage
        message="Nutze das N/Z-Verhältnis: Leichte stabile Kerne haben N ≈ Z. Schwere Kerne (Z > 83) zerfallen meist durch α. Neutronenüberschuss → β⁻, Protonenüberschuss → β⁺."
        variant="info"
      />

      <div className="glass-panel p-5">
        <h3 className="hud-font text-sm text-white mb-3">NUKLIDKARTE — STABILITÄTSANALYSE</h3>

        <svg viewBox="0 0 600 280" className="w-full mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          {/* Axes */}
          <line x1="60" y1="250" x2="580" y2="250" stroke="#334155" strokeWidth="1" />
          <line x1="60" y1="250" x2="60" y2="20" stroke="#334155" strokeWidth="1" />
          <text x="320" y="275" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">Neutronenzahl N →</text>
          <text x="15" y="140" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace" transform="rotate(-90 15 140)">Protonenzahl Z →</text>

          {/* Stability line region (diagonal band) */}
          <path d="M60,250 L100,230 L180,180 L280,120 L380,70 L480,40 L560,25" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="6 3" opacity="0.7" />
          <path d="M60,250 L100,235 L180,190 L280,135 L380,85 L480,55 L560,40" stroke="none" fill="#10b981" opacity="0.06" />
          <path d="M60,250 L100,225 L180,170 L280,105 L380,55 L480,25 L560,10" stroke="none" fill="#10b981" opacity="0.06" />

          {/* Beta-minus region label (above stability line = neutron-rich) */}
          <text x="200" y="200" fill="#8b5cf6" fontSize="9" fontFamily="monospace" opacity="0.6">β⁻ (N-Überschuss)</text>
          {/* Beta-plus region label (below stability line = proton-rich) */}
          <text x="250" y="90" fill="#06b6d4" fontSize="9" fontFamily="monospace" opacity="0.6">β⁺ / EC (P-Überschuss)</text>
          {/* Alpha region label */}
          <text x="460" y="30" fill="#f59e0b" fontSize="9" fontFamily="monospace" opacity="0.6">α (Z {'>'} 83)</text>
          {/* Stability line label */}
          <text x="130" y="165" fill="#10b981" fontSize="9" fontFamily="monospace" opacity="0.8">Stabilitätslinie</text>

          {/* Isotope markers */}
          {/* C-12: Z=6, N=6 — stable, on the line */}
          <circle cx="100" cy="235" r="5" fill="#10b981" opacity="0.9" />
          <text x="100" y="228" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">C-12</text>

          {/* C-11: Z=6, N=5 — proton-rich, below line */}
          <circle cx="90" cy="230" r="5" fill="#06b6d4" opacity="0.9" />
          <text x="78" y="225" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">C-11</text>

          {/* N-16: Z=7, N=9 — neutron-rich, above line */}
          <circle cx="120" cy="240" r="5" fill="#8b5cf6" opacity="0.9" />
          <text x="132" y="245" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">N-16</text>

          {/* Fe-56: Z=26, N=30 — stable */}
          <circle cx="240" cy="150" r="5" fill="#10b981" opacity="0.9" />
          <text x="240" y="143" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">Fe-56</text>

          {/* U-238: Z=92, N=146 — alpha */}
          <circle cx="530" cy="35" r="5" fill="#f59e0b" opacity="0.9" />
          <text x="515" y="45" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontFamily="monospace">U-238</text>
        </svg>

        <div className="space-y-3 mb-4">
          {ISOTOPES.map(iso => (
            <div
              key={iso.id}
              className="rounded-xl p-3"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 text-center" style={{ minWidth: '60px' }}>
                  <div className="text-lg font-bold text-white">{iso.symbol}</div>
                  <div className="text-xs text-slate-500 font-mono">Z={iso.Z} N={iso.N}</div>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  A = {iso.A} | N/Z = {(iso.N / iso.Z).toFixed(2)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DECAY_OPTIONS.map(opt => {
                  const sel = choices[iso.id] === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setChoices(prev => ({ ...prev, [iso.id]: opt.id }))}
                      className="py-2 rounded-lg hud-font text-xs tracking-wider font-bold transition-all cursor-pointer"
                      style={{
                        background: sel ? `${opt.color}20` : 'rgba(30,41,59,0.4)',
                        border: `1px solid ${sel ? `${opt.color}60` : 'rgba(100,116,139,0.2)'}`,
                        color: sel ? opt.color : '#64748b',
                      }}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleConfirm}
          disabled={!allAnswered}
          className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
          style={{
            background: allAnswered ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
            border: '1px solid rgba(6,182,212,0.3)',
          }}
        >
          KLASSIFIZIERUNG BESTÄTIGEN
        </button>
      </div>
    </div>
  )
}
