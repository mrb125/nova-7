import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const FOODS = [
  { id: 'paranuts', name: 'Paranüsse', icon: '🥜', radioactivity: 'sehr hoch', bqkg: '~1000 Bq/kg', danger: true },
  { id: 'synth_protein', name: 'Synth-Protein', icon: '🧪', radioactivity: 'hoch', bqkg: '~580 Bq/kg*', danger: true },
  { id: 'mushrooms', name: 'Pilze', icon: '🍄', radioactivity: 'mittel', bqkg: '~200 Bq/kg', danger: false },
  { id: 'fish', name: 'Fisch', icon: '🐟', radioactivity: 'mittel', bqkg: '~60 Bq/kg', danger: false },
  { id: 'bananas', name: 'Bananen', icon: '🍌', radioactivity: 'gering', bqkg: '~130 Bq/kg', danger: false },
  { id: 'milk', name: 'Milch', icon: '🥛', radioactivity: 'gering', bqkg: '~40 Bq/kg', danger: false },
  { id: 'apples', name: 'Äpfel', icon: '🍎', radioactivity: 'sehr gering', bqkg: '~20 Bq/kg', danger: false },
  { id: 'honey', name: 'Honig', icon: '🍯', radioactivity: 'sehr gering', bqkg: '~15 Bq/kg', danger: false },
]

const MC_AVOID = ['paranuts', 'synth_protein']
const KEYWORDS = ['intern', 'direkte nähe', 'alpha intern', 'ungehindert', 'gewebe', 'kein abstand', 'schutzkleidung', 'inhalation', 'kontamination']

export default function Level09({ state, onComplete }: LevelProps) {
  const [avoid, setAvoid] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<'choose' | 'justify' | 'feedback'>('choose')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  const isMia = state.characterId === 'mia'

  function toggle(id: string) {
    const s = new Set(avoid)
    if (s.has(id)) s.delete(id)
    else if (s.size < 2) s.add(id)
    setAvoid(s)
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const bothCorrect = MC_AVOID.every(id => avoid.has(id))
    const oneCorrect = MC_AVOID.some(id => avoid.has(id))

    let wp = 0; let dos = 10
    if (bothCorrect) { wp = 10; dos = isMia ? 0 : 0 }
    else if (oneCorrect) { wp = 5; dos = isMia ? 3 : 5 }
    else { wp = 0; dos = isMia ? 8 : 10 }

    setWpResult(wp + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR IOTA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Mahlzeit gesichert. Weiter zu Sektor KAPPA.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Radioaktive Lebensmittel"
          text="Paranüsse haben den höchsten natürlichen Radiumgehalt (Ra-226, ein Alpha-Strahler, ~1000 Bq/kg). Synth-Protein kann durch Cs-137 aus dem Hydroponik-Kühlkreislauf kontaminiert sein (Reaktorleck 2149). Intern aufgenommene Alpha-Strahlung ist besonders gefährlich, da keine Körperschicht sie abschirmt."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { avoid: [...avoid] },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <PhaseIndicator steps={['Auswahl']} current={0} />
        <svg viewBox="0 0 600 100" className="w-full h-20 mb-4 mt-3 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          {[0, 1, 2, 3].map(i => (
            <g key={i}>
              <rect x={40 + i * 140} y="20" width="100" height="55" rx="30" fill="none" stroke="#065f46" strokeWidth="1.5" opacity="0.6" />
              <rect x={50 + i * 140} y="30" width="80" height="35" rx="20" fill="#064e3b" opacity="0.4" />
            </g>
          ))}
          <text x="300" y="92" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">HYDROPONICS-SEKTION — UV-BELEUCHTUNG AKTIV</text>
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor IOTA.</strong> AURA: „Lebensmittelversorgung teilweise kontaminiert. Welche zwei Produkte meidest du vorrangig?"
          <br /><span className="text-xs text-slate-400">Wähle 2 Lebensmittel, die du meidest:</span>
        </p>
      </div>

      <AuraMessage
        message="Achte auf natürlich vorkommende Radioaktivität und mögliche Kontamination durch Nuklearfallout. Welche Isotope sind besonders gefährlich, wenn sie in den Körper gelangen?"
        variant="info"
      />

      {phase === 'choose' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">WELCHE 2 LEBENSMITTEL MEIDEST DU?</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {FOODS.map(food => {
              const isAvoided = avoid.has(food.id)
              const isDisabled = !isAvoided && avoid.size >= 2
              return (
                <button key={food.id} onClick={() => toggle(food.id)} disabled={isDisabled}
                  className="p-3 rounded-xl text-center transition-all cursor-pointer"
                  style={{
                    background: isAvoided ? 'rgba(239,68,68,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isAvoided ? 'rgba(239,68,68,0.5)' : 'rgba(100,116,139,0.3)'}`,
                    opacity: isDisabled ? 0.4 : 1,
                  }}>
                  <div className="text-3xl mb-1">{food.icon}</div>
                  <div className="text-xs text-white font-semibold">{food.name}</div>
                  <div className="text-xs mt-1" style={{ color: food.radioactivity.includes('sehr hoch') ? '#ef4444' : food.radioactivity.includes('hoch') ? '#f59e0b' : '#64748b' }}>
                    ☢ {food.radioactivity}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{food.bqkg}</div>
                  {isAvoided && <div className="text-red-400 text-xs mt-1">🚫 Gemieden</div>}
                </button>
              )
            })}
          </div>
          <div className="text-xs text-slate-500 mb-3">* Cs-137-Kontamination durch verseuchtes Hydroponik-Kühlwasser (Reaktorleck Sektor 7, 2149)</div>
          <button onClick={() => setPhase('justify')} disabled={avoid.size < 2}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: avoid.size >= 2 ? 'linear-gradient(135deg, #065f46, #0891b2)' : '#1e293b', border: '1px solid rgba(16,185,129,0.3)' }}>
            AUSWAHL BESTÄTIGEN ({avoid.size}/2 ausgewählt)
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Warum ist interne Strahlenbelastung durch Essen gefährlicher als externe Strahlung aus der Umgebung?"
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
