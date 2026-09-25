// The main curtain in front of the screen (brief, Scene 1): kumkuma velvet
// in vertical folds, darker in the dips (#7A0A1C), with a gold fringe. It
// parts from the centre, each half bunching toward its side. Whatever the
// projector shows lands on the curtain where it hangs, bent across the
// folds and tinted by the velvet, and flat on the screen where it has opened.
// The same drawing closes the curtain again at the end of the show.

import { drawLeader } from '@p26/scenes/00-intro/leader'

const FOLDS = 9

// One fold, dip to ridge to dip, drawn once and stretched to each fold.
function foldTile() {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 4
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 64, 0)
  g.addColorStop(0, '#5e0816')
  g.addColorStop(0.28, '#9c0d25')
  g.addColorStop(0.45, '#d9283e')
  g.addColorStop(0.55, '#c41d34')
  g.addColorStop(0.8, '#8a0b21')
  g.addColorStop(1, '#5e0816')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 4)
  return c
}

export function createStageCurtain(canvas) {
  const ctx = canvas.getContext('2d')
  const fold = foldTile()
  const leader = document.createElement('canvas')
  const lctx = leader.getContext('2d')

  // `open` 0 (closed) to 1 (gone); `screen` is the projected area within the
  // canvas; `projector` fades the projection in; `leaderTime` runs the
  // countdown; `flash` is the white frame at ೨; `sway` stirs the folds.
  return {
    draw({ open, screen, projector = 0, leaderTime = 0, flash = 0, t = 0, font }) {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      const half = (W / 2) * (1 - open)
      const panels = [
        { from: 0, to: half, side: -1 },
        { from: W - half, to: W, side: 1 },
      ]

      // The part of the screen the curtain no longer covers shows the frame flat.
      const lit = projector > 0 && screen
      if (lit) {
        leader.width = Math.max(1, Math.round(screen.w))
        leader.height = Math.max(1, Math.round(screen.h))
        drawLeader(lctx, leader.width, leader.height, leaderTime, font)
        const x0 = Math.max(screen.x, half)
        const x1 = Math.min(screen.x + screen.w, W - half)
        if (x1 > x0) {
          ctx.globalAlpha = projector
          ctx.drawImage(leader, x0 - screen.x, 0, x1 - x0, screen.h, x0, screen.y, x1 - x0, screen.h)
          ctx.globalAlpha = 1
        }
      }

      for (const p of panels) {
        const width = p.to - p.from
        if (width < 1) continue
        const fw = width / FOLDS
        // Folds bunch up as the panel draws aside; the fan's draught stirs them.
        for (let i = 0; i < FOLDS; i++) {
          const sway = Math.sin(t * 0.7 + i * 1.3) * fw * 0.04
          ctx.drawImage(fold, p.from + i * fw + sway, 0, fw + 1, H)
        }
        // Top shadow, footlight glow at the hem, and a shadowed leading edge.
        const v = ctx.createLinearGradient(0, 0, 0, H)
        v.addColorStop(0, 'rgba(0,0,0,.45)')
        v.addColorStop(0.3, 'rgba(0,0,0,0)')
        v.addColorStop(0.82, 'rgba(0,0,0,0)')
        v.addColorStop(1, 'rgba(255,170,90,.22)')
        ctx.fillStyle = v
        ctx.fillRect(p.from, 0, width, H)
        const edge = p.side < 0 ? p.to : p.from
        const e = ctx.createLinearGradient(edge - 10 * p.side, 0, edge, 0)
        e.addColorStop(0, 'rgba(0,0,0,0)')
        e.addColorStop(1, 'rgba(0,0,0,.45)')
        ctx.fillStyle = e
        ctx.fillRect(Math.min(edge, edge - 10 * p.side), 0, 10, H)
        // Gold fringe along the hem
        ctx.fillStyle = '#c99a3c'
        for (let x = p.from; x < p.to; x += 3) ctx.fillRect(x, H - 7, 1.5, 7)

        // The projection falling on the velvet: bent sideways by each fold,
        // brighter on the ridges, darker in the dips, tinted red.
        if (lit) {
          const left = Math.max(p.from, screen.x)
          const right = Math.min(p.to, screen.x + screen.w)
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          for (let x = left; x < right; x += 3) {
            const phase = ((x - p.from) / fw) * Math.PI * 2
            const bend = Math.sin(phase) * fw * 0.16
            const shade = 0.5 + 0.5 * Math.cos(phase - 0.6)
            ctx.globalAlpha = projector * (0.18 + 0.42 * shade)
            ctx.drawImage(leader, x - screen.x + bend, 0, 3, screen.h, x, screen.y, 3, screen.h)
          }
          ctx.restore()
        }
      }

      if (flash > 0 && screen) {
        ctx.fillStyle = `rgba(255,252,240,${flash})`
        ctx.fillRect(screen.x, screen.y, screen.w, screen.h)
      }
    },
  }
}
