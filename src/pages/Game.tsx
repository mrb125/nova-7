import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  loadState, saveState, applyLevelResult, getTeamUnlockedLevel,
  getGameEvents, getSeenEvents, markEventSeen, applyEventToTeam,
  onBroadcastChange,
  type GameEvent,
} from '../lib/gameState'
import { getCharacter } from '../lib/characters'
import { checkAchievements, ACHIEVEMENTS, type Achievement } from '../lib/achievements'
import StatBar from '../components/ui/StatBar'
import StationMap from '../components/ui/StationMap'
import StoryScene from '../components/ui/StoryScene'
import MiniGameHub from '../components/minigames/MiniGameHub'
import Avatar from '../components/ui/Avatar'
import type { TeamState } from '../types/game'
import { GameContext } from '../contexts/GameContext'

// Level components
import Level01 from '../components/levels/Level01'
import Level02 from '../components/levels/Level02'
import LevelHintergrund from '../components/levels/LevelHintergrund'
import Level03 from '../components/levels/Level03'
import LevelBestrahlung from '../components/levels/LevelBestrahlung'
import Level04 from '../components/levels/Level04'
import Level05 from '../components/levels/Level05'
import Level06 from '../components/levels/Level06'
import LevelNuklidkarte from '../components/levels/LevelNuklidkarte'
import LevelNuklearmedizin from '../components/levels/LevelNuklearmedizin'
import Level07 from '../components/levels/Level07'
import Level08 from '../components/levels/Level08'
import LevelC14 from '../components/levels/LevelC14'
import Level09 from '../components/levels/Level09'
import LevelStrahlenkrankheit from '../components/levels/LevelStrahlenkrankheit'
import Level10 from '../components/levels/Level10'
import Level11 from '../components/levels/Level11'
import LevelKernspaltung from '../components/levels/LevelKernspaltung'
import LevelAtomkraftwerk from '../components/levels/LevelAtomkraftwerk'
import Level12 from '../components/levels/Level12'
import Endscreen from '../components/levels/Endscreen'

// Pos:  1       2       3               4       5                6       7       8
const LEVELS = [
  Level01, Level02, LevelHintergrund, Level03, LevelBestrahlung, Level04, Level05, Level06,
  // Pos: 9              10                 11      12      13       14
  LevelNuklidkarte, LevelNuklearmedizin, Level07, Level08, LevelC14, Level09,
  // Pos: 15                    16      17      18                19                 20
  LevelStrahlenkrankheit, Level10, Level11, LevelKernspaltung, LevelAtomkraftwerk, Level12,
]

const SECTOR_NAMES = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA',
  'ETA', 'THETA', 'IOTA', 'KAPPA', 'LAMBDA', 'MU',
  'NU', 'XI', 'OMIKRON', 'PI', 'RHO', 'SIGMA', 'TAU', 'YPSILON',
]

const TIME_LIMITS_KEY = 'nova7_timelimits'

// Returns effective time limit in seconds for a level, respecting teacher overrides
export function getEffectiveTimeLimit(levelNumber: number): number {
  try {
    const stored = localStorage.getItem(TIME_LIMITS_KEY)
    if (stored) {
      const custom: Record<string, number> = JSON.parse(stored)
      if (custom[levelNumber] != null) return custom[levelNumber] * 60
    }
  } catch { /* ignore */ }
  return TIME_LIMITS[levelNumber] ?? 5 * 60
}

// Time limits in seconds per level (20 levels)
export const TIME_LIMITS: Record<number, number> = {
  1:  5 * 60,  // Level01
  2:  5 * 60,  // Level02
  3:  4 * 60,  // LevelHintergrund
  4:  4 * 60,  // Level03
  5:  4 * 60,  // LevelBestrahlung
  6:  6 * 60,  // Level04
  7:  5 * 60,  // Level05
  8:  8 * 60,  // Level06
  9:  6 * 60,  // LevelNuklidkarte (NEU)
  10: 5 * 60,  // LevelNuklearmedizin
  11: 7 * 60,  // Level07
  12: 8 * 60,  // Level08
  13: 6 * 60,  // LevelC14 (NEU)
  14: 5 * 60,  // Level09
  15: 4 * 60,  // LevelStrahlenkrankheit
  16: 6 * 60,  // Level10
  17: 5 * 60,  // Level11
  18: 7 * 60,  // LevelKernspaltung (NEU)
  19: 6 * 60,  // LevelAtomkraftwerk (NEU)
  20: 6 * 60,  // Level12
}

