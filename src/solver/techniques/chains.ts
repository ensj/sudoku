import { digitsFromMask, indicesSeenBy, maskFromDigit, popcount } from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

const MAX_CHAIN_LEN = 6

export function apply(state: State): SolveStep | null {
  const bivalues: number[] = []
  for (let i = 0; i < 81; i++) {
    if (state.grid[i] === 0 && popcount(state.candidates[i]) === 2) bivalues.push(i)
  }

  // Adjacency: two bivalues are linked if they see each other and share a digit.
  // Edge label is the shared digit.
  const adj = new Map<number, { neighbor: number; sharedDigit: number }[]>()
  for (const a of bivalues) {
    const seen = indicesSeenBy(a)
    const aDigits = digitsFromMask(state.candidates[a])
    const list: { neighbor: number; sharedDigit: number }[] = []
    for (const b of bivalues) {
      if (a === b) continue
      if (!seen.has(b)) continue
      const shared = aDigits.filter((d) => state.candidates[b] & maskFromDigit(d))
      if (shared.length === 1) list.push({ neighbor: b, sharedDigit: shared[0] })
    }
    adj.set(a, list)
  }

  // BFS chains from each bivalue.
  for (const start of bivalues) {
    const startDigits = digitsFromMask(state.candidates[start])
    for (const startEntryDigit of startDigits) {
      const startExitDigit = startDigits.find((d) => d !== startEntryDigit)!
      const visited = new Set<string>()
      const queue: { cell: number; entry: number; path: number[]; depth: number }[] = [
        { cell: start, entry: startEntryDigit, path: [start], depth: 1 },
      ]
      while (queue.length > 0) {
        const { cell, entry, path, depth } = queue.shift()!
        if (depth > MAX_CHAIN_LEN) continue
        const cellDigits = digitsFromMask(state.candidates[cell])
        const exit = cellDigits.find((d) => d !== entry)!
        if (depth >= 3 && exit === startExitDigit) {
          const seenStart = indicesSeenBy(start)
          const seenCell = indicesSeenBy(cell)
          const m = maskFromDigit(exit)
          const elims: { index: number; digit: number }[] = []
          for (const peer of seenStart) {
            if (peer === cell || path.includes(peer)) continue
            if (!seenCell.has(peer)) continue
            if (state.grid[peer] !== 0) continue
            if (state.candidates[peer] & m) elims.push({ index: peer, digit: exit })
          }
          if (elims.length > 0) {
            for (const e of elims) state.candidates[e.index] &= ~m
            return { technique: 'chain', placements: [], eliminations: elims }
          }
        }
        for (const { neighbor, sharedDigit } of adj.get(cell) ?? []) {
          if (sharedDigit !== exit) continue
          if (path.includes(neighbor)) continue
          const key = `${neighbor}:${exit}`
          if (visited.has(key)) continue
          visited.add(key)
          queue.push({
            cell: neighbor,
            entry: exit,
            path: [...path, neighbor],
            depth: depth + 1,
          })
        }
      }
    }
  }
  return null
}
