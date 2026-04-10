import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ---------------------------------------------------------------------------
// Formula data
// ---------------------------------------------------------------------------

interface Formula {
  name: string
  formula: string
  note?: string
}

interface FormulaCategory {
  id: string
  label: string
  icon: string
  formulas: Formula[]
}

const FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    id: 'strahlung',
    label: 'Strahlenarten',
    icon: '\u2622\uFE0F',
    formulas: [
      {
        name: 'Alpha-Strahlung (\u03B1)',
        formula: '\u2074\u2082He-Kern | Ladung: +2e | Masse: gro\u00DF',
        note: 'Gestoppt durch Papier oder Haut. Intern sehr gef\u00E4hrlich!',
      },
      {
        name: 'Beta-minus-Strahlung (\u03B2\u207B)',
        formula: 'e\u207B | Ladung: \u22121e | Masse: sehr klein',
        note: 'Gestoppt durch Aluminium (~3 mm)',
      },
      {
        name: 'Gamma-Strahlung (\u03B3)',
        formula: 'Photon | Ladung: 0 | keine Ruhemasse',
        note: 'Stark durchdringend \u2192 Blei / dicker Beton n\u00F6tig',
      },
      {
        name: 'Vergleich Durchdringung',
        formula: '\u03B1 < \u03B2 < \u03B3',
        note: 'Alpha kaum, Gamma sehr stark durchdringend',
      },
    ],
  },
  {
    id: 'zerfall',
    label: 'Zerfall',
    icon: '\u269B\uFE0F',
    formulas: [
      {
        name: '\u03B1-Zerfall (allgemein)',
        formula: '\u1D2B\u209A X \u2192 \u1D2B\u207B\u2074\u209A\u208B\u2082 Y + \u2074\u2082He',
        note: 'Ordnungszahl \u22122, Massenzahl \u22124',
      },
      {
        name: '\u03B2\u207B-Zerfall (allgemein)',
        formula: '\u1D2B\u209A X \u2192 \u1D2B\u209A\u208A\u2081 Y + e\u207B + \u03BD\u0305\u2091',
        note: 'Ordnungszahl +1, Massenzahl unver\u00E4ndert',
      },
      {
        name: 'Zerfallsgesetz',
        formula: 'N(t) = N\u2080 \u00B7 (\u00BD)\u207F',
        note: 'n = t / T\u00BD',
      },
      {
        name: 'Allgemeine Exponentialform',
        formula: 'N(t) = N\u2080 \u00B7 e^(\u2212\u03BBt)',
        note: '\u03BB = ln(2) / T\u00BD \u2248 0,693 / T\u00BD (Zerfallskonstante). Beide Formen sind \u00E4quivalent: (\u00BD)^(t/T\u00BD) = e^(\u2212\u03BBt)',
      },
      {
        name: 'Aktivit\u00E4t',
        formula: 'A(t) = A\u2080 \u00B7 (\u00BD)^(t / T\u00BD) = \u03BB \u00B7 N(t)',
        note: 'Die Aktivit\u00E4t ist proportional zur Kernanzahl: A = \u03BB\u00B7N',
      },
      {
        name: 'Einheit Aktivit\u00E4t',
        formula: '[A] = Becquerel (Bq) = s\u207B\u00B9',
        note: 'Hinweis: Impulse/s am Z\u00E4hler \u2260 exakte Aktivit\u00E4t. Die Z\u00E4hlrate h\u00E4ngt von Detektionseffizienz und Abstand ab.',
      },
    ],
  },
  {
    id: 'halbwertszeit',
    label: 'Halbwertszeit',
    icon: '\u23F1\uFE0F',
    formulas: [
      {
        name: 'Definition',
        formula: 'T\u00BD = ln(2) / \u03BB \u2248 0,693 / \u03BB',
      },
      {
        name: 'Anzahl Halbwertszeiten',
        formula: 'n = t / T\u00BD',
      },
      {
        name: 'Verbleibende Menge nach n T\u00BD',
        formula: 'm = m\u2080 / 2\u207F = m\u2080 \u00B7 (0,5)\u207F',
      },
      {
        name: 'Verbleibender Prozentsatz',
        formula: 'p = (0,5)\u207F \u00B7 100 %',
      },
      {
        name: 'Faustformel',
        formula: 'Nach 10 T\u00BD \u2248 0,1 % der Ausgangsmenge',
        note: '(1/2)\u00B9\u2070 \u2248 0,001',
      },
      {
        name: 'C-14-Datierung',
        formula: 't = n \u00B7 T\u00BD   (n aus A/A\u2080 = (\u00BD)\u207F)',
        note: 'T\u00BD(C-14) = 5730 Jahre. Nur f\u00FCr organisches Material, max. ~50.000 Jahre.',
      },
    ],
  },
  {
    id: 'abstand',
    label: 'Abstandsgesetz',
    icon: '\uD83D\uDCCF',
    formulas: [
      {
        name: 'Quadratisches Abstandsgesetz',
        formula: 'I \u221D 1 / r\u00B2',
        note: 'Intensit\u00E4t nimmt quadratisch mit Abstand ab',
      },
      {
        name: 'Vergleichsformel',
        formula: 'I\u2081 \u00B7 r\u2081\u00B2 = I\u2082 \u00B7 r\u2082\u00B2',
      },
      {
        name: 'Gesuchter Abstand',
        formula: 'r\u2082 = r\u2081 \u00B7 \u221A(I\u2081 / I\u2082)',
      },
      {
        name: 'Beispiel',
        formula: '2\u00D7 Abstand \u2192 \u00BC der Intensit\u00E4t',
        note: 'Gilt f\u00FCr Punktstrahler im freien Raum',
      },
    ],
  },
  {
    id: 'lorentz',
    label: 'Lorentzkraft',
    icon: '\uD83E\uDDF2',
    formulas: [
      {
        name: 'Lorentzkraft',
        formula: 'F = q \u00B7 v \u00B7 B',
        note: 'q = Ladung, v = Geschwindigkeit, B = Magnetfeldst\u00E4rke',
      },
      {
        name: 'Kreisradius im Magnetfeld',
        formula: 'r = m \u00B7 v / (q \u00B7 B)',
        note: 'Gr\u00F6\u00DFere Masse \u2192 gr\u00F6\u00DFerer Radius',
      },
      {
        name: 'Merkhilfe',
        formula: '\u03B1: gro\u00DFe Masse \u2192 gro\u00DFer Kr\u00FCmmungsradius \u2192 kaum abgelenkt',
        note: '\u03B2: kleine Masse \u2192 kleiner Radius \u2192 stark gekr\u00FCmmt. Gr\u00F6\u00DFerer Radius = weniger Ablenkung pro Wegstrecke.',
      },
      {
        name: '\u03B3-Strahlung',
        formula: '\u03B3: keine Ladung \u2192 keine Ablenkung',
      },
    ],
  },
  {
    id: 'kernspaltung',
    label: 'Kernspaltung',
    icon: '\u2622\uFE0F',
    formulas: [
      {
        name: 'Kernspaltung (Beispiel)',
        formula: '\u00B2\u00B3\u2075U + n \u2192 \u00B9\u2074\u00B9Ba + \u2079\u00B2Kr + 3n',
        note: 'Massenzahl: 235+1 = 141+92+3 \u2713. Ordnungszahl: 92 = 56+36 \u2713',
      },
      {
        name: 'Energiefreisetzung',
        formula: 'E \u2248 200 MeV pro Spaltung',
        note: '\u2248 10\u2077\u00D7 mehr als chemische Reaktion (z.B. Verbrennung)',
      },
      {
        name: 'Kritikalit\u00E4tsfaktor k',
        formula: 'k = 1: kritisch (stabil) | k > 1: \u00FCberkritisch | k < 1: unterkritisch',
        note: 'Steuerstäbe (Cd/B) absorbieren Neutronen \u2192 k regulieren',
      },
      {
        name: 'Moderator',
        formula: 'Wasser / Graphit: bremst schnelle Neutronen',
        note: 'Thermische Neutronen spalten U-235 effizienter',
      },
      {
        name: 'Endlagerung (< 1%)',
        formula: 'n \u2265 7 Halbwertszeiten \u2192 (\u00BD)\u2077 < 1%',
        note: 'Cs-137: 7\u00D730 = 210 a | Pu-239: 7\u00D724110 \u2248 169.000 a',
      },
    ],
  },
  {
    id: 'dosimetrie',
    label: 'Dosimetrie',
    icon: '\uD83D\uDCCA',
    formulas: [
      {
        name: '\u00C4quivalentdosis',
        formula: 'H = D \u00B7 w\u1D3F   [Sv = Sievert]',
        note: 'D = Energiedosis in Gray (Gy)',
      },
      {
        name: 'Wichtungsfaktoren w\u1D3F',
        formula: '\u03B1: w\u1D3F = 20 | \u03B2, \u03B3: w\u1D3F = 1',
        note: 'Gilt nur f\u00FCr interne \u03B1-Exposition (eingeatmet/verschluckt). Externe \u03B1 wird von Haut gestoppt \u2192 dort kein w\u1D3F relevant.',
      },
      {
        name: 'Grenzwerte',
        formula: 'Bev\u00F6lkerung: 1 mSv/Jahr',
        note: 'Strahlenberufe: 20 mSv/Jahr',
      },
      {
        name: 'U.S.S. Blankenagel Warnschwellen',
        formula: '>80 mSv \u2192 gelb | >120 mSv \u2192 kritisch',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// FormulaSheet component
// ---------------------------------------------------------------------------

export default function FormulaSheet() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('strahlung')

  const category = FORMULA_CATEGORIES.find(c => c.id === activeTab)!

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-lg"
        style={{
          background: open
            ? 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(6,182,212,0.9))'
            : 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(124,58,237,0.8))',
          border: '1px solid rgba(6,182,212,0.5)',
          boxShadow: '0 0 24px rgba(6,182,212,0.3)',
          backdropFilter: 'blur(8px)',
        }}
        title="Formelblatt \u00F6ffnen"
      >
        {open ? '\u2715' : '\uD83D\uDCCE'}
      </motion.button>

      {/* Overlay + Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-in panel */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md flex flex-col"
              style={{
                background: 'rgba(5,12,28,0.98)',
                borderLeft: '1px solid rgba(6,182,212,0.25)',
                boxShadow: '-8px 0 40px rgba(6,182,212,0.08)',
              }}
            >
              {/* Header */}
              <div
                className="px-5 py-4 flex items-center justify-between flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(6,182,212,0.15)' }}
              >
                <div>
                  <div className="hud-font text-lg font-black text-white tracking-wider">
                    \uD83D\uDCCE FORMELBLATT
                  </div>
                  <div className="text-[10px] text-slate-600 hud-font tracking-widest mt-0.5">
                    AURA PHYSIK-REFERENZ v2.1
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer text-sm"
                  style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}
                >
                  \u2715
                </button>
              </div>

              {/* Category tabs */}
              <div
                className="flex overflow-x-auto px-3 py-2 gap-1 flex-shrink-0 scrollbar-none"
                style={{ borderBottom: '1px solid rgba(6,182,212,0.1)' }}
              >
                {FORMULA_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg hud-font text-[11px] tracking-wide cursor-pointer transition-all whitespace-nowrap"
                    style={{
                      background:
                        activeTab === cat.id
                          ? 'rgba(6,182,212,0.18)'
                          : 'rgba(15,23,42,0.6)',
                      border: `1px solid ${
                        activeTab === cat.id
                          ? 'rgba(6,182,212,0.45)'
                          : 'rgba(51,65,85,0.4)'
                      }`,
                      color: activeTab === cat.id ? '#22d3ee' : '#475569',
                    }}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Formula list */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {category.formulas.map((f, i) => (
                      <motion.div
                        key={f.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl p-3"
                        style={{
                          background: 'rgba(10,20,45,0.8)',
                          border: '1px solid rgba(6,182,212,0.12)',
                        }}
                      >
                        <div className="text-[10px] hud-font text-cyan-600 mb-1.5 uppercase tracking-widest">
                          {f.name}
                        </div>
                        <div
                          className="text-white font-mono text-sm leading-relaxed"
                          style={{ fontFamily: '"Courier New", monospace' }}
                        >
                          {f.formula}
                        </div>
                        {f.note && (
                          <div className="text-slate-500 text-xs mt-1.5 leading-relaxed border-t border-slate-700/30 pt-1.5">
                            {f.note}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer quote */}
              <div
                className="px-5 py-3 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(6,182,212,0.1)' }}
              >
                <p className="text-[10px] text-slate-700 hud-font text-center tracking-widest">
                  AURA: \u201EWissen ist dein bester Schutzschild.\u201C
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
