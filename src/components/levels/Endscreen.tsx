import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { TeamState, LevelResult } from '../../types/game'
import { getCharacter } from '../../lib/characters'
import { clearState, getAllTeamStates } from '../../lib/gameState'
import { ACHIEVEMENTS, getEarnedAchievements } from '../../lib/achievements'
import Avatar from '../ui/Avatar'

interface Props { state: TeamState }

const SECTOR_NAMES = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA',
  'ETA', 'THETA', 'IOTA', 'KAPPA', 'LAMBDA', 'MU',
  'NU', 'XI', 'OMIKRON', 'PI', 'RHO', 'SIGMA', 'TAU', 'YPSILON',
]

const SECTOR_THEMES = [
  'Notfall-Dispenser', 'Isotopenlabor', 'Strahlungsanalyse', 'Ausrüstungskammer',
  'Dekontamination', 'Technik-Modul', 'Holographie-Labor', 'Quantenarchiv',
  'Nuklidkarten-Terminal', 'Radiopharmazie', 'Datennetz', 'Quantenserver',
  'Archäologie-Labor', 'Hydroponics', 'Medizin-Station', 'Fusionsreaktor',
  'Wartekammer', 'Reaktorkern', 'Kraftwerk-Zentrale', 'Evakuierungs-Dock',
]

function getRank(wp: number, dos: number): { rank: string; label: string; color: string } {
  const score = wp - dos * 0.5
  if (score >= 200) return { rank: 'S', label: 'LEGENDÄR', color: '#f59e0b' }
  if (score >= 150) return { rank: 'A', label: 'HERVORRAGEND', color: '#10b981' }
  if (score >= 100) return { rank: 'B', label: 'GUT', color: '#06b6d4' }
  if (score >= 50) return { rank: 'C', label: 'AUSREICHEND', color: '#a78bfa' }
  return { rank: 'D', label: 'VERBESSERUNGSBEDARF', color: '#ef4444' }
}

function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remainder = mins % 60
    return `${hrs}h ${remainder}min`
  }
  return `${mins}min ${secs}s`
}

function getDecisionIcon(variant: 'best' | 'ok' | 'bad'): string {
  if (variant === 'best') return '⭐'
  if (variant === 'ok') return '⚡'
  return '⚠'
}

function getLevelVariant(lr: LevelResult): 'best' | 'ok' | 'bad' {
  if (lr.dosimeterDelta === 0) return 'best'
  if (lr.dosimeterDelta <= 5) return 'ok'
  return 'bad'
}

// SVG scene: Capsule escaping from NOVA-7
function VictoryScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 600 200" className="w-full h-48 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, #020617, #0c1445)' }}>
      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <circle key={i} cx={(i * 37 + 13) % 600} cy={(i * 23 + 7) % 200} r={0.5 + (i % 3) * 0.5} fill="white" opacity={0.3 + (i % 5) * 0.1}>
          <animate attributeName="opacity" values={`${0.2 + (i % 3) * 0.1};${0.6 + (i % 2) * 0.2};${0.2 + (i % 3) * 0.1}`} dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Earth */}
      <circle cx="500" cy="160" r="80" fill="#1e3a8a" opacity="0.4" />
      <circle cx="500" cy="160" r="80" fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3" />
      <ellipse cx="490" cy="150" rx="30" ry="20" fill="#22c55e" opacity="0.2" />
      <ellipse cx="520" cy="170" rx="15" ry="10" fill="#22c55e" opacity="0.15" />

      {/* NOVA-7 station (shrinking in distance) */}
      <g opacity="0.6">
        <rect x="230" y="70" width="60" height="30" rx="4" fill="#0c1a2e" stroke="#1e3a8a" strokeWidth="1" />
        <rect x="245" y="60" width="30" height="10" rx="2" fill="#030712" stroke="#1e3a8a" strokeWidth="0.5" />
        <rect x="215" y="78" width="15" height="6" rx="1" fill="#030712" stroke="#334155" strokeWidth="0.5" />
        <rect x="290" y="78" width="15" height="6" rx="1" fill="#030712" stroke="#334155" strokeWidth="0.5" />
        <text x="260" y="89" textAnchor="middle" fill="#475569" fontSize="5" fontFamily="monospace">U.S.S. BLANKENAGEL</text>
        {/* Status glow */}
        <circle cx="260" cy="80" r="20" fill="none" stroke={success ? '#06b6d4' : '#ef4444'} strokeWidth="0.5" opacity="0.3">
          <animate attributeName="r" values="20;25;20" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Escape capsule */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0;-20,-5;-40,-10" dur="4s" repeatCount="indefinite" />
        <ellipse cx="120" cy="90" rx="30" ry="16" fill="#1e3a8a" stroke="#06b6d4" strokeWidth="1.5" />
        <ellipse cx="120" cy="90" rx="20" ry="10" fill="#0c1a2e" />
        {/* Window */}
        <ellipse cx="112" cy="87" rx="6" ry="5" fill="#030712" stroke="#06b6d4" strokeWidth="0.5" />
        {/* Engine glow */}
        <ellipse cx="150" cy="90" rx="8" ry="4" fill="#06b6d4" opacity="0.4">
          <animate attributeName="rx" values="8;12;8" dur="0.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="155" cy="90" rx="4" ry="2" fill="#7c3aed" opacity="0.6">
          <animate attributeName="rx" values="4;7;4" dur="0.3s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Header text */}
      <text x="300" y="25" textAnchor="middle" fill={success ? '#10b981' : '#ef4444'} fontSize="10" fontFamily="monospace" fontWeight="bold">
        {success ? 'EVAKUIERUNG ERFOLGREICH' : 'STRAHLENBELASTUNG KRITISCH'}
      </text>

      {/* Footer text */}
      <text x="300" y="185" textAnchor="middle" fill="#475569" fontSize="7" fontFamily="monospace">
        {success ? 'Dr. Kern gerettet — Rettungskapsel unterwegs zur Erde' : 'Mission beendet — Daten gesichert für zukünftige Crews'}
      </text>
    </svg>
  )
}

