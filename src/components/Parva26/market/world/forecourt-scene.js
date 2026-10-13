import Phaser from 'phaser'
import { PLACES } from '@p26/content'
import { FRAME, FEET_ORIGIN, frameOf } from '@p26/market/world/characters'
import { blockedAt } from '@p26/market/world/layout'
import { findPath } from '@p26/market/world/path'
import { drawGround } from '@p26/market/world/art/ground'
import { drawTheatre } from '@p26/market/world/art/theatre'
import { drawShop } from '@p26/market/world/art/shop'
import { drawLamp } from '@p26/market/world/art/lamp'
import { drawArrow, drawFootprint, drawRing } from '@p26/market/world/art/marks'

const FACINGS = ['down', 'left', 'right', 'up']
// How fast the walker goes, in forecourt widths per second, and how fast its
// legs go to match (they read as sliding if the legs lag the ground).
const WALK_SPEED = 0.38
const STEP_RATE = 12
// How far a finger or mouse may move, in screen pixels, and still be a tap.
// Anything more is a scroll of the page, not a step.
const TAP_SLOP = 12

// The forecourt: a fixed camera on the painted ground, the theatre, the
// stalls and the lamps, with the visitor's walker moving over it. It reports
// two things to the page: which place the walker is standing at (onNear),
// where the page raises the place's prompt, and when they use it with the
// E key (onAction). Tapping a place walks there; going in is always the
// visitor's own choice, from the prompt or E, never automatic.
//
// So that nobody has to guess what to do: a bouncing arrow hangs over each
// open stall until it has been visited (`visited`), a trail of footprints
// leads from the start to the first one until the walker moves, and a ring
// marks where a tap sent the walker.
export class ForecourtScene extends Phaser.Scene {
  constructor(opts) {
    super('forecourt')
    this.opts = opts
    this.facing = 'down'
    this.path = [] // the points a tap sent the walker through
    this.nearId = null
    this.stuck = 0
  }

  preload() {
    this.load.spritesheet('walker', this.opts.character.sheet, { frameWidth: FRAME.width, frameHeight: FRAME.height })
  }

