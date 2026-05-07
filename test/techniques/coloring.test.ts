import { assertEquals } from '@std/assert'
import { apply as coloring } from '../../src/solver/techniques/coloring.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('coloring returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(coloring(state), null)
})

// Positive coloring fixtures are large and tightly constrained. Validate
// coloring through full-puzzle integration in solver.test.ts (Task 15)
// using a known coloring-required puzzle.
