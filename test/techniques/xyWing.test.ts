import { assertEquals } from '@std/assert'
import { apply as xyWing } from '../../src/solver/techniques/xyWing.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('xyWing returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(xyWing(state), null)
})

// Positive xy-wing fixtures require running easier techniques first to reduce
// candidates to the {xy}, {xz}, {yz} configuration. Full coverage happens via
// solver.test.ts (Task 15) using a known XY-Wing puzzle.
