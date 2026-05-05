import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const COMPONENTS = [
  { id: 'fuel', name: 'Brennstab', icon: '\ud83d\udd25', options: ['Uran-235', 'Blei-206', 'Eisen-56', 'Helium-4'], correct: 'Uran-235' },
  { id: 'moderator', name: 'Moderator', icon: '\ud83d\udca7', options: ['Wasser', 'Blei', 'Vakuum', 'Stahl'], correct: 'Wasser' },
  { id: 'control', name: 'Steuerstab', icon: '\ud83c\udf9b\ufe0f', options: ['Cadmium/Bor', 'Aluminium', 'Kupfer', 'Gold'], correct: 'Cadmium/Bor' },
  { id: 'coolant', name: 'K\u00fchlmittel', icon: '\u2744\ufe0f', options: ['Wasser', 'Luft', '\u00d6l', 'Sand'], correct: 'Wasser' },
]

const CALC_TASKS = [
  {
    id: 'cs137',
    question: 'Cs-137 (T\u00bd = 30 Jahre): Nach wie vielen Jahren sind weniger als 1% \u00fcbrig? (Tipp: (\u00bd)\u207f < 0,01 \u2192 n \u2265 7)',
    answer: 210,
    tolerance: 5,
    unit: 'Jahre',
  },
  {
    id: 'pu239',
    question: 'Pu-239 (T\u00bd = 24.110 Jahre): Nach wie vielen Jahren unter 1%? (n \u2265 7 Halbwertszeiten)',
    answer: 168770,
    tolerance: 5000,
    unit: 'Jahre',
  },
]

const KEYWORDS = ['brennstab', 'moderator', 'steuerstab', 'k\u00fchlmittel', 'entsorgungsstation', 'spaltprodukt', 'halbwertszeit', 'plutonium', 'c\u00e4sium', 'neutron']

