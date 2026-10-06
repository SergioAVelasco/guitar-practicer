// Copia las fuentes y el soundfont de alphaTab a public/ antes de arrancar Vite.
// El plugin de alphaTab también los copia, pero en dev lo hace después de que Vite
// indexa public/, así que en el primer arranque se servían como 404 (index.html).
import { cpSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const alphaTabDist = dirname(require.resolve('@coderline/alphatab'))

for (const dir of ['font', 'soundfont']) {
  cpSync(join(alphaTabDist, dir), join('public', dir), { recursive: true })
}
