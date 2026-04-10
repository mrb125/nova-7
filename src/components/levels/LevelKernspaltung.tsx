import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const MC_OPTIONS = [
  { id: 'a', text: 'U-235 + n \u2192 Ba-141 + Kr-92 + 3n (Massenzahlen: 235+1 = 141+92+3 \u2713)', correct: true },
  { id: 'b', text: 'U-235 + n \u2192 Ba-141 + Kr-92 + 2n (Massenzahlen: 236 \u2260 235)', correct: false },
  { id: 'c', text: 'U-238 + n \u2192 Ba-141 + Kr-92 + 3n (U-238 ist nicht spaltbar)', correct: false },
]

const CALC_TASKS = [
  {
    id: 'energy',
    question: 'Bei einer Spaltung werden ca. 200 MeV freigesetzt. Wie viel Energie liefern 1000 Spaltungen (in MeV)?',
    answer: 200000,
    tolerance: 1000,
    unit: 'MeV',
  },
  {
    id: 'neutrons',
    question: 'Wenn jede Spaltung 3 Neutronen freisetzt: Wie viele Neutronen gibt es nach 4 Generationen? (Start: 1 Neutron, k=3)',
    answer: 81,
    tolerance: 0,
    unit: 'Neutronen',
  },
]

const KEYWORDS = ['spaltung', 'neutron', 'kettenreaktion', 'kritisch', 'steuerstab', 'moderator', 'uran', 'energie', 'spaltprodukt', 'multiplikation']

