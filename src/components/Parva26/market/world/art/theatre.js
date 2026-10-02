import { INK, FONT, makeCanvas, rrect, vgrad, hgrad, fitText, bulbs, rng, grain } from './paint'

const NAME = 'ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ'

// The theatre's front, seen from the forecourt: a name board ringed with
// bulbs, a carved cornice, two posters either side of a warm arched door with
// its velvet curtain half drawn, and steps down to the cobbles. It is as
// wide as L.theatre.width and as tall as the space above the compound wall.
export function drawTheatre(L) {
  const w = L.theatre.width
  const h = L.wallY - L.theatre.top
  const c = makeCanvas(w, h)
  const g = c.getContext('2d')
  const cx = w / 2
  const groundY = h - 34 // the top step

  // The building
  g.fillStyle = vgrad(g, 96, groundY, '#62182a', '#3b0c18')
  g.fillRect(0, 96, w, groundY - 96)
  g.strokeStyle = INK
  g.lineWidth = 3
  g.strokeRect(1.5, 96, w - 3, groundY - 96)
  // Pilasters at both ends, each with a gold capital and base
  for (const x of [0, w - 46]) {
    g.fillStyle = hgrad(g, x, x + 46, '#8a5a2a', '#d6a65a', '#7a4a22')
    g.fillRect(x, 96, 46, groundY - 96)
    g.fillStyle = '#e8c274'
    g.fillRect(x - 4, 96, 54, 14)
    g.fillRect(x - 4, groundY - 16, 54, 16)
    g.strokeRect(x, 96, 46, groundY - 96)
  }
  // Tall arched windows between the pilasters and the posters, lit from within
  const winY = 150
  for (const dx of [-1, 1]) {
    const x = cx + dx * (w * 0.42) - 30
    g.fillStyle = vgrad(g, winY, winY + 150, '#ffd98a', '#c9731f')
    g.beginPath()
    g.moveTo(x, winY + 150)
    g.lineTo(x, winY + 40)
    g.arc(x + 30, winY + 40, 30, Math.PI, 0)
    g.lineTo(x + 60, winY + 150)
    g.closePath()
    g.fill()
    g.stroke()
    g.strokeStyle = 'rgba(58,34,20,.7)'
    g.lineWidth = 2
    g.beginPath()
    g.moveTo(x + 30, winY + 10)
    g.lineTo(x + 30, winY + 150)
    g.moveTo(x, winY + 90)
    g.lineTo(x + 60, winY + 90)
    g.stroke()
    g.strokeStyle = INK
    g.lineWidth = 3
  }

  // Cornice and parapet under the name board
  g.fillStyle = vgrad(g, 70, 110, '#e8c274', '#a8782e')
  g.fillRect(-2, 82, w + 4, 22)
  g.strokeRect(-2, 82, w + 4, 22)
  g.fillStyle = '#7a4a22'
  for (let x = 14; x < w; x += 28) g.fillRect(x, 104, 12, 8) // dentils

  // The crest on top
  g.fillStyle = vgrad(g, 0, 60, '#f0cf86', '#b8862b')
  g.beginPath()
  g.arc(cx, 62, 52, Math.PI, 0)
  g.closePath()
  g.fill()
  g.stroke()
  g.fillStyle = '#7e1424'
  g.beginPath()
  g.arc(cx, 62, 34, Math.PI, 0)
  g.closePath()
  g.fill()
  g.fillStyle = '#f2c12e'
  g.font = `34px ${FONT.card}`
  g.textAlign = 'center'
  g.fillText('ಪರ್ವ', cx, 58)

  // The name board
  const bx = w * 0.12
  const bw = w * 0.76
  const by = 64
  const bh = 78
  rrect(g, bx - 6, by - 6, bw + 12, bh + 12, 12)
  g.fillStyle = '#d6a65a'
  g.fill()
  g.stroke()
  rrect(g, bx, by, bw, bh, 8)
  g.fillStyle = vgrad(g, by, by + bh, '#2a0a10', '#18060a')
  g.fill()
  const size = fitText(g, NAME, FONT.card, bw - 50, 54)
  g.font = `${size}px ${FONT.card}`
  g.textBaseline = 'middle'
  g.fillStyle = '#7a4a22'
  g.fillText(NAME, cx + 2, by + bh / 2 + 5)
  g.fillStyle = '#f2c12e'
  g.fillText(NAME, cx, by + bh / 2 + 3)
  g.textBaseline = 'alphabetic'
  bulbs(g, bx - 2, by - 12, bx + bw + 2, by - 12, 26, 4.2, 4)
  bulbs(g, bx - 2, by + bh + 12, bx + bw + 2, by + bh + 12, 26, 4.2, 9)

  // Posters on either side of the door
  const pw = Math.min(124, w * 0.16)
  const ph = pw * 1.5
  const rnd = rng(8)
  for (const [i, dx] of [-1, 1].entries()) {
    const x = cx + dx * (w * 0.26) - pw / 2
    const y = groundY - 44 - ph
    g.fillStyle = '#e8c274'
    g.fillRect(x - 7, y - 7, pw + 14, ph + 14)
    g.strokeRect(x - 7, y - 7, pw + 14, ph + 14)
    g.fillStyle = vgrad(g, y, y + ph, ['#2f6b4a', '#7e1424'][i], ['#173a29', '#3e0a12'][i])
    g.fillRect(x, y, pw, ph)
    g.fillStyle = 'rgba(242,193,46,.9)'
    g.beginPath()
    g.arc(x + pw / 2, y + ph * 0.38, pw * 0.2, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = 'rgba(0,0,0,.4)'
    g.beginPath()
    g.moveTo(x, y + ph)
    for (let k = 0; k <= 6; k++) g.lineTo(x + (pw * k) / 6, y + ph * (0.74 + rnd() * 0.12))
    g.lineTo(x + pw, y + ph)
    g.closePath()
    g.fill()
    g.fillStyle = '#f1dfc0'
    g.font = `${pw * 0.2}px ${FONT.poster}`
    g.fillText(['NOW SHOWING', 'COMING SOON'][i], x + pw / 2, y + ph - 12)
  }

  // The door: a warm arch with the curtain half drawn
  const dw = Math.min(208, w * 0.27)
  const dh = 236
  const dx0 = cx - dw / 2
  g.fillStyle = '#e8c274'
  g.beginPath()
  g.moveTo(dx0 - 12, groundY)
  g.lineTo(dx0 - 12, groundY - dh + dw / 2)
  g.arc(cx, groundY - dh + dw / 2, dw / 2 + 12, Math.PI, 0)
  g.lineTo(dx0 + dw + 12, groundY)
  g.closePath()
  g.fill()
  g.stroke()
  const glow = g.createRadialGradient(cx, groundY - 60, 10, cx, groundY - 60, dw)
  glow.addColorStop(0, '#fff0b8')
  glow.addColorStop(0.5, '#f2a93a')
  glow.addColorStop(1, '#8a3d12')
  g.fillStyle = glow
  g.beginPath()
  g.moveTo(dx0, groundY)
  g.lineTo(dx0, groundY - dh + dw / 2)
  g.arc(cx, groundY - dh + dw / 2, dw / 2, Math.PI, 0)
  g.lineTo(dx0 + dw, groundY)
  g.closePath()
  g.fill()
  g.stroke()
  // Curtain panels, gathered at each side
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? dx0 : cx + dw * 0.14
    const x1 = side < 0 ? cx - dw * 0.14 : dx0 + dw
    g.fillStyle = hgrad(g, x0, x1, '#7e1424', '#a91c33', '#6a0f1e', '#9a1a2e', '#5e0c1a')
    g.beginPath()
    g.moveTo(x0, groundY)
    g.lineTo(x0, groundY - dh + dw / 2)
    g.quadraticCurveTo((x0 + x1) / 2, groundY - dh + dw / 2 - 26, x1, groundY - dh + dw / 2 + 10)
    g.lineTo(side < 0 ? x1 - 6 : x1 + 6, groundY)
    g.closePath()
    g.fill()
    g.stroke()
  }
  // Brass door plate
  g.fillStyle = '#f2c12e'
  rrect(g, cx - 40, groundY - dh - 2, 80, 12, 4)
  g.fill()

  // Steps: three, widening toward the cobbles
  for (let i = 0; i < 3; i++) {
    const sw = dw + 64 + i * 56
    g.fillStyle = ['#d8c8a6', '#c4b28e', '#a8967a'][i]
    g.fillRect(cx - sw / 2, groundY + i * 11, sw, 11)
    g.strokeRect(cx - sw / 2, groundY + i * 11, sw, 11)
  }
  grain(g, w, h, 12, 9000, 0.08)
  return c
}