  create() {
    const L = this.opts.layout
    const tex = (key, canvas) => this.textures.addCanvas(key, canvas)

    // Everything but the walker is painted once, here, and never redrawn.
    tex('ground', drawGround(L))
    tex('theatre', drawTheatre(L))
    tex('lamp', drawLamp())
    this.add.image(0, 0, 'ground').setOrigin(0).setDepth(-1000)
    this.add.image(L.theatre.x, L.wallY, 'theatre').setOrigin(0.5, 1).setDepth(L.wallY - 1)

    // Where you can go: the theatre door and the stalls
    const door = this.add.zone(L.door.x, L.wallY - 110, 280, 230).setInteractive({ useHandCursor: true })
    door.setData('place', 'theatre')
    this.places = [{ ...PLACES.find((p) => p.id === 'theatre'), stand: L.door, radius: 130 }]
    for (const s of L.shops) {
      const place = PLACES.find((p) => p.id === s.id)
      tex(`shop-${s.id}`, drawShop(place, s.w, s.h))
      const img = this.add.image(s.x, s.base, `shop-${s.id}`).setOrigin(0.5, 1).setDepth(s.base).setInteractive({ useHandCursor: true })
      img.setData('place', s.id)
      this.places.push({ ...place, stand: s.stand, radius: 150 })
    }
    for (const lamp of L.lamps) this.add.image(lamp.x, lamp.base, 'lamp').setOrigin(0.5, 1).setDepth(lamp.base)

    // Arrows over the open stalls not visited yet
    tex('arrow', drawArrow())
    this.arrows = new Map()
    for (const s of L.shops) {
      if (!PLACES.find((p) => p.id === s.id)?.go || this.opts.visited.includes(s.id)) continue
      const arrow = this.add.image(s.x, s.base - s.h - 18, 'arrow').setOrigin(0.5, 1).setDepth(5000)
      this.tweens.add({ targets: arrow, y: arrow.y - 26, duration: 520, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 })
      this.arrows.set(s.id, arrow)
    }

    // Footprints from the start to the first open stall, until the walker moves
    tex('footprint', drawFootprint())
    this.trail = []
    const first = L.shops.find((s) => this.arrows.has(s.id))
    if (first) {
      const way = [L.spawn, ...findPath(L, L.spawn, first.stand)]
      let step = 0
      for (let i = 1; i < way.length; i++) {
        const a = way[i - 1]
        const b = way[i]
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const angle = Math.atan2(b.y - a.y, b.x - a.x)
        // Left, right, left: each print a little off the line of the walk
        for (let d = i === 1 ? 70 : 0; d < len - (i === way.length - 1 ? 50 : 0); d += 64, step++) {
          const side = step % 2 ? 11 : -11
          const x = a.x + ((b.x - a.x) * d) / len - Math.sin(angle) * side
          const y = a.y + ((b.y - a.y) * d) / len + Math.cos(angle) * side
          this.trail.push(this.add.image(x, y, 'footprint').setRotation(angle + Math.PI / 2).setAlpha(0).setDepth(-500).setScale(L.walker.scale * 1.6))
        }
      }
      // They appear one after another, as if someone had just walked there
      this.trail.forEach((print, i) => this.tweens.add({ targets: print, alpha: 0.65, delay: 400 + i * 90, duration: 250 }))
    }

    // Where a tap sent the walker
    tex('ring', drawRing())
    this.ring = this.add.image(0, 0, 'ring').setDepth(-400).setVisible(false)

    // The walker
    for (const facing of FACINGS) {
      this.anims.create({
        key: `walk-${facing}`,
        frames: this.anims.generateFrameNumbers('walker', { frames: [0, 1, 2, 3].map((i) => frameOf(facing, i)) }),
        frameRate: STEP_RATE,
        repeat: -1,
      })
    }
    this.walker = this.add
      .sprite(L.spawn.x, L.spawn.y, 'walker', frameOf('down'))
      .setOrigin(FEET_ORIGIN.x, FEET_ORIGIN.y)
      .setScale(L.walker.scale)
      .setDepth(L.spawn.y)

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E')
    this.keys.E.on('down', () => this.nearId && this.use(this.nearId))

    // A tap on a place sends the walker to stand at it, where its prompt
    // rises; a tap on the ground sends the walker there. Both count on release, and
    // only if the pointer stayed put: a swipe that starts on the game is the
    // page scrolling, which the browser takes over (and cancels the touch).
    this.input.on('pointerup', (pointer, over) => {
      if (!this.isTap(pointer)) return
      const id = over.find((obj) => obj.getData('place'))?.getData('place')
      const place = id && this.places.find((p) => p.id === id)
      const b = L.bounds
      const to = place ? place.stand : { x: Phaser.Math.Clamp(pointer.worldX, b.x0, b.x1), y: Phaser.Math.Clamp(pointer.worldY, b.y0, b.y1) }
      this.walkTo(to)
      this.mark(to)
    })

    if (new URLSearchParams(window.location.search).has('debug')) window.__p26Market = this
  }

