// Plays the Parva Market game in the landing page's interval (/rcb), in a
// real browser, on a laptop and a phone viewport: the box's size, the start
// screen, scrolling the page past the game (wheel, keys, swipe), walking by
// keys and by tapping, the controls legend and "Click to play", the guides
// (arrow, footprints, tap ring), the stalls' prompts, going into the merch
// stall and back, and the theatre door.
//
//   node scripts/market-flows.mjs          laptop
//   node scripts/market-flows.mjs phone    phone
//
// Serve a production build first: `npx vite build && npx vite preview --port 5198`
// (or set P26_BASE). PLAYWRIGHT_CHROMIUM picks the browser. The page's
// `?debug` switch hands the running scene to `window.__p26Market`, which is
// how this reads where the walker is.

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
const phone = mode === 'phone'
const VIEW = {
  laptop: { viewport: { width: 1366, height: 860 } },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true },
}[mode]

// Software WebGL for the headless shell; a browser of your own (Chrome or
// Edge, by PLAYWRIGHT_CHROMIUM) uses its GPU, and hangs on these flags.
const GL = process.env.PLAYWRIGHT_CHROMIUM ? [] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
const browser = await chromium.launch({ executablePath: chromePath(), args: GL })
const ctx = await browser.newContext(VIEW)
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + (e.stack ?? e.message).split(String.fromCharCode(10)).slice(0, 4).join(' ')))
page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_CONNECTION|api\//i.test(m.text())) errors.push(m.text()) })
let fails = 0
const check = (name, ok, extra = '') => { console.log(ok ? 'PASS' : 'FAIL', name, extra); if (!ok) fails++ }
const box = () => page.locator('#parva-sante')
const pos = () => page.evaluate(() => ({ x: Math.round(window.__p26Market.walker.x), y: Math.round(window.__p26Market.walker.y), near: window.__p26Market.nearId }))
const world = () => page.evaluate(() => { const L = window.__p26Market.opts.layout; return { W: L.width, H: L.height, door: L.door, shops: L.shops, spawn: L.spawn, wallY: L.wallY } })
const put = (x, y) => page.evaluate(([x, y]) => { const s = window.__p26Market; s.path = []; s.pending = null; s.walker.x = x; s.walker.y = y }, [x, y])
const scrollY = () => page.evaluate(() => Math.round(window.scrollY))
// world -> page coordinates, through the canvas box (FIT scaling)
const toPage = (wx, wy) => page.evaluate(([wx, wy]) => {
  const r = document.querySelector('#parva-sante canvas').getBoundingClientRect(); const L = window.__p26Market.opts.layout
  return { x: r.left + (wx / L.width) * r.width, y: r.top + (wy / L.height) * r.height }
}, [wx, wy])
const centreBox = () => page.evaluate(() => { const b = document.getElementById('parva-sante'); window.scrollBy(0, b.getBoundingClientRect().top - (innerHeight - b.offsetHeight) / 2) })
const tap = async ({ x, y }) => (phone ? page.touchscreen.tap(x, y) : page.mouse.click(x, y))
const cdp = await ctx.newCDPSession(page)
// A finger dragged up the screen from (x, y): the page should scroll
const swipe = (x, y, dy) => cdp.send('Input.synthesizeScrollGesture', { x: Math.round(x), y: Math.round(y), yDistance: -dy, gestureSourceType: 'touch', speed: 1200 })

// 1. Arriving at the market's address lands on the game box, mid-screen
await page.goto(`${BASE}/rcb?debug#parva-sante`)
await page.evaluate(() => localStorage.clear())
await page.reload()
await page.waitForFunction(() => { const b = document.getElementById('parva-sante')?.getBoundingClientRect(); return b && b.top > 0 && b.bottom < innerHeight }, null, { polling: 200, timeout: 20000 })
  .then(() => check('#parva-sante lands on the game box', true), () => check('#parva-sante lands on the game box', false))
const r = await box().boundingBox()
const vh = VIEW.viewport.height
check('the box is never the whole screen', r.height <= vh * 0.72 && r.height < vh - 150, `${Math.round(r.height)} of ${vh}`)
check(phone ? 'phone box is 3:4' : 'laptop box is 16:9', Math.abs(r.width / r.height - (phone ? 0.75 : 16 / 9)) < 0.03, (r.width / r.height).toFixed(3))
check('the page shows above and below it', r.y > 40 && r.y + r.height < vh - 40, `top ${Math.round(r.y)}, bottom ${Math.round(r.y + r.height)}`)
check('the stalls are buttons too', await page.getByRole('link', { name: /Merch/ }).first().isVisible())

