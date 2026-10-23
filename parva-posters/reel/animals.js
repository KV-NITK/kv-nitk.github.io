// Western Ghats wildlife for the reel: flat painted-banner silhouettes in the
// style of forest.js (near-black shapes with a thin rim of warm light on the
// sunward edge). Every pose is a pure function of `t`; nothing keeps state.
// All coordinates are CSS px in the reel's 405x720 space; `g` is expected to
// already carry the reel's CSS-to-canvas transform.

const INK = '#150d08'
const RIM = 'rgba(255,208,140,.65)'
const TAU = Math.PI * 2
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeInOut = (u) => {
  u = clamp01(u)
  return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2
}

// Paint `draw` twice: first nudged toward the light in the rim colour, then
// in ink on top, so only a thin warm edge shows on the sunward side.
function silhouette(g, { ink = INK, rim = RIM, rimDx = 1.1, rimDy = -1.1 } = {}, draw) {
  g.save()
  g.translate(rimDx, rimDy)
  g.fillStyle = rim
  g.strokeStyle = rim
  draw()
  g.restore()
  g.save()
  g.fillStyle = ink
  g.strokeStyle = ink
  draw()
  g.restore()
}

function ellipse(g, x, y, rx, ry, rot = 0) {
  g.beginPath()
  g.ellipse(x, y, rx, ry, rot, 0, TAU)
  g.fill()
}

function tri(g, a, b, c) {
  g.beginPath()
  g.moveTo(a[0], a[1])
  g.lineTo(b[0], b[1])
  g.lineTo(c[0], c[1])
  g.closePath()
  g.fill()
}

// ------------------------------------------------------------- leopard --

// Rosettes on the flank (local coords): rings with a dark centre, so the cat
// reads as a leopard at phone size.
const SPOTS = [
  [24, -20], [38, -14], [46, -21], [58, -10], [66, -18], [78, -22], [86, -10], [96, -17],
  [108, -21], [116, -11], [126, -18], [138, -22], [146, -11], [156, -18], [52, -5], [102, -5],
]

// A leopard lying along a branch, facing right, long and low with a thick tail
// hanging down and curling at the tip. (x, y) is the top of the branch under
// its belly. `lift` 0..1 raises the head from resting on the branch to looking
// out; `t` drives the tail and a slow breath.
export function drawLeopard(g, x, y, s, t, lift, eyes = 0) {
  g.save()
  g.translate(x, y)
  g.scale(s, s)

  const breath = Math.sin(t * 1.4) * 0.012
  const headAngle = 0.22 - 0.36 * easeInOut(lift) + Math.sin(t * 0.9) * 0.02 * lift
  const headDy = 2.5 * (1 - easeInOut(lift))
  const tailPts = []

  const paw = (px, py, sway) => {
    g.beginPath()
    g.roundRect(px - 5.5, py, 11, 17, 5)
    g.fill()
    ellipse(g, px + sway, py + 17, 7, 4)
  }

  const headTransform = () => {
    g.translate(0, headDy)
    g.translate(168, -16)
    g.rotate(headAngle)
    g.translate(-168, 16)
  }

  const parts = () => {
    // branch, with a twig and a few leaves at the far end
    g.save()
    g.lineCap = 'round'
    g.lineWidth = 8
    g.beginPath()
    g.moveTo(-150, 14)
    g.bezierCurveTo(-60, 10, 90, 6, 235, -2)
    g.stroke()
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(215, -1)
    g.quadraticCurveTo(232, -14, 246, -26)
    g.stroke()
    g.restore()
    ellipse(g, 250, -30, 8, 3.5, -0.9)
    ellipse(g, 238, -22, 7, 3, 0.2)
    ellipse(g, 254, -16, 7, 3, -0.3)

    // long, low body (breathing a hair)
    g.save()
    g.scale(1, 1 + breath)
    g.beginPath()
    g.moveTo(6, -8)
    g.bezierCurveTo(4, -20, 20, -28, 44, -27)
    g.bezierCurveTo(80, -25, 120, -25, 150, -27)
    g.bezierCurveTo(160, -28, 168, -27, 174, -23)
    g.lineTo(174, -8)
    g.bezierCurveTo(160, -3, 130, -1, 90, -1)
    g.bezierCurveTo(50, -1, 24, 0, 14, -2)
    g.bezierCurveTo(6, -3, 6, -6, 6, -8)
    g.closePath()
    g.fill()
    g.restore()

    // legs hanging either side of the branch
    paw(24, -8, Math.sin(t * 1.1) * 0.8)
    paw(158, -8, Math.sin(t * 1.1 + 1) * 0.8)

    // tail: thick, hangs from the rump, sways in a slow wave, curls at the tip
    g.save()
    g.lineCap = 'round'
    let tx = 8
    let ty = -13
    let ang = 1.8
    const segs = 13
    tailPts.length = 0
    for (let i = 0; i < segs; i++) {
      ang += Math.sin(t * 1.15 - i * 0.45) * 0.07 * (0.45 + i * 0.15) - (i > 8 ? 0.3 : 0)
      const nx = tx + Math.cos(ang) * 9.5
      const ny = ty + Math.sin(ang) * 9.5
      g.lineWidth = i < 9 ? 8.5 - i * 0.12 : 7.4 - (i - 8) * 0.9
      g.beginPath()
      g.moveTo(tx, ty)
      g.lineTo(nx, ny)
      g.stroke()
      tailPts.push([(tx + nx) / 2, (ty + ny) / 2])
      tx = nx
      ty = ny
    }
    g.restore()

    // head and neck, low and flat with small round ears, turning at the shoulder
    g.save()
    headTransform()
    ellipse(g, 168, -17, 10, 10, 0) // neck
    ellipse(g, 183, -19, 14, 9, 0.12) // skull
    ellipse(g, 197, -15, 9, 5.8, 0.2) // muzzle
    ellipse(g, 179, -28, 3.8, 3.8) // ears
    ellipse(g, 189, -28.5, 3.8, 3.8)
    g.restore()
  }

  silhouette(g, {}, parts)

  // rosettes on the flank and tail, a warm brown ring around a dark centre
  g.save()
  g.save()
  g.scale(1, 1 + breath)
  g.strokeStyle = 'rgba(190,124,64,.75)'
  g.lineWidth = 1.6
  for (const [sx, sy] of SPOTS) {
    g.beginPath()
    g.arc(sx, sy, 3.4, 0, TAU)
    g.stroke()
  }
  g.restore()
  g.fillStyle = 'rgba(190,124,64,.7)'
  tailPts.forEach(([px, py], i) => {
    if (i % 2 === 0 && i < 10) {
      g.beginPath()
      g.arc(px, py, 1.7, 0, TAU)
      g.fill()
    }
  })
  g.restore()

  // eyes, once it has lifted its head
  if (eyes > 0.01) {
    g.save()
    headTransform()
    g.globalAlpha *= eyes
    g.shadowColor = 'rgba(255,190,70,.95)'
    g.shadowBlur = 6
    g.fillStyle = '#ffd36b'
    ellipse(g, 187, -21, 2, 1.2, -0.15)
    g.restore()
  }
  g.restore()
}

