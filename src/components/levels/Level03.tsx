import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const EQUIPMENT = [
  { id: 'suit', name: 'Strahlenschutzanzug', price: 50, icon: '🦺', protects: 'α, β extern' },
  { id: 'fullmask', name: 'Filtermaske (Vollgesicht)', price: 70, icon: '😷', protects: 'Inhalation α/β' },
  { id: 'leadapron', name: 'Bleischürze', price: 60, icon: '🛡️', protects: 'γ-Strahlung' },
  { id: 'mask', name: 'Normale Maske', price: 20, icon: '🩺', protects: 'Eingeschränkt' },
  { id: 'jacket', name: 'Winterjacke', price: 20, icon: '🧥', protects: 'Minimal' },
  { id: 'tshirt', name: 'T-Shirt', price: 0, icon: '👕', protects: 'Kein Schutz' },
]

const KEYWORDS = ['intern', 'inhalation', 'direkte nähe', 'alpha intern', 'filtermaske', 'körper', 'gamma', 'blei', 'durchdringend']

export default function Level03({ state, onComplete }: LevelProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'choose' | 'justify' | 'feedback'>('choose')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  const budget = state.budget
  const totalCost = [...selected].reduce((sum, id) => sum + (EQUIPMENT.find(e => e.id === id)?.price ?? 0), 0)

  function toggle(id: string) {
    if (phase !== 'choose') return
    const item = EQUIPMENT.find(e => e.id === id)!
    const newSet = new Set(selected)
    if (newSet.has(id)) { newSet.delete(id) }
    else if (totalCost + item.price <= budget) { newSet.add(id) }
    setSelected(newSet)
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const hasSuit = selected.has('suit')
    const hasFullMask = selected.has('fullmask')
    const hasLeadApron = selected.has('leadapron')
    const hasMask = selected.has('mask')

    let equipWP = 0; let dos = 10
    if (hasSuit && hasFullMask && hasLeadApron) { equipWP = 10; dos = 0 }
    else if ((hasSuit || hasLeadApron) && (hasFullMask || hasMask)) { equipWP = 7; dos = 5 }
    else if (hasSuit || hasFullMask || hasLeadApron) { equipWP = 4; dos = 5 }

    const total = equipWP + score
    setWpResult(total)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR GAMMA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Ausgerüstet für Gamma- und Alpha-Strahlung. Weiter.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Sektor-GAMMA-Schutz"
          text="Sektor GAMMA enthält α- und γ-Strahlung. Optimal: Strahlenschutzanzug + Filtermaske (intern) + Bleischürze (γ). Interne α-Strahlung ist besonders gefährlich — eingeatmete α-Partikel treffen direkt auf Zellen ohne äußere Schutzschicht."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { equipment: [...selected] },
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
      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 120" className="w-full h-24 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          {/* Suits hanging */}
          {[120, 250, 380, 510].map((x, i) => (
            <g key={i} transform={`translate(${x}, 20)`}>
              <line x1="0" y1="0" x2="0" y2="15" stroke="#334155" strokeWidth="2" />
              <circle cx="0" cy="0" r="6" fill="#334155" />
              <rect x="-20" y="15" width="40" height="50" rx="5" fill={i === 0 ? '#1e40af' : i === 1 ? '#065f46' : '#7c3aed20'} stroke="#334155" strokeWidth="1" />
            </g>
          ))}
          <text x="300" y="110" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">MAGNETHALTERUNGEN AKTIV</text>
          <rect x="0" y="0" width="600" height="120" fill="none" stroke="#7c3aed" strokeWidth="1" opacity="0.2" />
        </svg>
        <p className="text-slate-300 text-sm leading-relaxed">
          <strong className="text-cyan-400">Sektor GAMMA.</strong> Dr. Kern über Funk:
          „Achtung — Alpha- und Gamma-Strahlung im nächsten Korridor. Rüste dich auf."
          <br /><span className="text-slate-400 text-xs">Verbleibendes Budget: <strong className="text-emerald-400">{budget} Cr</strong></span>
        </p>
      </div>

      <AuraMessage
        message="Sektor GAMMA enthält gleichzeitig Alpha- und Gamma-Strahlung. Bedenke: gegen welche Strahlung schützt welches Ausrüstungsstück?"
        variant="warning"
      />

      {phase === 'choose' && (
        <div className="glass-panel p-5">
          <div className="flex justify-between mb-4">
            <h3 className="hud-font text-sm text-white">AUSRÜSTUNG WÄHLEN</h3>
            <span className="hud-font text-sm text-emerald-400">{budget - totalCost} Cr verbleibend</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {EQUIPMENT.map(item => {
              const isSel = selected.has(item.id)
              const wouldExceed = !isSel && totalCost + item.price > budget
              return (
                <button key={item.id} onClick={() => toggle(item.id)} disabled={wouldExceed}
                  className="p-3 rounded-lg text-left transition-all cursor-pointer"
                  style={{
                    background: isSel ? 'rgba(124,58,237,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isSel ? 'rgba(124,58,237,0.5)' : 'rgba(100,116,139,0.3)'}`,
                    opacity: wouldExceed ? 0.4 : 1,
                  }}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-white text-xs font-semibold">{item.name}</div>
                  <div className="text-xs mt-1 hud-font text-emerald-400">{item.price === 0 ? 'GRATIS' : `${item.price} Cr`}</div>
                  {isSel && <div className="text-violet-400 text-xs mt-1">✓</div>}
                </button>
              )
            })}
          </div>
          <button onClick={() => setPhase('justify')} disabled={selected.size === 0}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: selected.size > 0 ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : '#1e293b', border: '1px solid rgba(124,58,237,0.3)' }}>
            AUSWAHL BESTÄTIGEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre den Unterschied zwischen dem Schutz vor externer und interner Strahlenbelastung."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
