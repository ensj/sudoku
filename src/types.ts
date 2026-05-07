export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * 81-character string representing a sudoku puzzle in row-major order.
 * '1'-'9' for clues, '.' for empty cells.
 */
export type Puzzle = string

export type TechniqueId =
  | 'nakedSingle'
  | 'hiddenSingle'
  | 'lockedCandidates'
  | 'nakedSubset'
  | 'hiddenSubset'
  | 'xWing'
  | 'swordfish'
  | 'xyWing'
  | 'coloring'
  | 'chain'

export interface SolveStep {
  technique: TechniqueId
  placements: { index: number; digit: number }[]
  eliminations: { index: number; digit: number }[]
}

export interface SolveResult {
  solved: boolean
  solution: Puzzle | null
  unique: boolean
  hardestTechnique: TechniqueId | null
  steps: SolveStep[]
}

export interface GenerateOptions {
  seed?: number
}

export const TIERS: Record<Difficulty, TechniqueId[]> = {
  easy: ['nakedSingle', 'hiddenSingle'],
  medium: [
    'nakedSingle',
    'hiddenSingle',
    'lockedCandidates',
    'nakedSubset',
    'hiddenSubset',
  ],
  hard: [
    'nakedSingle',
    'hiddenSingle',
    'lockedCandidates',
    'nakedSubset',
    'hiddenSubset',
    'xWing',
    'swordfish',
    'xyWing',
    'coloring',
    'chain',
  ],
}

/**
 * Internal solver state. Not exported from the public API.
 */
export interface State {
  /** Length 81. 0 = empty, 1-9 = filled digit. */
  grid: Uint8Array
  /** Length 81. Bit (d-1) set ⇒ digit d still possible. 0 ⇒ contradiction. */
  candidates: Uint16Array
}