  update(_time, delta) {
    const L = this.opts.layout
    const w = this.walker
    const dt = Math.min(delta, 100) / 1000
    const k = this.keys
    let vx = Number(k.RIGHT.isDown || k.D.isDown) - Number(k.LEFT.isDown || k.A.isDown)
    let vy = Number(k.DOWN.isDown || k.S.isDown) - Number(k.UP.isDown || k.W.isDown)
    let toGo = Infinity // how far a tap's next point is, so a long frame can't overshoot it

    if (vx || vy) {
      this.path = []
      this.ring.setVisible(false)
    } else if (this.path.length) {
      const next = this.path[0]
      const dx = next.x - w.x
      const dy = next.y - w.y
      const dist = Math.hypot(dx, dy)
      if (dist < 10) {
        this.path.shift()
        if (!this.path.length) this.arrive()
      } else {
        vx = dx / dist
        vy = dy / dist
        toGo = dist
      }
    }

    const moving = vx !== 0 || vy !== 0
    if (moving) {
      this.clearTrail()
      const speed = L.width * WALK_SPEED
      const len = Math.hypot(vx, vy)
      const step = Math.min(speed * dt, toGo)
      const nx = Phaser.Math.Clamp(w.x + (vx / len) * step, L.bounds.x0, L.bounds.x1)
      const ny = Phaser.Math.Clamp(w.y + (vy / len) * step, L.bounds.y0, L.bounds.y1)
      const before = { x: w.x, y: w.y }
      // Each axis on its own, so you slide along a wall instead of sticking
      if (!blockedAt(L, nx, w.y)) w.x = nx
      if (!blockedAt(L, w.x, ny)) w.y = ny
      // Should a tap's way ever be blocked, give up instead of pushing on
      if (this.path.length && Math.hypot(w.x - before.x, w.y - before.y) < step * 0.25) {
        if (++this.stuck > 8) {
          this.path = []
          this.ring.setVisible(false)
          this.stuck = 0
        }
      } else {
        this.stuck = 0
      }
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up'
      w.anims.play(`walk-${this.facing}`, true)
      w.setDepth(w.y)
    } else if (w.anims.isPlaying) {
      w.anims.stop()
      w.setFrame(frameOf(this.facing))
    }

    this.updateNear()
  }

  // Phaser hears the whole window's mouse, so a click elsewhere on the page
  // would count too: a tap starts and ends on the forecourt itself.
  isTap(pointer) {
    if (pointer.wasCanceled || pointer.button !== 0) return false
    const canvas = this.game.canvas
    if (pointer.downElement !== canvas || pointer.upElement !== canvas) return false
    return pointer.getDistance() <= TAP_SLOP * this.scale.displayScale.x
  }

  // A ring on the ground where the walker is going, gone on arrival.
  mark({ x, y }) {
    if (!this.path.length) return
    const scale = this.opts.layout.walker.scale
    this.tweens.killTweensOf(this.ring)
    this.ring.setPosition(x, y).setVisible(true).setScale(scale * 1.7)
    this.tweens.add({ targets: this.ring, scale: scale * 1.15, duration: 380, ease: 'Back.easeOut' })
  }

  clearTrail() {
    if (!this.trail.length) return
    const trail = this.trail
    this.trail = []
    this.tweens.killTweensOf(trail)
    this.tweens.add({ targets: trail, alpha: 0, duration: 500, onComplete: () => trail.forEach((print) => print.destroy()) })
  }

  // The page took the keyboard back: let go of any keys held down, so the
  // walker doesn't keep walking.
  releaseKeys() {
    this.input.keyboard?.resetKeys()
  }

  // Send the walker to a point, round whatever is in the way.
  walkTo(point) {
    this.path = findPath(this.opts.layout, { x: this.walker.x, y: this.walker.y }, point)
    this.stuck = 0
  }

  // The place the walker is standing at, if any, reported when it changes.
  updateNear() {
    const w = this.walker
    let best = null
    let bestDist = Infinity
    for (const p of this.places) {
      const d = Math.hypot(w.x - p.stand.x, w.y - p.stand.y)
      if (d < p.radius && d < bestDist) {
        best = p.id
        bestDist = d
      }
    }
    if (best !== this.nearId) {
      this.nearId = best
      this.opts.onNear(best)
    }
  }

  arrive() {
    this.ring.setVisible(false)
    this.updateNear()
  }

  // Using a place with E takes down its arrow: it has been found.
  use(id) {
    const arrow = this.arrows.get(id)
    if (arrow) {
      this.tweens.killTweensOf(arrow)
      arrow.destroy()
      this.arrows.delete(id)
    }
    this.opts.onAction(id)
  }
}
