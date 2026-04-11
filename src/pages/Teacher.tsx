import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCharacter } from '../lib/characters'
import {
  getAllTeamStates, getTeamUnlockedLevel, setTeamUnlockedLevel,
  pushGameEvent, getGameEvents, clearGameEvents, broadcastChange,
  getGlobalTimer, setGlobalTimer, clearGlobalTimer,
  type GameEvent,
} from '../lib/gameState'
import type { TeamState, LevelResult } from '../types/game'
import Avatar from '../components/ui/Avatar'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REVIEW_KEY = 'nova7_teacher_reviews'
const PIN_KEY = 'nova7_teacher_pin'
const getTeacherPin = () => localStorage.getItem(PIN_KEY) ?? '1234'
const setTeacherPin = (pin: string) => localStorage.setItem(PIN_KEY, pin)

const SECTOR_NAMES = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA',
  'ETA', 'THETA', 'IOTA', 'KAPPA', 'LAMBDA', 'MU',
  'NU', 'XI', 'OMIKRON', 'PI', 'RHO', 'SIGMA', 'TAU', 'YPSILON',
]

const LEVEL_QUESTIONS: Record<number, string> = {
  1:  'Begründe deine Wahl. Erkläre welche Strahlung dich bedroht und wie deine Ausrüstung schützt.',
  2:  'Warum benötigt Gamma-Strahlung Blei als Abschirmung, während Alpha-Strahlung schon durch Papier gestoppt wird?',
  3:  'Erkläre, warum Radon die bedeutendste natürliche Strahlenquelle ist und wie es in unserer Umgebung entsteht.',
  4:  'Erkläre den Unterschied zwischen dem Schutz vor externer und interner Strahlenbelastung.',
  5:  'Erkläre den Unterschied zwischen Bestrahlung und Kontamination. Warum ist interne Kontamination besonders gefährlich?',
  6:  'Erkläre Schritt für Schritt, wie das Zählrohr Strahlung in ein messbares Signal umwandelt.',
  7:  'Erkläre anhand von Ladung, Masse und Lorentzkraft, warum die Spuren unterschiedlich stark abgelenkt werden.',
  8:  'Was passiert beim Alpha-Zerfall mit Ordnungszahl und Massenzahl? Gib die allgemeine Zerfallsgleichung an.',
  9:  'Erkläre anhand des N/Z-Verhältnisses, warum bestimmte Kerne stabil sind und andere durch α, β⁻ oder β⁺ zerfallen.',
  10: 'Erkläre, nach welchen Kriterien (Emissionstyp, Halbwertszeit) man zwischen einem diagnostischen und einem therapeutischen Radioisotop unterscheidet.',
  11: 'Erkläre, was die Halbwertszeit beschreibt und warum die Kurve exponentiell abfällt.',
  12: 'Erkläre, was mit den radioaktiven Atomen bei jedem Zerfall passiert und warum der Zerfall nie vollständig aufhört.',
  13: 'Erkläre, wie die C-14-Methode funktioniert und warum sie nur für organische Materialien bis ca. 50.000 Jahre anwendbar ist.',
  14: 'Warum ist interne Strahlenbelastung durch Essen gefährlicher als externe Strahlung aus der Umgebung?',
  15: 'Erkläre, warum ab einer Dosis von etwa 2 Sv das Knochenmark besonders kritisch betroffen ist und was das für den menschlichen Körper bedeutet.',
  16: 'Erkläre das quadratische Abstandsgesetz in eigenen Worten. Warum gilt es für Punktstrahler?',
  17: 'Begründe ausführlich, warum du dich für diesen Raum entschieden hast.',
  18: 'Erkläre, was bei der Kernspaltung von U-235 passiert und wie Steuerstäbe die Kettenreaktion kontrollieren.',
  19: 'Erkläre die Funktion der Reaktorkomponenten und warum die Endlagerung so lange dauert.',
  20: 'Was sagen diese Messwerte über die Abschirmwirkung des Bunkers aus?',
}

const LEVEL_KEYWORDS: Record<number, string[]> = {
  1:  ['inhalieren', 'alpha intern', 'filtermaske', 'abschirmung', 'schutzanzug', 'ionisierend', 'gamma', 'blei', 'beta', 'strahlung'],
  2:  ['ionisierungsvermögen', 'durchdringungsvermögen', 'masse', 'ladung', 'wechselwirkung', 'reichweite', 'heliumkern', 'elektron'],
  3:  ['radon', 'kosmisch', 'terrestrisch', 'natürlich', 'künstlich', 'hintergrundstrahlung', 'millisievert', 'quelle', 'kernkraft', 'medizin'],
  4:  ['intern', 'inhalation', 'direkte nähe', 'alpha intern', 'filtermaske', 'körper', 'gamma', 'blei', 'durchdringend'],
  5:  ['kontamination', 'bestrahlung', 'extern', 'intern', 'haut', 'einatmen', 'dekontamination', 'körper', 'quelle', 'partikel'],
  6:  ['ionisierung', 'zählgas', 'elektronen', 'spannung', 'impuls', 'gasentladung', 'verstärker', 'messung'],
  7:  ['lorentzkraft', 'ladung', 'masse', 'radius', 'magnetisch', 'ablenkung', 'leicht', 'schwer', 'heliumkern', 'elektron'],
  8:  ['ordnungszahl', 'massenzahl', '-2', '-4', 'heliumkern', 'mutterkern', 'tochterkern', 'alpha', 'beta', 'zerfall'],
  9:  ['stabilitätslinie', 'n/z-verhältnis', 'neutronenüberschuss', 'protonenüberschuss', 'alpha', 'beta', 'stabil', 'bindungsenergie', 'schwer'],
  10: ['halbwertszeit', 'diagnostik', 'therapie', 'gamma', 'beta', 'alpha', 'szintigraphie', 'pet', 'isotop', 'tc-99m', 'schilddrüse'],
  11: ['hälfte', 'zeitraum', 'zerfallen', 'exponentiell', 'proportional', 'kernanzahl', 'halbwertszeit'],
  12: ['instabil', 'zerfallen', 'tochterkern', 'strahlung', 'exponentiell', 'wahrscheinlichkeit', 'nie null', 'halbwertszeit'],
  13: ['kohlenstoff', 'c-14', 'datierung', 'halbwertszeit', 'organisch', 'verhältnis', 'archäologie', 'zerfall', 'alter'],
  14: ['intern', 'direkte nähe', 'alpha intern', 'ungehindert', 'gewebe', 'kein abstand', 'schutzkleidung', 'inhalation', 'kontamination'],
  15: ['0,5 sv', 'symptome', 'knochenmark', 'schwellenwert', 'dosis', 'letal', 'akut', 'strahlenkrankheit', 'grenzwert', 'zellen'],
  16: ['quadratisch', 'kugelwelle', 'fläche', 'abstand', 'intensität', 'punktstrahler', 'verteilt', 'abstandsgesetz'],
  17: ['beton', 'abschirmung', 'gamma', 'beta', 'reichweite', 'fenster', 'keller', 'wanddicke', 'abstand', 'schutzwirkung', 'massiv'],
  18: ['spaltung', 'neutron', 'kettenreaktion', 'kritisch', 'steuerstab', 'moderator', 'uran', 'energie', 'spaltprodukt', 'u-235'],
  19: ['brennstab', 'moderator', 'steuerstab', 'kühlmittel', 'endlager', 'spaltprodukt', 'halbwertszeit', 'plutonium', 'cäsium'],
  20: ['faktor', 'reduktion', 'abschirmung', 'beton', 'sicher', 'grenzwert', 'differenz', 'verhältnis'],
}

