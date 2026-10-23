// The Parva 2026 theme-reveal reel, drawn frame by frame (see PLAN.md).
// window.renderAt(t) paints reel time t (seconds) onto #out, 1080x1920.
//
// Everything is laid out as a 405x720 CSS-px phone screen drawn at pixel
// scale 8/3. Every layer comes from the site's own canvas modules; this file
// only schedules them against the storyboard and adds the text.

import '@fontsource-variable/anek-kannada'
import '@fontsource-variable/baloo-tamma-2'
import '@fontsource/bebas-neue'
import '@fontsource/akaya-kanadaka'

import { createStageCurtain } from '@p26/scenes/00-intro/stage-curtain'
import { createForest } from '@p26/scenes/02-title/forest'
import { createAir } from '@p26/scenes/02-title/air'
import { drawIncense, createSmokeLetters } from '@p26/scenes/00-intro/smoke'
import { createSandalStrip, stripLayout } from '@p26/scenes/04-gandhada-gudi/sandal-strip'
import { drawLeopard, drawElephantPair, drawHornbill, drawDeer } from './animals.js'
import { makeGrainTiles, makeVignette, advanceScreen, drawScreen } from '@p26/film/film-layer'

const S = 8 / 3 // canvas px per CSS px
const W = 1080
const H = 1920
const CSS_W = 405
const CSS_H = 720
const CX = 191 // text centre: middle of the safe area (x 22-360)
const SAFE = { l: 22, r: 360, t: 80, b: 555 }

const C = {
  theatre: '#140c08',
  print: '#3b2a1a',
  heartwood: '#6b3f22',
  sandal: '#c8955f',
  gandha: '#f1dfc0',
  arishina: '#f2c12e',
  kumkuma: '#c8102e',
  brass: '#b8862b',
  projector: '#fff4dc',
}

const BEBAS = 'Bebas Neue'
const ANEK = 'Anek Kannada Variable'
const BALOO = 'Baloo Tamma 2 Variable'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const easeOut = (u) => 1 - (1 - clamp01(u)) ** 3
const easeIn = (u) => clamp01(u) ** 2
const easeInOut = (u) => {
  u = clamp01(u)
  return u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2
}
const lerp = (a, b, u) => a + (b - a) * u
// 0 before `a`, 1 after `b`
const ramp = (t, a, b) => clamp01((t - a) / (b - a))
// A pulse that is 1 at `at` and falls to 0 over `len` seconds
const pulse = (t, at, len) => (t >= at && t < at + len ? 1 - (t - at) / len : 0)

function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

// ---------------------------------------------------------------- layers --

const out = document.getElementById('out')
const g = out.getContext('2d')

const cForest = makeCanvas()
const cStrip = makeCanvas()
const cSmoke1 = makeCanvas()
const cSmoke2 = makeCanvas()
const cAir = makeCanvas()
const cCurtain = makeCanvas()
const cFilm = makeCanvas(W / 2, H / 2) // the film layer paints at half size, like the site
const cScratch = makeCanvas(8, 8)

const forest = createForest(cForest)
const air = createAir(cAir)
const curtain = createStageCurtain(cCurtain)
const strip = createSandalStrip(cStrip)
const stripLayoutNow = stripLayout(CSS_W, CSS_H, false)
strip.resize(stripLayoutNow, S)

const ctxForest = cForest.getContext('2d')
const ctxSmoke1 = cSmoke1.getContext('2d')
const ctxSmoke2 = cSmoke2.getContext('2d')
const ctxFilm = cFilm.getContext('2d')

const leaderFont = (px) => `800 ${px}px "${BALOO}", "Akaya Kanadaka", sans-serif`
const titleFont = (px, family = 'Akaya Kanadaka') => `${px}px "${family}"`

// Incense: three sticks standing at the bottom, embers at their tips.
const EMBERS = [
  { x: 150 * S, y: 650 * S },
  { x: 191 * S, y: 662 * S },
  { x: 232 * S, y: 650 * S },
]

// ------------------------------------------------------------------ text --

let curScale = S
let recording = null // when set, each text call records its box (CSS px)
let push = { k: 1, dx: 0, dy: 0 } // the slow push-in, for the safe-area check

