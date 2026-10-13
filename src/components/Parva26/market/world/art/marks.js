import { INK, makeCanvas } from './paint'

// The forecourt's guides, painted once: the arrow over a stall you haven't
// visited, a footprint for the trail to it, and the ring where a tap sent
// the walker.

// A fat arishina arrow pointing down, 84 wide and 92 tall, standing on its tip.
export function drawArrow() {
  const c = makeCanvas(84, 92)
  const g = c.getContext('2d')
  g.lineJoin = 'round'
  g.beginPath()
  g.moveTo(26, 6)
  g.lineTo(58, 6)
  g.lineTo(58, 44)
  g.lineTo(78, 44)
  g.lineTo(42, 86)
  g.lineTo(6, 44)
  g.lineTo(26, 44)
  g.closePath()
  g.fillStyle = '#f2c12e'
  g.shadowColor = 'rgba(0,0,0,.5)'
  g.shadowOffsetY = 4
  g.shadowBlur = 6
  g.fill()
  g.shadowColor = 'transparent'
  g.strokeStyle = INK
  g.lineWidth = 5
  g.stroke()
  // A highlight down the left edge
  g.strokeStyle = 'rgba(255,248,214,.8)'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(32, 12)
  g.lineTo(32, 48)
  g.stroke()
  return c
}

// A bare footprint pointing up, 28 by 44: the sole and five toes.
export function drawFootprint() {
  const c = makeCanvas(28, 44)
  const g = c.getContext('2d')
  g.fillStyle = '#f1dfc0'
  g.beginPath()
  g.ellipse(14, 28, 9, 14, 0, 0, Math.PI * 2)
  g.fill()
  for (const [x, y, r] of [[6, 9, 3.4], [11, 6, 3], [16, 5.5, 2.8], [20.5, 7, 2.5], [24, 10, 2.2]]) {
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
  return c
}

// A flat ring on the ground, 120 by 60, as if drawn in chalk.
export function drawRing() {
  const c = makeCanvas(120, 60)
  const g = c.getContext('2d')
  g.strokeStyle = 'rgba(20,10,4,.45)'
  g.lineWidth = 10
  g.beginPath()
  g.ellipse(60, 32, 50, 22, 0, 0, Math.PI * 2)
  g.stroke()
  g.strokeStyle = '#f2c12e'
  g.lineWidth = 6
  g.beginPath()
  g.ellipse(60, 30, 50, 22, 0, 0, Math.PI * 2)
  g.stroke()
  return c
}
