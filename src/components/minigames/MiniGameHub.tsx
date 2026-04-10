import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'closed' | 'geiger' | 'quiz' | 'results'

interface GameResult {
  game: 'geiger' | 'quiz'
  score: number
  max: number
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────

interface QuizQuestion {
  q: string
  answers: [string, string, string]
  correct: 0 | 1 | 2
  fact: string
}

const QUESTIONS: QuizQuestion[] = [
  {
    q: 'Welche Strahlung wird durch ein Blatt Papier gestoppt?',
    answers: ['Alpha-Strahlung', 'Beta-Strahlung', 'Gamma-Strahlung'],
    correct: 0,
    fact: 'Alpha-Teilchen sind groß und langsam — Papier oder Haut reicht als Schutz.',
  },
  {
    q: 'Was passiert beim Beta-Minus-Zerfall mit der Ordnungszahl?',
    answers: ['Sie sinkt um 1', 'Sie bleibt gleich', 'Sie steigt um 1'],
    correct: 2,
    fact: 'Ein Neutron wird zu Proton + Elektron (Beta-) — die Kernladung steigt.',
  },
  {
    q: 'Was ist die Einheit der Aktivität?',
    answers: ['Sievert (Sv)', 'Becquerel (Bq)', 'Gray (Gy)'],
    correct: 1,
    fact: 'Becquerel = Zerfälle pro Sekunde. Benannt nach Henri Becquerel (1896).',
  },
  {
    q: 'Welche Strahlung hat die höchste Durchdringungskraft?',
    answers: ['Beta-Strahlung', 'Alpha-Strahlung', 'Gamma-Strahlung'],
    correct: 2,
    fact: 'Gamma-Strahlung ist elektromagnetisch und braucht Blei oder Beton zur Abschirmung.',
  },
  {
    q: 'Was beschreibt die Halbwertszeit?',
    answers: [
      'Zeit bis zum vollständigen Zerfall',
      'Zeit, in der die Hälfte zerfällt',
      'Hälfte der maximalen Aktivität',
    ],
    correct: 1,
    fact: 'Halbwertszeit von C-14 ≈ 5730 Jahre — daher nützlich für Altersbestimmung.',
  },
  {
    q: 'Wozu dient ein Dosimeter?',
    answers: [
      'Messung der Quell-Aktivität',
      'Abschirmung von Strahlung',
      'Messung der empfangenen Dosis',
    ],
    correct: 2,
    fact: 'Dosimeter messen die Gesamtdosis, die eine Person aufgenommen hat.',
  },
  {
    q: 'Was ist ein Isotop?',
    answers: [
      'Gleiche Kernladung, verschiedene Neutronenzahl',
      'Gleiche Neutronenzahl, verschiedene Protonen',
      'Gleiche Massen- und Ordnungszahl',
    ],
    correct: 0,
    fact: 'C-12 und C-14 sind Isotope: beide haben 6 Protonen, aber 6 bzw. 8 Neutronen.',
  },
  {
    q: 'Welche Einheit misst die biologische Strahlenwirkung?',
    answers: ['Becquerel (Bq)', 'Sievert (Sv)', 'Gray (Gy)'],
    correct: 1,
    fact: 'Sievert gewichtet physikalische Dosis (Gray) nach biologischer Wirksamkeit.',
  },
]

// ─── Particle Detector Mini-Game ──────────────────────────────────────────────

interface Particle {
  id: number
  x: number
  y: number
  r: number
  born: number
  lifetime: number
  color: string
}

const PARTICLE_COLORS = ['#06b6d4', '#10b981', '#a78bfa', '#f59e0b']

function GeigerGame({ onDone }: { onDone: (score: number) => void }) {
  const [timeLeft, setTimeLeft] = useState(20)
  const [score, setScore] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const nextId = useRef(0)
  const areaRef = useRef<SVGSVGElement>(null)

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) { onDone(score); return }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, score, onDone])

  // Spawn particles
  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => {
      const w = 460, h = 200
      setParticles(prev => {
        if (prev.length >= 8) return prev // cap
        return [...prev, {
          id: nextId.current++,
          x: 20 + Math.random() * (w - 40),
          y: 20 + Math.random() * (h - 40),
          r: 10 + Math.random() * 10,
          born: Date.now(),
          lifetime: 1800 + Math.random() * 1200,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        }]
      })
    }, 400)
    return () => clearInterval(id)
  }, [timeLeft])

  // Expire particles
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setParticles(prev => prev.filter(p => now - p.born < p.lifetime))
    }, 100)
    return () => clearInterval(id)
  }, [])

  const handleClick = useCallback((pid: number) => {
    setParticles(prev => prev.filter(p => p.id !== pid))
    setScore(s => s + 1)
  }, [])

  const timeColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#06b6d4'

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="hud-font text-xs text-slate-400">
          Klicke die Teilchen bevor sie verschwinden!
        </div>
        <div className="flex items-center gap-4">
          <div className="hud-font text-sm font-bold text-yellow-400">{score} Treffer</div>
          <div className="hud-font text-sm font-bold" style={{ color: timeColor }}>{timeLeft}s</div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: '#020617', border: '1px solid rgba(6,182,212,0.2)' }}>
        <svg ref={areaRef} viewBox="0 0 460 200" className="w-full" style={{ cursor: 'crosshair', height: '180px' }}>
          {/* Background grid */}
          {[...Array(12)].map((_, i) => (
            <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="200" stroke="#0a1525" strokeWidth="0.5" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 40} x2="460" y2={i * 40} stroke="#0a1525" strokeWidth="0.5" />
          ))}
          {/* AURA instructions */}
          {particles.length === 0 && timeLeft > 0 && (
            <text x="230" y="105" textAnchor="middle" fill="#334155" fontSize="12" fontFamily="monospace">
              Ionisierende Teilchen erwartet...
            </text>
          )}
          {/* Particles */}
          {particles.map(p => {
            const age = (Date.now() - p.born) / p.lifetime
            const opacity = Math.max(0, 1 - age * 1.2)
            return (
              <g key={p.id} onClick={() => handleClick(p.id)} style={{ cursor: 'pointer' }}>
                <circle cx={p.x} cy={p.y} r={p.r * 1.8} fill={p.color} opacity={opacity * 0.1} />
                <circle cx={p.x} cy={p.y} r={p.r} fill={p.color} opacity={opacity * 0.6}
                  stroke={p.color} strokeWidth="1">
                  <animate attributeName="r" values={`${p.r};${p.r * 1.1};${p.r}`} dur="0.5s" repeatCount="indefinite" />
                </circle>
                {/* Radiation symbol mini */}
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="white" fontSize="10"
                  opacity={opacity} style={{ pointerEvents: 'none' }}>
                  ☢
                </text>
              </g>
            )
          })}
          {/* Timer bar */}
          <rect x="0" y="195" width={460 * (timeLeft / 20)} height="5" fill={timeColor} opacity="0.8" />
        </svg>
      </div>
      <div className="mt-2 text-center text-slate-600 text-xs hud-font">
        Physik: Geiger-Müller-Zählrohr — ionisierende Teilchen erzeugen messbare Impulse
      </div>
    </div>
  )
}

