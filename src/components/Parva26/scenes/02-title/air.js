// The air of the hall (brief, Scene 1): the projector beam coming from the
// booth above and behind you and widening onto the screen, sandalwood smoke
// curling slowly in it, dust sparkling where it crosses the light and moving
// away from the cursor, and two ceiling fans whose blades cut moving shadows
// through the beam. All of it is one canvas, painted on the film layer's tick.

const TAU = Math.PI * 2
const WARM = '255,228,184'
const FAN_TURNS_PER_SECOND = 0.28

const rand = (min, max) => min + Math.random() * (max - min)

// A soft, lumpy puff: a few overlapping radial blobs.
function makeSmokeSprite(size) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  for (let i = 0; i < 7; i++) {
    const x = size * rand(0.3, 0.7)
    const y = size * rand(0.3, 0.7)
    const r = size * rand(0.18, 0.34)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${WARM},.55)`)
    g.addColorStop(1, `rgba(${WARM},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }
  return c
}

export function createAir(canvas) {
  const ctx = canvas.getContext('2d')
  const sprite = makeSmokeSprite(128)
  const smoke = Array.from({ length: 10 }, (_, i) => ({
    u: Math.random(),
    v: Math.random(),
    size: rand(0.18, 0.34),
    spin: rand(-0.05, 0.05),
    turn: rand(0, TAU),
    sway: rand(0, TAU),
    rise: rand(0.004, 0.009),
    alpha: rand(0.1, 0.2),
    i,
  }))
  const dust = Array.from({ length: 110 }, () => ({
    u: Math.random(),
    v: Math.random(),
    phase: rand(0, TAU),
    rate: rand(0.8, 2.2),
    size: rand(0.5, 1.3),
    drift: rand(-0.004, 0.004),
    fall: rand(-0.003, 0.004),
    ox: 0,
    oy: 0,
  }))
  let last = 0

  return {
    // `screen` is the screen's rect in canvas pixels; `pointer` the cursor in
    // canvas pixels or null; `fansInView` false on phones, where only the
    // blades' shadows cross the beam.
    draw(t, { screen, pointer, fansInView }) {
      const W = canvas.width
      const H = canvas.height
      const dt = last ? Math.min(t - last, 0.25) : 0
      last = t
      ctx.clearRect(0, 0, W, H)
      if (!screen) return

      // The beam's apex is far above and behind you; its sides run through
      // the screen's top corners, spread a little, down to its foot.
      const apex = { x: screen.x + screen.w / 2, y: -H * 0.55 }
      const spread = 1.05
      const edge = (cornerX, y) => apex.x + (cornerX - apex.x) * spread * ((y - apex.y) / (screen.y - apex.y))
      const foot = screen.y + screen.h
      const beam = new Path2D()
      beam.moveTo(apex.x, apex.y)
      beam.lineTo(edge(screen.x, foot), foot)
      beam.lineTo(edge(screen.x + screen.w, foot), foot)
      beam.closePath()
      const across = (u, y) => {
        const l = edge(screen.x, y)
        return l + u * (edge(screen.x + screen.w, y) - l)
      }

      ctx.save()
      ctx.clip(beam)
      ctx.globalCompositeOperation = 'lighter'

      const haze = ctx.createLinearGradient(0, 0, 0, foot)
      haze.addColorStop(0, `rgba(${WARM},.13)`)
      haze.addColorStop(Math.max(0.01, screen.y / foot), `rgba(${WARM},.06)`)
      haze.addColorStop(1, `rgba(${WARM},.03)`)
      ctx.fillStyle = haze
      ctx.fillRect(0, 0, W, foot)

      // Streaks along the beam, each slowly brightening and fading.
      for (let i = 0; i < 9; i++) {
        const u = (i + 0.5) / 9 + 0.02 * Math.sin(t * 0.07 + i * 3)
        const a = 0.025 + 0.03 * (0.5 + 0.5 * Math.sin(t * 0.3 + i * 1.9))
        const x = across(u, foot)
        ctx.fillStyle = `rgba(${WARM},${a.toFixed(3)})`
        ctx.beginPath()
        ctx.moveTo(apex.x, apex.y)
        ctx.lineTo(x - W * 0.008, foot)
        ctx.lineTo(x + W * 0.008, foot)
        ctx.closePath()
        ctx.fill()
      }

      // Smoke rising and curling, lit only where the beam is.
      for (const s of smoke) {
        s.v -= s.rise * dt
        s.turn += s.spin * dt * 6
        if (s.v < -0.2) {
          s.v = 1.1
          s.u = Math.random()
        }
        const y = s.v * foot
        const x = across(s.u + 0.04 * Math.sin(t * 0.09 + s.sway), y)
        const r = s.size * H
        ctx.globalAlpha = s.alpha
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(s.turn)
        ctx.drawImage(sprite, -r, -r * 0.7, r * 2, r * 1.4)
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // Dust: sparkles drifting in the light, pushed away by the cursor.
      for (const d of dust) {
        d.u = (d.u + d.drift * dt + 1) % 1
        d.v += d.fall * dt
        if (d.v > 1) d.v -= 1
        if (d.v < 0) d.v += 1
        let x = across(d.u, d.v * foot) + d.ox
        let y = d.v * foot + d.oy
        if (pointer) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const dist = Math.hypot(dx, dy)
          const reach = H * 0.12
          if (dist < reach && dist > 0.01) {
            const push = ((reach - dist) / reach) * H * 0.02
            d.ox += (dx / dist) * push
            d.oy += (dy / dist) * push
          }
        }
        d.ox *= 0.9
        d.oy *= 0.9
        x = across(d.u, d.v * foot) + d.ox
        y = d.v * foot + d.oy
        const twinkle = Math.sin(t * d.rate + d.phase)
        ctx.fillStyle = `rgba(255,246,222,${(0.25 + 0.55 * twinkle * twinkle).toFixed(3)})`
        ctx.fillRect(x, y, d.size * (W / 900 + 0.6), d.size * (W / 900 + 0.6))
      }

      // Fan blades throw moving shadows down the beam, away from the booth.
      const fans = [
        { x: W * 0.31, y: fansInView ? H * 0.035 : -H * 0.06 },
        { x: W * 0.69, y: fansInView ? H * 0.035 : -H * 0.06 },
      ]
      const blade = W * (fansInView ? 0.07 : 0.16)
      const angle0 = t * TAU * FAN_TURNS_PER_SECOND
      ctx.globalCompositeOperation = 'destination-out'
      for (const [n, fan] of fans.entries()) {
        const len = Math.hypot(fan.x - apex.x, fan.y - apex.y)
        const dir = { x: (fan.x - apex.x) / len, y: (fan.y - apex.y) / len }
        const throwLen = H * 0.5
        for (let b = 0; b < 3; b++) {
          const a = angle0 * (n ? -1 : 1) + (b * TAU) / 3 + n
          const tip = { x: fan.x + Math.cos(a) * blade, y: fan.y + Math.sin(a) * blade * 0.3 }
          const w = blade * 0.09
          ctx.fillStyle = 'rgba(0,0,0,.32)'
          ctx.beginPath()
          ctx.moveTo(fan.x - w, fan.y)
          ctx.lineTo(tip.x - w, tip.y)
          ctx.lineTo(tip.x - w + dir.x * throwLen, tip.y + dir.y * throwLen)
          ctx.lineTo(fan.x + w + dir.x * throwLen, fan.y + dir.y * throwLen)
          ctx.lineTo(fan.x + w, fan.y)
          ctx.closePath()
          ctx.fill()
        }
      }
      ctx.restore()

      if (!fansInView) return
      // The fans themselves, dark against the lit haze, with a faint gold edge.
      for (const [n, fan] of fans.entries()) {
        ctx.strokeStyle = '#140d08'
        ctx.lineWidth = Math.max(1, W * 0.002)
        ctx.beginPath()
        ctx.moveTo(fan.x, 0)
        ctx.lineTo(fan.x, fan.y)
        ctx.stroke()
        for (let b = 0; b < 3; b++) {
          const a = angle0 * (n ? -1 : 1) + (b * TAU) / 3 + n
          ctx.save()
          ctx.translate(fan.x, fan.y)
          ctx.scale(1, 0.3)
          ctx.rotate(a)
          ctx.fillStyle = '#150e09'
          ctx.strokeStyle = 'rgba(255,214,160,.28)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.ellipse(blade * 0.55, 0, blade * 0.47, blade * 0.1, 0, 0, TAU)
          ctx.fill()
          ctx.stroke()
          ctx.restore()
        }
        ctx.fillStyle = '#2a1c12'
        ctx.beginPath()
        ctx.ellipse(fan.x, fan.y, blade * 0.12, blade * 0.07, 0, 0, TAU)
        ctx.fill()
      }
    },
  }
}
