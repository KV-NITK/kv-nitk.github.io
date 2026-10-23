// Renders the Parva 2026 reel frames from reel.html (served by `npm run dev`).
//
//   frames:  node parva-posters/reel/render.mjs                -> reel/frames/0000.jpg ... 0663.jpg
//   stills:  node parva-posters/reel/render.mjs --stills 0,4.5,19.9 --dir /some/folder
//   safe:    add --safe to draw the Instagram safe area and print any text outside it
//
// Env: CHROME (path to Chromium), REEL_URL (default http://localhost:5199/parva-posters/reel/reel.html)
import { chromium } from '../../node_modules/playwright-core/index.mjs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const dir = path.dirname(fileURLToPath(import.meta.url))
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`)
  return i < 0 ? null : process.argv[i + 1] ?? true
}
const chrome = process.env.CHROME || path.join(os.homedir(), '.cache/ms-playwright/chromium-1248/chrome-linux64/chrome')
const url = process.env.REEL_URL || 'http://localhost:5199/parva-posters/reel/reel.html'
const FPS = 30
const FRAMES = 664
const safe = process.argv.includes('--safe')

const browser = await chromium.launch({ executablePath: chrome })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
page.on('console', (m) => m.type() === 'error' && console.log('[page]', m.text()))
page.on('pageerror', (e) => console.log('[page error]', e.message))
await page.goto(url)
await page.waitForFunction(() => window.reelReady === true, null, { timeout: 120000 })
await page.waitForTimeout(300)

const shot = (file) => page.locator('#out').screenshot({ path: file, type: 'jpeg', quality: 95 })

const stills = arg('stills')
if (stills) {
  const out = arg('dir') || path.join(dir, 'stills')
  fs.mkdirSync(out, { recursive: true })
  // Stills are drawn in order from a warm-up so the film layer, dust and smoke are in a normal state
  for (const t of String(stills).split(',').map(Number)) {
    for (let w = Math.max(0, t - 0.2); w < t; w += 1 / FPS) await page.evaluate((x) => window.renderAt(x), w)
    const rec = await page.evaluate(([x, s]) => window.renderAt(x, { record: true, safe: s }), [t, safe])
    const file = path.join(out, `still-${t.toFixed(2)}.jpg`)
    await shot(file)
    console.log(file)
    if (safe) {
      for (const b of rec.filter((b) => b.a > 0.5 && b.r > 0 && b.l < 405)) {
        const bad = b.l < 22 - 0.5 || b.r > 360 + 0.5 || b.t < 80 - 0.5 || b.b > 555 + 0.5
        if (bad) console.log(`  OUTSIDE SAFE AREA t=${t}: "${b.s}" x ${b.l.toFixed(1)}-${b.r.toFixed(1)} y ${b.t.toFixed(1)}-${b.b.toFixed(1)}`)
      }
    }
  }
} else {
  const out = path.join(dir, 'frames')
  fs.rmSync(out, { recursive: true, force: true })
  fs.mkdirSync(out)
  const violations = []
  for (let i = 0; i < FRAMES; i++) {
    const rec = await page.evaluate((t) => window.renderAt(t, { record: true }), i / FPS)
    for (const b of rec) {
      if (b.a > 0.5 && b.r > 0 && b.l < 405 && (b.l < 21.5 || b.r > 360.5 || b.t < 79.5 || b.b > 555.5)) violations.push({ frame: i, ...b })
    }
    await shot(path.join(out, `${String(i).padStart(4, '0')}.jpg`))
    if (i % 60 === 0) console.log('frame', i)
  }
  const seen = new Map()
  for (const v of violations) if (!seen.has(v.s)) seen.set(v.s, v)
  console.log(`safe-area violations: ${violations.length} text draws`)
  for (const v of seen.values()) console.log(`  first at frame ${v.frame}: "${v.s}" x ${v.l.toFixed(1)}-${v.r.toFixed(1)} y ${v.t.toFixed(1)}-${v.b.toFixed(1)}`)
}
await browser.close()
