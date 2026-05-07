import { assert, assertEquals } from '@std/assert'
import { apply as hiddenSubsets } from '../../src/solver/techniques/hiddenSubsets.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('hiddenSubsets finds a hidden pair or triple', () => {
  // SudokuWiki "Hidden Pairs" canonical example.
  const puzzle = '72...96........83..1.....79.6...3...8.41.6.5..3...8.92.7.....1..86........95...43'
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
