import { COL_INDICES, maskFromDigit, ROW_INDICES } from '../../grid.ts'
import type { SolveStep, State, TechniqueId } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  // Try size 2 (X-Wing) then size 3 (Swordfish).
  for (const size of [2, 3]) {
    const technique: TechniqueId = size === 2 ? 'xWing' : 'swordfish'
    // Row-based: rows define base set, columns define cover set.
    let step = findFish(state, ROW_INDICES, COL_INDICES, size, technique, true)
    if (step) return step
    // Column-based: cols define base set, rows define cover set.
    step = findFish(state, COL_INDICES, ROW_INDICES, size, technique, false)
    if (step) return step
  }
  return null
}

function findFish(
  state: State,
  baseUnits: number[][],
  coverUnits: number[][],
  size: number,
  technique: TechniqueId,
  baseIsRow: boolean,
): SolveStep | null {
  for (let d = 1; d <= 9; d++) {
    const m = maskFromDigit(d)
    const baseToCover: number[][] = []
    const validBases: number[] = []
    for (let bi = 0; bi < baseUnits.length; bi++) {
      const base = baseUnits[bi]
      let alreadyPlaced = false
      const covers: number[] = []
      for (let pos = 0; pos < base.length; pos++) {
        const cell = base[pos]
        if (state.grid[cell] === d) {
          alreadyPlaced = true
          break
        }
        if (state.candidates[cell] & m) covers.push(pos)
      }
      if (alreadyPlaced) continue
      if (covers.length >= 2 && covers.length <= size) {
        validBases.push(bi)
        baseToCover.push(covers)
      }
    }
    if (validBases.length < size) continue

    for (const combo of combinations(validBases, size)) {
      const coverSet = new Set<number>()
      for (const bi of combo) {
        for (const pos of baseToCover[validBases.indexOf(bi)]) coverSet.add(pos)
      }
      if (coverSet.size !== size) continue
      const baseSet = new Set(combo)
      const elims: { index: number; digit: number }[] = []
      for (const pos of coverSet) {
        const cover = coverUnits[pos]
        for (let bi = 0; bi < baseUnits.length; bi++) {
          if (baseSet.has(bi)) continue
          const cell = baseIsRow ? cover[bi] : cover[bi]
          if (state.grid[cell] !== 0) continue
          if (state.candidates[cell] & m) {
            elims.push({ index: cell, digit: d })
          }
        }
      }
      if (elims.length === 0) continue
      for (const e of elims) state.candidates[e.index] &= ~m
      return { technique, placements: [], eliminations: elims }
    }
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
