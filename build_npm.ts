import { build, emptyDir } from 'jsr:@deno/dnt@^0.41.0'

await emptyDir('./npm')

await build({
  entryPoints: ['./src/index.ts'],
  outDir: './npm',
  shims: { deno: 'dev' },
  importMap: './deno.json',
  compilerOptions: { lib: ['ESNext', 'DOM'], target: 'ES2022' },
  package: {
    name: '@ensj/sudoku',
    version: Deno.args[0] ?? '0.0.0',
    description: 'Technique-aware sudoku solver and generator.',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/ensj/sudoku.git',
    },
    bugs: { url: 'https://github.com/ensj/sudoku/issues' },
    keywords: ['sudoku', 'solver', 'generator', 'puzzle', 'techniques'],
  },
  postBuild() {
    Deno.copyFileSync('LICENSE', 'npm/LICENSE')
    Deno.copyFileSync('README.md', 'npm/README.md')
  },
})
