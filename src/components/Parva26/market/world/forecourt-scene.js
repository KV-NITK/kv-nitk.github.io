import Phaser from 'phaser'
import { PLACES } from '@p26/content'
import { FRAME, FEET_ORIGIN, frameOf } from '@p26/market/world/characters'
import { blockedAt } from '@p26/market/world/layout'
import { findPath } from '@p26/market/world/path'
import { drawGround } from '@p26/market/world/art/ground'
import { drawTheatre } from '@p26/market/world/art/theatre'
import { drawShop } from '@p26/market/world/art/shop'
import { drawLamp } from '@p26/market/world/art/lamp'

const FACINGS = ['down', 'left', 'right', 'up']

// The forecourt: a fixed camera on the painted ground, the theatre, three
// shops and the lamps, with the visitor's walker moving over it. It reports
// two things to the page: which place the walker is standing at (onNear) and
// when they use it (onAction), by pressing E or by tapping the place and
// letting the walker go there.
export class ForecourtScene extends Phaser.Scene {
  constructor(opts) {
    super('forecourt')
    this.opts = opts
    this.facing = 'down'
    this.path = [] // the points a tap sent the walker through
    this.pending = null // the place a tap asked to use once there
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

    // Where you can go: the theatre door and the shops
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

    // The walker
    for (const facing of FACINGS) {
      this.anims.create({
        key: `walk-${facing}`,
        frames: this.anims.generateFrameNumbers('walker', { frames: [0, 1, 2, 3].map((i) => frameOf(facing, i)) }),
        frameRate: 8,
        repeat: -1,
      })
    }
    this.walker = this.add
      .sprite(L.spawn.x, L.spawn.y, 'walker', frameOf('down'))
      .setOrigin(FEET_ORIGIN.x, FEET_ORIGIN.y)
      .setScale(L.walker.scale)
      .setDepth(L.spawn.y)

    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E')
    this.keys.E.on('down', () => this.nearId && this.opts.onAction(this.nearId))

    // A tap on a place sends the walker to it and uses it on arrival; a tap
    // on the ground just sends the walker there.
    this.input.on('gameobjectdown', (_pointer, obj) => {
      const id = obj.getData('place')
      const place = this.places.find((p) => p.id === id)
      if (!place) return
      this.walkTo(place.stand, id)
    })
    this.input.on('pointerdown', (pointer, over) => {
      if (over.length) return
      const b = L.bounds
      this.walkTo({ x: Phaser.Math.Clamp(pointer.worldX, b.x0, b.x1), y: Phaser.Math.Clamp(pointer.worldY, b.y0, b.y1) })
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

    if (vx || vy) {
      this.path = []
      this.pending = null
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
      }
    }

    const moving = vx !== 0 || vy !== 0
    if (moving) {
      const speed = L.width * 0.22
      const len = Math.hypot(vx, vy)
      const step = speed * dt
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
          this.pending = null
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

  // Send the walker to a point, round whatever is in the way; `place` is a
  // place to use once there.
  walkTo(point, place = null) {
    this.path = findPath(this.opts.layout, { x: this.walker.x, y: this.walker.y }, point)
    this.pending = place
    this.stuck = 0
    if (!this.path.length) this.pending = null
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

  // A tap asked to use a place: do it if the walker really got there.
  arrive() {
    this.updateNear()
    if (this.pending && this.pending === this.nearId) this.opts.onAction(this.pending)
    this.pending = null
  }
}
