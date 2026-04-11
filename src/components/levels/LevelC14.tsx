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
    question: 'Wie viele Halbwertszeiten sind vergangen? (A/A₀ = 0,25 = (½)ⁿ → n = ?)',
    answer: 2,
    tolerance: 0,
    unit: '',
  },
  {
    id: 'age',
    question: 'Wie alt ist die Probe? (t = n × T½, mit T½ = 5730 Jahre)',
    answer: 11460,
    tolerance: 50,
    unit: 'Jahre',
  },
  {
    id: 'limit',
    question: 'Bis zu welchem Alter funktioniert die C-14-Methode ungefähr? (ca. 8–10 Halbwertszeiten)',
    answer: 50000,
    tolerance: 8000,
    unit: 'Jahre',
  },
]

const KEYWORDS = ['halbwertszeit', 'kohlenstoff', 'organisch', 'verhältnis', 'zerfall', 'aktivität', 'archäologie', 'datierung', 'exponentiell', 'grenze']

export default function LevelC14({ state: _s, onComplete }: LevelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [phase, setPhase] = useState<'measure' | 'calculate' | 'justify' | 'feedback'>('measure')
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
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR LAMBDA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">{correct}/3 Berechnungen korrekt. Alter der Gewebeprobe bestimmt.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Radiokarbon-Datierung"
          text="A/A₀ = 0,25 = (½)² → n = 2 Halbwertszeiten. Alter: t = 2 × 5730 = 11.460 Jahre. Die C-14-Methode funktioniert bis ca. 50.000 Jahre (≈ 8–10 T½), danach ist zu wenig C-14 für eine zuverlässige Messung vorhanden. Voraussetzung: Die Probe muss organischen Ursprungs sein (Holz, Knochen, Textil, biologisches Gewebe). Anorganische Materialien enthalten kein C-14."
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

  if (phase === 'measure') {
    return (
      <div className="space-y-4">
        <PhaseIndicator steps={['Messung', 'Berechnung']} current={0} />
        <div className="glass-panel p-5">
          <p className="text-slate-300 text-sm">
            <strong className="text-cyan-400">Sektor LAMBDA.</strong> AURA: „Biologische Gewebeprobe aus der Luftschleuse — Sektor C. Probenalter unbekannt. C-14-Scanner bereit — bestimme das Alter."
          </p>
        </div>

        <AuraMessage
          message="C-14 entsteht in der Atmosphäre und wird von Lebewesen aufgenommen. Nach dem Tod zerfällt C-14 (T½ = 5730 Jahre). Das Verhältnis A/A₀ verrät das Alter."
          variant="info"
        />

        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">C-14 SCANNER — MESSERGEBNIS</h3>
          <svg viewBox="0 0 600 200" className="w-full h-40 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
            {/* Scanner frame */}
            <rect x="20" y="15" width="560" height="170" rx="8" fill="#0c1a2e" stroke="#06b6d4" strokeWidth="1.5" />

            {/* Artifact silhouette */}
            <ellipse cx="180" cy="100" rx="80" ry="50" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <text x="180" y="95" textAnchor="middle" fill="#475569" fontSize="10" fontFamily="monospace">GEWEBEPROBE</text>
            <text x="180" y="110" textAnchor="middle" fill="#334155" fontSize="8" fontFamily="monospace">(Luftschleuse)</text>

            {/* Scan lines */}
            {[...Array(5)].map((_, i) => (
              <line key={i} x1="100" y1={55 + i * 22} x2="260" y2={55 + i * 22} stroke="#06b6d4" strokeWidth="0.5" opacity="0.3" />
            ))}

            {/* Result panel */}
            <rect x="320" y="35" width="240" height="130" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1" />
            <text x="440" y="58" textAnchor="middle" fill="#7c3aed" fontSize="10" fontFamily="monospace">SCAN-ERGEBNIS</text>
            <line x1="340" y1="65" x2="540" y2="65" stroke="#7c3aed" strokeWidth="0.5" opacity="0.4" />

            <text x="350" y="85" fill="#64748b" fontSize="9" fontFamily="monospace">Isotop:</text>
            <text x="480" y="85" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">C-14</text>

            <text x="350" y="105" fill="#64748b" fontSize="9" fontFamily="monospace">T½:</text>
            <text x="480" y="105" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">5730 Jahre</text>

            <text x="350" y="125" fill="#64748b" fontSize="9" fontFamily="monospace">Aktivität:</text>
            <text x="480" y="125" textAnchor="middle" fill="#f59e0b" fontSize="11" fontFamily="monospace" fontWeight="bold">25 %</text>

            <text x="350" y="148" fill="#64748b" fontSize="9" fontFamily="monospace">A / A₀ =</text>
            <text x="480" y="148" textAnchor="middle" fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="bold">0,25</text>
          </svg>

          <div className="rounded-lg p-3 mb-4" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <p className="text-sm text-slate-300">
              <span className="text-cyan-400 font-bold">Messung:</span> Die C-14-Aktivität der Probe beträgt <span className="text-amber-400 font-bold">25%</span> des Referenzwertes (A/A₀ = 0,25). Halbwertszeit von C-14: <span className="text-cyan-400 font-bold">T½ = 5730 Jahre</span>.
            </p>
          </div>

          <button
            onClick={() => setPhase('calculate')}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            MESSUNG BESTÄTIGEN → BERECHNEN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Messung', 'Berechnung']} current={1} />
      <div className="glass-panel p-5">
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor LAMBDA.</strong> Messwert: A/A₀ = 0,25 | T½ = 5730 Jahre. Berechne das Alter der Gewebeprobe.
        </p>
      </div>

      <AuraMessage
        message="Berechne Schritt für Schritt. Erst die Anzahl der Halbwertszeiten, dann das Alter, dann die Grenze der Methode."
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
          question="Erkläre, warum die C-14-Methode nur für organische Materialien und nur bis zu einem bestimmten Alter funktioniert."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