// 2. The start screen is inside the box; no game before a role
check('start screen asks who walks', await box().getByText('Pick who walks').isVisible())
check('no game before choosing', (await page.locator('#parva-sante canvas').count()) === 0)
await box().getByRole('button', { name: /ಹುಡುಗಿ|Girl/ }).click()
await page.waitForFunction(() => window.__p26Market?.walker, null, { polling: 200, timeout: 30000 })
check('role remembered', (await page.evaluate(() => localStorage.getItem('parva26:market:character'))) === '"girl"')
const W = await world()
check(phone ? 'phone forecourt is 3:4' : 'laptop forecourt is 16:9', phone ? W.W === 1080 && W.H === 1440 : W.W === 1920 && W.H === 1080)
check('only the food and merch stalls', W.shops.map((s) => s.id).join() === 'food,merch')
await page.waitForTimeout(1500)
check('an arrow over the merch stall', await page.evaluate(() => window.__p26Market.arrows.has('merch') && !window.__p26Market.arrows.has('food')))
check('footprints lead to it', await page.evaluate(() => window.__p26Market.trail.length >= 3))

// 3. The legend says how to play
if (phone) check('legend: tap to walk', await box().getByText('Tap to walk').isVisible())
else {
  check('legend: walk keys', await box().getByText('Walk', { exact: true }).isVisible())
  check('legend: E to enter', await box().getByText('Enter', { exact: true }).isVisible())
}

if (!phone) {
  // 4. Picking a role gives the game the keyboard
  check('playing after the pick', await box().getByText('Playing · Esc to leave').isVisible())
  const y0 = await scrollY()
  const p0 = await pos()
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(700); await page.keyboard.up('ArrowRight')
  const p1 = await pos()
  check('arrow key walks', p1.x > p0.x + 100, `${p0.x} -> ${p1.x}`)
  check('...and the page stays put', (await scrollY()) === y0)
  check('footprints go once you walk', await page.evaluate(() => window.__p26Market.trail.length === 0))
  await page.keyboard.down('w'); await page.waitForTimeout(500); await page.keyboard.up('w')
  check('W walks up', (await pos()).y < p1.y - 30)

  // 5. Escape gives the keys back: arrows scroll the page, the game asks to be clicked
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  check('Click to play after Escape', await box().getByText('Click to play').isVisible())
  const p2 = await pos()
  const y1 = await scrollY()
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(400)
  check('arrows scroll the page when not playing', (await scrollY()) > y1, `${y1} -> ${await scrollY()}`)
  check('...and the walker stays', (await pos()).x === p2.x && (await pos()).y === p2.y)
  check('asks to click the game first', await box().getByText('Click the game first').isVisible())

  // 6. The wheel over the game scrolls the page
  await centreBox()
  const rb = await box().boundingBox()
  const y2 = await scrollY()
  await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2)
  await page.mouse.wheel(0, 300)
  await page.waitForTimeout(400)
  check('wheel over the game scrolls the page', (await scrollY()) > y2, `${y2} -> ${await scrollY()}`)
  await centreBox()

  // 7. A click plays again (and doesn't send the walker)
  const rb2 = await box().boundingBox()
  await page.mouse.click(rb2.x + rb2.width * 0.3, rb2.y + rb2.height * 0.8)
  await page.waitForTimeout(300)
  check('a click on the game plays', await box().getByText('Playing · Esc to leave').isVisible())
  check('...without walking', !(await page.evaluate(() => window.__p26Market.path.length)))
  // Clicking elsewhere on the page gives the keys back, and doesn't walk
  const p6 = await pos()
  await page.locator('#interval-title').click()
  await page.waitForTimeout(200)
  check('clicking outside stops playing', await box().getByText('Click to play').isVisible())
  await page.waitForTimeout(400)
  check('...and does not walk', JSON.stringify(await pos()) === JSON.stringify(p6))
  await box().getByRole('button', { name: /Click to play/ }).click()
} else {
  // 4. A swipe that starts on the game scrolls the page and doesn't walk
  await centreBox()
  const rb = await box().boundingBox()
  const p0 = await pos()
  const y0 = await scrollY()
  await swipe(rb.x + rb.width / 2, rb.y + rb.height * 0.7, 300)
  await page.waitForTimeout(800)
  // (a synthetic swipe scrolls less than a finger, so any scroll will do)
  check('a swipe on the game scrolls the page', (await scrollY()) > y0, `${y0} -> ${await scrollY()}`)
  const p1 = await pos()
  check('...and the walker stays', p1.x === p0.x && p1.y === p0.y && !(await page.evaluate(() => window.__p26Market.path.length)), JSON.stringify(p1))
  await centreBox()
}

