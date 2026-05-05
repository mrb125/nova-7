import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TeamState } from '../../types/game'
import { getCharacter } from '../../lib/characters'
import Avatar from './Avatar'

interface Props {
  state: TeamState
  levelNumber: number
  timeLeft?: number | null
  timeLimitSeconds?: number | null
}

const DOS_INFO = [
  { label: 'Natürl. Hintergrund', value: '~2,4 mSv/Jahr', color: '#10b981' },
  { label: 'Röntgen (Thorax)', value: '~0,1 mSv', color: '#10b981' },
  { label: 'Grenzwert Bevölkerung', value: '1 mSv/Jahr', color: '#f59e0b' },
  { label: 'Grenzwert Berufsexp.', value: '20 mSv/Jahr', color: '#f59e0b' },
  { label: 'H = D × w_R', value: 'γ/β: w_R=1 · α: w_R=20', color: '#a78bfa' },
]

export default function StatBar({ state, levelNumber, timeLeft, timeLimitSeconds }: Props) {
  const char = getCharacter(state.characterId)
  const dosPercent = Math.min((state.dosimeterMSv / 150) * 100, 100)
  const dosColor = state.dosimeterMSv >= 120 ? '#ef4444' : state.dosimeterMSv >= 80 ? '#f59e0b' : '#10b981'

  const timePercent = timeLimitSeconds && timeLeft != null
    ? Math.max((timeLeft / timeLimitSeconds) * 100, 0)
    : null
  const timeColor = timeLeft != null && timeLeft <= 30 ? '#ef4444' : timeLeft != null && timeLeft <= 60 ? '#f59e0b' : '#06b6d4'

  const [showDosInfo, setShowDosInfo] = useState(false)

  return (
    <div className="glass-panel px-4 py-3 flex flex-wrap gap-4 items-center justify-between text-xs hud-font relative">
      {/* Team + char + Avatar */}
      <div className="flex items-center gap-2">
        {state.avatarConfig
          ? <Avatar config={state.avatarConfig} size={38} animId={`hud-${state.teamName}`} />
          : <span className="text-lg">{char.icon}</span>
        }
        <div>
          <div className="text-white font-bold">{state.teamName}</div>
          {state.avatarConfig?.avatarName
            ? <div className="text-cyan-400/80" style={{ fontSize: 10 }}>{state.avatarConfig.avatarName}</div>
            : <div style={{ color: char.color }}>{char.name}</div>
          }
        </div>
      </div>

      {/* Level */}
      <div className="text-center">
        <div className="text-slate-400">SEKTOR</div>
        <div className="text-cyan-400 font-bold text-lg">{levelNumber}/16</div>
      </div>

      {/* WP */}
      <div className="text-center">
        <div className="text-slate-400">WISSENSPUNKTE</div>
        <div className="text-yellow-400 font-bold text-lg">{state.wissensPunkte} WP</div>
      </div>

      {/* Budget */}
      <div className="text-center">
        <div className="text-slate-400">BUDGET</div>
        <div className="text-emerald-400 font-bold text-lg">{state.budget} Cr</div>
      </div>

      {/* Dosimeter with info tooltip */}
      <div className="min-w-[120px] relative">
        <div className="flex justify-between mb-1 items-center">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">DOSIMETER</span>
            <button
              onClick={() => setShowDosInfo(v => !v)}
              title="Was bedeutet mSv?"
              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold cursor-pointer transition-all hover:brightness-125"
              style={{
                background: showDosInfo ? 'rgba(6,182,212,0.3)' : 'rgba(71,85,105,0.4)',
                border: '1px solid rgba(6,182,212,0.4)',
                color: '#67e8f9',
              }}
            >
              ?
            </button>
          </div>
          <span style={{ color: dosColor }} className="font-bold">{state.dosimeterMSv} mSv</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${dosPercent}%`, background: dosColor }} />
        </div>
        {state.dosimeterMSv >= 80 && (
          <div className="text-xs mt-0.5" style={{ color: dosColor }}>
            {state.dosimeterMSv >= 120 ? '⚠ KRITISCH' : '⚡ ERHÖHT'}
          </div>
        )}

        {/* Tooltip */}
        {showDosInfo && (
          <div
            className="absolute z-50 top-full mt-2 right-0 rounded-xl p-3 w-64 shadow-2xl"
            style={{
              background: 'rgba(5,12,28,0.97)',
              border: '1px solid rgba(6,182,212,0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-cyan-400 font-bold text-[10px] mb-2 tracking-wider">
              ☢ DOSIMETRIE-KONTEXT
            </div>
            <div className="space-y-1.5">
              {DOS_INFO.map(item => (
                <div key={item.label} className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 text-[10px]">{item.label}</span>
                  <span className="font-bold text-[10px]" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700/50 text-[9px] text-slate-600">
              Sv = Sievert · H = D × w_R · 1 mSv = 0,001 Sv
            </div>
          </div>
        )}
      </div>

      {/* Timer */}
      {timeLeft != null && timeLimitSeconds != null && (
        <motion.div
          className="min-w-[100px] rounded-lg px-2 py-1 -mx-2 transition-all duration-500"
          animate={timeLeft <= 10
            ? { boxShadow: ['0 0 0px #ef444400', '0 0 14px #ef4444aa', '0 0 0px #ef444400'] }
            : timeLeft <= 30
            ? { boxShadow: ['0 0 0px #ef444400', '0 0 8px #ef444466', '0 0 0px #ef444400'] }
            : { boxShadow: '0 0 0px #00000000' }
          }
          transition={{ duration: timeLeft <= 10 ? 0.4 : 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex justify-between mb-1 items-center">
            <span className="text-slate-400">ZEIT</span>
            <motion.span
              style={{ color: timeColor }}
              className="font-bold tabular-nums"
              animate={timeLeft <= 30 ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: timeLeft <= 10 ? 0.4 : 0.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {timeLeft <= 10 && '⚠ '}
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </motion.span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${timePercent}%`, background: timeColor }}
              animate={timeLeft <= 30 ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
              transition={{ duration: timeLeft <= 10 ? 0.4 : 0.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
