import type { State } from './types.ts'

export const ALL_CANDIDATES = 0b111111111 // bits 0-8 set, representing digits 1-9

export function maskFromDigit(d: number): number {
  return 1 << (d - 1)
}

export function digitsFromMask(mask: number): number[] {
  const out: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (mask & maskFromDigit(d)) out.push(d)
  }
  return out
}

export function popcount(mask: number): number {
  let n = 0
  while (mask) {
    mask &= mask - 1
    n++
  }
  return n
}

export const ROW_INDICES: number[][] = []
for (let r = 0; r < 9; r++) {
  const row: number[] = []
  for (let c = 0; c < 9; c++) row.push(r * 9 + c)
  ROW_INDICES.push(row)
}

export const COL_INDICES: number[][] = []
for (let c = 0; c < 9; c++) {
  const col: number[] = []
  for (let r = 0; r < 9; r++) col.push(r * 9 + c)
  COL_INDICES.push(col)
}

export const BOX_INDICES: number[][] = []
for (let br = 0; br < 3; br++) {
  for (let bc = 0; bc < 3; bc++) {
    const box: number[] = []
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        box.push((br * 3 + r) * 9 + (bc * 3 + c))
      }
    }
    BOX_INDICES.push(box)
  }
}

export const ALL_UNITS: number[][] = [...ROW_INDICES, ...COL_INDICES, ...BOX_INDICES]

/** Map cell index → its row, col, box indices in the unit arrays. */
export function rowOf(i: number): number {
  return Math.floor(i / 9)
}
export function colOf(i: number): number {
  return i % 9
}
export function boxOf(i: number): number {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3)
}

const SEEN_BY_CACHE: Map<number, Set<number>> = new Map()

/** Returns the set of 20 cells that share a row, column, or box with the given cell (excluding self). */
export function indicesSeenBy(i: number): Set<number> {
  const cached = SEEN_BY_CACHE.get(i)
  if (cached) return cached
  const seen = new Set<number>()
  for (const idx of ROW_INDICES[rowOf(i)]) seen.add(idx)
  for (const idx of COL_INDICES[colOf(i)]) seen.add(idx)
  for (const idx of BOX_INDICES[boxOf(i)]) seen.add(idx)
  seen.delete(i)
  SEEN_BY_CACHE.set(i, seen)
  return seen
}

export function parsePuzzle(puzzle: string): State {
  if (puzzle.length !== 81) {
    throw new Error(`puzzle must be length 81, got ${puzzle.length}`)
  }
  const grid = new Uint8Array(81)
  for (let i = 0; i < 81; i++) {
    const ch = puzzle[i]
    if (ch === '.' || ch === '0') {
      grid[i] = 0
    } else if (ch >= '1' && ch <= '9') {
      grid[i] = ch.charCodeAt(0) - '0'.charCodeAt(0)
    } else {
      throw new Error(`invalid character '${ch}' at index ${i}`)
    }
  }
  // Validate that no row/col/box contains duplicate clues.
  for (const unit of ALL_UNITS) {
    const seen = new Uint8Array(10)
    for (const i of unit) {
      const d = grid[i]
      if (d === 0) continue
      if (seen[d]) {
        throw new Error(`duplicate digit ${d} in unit (cell index ${i})`)
      }
      seen[d] = 1
    }
  }
  const candidates = new Uint16Array(81)
  return { grid, candidates }
}

export function serializeGrid(grid: Uint8Array): string {
  let out = ''
  for (let i = 0; i < 81; i++) {
    out += grid[i] === 0 ? '.' : String(grid[i])
  }
  return out
}

/** Recompute the candidate mask for every empty cell based on the current grid. */
export function computeCandidates(state: State): void {
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] !== 0) {
      state.candidates[i] = 0
      continue
    }
    let mask = ALL_CANDIDATES
    for (const j of indicesSeenBy(i)) {
      const d = state.grid[j]
      if (d !== 0) mask &= ~maskFromDigit(d)
    }
    state.candidates[i] = mask
  }
}

export function cloneState(state: State): State {
  return {
    grid: new Uint8Array(state.grid),
    candidates: new Uint16Array(state.candidates),
  }
}
