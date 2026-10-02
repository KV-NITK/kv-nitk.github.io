// Redraws the two Parva Market walkers and bakes them into sprite sheets.
//
//   node scripts/market-characters/render.mjs
//
// boy.html and girl.html draw one character each as SVG (a soft painted look:
// gradients, a warm ink line, a wobbly edge and paper grain) in a 4 × 4 grid:
// a row per facing (down, left, right, up) and a 4-frame walk cycle across.
// This script screenshots each grid with a transparent background and writes
// it to market/assets/characters/ as WebP. ImageMagick (`magick`) is needed.
// The frame layout is described in market/world/characters.js.

import { chromium } from 'playwright-core'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '../../src/components/Parva26/market/assets/characters')

function chromePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM
  const cache = join(homedir(), '.cache', 'ms-playwright')
  const shell = readdirSync(cache).find((d) => d.startsWith('chromium_headless_shell'))
  return join(cache, shell, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
}

const tmp = mkdtempSync(join(tmpdir(), 'market-characters-'))
const browser = await chromium.launch({ executablePath: chromePath() })
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 1200 } })
  page.on('pageerror', (e) => console.error('page error:', e.message))
  for (const name of ['boy', 'girl']) {
    await page.goto(pathToFileURL(join(here, `${name}.html`)).href)
    await page.waitForSelector('body[data-ready]')
    const png = join(tmp, `${name}.png`)
    await page.locator('#sheet').screenshot({ path: png, omitBackground: true })
    execFileSync('magick', [png, '-quality', '92', '-define', 'webp:alpha-quality=100', '-define', 'webp:method=6', join(OUT, `${name}.webp`)])
    console.log(`wrote ${name}.webp`)
  }
} finally {
  await browser.close()
  rmSync(tmp, { recursive: true, force: true })
}
