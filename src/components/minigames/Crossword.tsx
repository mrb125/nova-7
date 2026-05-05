import { useState, useRef } from 'react'

// Grid layout for the crossword
// Words placed:
//   ALPHA       → across, row 0, col 0  (5 letters)
//   BLEI        → across, row 2, col 2  (4 letters)
//   GAMMA       → across, row 4, col 0  (5 letters)
//   BETA        → across, row 6, col 1  (4 letters)
//   PROTON      → down,   row 0, col 2  (6 letters)
//   ATOM        → down,   row 0, col 4  (4 letters)
//   HALBWERTSZEIT: too long, use short words only
//
// Simpler layout — 8 cols × 8 rows grid:
//   ALPHA     row0 col0 across
//   PROTON    row0 col2 down
//   BLEI      row2 col0 across
//   IONISIERUNG: too long
//   BETA      row2 col4 down
//   KERN      row4 col0 across
//   GAMMA     row5 col2 across (col 2..6)
//   DOSIS     row3 col6 down

// Let's keep it simple with a small 7×7 grid, 6 words:
//   1ac ALPHA    r0 c0  across  A L P H A
//   2ac BLEI     r2 c2  across  B L E I
//   3ac KERN     r4 c0  across  K E R N
//   4ac GAMMA    r6 c0  across  G A M M A
//   1dn PROTON   r0 c2  down    P R O T O N  (rows 0..5)
//   2dn BETA     r2 c0  down    B E T A      (rows 2..5)

// Grid mapping: [row][col] = { letter, wordIds[], number? }

interface Cell {
  letter: string
  number?: number
  acrossId?: string
  downId?: string
}

interface Word {
  id: string
  number: number
  direction: 'across' | 'down'
  row: number
  col: number
  answer: string
  clue: string
}

const WORDS: Word[] = [
  { id: '1ac', number: 1, direction: 'across', row: 0, col: 0, answer: 'ALPHA', clue: '1 →  Strahlungsart aus Heliumkernen' },
  { id: '2ac', number: 2, direction: 'across', row: 2, col: 2, answer: 'BLEI', clue: '2 →  Abschirmmaterial für γ-Strahlung' },
  { id: '3ac', number: 3, direction: 'across', row: 4, col: 0, answer: 'KERN', clue: '3 →  Zentrales Teilchen im Atom (auch: Rumpf der Station)' },
  { id: '4ac', number: 4, direction: 'across', row: 6, col: 0, answer: 'GAMMA', clue: '4 →  Elektromagnetische ionisierende Strahlung' },
  { id: '1dn', number: 1, direction: 'down', row: 0, col: 2, answer: 'PROTON', clue: '1 ↓  Positiv geladenes Teilchen im Atomkern' },
  { id: '5dn', number: 5, direction: 'down', row: 2, col: 0, answer: 'BETA', clue: '5 ↓  Strahlungsart aus schnellen Elektronen' },
]

const ROWS = 8
const COLS = 6

// Build grid
type Grid = (Cell | null)[][]

function buildGrid(): Grid {
  const grid: Grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))

  for (const word of WORDS) {
    for (let i = 0; i < word.answer.length; i++) {
      const r = word.direction === 'across' ? word.row : word.row + i
      const c = word.direction === 'across' ? word.col + i : word.col
      if (r >= ROWS || c >= COLS) continue
      if (!grid[r][c]) {
        grid[r][c] = { letter: word.answer[i] }
      }
      const cell = grid[r][c]!
      if (word.direction === 'across') cell.acrossId = word.id
      else cell.downId = word.id
    }
  }

  // Place numbers at word starts
  for (const word of WORDS) {
    const cell = grid[word.row][word.col]
    if (cell && !cell.number) cell.number = word.number
  }

  return grid
}

const GRID = buildGrid()

