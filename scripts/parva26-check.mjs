// Visual check for the Parva 2026 page (/parva-26).
//
//   node scripts/parva26-check.mjs baseline   save reference screenshots
//   node scripts/parva26-check.mjs            shoot again and compare
//   P26_SUBTITLES=off node scripts/…          the same, with subtitles off
//
// Serve a production build first: `npx vite build && npx vite preview --port 5198`
// (or set P26_URL). Shots are taken with reduced motion, so nothing is
// animating, at the top of every scene, on a laptop and a phone viewport; a
// second pass with motion on only watches for page errors. Differences are
// measured with ImageMagick (`magick`), which must be installed.
// Screenshots go to .parva26-check/ (ignored by git).

import { chromium } from 'playwright-core'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const URL = process.env.P26_URL ?? 'http://localhost:5198/parva-26'
// P26_SUBTITLES=off checks the page with the subtitles switch off.
const SUBTITLES_OFF = process.env.P26_SUBTITLES === 'off'
const OUT = SUBTITLES_OFF ? '.parva26-check/subtitles-off' : '.parva26-check'
const mode = process.argv[2] === 'baseline' ? 'baseline' : 'current'
// Share of pixels allowed to differ before a shot is reported (clocks and
// countdowns tick between runs).
const TOLERANCE = 0.004

const SCENES = ['title', 'certificate', 'gandhada-gudi', 'fan-pass', 'now-showing', 'guests', 'interval', 'angadi', 'release-day', 'timeline', 'emoji-game', 'credits']
const VIEWPORTS = {
  laptop: { viewport: { width: 1366, height: 860 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true },
}

function chromePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM
  const cache = join(homedir(), '.cache', 'ms-playwright')
  const shell = readdirSync(cache).find((d) => d.startsWith('chromium_headless_shell'))
  return join(cache, shell, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
}

// Make every run draw the same picture: the same random numbers (the
// painted forest, petals), the same moment in time (clocks, countdowns,
// the day's puzzles), and no passing subtitle lines.
async function steady(page) {
  await page.clock.setFixedTime(new Date('2026-09-25T10:00:00+05:30'))
  await page.addInitScript((off) => {
    if (off) localStorage.setItem('parva26:subtitles', 'false')
    let seed = 20260925
    Math.random = () => {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style')
      style.textContent = 'p[aria-hidden].fixed { visibility: hidden !important }'
      document.head.append(style)
    })
  }, SUBTITLES_OFF)
}

async function shoot(browser, dir) {
  const errors = []
  for (const [name, options] of Object.entries(VIEWPORTS)) {
    const page = await browser.newPage({ ...options, reducedMotion: 'reduce' })
    await steady(page)
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`))
    await page.goto(URL, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(800)
    for (const id of SCENES) {
      await page.evaluate((id) => {
        const el = document.getElementById(id)
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY)
      }, id)
      await page.waitForTimeout(700)
      await page.screenshot({ path: join(dir, `${name}-${id}.png`) })
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(700)
    await page.screenshot({ path: join(dir, `${name}-end.png`) })
    await page.close()
  }

  // With motion on: scroll the whole page and watch for errors.
  const page = await browser.newPage(VIEWPORTS.laptop)
  page.on('pageerror', (e) => errors.push(`motion: ${e.message}`))
  await page.goto(URL, { waitUntil: 'networkidle' })
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(120)
  }
  await page.close()
  return errors
}

function compare(base, current) {
  const changed = []
  for (const file of readdirSync(current)) {
    const a = join(base, file)
    if (!existsSync(a)) {
      changed.push(`${file}: no baseline`)
      continue
    }
    // compare prints the count of differing pixels on stderr, and exits 1
    // when there are any
    const { stderr } = spawnSync('magick', ['compare', '-metric', 'AE', '-fuzz', '6%', a, join(current, file), 'null:'])
    const pixels = parseFloat(String(stderr).trim().split(/\s/)[0])
    const size = execFileSync('magick', ['identify', '-format', '%w %h', a]).toString().split(' ').map(Number)
    const share = pixels / (size[0] * size[1])
    if (!(share <= TOLERANCE)) changed.push(`${file}: ${(share * 100).toFixed(2)}% of pixels differ`)
  }
  return changed
}

const dir = join(OUT, mode)
rmSync(dir, { recursive: true, force: true })
mkdirSync(dir, { recursive: true })
const browser = await chromium.launch({ executablePath: chromePath() })
const errors = await shoot(browser, dir)
await browser.close()

console.log(errors.length ? `Page errors:\n  ${errors.join('\n  ')}` : 'No page errors.')
if (mode === 'baseline') {
  console.log(`Baseline saved to ${dir}.`)
} else {
  const changed = compare(join(OUT, 'baseline'), dir)
  console.log(changed.length ? `Changed shots:\n  ${changed.join('\n  ')}` : 'All shots match the baseline.')
  process.exitCode = errors.length || changed.length ? 1 : 0
}
