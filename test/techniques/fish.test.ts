import { assert, assertEquals } from '@std/assert'
import { apply as fish } from '../../src/solver/techniques/fish.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('fish finds an X-Wing on a known puzzle', () => {
  // Verified X-Wing puzzle. On digit 2, rows 0 and 4 each have candidate 2
  // confined to columns 6 and 8, forming an X-Wing that eliminates digit 2
  // from cells (row 1, col 6) and (row 1, col 8).
  const puzzle = '980000000000700050010026000000400301000901000302008000000150090060003000000000027'
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = fish(state)
  assert(step !== null, 'expected fish to fire')
  assertEquals(step!.technique, 'xWing')
  assert(step!.eliminations.length > 0)
})

Deno.test('fish returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(fish(state), null)
})
