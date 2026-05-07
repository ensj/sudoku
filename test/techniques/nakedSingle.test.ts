import { assertEquals } from '@std/assert'
import { apply as nakedSingle } from '../../src/solver/techniques/nakedSingle.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('nakedSingle finds a forced cell', () => {
  // Row 0 has 8 of 9 digits filled; cell 0 must be the missing digit (5).
  const puzzle = '.23456789' + '.'.repeat(72)
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = nakedSingle(state)
  assertEquals(step?.technique, 'nakedSingle')
  assertEquals(step?.placements, [{ index: 0, digit: 1 }])
})

Deno.test('nakedSingle returns null when none exist', () => {
  const empty = '.'.repeat(81)
  const state = parsePuzzle(empty)
  computeCandidates(state)
  assertEquals(nakedSingle(state), null)
})

Deno.test('nakedSingle places digit and clears candidates', () => {
  const puzzle = '.23456789' + '.'.repeat(72)
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  nakedSingle(state)
  assertEquals(state.grid[0], 1)
  assertEquals(state.candidates[0], 0)
})
