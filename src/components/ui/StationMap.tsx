import { motion } from 'framer-motion'

const SECTORS = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA',
  'EPSILON', 'ZETA', 'ETA', 'THETA',
  'IOTA', 'KAPPA', 'LAMBDA', 'MU',
  'NU', 'XI', 'OMIKRON', 'PI',
  'RHO', 'SIGMA', 'TAU', 'YPSILON',
]

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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: '#22d3ee', fontSize: 12 }}>◈</span>
        <span className="hud-font tracking-widest text-[10px]" style={{ color: '#22d3ee' }}>
          STATIONSKARTE — U.S.S. BLANKENAGEL
        </span>
        <span className="hud-font text-[10px] text-slate-600 ml-auto">
          {currentLevel}/20 SEKTOREN
        </span>
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
                    className="flex-1 relative overflow-hidden rounded-md"
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
