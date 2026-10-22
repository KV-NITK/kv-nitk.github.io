// Renders every poster variant to ../<look>-<lang>.png at 2160x3840.
// Run from anywhere: CHROME=/path/to/chrome node parva-posters/source/render.mjs
import { chromium } from '../../node_modules/playwright-core/index.mjs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const browser = await chromium.launch({ executablePath: process.env.CHROME })
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 })

for (const look of ['simple', 'full', 'reveal']) {
  for (const lang of ['en', 'kn']) {
    await page.goto(`file://${path.join(dir, 'poster.html')}?look=${look}&lang=${lang}`)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(300)
    const out = path.join(dir, '..', `${look}-${lang === 'en' ? 'english' : 'kannada'}.png`)
    await page.screenshot({ path: out })
    console.log(out)
  }
}
await browser.close()
