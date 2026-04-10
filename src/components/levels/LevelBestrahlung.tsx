import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const SCENARIOS = [
  {
    id: 'A',
    icon: '🔬',
    text: 'Ein Techniker arbeitet 1,5 m neben einem eingeschalteten Röntgengerät. Er trägt keine Schutzausrüstung.',
    correct: 'bestrahlung',
  },
  {
    id: 'B',
    icon: '😮‍💨',
    text: 'Beim Ventilationsausfall inhaliert ein Crew-Mitglied radioaktive Staubpartikel aus dem Isotopenlabor.',
    correct: 'kontamination',
  },
  {
    id: 'C',
    icon: '🏗️',
    text: 'Gamma-Strahlung aus dem Reaktorraum durchdringt eine Trennwand und trifft Personal im Nachbarraum.',
    correct: 'bestrahlung',
  },
  {
    id: 'D',
    icon: '🖐️',
    text: 'Nach einem Leck greift jemand ohne Handschuhe in radioaktives Kühlwasser — Rückstände haften an der Haut.',
    correct: 'kontamination',
  },
  {
    id: 'E',
    icon: '💊',
    text: 'Für eine Schilddrüsen-Therapie schluckt ein Patient eine I-131-Kapsel. Das Isotop reichert sich im Gewebe an.',
    correct: 'kontamination',
  },
]

const KEYWORDS = ['kontamination', 'bestrahlung', 'extern', 'intern', 'haut', 'einatmen', 'inhalation', 'dekontamination', 'körper', 'quelle', 'partikel', 'radioaktiv']

type Choice = 'bestrahlung' | 'kontamination'

export default function LevelBestrahlung({ state: _state, onComplete }: LevelProps) {
  const [answers, setAnswers] = useState<Record<string, Choice | null>>(
    Object.fromEntries(SCENARIOS.map(s => [s.id, null]))
  )
  const [phase, setPhase] = useState<'classify' | 'justify' | 'feedback'>('classify')
  const [justText, setJustText] = useState('')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)

  const allAnswered = Object.values(answers).every(v => v !== null)

  function handleConfirm() {
    let correct = 0
    for (const s of SCENARIOS) if (answers[s.id] === s.correct) correct++
    const mcWP = correct * 2
    const dos = correct >= 4 ? 0 : correct >= 2 ? 5 : 10
    setWpResult(mcWP)
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
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR EPSILON — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Dekontaminationsprotokoll aktiviert. Betroffene Crew-Mitglieder werden behandelt.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Bestrahlung vs. Kontamination"
          text="Bestrahlung = externe Strahlenquelle wirkt von außen auf den Körper ein. Kontamination = radioaktives Material befindet sich am oder im Körper (Haut, Inhalation, Ingestion). Intern kontaminierte Personen sind selbst eine Quelle und müssen dekontaminiert werden."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { answers },
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
        question="Erkläre den Unterschied zwischen Bestrahlung und Kontamination. Warum ist interne Kontamination besonders gefährlich?"
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
          <strong className="text-cyan-400">Sektor EPSILON.</strong> AURA: „5 Schadensmeldungen eingegangen. Klassifiziere jeden Vorfall: Wird die Person bestrahlt oder kontaminiert?"
        </p>
      </div>

      <AuraMessage
        message="Bestrahlung = Quelle außerhalb des Körpers. Kontamination = radioaktives Material am oder im Körper (Haut, Lunge, Verdauung)."
        variant="info"
      />

      <div className="glass-panel p-5">
        <h3 className="hud-font text-sm text-white mb-3">SCHADENSMELDUNGEN KLASSIFIZIEREN</h3>
        <div className="space-y-3 mb-4">
          {SCENARIOS.map(s => (
            <div
              key={s.id}
              className="rounded-xl p-3"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl flex-shrink-0">{s.icon}</span>
                <p className="text-slate-300 text-sm leading-relaxed">{s.text}</p>
              </div>
              <div className="flex gap-2">
                {(['bestrahlung', 'kontamination'] as const).map(opt => {
                  const sel = answers[s.id] === opt
                  const color = opt === 'bestrahlung' ? '#06b6d4' : '#f97316'
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers(prev => ({ ...prev, [s.id]: opt }))}
                      className="flex-1 py-2 rounded-lg hud-font text-xs tracking-wider font-bold transition-all cursor-pointer"
                      style={{
                        background: sel ? `${color}20` : 'rgba(30,41,59,0.4)',
                        border: `1px solid ${sel ? `${color}60` : 'rgba(100,116,139,0.2)'}`,
                        color: sel ? color : '#64748b',
                      }}
                    >
                      {opt === 'bestrahlung' ? '☢ BESTRAHLUNG' : '⚠ KONTAMINATION'}
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
