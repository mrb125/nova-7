import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const DATA = [
  [0, 250], [10, 220], [20, 202], [30, 175], [40, 170],
  [50, 145], [60, 128], [70, 121], [80, 110], [90, 99],
  [100, 84], [110, 75], [120, 70],
]

const INITIAL_VALUE = 250
const HALF_VALUE = INITIAL_VALUE / 2 // 125
const TARGET = 100

// True answers
const TRUE_HALFLIFE = 60 // ≈57-63 min acceptable
const TRUE_TIME = 90     // ≈88-95 min acceptable
const HALFLIFE_TOLERANCE = 8
const TIME_TOLERANCE = 6

// Sketch phase: calculate N(180) and 25% time using T½=60, N₀=250
// N(180) = 250 × (0.5)^(180/60) = 250 × (0.5)^3 = 31.25
const SKETCH_N180 = 31.25
const SKETCH_N180_TOLERANCE = 5
// 25% reached at t = 2 × T½ = 120 min
const SKETCH_T25 = 120
const SKETCH_T25_TOLERANCE = 8

const KEYWORDS = ['hälfte', 'zeitraum', 'zerfallen', 'exponentiell', 'proportional', 'kernanzahl', 'halbwertszeit']

export default function Level07({ state: _s, onComplete }: LevelProps) {
  const [halflifeGuess, setHalflifeGuess] = useState(60)
  const [timeGuess, setTimeGuess] = useState(90)
  const [phase, setPhase] = useState<'graph' | 'sketch' | 'justify' | 'feedback'>('graph')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  // Sketch phase inputs
  const [sketchN180, setSketchN180] = useState('')
  const [sketchT25, setSketchT25] = useState('')
  const [sketchSubmitted, setSketchSubmitted] = useState(false)
  const [sketchScore, setSketchScore] = useState(0)

  function handleGraphSubmit() { setPhase('sketch') }

  function handleSketchSubmit() {
    setSketchSubmitted(true)
    const n180Val = parseFloat(sketchN180.replace(',', '.'))
    const t25Val = parseFloat(sketchT25.replace(',', '.'))
    const n180Correct = !isNaN(n180Val) && Math.abs(n180Val - SKETCH_N180) <= SKETCH_N180_TOLERANCE
    const t25Correct = !isNaN(t25Val) && Math.abs(t25Val - SKETCH_T25) <= SKETCH_T25_TOLERANCE
    const score = (n180Correct ? 3 : 0) + (t25Correct ? 2 : 0)
    setSketchScore(score)
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const halflifeErr = Math.abs(halflifeGuess - TRUE_HALFLIFE)
    const timeErr = Math.abs(timeGuess - TRUE_TIME)

    const hlCorrect = halflifeErr <= HALFLIFE_TOLERANCE
    const tCorrect = timeErr <= TIME_TOLERANCE

    let wp = 0; let dos = 10
    if (hlCorrect && tCorrect) { wp = 10; dos = 0 }
    else if (hlCorrect || tCorrect) { wp = 5; dos = 5 }

    setWpResult(wp + score + sketchScore)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  // SVG graph dimensions
  const W = 500, H = 200
  const PAD = { top: 20, right: 20, bottom: 40, left: 50 }
  const maxT = 120, maxV = 260

  function xScale(t: number) { return PAD.left + (t / maxT) * (W - PAD.left - PAD.right) }
  function yScale(v: number) { return PAD.top + ((maxV - v) / maxV) * (H - PAD.top - PAD.bottom) }

  const pathD = DATA.map(([t, v], i) => `${i === 0 ? 'M' : 'L'} ${xScale(t)} ${yScale(v)}`).join(' ')

  const hlX = xScale(halflifeGuess)
  const hlY = yScale(HALF_VALUE)

  // Check sketch answers
  const n180Val = parseFloat(sketchN180.replace(',', '.'))
  const t25Val = parseFloat(sketchT25.replace(',', '.'))
  const n180Correct = !isNaN(n180Val) && Math.abs(n180Val - SKETCH_N180) <= SKETCH_N180_TOLERANCE
  const t25Correct = !isNaN(t25Val) && Math.abs(t25Val - SKETCH_T25) <= SKETCH_T25_TOLERANCE

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR ETA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Halbwertszeit bestimmt: ~{halflifeGuess} min. Sichere Zeit: ~{timeGuess} min. Schleuse zu Sektor THETA öffnet sich.
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Halbwertszeit + Zerfallsformel"
          text={`T½ ≈ ${TRUE_HALFLIFE} min (Ablesen: Strahlung fällt von 250 auf 125 mSv/h). N(t) = N₀ · (½)^(t/T½). N(180) = 250 · (½)³ ≈ 31 mSv/h. 25% erreicht bei t = 2·T½ = 120 min. Die Kurve ist exponentiell, weil die Aktivität A(t) proportional zur Anzahl N(t) der noch vorhandenen Kerne ist: A(t) = λ · N(t).`}
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { halflifeGuess, timeGuess, sketchN180, sketchT25 },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Graph', 'Formel']} current={phase === 'graph' ? 0 : 1} />
      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 100" className="w-full h-20 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          <rect x="30" y="10" width="540" height="80" rx="4" fill="#0c1a2e" stroke="#1e3a8a" strokeWidth="1" />
          <text x="300" y="40" textAnchor="middle" fill="#06b6d4" fontSize="12" fontFamily="monospace">STATIONSDATEN-TERMINAL</text>
          <text x="300" y="58" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">STRAHLUNGSMESSWERTE SEIT EXPLOSION</text>
          {[...Array(5)].map((_, i) => (
            <rect key={i} x={80 + i * 90} y="65" width="60" height="12" rx="2" fill="#1e3a8a" opacity="0.6" />
          ))}
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor ETA.</strong> Dr. Kern: „Berechne, wann die Strahlung unter 100 mSv fällt — erst dann ist der Weg zu mir frei."
        </p>
      </div>

      <AuraMessage
        message="Halbwertszeit: Der Zeitpunkt, wo die Aktivität auf 50% des Ausgangswertes gefallen ist. Lies ihn aus dem Graphen ab — dann rechne mit der Formel weiter."
        variant="info"
      />

      {phase === 'graph' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">MESSWERT-GRAPH</h3>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: '300px', maxHeight: '220px' }}>
              {/* Grid */}
              {[0, 50, 100, 150, 200, 250].map(v => (
                <g key={v}>
                  <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)} stroke="#1e293b" strokeWidth="1" />
                  <text x={PAD.left - 5} y={yScale(v) + 4} textAnchor="end" fill="#475569" fontSize="8">{v}</text>
                </g>
              ))}
              {[0, 30, 60, 90, 120].map(t => (
                <g key={t}>
                  <line x1={xScale(t)} y1={PAD.top} x2={xScale(t)} y2={H - PAD.bottom} stroke="#1e293b" strokeWidth="1" />
                  <text x={xScale(t)} y={H - PAD.bottom + 12} textAnchor="middle" fill="#475569" fontSize="8">{t}</text>
                </g>
              ))}
              <text x={W / 2} y={H - 5} textAnchor="middle" fill="#64748b" fontSize="9">Zeit (min)</text>
              <text x="10" y={H / 2} textAnchor="middle" fill="#64748b" fontSize="9" transform={`rotate(-90, 10, ${H / 2})`}>Sv</text>
              <line x1={PAD.left} y1={yScale(HALF_VALUE)} x2={W - PAD.right} y2={yScale(HALF_VALUE)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
              <text x={W - PAD.right + 2} y={yScale(HALF_VALUE) + 4} fill="#f59e0b" fontSize="7">{HALF_VALUE}</text>
              <line x1={PAD.left} y1={yScale(TARGET)} x2={W - PAD.right} y2={yScale(TARGET)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
              <text x={W - PAD.right + 2} y={yScale(TARGET) + 4} fill="#ef4444" fontSize="7">100</text>
              <path d={pathD} fill="none" stroke="#06b6d4" strokeWidth="2" />
              {DATA.map(([t, v]) => (
                <circle key={t} cx={xScale(t)} cy={yScale(v)} r="3" fill="#06b6d4" opacity="0.8" />
              ))}
              <circle cx={hlX} cy={hlY} r="6" fill="#f59e0b" opacity="0.8" />
              <line x1={hlX} y1={PAD.top} x2={hlX} y2={H - PAD.bottom} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
              <text x={hlX + 5} y={yScale(HALF_VALUE) - 5} fill="#f59e0b" fontSize="7">T½={halflifeGuess}</text>
            </svg>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-slate-300 hud-font">
                HALBWERTSZEIT (T½): <span className="text-yellow-400 font-bold">{halflifeGuess} min</span>
                <span className="text-xs text-slate-500 ml-2">(wo fällt Strahlung auf 125 Sv?)</span>
              </label>
              <input type="range" min={20} max={110} value={halflifeGuess} onChange={e => setHalflifeGuess(+e.target.value)}
                className="w-full mt-2 accent-yellow-400" />
            </div>
            <div>
              <label className="text-sm text-slate-300 hud-font">
                SICHERE ZEIT: <span className="text-red-400 font-bold">{timeGuess} min</span>
                <span className="text-xs text-slate-500 ml-2">(wo fällt Strahlung unter 100 Sv?)</span>
              </label>
              <input type="range" min={40} max={120} value={timeGuess} onChange={e => setTimeGuess(+e.target.value)}
                className="w-full mt-2 accent-red-400" />
            </div>
          </div>

          <button onClick={handleGraphSubmit}
            className="mt-4 w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            WERTE EINREICHEN → FORMEL ANWENDEN
          </button>
        </div>
      )}

      {phase === 'sketch' && (
        <div className="glass-panel p-5 space-y-5">
          {/* Formula box */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)' }}>
            <h3 className="hud-font text-purple-400 text-sm font-bold mb-3">📐 ZERFALLSFORMEL ANWENDEN</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-2">
              Du hast T½ ≈ <strong className="text-yellow-400">{halflifeGuess} min</strong> abgelesen.
              Nutze jetzt die Formel, um den Graphen über t = 120 min hinaus fortzusetzen:
            </p>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span className="text-white font-bold text-sm hud-font">
                N(t) = N₀ · (½)^(t / T½)
              </span>
              <div className="text-slate-400 text-xs mt-1">
                mit N₀ = 250 Sv, T½ = 60 min
              </div>
            </div>
          </div>

          {/* Task 1: N(180) */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
            <div className="text-xs hud-font text-cyan-400 mb-2">AUFGABE A — EXTRAPOLATION</div>
            <p className="text-sm text-slate-300 mb-1">
              Berechne N(180 min). Verwende T½ = 60 min und N₀ = 250 Sv.
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Tipp: Wie viele Halbwertszeiten passen in 180 min? Dann (½)^n.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sketchN180}
                onChange={e => setSketchN180(e.target.value)}
                disabled={sketchSubmitted}
                placeholder="Antwort in Sv"
                className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
              <span className="text-slate-400 text-sm hud-font">Sv</span>
            </div>
            {sketchSubmitted && (
              <p className="text-xs mt-2" style={{ color: n180Correct ? '#10b981' : '#ef4444' }}>
                {n180Correct
                  ? '✓ Korrekt! 250 · (½)³ = 250 · 0,125 ≈ 31 mSv/h'
                  : `✗ Erwartet: ≈ 31 mSv/h (250 · (½)^(180/60) = 250 · (½)³)`}
              </p>
            )}
          </div>

          {/* Task 2: 25% time */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
            <div className="text-xs hud-font text-cyan-400 mb-2">AUFGABE B — VIERTELWERTSZEIT</div>
            <p className="text-sm text-slate-300 mb-1">
              Nach wie vielen Minuten beträgt die Strahlung noch <strong className="text-white">25%</strong> des Ausgangswertes?
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Tipp: 25% = (½)² → Zwei Halbwertszeiten.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sketchT25}
                onChange={e => setSketchT25(e.target.value)}
                disabled={sketchSubmitted}
                placeholder="Antwort in min"
                className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
              <span className="text-slate-400 text-sm hud-font">min</span>
            </div>
            {sketchSubmitted && (
              <p className="text-xs mt-2" style={{ color: t25Correct ? '#10b981' : '#ef4444' }}>
                {t25Correct
                  ? '✓ Korrekt! 2 × T½ = 2 × 60 = 120 min'
                  : `✗ Erwartet: 120 min (2 × T½ = 2 × 60 min)`}
              </p>
            )}
          </div>

          {!sketchSubmitted ? (
            <button
              onClick={handleSketchSubmit}
              disabled={!sketchN180.trim() || !sketchT25.trim()}
              className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
              style={{ background: sketchN180.trim() && sketchT25.trim() ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : '#1e293b', border: '1px solid rgba(124,58,237,0.3)' }}>
              BERECHNUNGEN PRÜFEN
            </button>
          ) : (
            <button
              onClick={() => handleJustification('', 0)}
              className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
              WEITER ZUM ERGEBNIS → (+{sketchScore} WP)
            </button>
          )}
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkläre, was die Halbwertszeit beschreibt und warum die Kurve exponentiell abfällt."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