function setView(k = 1, dx = 0, dy = 0) {
  // CSS px -> canvas px, with the slow push about the canvas centre
  curScale = S * k
  g.setTransform(S * k, 0, 0, S * k, (W / 2) * (1 - k) + dx, (H / 2) * (1 - k) + dy)
  push = { k, dx: dx / S, dy: dy / S }
}

function fontStr(fam, weight, size) {
  return `${weight} ${size}px "${fam}"${fam === BEBAS ? ', Impact, sans-serif' : ', sans-serif'}`
}

function measure(s, fam, weight, size, track = 0) {
  g.save()
  g.font = fontStr(fam, weight, size)
  g.letterSpacing = `${track * size}px`
  const w = g.measureText(s).width - track * size
  g.restore()
  return w
}

// Largest size (up to `max`) at which `s` fits in `maxW` CSS px.
function fit(s, fam, weight, max, maxW, track = 0) {
  const w = measure(s, fam, weight, 100, track)
  return Math.min(max, (maxW / w) * 100)
}

const EXTRUSION = ['#7a3710', '#6a2e0c', '#5a270a', '#4b2008', '#3e1a06', '#331505']

// One line of text, coordinates in CSS px. Position and opacity always come
// from the caller (a function of t); nothing here animates by itself.
function txt(s, x, y, o = {}) {
  const {
    size = 20,
    fam = BEBAS,
    weight = 400,
    color = C.gandha,
    align = 'center',
    track = 0,
    alpha = 1,
    stroke = null, // { color, w }
    shadow = null, // { color, blur, dx, dy }
    extrude = 0, // number of extrusion layers (poster style)
    glow = null, // { color, blur }
  } = o
  if (alpha <= 0.003) return
  g.save()
  g.globalAlpha *= alpha
  g.font = fontStr(fam, weight, size)
  g.letterSpacing = `${track * size}px`
  g.textAlign = align
  g.textBaseline = 'middle'
  g.lineJoin = 'round'
  const fullW = g.measureText(s).width
  const shift = align === 'center' ? (track * size) / 2 : 0
  const px = x + shift
  if (recording) {
    const m = g.measureText(s)
    const w = fullW - track * size
    const left = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w
    const top = y - m.actualBoundingBoxAscent
    const bottom = y + m.actualBoundingBoxDescent
    // the box in final CSS px, through whatever transform is active (push, shake, rotation)
    const M = g.getTransform()
    const pts = [
      [left, top],
      [left + w, top],
      [left, bottom],
      [left + w, bottom],
    ].map(([px_, py_]) => [(M.a * px_ + M.c * py_ + M.e) / S, (M.b * px_ + M.d * py_ + M.f) / S])
    recording.push({
      s,
      l: Math.min(...pts.map((p) => p[0])),
      r: Math.max(...pts.map((p) => p[0])),
      t: Math.min(...pts.map((p) => p[1])),
      b: Math.max(...pts.map((p) => p[1])),
      a: g.globalAlpha,
    })
  }
  if (extrude) {
    const step = 0.0072 * size
    for (let i = extrude; i >= 1; i--) {
      g.fillStyle = EXTRUSION[Math.min(EXTRUSION.length - 1, Math.floor((i / extrude) * EXTRUSION.length))]
      g.fillText(s, px + i * step, y + i * step)
    }
  }
  if (shadow) {
    g.shadowColor = shadow.color
    g.shadowBlur = shadow.blur * curScale
    g.shadowOffsetX = (shadow.dx || 0) * curScale
    g.shadowOffsetY = (shadow.dy || 0) * curScale
  }
  if (stroke) {
    g.strokeStyle = stroke.color
    g.lineWidth = stroke.w
    g.strokeText(s, px, y)
    g.shadowColor = 'transparent'
  }
  if (glow) {
    g.shadowColor = glow.color
    g.shadowBlur = glow.blur * curScale
    g.fillStyle = color
    g.fillText(s, px, y)
  }
  g.fillStyle = color
  if (!stroke) {
    if (!glow && !shadow) g.shadowColor = 'transparent'
  }
  g.fillText(s, px, y)
  g.restore()
}

const SHADE = { color: 'rgba(8,4,2,.85)', blur: 6, dx: 0, dy: 1.5 }
const OUTLINE = { color: '#1a0f08', w: 4 }

// ------------------------------------------------------- reusable sprites --

