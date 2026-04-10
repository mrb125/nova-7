import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const PROBES = [
  { id: 'alpha', label: 'Probe α', subtitle: 'Americium-241', color: '#f59e0b', icon: 'α' },
  { id: 'beta', label: 'Probe β', subtitle: 'Strontium-90', color: '#8b5cf6', icon: 'β' },
  { id: 'gamma', label: 'Probe γ', subtitle: 'Cobalt-60', color: '#06b6d4', icon: 'γ' },
]

const MATERIALS = [
  { id: 'paper', name: 'Papier', icon: '📄', correctFor: 'alpha' },
  { id: 'aluminium', name: 'Aluminium', icon: '🔩', correctFor: 'beta' },
  { id: 'lead', name: 'Blei', icon: '🧱', correctFor: 'gamma' },
  { id: 'plexiglas', name: 'Plexiglas', icon: '🪟', correctFor: null },
  { id: 'wood', name: 'Holz', icon: '🪵', correctFor: null },
]

const KEYWORDS = ['ionisierungsvermögen', 'durchdringungsvermögen', 'masse', 'ladung', 'wechselwirkung', 'reichweite', 'heliumkern', 'elektron']

export default function Level02({ state: _s, onComplete }: LevelProps) {
  const [assignments, setAssignments] = useState<Record<string, string>>({ alpha: '', beta: '', gamma: '' })
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [phase, setPhase] = useState<'drag' | 'justify' | 'feedback'>('drag')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)
  const [justText, setJustText] = useState('')
  const [justScore, setJustScore] = useState(0)

  function handleDrop(probeId: string, materialId: string) {
    if (submitted) return
    setAssignments(prev => ({ ...prev, [probeId]: materialId }))
    setDragOver(null)
  }

  function handleSubmit() {
    setSubmitted(true)
    setPhase('justify')
  }

  function handleJustification(text: string, score: number) {
    setJustText(text)
    setJustScore(score)

    const correct = PROBES.filter(p => {
      const mat = MATERIALS.find(m => m.id === assignments[p.id])
      return mat?.correctFor === p.id
    }).length

    let equipWP = 0
    let dos = 10
    if (correct === 3) { equipWP = 10; dos = 0 }
    else if (correct === 2) { equipWP = 6; dos = 5 }
    else if (correct === 1) { equipWP = 3; dos = 5 }
    else { equipWP = 0; dos = 10 }

    const total = equipWP + score
    setWpResult(total)
    setDosResult(dos)
    setPhase('feedback')
  }

  const allAssigned = Object.values(assignments).every(v => v !== '')
  const correctCount = PROBES.filter(p => {
    const mat = MATERIALS.find(m => m.id === assignments[p.id])
    return mat?.correctFor === p.id
  }).length
  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR BETA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">
            {correctCount === 3
              ? 'Alle Proben korrekt abgeschirmt. AURA: „Gut gemacht. Schleuse zu Sektor GAMMA öffnet sich."'
              : `${correctCount} von 3 Proben korrekt zugeordnet. Einige Strahlung entweicht.`}
          </p>
        </div>
        <FeedbackCard
          title="Auswertung: Abschirmmaterialien"
          text="α-Strahlung (Heliumkerne, große Masse + doppelte Ladung) wechselwirkt stark mit Materie → viele Ionisationen auf kurzem Weg → Papier reicht. β-Strahlung (Elektronen, kleine Masse) hat weniger Wechselwirkungen pro Strecke → penetriert weiter → Aluminium nötig. γ-Strahlung (Photonen, keine Ladung, keine Masse) wechselwirkt nur selten → durchdringt fast alles → dichtes Blei oder dicker Beton erforderlich. Merke: Je größer Masse und Ladung, desto kürzer die Reichweite."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { assignments },
            justification: justText,
            justificationScore: justScore,
          })}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Zuordnen']} current={0} />

      {/* Scene */}
      <div className="glass-panel p-5">
        <svg viewBox="0 0 600 150" className="w-full h-28 mb-4 rounded-lg" style={{ background: 'linear-gradient(135deg, #030712, #0f172a)' }}>
          {/* Lab shelves */}
          <rect x="50" y="30" width="500" height="8" rx="2" fill="#1e3a8a" opacity="0.8" />
          <rect x="50" y="110" width="500" height="8" rx="2" fill="#1e3a8a" opacity="0.8" />
          {/* Floating probes */}
          {PROBES.map((p, i) => (
            <g key={p.id} transform={`translate(${130 + i * 150}, 50)`}>
              <ellipse cx="0" cy="0" rx="30" ry="40" fill={`${p.color}20`} stroke={p.color} strokeWidth="1.5">
                <animate attributeName="ry" values="40;35;40" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              </ellipse>
              <text x="0" y="5" textAnchor="middle" fill={p.color} fontSize="16" fontWeight="bold">{p.icon}</text>
              <circle cx="0" cy="0" r="45" fill="none" stroke={p.color} strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          <text x="300" y="140" textAnchor="middle" fill="#475569" fontSize="9" fontFamily="monospace">SCHWERELOSIGKEITS-HALTERUNGEN AKTIV</text>
        </svg>
        <p className="text-slate-300 text-sm leading-relaxed">
          <strong className="text-cyan-400">Sektor BETA.</strong> Schwebende Isotopbehälter in Anti-Gravitations-Halterungen.
          AURA: „Die Abschirmboxen sind offen. Ziehe das richtige Material auf jede Probe — bevor die Strahlung den Sektor kontaminiert."
        </p>
      </div>

      <AuraMessage
        message="Jede Strahlungsart hat ein anderes Durchdringungsvermögen. Welches Material eignet sich für welche Strahlung?"
        variant="info"
      />

      {phase === 'drag' && (
        <div className="glass-panel p-5 space-y-6">
          <h3 className="hud-font text-sm text-white mb-2">ABSCHIRMUNG ZUORDNEN</h3>

          {/* Material palette */}
          <div>
            <div className="text-slate-400 text-xs hud-font mb-2">VERFÜGBARE MATERIALIEN — drag onto probe:</div>
            <div className="flex gap-2 flex-wrap">
              {MATERIALS.map(mat => (
                <div
                  key={mat.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('materialId', mat.id)}
                  className="px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-2 text-sm"
                  style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(100,116,139,0.3)' }}
                >
                  <span>{mat.icon}</span>
                  <span className="text-slate-300">{mat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Drop zones */}
          <div className="grid grid-cols-3 gap-3">
            {PROBES.map(probe => {
              const assigned = MATERIALS.find(m => m.id === assignments[probe.id])
              return (
                <div
                  key={probe.id}
                  onDragOver={e => { e.preventDefault(); setDragOver(probe.id) }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => { e.preventDefault(); handleDrop(probe.id, e.dataTransfer.getData('materialId')) }}
                  className="rounded-xl p-4 text-center transition-all min-h-[120px] flex flex-col items-center justify-center"
                  style={{
                    border: `2px dashed ${dragOver === probe.id ? probe.color : assigned ? `${probe.color}60` : 'rgba(100,116,139,0.3)'}`,
                    background: dragOver === probe.id ? `${probe.color}15` : assigned ? `${probe.color}08` : 'rgba(15,23,42,0.4)',
                  }}
                >
                  <div className="text-2xl font-black mb-1" style={{ color: probe.color }}>{probe.icon}</div>
                  <div className="text-white text-sm font-semibold">{probe.label}</div>
                  <div className="text-xs mb-2" style={{ color: probe.color }}>{probe.subtitle}</div>
                  {assigned ? (
                    <div className="px-2 py-1 rounded text-xs flex items-center gap-1"
                      style={{ background: `${probe.color}20`, border: `1px solid ${probe.color}40`, color: probe.color }}>
                      {assigned.icon} {assigned.name}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs">Material hierher ziehen</div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allAssigned}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold transition-all disabled:opacity-30 cursor-pointer"
            style={{
              background: allAssigned ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            ABSCHIRMUNG BESTÄTIGEN
          </button>
        </div>
      )}

      {phase === 'justify' && (
        <JustificationField
          question="Warum benötigt Gamma-Strahlung Blei als Abschirmung, während Alpha-Strahlung schon durch Papier gestoppt wird?"
          keywords={KEYWORDS}
          onSubmit={handleJustification}
        />
      )}
    </div>
  )
}
