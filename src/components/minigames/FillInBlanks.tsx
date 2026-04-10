import { useState } from 'react'

interface Blank { answer: string; display: string }
type Segment = string | Blank

interface Exercise {
  id: string
  title: string
  segments: Segment[]
  words: string[]  // shuffled pool (including distractors)
}

const EXERCISES: Exercise[] = [
  {
    id: 'decay',
    title: 'Radioaktiver Zerfall',
    segments: [
      'Beim radioaktiven Zerfall sendet ein instabiler Atomkern ',
      { answer: 'strahlung', display: 'Strahlung' },
      ' aus und wandelt sich in einen ',
      { answer: 'tochterkern', display: 'Tochterkern' },
      ' um. Die Anzahl der Zerfälle pro Sekunde nennt man ',
      { answer: 'aktivität', display: 'Aktivität' },
      ' und misst sie in ',
      { answer: 'becquerel', display: 'Becquerel' },
      '. Mit der Zeit nimmt die Aktivität ',
      { answer: 'exponentiell', display: 'exponentiell' },
      ' ab.',
    ],
    words: ['Strahlung', 'Tochterkern', 'Aktivität', 'Becquerel', 'exponentiell', 'Muterkern', 'linear', 'Hertz'],
  },
  {
    id: 'radiation',
    title: 'Strahlungsarten',
    segments: [
      'Alpha-Strahlung besteht aus ',
      { answer: 'heliumkernen', display: 'Heliumkernen' },
      ' und wird schon durch ein Blatt ',
      { answer: 'papier', display: 'Papier' },
      ' gestoppt. Beta-Strahlung besteht aus schnellen ',
      { answer: 'elektronen', display: 'Elektronen' },
      ' und wird durch ',
      { answer: 'aluminium', display: 'Aluminium' },
      ' abgeschirmt. Gamma-Strahlung benötigt mehrere cm ',
      { answer: 'blei', display: 'Blei' },
      ' zur Abschirmung.',
    ],
    words: ['Heliumkernen', 'Papier', 'Elektronen', 'Aluminium', 'Blei', 'Protonen', 'Glas', 'Wasser'],
  },
  {
    id: 'halflife',
    title: 'Halbwertszeit',
    segments: [
      'Die Halbwertszeit T½ gibt an, nach welcher Zeit die Hälfte der radioaktiven Kerne ',
      { answer: 'zerfallen', display: 'zerfallen' },
      ' ist. Nach zwei Halbwertszeiten sind noch ',
      { answer: '25', display: '25' },
      ' % vorhanden. Nach fünf Halbwertszeiten sind es noch ca. ',
      { answer: '3,125', display: '3,125' },
      ' %. Der Zerfall hört theoretisch ',
      { answer: 'nie', display: 'nie' },
      ' vollständig auf.',
    ],
    words: ['zerfallen', '25', '3,125', 'nie', 'entstanden', '50', '1,5625', 'immer'],
  },
  {
    id: 'distance',
    title: 'Abstandsgesetz',
    segments: [
      'Die Intensität einer Punktquelle nimmt mit dem Quadrat des ',
      { answer: 'abstands', display: 'Abstands' },
      ' ab (I ∝ 1/r²). Verdoppelt man den Abstand, sinkt die Intensität auf ',
      { answer: '1/4', display: '1/4' },
      ' des Ausgangswertes. Das gilt, weil sich die Strahlung auf eine wachsende ',
      { answer: 'kugeloberfläche', display: 'Kugeloberfläche' },
      ' verteilt, die proportional zu r² ist.',
    ],
    words: ['Abstands', '1/4', 'Kugeloberfläche', 'Kreisfläche', '1/2', 'Volumens', 'Masse'],
  },
]

function shuffleArr<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5) }

