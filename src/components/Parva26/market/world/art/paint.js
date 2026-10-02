// Helpers for painting the forecourt into canvases. Everything is drawn once
// and handed to Phaser as a texture, so nothing here runs while you walk.

export const INK = '#3a2214'

// The page's fonts, as the canvas needs to name them.
export const FONT = {
  card: '"Akaya Kanadaka", "Baloo Tamma 2 Variable", serif',
  display: '"Baloo Tamma 2 Variable", "Anek Kannada Variable", sans-serif',
  poster: '"Bebas Neue", "Anek Kannada Variable", Impact, sans-serif',
}

// A canvas can only draw a font that has loaded, and these load by script
// subset, so ask for the Kannada glyphs explicitly.
export function loadFonts() {
  const kn = 'ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ ಭೂರಿ ಭೋಜನ ಪರ್ವ ಅಂಗಡಿ ಫೋಟೋ ಸ್ಟುಡಿಯೋ'
  return Promise.all([
    document.fonts.load('40px "Akaya Kanadaka"', kn),
    document.fonts.load('700 40px "Baloo Tamma 2 Variable"', kn),
    document.fonts.load('40px "Bebas Neue"', 'ABC'),
  ])
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.ceil(w)
  c.height = Math.ceil(h)
  return c
}

// Seeded random numbers, so the forecourt is painted the same way every time.
export function rng(seed) {
  let a = seed | 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function rrect(g, x, y, w, h, r) {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
}

// A soft vertical gradient between two colours (or more).
export function vgrad(g, y0, y1, ...stops) {
  const grad = g.createLinearGradient(0, y0, 0, y1)
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c))
  return grad
}

export function hgrad(g, x0, x1, ...stops) {
  const grad = g.createLinearGradient(x0, 0, x1, 0)
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c))
  return grad
}

// Fine brown specks over a finished picture: the paper grain of the painted
// look. Only where the canvas already has paint (it is drawn "source-atop").
export function grain(g, w, h, seed = 3, count = 14000, alpha = 0.09) {
  const rnd = rng(seed)
  g.save()
  g.globalCompositeOperation = 'source-atop'
  for (let i = 0; i < count; i++) {
    g.fillStyle = rnd() < 0.5 ? `rgba(40,22,10,${alpha})` : `rgba(255,236,200,${alpha * 0.7})`
    g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 1.6, 1 + rnd() * 1.6)
  }
  g.restore()
}

// Text that shrinks until it fits.
export function fitText(g, text, family, maxWidth, size, weight = '') {
  let s = size
  do {
    g.font = `${weight} ${s}px ${family}`
    s -= 2
  } while (g.measureText(text).width > maxWidth && s > 12)
  return s + 2
}

// A string of round bulbs along a line.
export function bulbs(g, x0, y0, x1, y1, every, r = 4.5, seed = 1) {
  const rnd = rng(seed)
  const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / every))
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    const y = y0 + ((y1 - y0) * i) / n
    const lit = rnd() > 0.08
    const glow = g.createRadialGradient(x, y, 0, x, y, r * 3.2)
    glow.addColorStop(0, lit ? 'rgba(255,214,120,.55)' : 'rgba(255,214,120,0)')
    glow.addColorStop(1, 'rgba(255,214,120,0)')
    g.fillStyle = glow
    g.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4)
    g.fillStyle = lit ? '#ffe9a8' : '#6a5a3a'
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = INK
    g.lineWidth = 1
    g.stroke()
  }
}
