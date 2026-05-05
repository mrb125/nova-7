import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react'
import './UnitCircleApp.css'

type Mode = 'entdecken' | 'ueben' | 'check'

type Task = {
  id: string
  question: string
  options: string[]
  answer: string
  hint?: string
}

const STANDARD_ANGLES = [
  0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360,
]

const RADIAN_LABELS: Record<number, string> = {
  0: '0',
  30: 'pi/6',
  45: 'pi/4',
  60: 'pi/3',
  90: 'pi/2',
  120: '2pi/3',
  135: '3pi/4',
  150: '5pi/6',
  180: 'pi',
  210: '7pi/6',
  225: '5pi/4',
  240: '4pi/3',
  270: '3pi/2',
  300: '5pi/3',
  315: '7pi/4',
  330: '11pi/6',
  360: '2pi',
}

const EXACT_VALUES: Record<number, { sin: string; cos: string; tan: string }> = {
  0: { sin: '0', cos: '1', tan: '0' },
  30: { sin: '1/2', cos: 'sqrt(3)/2', tan: '1/sqrt(3)' },
  45: { sin: 'sqrt(2)/2', cos: 'sqrt(2)/2', tan: '1' },
  60: { sin: 'sqrt(3)/2', cos: '1/2', tan: 'sqrt(3)' },
  90: { sin: '1', cos: '0', tan: 'undefiniert' },
  120: { sin: 'sqrt(3)/2', cos: '-1/2', tan: '-sqrt(3)' },
  135: { sin: 'sqrt(2)/2', cos: '-sqrt(2)/2', tan: '-1' },
  150: { sin: '1/2', cos: '-sqrt(3)/2', tan: '-1/sqrt(3)' },
  180: { sin: '0', cos: '-1', tan: '0' },
  210: { sin: '-1/2', cos: '-sqrt(3)/2', tan: '1/sqrt(3)' },
  225: { sin: '-sqrt(2)/2', cos: '-sqrt(2)/2', tan: '1' },
  240: { sin: '-sqrt(3)/2', cos: '-1/2', tan: 'sqrt(3)' },
  270: { sin: '-1', cos: '0', tan: 'undefiniert' },
  300: { sin: '-sqrt(3)/2', cos: '1/2', tan: '-sqrt(3)' },
  315: { sin: '-sqrt(2)/2', cos: 'sqrt(2)/2', tan: '-1' },
  330: { sin: '-1/2', cos: 'sqrt(3)/2', tan: '-1/sqrt(3)' },
  360: { sin: '0', cos: '1', tan: '0' },
}

const PRACTICE_TASKS: Task[] = [
  {
    id: 'sin30',
    question: 'Bestimme sin(30°).',
    options: ['1/2', 'sqrt(2)/2', 'sqrt(3)/2', '1'],
    answer: '1/2',
    hint: 'sin ist die y-Koordinate.',
  },
  {
    id: 'cos60',
    question: 'Bestimme cos(60°).',
    options: ['1/2', 'sqrt(2)/2', 'sqrt(3)/2', '0'],
    answer: '1/2',
    hint: 'cos ist die x-Koordinate.',
  },
  {
    id: 'tan45',
    question: 'Bestimme tan(45°).',
    options: ['1', 'sqrt(3)', '1/sqrt(3)', '0'],
    answer: '1',
    hint: 'tan = sin/cos.',
  },
  {
    id: 'sign-sin-210',
    question: 'Vorzeichen von sin(210°)?',
    options: ['positiv', 'negativ', '0', 'undefiniert'],
    answer: 'negativ',
  },
  {
    id: 'sign-cos-300',
    question: 'Vorzeichen von cos(300°)?',
    options: ['positiv', 'negativ', '0', 'undefiniert'],
    answer: 'positiv',
  },
  {
    id: 'sign-tan-135',
    question: 'Vorzeichen von tan(135°)?',
    options: ['positiv', 'negativ', '0', 'undefiniert'],
    answer: 'negativ',
  },
  {
    id: 'cos-zero',
    question: 'Ein Winkel mit cos = 0 ist ...',
    options: ['90°', '180°', '270°', '360°'],
    answer: '90°',
  },
  {
    id: 'sin-minus-one',
    question: 'sin = -1 gilt bei ...',
    options: ['90°', '180°', '270°', '360°'],
    answer: '270°',
  },
  {
    id: 'tan-sqrt3',
    question: 'Ein Winkel mit tan = sqrt(3) ist ...',
    options: ['30°', '60°', '120°', '210°'],
    answer: '60°',
  },
  {
    id: 'quadrant-150',
    question: '150° liegt in Quadrant ...',
    options: ['I', 'II', 'III', 'IV'],
    answer: 'II',
  },
]

