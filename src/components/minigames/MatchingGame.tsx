import { useState } from 'react'

interface Pair {
  id: string
  left: string
  right: string
}

const PAIRS: Pair[] = [
  { id: 'alpha', left: 'Alpha-Strahlung (α)', right: 'Heliumkern, gestoppt durch Papier' },
  { id: 'beta', left: 'Beta-Strahlung (β)', right: 'Elektron, gestoppt durch Aluminium' },
  { id: 'gamma', left: 'Gamma-Strahlung (γ)', right: 'Elektromagnetische Welle, gestoppt durch Blei' },
  { id: 'halflife', left: 'Halbwertszeit T½', right: 'Zeit, bis die Hälfte der Kerne zerfallen ist' },
  { id: 'activity', left: 'Aktivität A', right: 'Anzahl der Zerfälle pro Sekunde (Becquerel)' },
  { id: 'dosimeter', left: 'Dosimeter', right: 'Messgerät für die empfangene Strahlendosis' },
  { id: 'isl', left: 'Quadrat. Abstandsgesetz', right: 'Intensität nimmt mit 1/r² ab' },
  { id: 'gm', left: 'Geiger-Müller-Zählrohr', right: 'Ionisierungsereignisse im Zählgas erzeugen Impulse' },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MatchingGame() {
  const [leftItems] = useState(() => shuffle(PAIRS).map(p => ({ id: p.id, text: p.left })))
  const [rightItems] = useState(() => shuffle(PAIRS).map(p => ({ id: p.id, text: p.right })))
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  function handleLeft(id: string) {
    if (matched.has(id)) return
    setWrong([])
    setSelectedLeft(id)
    if (selectedRight) checkMatch(id, selectedRight)
  }

  function handleRight(id: string) {
    if (matched.has(id)) return
    setWrong([])
    setSelectedRight(id)
    if (selectedLeft) checkMatch(selectedLeft, id)
  }

  function checkMatch(leftId: string, rightId: string) {
    if (leftId === rightId) {
      const newMatched = new Set(matched)
      newMatched.add(leftId)
      setMatched(newMatched)
      setSelectedLeft(null)
      setSelectedRight(null)
      const newScore = score + 1
      setScore(newScore)
      if (newMatched.size === PAIRS.length) setFinished(true)
    } else {
      setWrong([leftId, rightId])
      setTimeout(() => {
        setSelectedLeft(null)
        setSelectedRight(null)
        setWrong([])
      }, 900)
    }
  }

  function reset() {
    setMatched(new Set())
    setSelectedLeft(null)
    setSelectedRight(null)
    setWrong([])
    setScore(0)
    setFinished(false)
  }

  const pct = Math.round((matched.size / PAIRS.length) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Verbinde jeden Begriff mit der richtigen Erklärung.</p>
        <span className="hud-font text-cyan-400 text-sm">{matched.size}/{PAIRS.length} ✓</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-slate-700/60">
        <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {finished ? (
        <div className="rounded-xl p-6 text-center space-y-3" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <div className="text-4xl">🎉</div>
          <p className="hud-font text-emerald-400 text-lg font-bold">ALLE ZUORDNUNGEN KORREKT!</p>
          <p className="text-slate-400 text-sm">Du hast alle {PAIRS.length} Begriffspaare richtig zugeordnet.</p>
          <button onClick={reset} className="mt-2 px-6 py-2 rounded-lg hud-font text-sm font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            NEU STARTEN
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Left column – terms */}
          <div className="space-y-2">
            <div className="text-xs hud-font text-slate-500 mb-1">BEGRIFFE</div>
            {leftItems.map(item => {
              const isMatched = matched.has(item.id)
              const isSelected = selectedLeft === item.id
              const isWrong = wrong.includes(item.id)
              return (
                <button key={item.id} onClick={() => handleLeft(item.id)} disabled={isMatched}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                  style={{
                    background: isMatched ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.15)' : isSelected ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isMatched ? 'rgba(16,185,129,0.4)' : isWrong ? 'rgba(239,68,68,0.5)' : isSelected ? 'rgba(6,182,212,0.6)' : 'rgba(100,116,139,0.3)'}`,
                    color: isMatched ? '#6ee7b7' : isWrong ? '#fca5a5' : isSelected ? '#67e8f9' : '#cbd5e1',
                    opacity: isMatched ? 0.6 : 1,
                  }}>
                  {isMatched ? '✓ ' : ''}{item.text}
                </button>
              )
            })}
          </div>
          {/* Right column – definitions */}
          <div className="space-y-2">
            <div className="text-xs hud-font text-slate-500 mb-1">ERKLÄRUNGEN</div>
            {rightItems.map(item => {
              const isMatched = matched.has(item.id)
              const isSelected = selectedRight === item.id
              const isWrong = wrong.includes(item.id)
              return (
                <button key={item.id} onClick={() => handleRight(item.id)} disabled={isMatched}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                  style={{
                    background: isMatched ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.15)' : isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${isMatched ? 'rgba(16,185,129,0.4)' : isWrong ? 'rgba(239,68,68,0.5)' : isSelected ? 'rgba(124,58,237,0.6)' : 'rgba(100,116,139,0.3)'}`,
                    color: isMatched ? '#6ee7b7' : isWrong ? '#fca5a5' : isSelected ? '#c4b5fd' : '#cbd5e1',
                    opacity: isMatched ? 0.6 : 1,
                  }}>
                  {isMatched ? '✓ ' : ''}{item.text}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
