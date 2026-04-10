import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

// Inside: 1200 impulses in 10 min = 120/min = 2 Bq
// Outside: 30600 in 3 min = 10200/min
// Difference: 10080/min

const CALC_TASKS = [
  {
    id: 'inside',
    question: 'Aktivität INNEN (Impulse/min)? Gemessen: 1200 Impulse in 10 min.',
    answer: 120,
    tolerance: 1,
    unit: 'I/min',
  },
  {
    id: 'outside',
    question: 'Aktivität AUSSEN (Impulse/min)? Gemessen: 30.600 Impulse in 3 min.',
    answer: 10200,
    tolerance: 50,
    unit: 'I/min',
  },
  {
    id: 'diff',
    question: 'Differenz (wie viel mehr Strahlung draußen pro Minute)?',
    answer: 10080,
    tolerance: 50,
    unit: 'I/min',
  },
]

const MC_OPTIONS = [
  { id: 'yes', text: 'Ja — der Bunker reduziert Strahlung um Faktor ≈ 85 → sicher', correct: true },
  { id: 'no', text: 'Nein — der Unterschied ist zu gering', correct: false },
]

// Äquivalentdosis-Phase: 120 I/min ÷ 60 = 2 Bq (Becquerel)
const SV_MC_OPTIONS = [
  {
    id: 'a',
    text: 'H = 2 µSv/h — γ-Strahlung hat w_R = 1, also H = D × 1 = 2 µGy/h × 1',
    correct: true,
  },
  {
    id: 'b',
    text: 'H = 40 µSv/h — γ-Strahlung wird mit Faktor 20 gewichtet',
    correct: false,
  },
  {
    id: 'c',
    text: 'H = 0 — Gamma-Strahlung hat keinen biologischen Effekt',
    correct: false,
  },
]

const KEYWORDS = ['faktor', 'reduktion', 'abschirmung', 'beton', 'sicher', 'grenzwert', 'differenz', 'verhältnis', 'becquerel', 'sievert']