export default function FillInBlanks() {
  const [exIdx, setExIdx] = useState(0)
  const [filled, setFilled] = useState<Record<number, string>>({})
  const [checked, setChecked] = useState(false)
  const [activeWord, setActiveWord] = useState<string | null>(null)

  const exercise = EXERCISES[exIdx]
  const [wordOrder] = useState(() => EXERCISES.map(ex => shuffleArr(ex.words)))

  const blankIndices = exercise.segments.reduce<number[]>((acc, seg, i) => {
    if (typeof seg !== 'string') acc.push(i)
    return acc
  }, [])

  const usedWords = Object.values(filled)

  function selectWord(word: string) {
    if (checked) return
    setActiveWord(prev => prev === word ? null : word)
  }

  function clickBlank(idx: number) {
    if (checked) return
    if (filled[idx]) {
      // Clear the blank, return word
      setFilled(prev => { const n = { ...prev }; delete n[idx]; return n })
      setActiveWord(null)
    } else if (activeWord) {
      setFilled(prev => ({ ...prev, [idx]: activeWord }))
      setActiveWord(null)
    }
  }

  function loadExercise(i: number) {
    setExIdx(i)
    setFilled({})
    setChecked(false)
    setActiveWord(null)
  }

  const allFilled = blankIndices.every(i => filled[i])
  const correctCount = blankIndices.filter(i => {
    const seg = exercise.segments[i] as Blank
    return (filled[i] ?? '').toLowerCase() === seg.answer
  }).length

  return (
    <div className="space-y-4">
      {/* Exercise tabs */}
      <div className="flex gap-2 flex-wrap">
        {EXERCISES.map((ex, i) => (
          <button key={ex.id} onClick={() => loadExercise(i)}
            className="px-3 py-1 rounded-lg text-xs hud-font cursor-pointer transition-all"
            style={{
              background: exIdx === i ? 'rgba(6,182,212,0.2)' : 'rgba(15,23,42,0.6)',
              border: `1px solid ${exIdx === i ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
              color: exIdx === i ? '#67e8f9' : '#94a3b8',
            }}>
            {ex.title}
          </button>
        ))}
      </div>

      {/* Hint */}
      {!checked && activeWord && (
        <div className="text-xs text-violet-400 hud-font px-1">
          ‣ „{activeWord}" ausgewählt — klicke eine Lücke zum Einsetzen
        </div>
      )}
      {!checked && !activeWord && (
        <div className="text-xs text-slate-500 hud-font px-1">
          ‣ Wähle ein Wort aus der Wortbank, dann klicke eine Lücke
        </div>
      )}

      {/* Text with blanks */}
      <div className="rounded-xl p-5 leading-8 text-sm text-slate-300"
        style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(100,116,139,0.3)' }}>
        {exercise.segments.map((seg, i) => {
          if (typeof seg === 'string') return <span key={i}>{seg}</span>
          const val = filled[i]
          const isCorrect = checked && (val ?? '').toLowerCase() === seg.answer
          const isWrong = checked && val && (val ?? '').toLowerCase() !== seg.answer
          return (
            <button key={i} onClick={() => clickBlank(i)}
              className="inline-flex items-center justify-center px-2 py-0 mx-1 rounded text-sm font-semibold transition-all"
              style={{
                minWidth: '90px',
                height: '26px',
                background: isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : val ? 'rgba(6,182,212,0.15)' : activeWord ? 'rgba(124,58,237,0.1)' : 'rgba(100,116,139,0.1)',
                border: `1px dashed ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : val ? '#06b6d4' : activeWord ? '#7c3aed' : '#475569'}`,
                color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : val ? '#67e8f9' : '#64748b',
                cursor: checked ? 'default' : 'pointer',
              }}>
              {isWrong ? `✗` : val || '?'}
            </button>
          )
        })}
      </div>

      {/* Wrong answers shown below */}
      {checked && blankIndices.some(i => (filled[i] ?? '').toLowerCase() !== (exercise.segments[i] as Blank).answer) && (
        <div className="text-xs text-slate-400 space-y-1 px-1">
          {blankIndices.filter(i => (filled[i] ?? '').toLowerCase() !== (exercise.segments[i] as Blank).answer).map(i => (
            <div key={i}>✗ Eingesetzt: „{filled[i] ?? '(leer)'}" — Richtig: „{(exercise.segments[i] as Blank).display}"</div>
          ))}
        </div>
      )}

      {/* Word bank */}
      <div className="space-y-1.5">
        <div className="text-xs hud-font text-slate-500">WORTBANK</div>
        <div className="flex flex-wrap gap-2">
          {wordOrder[exIdx].map(word => {
            const isUsed = usedWords.includes(word)
            const isActive = activeWord === word
            return (
              <button key={word} onClick={() => !isUsed && !checked && selectWord(word)}
                disabled={isUsed || checked}
                className="px-3 py-1.5 rounded-lg text-sm hud-font transition-all"
                style={{
                  background: isActive ? 'rgba(124,58,237,0.3)' : isUsed ? 'rgba(15,23,42,0.3)' : 'rgba(124,58,237,0.12)',
                  border: `1px solid ${isActive ? 'rgba(124,58,237,0.8)' : isUsed ? 'rgba(100,116,139,0.15)' : 'rgba(124,58,237,0.4)'}`,
                  color: isUsed ? '#334155' : isActive ? '#e9d5ff' : '#c4b5fd',
                  cursor: isUsed || checked ? 'default' : 'pointer',
                  textDecoration: isUsed ? 'line-through' : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                {word}
              </button>
            )
          })}
        </div>
      </div>

      {/* Action */}
      {!checked ? (
        <button onClick={() => setChecked(true)} disabled={!allFilled}
          className="w-full py-3 rounded-lg hud-font text-sm font-bold disabled:opacity-30 cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          ANTWORTEN PRÜFEN
        </button>
      ) : (
        <div className="rounded-lg p-4 text-center space-y-2"
          style={{
            background: correctCount === blankIndices.length ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)',
            border: `1px solid ${correctCount === blankIndices.length ? 'rgba(16,185,129,0.4)' : 'rgba(234,179,8,0.4)'}`,
          }}>
          <p className="hud-font font-bold text-lg" style={{ color: correctCount === blankIndices.length ? '#6ee7b7' : '#fde047' }}>
            {correctCount === blankIndices.length ? '✓ Perfekt!' : `${correctCount}/${blankIndices.length} richtig`}
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => loadExercise(exIdx)}
              className="px-4 py-2 rounded-lg hud-font text-xs font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.4)', color: '#94a3b8' }}>
              NOCHMAL
            </button>
            <button onClick={() => loadExercise((exIdx + 1) % EXERCISES.length)}
              className="px-4 py-2 rounded-lg hud-font text-xs font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
              NÄCHSTER →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
