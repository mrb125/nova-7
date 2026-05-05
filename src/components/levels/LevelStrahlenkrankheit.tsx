import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const CREW = [
  { id: 'A', name: 'Techniker Vasquez', icon: '👷',    dose: 0.3, unit: 'Sv', correct: 'beobachtung' },
  { id: 'B', name: 'Pilotin Chen',      icon: '👩‍✈️', dose: 1.4, unit: 'Sv', correct: 'arzt'        },
  { id: 'C', name: 'Ingenieur Patel',   icon: '👨‍🔧', dose: 4.0, unit: 'Sv', correct: 'intensiv'    },
  { id: 'D', name: 'Dr. Torres',        icon: '👩‍⚕️', dose: 7.5, unit: 'Sv', correct: 'palliativ'   },
]

const MEASURES = [
  { id: 'beobachtung', label: 'Beobachtung',       color: '#10b981', hint: '< 0,5 Sv — keine akuten Symptome erwartet'                   },
  { id: 'arzt',        label: 'Arztbehandlung',    color: '#f59e0b', hint: '0,5–2 Sv — leichte Strahlenkrankheit, Übelkeit möglich'       },
  { id: 'intensiv',    label: 'Intensivstation',   color: '#f97316', hint: '2–6 Sv — schwere Strahlenkrankheit, Knochenmarkschaden'       },
  { id: 'palliativ',   label: 'Palliativversorg.', color: '#ef4444', hint: '> 6 Sv — letale Dosis, keine kurative Behandlung möglich'     },
]

const KEYWORDS = ['strahlenkrankheit', 'schwellenwert', 'knochenmark', 'symptome', 'letal', 'akut', 'sievert', 'dosis', 'grenzwert', 'zellen', 'leukozyt', 'übelkeit']

function doseColor(sv: number) {
  return sv >= 6 ? '#ef4444' : sv >= 2 ? '#f97316' : sv >= 0.5 ? '#f59e0b' : '#10b981'
}

export default function LevelStrahlenkrankheit({ state, onComplete }: LevelProps) {
  const isMia = state.characterId === 'mia'
  const [choices, setChoices] = useState<Record<string, string>>(
    Object.fromEntries(CREW.map(c => [c.id, '']))
  )
  const [phase, setPhase] = useState<'triage' | 'justify' | 'feedback'>('triage')
  const [justText, setJustText] = useState('')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)

  const allAnswered = Object.values(choices).every(v => v !== '')

  function handleConfirm() {
    let correct = 0
    for (const c of CREW) if (choices[c.id] === c.correct) correct++
    const mcWP = correct === 4 ? 10 : correct === 3 ? 7 : correct === 2 ? 4 : correct === 1 ? 2 : 0
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
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR NU — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Triageprotokoll abgeschlossen. Medizinische Maßnahmen eingeleitet.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Strahlenkrankheit"
          text="Schwellenwerte: < 0,5 Sv → keine akuten Symptome; 1–2 Sv → leichte Strahlenkrankheit (Übelkeit, Blutbildveränderungen); 2–6 Sv → schwere Strahlenkrankheit (Knochenmarkschaden, ohne Behandlung lebensbedrohlich); > 6 Sv → letale Dosis (LD50/30 ≈ 3,5 Sv ohne Behandlung)."
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
        question="Erkläre, warum ab einer Dosis von etwa 2 Sv das Knochenmark besonders kritisch betroffen ist und was das für den menschlichen Körper bedeutet."
        keywords={KEYWORDS}
        onSubmit={handleJustification}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Triage']} current={0} />
      <div className="glass-panel p-5">
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor NU.</strong> AURA: „4 Crew-Mitglieder mit kritischen Dosimeterwerten. Weise jedem die richtige medizinische Maßnahme zu."
        </p>
      </div>

      {isMia && (
        <AuraMessage
          message="MIA-VORTEIL: Dosisgrenzwerte und erwartete Symptome sind für dich sichtbar."
          variant="success"
        />
      )}

      {isMia && (
        <div className="glass-panel p-4">
          <div className="text-[10px] hud-font text-slate-500 mb-2">DOSISGRENZWERTE (nur für Mia sichtbar)</div>
          <div className="grid grid-cols-2 gap-2">
            {MEASURES.map(m => (
              <div
                key={m.id}
                className="rounded-lg p-2"
                style={{ background: `${m.color}08`, border: `1px solid ${m.color}25` }}
              >
                <div className="text-xs font-bold" style={{ color: m.color }}>{m.label}</div>
                <div className="text-[10px] text-slate-500">{m.hint}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel p-5">
        <h3 className="hud-font text-sm text-white mb-3">TRIAGE — MASSNAHME ZUWEISEN</h3>
        <div className="space-y-3 mb-4">
          {CREW.map(c => {
            const sel = choices[c.id]
            const selM = MEASURES.find(m => m.id === sel)
            return (
              <div
                key={c.id}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(15,23,42,0.6)',
                  border: `1px solid ${sel ? (selM?.color ?? '#64748b') + '40' : 'rgba(100,116,139,0.2)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-white text-sm font-semibold">{c.name}</span>
                  <span className="ml-auto hud-font font-bold text-sm" style={{ color: doseColor(c.dose) }}>
                    {c.dose} Sv
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {MEASURES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setChoices(prev => ({ ...prev, [c.id]: m.id }))}
                      className="py-1.5 rounded-lg hud-font text-xs tracking-wide transition-all cursor-pointer"
                      style={{
                        background: sel === m.id ? `${m.color}20` : 'rgba(30,41,59,0.4)',
                        border: `1px solid ${sel === m.id ? `${m.color}60` : 'rgba(100,116,139,0.15)'}`,
                        color: sel === m.id ? m.color : '#64748b',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
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
          TRIAGE ABSCHLIESSEN
        </button>
      </div>
    </div>
  )
}