export default function LevelKernspaltung({ state: _s, onComplete }: LevelProps) {
  const [rodPosition, setRodPosition] = useState(50)
  const [mcAnswer, setMcAnswer] = useState('')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [calcSubmitted, setCalcSubmitted] = useState(false)
  const [phase, setPhase] = useState<'interactive' | 'mc' | 'calculate' | 'justify' | 'feedback'>('interactive')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  // k-factor based on rod position
  const kFactor = rodPosition <= 30 ? 2.5 : rodPosition <= 60 ? 1.5 : rodPosition <= 80 ? 1.0 : 0.5
  const kLabel = rodPosition <= 30
    ? '\u00dcBERKRITISCH \u26a0'
    : rodPosition <= 60
      ? 'LEICHT \u00dcBERKRITISCH'
      : rodPosition <= 80
        ? 'KRITISCH \u2713 STABIL'
        : 'UNTERKRITISCH'
  const kColor = rodPosition <= 30
    ? '#ef4444'
    : rodPosition <= 60
      ? '#eab308'
      : rodPosition <= 80
        ? '#22c55e'
        : '#06b6d4'

  function checkCalc(task: typeof CALC_TASKS[number], val: string) {
    const num = parseFloat(val.replace(',', '.'))
    return !isNaN(num) && Math.abs(num - task.answer) <= task.tolerance
  }

  function handleCalcSubmit() {
    setCalcSubmitted(true)
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const rodCorrect = rodPosition >= 60 && rodPosition <= 80
    const mcCorrect = MC_OPTIONS.find(o => o.id === mcAnswer)?.correct ?? false
    const calcCorrect = CALC_TASKS.filter(t => checkCalc(t, inputs[t.id] ?? '')).length

    const rodWP = rodCorrect ? 3 : 0
    const mcWP = mcCorrect ? 3 : 0
    const calcWP = calcCorrect * 2
    const wp = rodWP + mcWP + calcWP
    let dos = 10
    if (rodCorrect && mcCorrect && calcCorrect === 2) dos = 0
    else if ((rodCorrect || mcCorrect) && calcCorrect >= 1) dos = 5

    setWpResult(wp + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR LAMBDA \u2014 ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Reaktor stabilisiert. Kettenreaktion unter Kontrolle.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Kernspaltung & Kettenreaktion"
          text="U-235 + n \u2192 Ba-141 + Kr-92 + 3n + ~200 MeV. Massenzahl: 235+1 = 141+92+3\u00d71 = 236 \u2713. Ordnungszahl: 92 = 56+36 \u2713. Die 3 freigesetzten Neutronen k\u00f6nnen weitere Kerne spalten \u2192 Kettenreaktion. Steuerst\u00e4be (Cadmium/Bor) absorbieren \u00fcbersch\u00fcssige Neutronen. k=1: kontrollierte Kettenreaktion. Der Moderator (Wasser) bremst schnelle Neutronen auf thermische Geschwindigkeit, damit sie U-235 effizient spalten."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { rodPosition, mcAnswer, inputs },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Reaktor', 'Gleichung', 'Rechnung']} current={phase === 'interactive' ? 0 : phase === 'mc' ? 1 : 2} />
      <div className="glass-panel p-5">
        {/* Fission diagram */}
        <svg viewBox="0 0 600 140" className="w-full h-32 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Incoming neutron */}
          <circle cx="60" cy="70" r="5" fill="#06b6d4">
            <animate attributeName="cx" values="20;100" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="20" y="55" fill="#67e8f9" fontSize="8" fontFamily="monospace">n</text>

          {/* U-235 nucleus */}
          <circle cx="160" cy="70" r="30" fill="#1e1b4b" stroke="#7c3aed" strokeWidth="2">
            <animate attributeName="r" values="30;32;30" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <text x="160" y="74" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontFamily="monospace">U-235</text>

          {/* Arrow */}
          <line x1="200" y1="70" x2="250" y2="70" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#7c3aed" />
            </marker>
          </defs>

          {/* Fragment 1: Ba-141 */}
          <circle cx="310" cy="45" r="18" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
          <text x="310" y="49" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="monospace">Ba-141</text>

          {/* Fragment 2: Kr-92 */}
          <circle cx="310" cy="100" r="14" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
          <text x="310" y="104" textAnchor="middle" fill="#c4b5fd" fontSize="7" fontFamily="monospace">Kr-92</text>

          {/* 3 outgoing neutrons */}
          <circle cx="380" cy="30" r="4" fill="#06b6d4">
            <animate attributeName="cx" values="370;420" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="390" cy="70" r="4" fill="#06b6d4">
            <animate attributeName="cx" values="370;440" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="110" r="4" fill="#06b6d4">
            <animate attributeName="cx" values="370;420" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x="440" y="74" fill="#67e8f9" fontSize="8" fontFamily="monospace">3n</text>

          {/* Energy label */}
          <text x="500" y="70" textAnchor="middle" fill="#fbbf24" fontSize="9" fontFamily="monospace">+ ~200 MeV</text>

          {/* Bottom bar */}
          <rect x="0" y="125" width="600" height="15" fill="#030712" />
          <text x="300" y="135" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
            U-235 + n \u2192 Ba-141 + Kr-92 + 3n + Energie
          </text>
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor LAMBDA.</strong> AURA: &bdquo;Reaktor instabil! Verstehe die Kettenreaktion, um die Steuerst&auml;be korrekt zu positionieren.&ldquo;
        </p>
      </div>

      <AuraMessage
        message="Bei der Kernspaltung trifft ein Neutron auf U-235. Der Kern spaltet sich und setzt 2\u20133 neue Neutronen frei \u2192 Kettenreaktion. Der k-Faktor bestimmt: k<1 (unterkritisch), k=1 (kritisch, stabil), k>1 (\u00fcberkritisch, Kettenreaktion)."
        variant="warning"
      />

      {phase === 'interactive' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">STEUERSTAB-POSITION</h3>
          <div className="mb-2">
            <label className="text-sm text-slate-300 hud-font">
              POSITION: <span style={{ color: kColor, fontWeight: 'bold' }}>{rodPosition}%</span>
            </label>
            <input type="range" min={0} max={100} value={rodPosition} onChange={e => setRodPosition(+e.target.value)}
              className="w-full mt-2" style={{ accentColor: kColor }} />
          </div>
          <div className="rounded-lg p-3 mb-4 text-center"
            style={{
              background: `${kColor}15`,
              border: `1px solid ${kColor}50`,
            }}>
            <div className="hud-font text-sm font-bold" style={{ color: kColor }}>
              k = {kFactor.toFixed(1)} &mdash; {kLabel}
            </div>
            <div className="text-xs mt-1 text-slate-400">
              {rodPosition <= 30
                ? 'Zu wenig Absorption \u2014 unkontrollierte Kettenreaktion!'
                : rodPosition <= 60
                  ? 'Noch zu viele Neutronen \u2014 Reaktor wird schneller.'
                  : rodPosition <= 80
                    ? 'Genau 1 Neutron pro Spaltung l\u00f6st die n\u00e4chste aus \u2014 stabil!'
                    : 'Zu viel Absorption \u2014 Reaktor f\u00e4hrt herunter.'}
            </div>
          </div>
          <button onClick={() => setPhase('mc')}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            STEUERSTAB-POSITION BEST&Auml;TIGEN &rarr; FRAGEN
          </button>
        </div>
      )}

      {phase === 'mc' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="hud-font text-sm text-white">WELCHE SPALTGLEICHUNG IST KORREKT?</h3>
          <div className="space-y-2">
            {MC_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setMcAnswer(opt.id)}
                className="w-full text-left rounded-lg p-3 text-sm transition-all cursor-pointer"
                style={{
                  background: mcAnswer === opt.id ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                  border: mcAnswer === opt.id ? '1px solid rgba(6,182,212,0.5)' : '1px solid rgba(100,116,139,0.3)',
                  color: mcAnswer === opt.id ? '#67e8f9' : '#cbd5e1',
                }}
              >
                <span className="hud-font text-xs mr-2" style={{ color: mcAnswer === opt.id ? '#06b6d4' : '#64748b' }}>
                  {opt.id.toUpperCase()})
                </span>
                {opt.text}
              </button>
            ))}
          </div>
          <button onClick={() => setPhase('calculate')} disabled={!mcAnswer}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            ANTWORT EINREICHEN
          </button>
        </div>
      )}

      {phase === 'calculate' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="hud-font text-sm text-white">BERECHNUNGEN</h3>
          {CALC_TASKS.map((task, i) => (
            <div key={task.id} className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
              <div className="text-xs hud-font text-cyan-400 mb-1">AUFGABE {i + 1}</div>
              <div className="text-sm text-slate-300 mb-2">{task.question}</div>
              <div className="flex items-center gap-2">
                <input type="text" value={inputs[task.id] ?? ''} onChange={e => setInputs(p => ({ ...p, [task.id]: e.target.value }))}
                  disabled={calcSubmitted}
                  placeholder={`Antwort in ${task.unit}`}
                  className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400" />
                <span className="text-slate-400 text-sm hud-font">{task.unit}</span>
              </div>
            </div>
          ))}
          <button onClick={handleCalcSubmit} disabled={!CALC_TASKS.every(t => inputs[t.id]?.trim())}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            BERECHNUNGEN EINREICHEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Erkl\u00e4re die Kettenreaktion und die Rolle der Steuerst\u00e4be im Kernreaktor."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
