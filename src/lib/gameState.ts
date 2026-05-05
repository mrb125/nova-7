import type { TeamState, LevelResult, LevelUnlock } from '../types/game'
import { getCharacter } from './characters'

// ---------------------------------------------------------------------------
// BroadcastChannel — Echtzeit-Kommunikation zwischen Tabs
// ---------------------------------------------------------------------------

const CHANNEL_NAME = 'nova7'

export function broadcastChange(type: 'unlock' | 'event' | 'state' | 'timelimits') {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME)
    ch.postMessage({ type })
    ch.close()
  } catch { /* nicht unterstützt */ }
}

export function onBroadcastChange(callback: (type: string) => void): () => void {
  try {
    const ch = new BroadcastChannel(CHANNEL_NAME)
    ch.onmessage = (e) => callback(e.data?.type ?? 'update')
    return () => ch.close()
  } catch {
    return () => {}
  }
}

const STORAGE_KEY = 'nova7_team'
const TEAMS_KEY = 'nova7_teams'
const UNLOCKS_KEY = 'nova7_unlocks'
const CREDENTIALS_KEY = 'nova7_credentials'

// ---------------------------------------------------------------------------
// Team credentials (simple login system)
// ---------------------------------------------------------------------------

export interface TeamCredentials {
  teamName: string
  password: string
  characterId: string
  createdAt: number
}

export function getAllCredentials(): TeamCredentials[] {
  try { return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) ?? '[]') }
  catch { return [] }
}

export function saveCredentials(creds: TeamCredentials[]) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds))
}

export function registerTeam(teamName: string, password: string, characterId: string): boolean {
  const all = getAllCredentials()
  if (all.some(c => c.teamName.toLowerCase() === teamName.toLowerCase())) return false
  all.push({ teamName, password, characterId, createdAt: Date.now() })
  saveCredentials(all)
  return true
}

export function loginTeam(teamName: string, password: string): TeamCredentials | null {
  const all = getAllCredentials()
  return all.find(c => c.teamName === teamName && c.password === password) ?? null
}

// ---------------------------------------------------------------------------
// Single-team state (current session)
// ---------------------------------------------------------------------------

export function createInitialState(teamName: string, characterId: string): TeamState {
  const char = getCharacter(characterId)
  return {
    teamName,
    characterId: char.id,
    wissensPunkte: 0,
    dosimeterMSv: 0,
    budget: 120,
    currentLevel: 0,
    equipment: [],
    levelResults: [],
    startedAt: Date.now(),
  }
}

export function saveState(state: TeamState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  // Also save to multi-team storage
  saveTeamState(state)
}

export function loadState(): TeamState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as TeamState }
  catch { return null }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}

// ---------------------------------------------------------------------------
// Multi-team storage (for teacher to see all teams)
// ---------------------------------------------------------------------------

export function getAllTeamStates(): Record<string, TeamState> {
  try { return JSON.parse(localStorage.getItem(TEAMS_KEY) ?? '{}') }
  catch { return {} }
}

export function saveTeamState(state: TeamState) {
  const all = getAllTeamStates()
  all[state.teamName] = state
  localStorage.setItem(TEAMS_KEY, JSON.stringify(all))
}

// ---------------------------------------------------------------------------
// Level unlocks (teacher controls)
// ---------------------------------------------------------------------------

export function getLevelUnlocks(): LevelUnlock[] {
  try { return JSON.parse(localStorage.getItem(UNLOCKS_KEY) ?? '[]') }
  catch { return [] }
}

export function saveLevelUnlocks(unlocks: LevelUnlock[]) {
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks))
}

export function getTeamUnlockedLevel(teamName: string): number {
  const unlocks = getLevelUnlocks()
  const entry = unlocks.find(u => u.teamName === teamName)
  return entry?.unlockedUpTo ?? 1 // default: only Level 1 is unlocked
}

export function unlockNextLevel(teamName: string): number {
  const unlocks = getLevelUnlocks()
  const idx = unlocks.findIndex(u => u.teamName === teamName)
  if (idx >= 0) {
    unlocks[idx].unlockedUpTo += 1
    saveLevelUnlocks(unlocks)
    return unlocks[idx].unlockedUpTo
  } else {
    unlocks.push({ teamName, unlockedUpTo: 2 })
    saveLevelUnlocks(unlocks)
    return 2
  }
}

export function unlockAllLevels(teamName: string) {
  const unlocks = getLevelUnlocks()
  const idx = unlocks.findIndex(u => u.teamName === teamName)
  if (idx >= 0) {
    unlocks[idx].unlockedUpTo = 20
  } else {
    unlocks.push({ teamName, unlockedUpTo: 20 })
  }
  saveLevelUnlocks(unlocks)
}

export function setTeamUnlockedLevel(teamName: string, level: number) {
  const unlocks = getLevelUnlocks()
  const idx = unlocks.findIndex(u => u.teamName === teamName)
  if (idx >= 0) {
    unlocks[idx].unlockedUpTo = level
  } else {
    unlocks.push({ teamName, unlockedUpTo: level })
  }
  saveLevelUnlocks(unlocks)
}