// The website-reveal ticket (poster look): arishina, notched at the sides and
// at the perforation, with a dashed tear line. Drawn without text.
const TICKET = { x: 33, y: 194, w: 316, h: 122, stub: 0 }
const ticketSprite = (() => {
  const c = makeCanvas(Math.ceil(TICKET.w * S), Math.ceil(TICKET.h * S))
  const x = c.getContext('2d')
  x.scale(S, S)
  const r = 9
  const { w, h, stub } = TICKET
  const grad = x.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#f6cf50')
  grad.addColorStop(1, '#e8b320')
  x.fillStyle = grad
  x.beginPath()
  x.roundRect(0, 0, w, h, 12)
  x.fill()
  x.globalCompositeOperation = 'destination-out'
  for (const [cx, cy] of [
    [0, h / 2],
    [w, h / 2],
  ]) {
    x.beginPath()
    x.arc(cx, cy, r, 0, Math.PI * 2)
    x.fill()
  }
  x.globalCompositeOperation = 'source-over'
  return c
})()

// -------------------------------------------------------------- the film --

const grainTiles = makeGrainTiles().map((tile) => ctxFilm.createPattern(tile, 'repeat'))
const vignette = makeVignette(cFilm.width, cFilm.height)
let screenState
let filmTick = -1

function paintFilm(t) {
  const tick = Math.floor(t * 12 + 1e-6)
  if (tick === filmTick) return
  filmTick = tick
  screenState = advanceScreen(screenState)
  const r = (min, max) => min + Math.random() * (max - min)
  const grain = { pattern: grainTiles[Math.floor(Math.random() * 4)], ox: r(0, 128), oy: r(0, 128) }
  const { width: w, height: h } = cFilm
  ctxFilm.clearRect(0, 0, w, h)
  ctxFilm.globalAlpha = 0.07
  ctxFilm.save()
  ctxFilm.translate(-grain.ox, -grain.oy)
  ctxFilm.fillStyle = grain.pattern
  ctxFilm.fillRect(grain.ox, grain.oy, w, h)
  ctxFilm.restore()
  ctxFilm.globalAlpha = 1
  drawScreen(ctxFilm, { left: 0, top: 0, width: W, height: H }, screenState)
  ctxFilm.drawImage(vignette, 0, 0)
}

// ---------------------------------------------------------- smoke letters --

const smokeTop = createSmokeLetters()
const smokeBottom = createSmokeLetters()
let smokeStarted = false
const SMOKE_START = 3.35 // no letters in the calm build; they gather from 3.35, settle on the 6.15 hit, drift apart from about 9.15
let lockupSize = 100

// The theme in Kannada, stacked, is what the smoke forms; English sits small below.
const LOCKUP = [
  ['ಗಂಧದ', 304],
  ['ಗುಡಿ', 400],
]

function layoutSmoke() {
  const size = Math.min(fit('ಗಂಧದ', BALOO, 800, 104, 300), fit('ಗುಡಿ', BALOO, 800, 104, 300))
  lockupSize = size
  const font = `800 ${Math.round(size * S)}px "${BALOO}", sans-serif`
  const bw = 340 * S
  const bh = 124 * S
  smokeTop.layout(LOCKUP[0][0], font, { x: CX * S - bw / 2, y: LOCKUP[0][1] * S - bh / 2, w: bw, h: bh })
  smokeBottom.layout(LOCKUP[1][0], font, { x: CX * S - bw / 2, y: LOCKUP[1][1] * S - bh / 2, w: bw, h: bh })
}

function drawSmoke(t) {
  // The letters' clock starts on their first draw. Make that draw happen at
  // 0.2 s, even when a still is asked for at a later time.
  if (!smokeStarted) {
    smokeStarted = true
    const s = cScratch.getContext('2d')
    smokeTop.draw(s, SMOKE_START, EMBERS, S)
    smokeBottom.draw(s, SMOKE_START, EMBERS, S)
    s.clearRect(0, 0, 8, 8)
  }
  ctxSmoke1.clearRect(0, 0, W, H)
  ctxSmoke2.clearRect(0, 0, W, H)
  if (t < SMOKE_START) return false
  const m = t
  smokeTop.draw(ctxSmoke1, m, EMBERS, S)
  smokeBottom.draw(ctxSmoke2, m, EMBERS, S)
  return true
}

