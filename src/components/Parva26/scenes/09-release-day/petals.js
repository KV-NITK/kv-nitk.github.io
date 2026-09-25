// Flowers thrown at the Parva Hero (Scene 9): marigold, rose and jasmine
// petals, puffs of arishina and kumkuma, and fireworks, all on one canvas.
// It animates only while something is in the air and stops when the sky is
// empty. Petals that come down are stamped once onto a second canvas (the
// pile on the base board and the street) and never redrawn.

const GRAVITY = 1500
const FALL_SPEED = 150

const rand = (min, max) => min + Math.random() * (max - min)
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Petal sprites, drawn once: two or three shapes per flower.
function makeSprites() {
  const sprite = (w, h, draw) => {
    const c = document.createElement('canvas')
    c.width = w * 2
    c.height = h * 2
    const ctx = c.getContext('2d')
    ctx.scale(2, 2)
    draw(ctx)
    return c
  }
  const blob = (ctx, color, edge, w, h, lobes) => {
    ctx.beginPath()
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const r = 1 + Math.sin(a * lobes) * 0.12
      const x = w / 2 + Math.cos(a) * (w / 2 - 1) * r
      const y = h / 2 + Math.sin(a) * (h / 2 - 1) * r
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = edge
    ctx.lineWidth = 0.8
    ctx.stroke()
  }
  const marigold = (color) =>
    sprite(12, 10, (ctx) => {
      blob(ctx, color, 'rgba(120,50,0,.6)', 12, 10, 5)
      ctx.fillStyle = 'rgba(255,240,180,.5)'
      ctx.beginPath()
      ctx.ellipse(5, 4, 2.4, 1.6, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  const rose = (color) =>
    sprite(12, 12, (ctx) => {
      ctx.beginPath()
      ctx.moveTo(6, 11)
      ctx.bezierCurveTo(-1, 6, 1, 0, 6, 3)
      ctx.bezierCurveTo(11, 0, 13, 6, 6, 11)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = 'rgba(70,0,10,.5)'
      ctx.lineWidth = 0.8
      ctx.stroke()
    })
  const jasmine = sprite(12, 12, (ctx) => {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.ellipse(6 + Math.cos(a) * 3, 6 + Math.sin(a) * 3, 2.6, 1.5, a, 0, Math.PI * 2)
      ctx.fillStyle = '#fbf8ef'
      ctx.fill()
      ctx.strokeStyle = 'rgba(120,130,90,.5)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
    ctx.fillStyle = '#e8d88a'
    ctx.beginPath()
    ctx.arc(6, 6, 1.2, 0, Math.PI * 2)
    ctx.fill()
  })
  const puff = (rgb) =>
    sprite(32, 32, (ctx) => {
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      g.addColorStop(0, `rgba(${rgb},.75)`)
      g.addColorStop(0.5, `rgba(${rgb},.3)`)
      g.addColorStop(1, `rgba(${rgb},0)`)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 32, 32)
    })
  return {
    petals: [marigold('#f08a1c'), marigold('#f7c21e'), marigold('#e86a10'), rose('#c8102e'), rose('#a80c26'), jasmine],
    // Marigold is most of a real handful; roses and jasmine are the accents.
    weights: [0.28, 0.24, 0.16, 0.12, 0.08, 0.12],
    puffs: [puff('242,193,46'), puff('200,16,46')],
  }
}

export function createPetalThrower(canvas, pileCanvas, { max = 150 } = {}) {
  const ctx = canvas.getContext('2d')
  const pile = pileCanvas.getContext('2d')
  const sprites = makeSprites()
  let W = 0
  let H = 0
  let ground = () => H - 10
  let items = []
  let raf = 0
  let last = 0

  const petalSprite = () => {
    let r = Math.random()
    for (let i = 0; i < sprites.weights.length; i++) {
      r -= sprites.weights[i]
      if (r <= 0) return sprites.petals[i]
    }
    return sprites.petals[0]
  }

  function resize(w, h, scale) {
    W = w
    H = h
    for (const [c, context] of [
      [canvas, ctx],
      [pileCanvas, pile],
    ]) {
      c.width = Math.round(w * scale)
      c.height = Math.round(h * scale)
      context.setTransform(scale, 0, 0, scale, 0, 0)
    }
  }

  // Where a falling petal comes to rest, for a given x.
  function setGround(fn) {
    ground = fn
  }

  function stamp(p) {
    pile.save()
    pile.translate(p.x, p.y)
    pile.rotate(p.rot)
    pile.globalAlpha = 0.95
    pile.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size * (p.sprite.height / p.sprite.width))
    pile.restore()
  }

  // A handful thrown from the bottom of the screen at (tx, ty).
  function throwAt(tx, ty, count = 7) {
    const from = Math.min(W - 20, Math.max(20, tx + rand(-0.25, 0.25) * W))
    for (let i = 0; i < count; i++) {
      const t = rand(0.5, 0.75)
      const x0 = from + rand(-30, 30)
      const y0 = H + 20
      const aimX = tx + rand(-40, 40)
      const aimY = ty + rand(-30, 30)
      items.push({
        kind: 'petal',
        sprite: petalSprite(),
        size: rand(11, 17),
        x: x0,
        y: y0,
        vx: (aimX - x0) / t,
        vy: (aimY - y0 - 0.5 * GRAVITY * t * t) / t,
        rot: rand(0, Math.PI * 2),
        spin: rand(-8, 8),
        hitAt: t,
        age: 0,
        wobble: rand(2, 4),
        phase: rand(0, Math.PI * 2),
        falling: false,
      })
    }
    items.push({ kind: 'puffAt', x: tx, y: ty, at: 0.55, age: 0 })
    trim()
    start()
  }

  function puff(x, y) {
    for (let i = 0; i < 9; i++) {
      items.push({
        kind: 'puff',
        sprite: sprites.puffs[i % 2],
        x: x + rand(-14, 14),
        y: y + rand(-10, 10),
        vx: rand(-50, 50),
        vy: rand(-60, 10),
        size: rand(26, 48),
        grow: rand(30, 60),
        life: rand(1.2, 1.9),
        age: 0,
      })
    }
  }

  function fireworks(x, y) {
    const colors = ['#f2c12e', '#fff4dc', '#c8102e', '#7ad17a', '#ffb347']
    const color = pick(colors)
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2
      const speed = rand(180, 320)
      items.push({ kind: 'spark', color: Math.random() < 0.2 ? '#fff4dc' : color, x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(1.1, 1.6), age: 0 })
    }
    start()
  }

  // Reduced motion: petals simply appear on the pile.
  function drop(count = 5) {
    for (let i = 0; i < count; i++) {
      const x = rand(0.2, 0.8) * W
      stamp({ x, y: ground(x), rot: rand(0, Math.PI * 2), sprite: petalSprite(), size: rand(11, 16) })
    }
  }

  // Keep at most `max` petals in the air; the oldest simply land where
  // they are.
  function trim() {
    const petals = items.filter((p) => p.kind === 'petal')
    for (let i = 0; i < petals.length - max; i++) petals[i].gone = true
  }

  function start() {
    if (raf) return
    last = performance.now()
    raf = requestAnimationFrame(step)
  }

  function step(now) {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    ctx.clearRect(0, 0, W, H)
    const next = []
    for (const p of items) {
      p.age += dt
      if (p.gone) continue
      if (p.kind === 'puffAt') {
        if (p.age >= p.at) puff(p.x, p.y)
        else next.push(p)
        continue
      }
      if (p.kind === 'petal') {
        if (!p.falling && p.age >= p.hitAt) {
          // Hit the cutout: most of the speed goes, and it flutters down.
          p.falling = true
          p.vx *= rand(-0.15, 0.25)
          p.vy = rand(-90, 20)
        }
        if (p.falling) {
          p.vy = Math.min(FALL_SPEED, p.vy + GRAVITY * 0.35 * dt)
          p.x += p.vx * dt + Math.sin(p.age * p.wobble + p.phase) * 0.9
          p.y += p.vy * dt
          p.rot += p.spin * 0.4 * dt
          const rest = ground(p.x)
          if (p.y >= rest) {
            p.y = rest
            stamp(p)
            continue
          }
        } else {
          p.vy += GRAVITY * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.rot += p.spin * dt
        }
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size * (p.sprite.height / p.sprite.width))
        ctx.restore()
        next.push(p)
        continue
      }
      if (p.age >= p.life) continue
      const k = p.age / p.life
      if (p.kind === 'puff') {
        p.x += p.vx * dt
        p.y += (p.vy + 30 * p.age) * dt
        p.vx *= 0.97
        const size = p.size + p.grow * k
        ctx.globalAlpha = 1 - k
        ctx.drawImage(p.sprite, p.x - size / 2, p.y - size / 2, size, size)
        ctx.globalAlpha = 1
      } else if (p.kind === 'spark') {
        p.vx *= 0.985
        p.vy = p.vy * 0.985 + 120 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        ctx.globalAlpha = (1 - k) * (0.7 + Math.random() * 0.3)
        ctx.fillStyle = p.color
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)
        ctx.globalAlpha = 1
      }
      next.push(p)
    }
    items = next
    raf = items.length ? requestAnimationFrame(step) : 0
  }

  function stop() {
    cancelAnimationFrame(raf)
    raf = 0
    items = []
    ctx.clearRect(0, 0, W, H)
  }

  return { resize, setGround, throwAt, fireworks, drop, stop }
}
