// Agarbatti smoke (brief, Scene 0): the thin curling lines rising from the
// sticks, and the smoke that gathers into letters, holds, drifts apart and
// gathers again.

const TAU = Math.PI * 2
const rand = (min, max) => min + Math.random() * (max - min)
const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)

// One soft puff, pre-drawn once and stamped for every particle.
function puff(size, rgb) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, `rgba(${rgb},.9)`)
  g.addColorStop(0.45, `rgba(${rgb},.35)`)
  g.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return c
}

// A line of smoke from each ember: it wavers more the higher it gets, and
// fades out. `scale` is canvas pixels per CSS pixel.
export function drawIncense(ctx, embers, t, scale, alpha = 1) {
  const steps = 22
  const rise = 9 * scale
  ctx.lineWidth = 1.1 * scale
  ctx.lineCap = 'round'
  embers.forEach((e, i) => {
    let px = e.x
    let py = e.y
    for (let k = 1; k <= steps; k++) {
      const x =
        e.x +
        Math.sin(k * 0.42 - t * 1.5 + i * 2.1) * k * 0.45 * scale +
        Math.sin(k * 0.17 + t * 0.6 + i) * k * 0.35 * scale
      const y = e.y - k * rise
      ctx.strokeStyle = `rgba(236,226,206,${((1 - k / steps) * 0.3 * alpha).toFixed(3)})`
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(x, y)
      ctx.stroke()
      px = x
      py = y
    }
  })
}

// Letters of smoke. Call layout() with the text box once the font has loaded,
// then draw() each frame. The cycle: gather from the embers (0–2.8 s), hold
// (to 5.8 s), drift apart (to 7.8 s), rest, repeat. dissolve() sends every
// particle drifting apart at once.
export function createSmokeLetters() {
  const cream = puff(32, '246,236,214')
  const warm = puff(32, '255,196,120')
  const CYCLE = 8.8
  let particles = []
  let size = 8
  let start = null
  let dissolveAt = null

  return {
    layout(text, font, box) {
      const c = document.createElement('canvas')
      c.width = Math.ceil(box.w)
      c.height = Math.ceil(box.h)
      const ctx = c.getContext('2d')
      ctx.font = font
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, c.width / 2, c.height / 2)
      const { data } = ctx.getImageData(0, 0, c.width, c.height)
      const step = Math.max(2, Math.round(box.h / 30))
      const points = []
      for (let y = 0; y < c.height; y += step) {
        for (let x = 0; x < c.width; x += step) {
          if (data[(y * c.width + x) * 4 + 3] > 120) points.push([x, y])
        }
      }
      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[points[i], points[j]] = [points[j], points[i]]
      }
      size = step * 2.4
      particles = points.slice(0, 1400).map(([x, y], i) => ({
        tx: box.x + x + rand(-step, step) * 0.4,
        ty: box.y + y + rand(-step, step) * 0.4,
        from: i % 3,
        delay: rand(0, 1.3),
        away: rand(0, 0.6),
        wob: rand(0, TAU),
        curl: rand(-1, 1),
        drift: rand(-1, 1),
        r: rand(0.7, 1.25),
        warm: y / c.height > 0.64,
      }))
    },

    dissolve(t) {
      if (dissolveAt === null) dissolveAt = t
    },

    // `still` draws the letters settled, for reduced motion.
    draw(ctx, t, embers, scale, still = false) {
      if (!particles.length || !embers.length) return
      if (start === null) start = t
      const cycle = (t - start) % CYCLE
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      for (const p of particles) {
        let x = p.tx
        let y = p.ty
        let a = 0.55
        if (!still) {
          const out = dissolveAt !== null ? clamp01((t - dissolveAt - p.away * 0.5) / 1.6) : clamp01((cycle - 5.8 - p.away) / 2)
          const gather = dissolveAt !== null ? 1 : clamp01((cycle - p.delay) / 1.5)
          if (gather < 1) {
            const e = embers[p.from % embers.length]
            const u = easeInOut(gather)
            // Rise first, then drift across to the letter, curling as it goes.
            x = e.x + (p.tx - e.x) * u * u + Math.sin(u * Math.PI) * p.curl * 60 * scale
            y = e.y + (p.ty - e.y) * (1 - (1 - u) * (1 - u))
            a = 0.12 + 0.43 * u
          } else if (out > 0) {
            x = p.tx + p.drift * out * 36 * scale + Math.sin(t * 1.3 + p.wob) * out * 10 * scale
            y = p.ty - out * out * 80 * scale
            a = 0.55 * (1 - out)
          } else {
            x += Math.sin(t * 1.3 + p.wob) * 0.9 * scale
            y += Math.cos(t * 1.1 + p.wob) * 0.9 * scale
          }
          if (a <= 0.01) continue
        }
        const s = size * p.r
        ctx.globalAlpha = a
        ctx.drawImage(p.warm ? warm : cream, x - s / 2, y - s / 2, s, s)
      }
      ctx.restore()
    },
  }
}