export interface LevelProps {
  state: TeamState
  onComplete: (result: { wpEarned: number; dosimeterDelta: number; answers: Record<string, unknown>; justification?: string; justificationScore?: number }) => void
}

// ---------------------------------------------------------------------------
// Waiting Screen (shown when teacher hasn't unlocked next level yet)
// ---------------------------------------------------------------------------

function WaitingScreen({ state, nextLevel }: { state: TeamState; nextLevel: number }) {
  const [dots, setDots] = useState('')
  const char = getCharacter(state.characterId)

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative min-h-screen z-10 flex flex-col items-center justify-center px-4">
      {/* HUD still visible */}
      <div className="fixed top-0 left-0 right-0 z-20 p-3">
        <StatBar state={state} levelNumber={nextLevel} timeLeft={null} timeLimitSeconds={0} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 max-w-lg w-full text-center"
      >
        <div className="text-5xl mb-4 float">🔒</div>
        <h2 className="hud-font text-2xl font-black text-white mb-2">
          SEKTOR {SECTOR_NAMES[nextLevel - 1]} GESPERRT
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          AURA: „Die Schleuse zu Sektor {SECTOR_NAMES[nextLevel - 1]} ist verriegelt.
          Warte auf Freigabe durch die Missionszentrale{dots}"
        </p>

        <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="text-yellow-400 hud-font text-sm font-bold mb-1 blink">
            ⏳ WARTE AUF LEHRER-FREIGABE
          </div>
          <div className="text-slate-400 text-xs">
            Dein Lehrer muss Sektor {SECTOR_NAMES[nextLevel - 1]} (Level {nextLevel}) im Dashboard freischalten.
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 text-sm">
          {state.avatarConfig && (
            <div className="text-center">
              <Avatar config={state.avatarConfig} size={64} />
              {state.avatarConfig.avatarName && (
                <div className="text-[10px] text-cyan-400 hud-font mt-1 truncate max-w-[70px]">
                  {state.avatarConfig.avatarName}
                </div>
              )}
            </div>
          )}
          <div className="text-center">
            <div className="text-yellow-400 font-bold hud-font">{state.wissensPunkte} WP</div>
            <div className="text-[10px] text-slate-500 hud-font">BISHER</div>
          </div>
          <div className="text-center">
            <div className="font-bold hud-font" style={{ color: state.dosimeterMSv < 80 ? '#10b981' : '#f59e0b' }}>
              {state.dosimeterMSv} mSv
            </div>
            <div className="text-[10px] text-slate-500 hud-font">DOSIMETER</div>
          </div>
          <div className="text-center">
            <div className="font-bold hud-font" style={{ color: char.color }}>{char.icon}</div>
            <div className="text-[10px] text-slate-500 hud-font">{char.name.split(' ')[0]}</div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-slate-600 text-xs hud-font"
      >
        Diese Seite aktualisiert sich automatisch.
      </motion.p>

      {/* Station map */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-lg mt-4"
      >
        <div className="glass-panel p-4">
          <StationMap currentLevel={state.currentLevel} />
        </div>
      </motion.div>

      {/* Mini-game while waiting */}
      <div className="w-full max-w-lg">
        <MiniGameHub levelNumber={nextLevel} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Event Notification Overlay
// ---------------------------------------------------------------------------

function EventNotification({ event, onClose }: { event: GameEvent; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000)
    return () => clearTimeout(t)
  }, [onClose])

  const hasStat = event.dosimeterDelta !== 0 || event.wpDelta !== 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -80, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-20 left-1/2 z-50 glass-panel p-6 text-center w-80"
      style={{ transform: 'translateX(-50%)', border: '1px solid rgba(245,158,11,0.4)', boxShadow: '0 0 40px rgba(245,158,11,0.2)' }}
    >
      {/* Blinking alarm bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden">
        <div className="h-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)' }}>
          <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
        </div>
      </div>

      <div className="text-5xl mb-2">{event.icon}</div>
      <div className="hud-font text-sm tracking-widest text-yellow-400 mb-1">⚡ STATIONS-EREIGNIS</div>
      <div className="hud-font text-xl font-black text-white mb-2">{event.title}</div>
      <p className="text-slate-300 text-xs leading-relaxed mb-4">{event.message}</p>

      {hasStat && (
        <div className="flex justify-center gap-6 mb-4">
          {event.dosimeterDelta !== 0 && (
            <div className="text-center">
              <div className="hud-font text-xl font-bold" style={{ color: event.dosimeterDelta > 0 ? '#ef4444' : '#10b981' }}>
                {event.dosimeterDelta > 0 ? '+' : ''}{event.dosimeterDelta} mSv
              </div>
              <div className="text-[10px] text-slate-500 hud-font">DOSIMETER</div>
            </div>
          )}
          {event.wpDelta !== 0 && (
            <div className="text-center">
              <div className="hud-font text-xl font-bold text-yellow-400">+{event.wpDelta} WP</div>
              <div className="text-[10px] text-slate-500 hud-font">WISSENSPUNKTE</div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onClose}
        className="px-4 py-1.5 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all hover:brightness-110"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' }}
      >
        VERSTANDEN ✓
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Achievement Toast (bottom-left, stacks briefly)
// ---------------------------------------------------------------------------

function AchievementToast({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, x: -80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
      onClick={onClose}
      style={{
        background: 'rgba(5,12,28,0.95)',
        border: `1px solid ${achievement.color}50`,
        boxShadow: `0 0 20px ${achievement.color}18`,
        backdropFilter: 'blur(12px)',
        minWidth: '260px',
        maxWidth: '320px',
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${achievement.color}18`, border: `1px solid ${achievement.color}40` }}
      >
        {achievement.icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] hud-font tracking-widest mb-0.5" style={{ color: achievement.color }}>
          \uD83C\uDFC5 ACHIEVEMENT FREIGESCHALTET
        </div>
        <div className="text-white text-sm font-bold hud-font truncate">{achievement.title}</div>
        <div className="text-slate-400 text-xs truncate">{achievement.description}</div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Game Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Timed-Out Overlay
// ---------------------------------------------------------------------------

function TimedOutOverlay() {
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel p-8 text-center max-w-sm w-full mx-4"
        style={{ border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 0 40px rgba(239,68,68,0.2)' }}
      >
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="hud-font text-2xl font-black text-red-400 mb-2 tracking-wider">ZEITLIMIT!</h2>
        <p className="text-slate-400 text-sm mb-4">
          AURA: „Zeitlimit überschritten. Zwangsevakuierung des Sektors eingeleitet."
        </p>
        <div className="rounded-xl p-3 mb-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="text-red-400 hud-font text-sm font-bold">⚠ +10 mSv Strahlungsstrafe</div>
          <div className="text-slate-500 text-xs mt-1">0 WP für diesen Sektor</div>
        </div>
        <div className="hud-font text-slate-400 text-sm">
          Weiter in <span className="text-red-400 font-bold text-lg">{countdown}</span>s…
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Acoustic feedback via Web Audio API
// ---------------------------------------------------------------------------

function playBeep(type: 'unlock' | 'event' | 'warning' | 'tick') {
  try {
    const ctx = new AudioContext()
    if (type === 'unlock') {
      // Two rising sine tones: C5 → E5 — positive/cheerful
      ;[523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.18
        gain.gain.setValueAtTime(0.28, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
        osc.start(t); osc.stop(t + 0.22)
      })
    } else if (type === 'event') {
      // Three descending square pulses: 660 → 520 → 440 Hz — alert
      ;[660, 520, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.13
        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
        osc.start(t); osc.stop(t + 0.14)
      })
    } else if (type === 'warning') {
      // 30-second warning: three fast descending pulses, louder & lower — urgency
      ;[440, 370, 311].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.value = freq
        const t = ctx.currentTime + i * 0.16
        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
        osc.start(t); osc.stop(t + 0.18)
      })
    } else if (type === 'tick') {
      // Per-second tick for last 10 s — short sharp click
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.09, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055)
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.055)
    }
    setTimeout(() => ctx.close(), 1200)
  } catch { /* AudioContext not available */ }
}

