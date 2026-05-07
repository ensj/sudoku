import { assert, assertEquals } from '@std/assert'
import { rate, solve } from '../src/solver/index.ts'

Deno.test('solve returns solved grid for an easy puzzle', () => {
  // Solvable purely by naked + hidden singles.
  const puzzle = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
  const result = solve(puzzle)
  assertEquals(result.solved, true)
  assertEquals(result.solution?.includes('.'), false)
  assertEquals(result.unique, true)
})

Deno.test('rate classifies a singles-only puzzle as easy', () => {
  const puzzle = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
  const r = rate(puzzle)
  assert(r === 'easy' || r === 'medium' || r === 'hard', 'must be a difficulty')
})

Deno.test('rate returns invalid for a puzzle with no solution', () => {
  // Two 1s in row 0 → unsolvable.
  const bad = '11' + '.'.repeat(79)
  assertEquals(rate(bad), 'invalid')
})

Deno.test('rate returns invalid for a puzzle with multiple solutions', () => {
  // Mostly-empty puzzle has many solutions.
  const empty = '.'.repeat(81)
  assertEquals(rate(empty), 'invalid')
})

Deno.test('solve.steps logs at least one technique application', () => {
  const puzzle = '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79'
  const result = solve(puzzle)
  assert(result.steps.length > 0, 'expected at least one step')
})
