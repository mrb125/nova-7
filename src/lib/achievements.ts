import type { TeamState } from '../types/game'

// ---------------------------------------------------------------------------
// Achievement definitions
// ---------------------------------------------------------------------------

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  color: string
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'perfect_start',
    title: 'Perfekter Start',
    description: 'Sektor ALPHA vollständig ohne Strahlenbelastung abgeschlossen',
    icon: '⭐',
    color: '#f59e0b',
  },
  {
    id: 'clean_run',
    title: 'Makellose Mission',
    description: 'Drei Sektoren hintereinander mit 0 mSv abgeschlossen',
    icon: '✨',
    color: '#10b981',
  },
  {
    id: 'null_dosis',
    title: 'Null-Dosis-Held',
    description: 'Nach Sektor ZETA (Level 6) noch unter 10 mSv Gesamtbelastung',
    icon: '🛡️',
    color: '#06b6d4',
  },
  {
    id: 'survival',
    title: 'Harter Kern',
    description: 'Trotz über 100 mSv Dosimeterstand die Mission fortgesetzt',
    icon: '💀',
    color: '#ef4444',
  },
  {
    id: 'budget_saver',
    title: 'Budget-Profi',
    description: 'Nach Level 3 noch mindestens 70 Credits im Vorrat',
    icon: '💰',
    color: '#f59e0b',
  },
  {
    id: 'half_way',
    title: 'Halbzeit',
    description: 'Level 10 erfolgreich abgeschlossen — Halbzeit!',
    icon: '⚡',
    color: '#06b6d4',
  },
  {
    id: 'all_optimal',
    title: 'Perfektionist',
    description: 'Mindestens 6 Level alle mit optimaler Entscheidung (0 mSv)',
    icon: '💎',
    color: '#22d3ee',
  },
  {
    id: 'mission_complete',
    title: 'U.S.S. Blankenagel Gerettet',
    description: 'Alle 20 Sektoren erfolgreich durchquert',
    icon: '🚀',
    color: '#7c3aed',
  },
  {
    id: 'rank_s',
    title: 'Legende',
    description: 'Den Höchstrang S mit 200+ Punkten erreicht',
    icon: '👑',
    color: '#f59e0b',
  },
  {
    id: 'wp_collector',
    title: 'Wissens-Titan',
    description: 'Insgesamt 150 oder mehr Wissenspunkte gesammelt',
    icon: '🧠',
    color: '#a78bfa',
  },
]

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const KEY_PREFIX = 'nova7_achievements_'

export function getEarnedAchievements(teamName: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`${KEY_PREFIX}${teamName}`) ?? '[]')
  } catch {
    return []
  }
}

export function saveEarnedAchievements(teamName: string, ids: string[]) {
  localStorage.setItem(`${KEY_PREFIX}${teamName}`, JSON.stringify(ids))
}

// ---------------------------------------------------------------------------
// Check logic — returns newly unlocked achievement IDs
// ---------------------------------------------------------------------------

export function checkAchievements(state: TeamState): string[] {
  const earned = new Set(getEarnedAchievements(state.teamName))
  const newlyEarned: string[] = []
  const results = state.levelResults

  function check(id: string, condition: boolean) {
    if (!earned.has(id) && condition) {
      newlyEarned.push(id)
    }
  }

  // perfect_start: Level 1 result with dosimeterDelta = 0
  const firstResult = results.find(lr => lr.levelNumber === 1)
  check('perfect_start', !!firstResult && firstResult.dosimeterDelta === 0)

  // clean_run: 3 consecutive levels with dosimeterDelta = 0
  let consecutive = 0
  for (const lr of results) {
    if (lr.dosimeterDelta === 0) {
      consecutive++
      if (consecutive >= 3) break
    } else {
      consecutive = 0
    }
  }
  check('clean_run', consecutive >= 3)

  // null_dosis: after level 6, dosimeter < 10
  check('null_dosis', state.currentLevel >= 6 && state.dosimeterMSv < 10)

  // survival: dosimeter reached 100+
  check('survival', state.dosimeterMSv >= 100)

  // budget_saver: budget >= 70 after level 3+
  check('budget_saver', state.currentLevel >= 3 && state.budget >= 70)

  // half_way: level 6+ done
  check('half_way', state.currentLevel >= 10)

  // all_optimal: all completed levels with 0 mSv, at least 6 of them
  check(
    'all_optimal',
    results.length >= 6 && results.every(lr => lr.dosimeterDelta === 0)
  )

  // mission_complete: all 16 levels done
  check('mission_complete', state.currentLevel >= 20)

  // rank_s: score >= 200
  const score = state.wissensPunkte - state.dosimeterMSv * 0.5
  check('rank_s', score >= 200)

  // wp_collector: 150+ WP
  check('wp_collector', state.wissensPunkte >= 150)

  if (newlyEarned.length > 0) {
    saveEarnedAchievements(state.teamName, [...Array.from(earned), ...newlyEarned])
  }

  return newlyEarned
}
