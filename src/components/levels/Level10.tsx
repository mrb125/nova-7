import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

// I₁ × r₁² = I₂ × r₂² → I₂ = I₁ × (r₁/r₂)²
// At r=1m: I=3 Sv/h
// At r=3m: I=3×(1/3)²=0.333 Sv/h
// For I<20mSv/h: r=√(3/0.02)≈12.25m
const I0 = 3000 // in mSv/h at 1m
const R0 = 1

const CALC_TASKS = [
  {
    id: 'at3m',
    question: 'Wie groß ist die Intensität bei r = 3 m (in Sv/h), wenn sie bei 1 m 3 Sv/h beträgt?',
    answer: 0.333,
    tolerance: 0.02,
    unit: 'Sv/h',
  },
  {
    id: 'safeDist',
    question: 'Ab welchem Abstand liegt die Intensität unter 20 mSv/h (= 0,02 Sv/h)?',
    answer: 12.25,
    tolerance: 0.6,
    unit: 'm',
  },
]

const KEYWORDS = ['quadratisch', 'kugelwelle', 'fläche', 'abstand', 'intensität', 'punktstrahler', 'verteilt', 'abstandsgesetz']

export default function Level10({ state: _s, onComplete }: LevelProps) {
  const [distance, setDistance] = useState(5)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [calcSubmitted, setCalcSubmitted] = useState(false)
  const [phase, setPhase] = useState<'interactive' | 'calculate' | 'justify' | 'feedback'>('interactive')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  // Live intensity at chosen distance
  const liveIntensity = I0 * Math.pow(R0 / distance, 2)
  const isSafe = liveIntensity < 20

  function checkCalc(id: string, val: string) {
    const task = CALC_TASKS.find(t => t.id === id)!
    const num = parseFloat(val.replace(',', '.'))
    return Math.abs(num - task.answer) <= task.tolerance
  }

  function handleCalcSubmit() {
    setCalcSubmitted(true)
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const correct = CALC_TASKS.filter(t => checkCalc(t.id, inputs[t.id] ?? '')).length
    const safeDistChosen = distance >= 12

    let wp = 0; let dos = 10
    if (correct === 2 && safeDistChosen) { wp = 10; dos = 0 }
    else if (correct >= 1 || safeDistChosen) { wp = 5; dos = 5 }

    setWpResult(wp + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR KAPPA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Reaktorkern umgangen. Abstand berechnet und eingehalten.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Quadratisches Abstandsgesetz"
          text="I = I₀ × (r₀/r)². Bei 3m: 3×(1/3)²= 0,333 Sv/h. Sicherer Abstand: r = √(3/0,02) ≈ 12,25m. Das Gesetz gilt für Punktstrahler: Die Strahlung verteilt sich auf eine immer größer werdende Kugeloberfläche (∝ r²)."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { distance, inputs },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Abstand', 'Berechnungen']} current={phase === 'interactive' ? 0 : 1} />
      <div className="glass-panel p-5">
        {/* Reactor core scene */}
        <svg viewBox="0 0 600 140" className="w-full h-32 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Reactor */}
          <circle cx="100" cy="70" r="45" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2" />
          <circle cx="100" cy="70" r="30" fill="#312e81">
            <animate attributeName="r" values="30;33;30" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="70" r="18" fill="#4c1d95" opacity="0.8">
            <animate attributeName="fill" values="#4c1d95;#6d28d9;#4c1d95" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="100" y="74" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="monospace">⚛</text>

          {/* Radiation rings */}
          {[60, 80, 100, 120].map((r, i) => (
            <circle key={r} cx="100" cy="70" r={r} fill="none" stroke="#7c3aed" strokeWidth="0.5" opacity={0.4 - i * 0.08} strokeDasharray="4,6" />
          ))}

          {/* Character at chosen distance */}
          <circle cx={100 + Math.min(distance * 28, 480)} cy="70" r="8" fill="#374151" />
          <circle cx={100 + Math.min(distance * 28, 480)} cy="58" r="6" fill="#4b5563" />

          {/* Danger zone */}
          <rect x="0" y="120" width="600" height="20" fill="#030712" />
          <text x="300" y="133" textAnchor="middle" fill="#ef4444" fontSize="8" fontFamily="monospace">
            {`INTENSITÄT: ${liveIntensity.toFixed(1)} mSv/h bei ${distance}m — ${isSafe ? '✓ SICHER' : '⚠ GEFÄHRLICH'}`}
          </text>
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor KAPPA.</strong> AURA: „Reaktorkern: 3 Sv/h direkt daran. Berechne deinen sicheren Mindestabstand."
        </p>
      </div>

      <AuraMessage
        message="Quadratisches Abstandsgesetz: I ∝ 1/r². Je weiter du dich entfernst, desto stärker sinkt die Strahlung."
        variant="warning"
      />

      {phase === 'interactive' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">ABSTAND WÄHLEN</h3>
          <div className="mb-2">
            <label className="text-sm text-slate-300 hud-font">
              ABSTAND: <span className={isSafe ? 'text-emerald-400' : 'text-red-400'} style={{ fontWeight: 'bold' }}>{distance} m</span>
            </label>
            <input type="range" min={1} max={20} value={distance} onChange={e => setDistance(+e.target.value)}
              className="w-full mt-2" style={{ accentColor: isSafe ? '#10b981' : '#ef4444' }} />
          </div>
          <div className="rounded-lg p-3 mb-4 text-center"
            style={{
              background: isSafe ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${isSafe ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
            <div className="hud-font text-sm font-bold" style={{ color: isSafe ? '#6ee7b7' : '#fca5a5' }}>
              {liveIntensity.toFixed(1)} mSv/h bei {distance} m
            </div>
            <div className="text-xs mt-1" style={{ color: isSafe ? '#6ee7b7' : '#fca5a5' }}>
              {isSafe ? '✓ Unter 20 mSv/h — sicher' : '⚠ Über 20 mSv/h — gefährlich'}
            </div>
          </div>
          <button onClick={() => setPhase('calculate')}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            WEITER ZU BERECHNUNGEN →
          </button>
        </div>
      )}

      {phase === 'calculate' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="hud-font text-sm text-white">BERECHNUNGEN</h3>
          {CALC_TASKS.map((task, i) => (
            <div key={task.id} className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
              <div className="text-xs hud-font text-cyan-400 mb-1">AUFGABE {i + 1}</div>
              <div className="text-sm text-slate-300 mb-2">{task.question}</div>
              <div className="flex items-center gap-2">
                <input type="text" value={inputs[task.id] ?? ''} onChange={e => setInputs(p => ({ ...p, [task.id]: e.target.value }))}
                  disabled={calcSubmitted}
                  placeholder={`Antwort in ${task.unit}`}
                  className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400" />
                <span className="text-slate-400 text-sm hud-font">{task.unit}</span>
              </div>
            </div>
          ))}
          <button onClick={handleCalcSubmit} disabled={!CALC_TASKS.every(t => inputs[t.id]?.trim())}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            BERECHNUNGEN EINREICHEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre das quadratische Abstandsgesetz in eigenen Worten. Warum gilt es für Punktstrahler?"
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
