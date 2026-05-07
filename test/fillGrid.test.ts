import { assertEquals, assert } from '@std/assert'
import { fillGrid } from '../src/generator/fillGrid.ts'
import { mulberry32 } from '../src/generator/rng.ts'
import { BOX_INDICES, COL_INDICES, ROW_INDICES } from '../src/grid.ts'

function isValidComplete(grid: Uint8Array): boolean {
  for (const unit of [...ROW_INDICES, ...COL_INDICES, ...BOX_INDICES]) {
    const seen = new Set<number>()
    for (const i of unit) {
      const d = grid[i]
      if (d < 1 || d > 9) return false
      if (seen.has(d)) return false
      seen.add(d)
    }
  }
  return true
}

Deno.test('fillGrid produces a valid complete grid', () => {
  const g = fillGrid(mulberry32(1))
  assertEquals(g.length, 81)
  assert(isValidComplete(g), 'grid is not a valid complete sudoku')
})

Deno.test('fillGrid is deterministic for a given seed', () => {
  const a = fillGrid(mulberry32(42))
  const b = fillGrid(mulberry32(42))
  assertEquals([...a], [...b])
})

Deno.test('different seeds produce different grids', () => {
  const a = fillGrid(mulberry32(1))
  const b = fillGrid(mulberry32(2))
  assert([...a].some((v, i) => v !== b[i]), 'expected different grids')
})
