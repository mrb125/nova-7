import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const LEVEL_TOPICS: Record<number, string> = {
  1: 'Strahlungsarten',         2: 'Halbwertszeit',
  3: 'Hintergrundstrahlung',    4: 'Kernzerfall',
  5: 'Bestrahlungsschutz',      6: 'Detektoren',
  7: 'Zerfallsreihen',          8: 'Fukushima-Sim',
  9: 'Nuklidkarte',             10: 'Nuklearmedizin',
  11: 'Dosimetrie',             12: 'PET-Logistik',
  13: 'C-14 Datierung',         14: 'Halbwertszeit II',
  15: 'Strahlenkrankheit',      16: 'Inverse Quadrat',
  17: 'Akutes Strahlensyndrom', 18: 'Kernspaltung',
  19: 'Atommüll/Entsorgung',    20: 'Finaler Ausbruch',
}

const ACTS = [
  { name: 'EINSTIEG',    range: [1, 4],   x: 20 },
  { name: 'ANALYSE',     range: [5, 8],   x: 36 },
  { name: 'TRANSFER',    range: [9, 12],  x: 52 },
  { name: 'QUANTITATIV', range: [13, 16], x: 68 },
  { name: 'SYNTHESE',    range: [17, 20], x: 83 },
]

// Positions as % of container [x, y]
// Ship: engine left, bow right; nodes laid out to match blueprint layout
const NODE_POSITIONS: Record<number, [number, number]> = {
  // EINSTIEG — engine section, left
  1:  [14, 68],
  2:  [16, 44],
  3:  [20, 78],
  4:  [23, 32],
  // ANALYSE — mid-left hull
  5:  [31, 68],
  6:  [28, 28],
  7:  [34, 40],
  8:  [37, 60],
  // TRANSFER — centre hull
  9:  [43, 26],
  10: [47, 48],
  11: [51, 64],
  12: [54, 32],
  // QUANTITATIV — mid-right hull
  13: [60, 58],
  14: [61, 24],
  15: [66, 48],
  16: [64, 72],
  // SYNTHESE — bow section, right
  17: [72, 38],
  18: [75, 62],
  19: [79, 28],
  20: [83, 50],
}

interface Props {
  currentLevel: number
}

export default function ShipMap({ currentLevel }: Props) {
  const [tooltip, setTooltip] = useState<number | null>(null)

  const getState = (lvl: number) => {
    if (lvl <= currentLevel) return 'done'
    if (lvl === currentLevel + 1) return 'current'
    return 'locked'
  }

  // Build SVG path segments connecting nodes 1→2→…→20
  const pathPairs = Array.from({ length: 19 }, (_, i) => ({
    from: i + 1,
    to: i + 2,
    done: i + 1 <= currentLevel,
  }))

  return (
    <div className="relative w-full select-none" style={{ aspectRatio: '1344/896' }}>
      {/* Ship blueprint image */}
      <img
        src="/ship-map.png"
        alt="U.S.S. Blankenagel Schiffskarte"
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        draggable={false}
      />

      {/* Dark vignette to help nodes pop */}
      <div className="absolute inset-0 rounded-lg"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.45) 100%)' }} />

      {/* SVG path layer */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {pathPairs.map(({ from, to, done }) => {
          const [x1, y1] = NODE_POSITIONS[from]
          const [x2, y2] = NODE_POSITIONS[to]
          return (
            <line
              key={`${from}-${to}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={done ? '#22d3ee' : 'rgba(34,211,238,.15)'}
              strokeWidth={done ? 0.35 : 0.2}
              strokeDasharray={done ? undefined : '0.8 0.6'}
              filter={done ? 'url(#glow)' : undefined}
            />
          )
        })}
      </svg>

      {/* Act labels */}
      {ACTS.map(act => (
        <div
          key={act.name}
          className="absolute hud-font text-[8px] tracking-widest pointer-events-none"
          style={{ left: `${act.x}%`, top: '6%', transform: 'translateX(-50%)', color: 'rgba(34,211,238,.5)' }}
        >
          {act.name}
        </div>
      ))}

      {/* Nodes */}
      {Object.entries(NODE_POSITIONS).map(([lvlStr, [x, y]]) => {
        const lvl = Number(lvlStr)
        const st = getState(lvl)
        const isTooltipShown = tooltip === lvl

        const nodeColor =
          st === 'done'    ? '#10b981' :
          st === 'current' ? '#22d3ee' :
                             'rgba(255,255,255,.15)'
        const ringColor =
          st === 'current' ? '#22d3ee' :
          st === 'done'    ? 'rgba(16,185,129,.4)' :
                             'rgba(255,255,255,.1)'

        return (
          <div
            key={lvl}
            className="absolute"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            onMouseEnter={() => setTooltip(lvl)}
            onMouseLeave={() => setTooltip(null)}
          >
            {/* Pulse for current node */}
            {st === 'current' && (
              <motion.div
                className="absolute rounded-full"
                style={{ inset: -5, border: '1px solid #22d3ee', borderRadius: '50%' }}
                animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.6, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Node circle */}
            <motion.div
              className="relative rounded-full flex items-center justify-center cursor-default"
              style={{
                width: 18, height: 18,
                background: nodeColor,
                border: `1.5px solid ${ringColor}`,
                boxShadow: st === 'done' ? '0 0 6px #10b98166'
                         : st === 'current' ? '0 0 10px #22d3eeaa' : 'none',
                fontSize: 6,
                color: st === 'locked' ? 'rgba(255,255,255,.3)' : '#010a18',
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: 1,
              }}
              whileHover={st !== 'locked' ? { scale: 1.25 } : {}}
            >
              {st === 'locked' ? '·' : String(lvl).padStart(2, '0')}
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isTooltipShown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-full mb-2 left-1/2 hud-font whitespace-nowrap rounded px-2 py-1 z-30 pointer-events-none"
                  style={{
                    transform: 'translateX(-50%)',
                    background: 'rgba(2,10,28,.96)',
                    border: '1px solid rgba(34,211,238,.3)',
                    fontSize: 9,
                    color: '#94a3b8',
                  }}
                >
                  <span style={{ color: nodeColor }}>L{lvl}</span> — {LEVEL_TOPICS[lvl]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Ship name */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 hud-font text-[9px] tracking-widest pointer-events-none"
        style={{ color: 'rgba(34,211,238,.35)' }}>
        U.S.S. BLANKENAGEL
      </div>
    </div>
  )
}