// ---------------------------------------------------------------------------
// Event presets
// ---------------------------------------------------------------------------

interface EventPreset {
  type: string
  icon: string
  title: string
  message: string
  dosimeterDelta: number
  wpDelta: number
  color: string
  desc: string
}

const EVENT_PRESETS: EventPreset[] = [
  {
    type: 'sonnensturm', icon: '☀️',
    title: 'SONNENSTURM', color: '#ef4444',
    message: 'Koronaler Massenauswurf trifft U.S.S. Blankenagel. Erhöhte Strahlungsbelastung für alle Crews.',
    dosimeterDelta: 3, wpDelta: 0,
    desc: '+3 mSv für alle Teams',
  },
  {
    type: 'druckwelle', icon: '💥',
    title: 'DRUCKWELLE', color: '#f97316',
    message: 'Explosion im Technikschacht! Druckwelle erschüttert die Station. Erhöhte Strahlung.',
    dosimeterDelta: 5, wpDelta: 0,
    desc: '+5 mSv für alle Teams',
  },
  {
    type: 'kuehlsystem', icon: '🔧',
    title: 'KÜHLSYSTEM REPARIERT', color: '#10b981',
    message: 'Notfall-Ingenieure haben das Kühlsystem stabilisiert. Reaktortemperatur sinkt.',
    dosimeterDelta: 0, wpDelta: 5,
    desc: '+5 WP Bonus für alle',
  },
  {
    type: 'bonus', icon: '🎁',
    title: 'FORSCHUNGS-BONUS', color: '#f59e0b',
    message: 'Missionszentrale bestätigt: Eure Daten sind entscheidend. Bonus-WP genehmigt!',
    dosimeterDelta: 0, wpDelta: 10,
    desc: '+10 WP Bonus für alle',
  },
  {
    type: 'alarm', icon: '⚠️',
    title: 'STATIONS-ALARM', color: '#a78bfa',
    message: 'AURA: Unbekanntes Signal detektiert. Alle Crews auf Alarmbereitschaft schalten.',
    dosimeterDelta: 0, wpDelta: 0,
    desc: 'Nur Benachrichtigung',
  },
]

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------

function exportCSV(teams: TeamState[]) {
  const today = new Date().toLocaleDateString('de-DE')
  const rows: string[] = []

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`

  // === Kopfzeile ===
  rows.push(esc(`U.S.S. Blankenagel Klassenauswertung — ${today}`))
  rows.push('')

  // === Zusammenfassung ===
  rows.push(esc('=== ZUSAMMENFASSUNG ==='))
  rows.push([
    'Team', 'Charakter', 'WP (gesamt)', 'WP (Aufgaben)', 'WP (Begründungen)',
    'Dosimeter (mSv)', 'Budget übrig (Cr)', 'Level abgeschlossen', 'Spielzeit (min)', 'Rang',
  ].map(esc).join(';'))

  for (const t of teams) {
    const char = getCharacter(t.characterId)
    const taskWP = t.levelResults.reduce((s, lr) => s + lr.wpEarned, 0)
    const justWP = t.levelResults.reduce((s, lr) => s + (lr.justificationStatus === 'approved' ? (lr.justificationWP ?? 0) : 0), 0)
    const playtime = t.startedAt ? Math.round((Date.now() - t.startedAt) / 60000) : 0
    const score = t.wissensPunkte - t.dosimeterMSv * 0.5
    const rank = score >= 200 ? 'S' : score >= 150 ? 'A' : score >= 100 ? 'B' : score >= 50 ? 'C' : 'D'
    rows.push([
      t.teamName, char.name, t.wissensPunkte, taskWP, justWP,
      t.dosimeterMSv, t.budget, t.currentLevel, playtime, rank,
    ].map(esc).join(';'))
  }

  rows.push('')
  // === Detailtabelle ===
  rows.push(esc('=== DETAIL PRO SEKTOR ==='))
  rows.push([
    'Team', 'Charakter', 'Sektor', 'Level',
    'WP (Aufgabe)', 'WP (Begründung)', 'Begründungs-Status',
    'Dosimeter-Delta (mSv)', 'Entscheidungsqualität', 'Begründungstext',
  ].map(esc).join(';'))

  const SNAMES = ['ALPHA','BETA','GAMMA','DELTA','EPSILON','ZETA','ETA','THETA','IOTA','KAPPA','LAMBDA','MU','NU','XI','OMIKRON','PI']

  for (const t of teams) {
    const char = getCharacter(t.characterId)
    for (const lr of t.levelResults) {
      const quality = lr.dosimeterDelta === 0 ? 'optimal' : lr.dosimeterDelta <= 5 ? 'akzeptabel' : 'schlecht'
      const jStatus = lr.justificationStatus === 'approved' ? 'bestätigt' : lr.justificationStatus === 'auto' ? 'auto' : 'ausstehend'
      rows.push([
        t.teamName, char.name,
        SNAMES[lr.levelNumber - 1] ?? `L${lr.levelNumber}`,
        lr.levelNumber,
        lr.wpEarned,
        lr.justificationStatus === 'approved' ? (lr.justificationWP ?? 0) : 0,
        jStatus,
        lr.dosimeterDelta,
        quality,
        lr.justification ?? '',
      ].map(esc).join(';'))
    }
  }

  const bom = '\uFEFF' // UTF-8 BOM für Excel
  const blob = new Blob([bom + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `nova7_auswertung_${today.replace(/\./g, '-')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TeacherReview {
  teamName: string
  levelNumber: number
  status: 'pending' | 'auto' | 'approved'
  overrideWP?: number
  reviewedAt?: number
}

type StatusFilter = 'all' | 'pending' | 'auto' | 'approved'

interface JustificationEntry {
  teamName: string
  characterId: string
  levelNumber: number
  justification: string
  justificationWP: number
  justificationStatus: 'pending' | 'auto' | 'approved'
  keywords: string[]
  question: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadReviews(): TeacherReview[] {
  try { return JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '[]') }
  catch { return [] }
}

function saveReviews(reviews: TeacherReview[]) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews))
}