// ------------------------------------------------------------ elephants --

// One elephant facing right, feet on y, `swing` is the walking phase.
function elephant(g, t, phase) {
  const parts = () => {
    ellipse(g, 0, -24, 25, 14.5) // body
    ellipse(g, 24, -32, 10.5, 10.5) // head
    ellipse(g, 17, -30, 6, 9.5, 0.2 + Math.sin(t * 2.2 + phase) * 0.12) // ear
    g.save()
    g.lineCap = 'round'
    g.lineWidth = 5
    g.beginPath() // trunk, curling up at the tip
    g.moveTo(32, -30)
    g.quadraticCurveTo(38, -16, 33 + Math.sin(t * 1.3 + phase) * 1.5, -5)
    g.stroke()
    g.lineWidth = 7.5
    for (const [hx, side] of [[-17, 0], [-8, 1], [11, 1], [20, 0]]) {
      const a = Math.sin(t * 2.2 + phase + side * Math.PI) * 0.28
      g.beginPath()
      g.moveTo(hx, -16)
      g.lineTo(hx + Math.sin(a) * 18, -16 + Math.cos(a) * 16)
      g.stroke()
    }
    g.lineWidth = 2.4
    g.beginPath() // tail
    g.moveTo(-24, -28)
    g.quadraticCurveTo(-29 + Math.sin(t * 1.6 + phase) * 1.5, -20, -27, -10)
    g.stroke()
    g.restore()
  }
  silhouette(g, { rimDx: 0.9, rimDy: -0.9 }, parts)
}

// A mother and calf walking slowly left, so they travel with the light on
// their right. `x` is the mother's centre.
export function drawElephantPair(g, x, y, s, t) {
  for (const [dx, k, phase] of [
    [0, 1, 0],
    [-46, 0.52, 1.7],
  ]) {
    g.save()
    g.translate(x + dx * s, y)
    g.scale(-s * k, s * k) // mirrored: they face left
    elephant(g, t, phase)
    g.restore()
  }
}

// -------------------------------------------------------------- hornbill --

