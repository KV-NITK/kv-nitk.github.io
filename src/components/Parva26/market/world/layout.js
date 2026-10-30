// Where everything stands on the forecourt, in world pixels. A narrow game
// box (a phone) gets a 3:4 forecourt, anything else a 16:9 one; both are
// fitted to the box, so the numbers only matter relative to each other. `base` is the
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

// A stall against the back wall: it can't be walked behind.
function shop(id, kind, x, base, w, h, wallY) {
  const half = w / 2
  return {
    id,
    kind,
    x,
    base,
    w,
    h,
    blocker: { x0: x - half + 10, x1: x + half - 10, y0: wallY, y1: base },
    // Where you stand to use it, and how close counts as at the door.
    stand: { x, y: base + 60 },
  }
}

// A booth standing out on the cobbles: it can be walked round, so only its
// footprint is solid. You stand in front of its curtain to use it.
function booth(id, kind, x, base, w, h) {
  return {
    id,
    kind,
    x,
    base,
    w,
    h,
    blocker: { x0: x - w / 2 + 24, x1: x + w / 2 - 24, y0: base - 40, y1: base },
    stand: { x, y: base + 38 },
  }
}

export function layoutFor(portrait) {
  const width = portrait ? 1080 : 1920
  const height = portrait ? 1440 : 1080
  const wallY = portrait ? 640 : 470
  const theatre = { x: width / 2, width: portrait ? 960 : 760, top: portrait ? 70 : 40 }
  const door = { x: width / 2, y: wallY + 46 }

  const shops = portrait
    ? [
        shop('food', 'food', 270, 1020, 420, 330, wallY),
        shop('merch', 'merch', 810, 1020, 420, 330, wallY),
        booth('photo', 'photo', 540, 1366, 290, 340),
      ]
    : [
        shop('food', 'food', 330, 650, 420, 330, wallY),
        shop('merch', 'merch', 1590, 650, 420, 330, wallY),
        booth('photo', 'photo', 1230, 966, 320, 390),
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
    // Clear of the photo booth, which stands in the middle of a phone's forecourt
    spawn: portrait ? { x: 270, y: 1250 } : { x: 960, y: 850 },
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