function getReview(reviews: TeacherReview[], teamName: string, levelNumber: number) {
  return reviews.find(r => r.teamName === teamName && r.levelNumber === levelNumber)
}

function collectJustifications(teams: Record<string, TeamState>, reviews: TeacherReview[]): JustificationEntry[] {
  const entries: JustificationEntry[] = []
  for (const team of Object.values(teams)) {
    for (const lr of team.levelResults) {
      if (!lr.justification) continue
      const review = getReview(reviews, team.teamName, lr.levelNumber)
      entries.push({
        teamName: team.teamName,
        characterId: team.characterId,
        levelNumber: lr.levelNumber,
        justification: lr.justification,
        justificationWP: review?.overrideWP ?? lr.justificationWP ?? 0,
        justificationStatus: review?.status ?? lr.justificationStatus ?? 'auto',
        keywords: LEVEL_KEYWORDS[lr.levelNumber] ?? [],
        question: LEVEL_QUESTIONS[lr.levelNumber] ?? '',
      })
    }
  }
  return entries.sort((a, b) => a.levelNumber - b.levelNumber)
}

function getKeywordHits(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase()
  return keywords.filter(kw => lower.includes(kw.toLowerCase()))
}

function statusIcon(status: 'pending' | 'auto' | 'approved'): string {
  if (status === 'pending') return '🔴'
  if (status === 'auto') return '🟡'
  return '🟢'
}

function statusLabel(status: 'pending' | 'auto' | 'approved'): string {
  if (status === 'pending') return 'offen'
  if (status === 'auto') return 'auto'
  return 'bestätigt'
}

// ---------------------------------------------------------------------------
// PIN Gate
// ---------------------------------------------------------------------------

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin === getTeacherPin()) {
      sessionStorage.setItem('nova7_teacher_auth', '1')
      onUnlock()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="relative min-h-screen z-10 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-8 max-w-sm w-full text-center"
      >
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="hud-font text-2xl font-black mb-2"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          LEHRERBEREICH
        </h1>
        <p className="text-slate-400 text-sm mb-6">PIN eingeben, um fortzufahren</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" inputMode="numeric" maxLength={8} value={pin}
            onChange={e => { setPin(e.target.value); setError(false) }}
            placeholder="PIN"
            className="w-full bg-slate-900/60 border border-slate-600/50 rounded-lg px-4 py-3 text-white text-center text-xl hud-font tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            autoFocus />
          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm">
              Falscher PIN
            </motion.p>
          )}
          <button type="submit" disabled={pin.length === 0}
            className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
            ZUGANG
          </button>
        </form>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Team Card with Level Unlock Controls
// ---------------------------------------------------------------------------

