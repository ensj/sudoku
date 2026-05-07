import { computeCandidates, parsePuzzle, serializeGrid } from '../grid.ts'
import { rate, solveWith } from '../solver/index.ts'
import { bruteForce } from '../solver/bruteForce.ts'
import { type Difficulty, type GenerateOptions, type Puzzle, type State, TIERS } from '../types.ts'
import { fillGrid } from './fillGrid.ts'
import { mulberry32, type Rng, shuffle } from './rng.ts'

const MAX_ATTEMPTS = 10

export function generate(difficulty: Difficulty, options: GenerateOptions = {}): Puzzle {
  const seed = options.seed ?? Math.floor(Math.random() * 0xFFFFFFFF)
  const rng = mulberry32(seed)
  let lastPuzzle: Puzzle = ''
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const puzzle = generateOnce(difficulty, rng)
    lastPuzzle = puzzle
    const r = rate(puzzle)
    if (r === difficulty) return puzzle
  }
  return lastPuzzle
}

function generateOnce(difficulty: Difficulty, rng: Rng): Puzzle {
  const full = fillGrid(rng)
  const state: State = { grid: new Uint8Array(full), candidates: new Uint16Array(81) }
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i), rng)
  const allowed = TIERS[difficulty]

  for (const idx of order) {
    const saved = state.grid[idx]
    state.grid[idx] = 0

    // Uniqueness check via bounded brute force on a fresh state.
    const probeBrute = parsePuzzle(serializeGrid(state.grid))
    const branches = bruteForce(probeBrute, 2)
    if (branches.length !== 1) {
      state.grid[idx] = saved
      continue
    }

    // Technique-tier check via solveWith.
    const probeTech = parsePuzzle(serializeGrid(state.grid))
    computeCandidates(probeTech)
    const { filled } = solveWith(probeTech, allowed)
    if (!filled) {
      state.grid[idx] = saved
      continue
    }
  }
  return serializeGrid(state.grid)
}
