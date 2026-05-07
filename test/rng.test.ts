import { assert, assertEquals } from '@std/assert'
import { mulberry32, shuffle } from '../src/generator/rng.ts'

Deno.test('mulberry32 is deterministic for a given seed', () => {
  const a = mulberry32(42)
  const b = mulberry32(42)
  for (let i = 0; i < 10; i++) {
    assertEquals(a(), b())
  }
})

Deno.test('mulberry32 produces values in [0, 1)', () => {
  const r = mulberry32(123)
  for (let i = 0; i < 1000; i++) {
    const v = r()
    assert(v >= 0 && v < 1, `value ${v} out of range`)
  }
})

Deno.test('shuffle is deterministic with seeded rng', () => {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const a = shuffle([...arr], mulberry32(7))
  const b = shuffle([...arr], mulberry32(7))
  assertEquals(a, b)
})

Deno.test('shuffle preserves elements', () => {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const shuffled = shuffle([...arr], mulberry32(99))
  assertEquals(shuffled.length, arr.length)
  assertEquals([...shuffled].sort((a, b) => a - b), arr)
})
