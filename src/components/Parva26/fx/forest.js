// The title film's background (brief, Scene 2): a sandalwood forest in the
// Western Ghats at golden hour, painted flat with soft gradients like a
// hand-painted film banner. Four layers (far hills in mist, middle hills,
// sandalwood trees, grass) pan sideways at different speeds under sun rays
// and a few crossing birds.
//
// Each layer is painted once into an offscreen canvas whose content repeats
// exactly every `period` pixels, so a frame is a handful of drawImage calls
// plus the rays and birds. The layout is seeded, so it is the same forest on
// every visit.

const TAU = Math.PI * 2
const SEED = 1973 // the year of Gandhada Gudi

// Pan speeds in pixels per second for a 1000px-wide screen.
const SPEED = { far: 1.2, mid: 3, trees: 7, grass: 13 }

const SUN = { x: 0.76, y: 0.5 }

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A ridge line that repeats exactly every `period` pixels: sine waves whose
// wavelengths divide the period.
function ridge(rand, period, waves) {
  const parts = waves.map(([k, amp]) => ({ k, amp, phase: rand() * TAU }))
  return (x) => parts.reduce((y, p) => y + p.amp * Math.sin((TAU * p.k * x) / period + p.phase), 0)
}

function layerCanvas(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function fillRidge(ctx, period, height, yAt, fill) {
  ctx.beginPath()
  ctx.moveTo(0, height)
  for (let x = 0; x <= period; x += 4) ctx.lineTo(x, yAt(x))
  ctx.lineTo(period, height)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
}

function strokeRidge(ctx, period, yAt, stroke, width) {
  ctx.beginPath()
  for (let x = 0; x <= period; x += 4) ctx.lineTo(x, yAt(x))
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.stroke()
}

function vertical(ctx, stops, y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1)
  for (const [at, color] of stops) g.addColorStop(at, color)
  return g
}

function paintSky(w, h) {
  const canvas = layerCanvas(w, h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = vertical(ctx, [[0, '#3f6275'], [0.3, '#8a8296'], [0.5, '#d49a74'], [0.64, '#f1bd6c'], [0.8, '#f6d593']], 0, h)
  ctx.fillRect(0, 0, w, h)

  const sx = SUN.x * w
  const sy = SUN.y * h
  const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.75)
  glow.addColorStop(0, 'rgba(255,240,200,.95)')
  glow.addColorStop(0.12, 'rgba(255,221,150,.55)')
  glow.addColorStop(0.45, 'rgba(250,190,120,.18)')
  glow.addColorStop(1, 'rgba(250,190,120,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // Long painted cloud streaks, lit gold from below.
  const rand = seeded(SEED + 1)
  for (let i = 0; i < 5; i++) {
    const cx = rand() * w
    const cy = h * (0.12 + rand() * 0.22)
    const rx = w * (0.12 + rand() * 0.14)
    const ry = h * (0.008 + rand() * 0.01)
    ctx.fillStyle = 'rgba(214,150,140,.35)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry * 1.6, 0, 0, TAU)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,214,160,.4)'
    ctx.beginPath()
    ctx.ellipse(cx + rx * 0.08, cy + ry, rx * 0.8, ry * 0.7, 0, 0, TAU)
    ctx.fill()
  }

  const disc = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.055)
  disc.addColorStop(0, '#fffbe8')
  disc.addColorStop(0.75, '#fff0c4')
  disc.addColorStop(1, 'rgba(255,236,190,0)')
  ctx.fillStyle = disc
  ctx.beginPath()
  ctx.arc(sx, sy, h * 0.055, 0, TAU)
  ctx.fill()
  return canvas
}

function paintFarHills(period, h, rand) {
  const canvas = layerCanvas(period, h)
  const ctx = canvas.getContext('2d')
  const top = ridge(rand, period, [[2, 0.045 * h], [5, 0.022 * h], [11, 0.008 * h]])
  const yAt = (x) => 0.6 * h + top(x)
  fillRidge(ctx, period, h, yAt, vertical(ctx, [[0, '#9b8fb0'], [0.5, '#c7a3a4']], 0.52 * h, 0.8 * h))
  strokeRidge(ctx, period, yAt, 'rgba(255,226,180,.35)', Math.max(1, h * 0.003))
  // Mist gathering in the valley
  ctx.fillStyle = vertical(ctx, [[0, 'rgba(246,214,160,0)'], [1, 'rgba(246,214,160,.85)']], 0.62 * h, 0.76 * h)
  ctx.fillRect(0, 0.62 * h, period, h)
  return canvas
}

function paintMidHills(period, h, rand) {
  const canvas = layerCanvas(period, h)
  const ctx = canvas.getContext('2d')
  const top = ridge(rand, period, [[3, 0.05 * h], [7, 0.02 * h], [15, 0.006 * h]])
  const yAt = (x) => 0.71 * h + top(x)
  fillRidge(ctx, period, h, yAt, vertical(ctx, [[0, '#5a6477'], [1, '#434a5c']], 0.64 * h, 0.9 * h))
  strokeRidge(ctx, period, yAt, 'rgba(255,208,140,.55)', Math.max(1, h * 0.004))
  ctx.fillStyle = vertical(ctx, [[0, 'rgba(240,196,146,0)'], [1, 'rgba(240,196,146,.7)']], 0.74 * h, 0.87 * h)
  ctx.fillRect(0, 0.74 * h, period, h)
  return canvas
}

