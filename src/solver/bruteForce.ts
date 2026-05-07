import {
  cloneState,
  computeCandidates,
  indicesSeenBy,
  maskFromDigit,
  popcount,
  serializeGrid,
} from '../grid.ts'
import type { State } from '../types.ts'

/**
 * Find up to `cap` solutions via backtracking.
 * Returns serialized solution strings.
 */
export function bruteForce(state: State, cap: number): string[] {
  const solutions: string[] = []
  const working = cloneState(state)
  computeCandidates(working)
  search(working, solutions, cap)
  return solutions
}

function search(state: State, solutions: string[], cap: number): boolean {
  if (solutions.length >= cap) return true
  // Find empty cell with fewest candidates.
  let bestIdx = -1
  let bestCount = 10
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] !== 0) continue
    const c = popcount(state.candidates[i])
    if (c === 0) return false
    if (c < bestCount) {
      bestCount = c
      bestIdx = i
    }
  }
  if (bestIdx === -1) {
    solutions.push(serializeGrid(state.grid))
    return solutions.length >= cap
  }
  const mask = state.candidates[bestIdx]
  for (let d = 1; d <= 9; d++) {
    if (!(mask & maskFromDigit(d))) continue
    const snapshot = {
      grid: new Uint8Array(state.grid),
      candidates: new Uint16Array(state.candidates),
    }
    state.grid[bestIdx] = d
    state.candidates[bestIdx] = 0
    const m = ~maskFromDigit(d)
    for (const j of indicesSeenBy(bestIdx)) state.candidates[j] &= m
    if (search(state, solutions, cap)) return true
    state.grid.set(snapshot.grid)
    state.candidates.set(snapshot.candidates)
  }
  return false
}
