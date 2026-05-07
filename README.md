# @ensj/sudoku

A technique-aware sudoku solver and generator for TypeScript.

Unlike most npm sudoku libraries, difficulty here is determined by the **techniques** a human solver
would use — not by clue count or backtracking depth.

## Install

```bash
# Deno
deno add @ensj/sudoku

# npm
npx jsr add @ensj/sudoku
```

## Quick start

```ts
import { generate, rate, solve } from '@ensj/sudoku'

const puzzle = generate('hard')
const result = solve(puzzle)
console.log(result.hardestTechnique) // e.g. 'xWing'
```

See `src/index.ts` for the full API.

## License

MIT
