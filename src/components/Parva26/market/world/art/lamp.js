import { INK, makeCanvas, grain } from './paint'

// An iron lamp post with a glass lantern, 64 wide and 300 tall; it stands on
// the bottom edge. The pool of light on the ground is painted into the ground.
export function drawLamp() {
  const c = makeCanvas(64, 300)
  const g = c.getContext('2d')
  g.strokeStyle = INK
  g.lineWidth = 3
  g.lineJoin = 'round'
  // Base, shaft and bracket
  g.fillStyle = '#2e2a28'
  g.fillRect(18, 276, 28, 22)
  g.strokeRect(18, 276, 28, 22)
  g.fillStyle = '#3a3532'
  g.fillRect(28, 70, 8, 210)
  g.strokeRect(28, 70, 8, 210)
  g.fillStyle = '#4a4440'
  g.fillRect(22, 252, 20, 26)
  g.strokeRect(22, 252, 20, 26)
  // Lantern
  g.fillStyle = '#2e2a28'
  g.beginPath()
  g.moveTo(14, 26)
  g.lineTo(32, 6)
  g.lineTo(50, 26)
  g.closePath()
  g.fill()
  g.stroke()
  const glass = g.createRadialGradient(32, 46, 2, 32, 46, 26)
  glass.addColorStop(0, '#fff6cc')
  glass.addColorStop(0.55, '#ffc65a')
  glass.addColorStop(1, '#c8761c')
  g.fillStyle = glass
  g.beginPath()
  g.moveTo(16, 26)
  g.lineTo(48, 26)
  g.lineTo(44, 68)
  g.lineTo(20, 68)
  g.closePath()
  g.fill()
  g.stroke()
  g.fillStyle = '#2e2a28'
  g.fillRect(18, 66, 28, 8)
  g.strokeRect(18, 66, 28, 8)
  grain(g, 64, 300, 21, 500, 0.08)
  return c
}
