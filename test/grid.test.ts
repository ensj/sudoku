import { assertEquals, assertThrows } from '@std/assert'
import {
  ALL_CANDIDATES,
  BOX_INDICES,
  COL_INDICES,
  computeCandidates,
  digitsFromMask,
  indicesSeenBy,
  maskFromDigit,
  parsePuzzle,
  popcount,
  ROW_INDICES,
  serializeGrid,
} from '../src/grid.ts'

const EMPTY = '.'.repeat(81)

Deno.test('parsePuzzle handles empty', () => {
  const s = parsePuzzle(EMPTY)
  assertEquals(s.grid.length, 81)
  assertEquals([...s.grid], new Array(81).fill(0))
})

Deno.test('parsePuzzle and serializeGrid round-trip', () => {
  const p = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
  const s = parsePuzzle(p)
  assertEquals(serializeGrid(s.grid), p)
})

Deno.test('parsePuzzle rejects wrong length', () => {
  assertThrows(() => parsePuzzle('123'), Error, 'length')
})

Deno.test('parsePuzzle rejects invalid characters', () => {
  const bad = 'X'.repeat(81)
  assertThrows(() => parsePuzzle(bad), Error, 'character')
})

Deno.test('parsePuzzle rejects duplicate clue in a unit', () => {
  // Two 1s in row 0
  const bad = '11' + '.'.repeat(79)
  assertThrows(() => parsePuzzle(bad), Error, 'duplicate')
})

Deno.test('maskFromDigit / digitsFromMask round-trip', () => {
  for (let d = 1; d <= 9; d++) {
    const m = maskFromDigit(d)
    assertEquals(digitsFromMask(m), [d])
  }
  // Multi-digit mask
  const m = maskFromDigit(2) | maskFromDigit(5) | maskFromDigit(7)
  assertEquals(digitsFromMask(m), [2, 5, 7])
})

Deno.test('popcount', () => {
  assertEquals(popcount(0), 0)
  assertEquals(popcount(0b1), 1)
  assertEquals(popcount(0b101010101), 5)
  assertEquals(popcount(ALL_CANDIDATES), 9)
})

Deno.test('ROW_INDICES has 9 rows of 9 cells each', () => {
  assertEquals(ROW_INDICES.length, 9)
  for (const row of ROW_INDICES) assertEquals(row.length, 9)
  assertEquals(ROW_INDICES[0], [0, 1, 2, 3, 4, 5, 6, 7, 8])
  assertEquals(ROW_INDICES[8], [72, 73, 74, 75, 76, 77, 78, 79, 80])
})

Deno.test('COL_INDICES has 9 cols of 9 cells each', () => {
  assertEquals(COL_INDICES.length, 9)
  assertEquals(COL_INDICES[0], [0, 9, 18, 27, 36, 45, 54, 63, 72])
})

Deno.test('BOX_INDICES has 9 boxes of 9 cells each', () => {
  assertEquals(BOX_INDICES.length, 9)
  assertEquals(BOX_INDICES[0], [0, 1, 2, 9, 10, 11, 18, 19, 20])
  assertEquals(BOX_INDICES[4], [30, 31, 32, 39, 40, 41, 48, 49, 50])
})

Deno.test('indicesSeenBy returns 20 cells (excluding self)', () => {
  const seen = indicesSeenBy(40) // center cell
  assertEquals(seen.size, 20)
  assertEquals(seen.has(40), false)
  assertEquals(seen.has(41), true) // same row
  assertEquals(seen.has(31), true) // same col
  assertEquals(seen.has(50), true) // same box
})

Deno.test('computeCandidates fills empty cells with possibilities', () => {
  const p = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
  const s = parsePuzzle(p)
  computeCandidates(s)
  // Cell 0 is filled with 5; its candidates mask should be 0.
  assertEquals(s.candidates[0], 0)
  // Cell 2 is empty in row [5,3,_,_,7,...]; can't be 5,3,7. And col 2, box 0 also constrain.
  const cell2digits = digitsFromMask(s.candidates[2])
  assertEquals(cell2digits.includes(5), false)
  assertEquals(cell2digits.includes(3), false)
  assertEquals(cell2digits.includes(7), false)
})
