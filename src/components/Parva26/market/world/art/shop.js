import { INK, FONT, makeCanvas, rrect, vgrad, hgrad, fitText, bulbs, rng, grain } from './paint'

// Stand-in stalls for the forecourt, painted once, against the back wall
// (awning, counter, goods). Each stands on its bottom edge. A stall with
// nowhere to go yet (no `go`) has a plank across it: coming soon.
// TODO(art): replace with the final stall art.
export function drawShop(place, w, h) {
  const c = makeCanvas(w, h)
  const g = c.getContext('2d')
  g.strokeStyle = INK
  g.lineWidth = 3
  g.lineJoin = 'round'
  g.lineCap = 'round'
  stall(g, place, w, h)
  if (!place.go) soonPlank(g, w, h)
  grain(g, w, h, 40 + place.id.length, 4000, 0.08)
  return c
}

// The stall's name on a hanging board, Kannada big and English under it,
// both big enough to read on a phone, where the forecourt is drawn at about
// a third of its size.
function signBoard(g, place, x, y, w, h, rim, ink) {
  rrect(g, x - 5, y - 5, w + 10, h + 10, 12)
  g.fillStyle = rim
  g.fill()
  g.stroke()
  rrect(g, x, y, w, h, 8)
  g.fillStyle = vgrad(g, y, y + h, '#2a0a10', '#18060a')
  g.fill()
  g.textAlign = 'center'
  const sign = place.sign ?? { kn: place.kn, en: place.en.split(' · ')[0] }
  const kn = fitText(g, sign.kn, FONT.card, w - 30, Math.min(42, h * 0.5))
  g.font = `${kn}px ${FONT.card}`
  g.fillStyle = ink
  g.fillText(sign.kn, x + w / 2, y + h * 0.5)
  g.font = `${fitText(g, sign.en.toUpperCase(), FONT.poster, w - 30, 30)}px ${FONT.poster}`
  g.fillStyle = '#f7ecd0'
  g.fillText(sign.en.toUpperCase(), x + w / 2, y + h - 9)
}

// A rough plank nailed across the front: the stall is shut for now.
function soonPlank(g, w, h) {
  const counterTop = h - 100
  // The stall behind it is dark
  g.fillStyle = 'rgba(12,6,4,.45)'
  g.fillRect(14, 124, w - 28, counterTop - 124)
  g.save()
  g.translate(w / 2, counterTop - 48)
  g.rotate(-0.08)
  const pw = w * 0.84
  rrect(g, -pw / 2, -32, pw, 64, 6)
  g.fillStyle = hgrad(g, -pw / 2, pw / 2, '#c49a66', '#a87c4c', '#c49a66')
  g.fill()
  g.stroke()
  for (const nx of [-pw / 2 + 16, pw / 2 - 16]) {
    g.fillStyle = '#3a3532'
    g.beginPath()
    g.arc(nx, 0, 4, 0, Math.PI * 2)
    g.fill()
  }
  g.textAlign = 'center'
  g.fillStyle = '#3d2410'
  g.font = `700 ${fitText(g, 'ಶೀಘ್ರದಲ್ಲೇ', FONT.display, pw - 60, 30, 700)}px ${FONT.display}`
  g.fillText('ಶೀಘ್ರದಲ್ಲೇ', 0, 4)
  g.font = `22px ${FONT.poster}`
  g.fillText('COMING SOON', 0, 26)
  g.restore()
}

function scallopedAwning(g, x, y, w, drop, a, b, stripe = 42) {
  const n = Math.ceil(w / stripe)
  for (let i = 0; i < n; i++) {
    const x0 = x + i * stripe
    const sw = Math.min(stripe, x + w - x0)
    g.fillStyle = i % 2 ? b : a
    g.beginPath()
    g.moveTo(x0, y)
    g.lineTo(x0 + sw, y)
    g.lineTo(x0 + sw, y + drop)
    g.arc(x0 + sw / 2, y + drop, sw / 2, 0, Math.PI)
    g.closePath()
    g.fill()
    g.stroke()
  }
  g.fillStyle = vgrad(g, y, y + drop, 'rgba(255,255,255,.18)', 'rgba(0,0,0,.18)')
  g.fillRect(x, y, w, drop)
}

