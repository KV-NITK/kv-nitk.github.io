// Scene 4, ಗಂಧದ ಗುಡಿ (allscenes.md): a short length of film seen sideways,
// three 4:3 frames joined by sprocket edges, pulled along by the scroll.
//   1 ಕಾಡು  the forest at dawn, cool and misty
//   2 ಕಲೆ   a carver's bench by the light of a small oil lamp
//   3 ಸಿನಿಮಾ a tiny theatre from the back row
// The agarbatti smoke from frame 2 crosses the black gap into frame 3, where
// it straightens into the little theatre's projector beam and lights its
// screen with a ಗಂಧದ ಗುಡಿ title card.
//
// Each frame's still parts are painted once into offscreen layers; a frame of
// the scene is a few drawImage calls plus the moving bits.

const TAU = Math.PI * 2
const FILM_BASE = '#2a1a0e'
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function layer(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

function vertical(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  for (const [at, color] of stops) g.addColorStop(at, color)
  return g
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function ridge(ctx, w, h, base, waves, fill, rand) {
  const parts = waves.map(([k, amp]) => [k, amp * h, rand() * TAU])
  ctx.beginPath()
  ctx.moveTo(0, h)
  for (let x = 0; x <= w; x += 3) {
    ctx.lineTo(x, base * h + parts.reduce((y, [k, a, ph]) => y + a * Math.sin((TAU * k * x) / w + ph), 0))
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

// A slender sandalwood tree: thin dark trunk, small crown of little leaves,
// lit on one side.
function tree(ctx, x, baseY, height, leaf, rand, lit, dark, litSide) {
  ctx.strokeStyle = '#1e1a14'
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(1, height * 0.03)
  const forkY = baseY - height * 0.55
  ctx.beginPath()
  ctx.moveTo(x, baseY)
  ctx.quadraticCurveTo(x + height * 0.03, baseY - height * 0.3, x, forkY)
  ctx.stroke()
  const clumps = [
    [0, -0.3, 0.17],
    [-0.09, -0.2, 0.12],
    [0.09, -0.22, 0.12],
    [0.02, -0.12, 0.1],
  ]
  for (const [dx, dy, r] of clumps) {
    const cx = x + dx * height
    const cy = forkY + dy * height
    const rr = r * height
    const count = Math.round((rr * rr) / (leaf * leaf * 0.5))
    for (let i = 0; i < count; i++) {
      const a = rand() * TAU
      const d = Math.sqrt(rand()) * rr
      const facing = Math.cos(a - litSide) * (d / rr)
      ctx.fillStyle = facing > 0.72 ? lit : dark[Math.floor(rand() * dark.length)]
      ctx.beginPath()
      ctx.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.75, leaf, leaf * 0.5, rand() * Math.PI, 0, TAU)
      ctx.fill()
    }
  }
}

// ---- Frame 1: the forest at dawn -----------------------------------------

function paintForest(w, h, small) {
  const rand = seeded(1916)
  const back = layer(w, h)
  const b = back.getContext('2d')
  b.fillStyle = vertical(b, 0, h, [[0, '#566e72'], [0.45, '#9aab9f'], [0.62, '#cfd2bd'], [1, '#cfd2bd']])
  b.fillRect(0, 0, w, h)
  const sx = w * 0.13
  const sy = h * 0.52
  const glow = b.createRadialGradient(sx, sy, 0, sx, sy, h * 0.6)
  glow.addColorStop(0, 'rgba(255,240,205,.85)')
  glow.addColorStop(0.2, 'rgba(250,228,190,.35)')
  glow.addColorStop(1, 'rgba(250,228,190,0)')
  b.fillStyle = glow
  b.fillRect(0, 0, w, h)
  b.fillStyle = '#fff7e2'
  b.beginPath()
  b.arc(sx, sy, h * 0.035, 0, TAU)
  b.fill()
  ridge(b, w, h, 0.55, [[1, 0.035], [3, 0.02], [7, 0.008]], '#8d9c9e', rand)
  b.fillStyle = vertical(b, h * 0.55, h * 0.7, [[0, 'rgba(214,220,206,0)'], [1, 'rgba(214,220,206,.8)']])
  b.fillRect(0, h * 0.55, w, h * 0.45)
  ridge(b, w, h, 0.63, [[2, 0.03], [5, 0.012]], '#6f8581', rand)
  b.fillStyle = vertical(b, h * 0.64, h * 0.76, [[0, 'rgba(206,214,200,0)'], [1, 'rgba(206,214,200,.7)']])
  b.fillRect(0, h * 0.64, w, h * 0.36)
  ridge(b, w, h, 0.8, [[2, 0.012], [6, 0.006]], '#3b4a3d', rand)
  b.fillStyle = vertical(b, h * 0.8, h, [[0, '#3b4a3d'], [1, '#27312a']])
  b.fillRect(0, h * 0.84, w, h * 0.16)

  const trees = layer(w, h)
  const tr = trees.getContext('2d')
  const leaf = Math.max(1, h * 0.009)
  for (let i = 0; i < 8; i++) {
    const x = w * (0.18 + i * 0.1 + (rand() - 0.5) * 0.05)
    const tall = h * (0.26 + rand() * 0.16)
    tree(tr, x, h * (0.8 + rand() * 0.04), tall, leaf * 0.85, rand, '#8f9474', ['#2c3a31', '#34453a', '#27352d', '#303f35'], Math.PI)
  }

  let near = null
  if (!small) {
    near = layer(w, h)
    const n = near.getContext('2d')
    n.filter = `blur(${Math.max(1, h * 0.008)}px)`
    tree(n, w * 0.97, h * 1.05, h * 1.05, leaf * 2.2, rand, '#5a5a44', ['#141a16', '#1a221c'], Math.PI)
    n.filter = 'none'
  }
  return { back, trees, near }
}

function drawForest(ctx, f, w, h, t, small) {
  ctx.drawImage(f.back, 0, 0, w, h)
  // Rays through the leaves from the low sun
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const sx = w * 0.13
  const sy = h * 0.52
  for (let i = 0; i < 4; i++) {
    const a = -0.28 + i * 0.16 + Math.sin(t * 0.2 + i) * 0.015
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, w)
    g.addColorStop(0, 'rgba(255,238,200,.12)')
    g.addColorStop(1, 'rgba(255,238,200,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + Math.cos(a - 0.03) * w, sy + Math.sin(a - 0.03) * w)
    ctx.lineTo(sx + Math.cos(a + 0.03) * w, sy + Math.sin(a + 0.03) * w)
    ctx.closePath()
    ctx.fill()
  }
  ctx.restore()
  // Leaves stir a little
  ctx.drawImage(f.trees, Math.sin(t * 0.8) * 0.6, 0, w, h)
  // Mist drifting left to right, about a 40-second loop
  const drift = ((t / 40) % 1) * w
  for (const [y, alpha, stretch] of [
    [0.8, 0.45, 0.7],
    [0.86, 0.35, 0.9],
  ]) {
    for (const x0 of [drift - w, drift]) {
      const g = ctx.createRadialGradient(x0 + w * 0.5, h * y, 0, x0 + w * 0.5, h * y, w * stretch * 0.5)
      g.addColorStop(0, `rgba(226,230,218,${alpha})`)
      g.addColorStop(1, 'rgba(226,230,218,0)')
      ctx.fillStyle = g
      ctx.save()
      ctx.translate(0, h * y)
      ctx.scale(1, 0.18)
      ctx.translate(0, -h * y)
      ctx.fillRect(x0, h * y - w * 0.5, w, w)
      ctx.restore()
    }
  }
  if (f.near) ctx.drawImage(f.near, 0, 0, w, h)
  // A pair of birds every 13 seconds
  if (!small) {
    const phase = (t % 13) / 7
    if (phase < 1) {
      ctx.strokeStyle = 'rgba(40,46,44,.8)'
      ctx.lineWidth = Math.max(1, h * 0.004)
      for (const [dx, dy, beat] of [
        [0, 0, 0],
        [-0.04, 0.02, 1.4],
      ]) {
        const x = w * (0.1 + phase * 0.9 + dx)
        const y = h * (0.28 + dy + Math.sin(phase * 7 + beat) * 0.01)
        const s = h * 0.014
        const flap = Math.sin(t * 8 + beat) * s * 0.7
        ctx.beginPath()
        ctx.moveTo(x - s, y - flap)
        ctx.quadraticCurveTo(x - s * 0.4, y - s * 0.3, x, y)
        ctx.quadraticCurveTo(x + s * 0.4, y - s * 0.3, x + s, y - flap)
        ctx.stroke()
      }
    }
  }
  // Cool grade with lifted blacks, like faded early colour film
  ctx.fillStyle = 'rgba(36,52,50,.22)'
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

// ---- Frame 2: the carver's bench ------------------------------------------

// Where things sit on the bench, as fractions of the frame.
const LAMP = { x: 0.16, y: 0.56 }
const INCENSE = { x: 0.92, y: 0.72, tip: 0.44 }
const LID = { x0: 0.38, x1: 0.66, top: 0.5, front: 0.62, base: 0.73 }
const STROKE_TIP = { x: 0.56, y: 0.57 }

const ELEPHANT = [
  'M30 22 C40 14 64 12 80 18 C92 22 96 32 95 42 L95 66 L86 66 L85 50 L78 50 L77 66 L68 66 L67 50 C58 52 50 52 44 50 L44 66 L35 66 L34 48 C30 44 28 38 28 32 Z',
  'M36 18 C28 16 18 20 16 30 C15 36 18 42 22 44 C20 50 17 56 16 62 C16 66 20 67 22 64 C24 58 27 52 30 46 C34 44 38 38 38 30 Z',
].map((d) => new Path2D(d))

function paintCraft(w, h) {
  const c = layer(w, h)
  const x = c.getContext('2d')
  x.fillStyle = vertical(x, 0, h, [[0, '#140c07'], [1, '#22150c']])
  x.fillRect(0, 0, w, h)
  // Shelf of tools and the shadowy wall behind
  x.fillStyle = '#1b110a'
  x.fillRect(0, h * 0.2, w, h * 0.02)
  // Bench top
  x.fillStyle = vertical(x, h * 0.6, h, [[0, '#6e4827'], [0.4, '#4e321b'], [1, '#2a190c']])
  x.beginPath()
  x.moveTo(0, h * 0.62)
  x.lineTo(w, h * 0.59)
  x.lineTo(w, h)
  x.lineTo(0, h)
  x.closePath()
  x.fill()
  x.strokeStyle = 'rgba(20,10,4,.35)'
  x.lineWidth = 1
  for (let i = 1; i < 9; i++) {
    x.beginPath()
    x.moveTo(0, h * (0.64 + i * 0.04))
    x.bezierCurveTo(w * 0.3, h * (0.645 + i * 0.04), w * 0.7, h * (0.625 + i * 0.04), w, h * (0.61 + i * 0.04))
    x.stroke()
  }
  // The box: front face, then the lid seen from above
  x.fillStyle = '#9a6c3e'
  x.fillRect(w * LID.x0, h * LID.front, w * (LID.x1 - LID.x0), h * (LID.base - LID.front))
  x.fillStyle = '#c8955f'
  x.beginPath()
  x.moveTo(w * LID.x0, h * LID.front)
  x.lineTo(w * LID.x1, h * LID.front)
  x.lineTo(w * (LID.x1 - 0.025), h * LID.top)
  x.lineTo(w * (LID.x0 + 0.025), h * LID.top)
  x.closePath()
  x.fill()
  x.strokeStyle = 'rgba(60,32,12,.6)'
  x.stroke()
  // The elephant half-carved into the lid, lit from the lamp on the left
  const ex = w * (LID.x0 + 0.05)
  const ey = h * (LID.top + 0.01)
  const es = (w * 0.17) / 100
  for (const [dx, dy, fill] of [
    [1.2, 0, '#e8c28a'],
    [-1.2, 0, '#5e3a18'],
    [0, 0, '#b8824e'],
  ]) {
    x.save()
    x.translate(ex + dx, ey + dy)
    x.scale(es, es * 0.62)
    x.fillStyle = fill
    for (const p of ELEPHANT) x.fill(p)
    x.restore()
  }
  // Chisels laid in a row
  for (let i = 0; i < 4; i++) {
    const cx = w * (0.08 + i * 0.05)
    const cy = h * (0.78 + i * 0.012)
    x.save()
    x.translate(cx, cy)
    x.rotate(-0.35)
    x.fillStyle = '#7a4a24'
    x.fillRect(0, -h * 0.012, w * 0.07, h * 0.024)
    x.fillStyle = vertical(x, -h * 0.008, h * 0.008, [[0, '#dfe3e6'], [1, '#7c8388']])
    x.fillRect(w * 0.07, -h * 0.007, w * 0.06, h * 0.014)
    x.restore()
  }
  // Shavings already curled on the bench
  x.strokeStyle = '#e0b988'
  x.lineWidth = Math.max(1, h * 0.006)
  const rand = seeded(7)
  for (let i = 0; i < 9; i++) {
    const sx = w * (0.32 + rand() * 0.36)
    const sy = h * (0.76 + rand() * 0.14)
    const r = h * (0.01 + rand() * 0.012)
    x.beginPath()
    for (let a = 0; a < TAU * 1.6; a += 0.3) x.lineTo(sx + Math.cos(a) * r * (1 - a / 14), sy + Math.sin(a) * r * 0.6 * (1 - a / 14))
    x.stroke()
  }
  // The little brass oil lamp and the agarbatti stand
  x.fillStyle = '#b8862b'
  x.beginPath()
  x.ellipse(w * LAMP.x, h * LAMP.y + h * 0.02, w * 0.045, h * 0.02, 0, 0, Math.PI)
  x.fill()
  x.fillRect(w * LAMP.x - w * 0.01, h * LAMP.y + h * 0.035, w * 0.02, h * 0.04)
  x.fillRect(w * LAMP.x - w * 0.03, h * LAMP.y + h * 0.07, w * 0.06, h * 0.012)
  x.fillStyle = '#8a6420'
  x.fillRect(w * (INCENSE.x - 0.025), h * INCENSE.y, w * 0.05, h * 0.015)
  x.strokeStyle = '#3a2412'
  x.lineWidth = Math.max(1, h * 0.005)
  x.beginPath()
  x.moveTo(w * INCENSE.x, h * INCENSE.y)
  x.lineTo(w * (INCENSE.x - 0.01), h * INCENSE.tip)
  x.stroke()
  return c
}

function drawCraft(ctx, still, w, h, t, crossing) {
  ctx.drawImage(still, 0, 0, w, h)
  const flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3 + 1)
  const lx = w * LAMP.x
  const ly = h * LAMP.y
  // Chisel shadows sway with the flame
  ctx.fillStyle = 'rgba(10,5,2,.35)'
  for (let i = 0; i < 4; i++) {
    ctx.save()
    ctx.translate(w * (0.08 + i * 0.05) + h * (0.02 + flick * 0.012), h * (0.8 + i * 0.012))
    ctx.rotate(-0.3)
    ctx.fillRect(0, 0, w * 0.13, h * 0.016)
    ctx.restore()
  }
  // The carver's hand and chisel repeating one slow stroke (6 s)
  const u = (t % 6) / 6
  const push = u < 0.55 ? ease(u / 0.55) : u < 0.7 ? 1 : 1 - ease((u - 0.7) / 0.3)
  const lift = u > 0.55 && u < 0.7 ? Math.sin(((u - 0.55) / 0.15) * Math.PI) : u >= 0.7 ? 0.35 * (1 - (u - 0.7) / 0.3) : 0
  const tipX = w * (STROKE_TIP.x - push * 0.06)
  const tipY = h * (STROKE_TIP.y - lift * 0.03)
  const ang = -0.55
  const handX = tipX + Math.cos(ang) * -w * 0.13
  const handY = tipY - Math.sin(ang) * -w * 0.13
  // Shaving: curls up in front of the tip while pushing, then drops
  if (u < 0.55) {
    const r = h * 0.012 * push
    ctx.strokeStyle = '#e8c595'
    ctx.lineWidth = Math.max(1, h * 0.006)
    ctx.beginPath()
    for (let a = 0; a < TAU * push * 1.4; a += 0.25) ctx.lineTo(tipX - r - Math.cos(a) * r * 0.9, tipY - Math.sin(a) * r * 0.7)
    ctx.stroke()
  } else {
    const fall = clamp01((u - 0.55) / 0.3)
    ctx.strokeStyle = `rgba(232,197,149,${1 - fall * 0.6})`
    ctx.beginPath()
    ctx.arc(w * (STROKE_TIP.x - 0.07), h * (STROKE_TIP.y + fall * 0.16), h * 0.012, 0, TAU * 0.8)
    ctx.stroke()
  }
  // Steel blade, then the wooden handle in the hand
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#c9ced2'
  ctx.lineWidth = Math.max(1.5, h * 0.012)
  ctx.beginPath()
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX + (handX - tipX) * 0.45, tipY + (handY - tipY) * 0.45)
  ctx.stroke()
  ctx.strokeStyle = '#7a4a24'
  ctx.lineWidth = Math.max(2, h * 0.026)
  ctx.beginPath()
  ctx.moveTo(tipX + (handX - tipX) * 0.45, tipY + (handY - tipY) * 0.45)
  ctx.lineTo(handX, handY)
  ctx.stroke()
  // The carver's arm reaches in from the top right: a cream shirt sleeve,
  // then the forearm tapering to the hand round the handle. The lamp lights
  // the edges that face it.
  const wrist = { x: handX + h * 0.045, y: handY - h * 0.02 }
  const cuff = { x: w * 0.84, y: h * 0.26 }
  limb(ctx, { x: w * 1.06, y: h * 0.02 }, cuff, h * 0.075, h * 0.055, '#cfc2a4')
  ctx.strokeStyle = 'rgba(120,100,70,.5)'
  ctx.lineWidth = Math.max(1, h * 0.004)
  ctx.beginPath()
  ctx.moveTo(w * 0.95, h * 0.1)
  ctx.lineTo(w * 0.88, h * 0.22)
  ctx.stroke()
  limb(ctx, cuff, wrist, h * 0.042, h * 0.026, '#865634')
  ctx.strokeStyle = 'rgba(255,196,130,.45)'
  ctx.lineWidth = Math.max(1, h * 0.005)
  ctx.beginPath()
  ctx.moveTo(cuff.x - h * 0.03, cuff.y + h * 0.03)
  ctx.lineTo(wrist.x - h * 0.02, wrist.y + h * 0.02)
  ctx.stroke()
  ctx.fillStyle = '#946343'
  ctx.beginPath()
  ctx.ellipse(handX + h * 0.015, handY, h * 0.048, h * 0.036, -0.35, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#a06c48'
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.ellipse(handX - h * 0.018 + i * h * 0.013, handY + h * 0.026, h * 0.009, h * 0.014, 0.2, 0, TAU)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.ellipse(handX - h * 0.03, handY - h * 0.012, h * 0.022, h * 0.01, -0.6, 0, TAU)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,196,130,.5)'
  ctx.lineWidth = Math.max(1, h * 0.004)
  ctx.beginPath()
  ctx.ellipse(handX + h * 0.015, handY, h * 0.048, h * 0.036, -0.35, Math.PI * 0.8, Math.PI * 1.45)
  ctx.stroke()

  // The lamp flame, and its light (the only light in the frame)
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.75)
  g.addColorStop(0, `rgba(255,190,110,${0.32 * flick})`)
  g.addColorStop(0.35, `rgba(255,160,80,${0.1 * flick})`)
  g.addColorStop(1, 'rgba(255,160,80,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  ctx.fillStyle = '#ffd36a'
  ctx.beginPath()
  ctx.ellipse(lx, ly - h * 0.015 * flick, w * 0.008, h * 0.028 * flick, Math.sin(t * 7) * 0.08, 0, TAU)
  ctx.fill()
  ctx.fillStyle = '#fff6d6'
  ctx.beginPath()
  ctx.ellipse(lx, ly - h * 0.008, w * 0.004, h * 0.012, 0, 0, TAU)
  ctx.fill()

  // Ember, and its thin smoke bending slowly (until it sets off for frame 3)
  const ex = w * (INCENSE.x - 0.01)
  const ey = h * INCENSE.tip
  ctx.fillStyle = `rgba(255,140,60,${0.7 + 0.3 * Math.sin(t * 2.4)})`
  ctx.beginPath()
  ctx.arc(ex, ey, h * 0.006, 0, TAU)
  ctx.fill()
  if (crossing < 0.02) smokeLine(ctx, ex, ey, h * 0.4, t, h)

  // Warm amber grade
  ctx.fillStyle = 'rgba(60,30,0,.12)'
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

// A tapering four-sided limb from a (half-width ra) to b (half-width rb).
function limb(ctx, a, b, ra, rb, fill) {
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
  const nx = -(b.y - a.y) / len
  const ny = (b.x - a.x) / len
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(a.x + nx * ra, a.y + ny * ra)
  ctx.lineTo(b.x + nx * rb, b.y + ny * rb)
  ctx.lineTo(b.x - nx * rb, b.y - ny * rb)
  ctx.lineTo(a.x - nx * ra, a.y - ny * ra)
  ctx.closePath()
  ctx.fill()
}

function smokeLine(ctx, x0, y0, len, t, h) {
  const steps = 30
  const g = ctx.createLinearGradient(0, y0, 0, y0 - len)
  g.addColorStop(0, 'rgba(236,226,206,.5)')
  g.addColorStop(1, 'rgba(236,226,206,0)')
  ctx.strokeStyle = g
  ctx.lineWidth = Math.max(1, h * 0.004)
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  for (let k = 1; k <= steps; k++) {
    const y = y0 - (len * k) / steps
    const x = x0 + Math.sin(k * 0.3 - t * 1.2) * k * 0.0045 * h + Math.sin(t * 0.3) * k * 0.004 * h
    ctx.lineTo(x, y)
  }
  ctx.stroke()
}

// ---- Frame 3: the tiny theatre --------------------------------------------

const TINY_SCREEN = { x0: 0.36, x1: 0.72, y0: 0.2, y1: 0.46 }
export const BEAM_APEX = { x: 0.03, y: 0.34 }

function paintCinema(w, h) {
  const c = layer(w, h)
  const x = c.getContext('2d')
  x.fillStyle = vertical(x, 0, h, [[0, '#0d1219'], [1, '#141b24']])
  x.fillRect(0, 0, w, h)
  const s = TINY_SCREEN
  // Arch around the little screen, tiny curtains, stage lip
  x.fillStyle = '#56606c'
  x.fillRect(w * (s.x0 - 0.05), h * (s.y0 - 0.06), w * (s.x1 - s.x0 + 0.1), h * (s.y1 - s.y0 + 0.14))
  x.fillStyle = '#0b0f14'
  x.fillRect(w * (s.x0 - 0.035), h * (s.y0 - 0.035), w * (s.x1 - s.x0 + 0.07), h * (s.y1 - s.y0 + 0.1))
  x.fillStyle = '#6a3a44'
  x.fillRect(w * (s.x0 - 0.035), h * (s.y0 - 0.035), w * 0.03, h * (s.y1 - s.y0 + 0.1))
  x.fillRect(w * (s.x1 + 0.005), h * (s.y0 - 0.035), w * 0.03, h * (s.y1 - s.y0 + 0.1))
  x.fillStyle = '#1c232c'
  x.fillRect(w * s.x0, h * s.y0, w * (s.x1 - s.x0), h * (s.y1 - s.y0))
  x.fillStyle = '#3a434e'
  x.fillRect(w * (s.x0 - 0.06), h * (s.y1 + 0.065), w * (s.x1 - s.x0 + 0.12), h * 0.02)
  // Rows of seats from the back, and the audience
  const rand = seeded(1973)
  for (const [row, y, size] of [
    [0, 0.66, 0.05],
    [1, 0.76, 0.065],
    [2, 0.88, 0.085],
  ]) {
    for (let i = -1; i < 14; i++) {
      const hx = w * (i / 12 + (row % 2) * 0.04)
      if (rand() < 0.62) {
        x.fillStyle = '#06090d'
        x.beginPath()
        x.arc(hx, h * (y - size * 0.8), h * size * 0.42, 0, TAU)
        x.fill()
        x.beginPath()
        x.ellipse(hx, h * (y - size * 0.1), h * size * 0.8, h * size * 0.5, 0, Math.PI, 0)
        x.fill()
      }
    }
    x.fillStyle = '#10161d'
    x.fillRect(0, h * y, w, h * (1 - y))
    x.fillStyle = '#26303b'
    x.fillRect(0, h * y, w, h * 0.008)
  }
  return c
}

function drawCinema(ctx, still, w, h, t, beam, screenLit, titleFont) {
  ctx.drawImage(still, 0, 0, w, h)
  const s = TINY_SCREEN
  const sx0 = w * s.x0
  const sx1 = w * s.x1
  const sy0 = h * s.y0
  const sy1 = h * s.y1
  if (beam > 0) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const ax = w * BEAM_APEX.x
    const ay = h * BEAM_APEX.y
    const g = ctx.createLinearGradient(ax, ay, (sx0 + sx1) / 2, (sy0 + sy1) / 2)
    g.addColorStop(0, `rgba(230,238,250,${0.22 * beam})`)
    g.addColorStop(1, `rgba(200,214,235,${0.05 * beam})`)
    ctx.fillStyle = g
    // A wide soft cone and a brighter core, so the edges fade
    for (const spread of [0.04, 0]) {
      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(sx0 - w * spread, sy0 - h * spread)
      ctx.lineTo(sx1 + w * spread, sy0 - h * spread)
      ctx.lineTo(sx1 + w * spread, sy1 + h * spread)
      ctx.lineTo(sx0 - w * spread, sy1 + h * spread)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }
  if (screenLit > 0) {
    const flick = 0.92 + Math.random() * 0.08
    ctx.fillStyle = `rgba(226,232,236,${screenLit * flick})`
    ctx.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0)
    ctx.strokeStyle = `rgba(90,70,40,${0.8 * screenLit})`
    ctx.lineWidth = Math.max(1, h * 0.004)
    ctx.strokeRect(sx0 + (sx1 - sx0) * 0.06, sy0 + (sy1 - sy0) * 0.1, (sx1 - sx0) * 0.88, (sy1 - sy0) * 0.8)
    ctx.fillStyle = `rgba(40,26,12,${screenLit})`
    ctx.font = titleFont(Math.round((sy1 - sy0) * 0.34))
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ಗಂಧದ ಗುಡಿ', (sx0 + sx1) / 2, (sy0 + sy1) / 2 + (sy1 - sy0) * 0.04)
    // Its light catches the edges of the audience
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    const g = ctx.createRadialGradient((sx0 + sx1) / 2, sy1, 0, (sx0 + sx1) / 2, sy1, w * 0.7)
    g.addColorStop(0, `rgba(170,190,215,${0.25 * screenLit})`)
    g.addColorStop(1, 'rgba(170,190,215,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
  }
  // Silver-blue grade
  ctx.fillStyle = 'rgba(30,42,60,.18)'
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
}

// ---- The strip ------------------------------------------------------------

// Frame rects for the scene in CSS pixels. `scroll` lays the frames in a row
// that slides; `still` (reduced motion) shows all three at once: side by
// side on wide screens, stacked on phones.
export function stripLayout(W, H, still) {
  const small = W < 640
  if (!still) {
    const fw = small ? W * 0.86 : Math.min(W * 0.56, H * 0.62 * (4 / 3))
    const fh = fw * 0.75
    const band = fh * 0.14
    const gap = fh * 0.07
    const top = (H - fh) / 2 - (small ? H * 0.12 : H * 0.02)
    return { fw, fh, band, gap, pitch: fw + gap, top, small, still, height: H }
  }
  if (small) {
    const fw = W * 0.86
    const fh = fw * 0.75
    const band = fh * 0.14
    return { fw, fh, band, gap: fh * 0.07, pitch: 0, top: band + 24, small, still, column: true, height: 0 }
  }
  const gap = W * 0.015
  const fw = (W * 0.94 - gap * 2) / 3
  const fh = fw * 0.75
  const band = fh * 0.14
  return { fw, fh, band, gap, pitch: fw + gap, top: (H - fh) / 2 - H * 0.08, small, still, height: H }
}

// Where each frame is for strip progress p (0: forest centred, 1: cinema).
export function frameRects(L, W, p) {
  if (L.column) {
    const step = L.fh + L.band * 2 + 150
    return [0, 1, 2].map((i) => ({ x: (W - L.fw) / 2, y: L.top + i * step, w: L.fw, h: L.fh }))
  }
  const start = L.still ? (W - (L.fw * 3 + L.gap * 2)) / 2 : W / 2 - L.fw / 2 - p * 2 * L.pitch
  return [0, 1, 2].map((i) => ({ x: start + i * L.pitch, y: L.top, w: L.fw, h: L.fh }))
}

export function createSandalStrip(canvas) {
  const ctx = canvas.getContext('2d')
  let L = null
  let scale = 1
  let layers = null
  let hole = null

  return {
    resize(layout, pixelScale) {
      L = layout
      scale = pixelScale
      const w = L.fw * scale
      const h = L.fh * scale
      layers = { forest: paintForest(w, h, L.small), craft: paintCraft(w, h), cinema: paintCinema(w, h) }
      // A sprocket hole with projector light shining through it
      const hw = Math.max(4, L.pitch ? (L.pitch / 4) * 0.42 * scale : L.fw * 0.1 * scale)
      const hh = L.band * 0.42 * scale
      hole = layer(hw + 8, hh + 8)
      const hc = hole.getContext('2d')
      hc.shadowColor = 'rgba(255,236,200,.7)'
      hc.shadowBlur = 6
      hc.fillStyle = 'rgba(255,246,226,.92)'
      roundRect(hc, 4, 4, hw, hh, Math.min(hw, hh) * 0.25)
      hc.fill()
    },

    // `p` strip progress; `t` seconds. Returns the frame rects so the text
    // overlays can follow.
    draw(p, t, titleFont) {
      if (!L) return []
      const W = canvas.width / scale
      const H = canvas.height / scale
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.clearRect(0, 0, W, H)
      // Held up to the light: a warm glow behind the film
      const glow = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.7)
      glow.addColorStop(0, '#3b2a18')
      glow.addColorStop(1, '#0b0705')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const rects = frameRects(L, W, p)
      const bands = L.column ? rects.map((r) => r.y) : [rects[0].y]
      for (const y of bands) {
        const x0 = L.column ? rects[0].x - L.gap : 0
        const x1 = L.column ? rects[0].x + L.fw + L.gap : W
        ctx.fillStyle = FILM_BASE
        ctx.fillRect(x0, y - L.band, x1 - x0, L.fh + L.band * 2)
        // Sprocket holes, four to a frame, moving with the film
        const spacing = L.column ? L.fw / 4 : L.pitch / 4
        const start = L.column ? x0 + spacing / 2 : (((rects[0].x % spacing) + spacing) % spacing) - spacing
        for (let x = start; x < x1; x += spacing) {
          for (const hy of [y - L.band * 0.72, y + L.fh + L.band * 0.28]) {
            ctx.drawImage(hole, x - 4 / scale, hy - 4 / scale, hole.width / scale, hole.height / scale)
          }
        }
        // Long scratches running along the film
        ctx.strokeStyle = 'rgba(255,240,215,.08)'
        ctx.lineWidth = 1
        for (const f of [0.18, 0.47, 0.83]) {
          ctx.beginPath()
          ctx.moveTo(x0, y + L.fh * f)
          ctx.lineTo(x1, y + L.fh * f + 1)
          ctx.stroke()
        }
      }

      const crossing = clamp01((p - 0.55) / 0.25)
      const beam = clamp01((p - 0.78) / 0.14)
      const screenLit = clamp01((p - 0.9) / 0.08)
      const still = L.still
      const painters = [
        (w, h) => drawForest(ctx, layers.forest, w, h, t, L.small),
        (w, h) => drawCraft(ctx, layers.craft, w, h, t, still ? 1 : crossing),
        (w, h) => drawCinema(ctx, layers.cinema, w, h, t, still ? 1 : beam, still ? 1 : screenLit, titleFont),
      ]
      rects.forEach((r, i) => {
        if (r.x > W || r.x + r.w < 0 || r.y > H || r.y + r.h < 0) return
        ctx.save()
        roundRect(ctx, r.x, r.y, r.w, r.h, r.h * 0.045)
        ctx.clip()
        ctx.translate(r.x, r.y)
        painters[i](r.w, r.h)
        ctx.restore()
        // Edge code in the margin, like the numbers printed on film stock
        ctx.fillStyle = 'rgba(233,196,74,.8)'
        ctx.font = titleFont(Math.max(8, Math.round(L.band * 0.26)), 'Baloo Tamma 2 Variable')
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        ctx.fillText(`ಪರ್ವ ೨೬  ▸ ${'೧೨೩'[i]}`, r.x + L.fw * 0.04, r.y + L.fh + L.band * 0.72)
      })

      // The smoke leaves frame 2, crosses the gap, and becomes frame 3's beam.
      const smoke = still ? 1 : crossing
      if (smoke > 0 && !L.column) {
        const a = rects[1]
        const b = rects[2]
        const from = { x: a.x + a.w * (INCENSE.x - 0.01), y: a.y + a.h * INCENSE.tip }
        const to = { x: b.x + b.w * BEAM_APEX.x, y: b.y + b.h * BEAM_APEX.y }
        const c1 = { x: from.x + a.w * 0.02, y: from.y - a.h * 0.35 }
        const c2 = { x: to.x - a.w * 0.22, y: to.y - a.h * 0.02 }
        const straight = still ? 1 : beam
        const n = 48
        const upto = Math.floor(n * smoke)
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        for (const [width, alpha] of [
          [a.h * 0.02, 0.1],
          [a.h * 0.006, 0.42],
        ]) {
          ctx.lineWidth = width
          ctx.strokeStyle = `rgba(236,228,210,${(alpha * (1 - straight * 0.45)).toFixed(3)})`
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          for (let k = 1; k <= upto; k++) {
            const u = k / n
            const iu = 1 - u
            const x = iu * iu * iu * from.x + 3 * iu * iu * u * c1.x + 3 * iu * u * u * c2.x + u * u * u * to.x
            const y = iu * iu * iu * from.y + 3 * iu * iu * u * c1.y + 3 * iu * u * u * c2.y + u * u * u * to.y
            const wiggle = (1 - straight) * Math.sin(u * 14 - t * 1.4) * a.h * 0.014 * Math.sin(u * Math.PI)
            ctx.lineTo(x + wiggle, y + wiggle * 0.4)
          }
          ctx.stroke()
        }
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      return rects
    },
  }
}
