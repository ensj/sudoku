import { computeCandidates, parsePuzzle, serializeGrid } from '../grid.ts'
import {
  type Difficulty,
  type Puzzle,
  type SolveResult,
  type SolveStep,
  type State,
  type TechniqueId,
  TIERS,
} from '../types.ts'
import { bruteForce } from './bruteForce.ts'
import { apply as nakedSingle } from './techniques/nakedSingle.ts'
import { apply as hiddenSingle } from './techniques/hiddenSingle.ts'
import { apply as lockedCandidates } from './techniques/lockedCandidates.ts'
import { apply as nakedSubsets } from './techniques/nakedSubsets.ts'
import { apply as hiddenSubsets } from './techniques/hiddenSubsets.ts'
import { apply as fish } from './techniques/fish.ts'
import { apply as xyWing } from './techniques/xyWing.ts'
import { apply as coloring } from './techniques/coloring.ts'
import { apply as chains } from './techniques/chains.ts'

type TechniqueFn = (state: State) => SolveStep | null

const TECHNIQUE_FNS: Record<TechniqueId, TechniqueFn> = {
  nakedSingle,
  hiddenSingle,
  lockedCandidates,
  nakedSubset: nakedSubsets,
  hiddenSubset: hiddenSubsets,
  xWing: fish,
  swordfish: fish,
  xyWing,
  coloring,
  chain: chains,
}

const TIER_ORDER: TechniqueId[] = TIERS.hard

const RANK: Record<TechniqueId, number> = {
  nakedSingle: 0,
  hiddenSingle: 1,
  lockedCandidates: 2,
  nakedSubset: 3,
  hiddenSubset: 4,
  xWing: 5,
  swordfish: 6,
  xyWing: 7,
  coloring: 8,
  chain: 9,
}

function isFilled(state: State): boolean {
  for (let i = 0; i < 81; i++) if (state.grid[i] === 0) return false
  return true
}

function hasContradiction(state: State): boolean {
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] === 0 && state.candidates[i] === 0) return true
  }
  return false
}

function solveWith(state: State, allowed: TechniqueId[]): {
  steps: SolveStep[]
  hardestTechnique: TechniqueId | null
  filled: boolean
} {
  const steps: SolveStep[] = []
  let hardest: TechniqueId | null = null
  const allowedSet = new Set(allowed)
  const seenFish = new Set<TechniqueId>()
  outer: while (!isFilled(state)) {
    if (hasContradiction(state)) return { steps, hardestTechnique: hardest, filled: false }
    for (const t of TIER_ORDER) {
      if (!allowedSet.has(t)) continue
      if ((t === 'xWing' || t === 'swordfish') && seenFish.has(t)) continue
      const fn = TECHNIQUE_FNS[t]
      const step = fn(state)
      if (step) {
        const used = step.technique
        if (used === 'xWing' || used === 'swordfish') seenFish.add(used)
        steps.push(step)
        if (hardest === null || RANK[used] > RANK[hardest]) hardest = used
        seenFish.clear()
        continue outer
      } else if (t === 'xWing' || t === 'swordfish') {
        seenFish.add(t)
      }
    }
    return { steps, hardestTechnique: hardest, filled: false }
  }
  return { steps, hardestTechnique: hardest, filled: true }
}

export function solve(puzzle: Puzzle): SolveResult {
  let state: State
  try {
    state = parsePuzzle(puzzle)
  } catch {
    return { solved: false, solution: null, unique: false, hardestTechnique: null, steps: [] }
  }
  computeCandidates(state)
  if (hasContradiction(state)) {
    return { solved: false, solution: null, unique: false, hardestTechnique: null, steps: [] }
  }
  const { steps, hardestTechnique, filled } = solveWith(state, TIERS.hard)
  if (filled) {
    const original = parsePuzzle(puzzle)
    const branches = bruteForce(original, 2)
    return {
      solved: true,
      solution: serializeGrid(state.grid),
      unique: branches.length === 1,
      hardestTechnique,
      steps,
    }
  }
  const original = parsePuzzle(puzzle)
  const branches = bruteForce(original, 2)
  return {
    solved: false,
    solution: branches.length >= 1 ? branches[0] : null,
    unique: branches.length === 1,
    hardestTechnique,
    steps,
  }
}

export function rate(puzzle: Puzzle): Difficulty | 'beyond-hard' | 'invalid' {
  let state: State
  try {
    state = parsePuzzle(puzzle)
  } catch {
    return 'invalid'
  }
  computeCandidates(state)
  if (hasContradiction(state)) return 'invalid'

  const branches = bruteForce(parsePuzzle(puzzle), 2)
  if (branches.length === 0) return 'invalid'
  if (branches.length > 1) return 'invalid'

  const { hardestTechnique, filled } = solveWith(state, TIERS.hard)
  if (!filled) return 'beyond-hard'
  if (hardestTechnique === null) {
    return 'easy'
  }
  if (TIERS.easy.includes(hardestTechnique)) return 'easy'
  if (TIERS.medium.includes(hardestTechnique)) return 'medium'
  return 'hard'
}

export { solveWith }