// A great hornbill crossing left to right: dark body, pale tail band,
// yellow beak, wings beating.
export function drawHornbill(g, x, y, s, t) {
  g.save()
  g.translate(x, y)
  g.scale(s, s)
  g.rotate(-0.08)
  const f = Math.sin(t * 8.5)
  const wing = (k, dx) => {
    g.beginPath()
    g.moveTo(3 + dx, -1)
    g.quadraticCurveTo(-4 + dx, -9 * k - 2, -15 + dx, -3 - 15 * k)
    g.quadraticCurveTo(-9 + dx, -2 - 5 * k, -8 + dx, 2)
    g.closePath()
    g.fill()
  }
  const parts = () => {
    wing(f * 0.9 + 0.1, 3) // far wing
    ellipse(g, 0, 0, 10, 4.6, -0.1) // body
    ellipse(g, 12, -2.5, 3.6, 3.2) // head
    g.save()
    g.lineCap = 'round'
    g.lineWidth = 3
    g.beginPath() // neck
    g.moveTo(6, -1)
    g.lineTo(11, -2.5)
    g.stroke()
    g.restore()
    wing(f, 0) // near wing
  }
  silhouette(g, { rimDx: 0.8, rimDy: -0.8 }, parts)
  // pale tail with a dark band
  g.fillStyle = '#efe2c4'
  g.beginPath()
  g.moveTo(-8, -1.5)
  g.lineTo(-20, -2.5)
  g.lineTo(-20, 2.5)
  g.lineTo(-8, 2)
  g.closePath()
  g.fill()
  g.fillStyle = INK
  g.fillRect(-14, -2.6, 2.6, 5.2)
  // the big yellow beak and casque
  g.fillStyle = '#e8a21c'
  g.beginPath()
  g.moveTo(14.5, -4)
  g.quadraticCurveTo(24, -4.5, 26, 1.5)
  g.quadraticCurveTo(20, 0.5, 14.5, 0)
  g.closePath()
  g.fill()
  g.fillStyle = '#c8741a'
  g.beginPath()
  g.moveTo(14.5, -4)
  g.quadraticCurveTo(19, -8.5, 24, -4.2)
  g.closePath()
  g.fill()
  g.restore()
}

// ------------------------------------------------------------ spotted deer --

// A chital stag facing right, feet on y, grazing and glancing up.
export function drawDeer(g, x, y, s, t, { rimDx = -1.1, rimDy = -1.1, ink = '#131b16' } = {}) {
  g.save()
  g.translate(x, y)
  g.scale(s, s)
  const headUp = 0.5 + 0.5 * Math.sin(t * 1.6)
  const parts = () => {
    ellipse(g, 0, -27, 18, 8.5, -0.05) // body
    g.save()
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.lineWidth = 6.5
    g.beginPath() // neck
    g.moveTo(12, -31)
    g.lineTo(19 + 2 * headUp, -45 + 4 * (1 - headUp))
    g.stroke()
    g.lineWidth = 2.8
    for (const [lx, side] of [[-12, 0], [-7, 1], [8, 1], [13, 0]]) {
      const a = Math.sin(t * 1.4 + side * Math.PI) * 0.1
      g.beginPath()
      g.moveTo(lx, -23)
      g.lineTo(lx + Math.sin(a) * 22, 0)
      g.stroke()
    }
    g.lineWidth = 2
    g.beginPath() // tail
    g.moveTo(-17, -30)
    g.lineTo(-21, -26 + Math.sin(t * 5) * 1.2)
    g.stroke()
    // antlers
    const hx = 22 + 2 * headUp
    const hy = -47 + 4 * (1 - headUp)
    g.lineWidth = 1.6
    g.beginPath()
    g.moveTo(hx - 1, hy - 3)
    g.lineTo(hx - 5, hy - 15)
    g.moveTo(hx - 4, hy - 10)
    g.lineTo(hx + 3, hy - 14)
    g.moveTo(hx + 1, hy - 3)
    g.lineTo(hx + 1, hy - 17)
    g.moveTo(hx + 1, hy - 12)
    g.lineTo(hx + 8, hy - 15)
    g.stroke()
    g.restore()
    ellipse(g, 23 + 2 * headUp, -46 + 4 * (1 - headUp), 5.2, 3.6, 0.5) // head
    ellipse(g, 28 + 2 * headUp, -44 + 4 * (1 - headUp), 3.2, 2.2, 0.6) // muzzle
    tri(g, [20 + 2 * headUp, -49], [15 + 2 * headUp, -53], [19 + 2 * headUp, -45]) // ear
  }
  silhouette(g, { ink, rimDx, rimDy }, parts)
  g.fillStyle = 'rgba(255,240,215,.4)'
  for (const [sx, sy] of [[-10, -29], [-4, -25], [2, -30], [8, -26], [-1, -33], [-13, -24], [11, -31]]) {
    g.beginPath()
    g.arc(sx, sy, 1.15, 0, TAU)
    g.fill()
  }
  g.restore()
}
