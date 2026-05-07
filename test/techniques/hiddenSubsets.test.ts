import { assert, assertEquals } from '@std/assert'
import { apply as hiddenSubsets } from '../../src/solver/techniques/hiddenSubsets.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('hiddenSubsets finds a hidden pair or triple', () => {
  // Standard hidden pair test puzzle (from sudokuwiki.org-style examples).
  const puzzle = '.........' +
    '9.46.7...' +
    '.768.41..' +
    '3.97.1.8.' +
    '7.8...3.1' +
    '.513.6.7.' +
    '..75.69..' +
    '...8.23.7' +
    '.........'
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = hiddenSubsets(state)
  assert(step !== null, 'expected to find a hidden subset')
  assertEquals(step!.technique, 'hiddenSubset')
  assert(step!.eliminations.length > 0)
})

Deno.test('hiddenSubsets returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(hiddenSubsets(state), null)
})
