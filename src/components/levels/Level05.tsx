import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const OPTIONS = ['Alpha-Strahlung', 'Beta-Strahlung', 'Gamma-Strahlung']
const CORRECT = { a: 0, b: 1 } // indices into OPTIONS

const KEYWORDS = ['lorentzkraft', 'ladung', 'masse', 'radius', 'magnetisch', 'ablenkung', 'leicht', 'schwer', 'heliumkern', 'elektron']

export default function Level05({ state: _s, onComplete }: LevelProps) {
  const [answers, setAnswers] = useState<{ a: number | null; b: number | null }>({ a: null, b: null })
  const [phase, setPhase] = useState<'identify' | 'justify' | 'feedback'>('identify')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const aCorrect = answers.a === CORRECT.a
    const bCorrect = answers.b === CORRECT.b
    const both = aCorrect && bCorrect

    let equipWP = 0; let dos = 10
    if (both) { equipWP = 10; dos = 0 }
    else if (aCorrect || bCorrect) { equipWP = 5; dos = 5 }

    setWpResult(equipWP + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR EPSILON — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Strahlungsarten identifiziert. AURA: „Sicherheitstür entriegelt."</p>
        </div>
        <FeedbackCard
          title="Auswertung: Nebelkammer-Analyse"
          text="Bild A: Gerade, kurze, dicke Spuren = Alpha-Strahlung (schwerer Heliumkern, hoher Energieverlust pro Strecke → kurze Reichweite, dicke Ionisationsspur). Bild B: Stark gebogene, feine Spuren im Magnetfeld = Beta-Strahlung (leichtes Elektron → großer Krümmungsradius durch Lorentzkraft F = q·v·B, Radius r = m·v/(q·B): kleine Masse → kleiner Radius → starke Krümmung). Gamma-Strahlung hat keine Ladung/Masse → keine Ablenkung im Magnetfeld, keine sichtbare Spur."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { chamberA: answers.a, chamberB: answers.b },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Identifizieren']} current={0} />

      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 180" className="w-full h-40 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Chamber A - alpha tracks */}
          <rect x="30" y="20" width="240" height="140" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
          <text x="150" y="15" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace">KAMMER A</text>
          {/* Alpha tracks - straight thick */}
          {[40, 60, 80, 100].map((y, i) => (
            <line key={i} x1="60" y1={y + 30} x2={160 + i * 10} y2={y + 30} stroke="#f59e0b" strokeWidth={3 - i * 0.3} opacity="0.8" />
          ))}
          {/* Paper layers */}
          <rect x="170" y="25" width="4" height="130" fill="#94a3b8" opacity="0.6" />
          <text x="155" y="170" textAnchor="middle" fill="#475569" fontSize="8">Papier</text>
          <rect x="220" y="25" width="4" height="130" fill="#94a3b8" opacity="0.4" />

          {/* Chamber B - beta tracks in B field */}
          <rect x="330" y="20" width="240" height="140" rx="8" fill="#0f172a" stroke="#8b5cf6" strokeWidth="1.5" />
          <text x="450" y="15" textAnchor="middle" fill="#8b5cf6" fontSize="10" fontFamily="monospace">KAMMER B</text>
          {/* B-field dots */}
          {[0, 1, 2, 3, 4].map(i => [0, 1, 2, 3].map(j => (
            <text key={`${i}${j}`} x={350 + i * 45} y={45 + j * 35} fill="#334155" fontSize="12" textAnchor="middle">⊗</text>
          )))}
          {/* Beta tracks - curved */}
          <path d="M 360 90 Q 400 60 430 90 Q 460 120 490 90" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.9" />
          <path d="M 360 110 Q 395 80 425 110 Q 455 140 485 110" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
          {/* Lead block */}
          <rect x="495" y="40" width="25" height="110" fill="#374151" stroke="#475569" strokeWidth="1" />
          <text x="507" y="100" textAnchor="middle" fill="#64748b" fontSize="7" fontFamily="monospace">Pb</text>
          <text x="450" y="170" textAnchor="middle" fill="#475569" fontSize="8">B ⊗ = Magnetfeld ins Bild</text>

          {/* Holographic overlay */}
          <rect x="0" y="0" width="600" height="180" fill="url(#scan)" opacity="0.1" />
        </svg>

        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor EPSILON.</strong> AURA projiziert zwei 3D-Nebelkammer-Aufnahmen.
          „Identifiziere die Strahlungsart — die Sicherheitstür öffnet sich nur bei korrekter Antwort."
        </p>
      </div>

      <AuraMessage
        message="Beachte: Kurve = Magnetfeld vorhanden. Radius der Kurve hängt von Masse und Ladung des Teilchens ab."
        variant="info"
      />

      {phase === 'identify' && (
        <div className="glass-panel p-5 space-y-4">
          <div>
            <h4 className="hud-font text-sm text-white mb-2">KAMMER A: Welche Strahlungsart?</h4>
            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(a => ({ ...a, a: i }))}
                  className="p-3 rounded-lg text-sm text-center transition-all cursor-pointer"
                  style={{
                    background: answers.a === i ? 'rgba(245,158,11,0.2)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${answers.a === i ? 'rgba(245,158,11,0.5)' : 'rgba(100,116,139,0.3)'}`,
                    color: answers.a === i ? '#fcd34d' : '#94a3b8',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="hud-font text-sm text-white mb-2">KAMMER B: Welche Strahlungsart?</h4>
            <div className="grid grid-cols-3 gap-2">
              {OPTIONS.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(a => ({ ...a, b: i }))}
                  className="p-3 rounded-lg text-sm text-center transition-all cursor-pointer"
                  style={{
                    background: answers.b === i ? 'rgba(139,92,246,0.2)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${answers.b === i ? 'rgba(139,92,246,0.5)' : 'rgba(100,116,139,0.3)'}`,
                    color: answers.b === i ? '#c4b5fd' : '#94a3b8',
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setPhase('justify')}
            disabled={answers.a === null || answers.b === null}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: (answers.a !== null && answers.b !== null) ? 'linear-gradient(135deg, #0891b2, #8b5cf6)' : '#1e293b', border: '1px solid rgba(139,92,246,0.3)' }}>
            ANTWORTEN EINREICHEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre anhand von Ladung, Masse und Lorentzkraft, warum die Spuren in Kammer A und B so unterschiedlich aussehen."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