// Sandalwood: a slender dark trunk that forks, under a rounded crown of small
// leaves. Leaves on the sun side pick up gold.
function paintTree(ctx, x, baseY, h, rand) {
  const height = h * (0.2 + rand() * 0.18)
  const lean = (rand() - 0.5) * height * 0.12
  const trunkW = height * 0.035
  const forkY = baseY - height * 0.5
  const forkX = x + lean * 0.5

  ctx.strokeStyle = '#24170e'
  ctx.lineCap = 'round'
  ctx.lineWidth = trunkW
  ctx.beginPath()
  ctx.moveTo(x, baseY + 2)
  ctx.quadraticCurveTo(x + lean * 0.2, baseY - height * 0.3, forkX, forkY)
  ctx.stroke()

  const limbs = 2 + Math.floor(rand() * 2)
  const clusters = []
  for (let i = 0; i < limbs; i++) {
    const spread = (i / (limbs - 1) - 0.5) * height * 0.34 + (rand() - 0.5) * height * 0.06
    const endX = forkX + spread + lean * 0.5
    const endY = forkY - height * (0.2 + rand() * 0.12)
    ctx.lineWidth = trunkW * 0.55
    ctx.beginPath()
    ctx.moveTo(forkX, forkY)
    ctx.quadraticCurveTo(forkX + spread * 0.3, forkY - height * 0.12, endX, endY)
    ctx.stroke()
    clusters.push({ x: endX, y: endY, r: height * (0.18 + rand() * 0.07) })
  }
  // The crown is an oval of overlapping clumps over the fork.
  clusters.push({ x: forkX + lean * 0.8, y: forkY - height * 0.38, r: height * 0.24 })
  clusters.push({ x: forkX + lean * 0.6 + height * 0.1, y: forkY - height * 0.24, r: height * 0.17 })
  clusters.push({ x: forkX + lean * 0.6 - height * 0.1, y: forkY - height * 0.26, r: height * 0.17 })

  const leaf = Math.max(1.4, h * 0.0075)
  for (const c of clusters) {
    const count = Math.round((c.r * c.r) / (leaf * leaf * 0.45))
    for (let i = 0; i < count; i++) {
      const a = rand() * TAU
      const d = Math.sqrt(rand()) * c.r
      const lx = c.x + Math.cos(a) * d
      const ly = c.y + Math.sin(a) * d * 0.72
      // How much this leaf faces the sun (up and to the right)
      const lit = Math.cos(a + 0.6) * (d / c.r)
      ctx.fillStyle = lit > 0.55 ? (rand() < 0.5 ? '#9b8238' : '#b3913e') : ['#27331c', '#2f3d22', '#34432a', '#223018'][Math.floor(rand() * 4)]
      ctx.beginPath()
      ctx.ellipse(lx, ly, leaf, leaf * 0.5, rand() * Math.PI, 0, TAU)
      ctx.fill()
    }
  }
}

function paintTrees(period, h, rand) {
  const canvas = layerCanvas(period, h)
  const ctx = canvas.getContext('2d')
  const bank = ridge(rand, period, [[4, 0.018 * h], [9, 0.007 * h]])
  const yAt = (x) => 0.86 * h + bank(x)

  // A dense treeline of rounded crowns behind, so it reads as forest.
  const line = ridge(rand, period, [[5, 0.012 * h], [13, 0.006 * h]])
  for (let x = 0; x < period; x += h * (0.018 + rand() * 0.02)) {
    const r = h * (0.025 + rand() * 0.03)
    const y = 0.83 * h + line(x) - r * 0.6
    const fill = rand() < 0.5 ? '#26352a' : '#2c3b2c'
    for (const cx of [x, x - period, x + period]) {
      if (cx < -r || cx > period + r) continue
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.arc(cx, y, r, 0, TAU)
      ctx.fill()
      // Sunlit rim on the upper right of each crown
      ctx.fillStyle = 'rgba(220,170,90,.28)'
      ctx.beginPath()
      ctx.arc(cx + r * 0.25, y - r * 0.25, r * 0.7, -Math.PI * 0.85, -Math.PI * 0.15)
      ctx.arc(cx + r * 0.2, y - r * 0.05, r * 0.72, -Math.PI * 0.15, -Math.PI * 0.85, true)
      ctx.fill()
    }
  }
  fillRidge(ctx, period, h, yAt, vertical(ctx, [[0, '#343a24'], [1, '#1c2014']], 0.82 * h, h))
  strokeRidge(ctx, period, yAt, 'rgba(230,180,100,.45)', Math.max(1, h * 0.004))

  const spacing = h * 0.26
  const count = Math.floor(period / spacing)
  for (let i = 0; i < count; i++) {
    const x = (i + 0.2 + rand() * 0.6) * (period / count)
    const treeSeed = Math.floor(rand() * 1e9)
    // Trees near an edge are painted again one period over, so the wrap is seamless.
    for (const shift of [0, -period, period]) {
      const tx = x + shift
      if (tx < -spacing || tx > period + spacing) continue
      paintTree(ctx, tx, yAt(x) + h * 0.01, h, seeded(treeSeed))
    }
  }
  return canvas
}

