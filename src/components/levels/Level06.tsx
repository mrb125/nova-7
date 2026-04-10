import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const DECAY_CHAIN = [
  { symbol: 'Fr-221', Z: 87, A: 221, N: 134, decayType: 'α' as const, color: '#f59e0b' },
  { symbol: 'At-217', Z: 85, A: 217, N: 132, decayType: 'α' as const, color: '#f59e0b' },
  { symbol: 'Bi-213', Z: 83, A: 213, N: 130, decayType: 'β' as const, color: '#8b5cf6' },
  { symbol: 'Po-213', Z: 84, A: 213, N: 129, decayType: 'α' as const, color: '#f59e0b' },
  { symbol: 'Pb-209', Z: 82, A: 209, N: 127, decayType: 'β' as const, color: '#8b5cf6' },
  { symbol: 'Bi-209', Z: 83, A: 209, N: 126, decayType: null, color: '#10b981' },
]

const KEYWORDS = ['ordnungszahl', 'massenzahl', '-2', '-4', 'heliumkern', 'mutterkern', 'tochterkern', 'alpha', 'beta', 'zerfall']

const PADleft = 50, PADtop = 30
const cellW = 61, cellH = 40
const Nmin = 126, Zmax = 87

function nx(N: number) { return PADleft + (N - Nmin) * cellW }
function nz(Z: number) { return PADtop + (Zmax - Z) * cellH }