// The three incense sticks and their embers.
function drawEmbers(ctx, t, alpha, boost = 0) {
  if (alpha <= 0.01) return
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.lineCap = 'round'
  EMBERS.forEach((e, i) => {
    ctx.strokeStyle = '#3a2412'
    ctx.lineWidth = 2.4 * S
    ctx.beginPath()
    ctx.moveTo(e.x, e.y)
    ctx.lineTo(e.x + (i - 1) * 6 * S, e.y + 90 * S)
    ctx.stroke()
    const flick = Math.min(1, (0.75 + 0.25 * Math.sin(t * 9 + i * 2)) * (1 + 0.6 * boost))
    const gr = 15 * (1 + 1.2 * boost)
    const gl = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, gr * S)
    gl.addColorStop(0, `rgba(255,190,90,${0.9 * flick})`)
    gl.addColorStop(0.3, `rgba(255,120,40,${0.45 * flick})`)
    gl.addColorStop(1, 'rgba(255,100,30,0)')
    ctx.fillStyle = gl
    ctx.fillRect(e.x - gr * S, e.y - gr * S, 2 * gr * S, 2 * gr * S)
    ctx.fillStyle = '#ffe2a0'
    ctx.beginPath()
    ctx.arc(e.x, e.y, 1.6 * S, 0, Math.PI * 2)
    ctx.fill()
  })
  drawIncense(ctx, EMBERS, t, S, 1.4)
  ctx.restore()
}

// ------------------------------------------------------------ the scenes --

const FULL = { x: 0, y: 0, w: W, h: H }

function layer(canvas, alpha = 1, mode = 'source-over') {
  if (alpha <= 0.003) return
  g.save()
  g.globalAlpha = alpha
  g.globalCompositeOperation = mode
  g.drawImage(canvas, 0, 0)
  g.restore()
}

function cream(alpha) {
  if (alpha <= 0.003) return
  g.save()
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.fillStyle = `rgba(255,244,220,${Math.min(1, alpha)})`
  g.fillRect(0, 0, W, H)
  g.restore()
}

function darken(topAlpha, bottomAlpha, y0 = 0, y1 = H) {
  const grd = g.createLinearGradient(0, y0, 0, y1)
  grd.addColorStop(0, `rgba(20,12,8,${topAlpha})`)
  grd.addColorStop(1, `rgba(20,12,8,${bottomAlpha})`)
  g.fillStyle = grd
  g.fillRect(0, y0, W, y1 - y0)
}