// 8. A tap or click on the ground walks there and marks the spot
await put(W.spawn.x, W.spawn.y)
await page.waitForTimeout(500) // the last place's prompt slides away
const target = { x: W.spawn.x - 160, y: W.spawn.y + 80 }
await tap(await toPage(target.x, target.y))
await page.waitForTimeout(150)
check('a ring marks the spot', await page.evaluate(() => window.__p26Market.ring.visible))
await page.waitForTimeout(1600)
const p5 = await pos()
check('tap walks to the spot', Math.abs(p5.x - target.x) < 25 && Math.abs(p5.y - target.y) < 25, JSON.stringify(p5))
check('the ring goes on arrival', await page.evaluate(() => !window.__p26Market.ring.visible))

// 9. Solid stalls; the shut food stall says coming soon
const food = W.shops.find((s) => s.id === 'food')
await put(food.x, food.base + 20)
if (!phone) { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp') }
await page.waitForTimeout(400)
const p3 = await pos()
check('the food stall blocks the way', p3.y >= food.base - 2, `y=${p3.y}`)
check('near the food stall: coming soon', p3.near === 'food' && (await box().getByText(/Coming soon/).first().isVisible()))

// 10. The door goes on with the show
await put(W.door.x, W.door.y + 20)
await page.waitForTimeout(400)
check('near the door: back to the show', await box().getByRole('button', { name: /Back to the show/ }).isVisible())
await box().getByRole('button', { name: /Back to the show/ }).click()
await page.waitForFunction(() => { const r = document.getElementById('release-day')?.getBoundingClientRect(); return r && Math.abs(r.top) < innerHeight * 0.6 }, null, { polling: 200, timeout: 8000 })
  .then(() => check('the door scrolls on to the next scene', true), () => check('the door scrolls on to the next scene', false))

// 11. Tapping the merch stall walks there and goes in; back returns to the market
await page.goto('about:blank')
await page.goto(`${BASE}/rcb?debug#parva-sante`)
await page.waitForFunction(() => window.__p26Market?.walker, null, { polling: 200, timeout: 30000 })
check('role skips the start screen next visit', (await box().getByText('Pick who walks').count()) === 0)
await centreBox()
if (!phone) await box().getByRole('button', { name: /Click to play/ }).click()
const merch = (await world()).shops.find((s) => s.id === 'merch')
await tap(await toPage(merch.x, merch.base - merch.h / 2))
await page.waitForURL('**/parva-26/merch', { timeout: 15000 }).then(() => check('tapping the merch stall goes into the shop', true), async () => check('tapping the merch stall goes into the shop', false, page.url() + ' ' + JSON.stringify(await pos())))
await page.waitForFunction(() => document.title.includes('Parva Angadi'), null, { polling: 200, timeout: 15000 })
check('the shop opens at its top', (await scrollY()) === 0, String(await scrollY()))
check('merch counted as visited', (await page.evaluate(() => localStorage.getItem('parva26:market:visited'))) === '["merch"]')
await page.goBack()
await page.waitForFunction(() => { const b = document.getElementById('parva-sante')?.getBoundingClientRect(); return b && b.top > 0 && b.bottom < innerHeight }, null, { polling: 200, timeout: 20000 })
  .then(() => check('back returns to the market', true), async () => check('back returns to the market', false, page.url() + ' ' + JSON.stringify(await page.evaluate(() => ({ y: scrollY, top: document.getElementById('parva-sante')?.getBoundingClientRect().top })))))
await page.waitForFunction(() => window.__p26Market?.arrows, null, { polling: 200, timeout: 30000 })
check('no arrow over a visited stall', await page.evaluate(() => !window.__p26Market.arrows.has('merch')))
check('legend folds into ?', await box().getByRole('button', { name: 'How to play' }).isVisible())

// 12. Change role, in the box
await box().getByRole('button', { name: /Change role/ }).click()
check('change role opens the start screen', await box().getByText('Pick who walks').isVisible())
await page.keyboard.press('Escape')
check('Escape closes it', (await box().getByText('Pick who walks').count()) === 0)
await box().getByRole('button', { name: /Change role/ }).click()
await box().getByRole('button', { name: /ಹುಡುಗ(?!ಿ)|Boy/ }).click()
await page.waitForFunction(() => window.__p26Market?.opts.character.id === 'boy', null, { polling: 200, timeout: 30000 })
  .then(() => check('picking the other role switches walker', true), () => check('picking the other role switches walker', false))

// 13. The old address leads here
await page.goto(`${BASE}/parva-26/market`)
await page.waitForURL('**/rcb#parva-sante', { timeout: 8000 }).then(() => check('/parva-26/market redirects to the market', true), () => check('/parva-26/market redirects to the market', false, page.url()))

check('no page errors', errors.length === 0, errors.join(' | '))
console.log(fails ? `${fails} FAILED` : 'ALL PASSED')
await browser.close()
process.exit(fails ? 1 : 0)
