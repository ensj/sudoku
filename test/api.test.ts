import { assert, assertEquals } from '@std/assert'
import { generate, rate, solve, type SolveResult, type TechniqueId } from '../src/index.ts'

Deno.test('public API surface is exported', () => {
  const p = generate('easy', { seed: 1 })
  const r: SolveResult = solve(p)
  const cls = rate(p)
  assert(typeof p === 'string')
  assertEquals(p.length, 81)
  assert(typeof r.solved === 'boolean')
  assert(['easy', 'medium', 'hard', 'beyond-hard', 'invalid'].includes(cls as string))
})

Deno.test('TechniqueId values are stable strings', () => {
  const expected: TechniqueId[] = [
    'nakedSingle',
    'hiddenSingle',
    'lockedCandidates',
    'nakedSubset',
    'hiddenSubset',
    'xWing',
    'swordfish',
    'xyWing',
    'coloring',
    'chain',
  ]
  // Compile-time check: any drift fails to compile.
  assert(expected.length === 10)
})
