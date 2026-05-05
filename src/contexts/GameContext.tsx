import { createContext, useContext } from 'react'
import type { TeamState } from '../types/game'

export interface LevelCompleteResult {
  wpEarned: number
  dosimeterDelta: number
  answers: Record<string, unknown>
  justification?: string
  justificationScore?: number
}

interface GameContextValue {
  state: TeamState
  completeLevel: (result: LevelCompleteResult) => void
  levelNumber: number
  timeLeft: number | null
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameContext.Provider')
  return ctx
}