export default function Crossword() {
  const [inputs, setInputs] = useState<Record<string, string>>({})  // key: "r,c"
  const [checked, setChecked] = useState(false)
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function key(r: number, c: number) { return `${r},${c}` }

  function setCell(r: number, c: number, val: string) {
    setInputs(prev => ({ ...prev, [key(r, c)]: val.toUpperCase().slice(-1) }))
  }

  function handleKeyDown(e: React.KeyboardEvent, r: number, c: number, _cell: Cell) {
    if (e.key === 'Backspace' && !inputs[key(r, c)]) {
      // Move back
      const word = activeWord ? WORDS.find(w => w.id === activeWord) : null
      if (word) {
        const prevR = word.direction === 'across' ? r : r - 1
        const prevC = word.direction === 'across' ? c - 1 : c
        inputRefs.current[key(prevR, prevC)]?.focus()
      }
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>, r: number, c: number, _cell: Cell) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1)
    setCell(r, c, val)
    if (!val) return
    // Auto-advance
    const word = activeWord ? WORDS.find(w => w.id === activeWord) : null
    if (word) {
      const nextR = word.direction === 'across' ? r : r + 1
      const nextC = word.direction === 'across' ? c + 1 : c
      if (nextR < ROWS && nextC < COLS && GRID[nextR][nextC]) {
        inputRefs.current[key(nextR, nextC)]?.focus()
      }
    }
  }

  function clickCell(r: number, c: number, cell: Cell) {
    // Cycle through across/down if both present
    if (cell.acrossId && cell.downId) {
      if (activeWord === cell.acrossId) setActiveWord(cell.downId)
      else setActiveWord(cell.acrossId)
    } else {
      setActiveWord(cell.acrossId ?? cell.downId ?? null)
    }
    inputRefs.current[key(r, c)]?.focus()
  }

  function isCellActive(_r: number, _c: number, cell: Cell) {
    if (!activeWord) return false
    return cell.acrossId === activeWord || cell.downId === activeWord
  }


  function checkAll() { setChecked(true) }
  function reset() {
    setInputs({})
    setChecked(false)
    setActiveWord(null)
  }

  function getCellResult(r: number, c: number, cell: Cell) {
    if (!checked) return null
    const entered = inputs[key(r, c)] ?? ''
    return entered === cell.letter ? 'correct' : 'wrong'
  }

  const uniqueCells = new Set<string>()
  WORDS.forEach(w => {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.direction === 'across' ? w.row : w.row + i
      const c = w.direction === 'across' ? w.col + i : w.col
      uniqueCells.add(key(r, c))
    }
  })
  const correctCells = [...uniqueCells].filter(k => {
    const [r, c] = k.split(',').map(Number)
    const cell = GRID[r][c]
    return cell && (inputs[k] ?? '') === cell.letter
  }).length

  return (
    <div className="space-y-5">
      <p className="text-slate-400 text-sm">Löse das Kreuzworträtsel zur Strahlenphysik.</p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div className="inline-block" style={{ lineHeight: 0 }}>
            {GRID.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  if (!cell) {
                    return <div key={c} className="w-8 h-8 md:w-10 md:h-10" style={{ background: '#020617' }} />
                  }
                  const isActive = isCellActive(r, c, cell)
                  const result = getCellResult(r, c, cell)
                  return (
                    <div key={c} onClick={() => clickCell(r, c, cell)}
                      className="relative w-8 h-8 md:w-10 md:h-10 cursor-pointer"
                      style={{
                        background: result === 'correct' ? '#064e3b' : result === 'wrong' ? '#450a0a' : isActive ? '#1e3a5f' : '#0f172a',
                        border: `1px solid ${isActive ? '#06b6d4' : '#334155'}`,
                      }}>
                      {cell.number && (
                        <span className="absolute top-0 left-0.5 text-cyan-400 leading-none" style={{ fontSize: '7px' }}>
                          {cell.number}
                        </span>
                      )}
                      <input
                        ref={el => { inputRefs.current[key(r, c)] = el }}
                        type="text"
                        maxLength={1}
                        value={inputs[key(r, c)] ?? ''}
                        onChange={e => handleInput(e, r, c, cell)}
                        onKeyDown={e => handleKeyDown(e, r, c, cell)}
                        onFocus={() => clickCell(r, c, cell)}
                        disabled={checked}
                        className="absolute inset-0 w-full h-full text-center font-bold uppercase focus:outline-none bg-transparent pt-2 text-sm md:text-base"
                        style={{
                          color: result === 'correct' ? '#6ee7b7' : result === 'wrong' ? '#fca5a5' : '#e2e8f0',
                          caretColor: 'transparent',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 space-y-3 text-sm">
          <div>
            <div className="text-xs hud-font text-cyan-400 mb-1.5">WAAGERECHT →</div>
            <div className="space-y-1">
              {WORDS.filter(w => w.direction === 'across').map(w => (
                <div key={w.id}
                  onClick={() => setActiveWord(w.id)}
                  className="px-2 py-1 rounded cursor-pointer transition-all"
                  style={{
                    background: activeWord === w.id ? 'rgba(6,182,212,0.1)' : 'transparent',
                    color: activeWord === w.id ? '#67e8f9' : '#94a3b8',
                  }}>
                  {w.clue}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs hud-font text-violet-400 mb-1.5">SENKRECHT ↓</div>
            <div className="space-y-1">
              {WORDS.filter(w => w.direction === 'down').map(w => (
                <div key={w.id}
                  onClick={() => setActiveWord(w.id)}
                  className="px-2 py-1 rounded cursor-pointer transition-all"
                  style={{
                    background: activeWord === w.id ? 'rgba(124,58,237,0.1)' : 'transparent',
                    color: activeWord === w.id ? '#c4b5fd' : '#94a3b8',
                  }}>
                  {w.clue}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      {checked && (
        <div className="rounded-lg p-3 text-center"
          style={{
            background: correctCells === uniqueCells.size ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
            border: `1px solid ${correctCells === uniqueCells.size ? 'rgba(16,185,129,0.4)' : 'rgba(234,179,8,0.4)'}`,
          }}>
          <p className="hud-font font-bold" style={{ color: correctCells === uniqueCells.size ? '#6ee7b7' : '#fde047' }}>
            {correctCells === uniqueCells.size ? '✓ Kreuzworträtsel gelöst!' : `${correctCells}/${uniqueCells.size} Buchstaben korrekt`}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {!checked ? (
          <button onClick={checkAll}
            className="flex-1 py-3 rounded-lg hud-font text-sm font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            LÖSUNG PRÜFEN
          </button>
        ) : (
          <button onClick={reset}
            className="flex-1 py-3 rounded-lg hud-font text-sm font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)', border: '1px solid rgba(124,58,237,0.3)' }}>
            NEU STARTEN
          </button>
        )}
      </div>
    </div>
  )
}
