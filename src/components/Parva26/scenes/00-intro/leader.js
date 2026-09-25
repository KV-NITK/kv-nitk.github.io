// The film countdown leader (brief, Scene 1): a mid-grey frame with a warm
// sepia tint, two circles and cross-hairs, a sweep hand going round once per
// number with a lighter wedge behind it, and ೫ ೪ ೩ ೨ in bold black, with
// scratches, a hair and flicker. Each number holds for STEP seconds.

export const STEP = 1.2
const NUMBERS = ['೫', '೪', '೩', '೨']
const TAU = Math.PI * 2

// Draws the frame for `t` seconds into the leader. After the last number the
// frame is simply black.
export function drawLeader(ctx, w, h, t, font) {
  const index = Math.floor(t / STEP)
  if (index >= NUMBERS.length) {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    return
  }
  const frac = (t % STEP) / STEP
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.4
  // Film flicker: the whole frame breathes a little from frame to frame.
  const flicker = 0.93 + Math.random() * 0.07

  ctx.fillStyle = `rgb(${Math.round(150 * flicker)},${Math.round(138 * flicker)},${Math.round(118 * flicker)})`
  ctx.fillRect(0, 0, w, h)

  // The sweep: already-swept area lighter, the hand dark.
  const a0 = -Math.PI / 2
  const a1 = a0 + frac * TAU
  ctx.fillStyle = 'rgba(232,220,196,.55)'
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, Math.hypot(w, h), a0, a1)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(30,24,16,.8)'
  ctx.lineWidth = Math.max(1.5, w * 0.004)
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + Math.cos(a1) * w, cy + Math.sin(a1) * w)
  ctx.stroke()

  // Cross-hairs and the two rings.
  ctx.strokeStyle = 'rgba(28,22,14,.85)'
  ctx.lineWidth = Math.max(1, w * 0.003)
  ctx.beginPath()
  ctx.moveTo(0, cy)
  ctx.lineTo(w, cy)
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, h)
  ctx.stroke()
  for (const [radius, width, color] of [
    [r, 0.012, 'rgba(248,242,228,.95)'],
    [r * 0.8, 0.006, 'rgba(248,242,228,.85)'],
  ]) {
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1.5, w * width)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, TAU)
    ctx.stroke()
  }

  // The number.
  ctx.fillStyle = '#16110b'
  ctx.font = font(Math.round(r * 1.25))
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(NUMBERS[index], cx, cy + r * 0.08)

  // Damage: a couple of scratches, specks, and a hair near the edge.
  ctx.strokeStyle = 'rgba(250,245,230,.35)'
  ctx.lineWidth = 1
  for (let i = 0; i < 2; i++) {
    const x = Math.random() * w
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + (Math.random() - 0.5) * 6, h)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(20,14,8,.6)'
  for (let i = 0; i < 4; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  ctx.strokeStyle = 'rgba(20,14,8,.55)'
  ctx.beginPath()
  ctx.moveTo(w * 0.08, h * 0.72)
  ctx.quadraticCurveTo(w * 0.12, h * 0.6, w * 0.07, h * 0.52)
  ctx.stroke()

  // Dark corners, as in a projected frame.
  const v = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, Math.hypot(w, h) / 2)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,.55)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, w, h)
}