export default function Level06({ state: _state, onComplete }: LevelProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedDecay, setSelectedDecay] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [phase, setPhase] = useState<'navigate' | 'confirm' | 'justify' | 'feedback'>('navigate')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  const currentIsotope = DECAY_CHAIN[currentStep]

  function handleDecaySelection() {
    if (!selectedDecay || !currentIsotope.decayType) return
    const correct = selectedDecay === currentIsotope.decayType
    const newCompleted = [...completedSteps, correct]
    setCompletedSteps(newCompleted)
    setSelectedDecay(null)

    if (currentStep + 1 >= DECAY_CHAIN.length - 1) {
      const correctCount = newCompleted.filter(Boolean).length
      setWpResult(correctCount * 3)
      setDosResult(correctCount >= 4 ? 0 : correctCount >= 2 ? 5 : 10)
      setPhase('confirm')
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)
    setWpResult(prev => prev + score)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'
  const phaseIndex = phase === 'navigate' ? 0 : phase === 'confirm' ? 1 : 2

  function NuklidkarteSVG({ showAll = false }: { showAll?: boolean }) {
    const visibleCount = showAll ? DECAY_CHAIN.length : currentStep + 1
    const visible = DECAY_CHAIN.slice(0, visibleCount)
    const Zvalues = [82, 83, 84, 85, 86, 87]
    const Nvalues = [126, 127, 128, 129, 130, 131, 132, 133, 134]

    return (
      <svg viewBox="0 0 560 260" className="w-full rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)', maxHeight: '260px' }}>
        <defs>
          <marker id="arr-alpha" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
          </marker>
          <marker id="arr-beta" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#8b5cf6" />
          </marker>
        </defs>

        {/* Grid */}
        {Zvalues.map(Z => (
          <g key={Z}>
            <line x1={PADleft - 5} y1={nz(Z)} x2={PADleft + 8 * cellW + 10} y2={nz(Z)} stroke="#1e293b" strokeWidth="1" />
            <text x={PADleft - 8} y={nz(Z) + 4} textAnchor="end" fill="#475569" fontSize="9" fontFamily="monospace">Z={Z}</text>
          </g>
        ))}
        {Nvalues.map(N => (
          <g key={N}>
            <line x1={nx(N)} y1={PADtop - 5} x2={nx(N)} y2={PADtop + 5 * cellH + 10} stroke="#1e293b" strokeWidth="1" />
            <text x={nx(N)} y={PADtop + 5 * cellH + 22} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">N={N}</text>
          </g>
        ))}
        <text x={PADleft + 4 * cellW} y={PADtop + 5 * cellH + 38} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">NEUTRONENZAHL (N) →</text>
        <text x={12} y={PADtop + 2.5 * cellH} textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace" transform={`rotate(-90,12,${PADtop + 2.5 * cellH})`}>PROTONENZAHL (Z) ↑</text>

        {/* Arrows between discovered isotopes */}
        {visible.slice(0, -1).map((iso, i) => {
          const next = DECAY_CHAIN[i + 1]
          const x1 = nx(iso.N), y1 = nz(iso.Z)
          const x2 = nx(next.N), y2 = nz(next.Z)
          const dx = x2 - x1, dy = y2 - y1
          const len = Math.sqrt(dx * dx + dy * dy)
          const r = 18
          const sx = x1 + (dx / len) * r
          const sy = y1 + (dy / len) * r
          const ex = x2 - (dx / len) * (r + 2)
          const ey = y2 - (dy / len) * (r + 2)
          const isAlpha = iso.decayType === 'α'
          return (
            <line key={i} x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={isAlpha ? '#f59e0b' : '#8b5cf6'}
              strokeWidth="2"
              markerEnd={isAlpha ? 'url(#arr-alpha)' : 'url(#arr-beta)'}
              opacity="0.9"
            />
          )
        })}

        {/* Isotope circles */}
        {visible.map((iso, i) => {
          const x = nx(iso.N), y = nz(iso.Z)
          const isCurrent = i === currentStep && !showAll
          return (
            <g key={iso.symbol}>
              {isCurrent && (
                <circle cx={x} cy={y} r="24" fill="none" stroke={iso.color} strokeWidth="1.5" opacity="0.3">
                  <animate attributeName="r" values="22;28;22" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r="18"
                fill={`${iso.color}20`}
                stroke={iso.color}
                strokeWidth={isCurrent ? 2.5 : 1.5}
              />
              <text x={x} y={y - 3} textAnchor="middle" fill={iso.color} fontSize="8" fontFamily="monospace" fontWeight="bold">
                {iso.symbol.split('-')[0]}
              </text>
              <text x={x} y={y + 8} textAnchor="middle" fill={`${iso.color}cc`} fontSize="7" fontFamily="monospace">
                {iso.A}
              </text>
              {iso.decayType === null && (
                <text x={x} y={y + 20} textAnchor="middle" fill="#10b981" fontSize="7" fontFamily="monospace">stabil</text>
              )}
            </g>
          )
        })}

        {/* Decay type legend */}
        <line x1="460" y1="15" x2="490" y2="15" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arr-alpha)" />
        <text x="495" y="19" fill="#f59e0b" fontSize="8">α</text>
        <line x1="460" y1="28" x2="490" y2="28" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arr-beta)" />
        <text x="495" y="32" fill="#8b5cf6" fontSize="8">β</text>
      </svg>
    )
  }

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR ZETA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Zerfallsreihe Fr-221 → Bi-209 kartiert. Stabile Endprodukte identifiziert.
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Fr-221 Zerfallsreihe"
          text="Fr-221 →(α)→ At-217 →(α)→ Bi-213 →(β⁻)→ Po-213 →(α)→ Pb-209 →(β⁻)→ Bi-209 (stabil). Alpha-Zerfall: −4 Massenzahl, −2 Ordnungszahl. Beta⁻-Zerfall: +1 Ordnungszahl, Massenzahl bleibt."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { completedSteps, correctCount: completedSteps.filter(Boolean).length },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  if (phase === 'confirm') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <PhaseIndicator steps={['Zerfallsreihe', 'Bestätigen']} current={1} />
          <h3 className="hud-font text-emerald-400 text-sm mt-2 mb-3">ZERFALLSREIHE VOLLSTÄNDIG KARTIERT</h3>
          <NuklidkarteSVG showAll />
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {completedSteps.filter(Boolean).length}/{completedSteps.length} Schritte korrekt
            </div>
            <div className="text-xs text-emerald-400 font-bold hud-font">
              Bi-209 ✓ STABIL (stabiles Endprodukt)
            </div>
          </div>
          <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-xs text-emerald-300 leading-relaxed">
              <strong>Fr-221</strong> →α→ <strong>At-217</strong> →α→ <strong>Bi-213</strong> →β⁻→ <strong>Po-213</strong> →α→ <strong>Pb-209</strong> →β⁻→ <strong className="text-emerald-400">Bi-209</strong> (stabil)
            </div>
          </div>
        </div>
        <button onClick={() => handleJustification('', 0)}
          className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          WEITER ZUM ERGEBNIS →
        </button>
      </div>
    )
  }

  if (phase === 'justify') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <PhaseIndicator steps={['Zerfallsreihe', 'Bestätigen']} current={1} />
        </div>
        <JustificationField
          question="Was passiert beim Alpha-Zerfall mit Ordnungszahl und Massenzahl? Gib die allgemeine Zerfallsgleichung an."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <PhaseIndicator steps={['Zerfallsreihe', 'Bestätigen']} current={phaseIndex} />
        <div className="mt-3">
          <NuklidkarteSVG />
        </div>
        <p className="text-slate-300 text-sm mt-3">
          <strong className="text-cyan-400">Sektor ZETA.</strong> AURA: „Isotop-7-Omega basiert auf Fr-221.
          Verfolge die Zerfallsreihe bis zum stabilen Endprodukt."
          <br /><span className="text-xs text-slate-400">Schritt {currentStep + 1} von {DECAY_CHAIN.length - 1}</span>
        </p>
      </div>

      <AuraMessage
        message="Welcher Zerfallstyp führt von diesem Isotop zum nächsten? Regel: α entfernt 2 Protonen und 2 Neutronen. β⁻ erhöht die Protonenzahl um 1 (ein Neutron wird zum Proton)."
        variant="info"
      />

      {currentIsotope.decayType && (
        <div className="glass-panel p-5">
          <div className="mb-4">
            <div className="text-slate-400 text-xs hud-font mb-1">AKTUELLES ISOTOP</div>
            <div className="text-2xl font-black hud-font" style={{ color: currentIsotope.color }}>{currentIsotope.symbol}</div>
            <div className="text-xs text-slate-400">Z = {currentIsotope.Z}, A = {currentIsotope.A}, N = {currentIsotope.N}</div>
          </div>

          <h4 className="hud-font text-sm text-white mb-3">
            Welche Zerfallsart führt zum nächsten Isotop?
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['α', 'β'] as const).map(type => (
              <button key={type} onClick={() => setSelectedDecay(type)}
                className="p-4 rounded-xl text-center transition-all cursor-pointer"
                style={{
                  background: selectedDecay === type
                    ? (type === 'α' ? 'rgba(245,158,11,0.2)' : 'rgba(139,92,246,0.2)')
                    : 'rgba(15,23,42,0.6)',
                  border: `2px solid ${selectedDecay === type ? (type === 'α' ? '#f59e0b' : '#8b5cf6') : 'rgba(100,116,139,0.3)'}`,
                }}>
                <div className="text-3xl font-black mb-1" style={{ color: type === 'α' ? '#f59e0b' : '#8b5cf6' }}>{type}</div>
                <div className="text-xs text-slate-400">
                  {type === 'α' ? 'Heliumkern (−4A, −2Z)' : 'Elektron (+1Z, A bleibt)'}
                </div>
              </button>
            ))}
          </div>

          <button onClick={handleDecaySelection} disabled={!selectedDecay}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: selectedDecay ? 'linear-gradient(135deg, #d97706, #8b5cf6)' : '#1e293b', border: '1px solid rgba(245,158,11,0.3)' }}>
            ZERFALLSSCHRITT BESTÄTIGEN
          </button>
        </div>
      )}
    </div>
  )
}
