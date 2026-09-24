import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './use-reduced-motion'

// Everything about the film look that changes over time (grain, flicker,
// dust, hairs, scratches) plus the vignette, drawn on one canvas at half
// resolution and 12 fps. Several separately animated full-screen layers made
// the browser re-blend the whole screen on nearly every frame; one small
// layer updating 12 times a second costs a fraction of that.

const SCALE = 0.5
const TICK_MS = 1000 / 12
const GRAIN_TILE = 128
const GRAIN_FRAMES = 4
const GRAIN_ALPHA = 0.07

const rand = (min, max) => min + Math.random() * (max - min)

// On-screen scenes (FilmFrame) register here to get flicker and dust.
const screens = new Set()

export function useFilmScreen(ref) {
  useEffect(() => {
    const el = ref.current
    screens.add(el)
    return () => screens.delete(el)
  }, [ref])
}

// Other canvases that animate (the title film's forest) paint on this layer's
// tick, so every canvas on the page changes in the same frame and the browser
// composites once per tick. Nothing ticks with reduced motion.
const tickers = new Set()

export function useFilmTick(callback) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const tick = (now) => callbackRef.current(now)
    tickers.add(tick)
    return () => tickers.delete(tick)
  }, [])
}

function makeGrainTiles() {
  return Array.from({ length: GRAIN_FRAMES }, () => {
    const tile = document.createElement('canvas')
    tile.width = tile.height = GRAIN_TILE
    const ctx = tile.getContext('2d')
    const img = ctx.createImageData(GRAIN_TILE, GRAIN_TILE)
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() * 255
      img.data[i + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    return tile
  })
}

function makeVignette(w, h) {
  const v = document.createElement('canvas')
  v.width = w
  v.height = h
  const ctx = v.getContext('2d')
  // Same shape as CSS radial-gradient(ellipse farthest-corner): clear to 60%,
  // dark in the corners.
  ctx.translate(w / 2, h / 2)
  ctx.scale(1, h / w)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, (w / 2) * Math.SQRT2)
  g.addColorStop(0.6, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,.5)')
  ctx.fillStyle = g
  ctx.fillRect(-w / 2, -w / 2, w, w)
  return v
}

// Per-screen damage: specks change every tick; a hair stays caught in the gate
// for a while; a scratch runs down the frame and drifts sideways.
function advanceScreen(state = { hair: null, scratch: null, flicker: 0.02, target: 0.02 }) {
  if (Math.random() < 0.3) state.target = rand(0.01, 0.05)
  state.flicker += (state.target - state.flicker) * 0.5

  state.specks = Math.random() < 0.55
    ? Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: rand(1, 2.8),
        dark: Math.random() < 0.7,
      }))
    : []

  if (state.hair && --state.hair.life <= 0) state.hair = null
  if (!state.hair && Math.random() < 0.012) {
    state.hair = { x: rand(0.05, 0.95), y: rand(0.05, 0.95), dx: rand(-60, 60), dy: rand(-40, 40), bend: rand(-30, 30), life: rand(6, 16) }
  }

  if (state.scratch && --state.scratch.life <= 0) state.scratch = null
  if (!state.scratch && Math.random() < 0.012) state.scratch = { x: rand(0.05, 0.95), life: rand(8, 22), alpha: rand(0.12, 0.3) }
  if (state.scratch) state.scratch.x += rand(-0.001, 0.001)

  return state
}

function drawScreen(ctx, rect, state) {
  const x = rect.left * SCALE
  const y = rect.top * SCALE
  const w = rect.width * SCALE
  const h = rect.height * SCALE

  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  ctx.fillStyle = `rgba(0,0,0,${state.flicker})`
  ctx.fillRect(x, y, w, h)

  for (const s of state.specks) {
    ctx.fillStyle = s.dark ? 'rgba(18,10,4,.55)' : 'rgba(255,244,220,.5)'
    ctx.beginPath()
    ctx.ellipse(x + s.x * w, y + s.y * h, s.r * SCALE, s.r * SCALE * 0.7, s.x * 6, 0, Math.PI * 2)
    ctx.fill()
  }

  if (state.hair) {
    const { hair } = state
    const hx = x + hair.x * w
    const hy = y + hair.y * h
    ctx.strokeStyle = 'rgba(18,10,4,.55)'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(hx, hy)
    ctx.quadraticCurveTo(hx + (hair.dx / 2 + hair.bend) * SCALE, hy + (hair.dy / 2 - hair.bend) * SCALE, hx + hair.dx * SCALE, hy + hair.dy * SCALE)
    ctx.stroke()
  }

  if (state.scratch) {
    ctx.fillStyle = `rgba(255,244,220,${state.scratch.alpha})`
    ctx.fillRect(x + state.scratch.x * w, y, 0.6, h)
  }

  ctx.restore()
}

export function FilmLayer() {
  const canvasRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const tiles = makeGrainTiles().map((tile) => ctx.createPattern(tile, 'repeat'))
    const screenState = new WeakMap()
    let vignette = null
    let grain = { pattern: tiles[0], ox: 0, oy: 0 }
    let raf = 0
    let lastTick = 0

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth * SCALE)
      canvas.height = Math.ceil(window.innerHeight * SCALE)
      vignette = makeVignette(canvas.width, canvas.height)
      render()
    }

    const advance = () => {
      grain = { pattern: tiles[Math.floor(Math.random() * GRAIN_FRAMES)], ox: rand(0, GRAIN_TILE), oy: rand(0, GRAIN_TILE) }
      for (const el of screens) screenState.set(el, advanceScreen(screenState.get(el)))
    }

    const render = () => {
      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      ctx.globalAlpha = GRAIN_ALPHA
      ctx.save()
      ctx.translate(-grain.ox, -grain.oy)
      ctx.fillStyle = grain.pattern
      ctx.fillRect(grain.ox, grain.oy, w, h)
      ctx.restore()
      ctx.globalAlpha = 1

      if (!reduced) {
        for (const el of screens) {
          const state = screenState.get(el)
          if (!state) continue
          const rect = el.getBoundingClientRect()
          if (rect.bottom > 0 && rect.top < window.innerHeight) drawScreen(ctx, rect, state)
        }
      }

      if (vignette) ctx.drawImage(vignette, 0, 0)
    }

    // Everything advances and redraws at 12 fps, scrolling or not. (Redrawing
    // on every scroll frame kept the flicker glued to its scene, but cost a
    // full-screen canvas upload per frame; at this low opacity a lag of one
    // tick can't be seen.)
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - lastTick < TICK_MS) return
      lastTick = now
      for (const tick of tickers) tick(now)
      advance()
      render()
    }

    resize()
    window.addEventListener('resize', resize)
    if (!reduced) {
      advance()
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60] size-full" />
}
