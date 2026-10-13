// Interaction check for the Parva 2026 page (/rcb): plays the main flows
// with motion on (unveiling a guest, the Book link into the interval's
// market, throwing flowers to 10,000, the rewind bench, a round of the
// emoji game, the credits' drift) and reports PASS or FAIL for each. The
// market game itself has its own check: scripts/market-flows.mjs.
//
//   node scripts/parva26-flows.mjs
//
// Serve a production build first (see scripts/parva26-check.mjs).

import { chromium } from 'playwright-core'
import { readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
const cache = join(homedir(), '.cache', 'ms-playwright')
const browser = await chromium.launch({ executablePath: join(cache, readdirSync(cache).find((d) => d.startsWith('chromium_headless_shell')), 'chrome-headless-shell-linux64', 'chrome-headless-shell') })
const URL = process.env.P26_URL ?? 'http://localhost:5198/rcb'
const results = []
const ok = (name, pass, detail = '') => results.push(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` (${detail})` : ''}`)
const errors = []
const open = async (q = '', opts = {}) => {
  const page = await browser.newPage({ viewport: { width: 1366, height: 860 }, ...opts })
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL + q, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(600)
  return page
}
const scrollTo = (page, sel, offset = 0) => page.evaluate(([sel, offset]) => { const el = document.querySelector(sel); const sp = el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el; window.scrollTo(0, sp.getBoundingClientRect().top + scrollY + offset) }, [sel, offset])

// Guests: an unveiling plays once and is remembered; the card opens
let page = await open('?unveil')
await scrollTo(page, '#guests')
await page.waitForTimeout(3500)
ok('unveil remembered', (await page.evaluate(() => localStorage.getItem('parva26:unveiled'))) === '["g1"]')
await page.click('[data-guest="g1"] button')
await page.waitForTimeout(500)
ok('guest info card', await page.isVisible('[data-guest="g1"] a[href="/events"]'))
await page.close()

// Interval: the Book link skips the doors and lands on the market's game
page = await open()
await page.click('a[aria-label="Book merch"]')
await page.waitForTimeout(1500)
ok('Book lands on the market', await page.evaluate(() => { const r = document.getElementById('parva-sante').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }))
ok('the stalls are buttons too', await page.isVisible('#interval a[href="/parva-26/merch"]'))
await page.close()

// Release day: holding the basket throws a stream; 10,000 brings the banner
page = await open('?hoomale=9996')
await scrollTo(page, '#release-day')
await page.waitForTimeout(1500)
const basket = await page.$('#release-day button[data-en^="Throw"]')
const bb = await basket.boundingBox()
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2)
await page.mouse.down()
await page.waitForTimeout(1200)
await page.mouse.up()
await page.waitForTimeout(800)
ok('flowers counted past 10,000', await page.evaluate(() => /10,0\d\d/.test(document.getElementById('release-day').textContent)))
ok('thank-you banner', await page.evaluate(() => document.getElementById('release-day').textContent.includes('Thank you, fans')))
await page.close()

// Timeline: the step button moves the film
page = await open()
await scrollTo(page, '#timeline')
await page.waitForTimeout(1200)
await page.click('button[aria-label="Next film"]')
await page.waitForTimeout(1400)
ok('timeline steps', (await page.textContent('#timeline p[aria-live]')).includes('2 / 13'))
await page.close()

// Emoji game: a right answer moves on to the next reel
page = await open()
await scrollTo(page, '#emoji-game')
await page.waitForTimeout(1200)
const answers = { 'rain cloud': 'mungaru male', pick: 'KGF', boar: 'kantara', pill: 'Lucia', snake: 'nagarahavu', temple: 'Gandhada gudi', 'gold medal': 'Bangarada manushya', school: 'kirik party', rainbow: 'rangitaranga', 'number one': 'ondu motteya kathe' }
const clue = (await page.getAttribute('#emoji-game [role="img"][aria-label^="Clue"]', 'aria-label')).replace('Clue: ', '').split(',')[0]
await page.fill('#p26-reel-answer', answers[clue])
await page.press('#p26-reel-answer', 'Enter')
await page.waitForTimeout(2800)
ok('emoji game advances', await page.evaluate(() => [...document.querySelectorAll('#emoji-game p')].some((p) => /ರೀಲ್ 2 \/ 5/.test(p.textContent))))
await page.close()

// Credits: the roll drifts on its own after 3 s
page = await open()
await scrollTo(page, '#credits dl', -200)
const before = await page.evaluate(() => scrollY)
await page.waitForTimeout(5500)
ok('credits drift', (await page.evaluate(() => scrollY)) - before > 50)
await page.close()

await browser.close()
console.log(results.join('\n'))
console.log(errors.length ? `Page errors:\n${errors.join('\n')}` : 'No page errors.')
process.exitCode = results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0