// Animated counter component
function AnimatedStat({ value, suffix, color, delay }: { value: number; suffix: string; color: string; delay: number }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200
      const steps = 30
      const increment = value / steps
      let current = 0
      const interval = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayed(value)
          clearInterval(interval)
        } else {
          setDisplayed(Math.round(current))
        }
      }, duration / steps)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <span className="font-bold text-2xl hud-font" style={{ color }}>
      {displayed}{suffix}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Nutzen & Risiken Reflexion (UK-Kompetenz: Urteilskompetenz)
// ---------------------------------------------------------------------------

const NUTZEN_ITEMS = [
  {
    icon: '🏥',
    title: 'Medizin',
    uses: ['Szintigraphie (Tc-99m)', 'Tumorbestrahlung (Co-60)', 'PET-Scan (F-18)', 'Sterilisation med. Geräte'],
    color: '#10b981',
  },
  {
    icon: '⚡',
    title: 'Energie',
    uses: ['Kernspaltung (U-235)', 'Keine CO₂-Emissionen im Betrieb', 'Grundlastfähig'],
    color: '#f59e0b',
  },
  {
    icon: '🔬',
    title: 'Forschung & Technik',
    uses: ['Altersbestimmung (C-14)', 'Materialprüfung', 'Lebensmittelbestrahlung', 'Rauchmelder (Am-241)'],
    color: '#06b6d4',
  },
]

const RISIKEN_ITEMS = [
  { icon: '☢', text: 'Ionisierende Strahlung schädigt DNA (Mutationen, Krebs)', color: '#ef4444' },
  { icon: '⚗', text: 'Radioaktiver Abfall bleibt jahrtausendelang aktiv', color: '#f59e0b' },
  { icon: '💧', text: 'Kontamination von Boden und Wasser möglich', color: '#f59e0b' },
  { icon: '🌋', text: 'Reaktorunfälle: Tschernobyl, Fukushima', color: '#ef4444' },
  { icon: '🫁', text: 'Interne Bestrahlung (α intern) ist besonders gefährlich', color: '#ef4444' },
]

