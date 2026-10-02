// Where everything stands on the forecourt, in world pixels. A phone held
// upright gets a tall forecourt, anything else a wide one; both are fitted to
// the screen, so the numbers only matter relative to each other. `base` is the
// ground line a building stands on, and the walker's feet are what is tested
// against the blockers.
//
// No Phaser in here, so the page can read it before the game has loaded.

// The walker's footprint on the ground, and how big the sprite is drawn. A
// phone's forecourt is shown smaller, so its walker is drawn bigger.
function walkerFor(portrait) {
  const scale = portrait ? 0.62 : 0.5
  return { scale, halfWidth: 44 * scale, up: 16 * scale, down: 8 * scale }
}

function shop(id, kind, x, base, w, h, wallY, free) {
  const half = w / 2
  return {
    id,
    kind,
    x,
    base,
    w,
    h,
    // A shop on the back wall can't be walked behind; a free-standing one is
    // blocked around its foot, deep enough that you don't vanish behind it.
    blocker: free
      ? { x0: x - half * 0.86, x1: x + half * 0.86, y0: base - 150, y1: base }
      : { x0: x - half + 10, x1: x + half - 10, y0: wallY, y1: base },
    // Where you stand to use it, and how close counts as at the door.
    stand: { x, y: base + 60 },
  }
}

export function layoutFor(portrait) {
  const width = portrait ? 1080 : 1920
  const height = portrait ? 1800 : 1080
  const wallY = portrait ? 640 : 470
  const theatre = { x: width / 2, width: portrait ? 960 : 760, top: portrait ? 70 : 40 }
  const door = { x: width / 2, y: wallY + 46 }

  const shops = portrait
    ? [
        shop('food', 'food', 270, 1020, 420, 330, wallY, false),
        shop('merch', 'merch', 810, 1020, 420, 330, wallY, false),
        shop('photo', 'photo', 540, 1470, 340, 380, wallY, true),
      ]
    : [
        shop('food', 'food', 330, 650, 420, 330, wallY, false),
        shop('merch', 'merch', 1590, 650, 420, 330, wallY, false),
        shop('photo', 'photo', 960, 930, 340, 380, wallY, true),
      ]

  const lampBase = (x, y) => ({ x, base: y, blocker: { x0: x - 14, x1: x + 14, y0: y - 10, y1: y } })
  const lamps = portrait
    ? [lampBase(80, 800), lampBase(1000, 800), lampBase(540 - 330, wallY + 70), lampBase(540 + 330, wallY + 70)]
    : [lampBase(90, 800), lampBase(1830, 800), lampBase(960 - 330, wallY + 70), lampBase(960 + 330, wallY + 70)]

  return {
    portrait,
    width,
    height,
    wallY,
    theatre,
    door,
    shops,
    lamps,
    walker: walkerFor(portrait),
    // The walkable area, for the feet.
    bounds: { x0: 60, x1: width - 60, y0: wallY + 10, y1: height - 30 },
    blockers: [...shops.map((s) => s.blocker), ...lamps.map((l) => l.blocker)],
    spawn: portrait ? { x: 300, y: 1260 } : { x: 620, y: 780 },
  }
}

// Does a walker standing at (x, y) overlap anything solid?
export function blockedAt(layout, x, y) {
  const { halfWidth, up, down } = layout.walker
  const x0 = x - halfWidth
  const x1 = x + halfWidth
  const y0 = y - up
  const y1 = y + down
  return layout.blockers.some((b) => x0 < b.x1 && x1 > b.x0 && y0 < b.y1 && y1 > b.y0)
}