// ─── Physics Quiz Mini-Game ───────────────────────────────────────────────────

function pickQuestions(): QuizQuestion[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

function QuizGame({ onDone }: { onDone: (score: number) => void }) {
  const [questions] = useState(() => pickQuestions())
  const [qIdx, setQIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(12)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const current = questions[qIdx]
  const isAnswered = selected !== null

  useEffect(() => {
    if (isAnswered) return
    if (timeLeft <= 0) { setSelected(-1); return }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, isAnswered])

  const handleAnswer = (idx: number) => {
    if (isAnswered) return
    setSelected(idx)
    if (idx === current.correct) setScore(s => s + 1)
  }

  const handleNext = () => {
    if (qIdx + 1 >= questions.length) {
      onDone(score + (selected === current.correct ? 0 : 0))
    } else {
      setQIdx(q => q + 1)
      setSelected(null)
      setTimeLeft(12)
    }
  }

  const timeColor = timeLeft <= 3 ? '#ef4444' : timeLeft <= 6 ? '#f59e0b' : '#06b6d4'
  const wasCorrect = selected === current.correct

  return (
    <div>
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="text-slate-400 text-xs hud-font">Frage {qIdx + 1} / {questions.length}</div>
        <div className="flex items-center gap-4">
          <div className="text-yellow-400 font-bold hud-font text-sm">{score} ⭐</div>
          {!isAnswered && (
            <div className="font-bold hud-font text-sm" style={{ color: timeColor }}>{timeLeft}s</div>
          )}
        </div>
      </div>

      <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
        <p className="text-white text-sm font-medium leading-relaxed">{current.q}</p>
      </div>

      <div className="space-y-2 mb-3">
        {current.answers.map((ans, i) => {
          let bg = 'rgba(15,34,56,0.8)'
          let border = 'rgba(30,58,95,0.5)'
          let textColor = '#94a3b8'
          if (isAnswered) {
            if (i === current.correct) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; textColor = '#6ee7b7' }
            else if (i === selected) { bg = 'rgba(239,68,68,0.1)'; border = '#ef4444'; textColor = '#fca5a5' }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all"
              style={{ background: bg, border: `1px solid ${border}`, color: textColor, cursor: isAnswered ? 'default' : 'pointer' }}
            >
              <span className="hud-font text-xs opacity-60 mr-2">{['A', 'B', 'C'][i]}.</span>
              {ans}
            </button>
          )
        })}
      </div>

      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg p-3 mb-3 text-xs"
          style={{
            background: wasCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${wasCorrect ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          <span className="font-bold" style={{ color: wasCorrect ? '#10b981' : '#ef4444' }}>
            {wasCorrect ? '✓ Richtig! ' : '✗ Falsch. '}
          </span>
          <span className="text-slate-400">{current.fact}</span>
        </motion.div>
      )}

      {/* Timer bar */}
      {!isAnswered && (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(timeLeft / 12) * 100}%`, background: timeColor }} />
        </div>
      )}

      {isAnswered && (
        <button
          onClick={handleNext}
          className="w-full py-2.5 rounded-lg hud-font text-xs font-bold tracking-wider transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}
        >
          {qIdx + 1 >= questions.length ? 'AUSWERTUNG →' : 'NÄCHSTE FRAGE →'}
        </button>
      )}
    </div>
  )
}

// ─── Hub (auto-pick + results) ────────────────────────────────────────────────

export default function MiniGameHub({ levelNumber }: { levelNumber?: number }) {
  const [screen, setScreen] = useState<Screen>('closed')
  const [result, setResult] = useState<GameResult | null>(null)

  function pickGame(): 'geiger' | 'quiz' {
    if (levelNumber !== undefined) return levelNumber % 2 === 0 ? 'geiger' : 'quiz'
    return Math.random() < 0.5 ? 'geiger' : 'quiz'
  }

  function handleOpen() {
    setResult(null)
    setScreen(pickGame())
  }

  const handleGeigerDone = (score: number) => {
    setResult({ game: 'geiger', score, max: 30 })
    setScreen('results')
  }

  const handleQuizDone = (score: number) => {
    setResult({ game: 'quiz', score, max: 5 })
    setScreen('results')
  }

  const gameLabel = levelNumber !== undefined
    ? (levelNumber % 2 === 0 ? '☢️ TEILCHEN-DETEKTOR' : '🧠 STRAHLENQUIZ')
    : '🎮 MINI-CHALLENGE'

  if (screen === 'closed') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <button
          onClick={handleOpen}
          className="px-6 py-2 rounded-lg hud-font text-xs tracking-wider font-bold transition-all hover:brightness-110"
          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
        >
          {gameLabel} STARTEN
        </button>
        <div className="text-slate-600 text-xs mt-1">Überbrücke die Wartezeit mit einer Physik-Challenge</div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 glass-panel p-5 w-full max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="hud-font text-sm font-bold text-white flex items-center gap-2">
          <span style={{ color: '#a78bfa' }}>🎮</span> MINI-CHALLENGE
        </h3>
        <button
          onClick={() => setScreen('closed')}
          className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 transition-colors"
        >
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'geiger' && (
          <motion.div key="geiger" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GeigerGame onDone={handleGeigerDone} />
          </motion.div>
        )}

        {screen === 'quiz' && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <QuizGame onDone={handleQuizDone} />
          </motion.div>
        )}

        {screen === 'results' && result && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="text-4xl mb-3">{result.score >= result.max * 0.8 ? '🏆' : result.score >= result.max * 0.5 ? '⭐' : '💡'}</div>
            <div className="hud-font text-xl font-black mb-1"
              style={{ color: result.score >= result.max * 0.8 ? '#f59e0b' : result.score >= result.max * 0.5 ? '#10b981' : '#06b6d4' }}>
              {result.game === 'geiger' ? `${result.score} TREFFER` : `${result.score} / ${result.max} RICHTIG`}
            </div>
            <div className="text-slate-400 text-xs mb-5">
              {result.game === 'geiger'
                ? result.score >= 15 ? 'Ausgezeichnete Reaktionszeit — AURA ist beeindruckt!' : 'Gut! Übung macht den Meister.'
                : result.score >= 4 ? 'Top-Physikkenntnisse! Dr. Kern wäre stolz.' : result.score >= 2 ? 'Solide Grundlagen — weiter üben!' : 'Lies das Physikbuch noch einmal…'}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setResult(null); setScreen(result.game) }}
                className="px-5 py-2 rounded-lg hud-font text-xs font-bold tracking-wider transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #0891b2)', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                NOCHMAL
              </button>
              <button
                onClick={() => { setResult(null); setScreen(result.game === 'geiger' ? 'quiz' : 'geiger') }}
                className="px-5 py-2 rounded-lg hud-font text-xs font-bold tracking-wider transition-all hover:brightness-110"
                style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee' }}
              >
                {result.game === 'geiger' ? '🧠 QUIZ' : '☢️ DETEKTOR'}
              </button>
              <button
                onClick={() => setScreen('closed')}
                className="px-5 py-2 rounded-lg hud-font text-xs tracking-wider transition-all"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.3)', color: '#64748b' }}
              >
                SCHLIESSEN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
