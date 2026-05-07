import {
  BOX_INDICES,
  boxOf,
  COL_INDICES,
  colOf,
  maskFromDigit,
  ROW_INDICES,
  rowOf,
} from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  // Pointing: within each box, for each digit, if candidates are confined to one row/col,
  // eliminate from that row/col outside the box.
  for (let b = 0; b < 9; b++) {
    const box = BOX_INDICES[b]
    for (let d = 1; d <= 9; d++) {
      const m = maskFromDigit(d)
      const rowsHit = new Set<number>()
      const colsHit = new Set<number>()
      let any = false
      for (const i of box) {
        if (state.grid[i] === d) {
          any = false
          rowsHit.clear()
          colsHit.clear()
          break
        }
        if (state.candidates[i] & m) {
          any = true
          rowsHit.add(rowOf(i))
          colsHit.add(colOf(i))
        }
      }
      if (!any) continue
      if (rowsHit.size === 1) {
        const r = [...rowsHit][0]
        const elims = elimFromUnit(state, ROW_INDICES[r], box, d)
        if (elims.length > 0) {
          for (const e of elims) state.candidates[e.index] &= ~m
          return { technique: 'lockedCandidates', placements: [], eliminations: elims }
        }
      }
      if (colsHit.size === 1) {
        const c = [...colsHit][0]
        const elims = elimFromUnit(state, COL_INDICES[c], box, d)
        if (elims.length > 0) {
          for (const e of elims) state.candidates[e.index] &= ~m
          return { technique: 'lockedCandidates', placements: [], eliminations: elims }
        }
      }
    }
  }
  // Claiming: within each row/col, for each digit, if candidates are confined to one box,
  // eliminate from that box outside the row/col.
  for (const unit of [...ROW_INDICES, ...COL_INDICES]) {
    for (let d = 1; d <= 9; d++) {
      const m = maskFromDigit(d)
      const boxesHit = new Set<number>()
      let any = false
      let hasPlaced = false
      for (const i of unit) {
        if (state.grid[i] === d) {
          hasPlaced = true
          break
        }
        if (state.candidates[i] & m) {
          any = true
          boxesHit.add(boxOf(i))
        }
      }
      if (hasPlaced || !any) continue
      if (boxesHit.size === 1) {
        const b = [...boxesHit][0]
        const elims = elimFromUnit(state, BOX_INDICES[b], unit, d)
        if (elims.length > 0) {
          for (const e of elims) state.candidates[e.index] &= ~m
          return { technique: 'lockedCandidates', placements: [], eliminations: elims }
        }
      }
    }
  }
  return null
}

function elimFromUnit(
  state: State,
  unit: number[],
  exclude: number[],
  digit: number,
): { index: number; digit: number }[] {
  const m = maskFromDigit(digit)
  const excludeSet = new Set(exclude)
  const elims: { index: number; digit: number }[] = []
  for (const i of unit) {
    if (excludeSet.has(i)) continue
    if (state.grid[i] !== 0) continue
    if (state.candidates[i] & m) {
      elims.push({ index: i, digit })
    }
  }
  return elims
}
