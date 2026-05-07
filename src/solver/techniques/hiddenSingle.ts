import { ALL_UNITS, maskFromDigit } from '../../grid.ts'
import { place } from './nakedSingle.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  for (const unit of ALL_UNITS) {
    for (let d = 1; d <= 9; d++) {
      const dMask = maskFromDigit(d)
      let foundIndex = -1
      let alreadyPlaced = false
      for (const i of unit) {
        if (state.grid[i] === d) {
          alreadyPlaced = true
          break
        }
        if (state.candidates[i] & dMask) {
          if (foundIndex === -1) {
            foundIndex = i
          } else {
            foundIndex = -2
            break
          }
        }
      }
      if (alreadyPlaced) continue
      if (foundIndex >= 0) {
        place(state, foundIndex, d)
        return {
          technique: 'hiddenSingle',
          placements: [{ index: foundIndex, digit: d }],
          eliminations: [],
        }
      }
    }
  }
  return null
}