export default function Level12({ state: _s, onComplete }: LevelProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [calcSubmitted, setCalcSubmitted] = useState(false)
  const [mcAnswer, setMcAnswer] = useState<string | null>(null)

  // Sievert phase
  const [svBqInput, setSvBqInput] = useState('')
  const [svMcAnswer, setSvMcAnswer] = useState<string | null>(null)
  const [svScore, setSvScore] = useState(0)
  const [svSubmitted, setSvSubmitted] = useState(false)

  const [phase, setPhase] = useState<'calculate' | 'mc' | 'sievert' | 'justify' | 'feedback'>('calculate')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)
  function checkCalc(id: string, val: string) {
    const task = CALC_TASKS.find(t => t.id === id)!
    const num = parseFloat(val.replace(',', '.').replace('.', ''))
    const numClean = parseFloat(val.replace(',', '.'))
    const check = (n: number) => Math.abs(n - task.answer) <= task.tolerance
    return check(numClean) || check(num)
  }

  function handleCalcSubmit() {
    setCalcSubmitted(true)
    setPhase('mc')
  }

  function handleMcSubmit() { setPhase('sievert') }

  function handleSvSubmit() {
    setSvSubmitted(true)
    const bqVal = parseFloat(svBqInput.replace(',', '.'))
    const bqCorrect = !isNaN(bqVal) && Math.abs(bqVal - 2) <= 0.2
    const mcSvCorrect = SV_MC_OPTIONS.find(o => o.id === svMcAnswer)?.correct ?? false
    setSvScore((bqCorrect ? 2 : 0) + (mcSvCorrect ? 2 : 0))
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const correct = CALC_TASKS.filter(t => checkCalc(t.id, inputs[t.id] ?? '')).length
    const mcCorrect = MC_OPTIONS.find(o => o.id === mcAnswer)?.correct ?? false

    let wp = 0; let dos = 10
    if (correct === 3 && mcCorrect) { wp = 10; dos = 0 }
    else if (correct >= 2 && mcCorrect) { wp = 7; dos = 5 }
    else if (correct >= 1 || mcCorrect) { wp = 3; dos = 5 }

    setWpResult(wp + score + svScore)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'
  const allFilled = CALC_TASKS.every(t => inputs[t.id]?.trim())
  const svAllFilled = svBqInput.trim() && svMcAnswer

  const bqVal = parseFloat(svBqInput.replace(',', '.'))
  const bqCorrect = !isNaN(bqVal) && Math.abs(bqVal - 2) <= 0.2

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR MU — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            Sicherheitscheck bestanden. Evakuierungskapsel freigegeben. Dr. Kern gerettet! 🎉
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Finale Messung + Dosimetrie"
          text="Innen: 120 I/min ÷ 60 = 2 Bq (Zerfälle pro Sekunde). Außen: 10.200 I/min ÷ 60 = 170 Bq. Reduktion: Faktor ~85 → Bunker bietet effektive Abschirmung. Hinweis: Impulse am Zähler ≈ Aktivität (vereinfacht, echte Detektionseffizienz < 100%). Äquivalentdosis H = D × w_R: Für γ gilt w_R = 1, für α (intern) w_R = 20. Grenzwert Bevölkerung: 1 mSv/Jahr, Strahlenberufe: 20 mSv/Jahr."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { inputs, mcAnswer, svBqInput, svMcAnswer },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Messung', 'Entscheidung', 'Dosimetrie']} current={phase === 'calculate' ? 0 : phase === 'mc' ? 1 : 2} />
      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 160" className="w-full h-36 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Evac capsule dock */}
          <rect x="30" y="20" width="540" height="120" rx="10" fill="#030712" stroke="#06b6d4" strokeWidth="2" />
          {/* Capsule */}
          <ellipse cx="480" cy="80" rx="60" ry="35" fill="#1e3a8a" stroke="#06b6d4" strokeWidth="2" />
          <text x="480" y="78" textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace">KAPSEL</text>
          <text x="480" y="91" textAnchor="middle" fill="#06b6d4" fontSize="7" fontFamily="monospace">BEREIT</text>
          {/* Stars */}
          {[...Array(20)].map((_, i) => (
            <circle key={i} cx={50 + i * 25} cy={15 + (i % 5) * 8} r="1" fill="white" opacity={0.5} />
          ))}
          {/* Dr. Kern figure */}
          <circle cx="150" cy="80" r="12" fill="#374151" />
          <circle cx="150" cy="64" r="9" fill="#4b5563" />
          <text x="150" y="110" textAnchor="middle" fill="#10b981" fontSize="8">Dr. Kern</text>
          {/* Security door */}
          <rect x="280" y="30" width="20" height="100" rx="2" fill="#1e293b" stroke="#7c3aed" strokeWidth="2" />
          <text x="290" y="85" textAnchor="middle" fill="#7c3aed" fontSize="7" fontFamily="monospace" transform="rotate(-90,290,85)">GESPERRT</text>
          {/* AURA interface */}
          <circle cx="450" cy="28" r="15" fill="#0c1445" stroke="#06b6d4" strokeWidth="1" />
          <text x="450" y="31" textAnchor="middle" fill="#06b6d4" fontSize="8">AURA</text>
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor MU.</strong> AURA: „Letzte Sicherheitsprüfung. Vergleiche Strahlenwerte innen und außen — und bestimme die Äquivalentdosis."
          Dr. Kern winkt durch das Glas. Nur korrekte Berechnungen öffnen die Schleuse.
        </p>
      </div>

      <AuraMessage
        message="Berechne: Aktivität innen (I/min), Aktivität außen (I/min), dann die Differenz. Danach: Einheiten der Dosimetrie (Bq und Sv)."
        variant="info"
      />

      {phase === 'calculate' && (
        <div className="glass-panel p-5 space-y-4">
          <h3 className="hud-font text-sm text-white">STRAHLUNGSMESSUNG</h3>
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
          <button onClick={handleCalcSubmit} disabled={!allFilled}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: allFilled ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            BERECHNUNGEN EINREICHEN
          </button>
        </div>
      )}

      {phase === 'mc' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-4">Empfiehlst du die Evakuierung jetzt?</h3>
          <div className="space-y-2 mb-4">
            {MC_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => setMcAnswer(opt.id)}
                className="w-full p-3 rounded-lg text-left transition-all cursor-pointer"
                style={{
                  background: mcAnswer === opt.id ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.6)',
                  border: `1px solid ${mcAnswer === opt.id ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.3)'}`,
                }}>
                <span className="text-slate-300 text-sm">{opt.text}</span>
              </button>
            ))}
          </div>
          <button onClick={handleMcSubmit} disabled={!mcAnswer}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: mcAnswer ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            ENTSCHEIDUNG TREFFEN
          </button>
        </div>
      )}

      {phase === 'sievert' && (
        <div className="glass-panel p-5 space-y-5">
          {/* Info box: Bq und Sv */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <h3 className="hud-font text-cyan-400 text-sm font-bold mb-3">☢ DOSIMETRIE-EINHEITEN</h3>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="flex gap-2">
                <span className="text-cyan-400 font-bold w-28 flex-shrink-0">Becquerel (Bq)</span>
                <span>= 1 Zerfall pro Sekunde. Einheit der <em>Aktivität A</em>. A = Impulse / Δt (in Sekunden).</span>
              </div>
              <div className="flex gap-2">
                <span className="text-yellow-400 font-bold w-28 flex-shrink-0">Sievert (Sv)</span>
                <span>= Einheit der <em>Äquivalentdosis H</em>. Berücksichtigt biologische Wirkung. H = D × w_R</span>
              </div>
              <div className="flex gap-2">
                <span className="text-purple-400 font-bold w-28 flex-shrink-0">Wichtungsfaktor w_R</span>
                <span>γ, β: w_R = <strong className="text-white">1</strong> · · · α: w_R = <strong className="text-white">20</strong> (20× gefährlicher intern!)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-400 font-bold w-28 flex-shrink-0">Grenzwerte</span>
                <span>Bevölkerung: 1 mSv/Jahr · Berufsexponierte: 20 mSv/Jahr</span>
              </div>
            </div>
          </div>

          {/* Task 1: Bq Umrechnung */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
            <div className="text-xs hud-font text-cyan-400 mb-2">AUFGABE 4 — AKTIVITÄT IN BECQUEREL</div>
            <p className="text-sm text-slate-300 mb-1">
              Die Innen-Messung ergab <strong className="text-white">120 Impulse/min</strong>.
              Wandle das in Becquerel (Bq) um.
            </p>
            <p className="text-xs text-slate-500 mb-3">Hinweis: 1 Bq = 1 Zerfall/s — teile also durch 60.</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={svBqInput}
                onChange={e => setSvBqInput(e.target.value)}
                disabled={svSubmitted}
                placeholder="Antwort in Bq"
                className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
              <span className="text-slate-400 text-sm hud-font">Bq</span>
            </div>
            {svSubmitted && (
              <p className="text-xs mt-2" style={{ color: bqCorrect ? '#10b981' : '#ef4444' }}>
                {bqCorrect ? '✓ Korrekt! 120 ÷ 60 = 2 Bq' : `✗ Erwartet: 2 Bq (120 ÷ 60)`}
              </p>
            )}
          </div>

          {/* Task 2: Äquivalentdosis MC */}
          <div className="rounded-lg p-4" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.3)' }}>
            <div className="text-xs hud-font text-cyan-400 mb-2">AUFGABE 5 — ÄQUIVALENTDOSIS</div>
            <p className="text-sm text-slate-300 mb-3">
              Die Gammastrahlung im Bunker erzeugt eine Energiedosis von <strong className="text-white">D = 2 µGy/h</strong>.
              Wie groß ist die Äquivalentdosis H?
            </p>
            <div className="space-y-2">
              {SV_MC_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => !svSubmitted && setSvMcAnswer(opt.id)}
                  className="w-full p-3 rounded-lg text-left transition-all cursor-pointer"
                  style={{
                    background: svMcAnswer === opt.id ? 'rgba(6,182,212,0.15)' : 'rgba(15,23,42,0.4)',
                    border: `1px solid ${svMcAnswer === opt.id ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.2)'}`,
                    opacity: svSubmitted && svMcAnswer !== opt.id ? 0.5 : 1,
                  }}>
                  <span className="text-slate-300 text-sm">{opt.text}</span>
                  {svSubmitted && svMcAnswer === opt.id && (
                    <span className="ml-2" style={{ color: opt.correct ? '#10b981' : '#ef4444' }}>
                      {opt.correct ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {svSubmitted && !SV_MC_OPTIONS.find(o => o.id === svMcAnswer)?.correct && (
              <p className="text-xs text-emerald-400 mt-2">✓ Richtig wäre: H = 2 µSv/h (w_R = 1 für γ)</p>
            )}
          </div>

          <button onClick={handleSvSubmit} disabled={!svAllFilled || svSubmitted}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{ background: svAllFilled && !svSubmitted ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b', border: '1px solid rgba(6,182,212,0.3)' }}>
            {svSubmitted ? 'WEITER → ERGEBNIS' : 'DOSIMETRIE AUSWERTEN'}
          </button>
          {svSubmitted && (
            <button onClick={() => handleJustification('', 0)}
              className="w-full py-2 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
              WEITER ZUM ERGEBNIS →
            </button>
          )}
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Was sagen diese Messwerte über die Abschirmwirkung des Bunkers aus? Nutze die Begriffe Aktivität (Bq) und Äquivalentdosis (Sv)."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
