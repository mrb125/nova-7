import { useState } from 'react'
import { motion } from 'framer-motion'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const EQUIPMENT = [
  { id: 'tshirt', name: 'T-Shirt', price: 0, icon: '👕', protection: 'Kein Strahlenschutz', quality: 0 },
  { id: 'suit', name: 'Strahlenschutzanzug', price: 50, icon: '🦺', protection: 'Schützt äußerlich vor α und β', quality: 2 },
  { id: 'fullmask', name: 'Filtermaske (Vollgesicht)', price: 70, icon: '😷', protection: 'Verhindert Inhalation von α/β-Partikeln', quality: 2 },
  { id: 'mask', name: 'Normale Maske', price: 20, icon: '🩺', protection: 'Eingeschränkter Atemschutz', quality: 1 },
  { id: 'jacket', name: 'Winterjacke', price: 20, icon: '🧥', protection: 'Minimaler äußerer Schutz', quality: 0 },
  { id: 'leadapron', name: 'Bleischürze', price: 60, icon: '🛡️', protection: 'Schützt vor γ-Strahlung', quality: 2 },
]

const KEYWORDS = ['inhalieren', 'alpha intern', 'filtermaske', 'abschirmung', 'schutzanzug', 'ionisierend', 'gamma', 'blei', 'beta', 'strahlung']

