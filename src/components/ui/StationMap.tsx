import { motion } from 'framer-motion'

const SECTORS = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA',
  'EPSILON', 'ZETA', 'ETA', 'THETA',
  'IOTA', 'KAPPA', 'LAMBDA', 'MU',
  'NU', 'XI', 'OMIKRON', 'PI',
  'RHO', 'SIGMA', 'TAU', 'YPSILON',
]

const ACT_MAP: Record<number, { name: string; stars: number; range: [number, number] }> = {
  1: { name: 'EINSTIEG',    stars: 2, range: [1,  4]  },
  2: { name: 'ANALYSE',     stars: 3, range: [5,  8]  },
  3: { name: 'TRANSFER',    stars: 4, range: [9,  12] },
  4: { name: 'QUANTITATIV', stars: 4, range: [13, 16] },
  5: { name: 'SYNTHESE',    stars: 5, range: [17, 20] },
}

const LEVEL_TOPICS: Record<number, string> = {
  1: 'Strahlungsarten',        2: 'Halbwertszeit',
  3: 'Hintergrundstrahlung',   4: 'Kernzerfall',
  5: 'Bestrahlungsschutz',     6: 'Detektoren',
  7: 'Zerfallsreihen',         8: 'Fukushima-Sim',
  9: 'Nuklidkarte',            10: 'Nuklearmedizin',
  11: 'Dosimetrie',            12: 'PET-Logistik',
  13: 'C-14 Datierung',        14: 'Halbwertszeit II',
  15: 'Strahlenkrankheit',     16: 'Inverse Quadrat',
  17: 'Akutes Strahlensyndrom', 18: 'Kernspaltung',
  19: 'Atommüll/Entsorgung',   20: 'Finaler Ausbruch',
}

interface Props {
  /** state.currentLevel — 0 = nothing done, 20 = all done */
  currentLevel: number
}

export default function StationMap({ currentLevel }: Props) {
  const cells = Array.from({ length: 20 }, (_, i) => {
    const lvl  = i + 1
    const pad  = String(lvl).padStart(2, '0')
    return {
      lvl,
      sector:      SECTORS[i],
      isCompleted: lvl <= currentLevel,
      isCurrent:   lvl === currentLevel + 1,
      isLocked:    lvl >  currentLevel + 1,
      pad,
    }
  })

  // 5 rows of 4; odd rows rendered reversed (snake path)
  const rows = [
    cells.slice(0,  4),
    cells.slice(4,  8),
    cells.slice(8,  12),
    cells.slice(12, 16),
    cells.slice(16, 20),
  ]

  const currentActNum = Object.entries(ACT_MAP).find(
    ([, a]) => (currentLevel + 1) >= a.range[0] && (currentLevel + 1) <= a.range[1]
  )?.[0]
  const currentAct = currentActNum ? ACT_MAP[Number(currentActNum)] : null
  const completedActs = Object.values(ACT_MAP).filter(a => currentLevel >= a.range[1]).length

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#22d3ee', fontSize: 12 }}>◈</span>
        <span className="hud-font tracking-widest text-[10px]" style={{ color: '#22d3ee' }}>
          STATIONSKARTE — U.S.S. BLANKENAGEL
        </span>
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <span className="hud-font text-[10px] text-slate-400">
            {currentLevel}/20 SEKTOREN
          </span>
          {currentAct && (
            <span className="hud-font text-[9px]" style={{ color: '#f59e0b' }}>
              AKT {completedActs + 1}/5 — {currentAct.name} {'★'.repeat(currentAct.stars)}{'☆'.repeat(5 - currentAct.stars)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((row, rowIdx) => {
          const reversed = rowIdx % 2 === 1
          const display  = reversed ? [...row].reverse() : row

          return (
            <div key={rowIdx} className="relative">
              {/* Row cells */}
              <div className="flex gap-1.5">
                {display.map(cell => (
                  <motion.div
                    key={cell.lvl}
                    className="flex-1 relative overflow-hidden rounded-md group/cell"
                    style={{
                      aspectRatio: '1.9',
                      border: cell.isCurrent
                        ? '1.5px solid #22d3ee'
                        : cell.isCompleted
                        ? '1px solid rgba(16,185,129,0.35)'
                        : '1px solid rgba(30,41,59,0.8)',
                    }}
                    animate={cell.isCurrent
                      ? { boxShadow: ['0 0 0px #22d3ee00', '0 0 10px #22d3ee90', '0 0 0px #22d3ee00'] }
                      : {}
                    }
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Scene image bg */}
                    {!cell.isLocked && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(/scenes/scene-l${cell.pad}.jpg)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: cell.isCompleted ? 0.45 : 0.75,
                        }}
                      />
                    )}

                    {/* Overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: cell.isLocked
                          ? 'rgba(4,10,22,0.88)'
                          : cell.isCompleted
                          ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 100%)'
                          : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)',
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 p-1.5 h-full flex flex-col justify-between">
                      {/* Top: level number */}
                      <div className="hud-font text-[8px]" style={{ color: '#475569' }}>
                        L{cell.lvl}
                      </div>

                      {/* Bottom: sector + status */}
                      <div>
                        <div className="relative">
                          <div
                            className="hud-font font-bold truncate leading-none mb-0.5"
                            style={{
                              fontSize: '7.5px',
                              color: cell.isCurrent
                                ? '#22d3ee'
                                : cell.isCompleted
                                ? '#10b981'
                                : '#334155',
                            }}
                          >
                            {cell.sector}
                          </div>
                          {!cell.isLocked && (
                            <div
                              className="absolute bottom-full left-0 mb-1 px-1.5 py-0.5 rounded text-[7px] whitespace-nowrap pointer-events-none opacity-0 group-hover/cell:opacity-100 transition-opacity z-20"
                              style={{
                                background: 'rgba(2,10,28,0.95)',
                                border: '1px solid rgba(6,182,212,0.3)',
                                color: '#94a3b8',
                              }}
                            >
                              {LEVEL_TOPICS[cell.lvl]}
                            </div>
                          )}
                        </div>

                        {cell.isCompleted && (
                          <div style={{ fontSize: 9, color: '#10b981', lineHeight: 1 }}>✓</div>
                        )}
                        {cell.isCurrent && (
                          <motion.div
                            style={{ fontSize: '7px', color: '#22d3ee', lineHeight: 1 }}
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                          >
                            ▶ AKTIV
                          </motion.div>
                        )}
                        {cell.isLocked && (
                          <div style={{ fontSize: 9, color: '#1e293b', lineHeight: 1 }}>🔒</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Turn arrow between rows */}
              {rowIdx < 4 && (
                <div className="relative">
                  <div
                    className="hud-font text-slate-700"
                    style={{
                      fontSize: 10,
                      position: 'absolute',
                      bottom: -10,
                      [reversed ? 'left' : 'right']: 2,
                      lineHeight: 1,
                    }}
                  >
                    ↓
                  </div>
                  {(() => {
                    const nextActNum = rowIdx + 2
                    const nextAct = ACT_MAP[nextActNum]
                    if (!nextAct) return null
                    return (
                      <div
                        className="hud-font text-[7px] tracking-widest"
                        style={{
                          position: 'absolute',
                          bottom: -10,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: 'rgba(124,58,237,0.6)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        AKT {nextActNum}: {nextAct.name}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-end">
        {[
          { color: '#10b981', label: 'Abgeschlossen' },
          { color: '#22d3ee', label: 'Aktuell' },
          { color: '#334155', label: 'Gesperrt' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ background: item.color }} />
            <span className="hud-font text-[8px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
