import { useState } from 'react'
import type { LevelProps } from '../../pages/Game'
import AuraMessage from '../ui/AuraMessage'
import JustificationField from '../ui/JustificationField'
import FeedbackCard from '../ui/FeedbackCard'
import PhaseIndicator from '../ui/PhaseIndicator'

const ISOTOPES = [
  { id: 'tc99m', label: 'Tc-99m',  hl: '6 h',     emission: 'γ',      hint: 'Kurze HWZ, reine γ: ideal für bildgebende Diagnostik' },
  { id: 'i131',  label: 'I-131',   hl: '8 d',     emission: 'β⁻ + γ', hint: 'β⁻ zerstört lokales Gewebe → Therapie' },
  { id: 'f18',   label: 'F-18',    hl: '110 min', emission: 'β⁺',     hint: 'β⁺ → Annihilation → 2 × 511-keV-γ: PET' },
  { id: 'ra223', label: 'Ra-223',  hl: '11 d',    emission: 'α',      hint: 'α, kurze Reichweite: lokale Tumor-Therapie an Knochen' },
]

const USES = [
  { id: 'szinti',  label: 'Szintigraphie',              desc: 'Bildgebung durch detektierte γ-Quanten',             icon: '🔭', correct: 'tc99m' },
  { id: 'thyroid', label: 'Schilddrüsen-Therapie',       desc: 'Lokale Zerstörung von Schilddrüsengewebe',            icon: '🦋', correct: 'i131'  },
  { id: 'pet',     label: 'PET-Scan',                    desc: 'Tomographie durch Positronen-Annihilationsstrahlung', icon: '🧠', correct: 'f18'   },
  { id: 'bone',    label: 'Knochenmetastasen-Therapie',  desc: 'Lokale Bestrahlung ossärer Metastasen',               icon: '🦴', correct: 'ra223' },
]

const KEYWORDS = ['halbwertszeit', 'diagnostik', 'therapie', 'gamma', 'beta', 'alpha', 'szintigraphie', 'pet', 'isotop', 'tc-99m', 'schilddrüse', 'positron', 'annihilation']

export default function LevelNuklearmedizin({ state, onComplete }: LevelProps) {
  const isMia = state.characterId === 'mia'
  const [selections, setSelections] = useState<Record<string, string>>(
    Object.fromEntries(USES.map(u => [u.id, '']))
  )
  const [phase, setPhase] = useState<'match' | 'justify' | 'feedback'>('match')
  const [justText, setJustText] = useState('')
  const [wpResult, setWpResult] = useState(0)
  const [dosResult, setDosResult] = useState(0)

  const allSelected = Object.values(selections).every(v => v !== '')

  function handleConfirm() {
    let correct = 0
    for (const u of USES) if (selections[u.id] === u.correct) correct++
    const mcWP = correct === 4 ? 10 : correct === 3 ? 7 : correct === 2 ? 4 : correct === 1 ? 2 : 0
    const dos = correct >= 3 ? 0 : correct >= 2 ? 5 : 10
    setWpResult(mcWP)
    setDosResult(dos)
    setPhase('justify')
  }

  function handleJustification(text: string) {
    setJustText(text)
    setPhase('feedback')
  }

  const variant: 'best' | 'ok' | 'bad' = dosResult === 0 ? 'best' : dosResult <= 5 ? 'ok' : 'bad'

  if (phase === 'feedback') {
    return (
      <div className="space-y-4">
        <div className="glass-panel p-5">
          <h3 className="hud-font text-cyan-400 text-sm mb-2">SEKTOR IOTA — ABGESCHLOSSEN</h3>
          <p className="text-slate-300 text-sm">Isotop-Zuweisung erfolgreich. Radiopharmaka werden vorbereitet.</p>
        </div>
        <FeedbackCard
          title="Auswertung: Nuklearmedizin"
          text="Diagnostische Isotope: kurze HWZ, γ-Emission (Tc-99m für Szintigraphie, F-18 für PET via β⁺-Annihilation). Therapeutische Isotope: β⁻- oder α-Strahler mit lokaler Gewebewirkung (I-131 für Schilddrüse, Ra-223 für Knochenmetastasen). Entscheidend: Emissionstyp, Halbwertszeit und chemisches Verhalten im Körper."
          wpEarned={wpResult}
          dosimeterDelta={dosResult}
          variant={variant}
          hasJustification={!!justText}
          onNext={() => onComplete({
            wpEarned: wpResult,
            dosimeterDelta: dosResult,
            answers: { selections },
            justification: justText,
            justificationScore: 0,
          })}
        />
      </div>
    )
  }

  if (phase === 'justify') {
    return (
      <JustificationField
        question="Erkläre, nach welchen Kriterien (Emissionstyp, Halbwertszeit) man zwischen einem diagnostischen und einem therapeutischen Radioisotop unterscheidet."
        keywords={KEYWORDS}
        onSubmit={handleJustification}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PhaseIndicator steps={['Zuweisung']} current={0} />
      <div className="glass-panel p-5">
        <p className="text-slate-300 text-sm">
          <strong className="text-cyan-400">Sektor IOTA.</strong> AURA: „Radiopharmaka-Inventar: 4 Isotope, 4 Anwendungen. Weise jedem Behandlungsfall das richtige Isotop zu."
        </p>
      </div>

      {isMia && (
        <AuraMessage
          message="MIA-VORTEIL: Emissionstyp und Halbwertszeit aller Isotope sind für dich sichtbar."
          variant="success"
        />
      )}

      {/* Isotope reference panel */}
      <div className="glass-panel p-4">
        <div className="text-[10px] hud-font text-slate-500 mb-2">RADIOPHARMAKA-INVENTAR</div>
        <div className="grid grid-cols-2 gap-2">
          {ISOTOPES.map(iso => (
            <div
              key={iso.id}
              className="rounded-lg p-2"
              style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(100,116,139,0.2)' }}
            >
              <div className="text-cyan-400 font-bold text-sm hud-font">{iso.label}</div>
              <div className="text-slate-400 text-xs">T½ = {iso.hl} | {iso.emission}</div>
              {isMia && <div className="text-emerald-400 text-[10px] mt-1">{iso.hint}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="hud-font text-sm text-white mb-3">ISOTOP ZUWEISEN</h3>
        <div className="space-y-3 mb-4">
          {USES.map(use => (
            <div
              key={use.id}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}
            >
              <span className="text-2xl flex-shrink-0">{use.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold">{use.label}</div>
                <div className="text-slate-400 text-xs">{use.desc}</div>
              </div>
              <select
                value={selections[use.id]}
                onChange={e => setSelections(prev => ({ ...prev, [use.id]: e.target.value }))}
                className="bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1.5 text-white text-xs hud-font focus:outline-none focus:border-cyan-400 cursor-pointer flex-shrink-0"
                style={{ minWidth: '8rem' }}
              >
                <option value="">— Isotop —</option>
                {ISOTOPES.map(iso => (
                  <option key={iso.id} value={iso.id}>{iso.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <button
          onClick={handleConfirm}
          disabled={!allSelected}
          className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold disabled:opacity-30 cursor-pointer transition-all"
          style={{
            background: allSelected ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
            border: '1px solid rgba(6,182,212,0.3)',
          }}
        >
          ZUWEISUNG BESTÄTIGEN
        </button>
      </div>
    </div>
  )
}
