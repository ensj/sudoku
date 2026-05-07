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
  // For each digit, find the bitmask of cells (within the unit) where it can still go.
  const cellsForDigit: number[] = new Array(10).fill(0)
  const placed = new Set<number>()
  for (const i of unit) {
    if (state.grid[i] !== 0) {
      placed.add(state.grid[i])
      continue
    }
    for (let d = 1; d <= 9; d++) {
      if (state.candidates[i] & maskFromDigit(d)) {
        cellsForDigit[d] |= 1 << unit.indexOf(i)
      }
    }
  }
  // Iterate combinations of `size` digits not yet placed.
  const candidates: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (!placed.has(d) && cellsForDigit[d] !== 0) candidates.push(d)
  }
  if (candidates.length <= size) return null

  for (const combo of combinations(candidates, size)) {
    let cellMask = 0
    for (const d of combo) cellMask |= cellsForDigit[d]
    if (popcount(cellMask) !== size) continue
    // Hidden subset: digits in `combo` are confined to cells indicated by cellMask.
    // Eliminate other digits from those cells.
    const digitMask = combo.reduce((acc, d) => acc | maskFromDigit(d), 0)
    const elims: { index: number; digit: number }[] = []
    for (let pos = 0; pos < unit.length; pos++) {
      if (!(cellMask & (1 << pos))) continue
      const i = unit[pos]
      const extra = state.candidates[i] & ~digitMask
      if (extra === 0) continue
      for (let d = 1; d <= 9; d++) {
        if (extra & maskFromDigit(d)) elims.push({ index: i, digit: d })
      }
    }
    if (elims.length === 0) continue
    for (const e of elims) state.candidates[e.index] &= ~maskFromDigit(e.digit)
    return { technique: 'hiddenSubset', placements: [], eliminations: elims }
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
