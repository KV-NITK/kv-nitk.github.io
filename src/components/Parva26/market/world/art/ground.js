import { INK, makeCanvas, rng, rrect, vgrad, grain } from './paint'

// The back of the scene, painted once: a dusk sky and distant forest behind
// the compound wall, cobbled ground below it, the lamps' pools of light and
// the glow from the theatre's door. The buildings stand on top of this.
export function drawGround(L) {
  const { width: W, height: H, wallY, door, lamps } = L
  const c = makeCanvas(W, H)
  const g = c.getContext('2d')
  const rnd = rng(26)

  // Dusk sky, warmest at the horizon
  g.fillStyle = vgrad(g, 0, wallY, '#1c1230', '#5e2c3c', '#c9834a')
  g.fillRect(0, 0, W, wallY)

  // Two ridges of forest, the near one darker
  for (const [lift, col] of [[150, '#2a1a24'], [92, '#160d0e']]) {
    g.fillStyle = col
    g.beginPath()
    g.moveTo(0, wallY)
    for (let x = 0; x <= W; x += 20) g.lineTo(x, wallY - lift + 22 * Math.sin(x * 0.011 + lift) - rnd() * 34)
    g.lineTo(W, wallY)
    g.closePath()
    g.fill()
  }

  // The compound wall: red laterite blocks with a pale cap
  g.fillStyle = vgrad(g, wallY - 54, wallY, '#7a4a2a', '#5a3620')
  g.fillRect(0, wallY - 54, W, 54)
  g.strokeStyle = 'rgba(30,14,6,.45)'
  g.lineWidth = 2
  for (let row = 0; row < 3; row++) {
    const y = wallY - 54 + row * 18
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(W, y)
    g.stroke()
    for (let x = (row % 2) * 34; x < W; x += 68) {
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x, y + 18)
      g.stroke()
    }
  }
  g.fillStyle = '#d9c7a0'
  g.fillRect(0, wallY - 62, W, 10)
  g.fillStyle = 'rgba(0,0,0,.35)'
  g.fillRect(0, wallY - 52, W, 4)

  // Cobbles: mortar first, then stones row by row, every other row shifted
  g.fillStyle = '#241812'
  g.fillRect(0, wallY, W, H - wallY)
  const stones = ['#5d4837', '#503d2e', '#6a5440', '#46352a', '#5a4535', '#6b5846']
  for (let row = 0, y = wallY; y < H; row++, y += 38) {
    let x = -((row % 2) * 30) - rnd() * 12
    while (x < W) {
      const w = 52 + rnd() * 24
      const h = 35 + rnd() * 5
      g.fillStyle = stones[(rnd() * stones.length) | 0]
      rrect(g, x + 2.5, y + 2.5, w - 5, h - 5, 10)
      g.fill()
      g.strokeStyle = 'rgba(255,232,190,.13)'
      g.lineWidth = 2
      g.beginPath()
      g.moveTo(x + 9, y + 5)
      g.lineTo(x + w - 9, y + 5)
      g.stroke()
      g.strokeStyle = 'rgba(0,0,0,.28)'
      g.beginPath()
      g.moveTo(x + 9, y + h - 4)
      g.lineTo(x + w - 9, y + h - 4)
      g.stroke()
      x += w
    }
  }
  // The wall's shadow on the stones
  g.fillStyle = vgrad(g, wallY, wallY + 70, 'rgba(0,0,0,.55)', 'rgba(0,0,0,0)')
  g.fillRect(0, wallY, W, 70)

  // Light: the lamps' pools and the door's spill, added to what is there
  g.save()
  g.globalCompositeOperation = 'lighter'
  const pool = (x, y, rx, ry, a) => {
    g.save()
    g.translate(x, y)
    g.scale(1, ry / rx)
    const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx)
    grad.addColorStop(0, `rgba(255,178,84,${a})`)
    grad.addColorStop(0.5, `rgba(214,120,52,${a * 0.4})`)
    grad.addColorStop(1, 'rgba(214,120,52,0)')
    g.fillStyle = grad
    g.fillRect(-rx, -rx, rx * 2, rx * 2)
    g.restore()
  }
  for (const lamp of lamps) pool(lamp.x, lamp.base - 20, 330, 200, 0.4)
  pool(door.x, wallY + 40, 480, 260, 0.46)
  g.restore()

  // Vignette
  const vig = g.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, Math.hypot(W, H) * 0.55)
  vig.addColorStop(0, 'rgba(10,5,3,0)')
  vig.addColorStop(1, 'rgba(10,5,3,.62)')
  g.fillStyle = vig
  g.fillRect(0, 0, W, H)

  g.strokeStyle = INK
  grain(g, W, H, 5, 26000, 0.07)
  return c
}
