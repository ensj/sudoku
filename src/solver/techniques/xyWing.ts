import { digitsFromMask, indicesSeenBy, maskFromDigit, popcount } from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  // Find all bivalue cells (exactly 2 candidates).
  const bivalues: number[] = []
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] === 0 && popcount(state.candidates[i]) === 2) bivalues.push(i)
  }
  if (bivalues.length < 3) return null

  for (const pivot of bivalues) {
    const [x, y] = digitsFromMask(state.candidates[pivot])
    const seenByPivot = indicesSeenBy(pivot)
    // Find pincers visible from pivot.
    const pincersXZ: { idx: number; z: number }[] = []
    const pincersYZ: { idx: number; z: number }[] = []
    for (const cand of bivalues) {
      if (cand === pivot) continue
      if (!seenByPivot.has(cand)) continue
      const digits = digitsFromMask(state.candidates[cand])
      if (digits.includes(x) && !digits.includes(y)) {
        const z = digits.find((d) => d !== x)!
        pincersXZ.push({ idx: cand, z })
      }
      if (digits.includes(y) && !digits.includes(x)) {
        const z = digits.find((d) => d !== y)!
        pincersYZ.push({ idx: cand, z })
      }
    }
    // Match pincers that share the same z.
    for (const a of pincersXZ) {
      for (const b of pincersYZ) {
        if (a.z !== b.z) continue
        const z = a.z
        const seenByA = indicesSeenBy(a.idx)
        const seenByB = indicesSeenBy(b.idx)
        const m = maskFromDigit(z)
        const elims: { index: number; digit: number }[] = []
        for (const i of seenByA) {
          if (i === pivot || i === a.idx || i === b.idx) continue
          if (!seenByB.has(i)) continue
          if (state.grid[i] !== 0) continue
          if (state.candidates[i] & m) elims.push({ index: i, digit: z })
        }
        if (elims.length === 0) continue
        for (const e of elims) state.candidates[e.index] &= ~m
        return { technique: 'xyWing', placements: [], eliminations: elims }
      }
    }
  }
  return null
}