function NutzenRisikenSection() {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.9 }}
      className="glass-panel w-full max-w-2xl mb-6 p-5"
    >
      <h3 className="hud-font text-sm text-white mb-1 flex items-center gap-2">
        <span style={{ color: '#a78bfa' }}>▶</span> NUTZEN & RISIKEN IONISIERENDER STRAHLUNG
        <span className="ml-auto text-[10px] text-slate-500 hud-font">URTEILSKOMPETENZ (UK)</span>
      </h3>
      <p className="text-slate-500 text-xs mb-4">
        Radioaktivität ist kein Gut oder Übel — es kommt auf den Kontext an.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {NUTZEN_ITEMS.map(item => (
          <div
            key={item.title}
            className="rounded-xl p-3"
            style={{ background: `${item.color}08`, border: `1px solid ${item.color}25` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{item.icon}</span>
              <span className="hud-font text-xs font-bold" style={{ color: item.color }}>{item.title}</span>
            </div>
            <ul className="space-y-0.5">
              {item.uses.map(u => (
                <li key={u} className="text-[10px] text-slate-400 flex items-start gap-1">
                  <span style={{ color: item.color }} className="mt-0.5 flex-shrink-0">·</span>
                  {u}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowDetails(v => !v)}
        className="w-full py-2 rounded-lg text-xs hud-font tracking-wider cursor-pointer transition-all mb-3"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
      >
        {showDetails ? '▲ RISIKEN AUSBLENDEN' : '▼ RISIKEN EINBLENDEN'}
      </button>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 mb-3"
        >
          {RISIKEN_ITEMS.map(r => (
            <div key={r.text} className="flex items-start gap-2 rounded-lg p-2"
              style={{ background: `${r.color}08`, border: `1px solid ${r.color}20` }}>
              <span style={{ color: r.color }} className="flex-shrink-0 mt-0.5">{r.icon}</span>
              <span className="text-[11px] text-slate-300">{r.text}</span>
            </div>
          ))}
        </motion.div>
      )}

      <div className="rounded-xl p-3" style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          <span className="text-purple-400 font-bold">Fazit:</span> Strahlenschutz (Zeit · Abstand · Abschirmung) und die strikte Trennung zwischen medizinischer Nutzung und unkontrollierter Exposition sind entscheidend. Der Grenzwert von 1 mSv/Jahr für die Bevölkerung orientiert sich am Prinzip ALARA — „As Low As Reasonably Achievable".
        </p>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Achievements section
// ---------------------------------------------------------------------------

function AchievementsSection({ teamName }: { teamName: string }) {
  const earnedIds = new Set(getEarnedAchievements(teamName))
  const earned = ACHIEVEMENTS.filter(a => earnedIds.has(a.id))
  const locked = ACHIEVEMENTS.filter(a => !earnedIds.has(a.id))

  if (earned.length === 0 && locked.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.0 }}
      className="glass-panel w-full max-w-2xl mb-6 p-5"
    >
      <h3 className="hud-font text-sm text-white mb-4 flex items-center gap-2">
        <span style={{ color: '#f59e0b' }}>▶</span> ACHIEVEMENTS
        <span className="ml-auto text-[10px] text-slate-500 hud-font">
          {earned.length}/{ACHIEVEMENTS.length}
        </span>
      </h3>

      {earned.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {earned.map(ach => (
            <motion.div
              key={ach.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl p-3 flex items-center gap-2"
              style={{
                background: `${ach.color}12`,
                border: `1px solid ${ach.color}35`,
              }}
            >
              <span className="text-xl flex-shrink-0">{ach.icon}</span>
              <div className="min-w-0">
                <div className="text-xs font-bold hud-font truncate" style={{ color: ach.color }}>
                  {ach.title}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight truncate">
                  {ach.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <div className="text-[10px] hud-font text-slate-600 mb-2 tracking-wider">NICHT FREIGESCHALTET</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {locked.map(ach => (
              <div
                key={ach.id}
                className="rounded-xl p-2 flex flex-col items-center gap-1 text-center opacity-30"
                style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(51,65,85,0.3)' }}
                title={ach.description}
              >
                <span className="text-lg grayscale">{ach.icon}</span>
                <div className="text-[9px] hud-font text-slate-600 truncate w-full">{ach.title}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Gruppen-Foto-Wand
// ---------------------------------------------------------------------------
function GroupPhotoWall({ currentTeam }: { currentTeam: string }) {
  const allTeams = Object.values(getAllTeamStates())
  const withAvatar = allTeams.filter(t => t.avatarConfig)

  if (withAvatar.length < 2) return null // Nur zeigen wenn mehrere Teams da sind

  const getRankColor = (t: TeamState) => {
    const score = t.wissensPunkte - t.dosimeterMSv * 0.5
    if (score >= 200) return '#f59e0b'
    if (score >= 150) return '#10b981'
    if (score >= 100) return '#06b6d4'
    if (score >= 50)  return '#a78bfa'
    return '#ef4444'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.1 }}
      className="glass-panel w-full max-w-2xl mb-6 p-5"
    >
      <h3 className="hud-font text-sm text-white mb-1 flex items-center gap-2">
        <span style={{ color: '#06b6d4' }}>▶</span> CREW-FOTO
        <span className="ml-auto text-[10px] text-slate-500 hud-font">U.S.S. BLANKENAGEL</span>
      </h3>
      <p className="text-slate-500 text-xs mb-4">Alle Besatzungsmitglieder dieser Mission</p>

      <div className="flex flex-wrap gap-4 justify-center">
        {withAvatar
          .sort((a, b) => b.wissensPunkte - a.wissensPunkte)
          .map((t, i) => {
            const rankColor = getRankColor(t)
            const isCurrent = t.teamName === currentTeam
            return (
              <motion.div
                key={t.teamName}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2.2 + i * 0.1, type: 'spring' }}
                className="flex flex-col items-center gap-1.5"
                style={{
                  filter: isCurrent ? 'drop-shadow(0 0 12px rgba(6,182,212,0.6))' : undefined,
                }}
              >
                {/* Rang-Krone für Platz 1 */}
                {i === 0 && <div className="text-lg">👑</div>}

                <div className="relative">
                  <Avatar
                    config={t.avatarConfig!}
                    size={isCurrent ? 72 : 60}
                    animId={`crew-${t.teamName}`}
                    showName={false}
                  />
                  {/* Rang-Ring */}
                  <div className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      boxShadow: `0 0 0 ${isCurrent ? 3 : 2}px ${isCurrent ? '#06b6d4' : rankColor}55`,
                    }}
                  />
                </div>

                <div className="text-center max-w-[72px]">
                  <div className="text-white hud-font text-xs font-bold truncate">
                    {t.avatarConfig!.avatarName || t.teamName}
                  </div>
                  <div className="hud-font font-bold" style={{ fontSize: 10, color: rankColor }}>
                    {t.wissensPunkte} WP
                  </div>
                  {i === 0 && <div style={{ fontSize: 9, color: '#f59e0b' }} className="hud-font">PLATZ 1</div>}
                </div>
              </motion.div>
            )
          })}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Endscreen
// ---------------------------------------------------------------------------

export default function Endscreen({ state }: Props) {
  const navigate = useNavigate()
  const char = getCharacter(state.characterId)
  const success = state.dosimeterMSv < 120

  const totalTime = Date.now() - state.startedAt
  const rankInfo = getRank(state.wissensPunkte, state.dosimeterMSv)

  // Count pending justification WP
  const pendingCount = state.levelResults.filter(
    lr => lr.justification && lr.justificationStatus !== 'approved'
  ).length
  const approvedJustWP = state.levelResults
    .filter(lr => lr.justificationStatus === 'approved')
    .reduce((sum, lr) => sum + (lr.justificationWP ?? 0), 0)
  const pendingJustWP = state.levelResults
    .filter(lr => lr.justification && lr.justificationStatus !== 'approved')
    .reduce((sum, lr) => sum + (lr.justificationWP ?? 0), 0)

  // Per-level stats
  const bestCount = state.levelResults.filter(lr => lr.dosimeterDelta === 0).length
  const okCount = state.levelResults.filter(lr => lr.dosimeterDelta > 0 && lr.dosimeterDelta <= 5).length
  const badCount = state.levelResults.filter(lr => lr.dosimeterDelta > 5).length

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 z-10 relative">
      {/* Victory/Failure Scene */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-2xl"
      >
        <VictoryScene success={success} />
      </motion.div>

      {/* Mission Result Header */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8, delay: 0.3 }}
        className="text-center mb-6"
      >
        <div className="text-6xl mb-3">{success ? '🚀' : '☢️'}</div>
        <h1
          className="hud-font text-3xl font-black mb-1"
          style={{ color: success ? '#10b981' : '#ef4444' }}
        >
          {success ? 'MISSION ERFOLGREICH' : 'MISSION GESCHEITERT'}
        </h1>
        <p className="text-slate-400 text-sm">
          {success
            ? 'Dr. Kern gerettet. U.S.S. Blankenagel evakuiert. Gut gemacht!'
            : 'Zu viel Strahlung aufgenommen. Aber wertvolle Erkenntnisse gewonnen.'}
        </p>
      </motion.div>

      {/* Rank Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, delay: 0.6 }}
        className="mb-6"
      >
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${rankInfo.color}20, ${rankInfo.color}05)`,
            border: `3px solid ${rankInfo.color}`,
            boxShadow: `0 0 30px ${rankInfo.color}30`,
          }}
        >
          <div className="hud-font text-4xl font-black" style={{ color: rankInfo.color }}>
            {rankInfo.rank}
          </div>
          <div className="text-[8px] hud-font tracking-widest" style={{ color: rankInfo.color }}>
            {rankInfo.label}
          </div>
        </div>
      </motion.div>

      {/* Team + Character Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-5 w-full max-w-2xl mb-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {state.avatarConfig
              ? <Avatar config={state.avatarConfig} size={56} showName={false} animId="end-avatar" />
              : <div className="text-3xl">{char.icon}</div>
            }
            <div>
              <div className="hud-font font-bold text-white text-lg">{state.teamName}</div>
              {state.avatarConfig?.avatarName && (
                <div className="text-cyan-400/80 text-xs hud-font">{state.avatarConfig.avatarName}</div>
              )}
              <div style={{ color: char.color }} className="text-sm">{char.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 hud-font">
            <span>⏱</span>
            <span>{formatDuration(totalTime)}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl mb-4"
      >
        {/* WP */}
        <div className="glass-panel p-4 text-center">
          <AnimatedStat value={state.wissensPunkte} suffix=" WP" color="#f59e0b" delay={900} />
          <div className="text-[10px] text-slate-500 hud-font mt-1">WISSENSPUNKTE</div>
        </div>
        {/* Dosimeter */}
        <div className="glass-panel p-4 text-center">
          <AnimatedStat
            value={state.dosimeterMSv}
            suffix=" mSv"
            color={state.dosimeterMSv < 80 ? '#10b981' : state.dosimeterMSv < 120 ? '#f59e0b' : '#ef4444'}
            delay={1100}
          />
          <div className="text-[10px] text-slate-500 hud-font mt-1">DOSIMETER</div>
        </div>
        {/* Perfect levels */}
        <div className="glass-panel p-4 text-center">
          <AnimatedStat value={bestCount} suffix="/12" color="#10b981" delay={1300} />
          <div className="text-[10px] text-slate-500 hud-font mt-1">PERFEKTE SEKTOREN</div>
        </div>
        {/* Budget remaining */}
        <div className="glass-panel p-4 text-center">
          <AnimatedStat value={state.budget} suffix=" Cr" color="#06b6d4" delay={1500} />
          <div className="text-[10px] text-slate-500 hud-font mt-1">BUDGET ÜBRIG</div>
        </div>
      </motion.div>

      {/* Pending Justification WP */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="w-full max-w-2xl mb-4"
        >
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="text-cyan-400 hud-font text-sm font-bold mb-1">
              ⏳ {pendingCount} BEGRÜNDUNGEN AUSSTEHEND
            </div>
            <div className="text-slate-400 text-xs">
              {pendingJustWP > 0
                ? `~${pendingJustWP} WP ausstehend — dein Lehrer bewertet deine Begründungen`
                : 'Dein Lehrer bewertet noch deine Begründungen — WP folgen'}
            </div>
            {approvedJustWP > 0 && (
              <div className="text-emerald-400 text-xs mt-1 hud-font">
                ✓ {approvedJustWP} Begründungs-WP bereits bestätigt
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Decision Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="w-full max-w-2xl mb-4"
      >
        <div className="glass-panel p-4">
          <div className="flex justify-around text-center">
            <div>
              <div className="text-emerald-400 text-xl font-bold hud-font">{bestCount}</div>
              <div className="text-[10px] text-slate-500 hud-font">⭐ OPTIMAL</div>
            </div>
            <div className="border-l border-slate-700/50 mx-2" />
            <div>
              <div className="text-yellow-400 text-xl font-bold hud-font">{okCount}</div>
              <div className="text-[10px] text-slate-500 hud-font">⚡ AKZEPTABEL</div>
            </div>
            <div className="border-l border-slate-700/50 mx-2" />
            <div>
              <div className="text-red-400 text-xl font-bold hud-font">{badCount}</div>
              <div className="text-[10px] text-slate-500 hud-font">⚠ SCHLECHT</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Per-Level Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="glass-panel w-full max-w-2xl mb-6 overflow-hidden"
      >
        <div className="px-5 pt-4 pb-2">
          <h3 className="hud-font text-sm text-white flex items-center gap-2">
            <span style={{ color: '#06b6d4' }}>▶</span> SEKTORÜBERSICHT
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-2 hud-font text-slate-500">SEKTOR</th>
                <th className="text-left px-3 py-2 hud-font text-slate-500 hidden sm:table-cell">THEMA</th>
                <th className="text-right px-3 py-2 hud-font text-yellow-500">WP</th>
                <th className="text-right px-3 py-2 hud-font text-slate-500">DOSIS</th>
                <th className="text-center px-3 py-2 hud-font text-slate-500">ERGEBNIS</th>
                <th className="text-center px-3 py-2 hud-font text-slate-500">BEGR.</th>
              </tr>
            </thead>
            <tbody>
              {state.levelResults.map((lr, i) => {
                const variant = getLevelVariant(lr)
                const variantColor = variant === 'best' ? '#10b981' : variant === 'ok' ? '#f59e0b' : '#ef4444'
                const isBonus = char.bonusLevels.includes(lr.levelNumber)

                return (
                  <motion.tr
                    key={lr.levelNumber}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.06 }}
                    className="border-b border-slate-800/30"
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-cyan-400 font-bold">{SECTOR_NAMES[lr.levelNumber - 1]}</span>
                      {isBonus && <span className="ml-1 text-yellow-400" title="Charakter-Bonus">⭐</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-400 hidden sm:table-cell">
                      {SECTOR_THEMES[lr.levelNumber - 1]}
                    </td>
                    <td className="px-3 py-2.5 text-right hud-font font-bold text-yellow-400">
                      +{lr.wpEarned}
                    </td>
                    <td className="px-3 py-2.5 text-right hud-font font-bold" style={{ color: variantColor }}>
                      +{lr.dosimeterDelta}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span title={variant === 'best' ? 'Optimal' : variant === 'ok' ? 'Akzeptabel' : 'Schlecht'}>
                        {getDecisionIcon(variant)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {lr.justification ? (
                        lr.justificationStatus === 'approved' ? (
                          <span className="text-emerald-400" title={`Bestätigt: +${lr.justificationWP} WP`}>✓</span>
                        ) : (
                          <span className="text-cyan-400 blink" title="Ausstehend">⏳</span>
                        )
                      ) : (
                        <span className="text-slate-600">–</span>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-600/50">
                <td className="px-4 py-3 hud-font text-white font-bold" colSpan={2}>
                  GESAMT
                </td>
                <td className="px-3 py-3 text-right hud-font font-bold text-yellow-400">
                  {state.wissensPunkte} WP
                </td>
                <td className="px-3 py-3 text-right hud-font font-bold"
                  style={{ color: state.dosimeterMSv < 80 ? '#10b981' : state.dosimeterMSv < 120 ? '#f59e0b' : '#ef4444' }}>
                  {state.dosimeterMSv} mSv
                </td>
                <td className="px-3 py-3" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Equipment Summary */}
      {state.equipment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="glass-panel p-4 w-full max-w-2xl mb-6"
        >
          <h3 className="hud-font text-xs text-slate-400 mb-2">AUSRÜSTUNG</h3>
          <div className="flex flex-wrap gap-2">
            {state.equipment.map((eq, i) => (
              <span key={i} className="px-3 py-1 rounded-full text-xs hud-font"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: '#67e8f9' }}>
                {eq}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Nutzen & Risiken Reflexion */}
      <NutzenRisikenSection />

      {/* Achievements */}
      <AchievementsSection teamName={state.teamName} />

      {/* Gruppen-Foto-Wand */}
      <GroupPhotoWall currentTeam={state.teamName} />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button
          onClick={() => navigate('/highscore')}
          className="px-8 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}
        >
          🏆 HIGHSCORE
        </button>
        <button
          onClick={() => { clearState(); navigate('/') }}
          className="px-6 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(6,182,212,0.3)', color: '#94a3b8' }}
        >
          NEU STARTEN
        </button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="mt-8 text-center"
      >
        <p className="text-slate-600 text-xs hud-font tracking-widest">
          U.S.S. BLANKENAGEL — MISSION ABGESCHLOSSEN
        </p>
      </motion.div>
    </div>
  )
}