export default function LevelAtomkraftwerk({ state: _s, onComplete }: LevelProps) {
  const [selections, setSelections] = useState<Record<string, string>>(
    Object.fromEntries(COMPONENTS.map(c => [c.id, '']))
  )
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [calcSubmitted, setCalcSubmitted] = useState(false)
  const [phase, setPhase] = useState<'choose' | 'calculate' | 'justify' | 'feedback'>('choose')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  const allSelected = Object.values(selections).every(v => v !== '')

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

    const compCorrect = COMPONENTS.filter(c => selections[c.id] === c.correct).length
    const calcCorrect = CALC_TASKS.filter(t => checkCalc(t, inputs[t.id] ?? '')).length

    const wp = compCorrect * 2 + calcCorrect * 3
    let dos = 10
    if (compCorrect === 4 && calcCorrect === 2) dos = 0
    else if (compCorrect >= 2 && calcCorrect >= 1) dos = 5

    setWpResult(wp + score)
    setDosResult(dos)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR MU \u2014 ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Reaktor-Abschaltprotokoll abgeschlossen. Interstellare Entsorgungszeiten berechnet.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Kernkraftwerk & Interstellare Entsorgung"
          text="Reaktor: Brennstab (U-235, spaltbar), Moderator (Wasser, bremst Neutronen auf thermische Geschwindigkeit), Steuerstab (Cadmium/Bor, absorbiert Neutronen \u2192 k-Faktor regulieren), K\u00fchlmittel (Wasser, transportiert W\u00e4rme zum Turbinengenerator). Interstellare Entsorgung: Cs-137 (T\u00bd = 30 a) braucht 7 \u00d7 30 = 210 Jahre bis unter 1%. Pu-239 (T\u00bd = 24.110 a) braucht 7 \u00d7 24.110 \u2248 169.000 Jahre. Diese enormen Zeitr\u00e4ume zeigen, warum interstellare Entsorgung langfristige Abschirmung erfordert."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { selections, inputs },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Komponenten', 'Interstellare Entsorgung']} current={phase === 'choose' ? 0 : 1} />
      <div className="glass-panel p-5">
        {/* Reactor cross-section diagram */}
        <svg viewBox="0 0 600 160" className="w-full h-36 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
          {/* Reactor vessel outline */}
          <rect x="150" y="15" width="300" height="120" rx="10" fill="none" stroke="#475569" strokeWidth="2" />
          <text x="300" y="12" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">REAKTORDRUCKBEH\u00c4LTER</text>

          {/* Fuel rods */}
          <rect x="190" y="35" width="12" height="80" rx="2" fill="#dc2626" opacity="0.8" />
          <rect x="210" y="35" width="12" height="80" rx="2" fill="#dc2626" opacity="0.8" />
          <rect x="230" y="35" width="12" height="80" rx="2" fill="#dc2626" opacity="0.8" />
          <text x="215" y="130" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">Brennst\u00e4be</text>

          {/* Control rods */}
          <rect x="270" y="25" width="8" height="70" rx="2" fill="#6366f1" opacity="0.8">
            <animate attributeName="height" values="70;50;70" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="290" y="25" width="8" height="70" rx="2" fill="#6366f1" opacity="0.8">
            <animate attributeName="height" values="70;50;70" dur="3s" repeatCount="indefinite" begin="0.5s" />
          </rect>
          <text x="284" y="130" textAnchor="middle" fill="#a5b4fc" fontSize="7" fontFamily="monospace">Steuerst\u00e4be</text>

          {/* Moderator / water fill */}
          <rect x="155" y="20" width="290" height="110" rx="7" fill="#0ea5e9" opacity="0.08" />
          <text x="380" y="50" fill="#7dd3fc" fontSize="7" fontFamily="monospace">Moderator</text>
          <text x="380" y="60" fill="#7dd3fc" fontSize="7" fontFamily="monospace">(Wasser)</text>

          {/* Coolant arrows */}
          <line x1="460" y1="75" x2="520" y2="75" stroke="#06b6d4" strokeWidth="2" markerEnd="url(#coolArrow)" />
          <defs>
            <marker id="coolArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" />
            </marker>
          </defs>
          <text x="530" y="70" fill="#67e8f9" fontSize="7" fontFamily="monospace">K\u00fchlmittel</text>
          <text x="530" y="82" fill="#67e8f9" fontSize="7" fontFamily="monospace">\u2192 Turbine</text>

          {/* Bottom label */}
          <rect x="0" y="145" width="600" height="15" fill="#030712" />
          <text x="300" y="155" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
            Kernreaktor \u2014 Druckwasserreaktor (Schema)
          </text>
        </svg>
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor MU.</strong> AURA: &bdquo;Reaktor-Abschaltprotokoll. Identifiziere die Komponenten und berechne die Wartezeit bis zur interstellaren Entsorgung.&ldquo;
        </p>
      </div>

      <AuraMessage
        message="Ein Kernreaktor braucht: Brennstoff (spaltbares Material), Moderator (bremst Neutronen), Steuerst\u00e4be (absorbieren Neutronen, kontrollieren Reaktion), K\u00fchlmittel (f\u00fchrt W\u00e4rme ab)."
        variant="info"
      />

      {phase === 'choose' && (
        <div className="glass-panel p-5">
          <h3 className="hud-font text-sm text-white mb-3">REAKTOR-KOMPONENTEN IDENTIFIZIEREN</h3>
          <div className="space-y-3 mb-4">
            {COMPONENTS.map(comp => (
              <div
                key={comp.id}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}
              >
                <span className="text-2xl flex-shrink-0">{comp.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold">{comp.name}</div>
                </div>
                <select
                  value={selections[comp.id]}
                  onChange={e => setSelections(prev => ({ ...prev, [comp.id]: e.target.value }))}
                  className="bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1.5 text-white text-xs hud-font focus:outline-none focus:border-cyan-400 cursor-pointer flex-shrink-0"
                  style={{ minWidth: '8rem' }}
                >
                  <option value="">\u2014 Material \u2014</option>
                  {comp.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase('calculate')}
            disabled={!allSelected}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
            style={{
              background: allSelected ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            AUSWAHL BEST&Auml;TIGEN &rarr; BERECHNEN
          </button>
        </div>
      )}

      {phase === 'calculate' && (
        <div className="glass-panel p-5 space-y-4">
          <div className="rounded-lg p-3 mb-2"
            style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
            <div className="text-xs hud-font text-yellow-400 mb-1">HINTERGRUND</div>
            <div className="text-sm text-slate-300">
              Radioaktiver Abfall wird zur interstellaren Entsorgungsstation verschickt. Bis zum Transport muss die Aktivit&auml;t unter 1% fallen &mdash; berechne die Wartezeit.
            </div>
          </div>
          <h3 className="hud-font text-sm text-white">WARTEZEIT BIS INTERSTELLARE ENTSORGUNG BERECHNEN</h3>
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
          question="Erkl\u00e4re die Funktion der Reaktorkomponenten und warum die interstellare Entsorgung radioaktiven Abfalls eine Herausforderung ist."
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
