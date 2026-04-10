import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadState } from '../lib/gameState'
import { getCharacter } from '../lib/characters'
import { ACHIEVEMENTS, getEarnedAchievements } from '../lib/achievements'
import type { TeamState } from '../types/game'

// Simple local highscore — in production this would use Supabase realtime
const HS_KEY = 'nova7_highscore'

interface HighscoreEntry {
  teamName: string
  characterId: string
  wissensPunkte: number
  dosimeterMSv: number
  equipment: string[]
  timestamp: number
}

function saveScore(state: TeamState) {
  const existing: HighscoreEntry[] = JSON.parse(localStorage.getItem(HS_KEY) ?? '[]')
  const entry: HighscoreEntry = {
    teamName: state.teamName,
    characterId: state.characterId,
    wissensPunkte: state.wissensPunkte,
    dosimeterMSv: state.dosimeterMSv,
    equipment: state.equipment,
    timestamp: Date.now(),
  }
  const filtered = existing.filter(e => e.teamName !== state.teamName)
  const updated = [...filtered, entry].sort((a, b) => b.wissensPunkte - a.wissensPunkte)
  localStorage.setItem(HS_KEY, JSON.stringify(updated.slice(0, 20)))
}

export default function Highscore() {
  const [scores, setScores] = useState<HighscoreEntry[]>([])
  const [currentTeam, setCurrentTeam] = useState<TeamState | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const state = loadState()
    if (state && state.currentLevel >= 16) saveScore(state)
    setCurrentTeam(state)

    const stored: HighscoreEntry[] = JSON.parse(localStorage.getItem(HS_KEY) ?? '[]')
    setScores(stored)
  }, [])

  return (
    <div className="relative min-h-screen z-10 px-4 py-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="hud-font text-4xl font-black glow-text-cyan mb-2"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          HIGHSCORE
        </h1>
        <p className="text-slate-400 text-sm hud-font tracking-widest">U.S.S. BLANKENAGEL MISSIONSRANGLISTE</p>
      </motion.div>

      {scores.length === 0 ? (
        <div className="glass-panel p-8 text-center text-slate-400">
          Noch keine Einträge. Schließe zuerst eine Mission ab.
        </div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 hud-font text-xs text-slate-400">#</th>
                <th className="text-left px-4 py-3 hud-font text-xs text-slate-400">TEAM</th>
                <th className="text-left px-4 py-3 hud-font text-xs text-slate-400">CHARAKTER</th>
                <th className="text-right px-4 py-3 hud-font text-xs text-yellow-400">WP</th>
                <th className="text-right px-4 py-3 hud-font text-xs text-slate-400">DOSIMETER</th>
                <th className="text-left px-4 py-3 hud-font text-xs text-slate-400 hidden md:table-cell">AUSRÜSTUNG</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry, i) => {
                const char = getCharacter(entry.characterId)
                const medalColor = i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#334155'
                return (
                  <motion.tr
                    key={entry.timestamp}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-800/50 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="hud-font font-bold" style={{ color: medalColor }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{entry.teamName}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <span>{char.icon}</span>
                        <span className="text-xs" style={{ color: char.color }}>{char.name.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right hud-font font-bold text-yellow-400">{entry.wissensPunkte}</td>
                    <td className="px-4 py-3 text-right hud-font font-bold"
                      style={{ color: entry.dosimeterMSv < 80 ? '#10b981' : entry.dosimeterMSv < 120 ? '#f59e0b' : '#ef4444' }}>
                      {entry.dosimeterMSv} mSv
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                      {entry.equipment.slice(0, 3).join(', ') || '–'}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Achievements des aktuellen Teams */}
      {currentTeam && (() => {
        const earnedIds = new Set(getEarnedAchievements(currentTeam.teamName))
        const earned = ACHIEVEMENTS.filter(a => earnedIds.has(a.id))
        if (earned.length === 0) return null
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <h2 className="hud-font text-sm text-white mb-3 flex items-center gap-2">
              <span style={{ color: '#f59e0b' }}>▶</span> DEINE ACHIEVEMENTS
              <span className="ml-auto text-[10px] text-slate-500 hud-font">{earned.length}/{ACHIEVEMENTS.length}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {earned.map(ach => (
                <motion.div key={ach.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="glass-panel rounded-xl p-3 flex items-center gap-2"
                  style={{ border: `1px solid ${ach.color}30` }}>
                  <span className="text-xl flex-shrink-0">{ach.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold hud-font truncate" style={{ color: ach.color }}>{ach.title}</div>
                    <div className="text-[10px] text-slate-500 leading-tight truncate">{ach.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )
      })()}

      <div className="mt-6 flex justify-center gap-4">
        <button onClick={() => navigate('/')}
          className="px-6 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          ← ZURÜCK
        </button>
        <button
          onClick={() => { localStorage.removeItem(HS_KEY); setScores([]) }}
          className="px-6 py-3 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.3)', color: '#64748b' }}
        >
          RESET
        </button>
      </div>
    </div>
  )
}