function paintGrass(period, h, rand) {
  const canvas = layerCanvas(period, h)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = vertical(ctx, [[0, 'rgba(22,26,14,0)'], [0.4, '#181c10'], [1, '#12150b']], 0.9 * h, h)
  ctx.fillRect(0, 0.9 * h, period, h)

  const blades = Math.floor(period / Math.max(2, h * 0.008))
  for (let i = 0; i < blades; i++) {
    const x = rand() * period
    const tall = h * (0.03 + rand() * rand() * 0.12)
    const bend = (rand() - 0.35) * tall * 0.6
    const width = Math.max(1, h * (0.003 + rand() * 0.004))
    const color = rand() < 0.22 ? '#a0843c' : rand() < 0.5 ? '#232a15' : '#171b0e'
    for (const shift of [0, -period, period]) {
      const bx = x + shift
      if (bx < -tall || bx > period + tall) continue
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(bx - width, h)
      ctx.quadraticCurveTo(bx, h - tall * 0.6, bx + bend, h - tall)
      ctx.quadraticCurveTo(bx + width * 0.3, h - tall * 0.5, bx + width, h)
      ctx.fill()
    }
  }
  return canvas
}

function drawPanned(ctx, layer, offset, width) {
  const x = -(offset % layer.width)
  ctx.drawImage(layer, x, 0)
  if (x + layer.width < width) ctx.drawImage(layer, x + layer.width, 0)
}

function drawRays(ctx, w, h, t) {
  const sx = SUN.x * w
  const sy = SUN.y * h
  const len = w * 1.2
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, len)
  g.addColorStop(0, 'rgba(255,226,160,.13)')
  g.addColorStop(0.45, 'rgba(255,214,150,.035)')
  g.addColorStop(1, 'rgba(255,214,150,0)')
  ctx.fillStyle = g
  const rays = [1.75, 2.05, 2.35, 2.62, 2.9, 3.12]
  rays.forEach((angle, i) => {
    const a = angle + 0.025 * Math.sin(t * 0.13 + i * 1.7)
    const spread = 0.03 + 0.015 * Math.sin(t * 0.21 + i)
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + Math.cos(a - spread) * len, sy + Math.sin(a - spread) * len)
    ctx.lineTo(sx + Math.cos(a + spread) * len, sy + Math.sin(a + spread) * len)
    ctx.closePath()
    ctx.fill()
  })
  ctx.restore()
}

// A small flock crosses every 30 seconds.
function drawBirds(ctx, w, h, t) {
  const cycle = 30
  const cross = 20
  const phase = (t + 6) % cycle
  if (phase > cross) return
  const progress = phase / cross
  const s = h * 0.012
  ctx.strokeStyle = '#2b2226'
  ctx.lineWidth = Math.max(1, s * 0.22)
  ctx.lineCap = 'round'
  ;[
    [0, 0, 0],
    [-3.2, 1.6, 1.3],
    [-5.8, -1.2, 2.1],
    [-8, 2.4, 0.7],
  ].forEach(([dx, dy, beat]) => {
    const x = -w * 0.1 + progress * w * 1.2 + dx * s * 2
    const y = h * 0.26 + dy * s + Math.sin(progress * 9 + beat) * s * 0.6
    const flap = Math.sin(t * 7 + beat * 2) * s * 0.7
    ctx.beginPath()
    ctx.moveTo(x - s, y - flap)
    ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.3, x, y)
    ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.3, x + s, y - flap)
    ctx.stroke()
  })
}

// Paints onto `canvas` (already sized in device pixels). Call draw(seconds)
// for each frame.
export function createForest(canvas) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')
  const period = Math.ceil(w * 1.5)
  const rand = seeded(SEED)
  const sky = paintSky(w, h)
  const far = paintFarHills(period, h, rand)
  const mid = paintMidHills(period, h, rand)
  const trees = paintTrees(period, h, rand)
  const grass = paintGrass(period, h, rand)
  const scale = w / 1000

  return {
    draw(t) {
      ctx.drawImage(sky, 0, 0)
      drawBirds(ctx, w, h, t)
      drawPanned(ctx, far, t * SPEED.far * scale, w)
      drawPanned(ctx, mid, t * SPEED.mid * scale, w)
      drawRays(ctx, w, h, t)
      drawPanned(ctx, trees, t * SPEED.trees * scale, w)
      drawPanned(ctx, grass, t * SPEED.grass * scale, w)
    },
  }
}
