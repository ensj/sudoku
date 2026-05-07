import { assertEquals } from '@std/assert'
import { apply as chains } from '../../src/solver/techniques/chains.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('chains returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(chains(state), null)
})

// Positive chain fixtures are validated through solver.test.ts (Task 15)
// using known XY-Chain-required puzzles.
