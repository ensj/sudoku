import { ALL_UNITS, indicesSeenBy, maskFromDigit } from '../../grid.ts'
import type { SolveStep, State } from '../../types.ts'

export function apply(state: State): SolveStep | null {
  for (let d = 1; d <= 9; d++) {
    const m = maskFromDigit(d)
    // Build strong-link adjacency: cells that are the only two candidates for d in some unit.
    const adj = new Map<number, Set<number>>()
    for (const unit of ALL_UNITS) {
      const cells: number[] = []
      let placed = false
      for (const i of unit) {
        if (state.grid[i] === d) { placed = true; break }
        if (state.candidates[i] & m) cells.push(i)
      }
      if (placed) continue
      if (cells.length === 2) {
        const [a, b] = cells
        if (!adj.has(a)) adj.set(a, new Set())
        if (!adj.has(b)) adj.set(b, new Set())
        adj.get(a)!.add(b)
        adj.get(b)!.add(a)
      }
    }
    // Two-color each connected component (BFS).
    const color = new Map<number, 0 | 1>()
    for (const start of adj.keys()) {
      if (color.has(start)) continue
      const queue: number[] = [start]
      color.set(start, 0)
      const component: number[] = []
      while (queue.length > 0) {
        const u = queue.shift()!
        component.push(u)
        for (const v of adj.get(u)!) {
          if (!color.has(v)) {
            color.set(v, color.get(u) === 0 ? 1 : 0)
            queue.push(v)
          }
        }
      }
      // Same-color contradiction: if two cells of the same color see each other.
      for (let i = 0; i < component.length; i++) {
        for (let j = i + 1; j < component.length; j++) {
          const a = component[i], b = component[j]
          if (color.get(a) !== color.get(b)) continue
          if (!indicesSeenBy(a).has(b)) continue
          // Eliminate digit d from all cells of this color.
          const badColor = color.get(a)!
          const elims: { index: number; digit: number }[] = []
          for (const cell of component) {
            if (color.get(cell) === badColor) {
              elims.push({ index: cell, digit: d })
              state.candidates[cell] &= ~m
            }
          }
          if (elims.length > 0) {
            return { technique: 'coloring', placements: [], eliminations: elims }
          }
        }
      }
      // Off-color seeing both colors: any cell outside the component that sees both colors → eliminate d.
      const seesColor: Map<number, Set<0 | 1>> = new Map()
      for (const cell of component) {
        const c = color.get(cell)!
        for (const peer of indicesSeenBy(cell)) {
          if (color.has(peer)) continue
          if (state.grid[peer] !== 0) continue
          if (!(state.candidates[peer] & m)) continue
          if (!seesColor.has(peer)) seesColor.set(peer, new Set())
          seesColor.get(peer)!.add(c)
        }
      }
      const elims: { index: number; digit: number }[] = []
      for (const [peer, colors] of seesColor) {
        if (colors.size === 2) {
          elims.push({ index: peer, digit: d })
          state.candidates[peer] &= ~m
        }
      }
      if (elims.length > 0) {
        return { technique: 'coloring', placements: [], eliminations: elims }
      }
    }
  }
  return null
}
