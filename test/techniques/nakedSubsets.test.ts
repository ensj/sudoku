import { assert, assertEquals } from '@std/assert'
import { apply as nakedSubsets } from '../../src/solver/techniques/nakedSubsets.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('nakedSubsets finds a naked pair and eliminates from peers', () => {
  // Row 0 cells 0 and 1 are empty; cells 2-8 hold digits 3..9.
  // After computeCandidates, cells (0,0) and (0,1) have candidates {1,2}.
  // The naked pair fires inside box 0: cells (1,0)..(2,2) are empty and
  // currently include 1 and 2 in their candidates → eliminate.
  const rows: string[] = []
  rows.push('..3456789')
  for (let i = 0; i < 8; i++) rows.push('.'.repeat(9))
  const puzzle = rows.join('')
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = nakedSubsets(state)
  assertEquals(step?.technique, 'nakedSubset')
  assert(step!.eliminations.length > 0, 'expected at least one elimination')
  for (const e of step!.eliminations) {
    assert(e.digit === 1 || e.digit === 2)
    assert(e.index !== 0 && e.index !== 1)
  }
})

Deno.test('nakedSubsets returns null when none exist', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(nakedSubsets(state), null)
})
