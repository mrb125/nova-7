import { useState, useMemo } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const SOURCES = [
  { id: 'radon',       name: 'Radon',                  icon: '🏠', desc: 'Zerfallsprodukte aus dem Boden, reichert sich in Räumen an', nat: true,  mSv: 1.1  },
  { id: 'terrestrial', name: 'Terrestrische Strahlung', icon: '🌍', desc: 'γ-Strahlung aus natürlichen Radionukliden in Gestein und Boden', nat: true,  mSv: 0.4  },
  { id: 'cosmic',      name: 'Kosmische Strahlung',     icon: '☄️', desc: 'Hochenergetische Teilchen und Photonen aus dem Weltall', nat: true,  mSv: 0.3  },
  { id: 'nahrung',     name: 'Nahrung / Ingestion',     icon: '🍎', desc: 'Natürliche Radionuklide in Nahrung (K-40, Rn-Folgeprodukte)', nat: true,  mSv: 0.25 },
  { id: 'nuclear',     name: 'Kerntechnik',              icon: '⚛️', desc: 'Kernkraftwerke und nukleare Industrie (künstlich)', nat: false, mSv: 0.02 },
]

// Correct ranking: highest → lowest dose contribution
const CORRECT_ORDER = ['radon', 'terrestrial', 'cosmic', 'nahrung', 'nuclear']

const KEYWORDS = ['radon', 'kosmisch', 'terrestrisch', 'natürlich', 'künstlich', 'hintergrundstrahlung', 'millisievert', 'quelle', 'kerntechnik', 'nahrung', 'boden', 'zerfall']

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function LevelHintergrund({ state: _state, onComplete }: LevelProps) {
  const shuffled = useMemo(() => shuffle(SOURCES), [])
  const [ranked, setRanked] = useState<string[]>([])
  const [phase, setPhase] = useState<'rank' | 'justify' | 'feedback'>('rank')
  const [justText, setJustText] = useState('')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)

  function handleClick(id: string) {
    const idx = ranked.indexOf(id)
    if (idx >= 0) {
      setRanked(ranked.slice(0, idx))
    } else {
      setRanked([...ranked, id])
    }
  }

  function calcCorrect(r: string[]) {
    let n = 0
    for (let i = 0; i < r.length; i++) if (r[i] === CORRECT_ORDER[i]) n++
    return n
  }

  function handleConfirm() {
    const correct = calcCorrect(ranked)
    const mcWP = correct * 2          // 2 WP per correct rank, max 10
    const dos = correct === 5 ? 0 : correct >= 3 ? 5 : 10
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
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SPEZIAL-MODUL: HINTERGRUNDSTRAHLUNG — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Korrekte Reihenfolge: Radon (1,1 mSv) &gt; Terrestrisch (0,4 mSv) &gt; Kosmisch (0,3 mSv) &gt; Nahrung (0,25 mSv) &gt; Kerntechnik (0,02 mSv).
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Hintergrundstrahlung"
          text="Radon ist mit ~50 % die bedeutendste natürliche Strahlenquelle in Deutschland. Es entsteht durch den Zerfall von Radium im Boden und reichert sich in schlecht belüfteten Räumen an. Kerntechnik trägt trotz großer öffentlicher Aufmerksamkeit nur minimal zur Gesamtdosis bei (~1 %)."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { ranked },
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
        question="Erkläre, warum Radon die bedeutendste natürliche Strahlenquelle ist und wie es in unserer Umgebung entsteht."
        keywords={KEYWORDS}
        onSubmit={handleJustification}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Ranking']} current={0} />
      <div className="glass-panel p-5">
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor GAMMA.</strong> AURA: „Strahlenbelastungs-Dashboard geladen. Sortiere die 5 Quellen nach ihrem Beitrag zur jährlichen Strahlendosis — von der höchsten zur niedrigsten."
        </p>
      </div>

      <AuraMessage
        message="Klicke die Quellen in der richtigen Reihenfolge an (1 = größter Beitrag zur Dosis). Erneut klicken = Rang zurücksetzen."
        variant="info"
      />

      <div className="glass-panel p-5">
        <h3 className="hud-font text-sm text-white mb-3">STRAHLENQUELLEN SORTIEREN (höchste → niedrigste Dosis)</h3>
        <div className="space-y-2 mb-4">
          {shuffled.map(src => {
            const rankIdx = ranked.indexOf(src.id)
            const isRanked = rankIdx >= 0
            const rankNum = rankIdx + 1
            return (
              <button
                key={src.id}
                onClick={() => handleClick(src.id)}
                className="w-full p-3 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3"
                style={{
                  background: isRanked ? 'rgba(6,182,212,0.12)' : 'rgba(15,23,42,0.6)',
                  border: `2px solid ${isRanked ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hud-font flex-shrink-0"
                  style={{
                    background: isRanked ? 'rgba(6,182,212,0.2)' : 'rgba(100,116,139,0.15)',
                    color: isRanked ? '#06b6d4' : '#475569',
                    border: `1px solid ${isRanked ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.2)'}`,
                  }}
                >
                  {isRanked ? rankNum : '—'}
                </div>
                <span className="text-2xl">{src.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{src.name}</div>
                  <div className="text-slate-400 text-xs">{src.desc}</div>
                </div>
                {!src.nat && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded hud-font flex-shrink-0"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    künstlich
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          onClick={handleConfirm}
          disabled={ranked.length < 5}
          className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
          style={{
            background: ranked.length === 5 ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
            border: '1px solid rgba(6,182,212,0.3)',
          }}
        >
          REIHENFOLGE BESTÄTIGEN {ranked.length < 5 ? `(${ranked.length}/5)` : '✓'}
        </button>
      </div>
    </div>
  )
}
