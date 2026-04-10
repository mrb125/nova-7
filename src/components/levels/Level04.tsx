import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const PARTS = [
  { id: 'counter', name: 'Zählrohr', icon: '📡', needed: true },
  { id: 'voltage', name: 'Spannungsquelle', icon: '⚡', needed: true },
  { id: 'amplifier', name: 'Zähler/Verstärker', icon: '🔊', needed: true },
  { id: 'speaker', name: 'Lautsprecher', icon: '🔔', needed: true },
  { id: 'magnet', name: 'Magnet', icon: '🧲', needed: false },
  { id: 'foil', name: 'Alufolie', icon: '🫙', needed: false },
  { id: 'coil', name: 'Spule', icon: '🌀', needed: false },
  { id: 'capacitor', name: 'Kondensator', icon: '⚙️', needed: false },
  { id: 'wrap', name: 'Frischhaltefolie', icon: '🎁', needed: false },
]

const MC_OPTIONS = [
  { id: 'a', text: 'Die Energie der Strahlung', correct: false },
  { id: 'b', text: 'Ionisierungsereignisse im Zählgas', correct: true },
  { id: 'c', text: 'Die Temperatur der Probe', correct: false },
  { id: 'd', text: 'Die Masse des Isotops', correct: false },
]

const KEYWORDS = ['ionisierung', 'zählgas', 'elektronen', 'spannung', 'impuls', 'gasentladung', 'verstärker', 'messung']

export default function Level04({ state: _s, onComplete }: LevelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mcAnswer, setMcAnswer] = useState<string | null>(null)
  const [phase, setPhase] = useState<'build' | 'mc' | 'justify' | 'feedback'>('build')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  function togglePart(id: string) {
    if (phase !== 'build') return
    const s = new Set(selected)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelected(s)
  }

  function handleBuildSubmit() { setPhase('mc') }

  function handleMcSubmit() { setPhase('justify') }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const neededIds = PARTS.filter(p => p.needed).map(p => p.id)
    const correctParts = neededIds.filter(id => selected.has(id)).length
    const falseParts = [...selected].filter(id => !neededIds.includes(id)).length
    const buildScore = Math.max(0, correctParts * 2 - falseParts)

    const mcCorrect = MC_OPTIONS.find(o => o.id === mcAnswer)?.correct ?? false
    const mcScore = mcCorrect ? 4 : 0

    const total = Math.min(10, buildScore + mcScore) + score
    const dos = (correctParts >= 3 && mcCorrect) ? 0 : mcCorrect ? 5 : 10

    setWpResult(total)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR DELTA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Detektor konstruiert. Strahlung messbar. AURA: „Sehr gut. Schleuse zu Sektor EPSILON."</p>
        </div>
        <FeedbackCard
          title="Auswertung: Geiger-Müller-Zählrohr"
          text="Ein Geiger-Müller-Zählrohr benötigt: Zählrohr (mit Zählgas, meist Argon + Löschgas), Spannungsquelle (~400–600 V Hochspannung), Zähler/Verstärker und optional Lautsprecher. Funktionsprinzip: Einfallende Strahlung ionisiert das Zählgas → Hochspannung beschleunigt Elektronen → Stoßionisation löst Lawineneffekt (Gasverstärkung) aus → kurzer Strompuls → vom Zähler registriert. Das Löschgas stoppt die Entladung, damit der nächste Impuls erkannt werden kann."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { parts: [...selected], mcAnswer },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Bauteile', 'Frage']} current={phase === 'build' ? 0 : 1} />

      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 120" className="w-full h-24 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          {/* Workshop elements */}
          <rect x="30" y="40" width="200" height="60" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          <text x="130" y="65" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">BAUTEILE-BOX</text>
          {/* 3D printer */}
          <rect x="380" y="20" width="150" height="80" rx="6" fill="#0f172a" stroke="#7c3aed" strokeWidth="1.5" />
          <rect x="395" y="40" width="120" height="40" rx="3" fill="#1e293b" />
          <text x="455" y="55" textAnchor="middle" fill="#7c3aed" fontSize="8" fontFamily="monospace">3D-DRUCKER</text>
          <line x1="420" y1="68" x2="490" y2="68" stroke="#7c3aed" strokeWidth="1" strokeDasharray="3,3" />
          {/* Floating components */}
          {['📡', '⚡', '🔊', '🧲'].map((emoji, i) => (
            <text key={i} x={60 + i * 50} y={90} fontSize="16" style={{ animation: `float ${1.5 + i * 0.2}s ease-in-out infinite` }}>{emoji}</text>
          ))}
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor DELTA.</strong> AURA: „Alle Strahlungssensoren ausgefallen. Manuelle Konstruktion eines Detektors erforderlich."
          Wähle die richtigen Bauteile.
        </p>
      </div>

      <AuraMessage
        message="Welche Bauteile braucht ein Geiger-Müller-Zählrohr? Wähle alle notwendigen aus."
        variant="info"
      />

      {phase === 'build' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">BAUTEILE AUSWÄHLEN</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PARTS.map(part => {
              const isSel = selected.has(part.id)
              return (
                <button key={part.id} onClick={() => togglePart(part.id)}
                  className="p-3 rounded-lg text-center transition-all cursor-pointer"
                  style={{
                    background: isSel ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isSel ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                  }}>
                  <div className="text-2xl mb-1">{part.icon}</div>
                  <div className="text-xs text-slate-300">{part.name}</div>
                  {isSel && <div className="text-cyan-400 text-xs mt-1">✓</div>}
                </button>
              )
            })}
          </div>
          <button onClick={handleBuildSubmit} disabled={selected.size === 0}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: selected.size > 0 ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            AUSWAHL BESTÄTIGEN
          </button>
        </div>
      )}

      {phase === 'mc' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-4">Was misst ein Geiger-Müller-Zählrohr?</h3>
          <div className="space-y-2 mb-4">
            {MC_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setMcAnswer(opt.id)}
                className="w-full p-3 rounded-lg text-left transition-all cursor-pointer"
                style={{
                  background: mcAnswer === opt.id ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                  border: `1px solid ${mcAnswer === opt.id ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                }}>
                <span className="text-cyan-400 hud-font mr-2">{opt.id.toUpperCase()})</span>
                <span className="text-slate-300 text-sm">{opt.text}</span>
              </button>
            ))}
          </div>
          <button onClick={handleMcSubmit} disabled={!mcAnswer}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer"
            style={{ background: mcAnswer ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            ANTWORT EINREICHEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre Schritt für Schritt, wie das Zählrohr Strahlung in ein messbares Signal umwandelt."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
