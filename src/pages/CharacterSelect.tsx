import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CHARACTERS } from '../lib/characters'
import { createInitialState, saveState, registerTeam, setTeamUnlockedLevel } from '../lib/gameState'
import type { CharacterId } from '../types/game'

export default function CharacterSelect() {
  const [selected, setSelected] = useState<CharacterId | null>(null)
  const navigate = useNavigate()
  const teamName = sessionStorage.getItem('nova7_teamname') ?? 'Team'

  function handleConfirm() {
    if (!selected) return
    // Register the team credentials
    const pw = sessionStorage.getItem('nova7_password') ?? ''
    if (pw) {
      registerTeam(teamName, pw, selected)
      sessionStorage.removeItem('nova7_password')
    }
    const state = createInitialState(teamName, selected)
    saveState(state)
    // Default: Level 1 is unlocked
    setTeamUnlockedLevel(teamName, 1)
    navigate('/charakter-erstellen')
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 z-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-cyan-400/70 hud-font text-sm tracking-widest mb-2">TEAM: {teamName.toUpperCase()}</div>
        <h2 className="hud-font text-3xl font-bold text-white mb-2">Wähle deinen Charakter</h2>
        <p className="text-slate-400 text-sm">Jeder Charakter hat 4 Bonus-Level (+3 WP) und eine passive Fähigkeit.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-8">
        {CHARACTERS.map((char, i) => {
          const isSelected = selected === char.id
          return (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(char.id)}
              className="glass-panel p-6 cursor-pointer transition-all duration-300 relative overflow-hidden"
              style={{
                borderColor: isSelected ? char.color : 'rgba(6,182,212,0.3)',
                boxShadow: isSelected ? `0 0 30px ${char.color}40` : undefined,
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{ background: char.color }}>✓</div>
              )}

              {/* Character icon */}
              <div className="text-5xl mb-4 float">{char.icon}</div>

              {/* Name & title */}
              <h3 className="hud-font font-bold text-white text-lg">{char.name}</h3>
              <p className="text-sm mb-3" style={{ color: char.color }}>{char.title}</p>

              {/* Backstory */}
              <p className="text-slate-400 text-xs leading-relaxed mb-4">{char.backstory}</p>

              <div className="text-xs italic mb-4" style={{ color: char.color }}>{char.motto}</div>

              {/* Bonus levels */}
              <div className="mb-3">
                <div className="text-slate-500 text-xs hud-font mb-1">BONUS-LEVEL (+3 WP)</div>
                <div className="flex gap-1 flex-wrap">
                  {char.bonusLevels.map(l => (
                    <span key={l} className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ background: `${char.color}20`, color: char.color, border: `1px solid ${char.color}40` }}>
                      L{l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Passive */}
              <div className="rounded-lg p-3" style={{ background: `${char.color}10`, border: `1px solid ${char.color}20` }}>
                <div className="text-xs hud-font mb-1" style={{ color: char.color }}>PASSIV: {char.passiveName}</div>
                <div className="text-xs text-slate-400">{char.passiveDescription}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleConfirm}
        disabled={!selected}
        className="px-10 py-4 rounded-xl hud-font text-sm tracking-wider font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: selected ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
          border: '1px solid rgba(6,182,212,0.4)',
          boxShadow: selected ? '0 0 30px rgba(6,182,212,0.3)' : 'none',
        }}
      >
        {selected ? `MIT ${CHARACTERS.find(c => c.id === selected)?.name.toUpperCase()} STARTEN →` : 'CHARAKTER WÄHLEN'}
      </motion.button>
    </div>
  )
}
