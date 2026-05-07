import { assert, assertEquals } from '@std/assert'
import { apply as lockedCandidates } from '../../src/solver/techniques/lockedCandidates.ts'
import { computeCandidates, maskFromDigit, parsePuzzle } from '../../src/grid.ts'

Deno.test('lockedCandidates finds a pointing/claiming pattern and eliminates candidates', () => {
  // Classic test puzzle. After computing initial candidates, the technique
  // discovers a pointing pattern for digit 6 in box 0: the only cell in
  // box 0 with candidate 6 is r1c1 (idx 10), so digit 6 in box 0 is
  // confined to column 1. That eliminates 6 as a candidate from the rest
  // of column 1 outside box 0 — specifically r7c1 (idx 64) and r8c1
  // (idx 73), which still have 6 as a candidate after peer constraints.
  const puzzle = '..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..'
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = lockedCandidates(state)
  assertEquals(step?.technique, 'lockedCandidates')
  assert(step!.eliminations.length > 0, 'expected at least one elimination')
  for (const e of step!.eliminations) {
    assertEquals(
      state.candidates[e.index] & maskFromDigit(e.digit),
      0,
      `expected candidate ${e.digit} to be cleared at index ${e.index}`,
    )
  }
})

Deno.test('lockedCandidates returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(lockedCandidates(state), null)
})
