import { assert, assertEquals } from '@std/assert'
import { apply as hiddenSingle } from '../../src/solver/techniques/hiddenSingle.ts'
import { computeCandidates, parsePuzzle } from '../../src/grid.ts'

Deno.test('hiddenSingle finds digit forced into one cell of a row', () => {
  // Place digit 1 in cols 1-8 (one per row, one per box, none in box 0 or col 0).
  // After this, only cell 0 of row 0 can hold a 1 → hidden single.
  // Placements: (1,3) box 1, (2,6) box 2, (3,1) box 3, (4,4) box 4,
  //             (5,7) box 5, (6,2) box 6, (7,5) box 7, (8,8) box 8.
  const rows = [
    '.........', // row 0
    '...1.....', // row 1: col 3
    '......1..', // row 2: col 6
    '.1.......', // row 3: col 1
    '....1....', // row 4: col 4
    '.......1.', // row 5: col 7
    '..1......', // row 6: col 2
    '.....1...', // row 7: col 5
    '........1', // row 8: col 8
  ]
  const puzzle = rows.join('')
  const state = parsePuzzle(puzzle)
  computeCandidates(state)
  const step = hiddenSingle(state)
  assertEquals(step?.technique, 'hiddenSingle')
  assert(
    step?.placements.some((p) => p.index === 0 && p.digit === 1),
    'expected hidden single 1 at index 0',
  )
})

Deno.test('hiddenSingle returns null on empty board', () => {
  const state = parsePuzzle('.'.repeat(81))
  computeCandidates(state)
  assertEquals(hiddenSingle(state), null)
})
