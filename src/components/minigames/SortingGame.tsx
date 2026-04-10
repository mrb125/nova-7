import { useState } from 'react'

interface SortingExercise {
  id: string
  title: string
  instruction: string
  items: string[]
  correctOrder: string[]
  explanation: string
}

const EXERCISES: SortingExercise[] = [
  {
    id: 'decay-chain',
    title: 'Zerfallsreihe Fr-221',
    instruction: 'Bringe die Nuklide in die richtige Reihenfolge der Zerfallskette:',
    items: ['Bi-209 (stabil)', 'Fr-221', 'Po-213', 'Bi-213', 'At-217', 'Pb-209'],
    correctOrder: ['Fr-221', 'At-217', 'Bi-213', 'Po-213', 'Pb-209', 'Bi-209 (stabil)'],
    explanation: 'Fr-221 →(α)→ At-217 →(α)→ Bi-213 →(β⁻)→ Po-213 →(α)→ Pb-209 →(β⁻)→ Bi-209',
  },
  {
    id: 'penetration',
    title: 'Durchdringungsvermögen',
    instruction: 'Sortiere die Strahlungsarten von geringstem zu höchstem Durchdringungsvermögen:',
    items: ['Gamma (γ)', 'Beta (β)', 'Alpha (α)', 'Neutronen'],
    correctOrder: ['Alpha (α)', 'Beta (β)', 'Gamma (γ)', 'Neutronen'],
    explanation: 'α wird durch Papier gestoppt, β durch Alu, γ braucht dickes Blei. Neutronen durchdringen fast alles.',
  },
  {
    id: 'ionization',
    title: 'Ionisierungsvermögen',
    instruction: 'Sortiere von größtem zu kleinstem Ionisierungsvermögen:',
    items: ['Gamma (γ)', 'Beta (β)', 'Alpha (α)'],
    correctOrder: ['Alpha (α)', 'Beta (β)', 'Gamma (γ)'],
    explanation: 'α ionisiert am stärksten (schwer, doppelt geladen), γ am schwächsten. Umgekehrt zum Durchdringungsvermögen.',
  },
  {
    id: 'radioactivity',
    title: 'Natürliche Radioaktivität in Lebensmitteln',
    instruction: 'Sortiere von höchster zu niedrigster natürlicher Radioaktivität (Bq/kg):',
    items: ['Bananen (~130)', 'Paranüsse (~1000)', 'Milch (~50)', 'Pilze (~200)', 'Äpfel (~30)'],
    correctOrder: ['Paranüsse (~1000)', 'Pilze (~200)', 'Bananen (~130)', 'Milch (~50)', 'Äpfel (~30)'],
    explanation: 'Paranüsse enthalten Ra-226 durch tiefe Wurzeln. Pilze akkumulieren Cs-137. Bananen haben K-40.',
  },
]

function shuffleArr<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5) }

export default function SortingGame() {
  const [exIdx, setExIdx] = useState(0)
  const ex = EXERCISES[exIdx]
  const [order, setOrder] = useState<string[]>(() => shuffleArr(ex.items))
  const [checked, setChecked] = useState(false)
  const [dragging, setDragging] = useState<number | null>(null)

  function loadEx(i: number) {
    setExIdx(i)
    setOrder(shuffleArr(EXERCISES[i].items))
    setChecked(false)
    setDragging(null)
  }

  function moveUp(i: number) {
    if (checked || i === 0) return
    const n = [...order]
    ;[n[i - 1], n[i]] = [n[i], n[i - 1]]
    setOrder(n)
  }

  function moveDown(i: number) {
    if (checked || i === order.length - 1) return
    const n = [...order]
    ;[n[i], n[i + 1]] = [n[i + 1], n[i]]
    setOrder(n)
  }

  // Drag & drop
  function onDragStart(i: number) { setDragging(i) }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragging === null || dragging === i) return
    const n = [...order]
    const item = n.splice(dragging, 1)[0]
    n.splice(i, 0, item)
    setOrder(n)
    setDragging(i)
  }
  function onDrop() { setDragging(null) }

  const correctCount = order.filter((item, i) => item === ex.correctOrder[i]).length
  const allCorrect = correctCount === ex.correctOrder.length

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {EXERCISES.map((e, i) => (
          <button key={e.id} onClick={() => loadEx(i)}
            className="px-3 py-1 rounded-lg text-xs hud-font cursor-pointer transition-all"
            style={{
              background: exIdx === i ? 'rgba(6,182,212,0.2)' : 'rgba(15,23,42,0.6)',
              border: `1px solid ${exIdx === i ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
              color: exIdx === i ? '#67e8f9' : '#94a3b8',
            }}>
            {e.title}
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-sm">{ex.instruction}</p>
      <p className="text-xs text-slate-600 hud-font">Drag & Drop oder Pfeile benutzen</p>

      {/* Sortable list */}
      <div className="space-y-2">
        {order.map((item, i) => {
          const isCorrect = checked && item === ex.correctOrder[i]
          const isWrong = checked && item !== ex.correctOrder[i]
          return (
            <div key={item}
              draggable={!checked}
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={onDrop}
              className="flex items-center gap-3 rounded-lg px-4 py-3 transition-all select-none"
              style={{
                background: isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : dragging === i ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : dragging === i ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                cursor: checked ? 'default' : 'grab',
              }}>
              <span className="text-slate-600 hud-font text-xs w-5 text-center">{i + 1}.</span>
              <span className="flex-1 text-sm" style={{ color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : '#cbd5e1' }}>
                {isCorrect ? '✓ ' : isWrong ? '✗ ' : ''}{item}
              </span>
              {!checked && (
                <div className="flex gap-1">
                  <button onClick={() => moveUp(i)} disabled={i === 0}
                    className="w-6 h-6 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors text-xs">▲</button>
                  <button onClick={() => moveDown(i)} disabled={i === order.length - 1}
                    className="w-6 h-6 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors text-xs">▼</button>
                </div>
              )}
              {checked && isWrong && (
                <span className="text-xs text-slate-500">({ex.correctOrder[i]})</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Action */}
      {!checked ? (
        <button onClick={() => setChecked(true)}
          className="w-full py-3 rounded-lg hud-font text-sm font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          REIHENFOLGE PRÜFEN
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg p-4 space-y-2"
            style={{
              background: allCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
              border: `1px solid ${allCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(234,179,8,0.4)'}`,
            }}>
            <p className="hud-font font-bold" style={{ color: allCorrect ? '#6ee7b7' : '#fde047' }}>
              {allCorrect ? '✓ Perfekte Reihenfolge!' : `${correctCount}/${ex.correctOrder.length} Positionen korrekt`}
            </p>
            <p className="text-slate-400 text-xs">{ex.explanation}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => loadEx(exIdx)}
              className="flex-1 py-2 rounded-lg hud-font text-xs font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.4)', color: '#94a3b8' }}>
              NOCHMAL
            </button>
            <button onClick={() => loadEx((exIdx + 1) % EXERCISES.length)}
              className="flex-1 py-2 rounded-lg hud-font text-xs font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
              NÄCHSTE →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
