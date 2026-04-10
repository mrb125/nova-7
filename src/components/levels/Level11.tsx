import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const ROOMS = [
  {
    id: 'basement',
    name: 'Keller-Sektion',
    icon: '🏗️',
    description: 'Kein Fenster, dicker Beton-Rumpf der Station, tief im Innern',
    correct: true,
    dos: 0,
  },
  {
    id: 'office',
    name: 'Büro-Sektion',
    icon: '🪟',
    description: 'Erdgeschoss-Äquivalent, intakte Panoramafenster zur Erde',
    correct: false,
    dos: 5,
  },
  {
    id: 'top',
    name: 'Aussichts-Deck',
    icon: '🔭',
    description: '6. Etage, keine Scheiben — direkter Kontakt zum Weltraum',
    correct: false,
    dos: 10,
  },
]

const KEYWORDS = ['beton', 'abschirmung', 'gamma', 'beta', 'reichweite', 'fenster', 'keller', 'wanddicke', 'abstand', 'schutzwirkung', 'massiv']

export default function Level11({ state, onComplete }: LevelProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<'choose' | 'justify' | 'feedback'>('choose')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  const isMia = state.characterId === 'mia'

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const room = ROOMS.find(r => r.id === selected)!
    const dos = isMia && room.dos === 0 ? 0 : Math.max(0, room.dos - (isMia ? 2 : 0))
    const mcWP = room.correct ? 10 : 0

    setWpResult(mcWP + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const selectedRoom = ROOMS.find(r => r.id === selected)
  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR LAMBDA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Unterkunft: {selectedRoom?.name}. Warte auf Evakuierungskapsel.
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Sicherer Unterschlupf"
          text="Optimal: Keller-Sektion (dicker Beton, kein Fenster, maximale Abschirmung für α, β und γ). Panoramafenster bieten keinen Strahlungsschutz. Das Aussichts-Deck mit direktem Weltraumkontakt ist am gefährlichsten (kosmische Strahlung + keine Abschirmung)."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { room: selected },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Unterschlupf']} current={0} />
      <div className="glass-panel p-5">
        {/* Station cross-section */}
        <svg viewBox="0 0 600 160" className="w-full h-36 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Space + stars */}
          {[...Array(12)].map((_, i) => (
            <circle key={i} cx={10 + i * 50} cy={10 + (i * 13) % 30} r="1" fill="white" opacity={0.4 + (i % 3) * 0.2} />
          ))}
          {/* Station cross-section */}
          <rect x="100" y="10" width="400" height="140" rx="8" fill="#0c1a2e" stroke="#1e3a8a" strokeWidth="2" />
          {/* Deck lines */}
          <line x1="100" y1="55" x2="500" y2="55" stroke="#1e3a8a" strokeWidth="1" />
          <line x1="100" y1="100" x2="500" y2="100" strokeDasharray="4,4" stroke="#334155" strokeWidth="1" />
          {/* Observation deck windows */}
          {[130, 180, 230, 280].map(x => (
            <rect key={x} x={x} y="15" width="30" height="25" rx="15" fill="#030712" stroke="#06b6d4" strokeWidth="1.5" opacity="0.8" />
          ))}
          {/* Labels */}
          <text x="300" y="42" textAnchor="middle" fill="#06b6d4" fontSize="8">Aussichts-Deck (Fenster)</text>
          <text x="300" y="80" textAnchor="middle" fill="#64748b" fontSize="8">Büro-Sektion (Panorama)</text>
          <text x="300" y="130" textAnchor="middle" fill="#065f46" fontSize="8">Keller-Sektion (Massivbeton)</text>
          {/* Radiation arrows from outside */}
          {[0, 1, 2].map(i => (
            <line key={i} x1={50} y1={25 + i * 15} x2={100} y2={25 + i * 15} stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arr)" opacity="0.6" />
          ))}
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor LAMBDA.</strong> AURA: „Evakuierungskapsel lädt. Wähle deinen Unterschlupf für 8 Stunden."
        </p>
      </div>

      <AuraMessage
        message="Denk an die Abschirmwirkung verschiedener Materialien und die Bedeutung von Wanddicke und Abstand zur Quelle."
        variant="info"
      />

      {phase === 'choose' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">UNTERSCHLUPF WÄHLEN</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {ROOMS.map(room => {
              const isSel = selected === room.id
              return (
                <button key={room.id} onClick={() => setSelected(room.id)}
                  className="p-4 rounded-xl text-center transition-all cursor-pointer"
                  style={{
                    background: isSel ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `2px solid ${isSel ? 'rgba(6,182,212,0.6)' : 'rgba(100,116,139,0.3)'}`,
                  }}>
                  <div className="text-3xl mb-2">{room.icon}</div>
                  <div className="text-white text-sm font-semibold mb-1">{room.name}</div>
                  <div className="text-slate-400 text-xs">{room.description}</div>
                  {isSel && <div className="text-cyan-400 text-xs mt-2">✓ Ausgewählt</div>}
                </button>
              )
            })}
          </div>
          <button onClick={() => setPhase('justify')} disabled={!selected}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: selected ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            AUSWAHL BESTÄTIGEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Begründe ausführlich, warum du dich für diesen Bereich entschieden hast. Gehe auf die physikalischen Eigenschaften der Strahlung und die Abschirmwirkung der Materialien ein."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
