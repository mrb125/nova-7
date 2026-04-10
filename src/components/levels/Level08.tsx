import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

interface InputTask {
  id: string
  question: string
  answer: number
  tolerance: number
  unit: string
}

const TASKS: InputTask[] = [
  {
    id: 'halfLives',
    question: 'Wie viele Halbwertszeiten passen in 40 Tage? (T½ = 8 Tage)',
    answer: 5,
    tolerance: 0,
    unit: '',
  },
  {
    id: 'percent',
    question: 'Wie viel Prozent sind nach 5 Halbwertszeiten noch vorhanden?',
    answer: 3.125,
    tolerance: 0.1,
    unit: '%',
  },
  {
    id: 'grams',
    question: 'Wie viel Gramm Iod-131 sind nach 40 Tagen noch vorhanden? (Ausgangsmenge: 400 g)',
    answer: 12.5,
    tolerance: 0.1,
    unit: 'g',
  },
]

const KEYWORDS = ['instabil', 'zerfallen', 'tochterkern', 'strahlung', 'exponentiell', 'wahrscheinlichkeit', 'nie null', 'halbwertszeit']

export default function Level08({ state: _s, onComplete }: LevelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState<'calculate' | 'justify' | 'feedback'>('calculate')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  function checkAnswer(task: InputTask, val: string) {
    const num = parseFloat(val.replace(',', '.'))
    return Math.abs(num - task.answer) <= task.tolerance
  }

  function handleSubmit() {
    setSubmitted(true)
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const correct = TASKS.filter(t => checkAnswer(t, inputs[t.id] ?? '')).length
    let wp = correct * 3; let dos = 10
    if (correct === 3) dos = 0
    else if (correct === 2) dos = 5

    setWpResult(wp + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'
  const allFilled = TASKS.every(t => (inputs[t.id] ?? '').trim().length > 0)

  if (phase === 'feedback') {
    const correct = TASKS.filter(t => checkAnswer(t, inputs[t.id] ?? '')).length
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR THETA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">{correct}/3 Berechnungen korrekt. Safe-Code akzeptiert.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Zerfallsgesetz"
          text="n = 40/8 = 5 Halbwertszeiten. Verbleibend: (½)^5 = 1/32 = 3,125%. Gramm: 400 × 0,03125 = 12,5 g. Die Formel lautet: N(t) = N₀ × (½)^(t/T½). Der Zerfall hört nie vollständig auf — immer weniger Atome, aber nie exakt null."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { inputs, correct },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Berechnungen']} current={0} />
      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 100" className="w-full h-20 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          <rect x="30" y="15" width="540" height="70" rx="6" fill="#0c1a2e" stroke="#7c3aed" strokeWidth="1.5" />
          <text x="300" y="42" textAnchor="middle" fill="#7c3aed" fontSize="11" fontFamily="monospace">QUANTUM-SERVER — VERSCHLÜSSELT</text>
          <text x="300" y="58" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">Safe-Code = Ergebnis von Dr. Kerns letzter Aufgabe</text>
          {[...Array(8)].map((_, i) => (
            <text key={i} x={80 + i * 60} y="76" fill="#1e3a8a" fontSize="8" fontFamily="monospace">{Math.floor(Math.random() * 9)}{Math.floor(Math.random() * 9)}{Math.floor(Math.random() * 9)}</text>
          ))}
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor THETA.</strong> AURA: „Safe-Code = Berechnungsergebnis für Iod-131 (T½ = 8 Tage, 400 g Ausgangsmenge nach 40 Tagen)."
        </p>
      </div>

      <AuraMessage
        message="Berechne Schritt für Schritt. Erst die Anzahl der Halbwertszeiten, dann den Prozentsatz, dann die Masse."
        variant="info"
      />

      {phase === 'calculate' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="hud-font text-sm text-white">BERECHNUNGEN</h3>
          {TASKS.map((task, i) => {
            const val = inputs[task.id] ?? ''
            const isChecked = submitted || val.length > 0
            const correct = isChecked && checkAnswer(task, val)
            return (
              <div key={task.id} className="rounded-lg p-4"
                style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${submitted ? (correct ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)') : 'rgba(100,116,139,0.3)'}` }}>
                <div className="text-xs hud-font text-cyan-400 mb-1">AUFGABE {i + 1}</div>
                <div className="text-sm text-slate-300 mb-3">{task.question}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={val}
                    onChange={e => setInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                    disabled={submitted}
                    placeholder={`Antwort in ${task.unit || 'Zahl'}`}
                    className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-60"
                  />
                  {task.unit && <span className="text-slate-400 text-sm hud-font">{task.unit}</span>}
                </div>
              </div>
            )
          })}
          <button onClick={handleSubmit} disabled={!allFilled}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: allFilled ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            BERECHNUNGEN EINREICHEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre, was mit den radioaktiven Atomen bei jedem Zerfall passiert und warum der Zerfall nie vollständig aufhört."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
