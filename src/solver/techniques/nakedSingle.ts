import { digitsFromMask, indicesSeenBy, maskFromDigit, popcount } from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] !== 0) continue
    if (popcount(state.candidates[i]) !== 1) continue
    const digit = digitsFromMask(state.candidates[i])[0]
    place(state, i, digit)
    return {
      technique: 'nakedSingle',
      placements: [{ index: i, digit }],
      eliminations: [],
    }
  }
  return null
}

/** Place a digit and propagate the elimination to all peers. */
export function place(state: State, index: number, digit: number): void {
  state.grid[index] = digit
  state.candidates[index] = 0
  const mask = ~maskFromDigit(digit)
  for (const j of indicesSeenBy(index)) {
    state.candidates[j] &= mask
  }
}