function TeamCard({
  team,
  unlockedUpTo,
  onUnlock,
}: {
  team: TeamState
  unlockedUpTo: number
  onUnlock: (teamName: string, level: number) => void
}) {
  const char = getCharacter(team.characterId)
  const isWaiting = team.currentLevel < 16 && (team.currentLevel + 1) > unlockedUpTo

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 relative overflow-hidden">
      {/* Status badge + Rang */}
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {team.currentLevel >= 16 ? (
          <span className="px-2 py-0.5 rounded text-[10px] hud-font font-bold" style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }}>
            FERTIG
          </span>
        ) : isWaiting ? (
          <span className="px-2 py-0.5 rounded text-[10px] hud-font font-bold blink" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
            WARTET
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded text-[10px] hud-font font-bold" style={{ background: 'rgba(6,182,212,0.2)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' }}>
            SPIELT
          </span>
        )}
        {(() => {
          const score = team.wissensPunkte - team.dosimeterMSv * 0.5
          const rank = score >= 200 ? 'S' : score >= 150 ? 'A' : score >= 100 ? 'B' : score >= 50 ? 'C' : 'D'
          const rankColor = rank === 'S' ? '#ffd700' : rank === 'A' ? '#10b981' : rank === 'B' ? '#06b6d4' : rank === 'C' ? '#f59e0b' : '#94a3b8'
          return (
            <span className="px-2 py-0.5 rounded text-[10px] hud-font font-black" style={{ color: rankColor, background: `${rankColor}18`, border: `1px solid ${rankColor}40` }}>
              RANG {rank}
            </span>
          )
        })()}
      </div>

      {/* Team info */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{char.icon}</span>
        <div>
          <div className="text-white font-bold text-sm">{team.teamName}</div>
          <div className="text-xs" style={{ color: char.color }}>{char.name}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="rounded-lg p-2" style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="text-cyan-400 font-bold text-sm hud-font">{team.currentLevel}/16</div>
          <div className="text-[10px] text-slate-500 hud-font">LEVEL</div>
        </div>
        <div className="rounded-lg p-2" style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="text-yellow-400 font-bold text-sm hud-font">{team.wissensPunkte}</div>
          <div className="text-[10px] text-slate-500 hud-font">WP</div>
        </div>
        <div className="rounded-lg p-2" style={{
          background: team.dosimeterMSv < 80 ? 'rgba(16,185,129,0.1)' : team.dosimeterMSv < 120 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${team.dosimeterMSv < 80 ? 'rgba(16,185,129,0.2)' : team.dosimeterMSv < 120 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
        }}>
          <div className="font-bold text-sm hud-font" style={{ color: team.dosimeterMSv < 80 ? '#10b981' : team.dosimeterMSv < 120 ? '#f59e0b' : '#ef4444' }}>
            {team.dosimeterMSv}
          </div>
          <div className="text-[10px] text-slate-500 hud-font">mSv</div>
        </div>
      </div>

      {/* Level unlock bar */}
      <div className="text-[10px] hud-font text-slate-500 mb-1">FREIGESCHALTET BIS: Sektor {SECTOR_NAMES[Math.min(unlockedUpTo, 16) - 1] ?? '—'} (L{unlockedUpTo})</div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 16 }, (_, i) => i + 1).map(l => {
          const done = l <= team.currentLevel
          const unlocked = l <= unlockedUpTo
          const isCurrent = l === team.currentLevel + 1
          return (
            <div key={l} className="flex-1 h-2 rounded-full transition-all" title={`Level ${l}`}
              style={{
                background: done ? '#10b981' : isCurrent && unlocked ? '#06b6d4' : isCurrent && !unlocked ? '#f59e0b' : unlocked ? 'rgba(6,182,212,0.3)' : 'rgba(100,116,139,0.15)',
                boxShadow: isCurrent ? '0 0 6px rgba(6,182,212,0.5)' : undefined,
              }} />
          )
        })}
      </div>

      {/* Unlock button */}
      {team.currentLevel < 16 && (
        <div className="flex gap-2">
          {isWaiting ? (
            <button
              onClick={() => onUnlock(team.teamName, team.currentLevel + 1)}
              className="flex-1 py-2 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.4)' }}>
              SEKTOR {SECTOR_NAMES[team.currentLevel] ?? team.currentLevel + 1} FREIGEBEN
            </button>
          ) : (
            <div className="flex-1 py-2 rounded-lg hud-font text-xs tracking-wider text-center text-slate-500" style={{ background: 'rgba(30,41,59,0.3)', border: '1px solid rgba(100,116,139,0.1)' }}>
              Spielt Sektor {SECTOR_NAMES[team.currentLevel] ?? '—'}
            </div>
          )}
          <button
            onClick={() => onUnlock(team.teamName, 16)}
            className="px-3 py-2 rounded-lg hud-font text-[10px] tracking-wider cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
            title="Alle Level freigeben">
            ALLE
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Justification Review Card
// ---------------------------------------------------------------------------

function JustificationCard({
  entry,
  onApprove,
  onOverride,
}: {
  entry: JustificationEntry
  onApprove: (teamName: string, level: number) => void
  onOverride: (teamName: string, level: number, wp: number) => void
}) {
  const [wpInput, setWpInput] = useState<string>(String(entry.justificationWP))
  const char = getCharacter(entry.characterId)
  const hits = getKeywordHits(entry.justification, entry.keywords)

  const borderColor =
    entry.justificationStatus === 'approved' ? 'rgba(16,185,129,0.3)' :
    entry.justificationStatus === 'auto' ? 'rgba(245,158,11,0.3)' :
    'rgba(239,68,68,0.3)'

  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
      className="glass-panel p-5 space-y-3" style={{ borderColor }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span>{char.icon}</span>
          <span className="text-white font-bold text-sm">{entry.teamName}</span>
          <span className="text-xs px-2 py-0.5 rounded hud-font" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}>
            Level {entry.levelNumber}
          </span>
        </div>
        <span className="text-xs hud-font flex items-center gap-1" style={{
          color: entry.justificationStatus === 'approved' ? '#10b981' : entry.justificationStatus === 'auto' ? '#f59e0b' : '#ef4444',
        }}>
          {statusIcon(entry.justificationStatus)} {statusLabel(entry.justificationStatus).toUpperCase()}
        </span>
      </div>

      {/* Question */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
        <div className="text-[10px] hud-font text-cyan-500 mb-1">FRAGESTELLUNG</div>
        <p className="text-slate-300 text-xs leading-relaxed">{entry.question}</p>
      </div>

      {/* Student text */}
      <div className="rounded-lg p-3" style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(100,116,139,0.2)' }}>
        <div className="text-[10px] hud-font text-slate-500 mb-1">ANTWORT</div>
        <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{entry.justification}</p>
      </div>

      {/* Keywords */}
      <div>
        <div className="text-[10px] hud-font text-slate-500 mb-1">FACHBEGRIFFE ({hits.length}/{entry.keywords.length})</div>
        <div className="flex flex-wrap gap-1">
          {entry.keywords.map(kw => {
            const isHit = hits.includes(kw)
            return (
              <span key={kw} className="px-2 py-0.5 rounded text-xs" style={{
                background: isHit ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.15)',
                color: isHit ? '#6ee7b7' : '#475569',
                border: `1px solid ${isHit ? 'rgba(16,185,129,0.4)' : 'rgba(100,116,139,0.15)'}`,
              }}>
                {kw} {isHit ? '✓' : ''}
              </span>
            )
          })}
        </div>
      </div>

      {/* Scoring controls */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-700/30 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hud-font">WP:</label>
          <input type="number" min={0} max={20} value={wpInput} onChange={e => setWpInput(e.target.value)}
            className="w-16 bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1 text-white text-sm text-center hud-font focus:outline-none focus:border-cyan-400" />
        </div>
        {entry.justificationStatus !== 'approved' && (
          <button onClick={() => onApprove(entry.teamName, entry.levelNumber)}
            className="px-4 py-1.5 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.4)' }}>
            BESTÄTIGEN
          </button>
        )}
        <button onClick={() => { const wp = Math.max(0, Math.min(20, parseInt(wpInput) || 0)); onOverride(entry.teamName, entry.levelNumber, wp) }}
          className="px-4 py-1.5 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          WP ÜBERSCHREIBEN
        </button>
        {entry.justificationStatus === 'approved' && (
          <span className="text-emerald-400 text-xs hud-font ml-auto">Bewertet</span>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Global Timer Panel
// ---------------------------------------------------------------------------

function GlobalTimerPanel() {
  const [minutes, setMinutes] = useState(10)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    function update() {
      const t = getGlobalTimer()
      if (!t || !t.active) { setRemaining(null); return }
      const secs = Math.max(0, Math.round((t.endsAt - Date.now()) / 1000))
      setRemaining(secs > 0 ? secs : null)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  function start() {
    setGlobalTimer({ endsAt: Date.now() + minutes * 60000, label: 'Bearbeitungszeit', active: true })
    broadcastChange('timelimits')
    setRemaining(minutes * 60)
  }

  function stop() {
    clearGlobalTimer()
    broadcastChange('timelimits')
    setRemaining(null)
  }

  const mins = remaining !== null ? Math.floor(remaining / 60) : 0
  const secs = remaining !== null ? remaining % 60 : 0
  const isUrgent = remaining !== null && remaining < 120

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} className="mb-8">
      <h2 className="hud-font text-lg text-white flex items-center gap-2 mb-4">
        <span style={{ color: '#22d3ee' }}>⏰</span> GLOBALER TIMER (LEHRERUHR)
      </h2>
      <div className="glass-panel p-4 flex items-center gap-4 flex-wrap">
        {remaining !== null ? (
          <div
            className="hud-font text-2xl font-bold px-4 py-2 rounded-lg"
            style={{
              background: isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.3)'}`,
              color: isUrgent ? '#ef4444' : '#f59e0b',
            }}
          >
            {mins}:{String(secs).padStart(2, '0')}
          </div>
        ) : (
          <div className="text-slate-500 hud-font text-sm">Kein Timer aktiv</div>
        )}

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hud-font">MINUTEN:</label>
          <input
            type="number"
            min={1}
            max={120}
            value={minutes}
            onChange={e => setMinutes(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
            className="w-16 bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1 text-white text-sm hud-font focus:outline-none focus:border-cyan-400 text-center"
          />
        </div>

        <button
          onClick={start}
          className="px-4 py-2 rounded-lg hud-font text-xs font-bold tracking-wider cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}
        >
          ▶ START
        </button>
        {remaining !== null && (
          <button
            onClick={stop}
            className="px-4 py-2 rounded-lg hud-font text-xs font-bold tracking-wider cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
          >
            ■ STOP
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Events Panel
// ---------------------------------------------------------------------------

function EventsPanel({ onTriggered }: { onTriggered: () => void }) {
  const [toast, setToast] = useState<string | null>(null)
  const [history, setHistory] = useState<GameEvent[]>(() => getGameEvents().slice(-5).reverse())

  function fire(preset: EventPreset) {
    pushGameEvent({
      type: preset.type,
      icon: preset.icon,
      title: preset.title,
      message: preset.message,
      dosimeterDelta: preset.dosimeterDelta,
      wpDelta: preset.wpDelta,
    })
    setHistory(getGameEvents().slice(-5).reverse())
    broadcastChange('event')
    setToast(`${preset.icon} ${preset.title} ausgelöst!`)
    setTimeout(() => setToast(null), 3000)
    onTriggered()
  }

  function giveExtraTime(seconds: number) {
    const label = seconds >= 60 ? `${seconds / 60} min` : `${seconds} sek`
    pushGameEvent({
      type: 'extra_time',
      icon: '⏱️',
      title: `+${label} Extra Zeit`,
      message: `Alle Teams erhalten ${label} zusätzliche Zeit.`,
      dosimeterDelta: 0,
      wpDelta: 0,
      timeDelta: seconds,
    })
    setHistory(getGameEvents().slice(-5).reverse())
    broadcastChange('event')
    setToast(`⏱️ +${label} für alle Teams!`)
    setTimeout(() => setToast(null), 3000)
    onTriggered()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="hud-font text-lg text-white flex items-center gap-2">
          <span style={{ color: '#f59e0b' }}>▶</span> MISSIONS-EREIGNISSE
        </h2>
        <button
          onClick={() => { clearGameEvents(); setHistory([]); setToast('Events gelöscht.'); setTimeout(() => setToast(null), 2000) }}
          className="text-xs hud-font px-3 py-1 rounded transition-all cursor-pointer"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.2)', color: '#475569' }}
        >
          ✕ Events löschen
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 rounded-lg px-4 py-2 text-sm text-center hud-font font-bold"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {EVENT_PRESETS.map(preset => (
          <button
            key={preset.type}
            onClick={() => fire(preset)}
            className="rounded-xl p-3 text-left transition-all hover:brightness-125 cursor-pointer"
            style={{ background: `${preset.color}10`, border: `1px solid ${preset.color}30` }}
          >
            <div className="text-2xl mb-1">{preset.icon}</div>
            <div className="hud-font text-xs font-bold mb-0.5" style={{ color: preset.color }}>
              {preset.title}
            </div>
            <div className="text-[10px] text-slate-500">{preset.desc}</div>
          </button>
        ))}
      </div>

      {/* Extra Zeit */}
      <div className="mb-4 glass-panel p-3">
        <div className="text-[10px] hud-font text-slate-400 mb-2 flex items-center gap-1">
          <span style={{ color: '#22d3ee' }}>⏱</span> EXTRA ZEIT — ALLE TEAMS
        </div>
        <div className="flex gap-2 flex-wrap">
          {[30, 60, 120, 300].map(sec => {
            const label = sec >= 60 ? `+${sec / 60} min` : `+${sec} sek`
            return (
              <button
                key={sec}
                onClick={() => giveExtraTime(sec)}
                className="px-4 py-2 rounded-lg hud-font text-xs font-bold tracking-wider cursor-pointer transition-all hover:brightness-125"
                style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee' }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-panel p-3">
          <div className="text-[10px] hud-font text-slate-500 mb-2">VERLAUF (letzte 5)</div>
          <div className="space-y-1">
            {history.map(e => (
              <div key={e.id} className="flex items-center gap-2 text-xs">
                <span>{e.icon}</span>
                <span className="text-slate-300 hud-font">{e.title}</span>
                <span className="text-slate-600">
                  {e.dosimeterDelta !== 0 && `${e.dosimeterDelta > 0 ? '+' : ''}${e.dosimeterDelta} mSv`}
                  {e.wpDelta !== 0 && ` +${e.wpDelta} WP`}
                  {e.timeDelta != null && e.timeDelta !== 0 && ` ⏱ +${e.timeDelta >= 60 ? `${e.timeDelta / 60} min` : `${e.timeDelta} sek`}`}
                  {e.dosimeterDelta === 0 && e.wpDelta === 0 && !e.timeDelta && 'Alarm'}
                </span>
                <span className="ml-auto text-slate-700 text-[10px]">
                  {new Date(e.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Time Limits Panel
// ---------------------------------------------------------------------------

const TIME_LIMITS_KEY = 'nova7_timelimits'
const DEFAULT_MINUTES: Record<number, number> = {
  1: 5, 2: 5, 3: 4, 4: 4, 5: 4, 6: 6, 7: 5, 8: 8,
  9: 5, 10: 7, 11: 8, 12: 5, 13: 4, 14: 6, 15: 5, 16: 6,
}

function loadCustomLimits(): Record<number, number> {
  try {
    const stored = localStorage.getItem(TIME_LIMITS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return {}
}

function TimeLimitsPanel() {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState<Record<number, number>>(loadCustomLimits)
  const [saved, setSaved] = useState(false)

  function getMinutes(level: number) {
    return custom[level] ?? DEFAULT_MINUTES[level]
  }

  function setMinutes(level: number, value: number) {
    setCustom(prev => ({ ...prev, [level]: Math.max(1, Math.min(60, value)) }))
  }

  function handleSave() {
    localStorage.setItem(TIME_LIMITS_KEY, JSON.stringify(custom))
    broadcastChange('timelimits')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    localStorage.removeItem(TIME_LIMITS_KEY)
    setCustom({})
    broadcastChange('timelimits')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="mb-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-3 cursor-pointer"
      >
        <h2 className="hud-font text-lg text-white flex items-center gap-2">
          <span style={{ color: '#22d3ee' }}>⏱</span> ZEITLIMITS PRO LEVEL
        </h2>
        <span className="text-slate-400 text-xs hud-font">{open ? '▲ EINKLAPPEN' : '▼ AUSKLAPPEN'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {SECTOR_NAMES.map((sector, i) => {
                  const level = i + 1
                  const minutes = getMinutes(level)
                  const isModified = custom[level] != null && custom[level] !== DEFAULT_MINUTES[level]
                  return (
                    <div key={level} className="rounded-lg p-2 text-center"
                      style={{ background: isModified ? 'rgba(6,182,212,0.08)' : 'rgba(15,23,42,0.5)', border: `1px solid ${isModified ? 'rgba(6,182,212,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                      <div className="hud-font text-[10px] text-slate-500 mb-1">L{level} · {sector}</div>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setMinutes(level, minutes - 1)}
                          className="w-5 h-5 rounded text-slate-400 hover:text-white cursor-pointer text-xs leading-none"
                          style={{ background: 'rgba(100,116,139,0.15)' }}
                        >−</button>
                        <span className="hud-font text-sm font-bold text-white w-6 text-center">{minutes}</span>
                        <button
                          onClick={() => setMinutes(level, minutes + 1)}
                          className="w-5 h-5 rounded text-slate-400 hover:text-white cursor-pointer text-xs leading-none"
                          style={{ background: 'rgba(100,116,139,0.15)' }}
                        >+</button>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">min</div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}
                >
                  SPEICHERN
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all hover:brightness-110"
                  style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.2)', color: '#64748b' }}
                >
                  STANDARD WIEDERHERSTELLEN
                </button>
                {saved && (
                  <span className="text-emerald-400 hud-font text-xs">✓ Gespeichert</span>
                )}
                <span className="ml-auto text-slate-600 text-[10px] hud-font">Änderungen gelten sofort für laufende Spiele</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

type SortKey = 'wp' | 'dosimeter' | 'level' | 'name'

function Dashboard() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<TeacherReview[]>(loadReviews)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [levelFilter, setLevelFilter] = useState<number>(0)
  const [bulkLevel, setBulkLevel] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey>('wp')
  const [pinChangeMode, setPinChangeMode] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const [, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [refresh])

  // Load all team states from multi-team storage
  const allTeams = getAllTeamStates()
  const teamList = Object.values(allTeams).sort((a, b) => {
    if (sortKey === 'wp')        return b.wissensPunkte - a.wissensPunkte
    if (sortKey === 'dosimeter') return a.dosimeterMSv - b.dosimeterMSv
    if (sortKey === 'level')     return b.currentLevel - a.currentLevel
    return a.teamName.localeCompare(b.teamName)
  })
  const justifications = collectJustifications(allTeams, reviews)

  const filtered = justifications.filter(j => {
    if (statusFilter !== 'all' && j.justificationStatus !== statusFilter) return false
    if (levelFilter !== 0 && j.levelNumber !== levelFilter) return false
    return true
  })

  const availableLevels = [...new Set(justifications.map(j => j.levelNumber))].sort((a, b) => a - b)

  function handleUnlockLevel(teamName: string, level: number) {
    setTeamUnlockedLevel(teamName, level)
    broadcastChange('unlock')
    refresh()
  }

  function handleApprove(teamName: string, levelNumber: number) {
    const updated = [...reviews]
    const idx = updated.findIndex(r => r.teamName === teamName && r.levelNumber === levelNumber)
    const entry: TeacherReview = { teamName, levelNumber, status: 'approved', reviewedAt: Date.now() }
    if (idx >= 0) { entry.overrideWP = updated[idx].overrideWP; updated[idx] = entry }
    else updated.push(entry)
    setReviews(updated)
    saveReviews(updated)
    updateTeamJustification(teamName, levelNumber, 'approved')
  }

  function handleOverride(teamName: string, levelNumber: number, wp: number) {
    const updated = [...reviews]
    const idx = updated.findIndex(r => r.teamName === teamName && r.levelNumber === levelNumber)
    const entry: TeacherReview = { teamName, levelNumber, status: 'approved', overrideWP: wp, reviewedAt: Date.now() }
    if (idx >= 0) updated[idx] = entry
    else updated.push(entry)
    setReviews(updated)
    saveReviews(updated)
    updateTeamJustification(teamName, levelNumber, 'approved', wp)
  }

  function updateTeamJustification(teamName: string, levelNumber: number, status: 'approved', wpOverride?: number) {
    try {
      const all = getAllTeamStates()
      const team = all[teamName]
      if (!team) return

      let wpDelta = 0
      const updatedResults = team.levelResults.map(lr => {
        if (lr.levelNumber === levelNumber) {
          const oldWP = lr.justificationWP ?? 0
          const newWP = wpOverride !== undefined ? wpOverride : oldWP
          const wasApproved = lr.justificationStatus === 'approved'

          if (wasApproved) {
            // Re-approval: only add the difference
            wpDelta = newWP - oldWP
          } else {
            // First approval: add the full WP amount (was never added to total before)
            wpDelta = newWP
          }

          return { ...lr, justificationStatus: status as LevelResult['justificationStatus'], justificationWP: newWP }
        }
        return lr
      })

      const updatedTeam: TeamState = { ...team, wissensPunkte: team.wissensPunkte + wpDelta, levelResults: updatedResults }
      all[teamName] = updatedTeam
      localStorage.setItem('nova7_teams', JSON.stringify(all))
      // Also update current active session if it's the same team
      try {
        const active = JSON.parse(localStorage.getItem('nova7_team') ?? 'null')
        if (active && active.teamName === teamName) {
          localStorage.setItem('nova7_team', JSON.stringify(updatedTeam))
        }
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  }

  // Stats
  const pendingCount = justifications.filter(j => j.justificationStatus === 'pending').length
  const autoCount = justifications.filter(j => j.justificationStatus === 'auto').length
  const approvedCount = justifications.filter(j => j.justificationStatus === 'approved').length
  const waitingTeams = teamList.filter(t => t.currentLevel < 16 && (t.currentLevel + 1) > getTeamUnlockedLevel(t.teamName)).length

  return (
    <div className="relative min-h-screen z-10 px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="hud-font text-3xl md:text-4xl font-black glow-text-cyan mb-2"
          style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          U.S.S. BLANKENAGEL LEHRERBEREICH
        </h1>
        <p className="text-slate-400 text-sm hud-font tracking-widest">MISSIONSAUSWERTUNG &amp; LEVEL-FREIGABE</p>
      </motion.div>

      {/* Quick stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'TEAMS', value: teamList.length, color: '#06b6d4' },
          { label: 'WARTEN', value: waitingTeams, color: '#f59e0b' },
          { label: 'OFFEN', value: pendingCount, color: '#ef4444' },
          { label: 'AUTO', value: autoCount, color: '#f59e0b' },
          { label: 'BESTÄTIGT', value: approvedCount, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 text-center">
            <div className="hud-font text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="hud-font text-[10px] text-slate-500 tracking-wider">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* QR-Code Einstieg */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-6">
        <div className="glass-panel p-4 flex items-center gap-6 flex-wrap">
          <div>
            <div className="hud-font text-xs text-cyan-400 tracking-widest mb-1">📱 SCHÜLER-EINSTIEG</div>
            <div className="text-white font-bold text-sm mb-1">{window.location.origin}</div>
            <div className="text-slate-400 text-xs">QR-Code scannen → direkt zur App</div>
          </div>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin)}&bgcolor=060d1f&color=22d3ee&margin=4`}
            alt="QR-Code"
            width={120}
            height={120}
            style={{ borderRadius: 8, border: '1px solid rgba(6,182,212,0.3)' }}
          />
        </div>
      </motion.div>

      {/* Global Timer Panel */}
      <GlobalTimerPanel />

      {/* Events Panel */}
      <EventsPanel onTriggered={refresh} />

      {/* Time Limits Panel */}
      <TimeLimitsPanel />

      {/* Team Overview with Unlock Controls */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="hud-font text-lg text-white flex items-center gap-2">
            <span style={{ color: '#06b6d4' }}>▶</span> TEAMS &amp; LEVEL-FREIGABE
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort controls */}
            <div className="flex gap-1">
              {([
                { key: 'wp' as SortKey, label: 'WP' },
                { key: 'dosimeter' as SortKey, label: 'mSv' },
                { key: 'level' as SortKey, label: 'Level' },
                { key: 'name' as SortKey, label: 'Name' },
              ]).map(s => (
                <button key={s.key} onClick={() => setSortKey(s.key)}
                  className="px-2 py-1 rounded text-[10px] hud-font cursor-pointer transition-all"
                  style={{
                    background: sortKey === s.key ? 'rgba(6,182,212,0.2)' : 'rgba(30,41,59,0.5)',
                    border: `1px solid ${sortKey === s.key ? 'rgba(6,182,212,0.5)' : 'rgba(100,116,139,0.2)'}`,
                    color: sortKey === s.key ? '#22d3ee' : '#64748b',
                  }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          {teamList.length > 0 && waitingTeams > 0 && (
            <button
              onClick={() => {
                teamList.forEach(t => {
                  if (t.currentLevel < 16) {
                    const next = t.currentLevel + 1
                    const current = getTeamUnlockedLevel(t.teamName)
                    if (next > current) {
                      setTeamUnlockedLevel(t.teamName, next)
                    }
                  }
                })
                broadcastChange('unlock')
                refresh()
              }}
              className="px-5 py-2 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.4)' }}>
              ▶▶ ALLE TEAMS NÄCHSTEN SEKTOR FREIGEBEN ({waitingTeams})
            </button>
          )}
        </div>
        {/* Bulk unlock: alle Teams auf bestimmtes Level setzen */}
        {teamList.length > 0 && (
          <div className="glass-panel p-3 mb-4 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-400 hud-font">ALLE TEAMS AUF LEVEL:</span>
            <select
              value={bulkLevel}
              onChange={e => setBulkLevel(Number(e.target.value))}
              className="bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1 text-white text-xs hud-font focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map(l => (
                <option key={l} value={l}>Level {l} — Sektor {SECTOR_NAMES[l - 1]}</option>
              ))}
            </select>
            <button
              onClick={() => { teamList.forEach(t => setTeamUnlockedLevel(t.teamName, bulkLevel)); broadcastChange('unlock'); refresh() }}
              className="px-4 py-1.5 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}
            >
              FREIGEBEN
            </button>
          </div>
        )}

        {/* Avatar-Galerie */}
        {teamList.some(t => t.avatarConfig) && (
          <div className="glass-panel p-4 mb-6">
            <div className="text-cyan-400/70 hud-font text-xs tracking-widest mb-4">
              👥 AVATAR-GALERIE
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {teamList.map(t => t.avatarConfig ? (
                <div key={t.teamName} className="flex flex-col items-center gap-1">
                  <Avatar
                    config={t.avatarConfig}
                    size={64}
                    animId={`gal-${t.teamName}`}
                    showName={false}
                  />
                  <div className="text-white hud-font text-xs font-bold text-center max-w-[70px] truncate">
                    {t.avatarConfig.avatarName || t.teamName}
                  </div>
                  <div className="text-slate-500 hud-font text-center" style={{ fontSize: 9 }}>
                    {t.teamName}
                  </div>
                  <div className="text-cyan-400/60 hud-font text-center" style={{ fontSize: 9 }}>
                    Sektor {t.currentLevel}/16
                  </div>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {teamList.length === 0 ? (
          <div className="glass-panel p-6 text-center text-slate-400 text-sm mb-8">
            Noch keine Teams registriert.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {teamList.map(t => (
              <TeamCard key={t.teamName} team={t} unlockedUpTo={getTeamUnlockedLevel(t.teamName)} onUnlock={handleUnlockLevel} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Justification Review Queue */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="hud-font text-lg text-white flex items-center gap-2">
            <span style={{ color: '#7c3aed' }}>▶</span> BEGRÜNDUNGEN ({justifications.length})
          </h2>
          {autoCount > 0 && (
            <button
              onClick={() => {
                const autoEntries = justifications.filter(j => j.justificationStatus === 'auto')
                const updated = [...reviews]
                autoEntries.forEach(entry => {
                  const idx = updated.findIndex(r => r.teamName === entry.teamName && r.levelNumber === entry.levelNumber)
                  const newEntry: TeacherReview = { teamName: entry.teamName, levelNumber: entry.levelNumber, status: 'approved', reviewedAt: Date.now() }
                  if (idx >= 0) updated[idx] = newEntry
                  else updated.push(newEntry)
                })
                setReviews(updated)
                saveReviews(updated)
                autoEntries.forEach(e => updateTeamJustification(e.teamName, e.levelNumber, 'approved'))
                refresh()
              }}
              className="px-4 py-2 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24' }}>
              🟡 ALLE AUTO BESTÄTIGEN ({autoCount})
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 hud-font">FILTER:</span>
          <div className="flex gap-1">
            {([
              { key: 'all' as StatusFilter, label: 'Alle', color: '#94a3b8' },
              { key: 'pending' as StatusFilter, label: '🔴 Offen', color: '#ef4444' },
              { key: 'auto' as StatusFilter, label: '🟡 Auto', color: '#f59e0b' },
              { key: 'approved' as StatusFilter, label: '🟢 Best.', color: '#10b981' },
            ]).map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className="px-3 py-1 rounded text-xs hud-font cursor-pointer transition-all"
                style={{
                  background: statusFilter === f.key ? `${f.color}25` : 'rgba(30,41,59,0.5)',
                  border: `1px solid ${statusFilter === f.key ? `${f.color}60` : 'rgba(100,116,139,0.2)'}`,
                  color: statusFilter === f.key ? f.color : '#64748b',
                }}>
                {f.label}
              </button>
            ))}
          </div>
          <select value={levelFilter} onChange={e => setLevelFilter(Number(e.target.value))}
            className="bg-slate-900/60 border border-slate-600/50 rounded px-2 py-1 text-white text-xs hud-font focus:outline-none focus:border-cyan-400 cursor-pointer">
            <option value={0}>Alle Level</option>
            {availableLevels.map(l => (<option key={l} value={l}>Level {l}</option>))}
          </select>
          <button onClick={refresh}
            className="ml-auto px-3 py-1 rounded text-xs hud-font cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.2)', color: '#94a3b8' }}>
            ↻ AKTUALISIEREN
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="glass-panel p-6 text-center text-slate-400 text-sm">
            {justifications.length === 0 ? 'Noch keine Begründungen vorhanden.' : 'Keine Einträge für diesen Filter.'}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map(entry => (
                <JustificationCard key={`${entry.teamName}-${entry.levelNumber}`} entry={entry}
                  onApprove={handleApprove} onOverride={handleOverride} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* PIN ändern */}
      <div className="mt-8 mb-4">
        {!pinChangeMode ? (
          <button
            onClick={() => setPinChangeMode(true)}
            className="text-xs hud-font px-3 py-1.5 rounded cursor-pointer transition-all"
            style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(100,116,139,0.2)', color: '#475569' }}>
            🔒 PIN ändern
          </button>
        ) : (
          <div className="glass-panel p-4 max-w-xs flex items-center gap-3 flex-wrap">
            <span className="text-xs text-slate-400 hud-font">NEUER PIN:</span>
            <input
              type="password" inputMode="numeric" maxLength={8} value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="mind. 4 Zeichen"
              className="flex-1 bg-slate-900/60 border border-slate-600/50 rounded px-3 py-1.5 text-white text-sm hud-font text-center tracking-widest focus:outline-none focus:border-cyan-400"
              autoFocus />
            <button
              disabled={newPin.length < 4}
              onClick={() => { setTeacherPin(newPin); setNewPin(''); setPinChangeMode(false); setPinSaved(true); setTimeout(() => setPinSaved(false), 2500) }}
              className="px-3 py-1.5 rounded-lg hud-font text-xs font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.4)' }}>
              SPEICHERN
            </button>
            <button onClick={() => { setPinChangeMode(false); setNewPin('') }}
              className="text-slate-500 text-xs hud-font cursor-pointer hover:text-slate-300">✕</button>
            {pinSaved && <span className="text-emerald-400 hud-font text-xs">✓ PIN gespeichert</span>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <button onClick={() => navigate('/')}
          className="px-6 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.3)' }}>
          ← ZURÜCK
        </button>
        {teamList.length > 0 && (
          <button
            onClick={() => exportCSV(teamList)}
            className="px-6 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.3)' }}>
            📥 ERGEBNISSE EXPORTIEREN (CSV)
          </button>
        )}
        <button onClick={() => navigate('/highscore')}
          className="px-6 py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8' }}>
          HIGHSCORE
        </button>
        <button onClick={() => { sessionStorage.removeItem('nova7_teacher_auth'); navigate('/') }}
          className="px-6 py-3 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all"
          style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(100,116,139,0.3)', color: '#64748b' }}>
          ABMELDEN
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function Teacher() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('nova7_teacher_auth') === '1')
  if (!authed) return <PinGate onUnlock={() => setAuthed(true)} />
  return <Dashboard />
}
