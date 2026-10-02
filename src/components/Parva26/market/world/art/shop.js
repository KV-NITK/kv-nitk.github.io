import { INK, FONT, makeCanvas, rrect, vgrad, hgrad, fitText, bulbs, rng, grain } from './paint'

// Stand-in shopfronts for the forecourt, painted once. Each stands on its
// bottom edge. The food and merch shops are stalls against the back wall
// (awning, counter, goods); the photo studio is a free-standing cabin.
// TODO(art): replace with the final shop art; the doors and the shop panels
// are the next step.
export function drawShop(place, w, h) {
  const c = makeCanvas(w, h)
  const g = c.getContext('2d')
  g.strokeStyle = INK
  g.lineWidth = 3
  g.lineJoin = 'round'
  g.lineCap = 'round'
  if (place.kind === 'photo') cabin(g, place, w, h)
  else stall(g, place, w, h)
  grain(g, w, h, 40 + place.id.length, 4000, 0.08)
  return c
}

// The shop's name on a hanging board, Kannada big and English under it.
function signBoard(g, place, x, y, w, h, rim, ink) {
  rrect(g, x - 5, y - 5, w + 10, h + 10, 12)
  g.fillStyle = rim
  g.fill()
  g.stroke()
  rrect(g, x, y, w, h, 8)
  g.fillStyle = vgrad(g, y, y + h, '#2a0a10', '#18060a')
  g.fill()
  g.textAlign = 'center'
  const kn = fitText(g, place.kn, FONT.card, w - 30, Math.min(34, h * 0.48))
  g.font = `${kn}px ${FONT.card}`
  g.fillStyle = ink
  g.fillText(place.kn, x + w / 2, y + h * 0.47)
  const en = place.en.split(' · ')[0]
  g.font = `14px ${FONT.poster}`
  g.fillStyle = 'rgba(241,223,192,.85)'
  g.fillText(en.toUpperCase(), x + w / 2, y + h - 6)
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
  signBoard(g, place, w * 0.12, 4, w * 0.76, 68, '#d6a65a', '#f2c12e')
}

function cabin(g, place, w, h) {
  const baseY = h - 6
  // Body: a painted wooden booth with the curtain drawn back
  g.fillStyle = vgrad(g, 96, baseY, '#6b3f22', '#3e2412')
  g.fillRect(14, 96, w - 28, baseY - 96)
  g.strokeRect(14, 96, w - 28, baseY - 96)
  // The studio inside: a painted backdrop, a stool and a flash lamp
  const ix = 46
  const iw = w - 92
  const iy = 122
  const ih = baseY - 122 - 10
  g.fillStyle = vgrad(g, iy, iy + ih, '#f6c46a', '#e07a4a', '#5a2e5e')
  g.fillRect(ix, iy, iw, ih)
  g.fillStyle = '#2f6b4a'
  g.beginPath()
  g.moveTo(ix, iy + ih)
  for (let x = 0; x <= iw; x += 24) g.lineTo(ix + x, iy + ih - 52 - 26 * Math.abs(Math.sin(x * 0.05)))
  g.lineTo(ix + iw, iy + ih)
  g.closePath()
  g.fill()
  g.fillStyle = '#fbe7b5'
  g.beginPath()
  g.arc(ix + iw * 0.7, iy + 46, 22, 0, Math.PI * 2)
  g.fill()
  g.strokeRect(ix, iy, iw, ih)
  // Stool
  g.fillStyle = '#8a5a30'
  g.beginPath()
  g.ellipse(w / 2, baseY - 70, 34, 10, 0, 0, Math.PI * 2)
  g.fill()
  g.stroke()
  g.fillRect(w / 2 - 24, baseY - 70, 6, 56)
  g.fillRect(w / 2 + 18, baseY - 70, 6, 56)
  // Curtain panels drawn back to each side
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? ix - 8 : w - ix - 38
    g.fillStyle = hgrad(g, x0, x0 + 46, '#7e1424', '#b2203a', '#6a0f1e', '#9a1a2e')
    g.beginPath()
    g.moveTo(x0, iy - 8)
    g.lineTo(x0 + 46, iy - 8)
    g.lineTo(x0 + (side < 0 ? 30 : 16), baseY - 10)
    g.lineTo(x0 + (side < 0 ? 0 : -14), baseY - 10)
    g.closePath()
    g.fill()
    g.stroke()
  }
  // Roof with a sign
  g.fillStyle = vgrad(g, 66, 100, '#a91c33', '#6a0f1e')
  g.beginPath()
  g.moveTo(-4, 104)
  g.lineTo(26, 82)
  g.lineTo(w - 26, 82)
  g.lineTo(w + 4, 104)
  g.closePath()
  g.fill()
  g.stroke()
  bulbs(g, 6, 106, w - 6, 106, 30, 4.2, 14)
  signBoard(g, place, w * 0.14, 4, w * 0.72, 74, '#d6a65a', '#f2c12e')
  // A flash lamp on a stand at the right, and a strip of photos at the left
  g.fillStyle = '#3a3532'
  g.fillRect(w - 36, baseY - 120, 6, 114)
  g.strokeRect(w - 36, baseY - 120, 6, 114)
  const flash = g.createRadialGradient(w - 33, baseY - 128, 2, w - 33, baseY - 128, 22)
  flash.addColorStop(0, '#ffffff')
  flash.addColorStop(0.6, '#fff0b8')
  flash.addColorStop(1, 'rgba(255,240,184,0)')
  g.fillStyle = flash
  g.fillRect(w - 60, baseY - 154, 54, 54)
  for (let i = 0; i < 3; i++) {
    g.fillStyle = '#f7ecd0'
    g.fillRect(8, 140 + i * 40, 34, 34)
    g.strokeRect(8, 140 + i * 40, 34, 34)
    g.fillStyle = ['#c8955f', '#d9c7a0', '#9a6a40'][i]
    g.fillRect(12, 144 + i * 40, 26, 26)
  }
}
