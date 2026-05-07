import { ALL_CANDIDATES, indicesSeenBy, maskFromDigit } from '../grid.ts'
import { shuffle, type Rng } from './rng.ts'

/**
 * Returns a fully-filled valid sudoku grid (81 cells, digits 1-9).
 * Uses randomized backtracking: at each empty cell, try digits in random order.
 */
export function fillGrid(rng: Rng): Uint8Array {
  const grid = new Uint8Array(81)
  if (!fill(grid, 0, rng)) {
    throw new Error('fillGrid: backtracking exhausted (should be impossible)')
  }
  return grid
}

function fill(grid: Uint8Array, index: number, rng: Rng): boolean {
  if (index >= 81) return true

  // Compute candidates for this cell from current grid state.
  let mask = ALL_CANDIDATES
  for (const j of indicesSeenBy(index)) {
    const d = grid[j]
    if (d !== 0) mask &= ~maskFromDigit(d)
  }
  if (mask === 0) return false

  const digits: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (mask & maskFromDigit(d)) digits.push(d)
  }
  shuffle(digits, rng)

  for (const d of digits) {
    grid[index] = d
    if (fill(grid, index + 1, rng)) return true
  }
  grid[index] = 0
  return false
}