function stall(g, place, w, h) {
  const food = place.kind === 'food'
  const [awnA, awnB] = food ? ['#c8102e', '#f1dfc0'] : ['#f2c12e', '#7e1424']
  const counterTop = h - 100

  // Interior, seen under the awning
  g.fillStyle = vgrad(g, 120, counterTop, '#3a2418', '#1e120c')
  g.fillRect(14, 120, w - 28, counterTop - 120)
  // Shelf with brass pots (food) or folded goods (merch)
  g.fillStyle = '#6b3f22'
  g.fillRect(14, 184, w - 28, 9)
  g.strokeRect(14, 184, w - 28, 9)
  const rnd = rng(food ? 3 : 4)
  for (let x = 40; x < w - 40; x += 46) {
    if (food) {
      g.fillStyle = vgrad(g, 150, 184, '#e8c274', '#9a6a20')
      g.beginPath()
      g.ellipse(x, 168, 18, 16, 0, 0, Math.PI * 2)
      g.fill()
      g.stroke()
    } else {
      g.fillStyle = ['#1f1b18', '#ead6b0', '#8e0b20'][(rnd() * 3) | 0]
      g.fillRect(x - 16, 164, 32, 20)
      g.strokeRect(x - 16, 164, 32, 20)
    }
  }

  // Posts
  g.fillStyle = hgrad(g, 0, 18, '#8a5a30', '#5a3620')
  g.fillRect(6, 58, 16, h - 58)
  g.strokeRect(6, 58, 16, h - 58)
  g.fillRect(w - 22, 58, 16, h - 58)
  g.strokeRect(w - 22, 58, 16, h - 58)

  // Goods on and above the counter
  if (food) {
    // A big steel pot with steam, and a stack of banana leaves
    const px = w * 0.3
    g.fillStyle = vgrad(g, counterTop - 52, counterTop, '#d5d8da', '#7c8084')
    g.beginPath()
    g.roundRect(px - 44, counterTop - 52, 88, 52, 12)
    g.fill()
    g.stroke()
    g.fillStyle = '#9aa0a4'
    g.beginPath()
    g.ellipse(px, counterTop - 52, 48, 10, 0, 0, Math.PI * 2)
    g.fill()
    g.stroke()
    g.strokeStyle = 'rgba(255,244,220,.55)'
    g.lineWidth = 5
    for (const dx of [-18, 0, 18]) {
      g.beginPath()
      g.moveTo(px + dx, counterTop - 64)
      g.bezierCurveTo(px + dx - 14, counterTop - 84, px + dx + 14, counterTop - 98, px + dx, counterTop - 116)
      g.stroke()
    }
    g.strokeStyle = INK
    g.lineWidth = 3
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#3e7b2e' : '#4f9138'
      g.beginPath()
      g.ellipse(w * 0.7, counterTop - 6 - i * 7, 54, 11, 0, 0, Math.PI * 2)
      g.fill()
      g.stroke()
    }
  } else {
    // A rail of tees on hangers under the awning, and a folded stack
    g.fillStyle = '#c8955f'
    g.fillRect(40, 150, w - 80, 5)
    g.strokeRect(40, 150, w - 80, 5)
    const cols = [['#1f1b18', '#f2c12e'], ['#ead6b0', '#8e0b20'], ['#1f1b18', '#f2c12e'], ['#ead6b0', '#8e0b20']]
    cols.forEach(([body, print], i) => {
      const x = 92 + i * ((w - 184) / 3)
      g.fillStyle = body
      g.beginPath()
      g.moveTo(x - 16, 158)
      g.lineTo(x - 36, 176)
      g.lineTo(x - 30, 190)
      g.lineTo(x - 18, 184)
      g.lineTo(x - 18, 222)
      g.lineTo(x + 18, 222)
      g.lineTo(x + 18, 184)
      g.lineTo(x + 30, 190)
      g.lineTo(x + 36, 176)
      g.lineTo(x + 16, 158)
      g.quadraticCurveTo(x, 168, x - 16, 158)
      g.closePath()
      g.fill()
      g.stroke()
      g.fillStyle = print
      g.fillRect(x - 9, 192, 18, 14)
    })
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#ead6b0' : '#1f1b18'
      g.fillRect(w * 0.64 - 40, counterTop - 12 - i * 11, 80, 11)
      g.strokeRect(w * 0.64 - 40, counterTop - 12 - i * 11, 80, 11)
    }
  }

  // The counter
  g.fillStyle = vgrad(g, counterTop, h, '#8a5a30', '#4e2f18')
  g.fillRect(0, counterTop, w, 100)
  g.strokeRect(0, counterTop, w, 100)
  g.strokeStyle = 'rgba(30,14,6,.5)'
  g.lineWidth = 2
  for (let x = 52; x < w; x += 70) {
    g.beginPath()
    g.moveTo(x, counterTop + 14)
    g.lineTo(x, h - 4)
    g.stroke()
  }
  g.fillStyle = '#b8864f'
  g.fillRect(-4, counterTop - 6, w + 8, 12)
  g.strokeStyle = INK
  g.lineWidth = 3
  g.strokeRect(-4, counterTop - 6, w + 8, 12)

  // Awning, bulbs along its lip, and the sign above it
  scallopedAwning(g, 0, 62, w, 62, awnA, awnB)
  bulbs(g, 14, 134, w - 14, 134, 34, 4.2, food ? 11 : 12)
  signBoard(g, place, w * 0.08, 6, w * 0.84, 92, '#d6a65a', '#f2c12e')
}