export default function Level01({ state, onComplete }: LevelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  const [phase, setPhase] = useState<'choose' | 'justify' | 'feedback'>('choose')

  const budget = state.budget
  const totalCost = [...selected].reduce((sum, id) => sum + (EQUIPMENT.find(e => e.id === id)?.price ?? 0), 0)
  const canAfford = totalCost <= budget

  function toggleItem(id: string) {
    if (submitted) return
    const item = EQUIPMENT.find(e => e.id === id)!
    const newSet = new Set(selected)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      const newCost = totalCost + item.price
      if (newCost <= budget) newSet.add(id)
    }
    setSelected(newSet)
  }

  function handleEquipSubmit() {
    setSubmitted(true)
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    // Score equipment choice
    const hasSuit = selected.has('suit')
    const hasFullMask = selected.has('fullmask')
    const hasMask = selected.has('mask')
    const hasLeadApron = selected.has('leadapron')

    let equipWP = 0
    let dos = 10

    if (hasSuit && hasFullMask) { equipWP = 10; dos = 0 }
    else if ((hasSuit || hasLeadApron) && (hasFullMask || hasMask)) { equipWP = 7; dos = 5 }
    else if (hasSuit || hasFullMask || hasLeadApron) { equipWP = 4; dos = 5 }
    else { equipWP = 0; dos = 10 }

    const total = equipWP + score
    setWpResult(total)
    setDosResult(dos)
    setPhase('feedback')
  }

  const equipmentNames = [...selected].map(id => EQUIPMENT.find(e => e.id === id)?.name ?? '')
  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        {/* Story wrap-up */}
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR ALPHA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Du hast dich mit <strong>{equipmentNames.join(', ') || 'nichts'}</strong> ausgerüstet und verlässt den Dispenser-Bereich.
            AURA öffnet die Schleuse zu Sektor BETA.
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Schutzausrüstung"
          text="Optimaler Schutz: Strahlenschutzanzug (α/β extern) + Filtermaske (α/β intern durch Inhalation). Die Bleischürze schützt zusätzlich vor γ-Strahlung. Interne α-Strahlung ist besonders gefährlich: α-Partikel haben nur ~50 µm Reichweite im Gewebe, geben aber ihre gesamte Energie auf diesem kurzen Weg ab (hoher linearer Energietransfer). Daher gilt für α intern der Wichtungsfaktor w_R = 20 (20× schädlicher als β/γ)."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { equipment: [...selected], equipmentNames },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Ausrüstung']} current={0} />
      {/* Scene */}
      <div className="glass-panel p-5 relative overflow-hidden">
        {/* Scene illustration SVG */}
        <svg viewBox="0 0 600 160" className="w-full h-32 mb-4 rounded-lg opacity-70" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Space through porthole */}
          <circle cx="540" cy="80" r="55" fill="none" stroke="#1e3a8a" strokeWidth="8" />
          <circle cx="540" cy="80" r="48" fill="#030712" />
          {/* Stars */}
          {[...Array(15)].map((_, i) => (
            <circle key={i} cx={480 + (i * 17) % 80} cy={40 + (i * 23) % 80} r="1" fill="white" opacity={0.6} />
          ))}
          {/* Earth arc */}
          <ellipse cx="540" cy="140" rx="40" ry="25" fill="#1d4ed8" opacity="0.6" />
          {/* Dispenser kiosk */}
          <rect x="80" y="40" width="80" height="100" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
          <rect x="90" y="55" width="60" height="40" rx="4" fill="#1e3a8a" opacity="0.8" />
          <text x="120" y="80" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="monospace">NOTFALL</text>
          <text x="120" y="91" textAnchor="middle" fill="#06b6d4" fontSize="9" fontFamily="monospace">DISPENSER</text>
          {/* Character */}
          <circle cx="220" cy="90" r="15" fill="#374151" />
          <circle cx="220" cy="72" r="10" fill="#4b5563" />
          {/* Alarm lights */}
          <circle cx="30" cy="30" r="8" fill="#dc2626" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="570" cy="30" r="8" fill="#dc2626" opacity="0.9">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="1s" repeatCount="indefinite" />
          </circle>
          <text x="300" y="25" textAnchor="middle" fill="#ef4444" fontSize="10" fontFamily="monospace">⚠ STRAHLUNGSAUSTRITT ⚠</text>
        </svg>

        <p className="text-slate-300 text-sm leading-relaxed">
          <strong className="text-cyan-400">07:42 Stationszeit.</strong> AURAs Stimme hallt durch den Korridor:
          „Strahlungsaustritt bestätigt. Bitte Schutzausrüstung anfordern."
          Dein Dosimeter-Armband vibriert: <strong className="text-emerald-400">0 mSv</strong> — noch.
        </p>
      </div>

      <AuraMessage
        message="Wähle deine Schutzausrüstung sorgfältig aus. Beachte: Alpha-Strahlung ist bei äußerem Kontakt weniger gefährlich — intern durch Einatmen aber sehr gefährlich. Gamma-Strahlung durchdringt fast alles."
        variant="info"
      />

      {/* Equipment selection */}
      {phase === 'choose' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="hud-font text-sm text-white">NOTFALL-DISPENSER</h3>
            <div className="hud-font text-sm">
              <span className="text-slate-400">Budget: </span>
              <span className={canAfford ? 'text-emerald-400' : 'text-red-400'}>{budget - totalCost} Cr</span>
              <span className="text-slate-500"> / {budget} Cr</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EQUIPMENT.map(item => {
              const isSelected = selected.has(item.id)
              const wouldExceed = !isSelected && totalCost + item.price > budget
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  disabled={wouldExceed}
                  className="p-3 rounded-lg text-left transition-all cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isSelected ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                    opacity: wouldExceed ? 0.4 : 1,
                  }}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-white text-xs font-semibold">{item.name}</div>
                  <div className="text-xs mt-1 font-bold hud-font"
                    style={{ color: item.price === 0 ? '#94a3b8' : '#10b981' }}>
                    {item.price === 0 ? 'GRATIS' : `${item.price} Cr`}
                  </div>
                  {isSelected && <div className="text-cyan-400 text-xs mt-1">✓ Ausgewählt</div>}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleEquipSubmit}
            disabled={selected.size === 0}
            className="mt-4 w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold transition-all disabled:opacity-30 cursor-pointer"
            style={{
              background: selected.size > 0 ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            AUSWAHL BESTÄTIGEN ({totalCost} Cr)
          </button>
        </motion.div>
      )}

      {/* Justification */}
      {phase === 'justify' && (
        <JustificationField
          question="Begründe deine Wahl. Erkläre, welche Strahlung dich bedroht und wie deine Ausrüstung schützt."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
