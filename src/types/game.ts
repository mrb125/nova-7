export type CharacterId = 'leon' | 'mia' | 'kenji'

export type AvatarStyle  = 'comic' | 'realistic'
export type SkinTone     = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
export type HairColor    = 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'blue'
export type HairStyle    = 'short' | 'long' | 'curly' | 'bun' | 'hijab'
export type EyeColor     = 'blue' | 'green' | 'brown' | 'grey' | 'hazel'
export type SuitColor    = 'blue' | 'red' | 'green' | 'purple' | 'orange'
export type Expression   = 'neutral' | 'smile' | 'determined'

export interface AvatarConfig {
  style:       AvatarStyle
  skinTone:    SkinTone
  hairColor:   HairColor
  hairStyle:   HairStyle
  eyeColor:    EyeColor
  suitColor?:  SuitColor   // optional – default: 'blue'
  expression?: Expression  // optional – default: 'smile'
  avatarName:  string
}

export interface Character {
  id: CharacterId
  name: string
  title: string
  description: string
  backstory: string
  motto: string
  bonusLevels: number[]
  bonusWP: number
  passiveName: string
  passiveDescription: string
  color: string
  icon: string
}

export interface TeamState {
  teamName: string
  characterId: CharacterId
  wissensPunkte: number
  dosimeterMSv: number
  budget: number
  currentLevel: number
  equipment: string[]
  levelResults: LevelResult[]
  startedAt: number
  avatarConfig?: AvatarConfig
}

export interface LevelResult {
  levelNumber: number
  wpEarned: number
  dosimeterDelta: number
  completed: boolean
  answers: Record<string, unknown>
  justification?: string
  justificationWP?: number // set by teacher
  justificationStatus: 'pending' | 'auto' | 'approved'
  completedAt: number
}

export interface DosimeterTier {
  decision: 'best' | 'ok' | 'bad'
  delta: 0 | 5 | 10
}

/** Tracks which levels are unlocked for which teams by the teacher */
export interface LevelUnlock {
  teamName: string
  unlockedUpTo: number // highest level number unlocked (1-indexed). 1 = only L1 playable
}

/** Multi-team storage: each team state stored under nova7_teams.<teamName> */
export interface TeamsStorage {
  [teamName: string]: TeamState
}