// ---------------------------------------------------------------------------
// Apply level result (WP always additive, never subtract)
// ---------------------------------------------------------------------------

export function applyLevelResult(
  state: TeamState,
  result: Omit<LevelResult, 'completedAt'>
): TeamState {
  const char = getCharacter(state.characterId)

  // Apply character dosimeter passive (Kenji: -2 mSv on dosimeter delta, minimum 0)
  let dosimeterDelta = result.dosimeterDelta
  if (state.characterId === 'kenji') {
    dosimeterDelta = Math.max(0, dosimeterDelta - 2)
  }

  // Apply character WP bonus for this level (always additive)
  let wpEarned = result.wpEarned
  if (char.bonusLevels.includes(result.levelNumber)) {
    wpEarned += char.bonusWP
  }

  // WP are awarded directly — no teacher confirmation needed in this version
  const levelResult: LevelResult = { ...result, dosimeterDelta, wpEarned, completedAt: Date.now() }

  return {
    ...state,
    wissensPunkte: state.wissensPunkte + wpEarned,
    dosimeterMSv: state.dosimeterMSv + dosimeterDelta,
    budget: state.budget + (result.answers.budgetChange as number ?? 0),
    equipment: result.answers.equipment
      ? [...state.equipment, ...(result.answers.equipment as string[])]
      : state.equipment,
    currentLevel: state.currentLevel + 1,
    levelResults: [...state.levelResults, levelResult],
  }
}

// ---------------------------------------------------------------------------
// Scoring (only additive)
// ---------------------------------------------------------------------------

export function scoreJustification(text: string, keywords: string[]): number {
  if (!text) return 0
  const trimmed = text.trim()
  // Mindestlänge 30 Zeichen
  if (trimmed.length < 30) return 0
  // Mindestens 5 Wörter
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 1).length
  if (wordCount < 5) return 0
  const lower = trimmed.toLowerCase()
  const hits = keywords.filter(kw => lower.includes(kw.toLowerCase()))
  // WP werden nur addiert, nie abgezogen
  return Math.min(hits.length * 2, 10)
}

// ---------------------------------------------------------------------------
// Missions-Ereignisse (Lehrer triggert Events → Teams empfangen via Polling)
// ---------------------------------------------------------------------------

export interface GameEvent {
  id: string
  type: string
  icon: string
  title: string
  message: string
  dosimeterDelta: number
  wpDelta: number
  timeDelta?: number
  timestamp: number
}

const EVENTS_KEY = 'nova7_events'

export function getGameEvents(): GameEvent[] {
  try { return JSON.parse(localStorage.getItem(EVENTS_KEY) ?? '[]') }
  catch { return [] }
}

export function pushGameEvent(event: Omit<GameEvent, 'id' | 'timestamp'>): GameEvent {
  const events = getGameEvents()
  const newEvent: GameEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  }
  events.push(newEvent)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-30)))
  return newEvent
}

export function clearGameEvents() {
  localStorage.removeItem(EVENTS_KEY)
}

export function getSeenEvents(teamName: string): string[] {
  try { return JSON.parse(localStorage.getItem(`nova7_seen_${teamName}`) ?? '[]') }
  catch { return [] }
}

export function markEventSeen(teamName: string, eventId: string) {
  const seen = getSeenEvents(teamName)
  if (!seen.includes(eventId)) {
    seen.push(eventId)
    localStorage.setItem(`nova7_seen_${teamName}`, JSON.stringify(seen.slice(-60)))
  }
}

// ---------------------------------------------------------------------------
// Global Timer (Lehreruhr)
// ---------------------------------------------------------------------------

const GLOBAL_TIMER_KEY = 'nova7_globaltimer'

export interface GlobalTimer {
  endsAt: number
  label: string
  active: boolean
}

export function getGlobalTimer(): GlobalTimer | null {
  try { return JSON.parse(localStorage.getItem(GLOBAL_TIMER_KEY) ?? 'null') }
  catch { return null }
}
export function setGlobalTimer(timer: GlobalTimer): void {
  localStorage.setItem(GLOBAL_TIMER_KEY, JSON.stringify(timer))
}
export function clearGlobalTimer(): void {
  localStorage.removeItem(GLOBAL_TIMER_KEY)
}

export function applyEventToTeam(teamName: string, dosimeterDelta: number, wpDelta: number) {
  try {
    const all = getAllTeamStates()
    if (all[teamName]) {
      all[teamName] = {
        ...all[teamName],
        dosimeterMSv: Math.max(0, (all[teamName].dosimeterMSv ?? 0) + dosimeterDelta),
        wissensPunkte: Math.max(0, (all[teamName].wissensPunkte ?? 0) + wpDelta),
      }
      localStorage.setItem(TEAMS_KEY, JSON.stringify(all))
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const active = JSON.parse(raw) as TeamState
      if (active.teamName === teamName) {
        const updated: TeamState = {
          ...active,
          dosimeterMSv: Math.max(0, active.dosimeterMSv + dosimeterDelta),
          wissensPunkte: Math.max(0, active.wissensPunkte + wpDelta),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      }
    }
  } catch { /* ignore */ }
}
