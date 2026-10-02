// Plays the Parva Market page (/parva-26/market) in a real browser, on a laptop
// and a phone viewport: the role picker, walking by keys and by tapping,
// solid shops and walls, the places' prompts, and the theatre door back to the
// landing page.
//
//   node scripts/market-flows.mjs          laptop
//   node scripts/market-flows.mjs phone    phone
//
// Serve a production build first: `npx vite build && npx vite preview --port 5198`
// (or set P26_BASE). The page's `?debug` switch hands the running scene to
// `window.__p26Market`, which is how this reads where the walker is.

import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

function chromePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM) return process.env.PLAYWRIGHT_CHROMIUM
  const cache = join(homedir(), '.cache', 'ms-playwright')
  const shell = readdirSync(cache).find((d) => d.startsWith('chromium_headless_shell'))
  return join(cache, shell, 'chrome-headless-shell-linux64', 'chrome-headless-shell')
}

const BASE = process.env.P26_BASE ?? 'http://localhost:5198'
const mode = process.argv[2] === 'phone' ? 'phone' : 'laptop'
const VIEW = {
  laptop: { viewport: { width: 1366, height: 860 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
}[mode]

const browser = await chromium.launch({ executablePath: chromePath(), args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const ctx = await browser.newContext(VIEW)
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
let fails = 0
const check = (name, ok, extra = '') => { console.log(ok ? 'PASS' : 'FAIL', name, extra); if (!ok) fails++ }
const pos = () => page.evaluate(() => ({ x: Math.round(window.__p26Market.walker.x), y: Math.round(window.__p26Market.walker.y), near: window.__p26Market.nearId }))
const world = () => page.evaluate(() => { const L = window.__p26Market.opts.layout; return { W: L.width, H: L.height, door: L.door, shops: L.shops, spawn: L.spawn, wallY: L.wallY } })
// world -> page coordinates, through the canvas box (FIT scaling)
const toPage = async (wx, wy) => page.evaluate(([wx, wy]) => {
  const r = document.querySelector('main canvas').getBoundingClientRect(); const L = window.__p26Market.opts.layout
  return { x: r.left + (wx / L.width) * r.width, y: r.top + (wy / L.height) * r.height }
}, [wx, wy])

await page.goto(`${BASE}/parva-26/market?debug`)
await page.evaluate(() => localStorage.clear())
await page.reload()
// 1. the picker blocks the world until a role is chosen
await page.getByRole('dialog').waitFor({ timeout: 15000 })
check('picker shown first', await page.getByRole('dialog').isVisible())
check('no game before choosing', (await page.locator('main canvas').count()) === 0)
await page.getByRole('button', { name: /ಹುಡುಗಿ|Girl/ }).first().click()
await page.waitForFunction(() => window.__p26Market?.walker, null, { timeout: 30000 })
check('role remembered', (await page.evaluate(() => localStorage.getItem('parva26:market:character'))) === '"girl"')
const W = await world()
await page.waitForTimeout(500)
const p0 = await pos()
check('spawns at the spawn point', p0.x === W.spawn.x && p0.y === W.spawn.y, JSON.stringify(p0))

// 2. keyboard walking
await page.keyboard.down('ArrowRight'); await page.waitForTimeout(700); await page.keyboard.up('ArrowRight')
const p1 = await pos()
check('walks right with the arrow key', p1.x > p0.x + 100, `${p0.x} -> ${p1.x}`)
check('faces right', await page.evaluate(() => window.__p26Market.facing) === 'right')
await page.keyboard.down('w'); await page.waitForTimeout(900); await page.keyboard.up('w')
const p2 = await pos()
check('walks up with W', p2.y < p1.y - 40, `${p1.y} -> ${p2.y}`)

// 3. solid things stop you: walk the walker into the food shop's footprint
const food = W.shops.find((s) => s.id === 'food')
await page.evaluate(([x, y]) => { const s = window.__p26Market; s.path = []; s.pending = null; s.walker.x = x; s.walker.y = y }, [food.x, food.base + 20])
await page.keyboard.down('ArrowUp'); await page.waitForTimeout(900); await page.keyboard.up('ArrowUp')
const p3 = await pos()
check('the food shop blocks the way', p3.y >= food.base - 2, `stopped at y=${p3.y}, shop base=${food.base}`)
check('near the food shop shows its prompt', p3.near === 'food', String(p3.near))
await page.waitForTimeout(500)
check('prompt says opening soon', (await page.getByText(/Opening soon/).first().isVisible()))
// walls at the edge
await page.evaluate(([x, y]) => { const s = window.__p26Market; s.path = []; s.pending = null; s.walker.x = x; s.walker.y = y }, [W.spawn.x, W.wallY + 40])
await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp')
const p4 = await pos()
check('the wall stops you', p4.y >= W.wallY + 9, `y=${p4.y}`)

// 4. tap to walk on open ground
await page.evaluate(([x, y]) => { const s = window.__p26Market; s.path = []; s.pending = null; s.walker.x = x; s.walker.y = y }, [W.spawn.x, W.spawn.y])
const tap = await toPage(W.spawn.x - 100, W.spawn.y + 200)
await page.mouse.click(tap.x, tap.y)
await page.waitForTimeout(1400)
const p5 = await pos()
check('tap walks to the spot', Math.abs(p5.x - (W.spawn.x - 100)) < 20 && Math.abs(p5.y - (W.spawn.y + 200)) < 20, JSON.stringify(p5))

// 5. E at the door goes back to the theatre
await page.evaluate(([x, y]) => { const s = window.__p26Market; s.path = []; s.pending = null; s.walker.x = x; s.walker.y = y }, [W.door.x, W.door.y + 20])
await page.waitForTimeout(400)
check('near the door shows "back to the theatre"', await page.getByRole('button', { name: /Back to the theatre/ }).isVisible())
await page.keyboard.press('e')
await page.waitForURL('**/parva-26', { timeout: 8000 }).then(() => check('E at the door returns to the landing page', true), () => check('E at the door returns to the landing page', false, page.url()))

// 6. tapping the door from far away walks there and goes back
await page.goto(`${BASE}/parva-26/market?debug`)
await page.waitForFunction(() => window.__p26Market?.walker, null, { timeout: 30000 })
check('role skips the picker next visit', (await page.getByRole('dialog').count()) === 0)
const tapDoor = await toPage(W.door.x, W.wallY - 90)
await page.mouse.click(tapDoor.x, tapDoor.y)
await page.waitForURL('**/parva-26', { timeout: 15000 }).then(() => check('tapping the door walks there and goes back', true), async () => check('tapping the door walks there and goes back', false, page.url() + ' ' + JSON.stringify(await pos())))

// 7. change role
await page.goto(`${BASE}/parva-26/market?debug`)
await page.waitForFunction(() => window.__p26Market?.walker, null, { timeout: 30000 })
await page.getByRole('button', { name: /Change role/ }).click()
check('change role opens the picker', await page.getByRole('dialog').isVisible())
await page.keyboard.press('Escape')
check('Escape closes it', (await page.getByRole('dialog').count()) === 0)
await page.getByRole('button', { name: /Change role/ }).click()
await page.getByRole('button', { name: /ಹುಡುಗ(?!ಿ)|Boy/ }).first().click()
await page.waitForFunction(() => window.__p26Market?.walker && window.__p26Market.opts.character.id === 'boy', null, { timeout: 30000 })
check('picking the other role switches walker', true)
// logo goes back to the theatre
await page.getByRole('link', { name: /back to the theatre/i }).first().click()
await page.waitForURL('**/parva-26', { timeout: 8000 }).then(() => check('top-bar logo goes back to the theatre', true), () => check('top-bar logo goes back to the theatre', false, page.url()))
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No page errors.')
console.log(fails ? `${fails} FAILED` : 'ALL PASSED')
await browser.close()
process.exitCode = fails ? 1 : 0
