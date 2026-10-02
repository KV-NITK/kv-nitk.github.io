import { blockedAt } from '@p26/market/world/layout'

// Finding a way round the shops for a tap. The forecourt is cut into cells
// small enough for the walker to fit through the gaps; a cell is free when a
// walker standing in its middle touches nothing solid. A* finds the shortest
// run of free cells, and the run is then pulled straight wherever a straight
// line is clear. No Phaser in here.

const CELL = 24
const grids = new WeakMap()

function gridFor(L) {
  let grid = grids.get(L)
  if (!grid) {
    const cols = Math.ceil(L.width / CELL)
    const rows = Math.ceil(L.height / CELL)
    const free = new Uint8Array(cols * rows)
    const b = L.bounds
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * CELL + CELL / 2
        const y = r * CELL + CELL / 2
        free[r * cols + c] = x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1 && !blockedAt(L, x, y) ? 1 : 0
      }
    }
    grid = { cols, rows, free }
    grids.set(L, grid)
  }
  return grid
}

const cellOf = (grid, p) => ({
  c: Math.min(grid.cols - 1, Math.max(0, Math.floor(p.x / CELL))),
  r: Math.min(grid.rows - 1, Math.max(0, Math.floor(p.y / CELL))),
})
const centre = (c, r) => ({ x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 })

// The nearest free cell to a cell, searching outward in rings.
function nearestFree(grid, { c, r }) {
  if (grid.free[r * grid.cols + c]) return { c, r }
  for (let d = 1; d < 60; d++) {
    let best = null
    let bestDist = Infinity
    for (let dr = -d; dr <= d; dr++) {
      for (let dc = -d; dc <= d; dc++) {
        if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue
        const cc = c + dc
        const rr = r + dr
        if (cc < 0 || rr < 0 || cc >= grid.cols || rr >= grid.rows || !grid.free[rr * grid.cols + cc]) continue
        const dist = dc * dc + dr * dr
        if (dist < bestDist) {
          best = { c: cc, r: rr }
          bestDist = dist
        }
      }
    }
    if (best) return best
  }
  return { c, r }
}

// A small binary heap of [priority, cell index].
class Heap {
  constructor() {
    this.a = []
  }
  get size() {
    return this.a.length
  }
  push(item) {
    const a = this.a
    a.push(item)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()
    if (a.length) {
      a[0] = last
      let i = 0
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

const NEIGHBOURS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
]

function clearLine(L, a, b) {
  const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 10)
  for (let i = 1; i <= steps; i++) {
    if (blockedAt(L, a.x + ((b.x - a.x) * i) / steps, a.y + ((b.y - a.y) * i) / steps)) return false
  }
  return true
}

// The points to walk through, in order, from `from` to `to` (or as near to it
// as can be reached). Empty if there is nowhere to go.
export function findPath(L, from, to) {
  const grid = gridFor(L)
  const { cols, free } = grid
  const start = nearestFree(grid, cellOf(grid, from))
  const goal = nearestFree(grid, cellOf(grid, to))
  const startI = start.r * cols + start.c
  const goalI = goal.r * cols + goal.c

  const cost = new Float32Array(free.length).fill(Infinity)
  const came = new Int32Array(free.length).fill(-1)
  const heap = new Heap()
  const h = (c, r) => {
    const dx = Math.abs(c - goal.c)
    const dy = Math.abs(r - goal.r)
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy)
  }
  cost[startI] = 0
  heap.push([h(start.c, start.r), startI])
  while (heap.size) {
    const [, i] = heap.pop()
    if (i === goalI) break
    const c = i % cols
    const r = (i / cols) | 0
    for (const [dc, dr, step] of NEIGHBOURS) {
      const cc = c + dc
      const rr = r + dr
      if (cc < 0 || rr < 0 || cc >= cols || rr >= grid.rows) continue
      const j = rr * cols + cc
      if (!free[j]) continue
      // No cutting a corner of a shop
      if (dc && dr && (!free[r * cols + cc] || !free[rr * cols + c])) continue
      const next = cost[i] + step
      if (next < cost[j]) {
        cost[j] = next
        came[j] = i
        heap.push([next + h(cc, rr), j])
      }
    }
  }
  if (came[goalI] === -1 && goalI !== startI) return []

  const cells = []
  for (let i = goalI; i !== -1; i = came[i]) cells.push(centre(i % cols, (i / cols) | 0))
  cells.reverse()
  // The last point is exactly where the tap was, if that spot is open
  const b = L.bounds
  const exact = to.x >= b.x0 && to.x <= b.x1 && to.y >= b.y0 && to.y <= b.y1 && !blockedAt(L, to.x, to.y)
  if (exact) cells[cells.length - 1] = { x: to.x, y: to.y }

  // Pull the run straight where the way is clear
  const out = []
  let here = { x: from.x, y: from.y }
  let i = 0
  while (i < cells.length) {
    let j = cells.length - 1
    while (j > i && !clearLine(L, here, cells[j])) j--
    out.push(cells[j])
    here = cells[j]
    i = j + 1
  }
  return out
}