function scrimAround(cxCss, cyCss, rCss, alpha) {
  if (alpha <= 0.003) return
  const grd = g.createRadialGradient(cxCss * S, cyCss * S, 0, cxCss * S, cyCss * S, rCss * S)
  grd.addColorStop(0, `rgba(14,8,5,${alpha})`)
  grd.addColorStop(0.65, `rgba(14,8,5,${alpha * 0.7})`)
  grd.addColorStop(1, 'rgba(14,8,5,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, W, H)
}

// Section times (seconds): the two big hits and the strip between them
const HIT1 = 6.15 // theme reveal
const STRIP = 10.15
const HIT2 = 14.15 // website reveal

// Reel beats (seconds): kicks at these times; the big hits are 6.15 and 14.15.
const KICKS = [0.15, 1.15, 2.15, 3.15, 6.15, 9.15, 10.15, 11.15, 14.15, 15.15, 17.15, 18.15, 19.15]
function beatLight(t) {
  let a = 0
  for (const b of KICKS) a = Math.max(a, 0.08 * pulse(t, b, 0.22))
  return a
}

// -------- 0 - 10.15 s: the curtain opens at once, then the theme --------

const BEAM_SCREEN = { x: W * 0.06, y: H * 0.16, w: W * 0.88, h: H * 0.6 }

function sceneTheme(t) {
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.fillStyle = C.theatre
  g.fillRect(0, 0, W, H)

  // slow push 100 -> 105 % over the theme hold
  const k = 1 + 0.05 * easeInOut(ramp(t, HIT1, STRIP))
  setView(k)

  // Forest behind the curtain, dim until the theme lands, then warmer.
  const open = easeInOut(ramp(t, 0, 1.2))
  forest.draw(t)
  {
    const dim = lerp(0.35, 0.7, easeInOut(ramp(t, HIT1, HIT1 + 0.6)))
    g.save()
    g.setTransform(1, 0, 0, 1, (W / 2) * (1 - k), (H / 2) * (1 - k))
    g.scale(k, k)
    g.globalAlpha = dim
    g.drawImage(cForest, 0, 0)
    g.restore()
    // a soft dark pool behind the lettering so the arishina reads on the golden sky
    g.save()
    g.setTransform(1, 0, 0, 1, 0, 0)
    scrimAround(CX, 370, 270, 0.62 * ramp(t, 0, 0.6))
    g.restore()

    // Wildlife: leopard on a low branch, elephants on the hill, a hornbill overhead
    setView(k)
    const aIn = ramp(t, 0.2, 0.8) * (1 - ramp(t, STRIP - 0.3, STRIP))
    g.save()
    g.globalAlpha = aIn
    drawElephantPair(g, 345 - t * 5, 551, 0.62, t)
    // the leopard lifts its head on the 6.15 hit, when the theme appears
    drawLeopard(g, 30, 552, 0.9, t, ramp(t, HIT1, HIT1 + 0.8), ramp(t, HIT1 + 0.3, HIT1 + 0.9))
    g.restore()
    const fly = ramp(t, 7.6, 9.9)
    if (fly > 0 && fly < 1) drawHornbill(g, lerp(-30, 440, fly), 140 + Math.sin(fly * 9) * 6 - 18 * fly, 1.25, t)
  }

  // Beam, dust and smoke over the forest
  air.draw(t, { screen: BEAM_SCREEN, pointer: null, fansInView: false })
  g.save()
  g.setTransform(1, 0, 0, 1, 0, 0)
  const build = ramp(t, HIT1 - 0.4, HIT1) * (1 - ramp(t, HIT1, HIT1 + 0.6)) // the short build into the hit
  g.globalAlpha = 0.85 + 0.1 * ramp(t, HIT1 - 0.4, HIT1)
  g.drawImage(cAir, 0, 0)
  if (build > 0) {
    g.globalCompositeOperation = 'lighter'
    g.globalAlpha = 0.35 * build
    g.drawImage(cAir, 0, 0)
  }
  g.restore()

  const smokeOn = drawSmoke(t)
  const emberA = ramp(t, 0.3, 0.9) * (1 - ramp(t, 8.65, 9.75))
  const emberBoost = ramp(t, HIT1 - 0.4, HIT1) * (1 - ramp(t, HIT1, HIT1 + 1))
  g.save()
  g.setTransform(S * k, 0, 0, S * k, (W / 2) * (1 - k), (H / 2) * (1 - k))
  g.scale(1 / S, 1 / S)
  if (smokeOn) {
    g.drawImage(cSmoke1, 0, 0)
    g.drawImage(cSmoke2, 0, 0)
  }
  drawEmbers(g, t, emberA, emberBoost)
  g.restore()

  // The curtain: closed and lit on frame 0, parting from the first frame.
  // No countdown: projector 0 draws just the velvet.
  if (t < 1.3) {
    const sway = t > 0.75 ? Math.exp(-(t - 0.75) / 0.4) : 0
    curtain.draw({
      open,
      screen: FULL,
      projector: 0,
      leaderTime: 0,
      flash: 0,
      t: t + sway * 3 * Math.sin((t - 0.75) * 14),
      font: leaderFont,
    })
    // the 0.75 accent: the velvet gives a quick shimmy
    const sx = 1 + 0.018 * sway * Math.abs(Math.sin((t - 0.75) * 15))
    g.save()
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.translate(W / 2, 0)
    g.scale(sx, 1)
    g.translate(-W / 2, 0)
    g.drawImage(cCurtain, 0, 0)
    g.restore()
  }

  // ---- text ----
  setView(k)
  // Frame 0 is fully visible, no fade-in. From the 1.15 kick the hook drifts up
  // and dissolves into the beam, letters loosening as it goes.
  const out = easeInOut(ramp(t, 1.15, 1.9))
  const hook = 1 - out
  if (hook > 0) {
    const rise = -22 * out
    txt('PARVA 2026', CX, 98 + rise, { size: 26, track: 0.34 + 0.08 * out, color: C.gandha, alpha: hook, stroke: { color: '#1a0f08', w: 3 }, shadow: SHADE })
    const sz = fit('THEME REVEAL', BEBAS, 400, 70, 312, 0.03) * (1 - 0.04 * out)
    txt('THEME REVEAL', CX, 148 + rise, { size: sz, track: 0.03 + 0.05 * out, color: C.arishina, alpha: hook, stroke: OUTLINE, extrude: 8 })
  }
  {
    // One label for the whole theme section: it rises into place as the hook
    // clears, settles on the 2.15 kick and stays above the lockup.
    const inn = easeOut(ramp(t, 1.65, 2.15))
    txt('PARVA 2026 · THEME', CX, 225 + 12 * (1 - inn), {
      size: fit('PARVA 2026 · THEME', BEBAS, 400, 26, 316, 0.3),
      track: 0.3,
      color: C.gandha,
      alpha: inn,
      stroke: { color: '#1a0f08', w: 3 },
      shadow: SHADE,
    })
  }
  if (t >= HIT1) {
    const a = easeOut(ramp(t, HIT1, HIT1 + 0.3))
    const glow = { color: 'rgba(200,149,95,.9)', blur: 22 }
    for (const [word, y] of LOCKUP) {
      txt(word, CX, y, { size: lockupSize, fam: BALOO, weight: 800, color: C.arishina, alpha: a, glow, extrude: 12, stroke: { color: '#2a1408', w: 2 } })
    }
    txt('GANDHADA GUDI', CX, 462, {
      size: 30,
      track: 0.2,
      color: C.gandha,
      alpha: a,
      stroke: { color: '#1a0f08', w: 3 },
      shadow: SHADE,
    })
    const fest = 'A FESTIVAL FOR THE LAND OF SANDALWOOD'
    txt(fest, CX, 497, {
      size: fit(fest, BEBAS, 400, 20, 312, 0.1),
      track: 0.1,
      color: C.sandal,
      alpha: easeOut(ramp(t, 7.15, 7.5)),
      stroke: { color: '#1a0f08', w: 3 },
      shadow: SHADE,
    })
  }

  // Light: kick pulses, the warm flash on the 6.15 hit, a pulse at 9.15.
  let flash = beatLight(t)
  flash = Math.max(flash, 0.35 * pulse(t, HIT1, 0.3))
  if (t >= HIT1) flash = Math.max(flash, 0.14 * pulse(t, 9.15, 0.3))
  cream(flash)
  g.setTransform(1, 0, 0, 1, 0, 0)
}

// -------- 10.15 - 14.15 s: the film strip --------

// p steps with 0.35 s eases that land on the beats (11.15, 12.15)
function stripProgress(t) {
  return 0.5 * easeInOut(ramp(t, STRIP + 0.65, STRIP + 1)) + 0.5 * easeInOut(ramp(t, STRIP + 1.65, STRIP + 2))
}

function sceneStrip(t) {
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.fillStyle = C.theatre
  g.fillRect(0, 0, W, H)
  const p = stripProgress(t)
  const rects = strip.draw(p, t, titleFont)
  g.drawImage(cStrip, 0, 0)
  setView(1)
  {
    // a spotted deer wanders through the forest frame, clipped to it
    const r = rects[0]
    g.save()
    g.beginPath()
    g.rect(r.x, r.y, r.w, r.h)
    g.clip()
    g.globalAlpha = ramp(t, STRIP, STRIP + 0.15)
    drawDeer(g, r.x + r.w * 0.36 + (t - STRIP) * 9, r.y + r.h * 0.9, 1.35, t)
    g.restore()
  }

  const hdr = 'PARVA 2026 · GANDHADA GUDI'
  txt(hdr, CX, 92, {
    size: fit(hdr, BEBAS, 400, 22, 316, 0.14),
    track: 0.14,
    color: C.gandha,
    stroke: { color: '#1a0f08', w: 3 },
    shadow: SHADE,
  })

  const L = stripLayoutNow
  const labelY = L.top + L.fh + L.band + 50
  ;['FOREST', 'CRAFT', 'CINEMA'].forEach((name, i) => {
    const a = clamp01(1.25 - Math.abs(p - i / 2) * 6) // visible while the frame is centred
    txt(name, CSS_W / 2, labelY, {
      size: 50,
      track: 0.12,
      color: C.arishina,
      alpha: a,
      stroke: { color: '#1a0f08', w: 4 },
      extrude: 8,
    })
  })
  // little progress ticks under the label: 1/3, 2/3, 3/3
  for (let i = 0; i < 3; i++) {
    const on = clamp01(1.25 - Math.abs(p - i / 2) * 6)
    g.fillStyle = `rgba(242,193,46,${0.25 + 0.75 * on})`
    g.fillRect(CSS_W / 2 - 30 + i * 24, labelY + 40, 12, 3)
  }

  const flash = Math.max(beatLight(t), 0.25 * pulse(t, STRIP, 0.2))
  cream(flash)
  g.setTransform(1, 0, 0, 1, 0, 0)
}

// -------- 14.15 s to the end: the website reveal --------

function bounceDrop(t) {
  // 0 -> 1 falling (accelerating) over 0.28 s, then a damped rebound
  const u = (t - HIT2) / 0.28
  if (u <= 0) return 0
  if (u < 1) return easeIn(u)
  const v = (t - HIT2 - 0.28) / 0.45
  if (v >= 1) return 1
  return 1 - 0.07 * Math.exp(-v * 4.5) * Math.abs(Math.sin(v * Math.PI * 2.2))
}

// The URL on two lines: the host, then the path big, since the path is the point.
const URL_LINES = [
  { s: 'kannadavedike.nitk.ac.in/', weight: 600, color: C.print, maxW: 270, maxSize: 22, y: 26 },
  { s: 'parva-26', weight: 800, color: C.theatre, maxW: 276, maxSize: 58, y: 80 },
]

function sceneWebsite(t) {
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.fillStyle = C.theatre
  g.fillRect(0, 0, W, H)

  const shakeX = 0
  const shakeY = 0

  forest.draw(t)
  g.save()
  g.translate(shakeX, shakeY)
  g.globalAlpha = 0.42
  g.drawImage(cForest, 0, 0)
  g.restore()
  air.draw(t, { screen: BEAM_SCREEN, pointer: null, fansInView: false })
  g.save()
  g.translate(shakeX, shakeY)
  g.globalAlpha = 0.95
  g.drawImage(cAir, 0, 0)
  g.restore()
  g.setTransform(1, 0, 0, 1, 0, 0)
  darken(0.1, 0.3)
  scrimAround(CX, 300, 300, 0.3)

  setView(1, shakeX, shakeY)

  // One thing at a time: PARVA 2026, the headline, the URL ticket, then the
  // dates and the game line arriving on later beats.
  txt('PARVA 2026', CX, 116, {
    size: 24,
    track: 0.34,
    color: C.gandha,
    stroke: { color: '#1a0f08', w: 3 },
    shadow: SHADE,
  })
  const pop = easeOut(ramp(t, HIT2, HIT2 + 0.3))
  g.save()
  const hs = lerp(1.15, 1, pop)
  g.translate(CX, 158)
  g.scale(hs, hs)
  g.translate(-CX, -158)
  txt('WEBSITE IS LIVE', CX, 158, {
    size: fit('WEBSITE IS LIVE', BEBAS, 400, 40, 316, 0.04),
    track: 0.04,
    color: C.arishina,
    alpha: pop,
    stroke: OUTLINE,
    extrude: 8,
    glow: { color: 'rgba(200,149,95,.6)', blur: 12 },
  })
  g.restore()

  // The ticket drops in on the 14.15 hit
  const drop = bounceDrop(t)
  const dy = (drop - 1) * 440
  const tk = TICKET
  g.save()
  g.translate(0, dy)
  g.save()
  g.shadowColor = 'rgba(0,0,0,.55)'
  g.shadowBlur = 16 * curScale
  g.shadowOffsetY = 8 * curScale
  g.drawImage(ticketSprite, tk.x, tk.y, tk.w, tk.h)
  g.restore()

  // the URL in dark ink straight on the ticket, typed out from 14.45 to 15.45
  const stripY = tk.y + 14
  const mid = tk.x + tk.w / 2
  const lines = URL_LINES.map((l) => {
    const size = fit(l.s, ANEK, l.weight, l.maxSize, l.maxW)
    return { ...l, size, w: measure(l.s, ANEK, l.weight, size) }
  })
  const totalChars = lines.reduce((a, l) => a + l.s.length, 0)
  let typed = Math.floor(ramp(t, 14.45, 15.45) * totalChars + 1e-6)
  let caretDone = false
  const typing = t >= 14.45 && t < 15.45
  for (const l of lines) {
    const n = Math.max(0, Math.min(l.s.length, typed))
    typed -= l.s.length
    const x0 = mid - l.w / 2
    if (n > 0) txt(l.s.slice(0, n), x0, stripY + l.y - 14 + 12, { size: l.size, fam: ANEK, weight: l.weight, color: l.color, align: 'left' })
    if (typing && !caretDone && n < l.s.length && n >= 0) {
      caretDone = true
      if (Math.floor(t * 6) % 2 === 0) {
      g.fillStyle = C.theatre
      const cx = x0 + (n ? measure(l.s.slice(0, n), ANEK, l.weight, l.size) : 0) + 1
      g.fillRect(cx, stripY + l.y - 14 + 12 - l.size * 0.45, 2, l.size * 0.9)
      }
    }
  }
  g.restore()

  // Dates rise in on 17.15: second after the link
  {
    const u = easeOut(ramp(t, 17.15, 17.6))
    const dy = 10 * (1 - u)
    txt('29 OCT – 1 NOV', CX, 370 + dy, {
      size: fit('29 OCT – 1 NOV', BEBAS, 400, 44, 316, 0.06),
      track: 0.06,
      color: C.gandha,
      alpha: u,
      stroke: OUTLINE,
      extrude: 5,
    })
    txt('NITK SURATHKAL', CX, 404 + dy, {
      size: 18,
      track: 0.32,
      color: C.arishina,
      alpha: u,
      stroke: { color: '#1a0f08', w: 3 },
      shadow: SHADE,
    })
  }

  // The easter egg: the emoji film game, a small quiet line from 18.15
  {
    const u = easeOut(ramp(t, 18.15, 18.75))
    const egg = 'PSST… CAN YOU NAME THE FILM? PLAY ON THE SITE'
    txt(egg, CX, 478, {
      size: fit(egg, BEBAS, 400, 15, 300, 0.12),
      track: 0.12,
      color: C.sandal,
      alpha: 0.9 * u,
      stroke: { color: '#1a0f08', w: 3 },
      shadow: SHADE,
    })
  }

  const flash = Math.max(beatLight(t), 0.3 * pulse(t, HIT2, 0.25), 0.12 * pulse(t, 17.15, 0.25))
  cream(flash)
  g.setTransform(1, 0, 0, 1, 0, 0)
}

// ---------------------------------------------------------------- render --

function renderAt(t, opts = {}) {
  recording = opts.record ? [] : null
  if (t < STRIP) sceneTheme(t)
  else if (t < HIT2) sceneStrip(t)
  else sceneWebsite(t)

  // The film layer, over everything, from the first frame to the last
  paintFilm(t)
  g.setTransform(1, 0, 0, 1, 0, 0)
  g.drawImage(cFilm, 0, 0, W, H)

  if (new URLSearchParams(location.search).get('safe') === '1' || opts.safe) {
    g.strokeStyle = 'rgba(0,255,255,.9)'
    g.lineWidth = 2
    g.strokeRect(SAFE.l * S, SAFE.t * S, (SAFE.r - SAFE.l) * S, (SAFE.b - SAFE.t) * S)
  }
  const result = recording
  recording = null
  return result
}

async function boot() {
  await Promise.all([
    document.fonts.load('400 40px "Bebas Neue"', 'GANDHADA GUDI THEME REVEAL PARVA 2026 · … & 0123456789'),
    document.fonts.load('600 20px "Anek Kannada Variable"', 'kannadavedike.nitk.ac.in/parva-26'),
    document.fonts.load('800 20px "Anek Kannada Variable"', 'parva-26'),
    document.fonts.load('800 40px "Baloo Tamma 2 Variable"', 'ಗಂಧದ ಗುಡಿ ೫೪೩೨ ಪರ್ವ'),
    document.fonts.load('32px "Akaya Kanadaka"', 'ಗಂಧದ ಗುಡಿ'),
    document.fonts.load('32px "Baloo Tamma 2 Variable"', 'ಪರ್ವ ೨೬'),
  ])
  await document.fonts.ready
  layoutSmoke()
  window.renderAt = renderAt
  window.reelReady = true
}

window.reelReady = false
boot()