const CHECK_TASKS: Task[] = [
  {
    id: 'check-sin-240',
    question: 'Vorzeichen von sin(240°)?',
    options: ['positiv', 'negativ', '0', 'undefiniert'],
    answer: 'negativ',
  },
  {
    id: 'check-cos-120',
    question: 'cos(120°) ist ...',
    options: ['negativ', 'positiv', '0', 'undefiniert'],
    answer: 'negativ',
  },
  {
    id: 'check-tan-270',
    question: 'tan(270°) ist ...',
    options: ['positiv', 'negativ', '0', 'undefiniert'],
    answer: 'undefiniert',
  },
]

const EPS = 1e-6

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeAngle(deg: number) {
  let a = deg % 360
  if (a < 0) a += 360
  return a
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function formatNumber(value: number, digits = 3) {
  if (Math.abs(value) < EPS) return '0'
  return value.toFixed(digits)
}

function getQuadrantLabel(deg: number) {
  const a = normalizeAngle(deg)
  if (a === 0 || a === 90 || a === 180 || a === 270 || a === 360) return 'Achse'
  if (a > 0 && a < 90) return 'I'
  if (a > 90 && a < 180) return 'II'
  if (a > 180 && a < 270) return 'III'
  return 'IV'
}

function getSignLabel(value: number) {
  if (Math.abs(value) < EPS) return '0'
  return value > 0 ? '+' : '-'
}

function getExactValues(deg: number) {
  const rounded = Math.round(normalizeAngle(deg))
  return EXACT_VALUES[rounded]
}

function getRadianLabel(deg: number) {
  const rounded = Math.round(normalizeAngle(deg))
  return RADIAN_LABELS[rounded]
}

function QuizPanel({ title, tasks, accent }: { title: string; tasks: Task[]; accent: string }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)

  const task = tasks[index]
  const done = index >= tasks.length

  function handleSelect(option: string) {
    if (feedback || done) return
    setSelected(option)
    const correct = option === task.answer
    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore((s) => s + 1)
  }

  function handleNext() {
    setSelected(null)
    setFeedback(null)
    setIndex((i) => i + 1)
  }

  function handleReset() {
    setIndex(0)
    setScore(0)
    setSelected(null)
    setFeedback(null)
  }

  return (
    <div className="unit-panel unit-quiz">
      <div className="unit-quiz__header">
        <div>
          <p className="unit-label">Modus</p>
          <h3 className="unit-title">{title}</h3>
        </div>
        <div className="unit-quiz__score" style={{ borderColor: accent, color: accent }}>
          {score} / {tasks.length}
        </div>
      </div>

      {done ? (
        <div className="unit-quiz__done">
          <p className="unit-quiz__summary">Fertig! Ergebnis: {score} von {tasks.length}.</p>
          <button className="unit-btn" onClick={handleReset}>
            Nochmal starten
          </button>
        </div>
      ) : (
        <div className="unit-quiz__body">
          <p className="unit-quiz__question">{task.question}</p>
          <div className="unit-quiz__options">
            {task.options.map((option) => {
              const isSelected = selected === option
              const isCorrect = feedback && option === task.answer
              const isWrong = feedback && isSelected && option !== task.answer
              return (
                <button
                  key={option}
                  className={`unit-option ${isSelected ? 'is-selected' : ''} ${isCorrect ? 'is-correct' : ''} ${
                    isWrong ? 'is-wrong' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {feedback && (
            <div className={`unit-quiz__feedback ${feedback}`}>
              {feedback === 'correct' ? 'Richtig!' : `Nicht ganz. Richtig ist: ${task.answer}.`}
              {task.hint && <span className="unit-quiz__hint">{task.hint}</span>}
            </div>
          )}

          <div className="unit-quiz__footer">
            <span className="unit-quiz__progress">
              Aufgabe {index + 1} / {tasks.length}
            </span>
            <button className="unit-btn" onClick={handleNext} disabled={!feedback}>
              Weiter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UnitCircleApp() {
  const [mode, setMode] = useState<Mode>('entdecken')
  const [angleDeg, setAngleDeg] = useState(45)
  const [showHints, setShowHints] = useState(true)
  const [showExact, setShowExact] = useState(true)
  const [showTan, setShowTan] = useState(true)
  const [showRadians, setShowRadians] = useState(true)
  const [dragging, setDragging] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)
  const drawRef = useRef<() => void>(() => {})

  const normalizedAngle = normalizeAngle(angleDeg)
  const angleRad = toRad(normalizedAngle)
  const sinValue = Math.sin(angleRad)
  const cosValue = Math.cos(angleRad)
  const tanValue = Math.abs(cosValue) < EPS ? null : sinValue / cosValue
  const quadrant = getQuadrantLabel(normalizedAngle)
  const exact = useMemo(() => getExactValues(normalizedAngle), [normalizedAngle])
  const radLabel = useMemo(() => getRadianLabel(normalizedAngle), [normalizedAngle])

  function updateAngle(next: number) {
    const clamped = clamp(next, 0, 360)
    setAngleDeg(clamped)
  }

  function handlePointer(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const x = event.clientX - rect.left - cx
    const y = cy - (event.clientY - rect.top)
    const angle = Math.atan2(y, x)
    let deg = (angle * 180) / Math.PI
    if (deg < 0) deg += 360
    updateAngle(Math.round(deg))
  }

  drawRef.current = () => {
    const canvas = canvasRef.current
    const wrap = canvasWrapRef.current
    if (!canvas || !wrap) return

    const rect = wrap.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2
    const radius = Math.min(width, height) * 0.35
    const x = Math.cos(angleRad)
    const y = Math.sin(angleRad)
    const pointX = cx + radius * x
    const pointY = cy - radius * y

    ctx.save()
    ctx.strokeStyle = 'rgba(148,163,184,0.12)'
    ctx.lineWidth = 1
    const step = 24
    for (let i = step; i < width; i += step) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let j = step; j < height; j += step) {
      ctx.beginPath()
      ctx.moveTo(0, j)
      ctx.lineTo(width, j)
      ctx.stroke()
    }
    ctx.restore()

    const wedges = [
      { start: 0, end: Math.PI / 2, color: 'rgba(56,189,248,0.08)' },
      { start: Math.PI / 2, end: Math.PI, color: 'rgba(250,204,21,0.08)' },
      { start: Math.PI, end: (3 * Math.PI) / 2, color: 'rgba(251,113,133,0.08)' },
      { start: (3 * Math.PI) / 2, end: Math.PI * 2, color: 'rgba(16,185,129,0.08)' },
    ]
    wedges.forEach((wedge) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius, wedge.start, wedge.end)
      ctx.closePath()
      ctx.fillStyle = wedge.color
      ctx.fill()
    })

    ctx.save()
    ctx.strokeStyle = 'rgba(226,232,240,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx - radius * 1.2, cy)
    ctx.lineTo(cx + radius * 1.2, cy)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy - radius * 1.2)
    ctx.lineTo(cx, cy + radius * 1.2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(226,232,240,0.9)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = 'rgba(56,189,248,0.9)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(pointX, pointY)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.setLineDash([6, 6])
    ctx.strokeStyle = 'rgba(16,185,129,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(pointX, pointY)
    ctx.lineTo(pointX, cy)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(250,204,21,0.8)'
    ctx.beginPath()
    ctx.moveTo(pointX, pointY)
    ctx.lineTo(cx, pointY)
    ctx.stroke()
    ctx.restore()

    if (showTan) {
      ctx.save()
      ctx.setLineDash([8, 6])
      ctx.strokeStyle = 'rgba(248,113,113,0.7)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(cx + radius, cy - radius * 1.2)
      ctx.lineTo(cx + radius, cy + radius * 1.2)
      ctx.stroke()
      ctx.restore()

      if (Math.abs(cosValue) >= 0.06) {
        const tanY = tanValue ? tanValue * radius : 0
        if (Math.abs(tanY) <= radius * 1.6) {
          ctx.save()
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = 'rgba(248,113,113,0.9)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(cx, cy)
          ctx.lineTo(cx + radius, cy - tanY)
          ctx.stroke()
          ctx.restore()

          ctx.save()
          ctx.fillStyle = 'rgba(248,113,113,0.95)'
          ctx.beginPath()
          ctx.arc(cx + radius, cy - tanY, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }
    }

    ctx.save()
    ctx.fillStyle = 'rgba(15,23,42,0.7)'
    ctx.beginPath()
    ctx.arc(pointX, pointY, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    ctx.save()
    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    if (showHints) {
      ctx.save()
      ctx.fillStyle = 'rgba(226,232,240,0.7)'
      ctx.font = '12px "Exo 2", sans-serif'
      ctx.fillText('x = cos', cx + radius + 10, cy - 8)
      ctx.fillText('y = sin', cx + 6, cy - radius - 10)
      ctx.restore()
    }
  }

  useEffect(() => {
    const wrap = canvasWrapRef.current
    if (!wrap) return
    const resizeObserver = new ResizeObserver(() => drawRef.current())
    resizeObserver.observe(wrap)
    drawRef.current()
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    drawRef.current()
  }, [angleRad, showTan, showHints, cosValue, tanValue])

  return (
    <div className="unit-app">
      <div className="unit-shell">
        <header className="unit-header">
          <div>
            <p className="unit-kicker">Klasse 10 · NRW · Einheitskreis</p>
            <h1 className="unit-headline hud-font">Einheitskreis-Labor</h1>
            <p className="unit-subtitle">Winkel, Koordinaten und sin/cos/tan in einem Blick.</p>
          </div>
          <div className="unit-tabs">
            {(['entdecken', 'ueben', 'check'] as Mode[]).map((tab) => (
              <button
                key={tab}
                className={`unit-tab ${mode === tab ? 'active' : ''}`}
                onClick={() => setMode(tab)}
              >
                {tab === 'entdecken' && 'Entdecken'}
                {tab === 'ueben' && 'Üben'}
                {tab === 'check' && 'Check'}
              </button>
            ))}
          </div>
        </header>

        <section className="unit-grid">
          <div className="unit-panel">
            <h3 className="unit-title">Steuerung</h3>
            <div className="unit-control">
              <label className="unit-label">Winkel</label>
              <div className="unit-angle">
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={angleDeg}
                  onChange={(e) => updateAngle(Number(e.target.value))}
                />
                <div className="unit-angle__row">
                  <input
                    type="number"
                    min={0}
                    max={360}
                    step={1}
                    value={angleDeg}
                    onChange={(e) => updateAngle(Number(e.target.value))}
                  />
                  <span className="unit-angle__unit">°</span>
                </div>
                <div className="unit-angle__meta">
                  <span>Quadrant: {quadrant}</span>
                  {showRadians && (
                    <span>
                      Bogenmaß:{' '}
                      {radLabel ? `${radLabel} ≈ ${formatNumber(angleRad, 3)}` : formatNumber(angleRad, 3)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="unit-control">
              <label className="unit-label">Standardwinkel</label>
              <div className="unit-angles">
                {STANDARD_ANGLES.map((deg) => (
                  <button
                    key={deg}
                    className={`unit-chip ${Math.round(normalizedAngle) === deg ? 'active' : ''}`}
                    onClick={() => updateAngle(deg)}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            <div className="unit-control">
              <label className="unit-label">Anzeigen</label>
              <div className="unit-toggles">
                <button className={`unit-toggle ${showHints ? 'active' : ''}`} onClick={() => setShowHints(!showHints)}>
                  Hilfen {showHints ? 'an' : 'aus'}
                </button>
                <button className={`unit-toggle ${showExact ? 'active' : ''}`} onClick={() => setShowExact(!showExact)}>
                  Exakte Werte
                </button>
                <button className={`unit-toggle ${showTan ? 'active' : ''}`} onClick={() => setShowTan(!showTan)}>
                  Tangente
                </button>
                <button
                  className={`unit-toggle ${showRadians ? 'active' : ''}`}
                  onClick={() => setShowRadians(!showRadians)}
                >
                  Bogenmaß
                </button>
              </div>
            </div>

            <div className="unit-help">
              <p>
                <strong>Merke:</strong> sin = y, cos = x, tan = sin/cos.
              </p>
              <p>Ziehe den Punkt auf dem Kreis oder nutze die Slider.</p>
            </div>
          </div>

          <div className="unit-panel unit-canvas-panel">
            <div className="unit-canvas-wrap" ref={canvasWrapRef}>
              <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                  setDragging(true)
                  handlePointer(e)
                }}
                onPointerMove={(e) => dragging && handlePointer(e)}
                onPointerUp={() => setDragging(false)}
                onPointerLeave={() => setDragging(false)}
              />
              <div className="unit-canvas-label">
                θ = {Math.round(normalizedAngle)}°
                {showRadians && (
                  <span>{radLabel ? `${radLabel}` : formatNumber(angleRad, 3)} rad</span>
                )}
              </div>
            </div>
            <div className="unit-legend">
              <span className="legend-item sin">sin</span>
              <span className="legend-item cos">cos</span>
              <span className="legend-item tan">tan</span>
            </div>
          </div>

          <div className="unit-panel">
            <h3 className="unit-title">Live-Werte</h3>
            <div className="unit-values">
              <div className="unit-value-card">
                <p className="unit-label">x = cos</p>
                <p className="unit-value">{showExact && exact ? exact.cos : formatNumber(cosValue)}</p>
                {showExact && exact && <span className="unit-value__sub">≈ {formatNumber(cosValue)}</span>}
              </div>
              <div className="unit-value-card">
                <p className="unit-label">y = sin</p>
                <p className="unit-value">{showExact && exact ? exact.sin : formatNumber(sinValue)}</p>
                {showExact && exact && <span className="unit-value__sub">≈ {formatNumber(sinValue)}</span>}
              </div>
              <div className="unit-value-card">
                <p className="unit-label">tan</p>
                <p className="unit-value">
                  {showExact && exact ? exact.tan : tanValue === null ? 'undefiniert' : formatNumber(tanValue)}
                </p>
                {tanValue !== null && showExact && exact && (
                  <span className="unit-value__sub">≈ {formatNumber(tanValue)}</span>
                )}
                {tanValue === null && <span className="unit-value__sub">cos = 0</span>}
              </div>
            </div>

            <div className="unit-signs">
              <div>
                <span className="unit-label">Vorzeichen sin</span>
                <strong>{getSignLabel(sinValue)}</strong>
              </div>
              <div>
                <span className="unit-label">Vorzeichen cos</span>
                <strong>{getSignLabel(cosValue)}</strong>
              </div>
              <div>
                <span className="unit-label">Vorzeichen tan</span>
                <strong>{tanValue === null ? 'undef.' : getSignLabel(tanValue)}</strong>
              </div>
            </div>

            {showHints && (
              <div className="unit-warning">
                {tanValue === null
                  ? 'tan ist bei 90° und 270° undefiniert (cos = 0).'
                  : 'tan = sin/cos: Verhältnis von y und x.'}
              </div>
            )}
          </div>
        </section>

        <section className="unit-extra">
          {mode === 'entdecken' && (
            <div className="unit-panel unit-info">
              <h3 className="unit-title">Mini-Workflow für 45 Minuten</h3>
              <ol className="unit-flow">
                <li>3 Minuten: Punkt bewegen, sin/cos ablesen.</li>
                <li>10 Minuten: Standardwinkel anklicken, Werte raten.</li>
                <li>8 Minuten: tan aktivieren, Asymptoten besprechen.</li>
                <li>10 Minuten: Übungsmodus gemeinsam starten.</li>
              </ol>
            </div>
          )}

          {mode === 'ueben' && <QuizPanel title="Üben" tasks={PRACTICE_TASKS} accent="#38bdf8" />}
          {mode === 'check' && <QuizPanel title="Check" tasks={CHECK_TASKS} accent="#fbbf24" />}
        </section>
      </div>
    </div>
  )
}