export default function Game() {
  const navigate = useNavigate()
  const [state, setState] = useState<TeamState | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [timerActive, setTimerActive] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null)
  const [toastAchievements, setToastAchievements] = useState<Achievement[]>([])
  const prevUnlockedRef = useRef(false)

  // Play unlock beep when teacher grants access (false → true)
  useEffect(() => {
    if (isUnlocked && !prevUnlockedRef.current) playBeep('unlock')
    prevUnlockedRef.current = isUnlocked
  }, [isUnlocked])

  // Check unlock status — BroadcastChannel für sofortige Reaktion + 5s Fallback
  useEffect(() => {
    function checkUnlock() {
      if (!state) return
      const nextLevel = state.currentLevel + 1
      const unlockedUpTo = getTeamUnlockedLevel(state.teamName)
      setIsUnlocked(nextLevel <= unlockedUpTo || state.currentLevel >= 20)
    }
    checkUnlock()
    const unsub = onBroadcastChange((type) => { if (type === 'unlock') checkUnlock() })
    const id = setInterval(checkUnlock, 5000)
    return () => { clearInterval(id); unsub() }
  }, [state])

  useEffect(() => {
    const s = loadState()
    if (!s) { navigate('/'); return }
    setState(s)
  }, [navigate])

  // Poll for teacher-triggered events
  useEffect(() => {
    if (!state) return
    function checkEvents() {
      if (!state) return
      const events = getGameEvents()
      const seen = new Set(getSeenEvents(state.teamName))
      const fresh = events.filter(e => !seen.has(e.id))
      if (fresh.length === 0) return

      // Apply all fresh events to state in localStorage
      for (const ev of fresh) {
        if (ev.dosimeterDelta !== 0 || ev.wpDelta !== 0) {
          applyEventToTeam(state.teamName, ev.dosimeterDelta, ev.wpDelta)
        }
        if (ev.type === 'extra_time' && ev.timeDelta) {
          setTimeLeft(t => t !== null ? t + ev.timeDelta! : null)
        }
        markEventSeen(state.teamName, ev.id)
      }
      // Show the most recent event as notification + acoustic alert
      setActiveEvent(fresh[fresh.length - 1])
      playBeep('event')
      // Re-read updated state
      const updated = loadState()
      if (updated) setState(updated)
    }
    checkEvents()
    const unsub = onBroadcastChange((type) => { if (type === 'event') checkEvents() })
    const id = setInterval(checkEvents, 5000)
    return () => { clearInterval(id); unsub() }
  }, [state?.teamName])

  // Start timer when level is unlocked
  useEffect(() => {
    if (!state || !isUnlocked || state.currentLevel >= 20) return
    const levelNumber = state.currentLevel + 1
    let limit = getEffectiveTimeLimit(levelNumber)
    // Leon bonus: +60s on his levels
    if (state.characterId === 'leon' && [11, 12, 13, 16, 20].includes(levelNumber)) limit += 60
    setTimeLeft(limit)
    setTimerActive(true)
  }, [state?.currentLevel, isUnlocked])

  useEffect(() => {
    if (!timerActive || timeLeft === null) return
    if (timeLeft <= 0) {
      setTimerActive(false)
      setTimedOut(true)
      return
    }
    if (timeLeft === 30) playBeep('warning')
    if (timeLeft <= 10 && timeLeft > 0) playBeep('tick')
    const id = setTimeout(() => setTimeLeft(t => (t ?? 1) - 1), 1000)
    return () => clearTimeout(id)
  }, [timerActive, timeLeft])

  const handleLevelComplete = useCallback((result: Parameters<LevelProps['onComplete']>[0]) => {
    if (!state) return
    // WP are awarded directly — no teacher review needed in this version
    const newState = applyLevelResult(state, {
      levelNumber: state.currentLevel + 1,
      wpEarned: result.wpEarned,
      dosimeterDelta: result.dosimeterDelta,
      completed: true,
      answers: result.answers,
      justification: result.justification,
      justificationWP: 0,
      justificationStatus: 'auto',
    })
    saveState(newState)
    setState(newState)
    setTimerActive(false)
    setIsUnlocked(false) // Reset — will be re-checked by the polling effect

    // Check for newly unlocked achievements
    const newIds = checkAchievements(newState)
    if (newIds.length > 0) {
      const unlocked = newIds
        .map(id => ACHIEVEMENTS.find(a => a.id === id))
        .filter(Boolean) as Achievement[]
      setToastAchievements(prev => [...prev, ...unlocked])
    }
  }, [state])

  // Auto-submit with penalty after timeout overlay
  useEffect(() => {
    if (!timedOut || !state) return
    const t = setTimeout(() => {
      handleLevelComplete({ wpEarned: 0, dosimeterDelta: 10, answers: { timedOut: true } })
      setTimedOut(false)
    }, 4000)
    return () => clearTimeout(t)
  }, [timedOut, state, handleLevelComplete])

  // Reset timedOut when level changes
  useEffect(() => {
    setTimedOut(false)
  }, [state?.currentLevel])

  if (!state) return null

  const levelNumber = state.currentLevel + 1

  // Shared notification overlay (visible on all screens)
  const notifOverlay = (
    <>
      {/* Teacher event notification (top-center) */}
      <AnimatePresence>
        {activeEvent && (
          <EventNotification
            key={activeEvent.id}
            event={activeEvent}
            onClose={() => setActiveEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Achievement toasts (bottom-left stack) */}
      <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toastAchievements.map((ach, i) => (
            <div key={`${ach.id}-${i}`} className="pointer-events-auto">
              <AchievementToast
                achievement={ach}
                onClose={() => setToastAchievements(prev => prev.filter((_, idx) => idx !== i))}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )

  // All 12 levels done
  if (state.currentLevel >= 20) {
    return <>{notifOverlay}<Endscreen state={state} /></>
  }

  // Level not yet unlocked by teacher — show waiting screen
  if (!isUnlocked) {
    return <>{notifOverlay}<WaitingScreen state={state} nextLevel={levelNumber} /></>
  }

  const char = getCharacter(state.characterId)
  const timeLimitForLevel = (() => {
    let limit = getEffectiveTimeLimit(levelNumber)
    if (state.characterId === 'leon' && [11, 12, 13, 16, 20].includes(levelNumber)) limit += 60
    return limit
  })()

  const LevelComponent = LEVELS[state.currentLevel]

  return (
    <div className="relative min-h-screen z-10">
      {/* Timed-out overlay */}
      <AnimatePresence>{timedOut && <TimedOutOverlay />}</AnimatePresence>

      {/* Event notification overlay */}
      {notifOverlay}

      {/* Header */}
      <div className="sticky top-0 z-20 p-3">
        <StatBar
          state={state}
          levelNumber={levelNumber}
          timeLeft={timerActive ? timeLeft : null}
          timeLimitSeconds={timeLimitForLevel}
        />
      </div>

      {/* Sector header */}
      <div className="px-4 py-3 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={levelNumber}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="hud-font text-xs tracking-widest mb-1" style={{ color: char.color }}>
              SEKTOR {SECTOR_NAMES[state.currentLevel]}
            </div>
            <div className="text-slate-500 text-xs">
              {char.bonusLevels.includes(levelNumber) && (
                <span className="text-yellow-400/80">⭐ {char.name} Bonus-Level (+{char.bonusWP} WP)</span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Level content */}
      <div className="px-4 pb-12 max-w-3xl mx-auto">
        {/* Story scene illustration */}
        <StoryScene levelNumber={levelNumber} />

        <AnimatePresence mode="wait">
          <motion.div
            key={levelNumber}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <GameContext.Provider value={{ state, completeLevel: handleLevelComplete, levelNumber, timeLeft }}>
              <LevelComponent state={state} onComplete={handleLevelComplete} />
            </GameContext.Provider>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}
