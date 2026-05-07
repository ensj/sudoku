import { ALL_UNITS, maskFromDigit, popcount } from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  for (const unit of ALL_UNITS) {
    for (const size of [2, 3]) {
      const result = findInUnit(state, unit, size)
      if (result) return result
    }
  }
  return null
}

function findInUnit(
  state: State,
  unit: number[],
  size: number,
): SolveStep | null {
  const empties: number[] = []
  for (const i of unit) {
    if (state.grid[i] === 0 && state.candidates[i] !== 0) empties.push(i)
  }
  if (empties.length <= size) return null

  // Iterate combinations of `size` empties.
  const combos = combinations(empties, size)
  for (const combo of combos) {
    let mask = 0
    let ok = true
    for (const i of combo) {
      mask |= state.candidates[i]
      if (popcount(state.candidates[i]) > size) {
        ok = false
        break
      }
    }
    if (!ok) continue
    if (popcount(mask) !== size) continue
    // Naked subset found. Eliminate digits in `mask` from other empties of the unit.
    const elims: { index: number; digit: number }[] = []
    const inCombo = new Set(combo)
    for (const i of empties) {
      if (inCombo.has(i)) continue
      const overlap = state.candidates[i] & mask
      if (overlap === 0) continue
      for (let d = 1; d <= 9; d++) {
        if (overlap & maskFromDigit(d)) elims.push({ index: i, digit: d })
      }
    }
    if (elims.length === 0) continue
    for (const e of elims) state.candidates[e.index] &= ~maskFromDigit(e.digit)
    return { technique: 'nakedSubset', placements: [], eliminations: elims }
  }
  return null
}

function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  const n = arr.length
  if (k > n) return
  const idx = Array.from({ length: k }, (_, i) => i)
  while (true) {
    yield idx.map((i) => arr[i])
    let i = k - 1
    while (i >= 0 && idx[i] === n - k + i) i--
    if (i < 0) return
    idx[i]++
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1
  }
}
