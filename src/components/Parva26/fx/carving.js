// Carved sandalwood, lit from below by the footlights (brief, Scene 1). Every
// carving is drawn three times: a dark copy nudged up (the upper edges fall
// into shadow), a pale copy nudged down (the lower edges catch the light),
// then the sandalwood face on top. It reads as relief without a lighting
// filter, so nothing is recomputed per frame.

export const SANDAL = '#c8955f'
export const RECESS = '#4a2913'
const SHADOW = '#2a1407'
const LIT = '#f4d09a'

function relief(markup, depth) {
  return [
    `<g transform="translate(0 ${-depth})" fill="${SHADOW}" stroke="${SHADOW}">${markup}</g>`,
    `<g transform="translate(0 ${depth})" fill="${LIT}" stroke="${LIT}">${markup}</g>`,
    `<g fill="${SANDAL}" stroke="${SANDAL}">${markup}</g>`,
  ].join('')
}

const dataUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

// One repeat of the vine frieze, 60 × 40: a scrolling vine with a leaf on
// each curl, small flowers, and a bead moulding along both edges.
const VINE = [
  '<path d="M0 20 C10 8 20 8 30 20 S50 32 60 20" fill="none" stroke-width="3.4" stroke-linecap="round"/>',
  '<path d="M15 12 C18 4 25 3 28 5 C24 10 20 13 15 12 Z" stroke="none"/>',
  '<path d="M45 28 C42 36 35 37 32 35 C36 30 40 27 45 28 Z" stroke="none"/>',
  '<circle cx="7" cy="30" r="2.8" stroke="none"/>',
  '<circle cx="53" cy="10" r="2.8" stroke="none"/>',
  ...[3, 9, 15, 21, 27, 33, 39, 45, 51, 57].flatMap((x) => [
    `<circle cx="${x}" cy="3" r="1.7" stroke="none"/>`,
    `<circle cx="${x}" cy="37" r="1.7" stroke="none"/>`,
  ]),
].join('')

// The frieze along the top of the arch.
export const vineAcross = {
  backgroundColor: RECESS,
  backgroundImage: dataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">${relief(VINE, 1.2)}</svg>`),
  backgroundSize: 'auto 100%',
  backgroundRepeat: 'repeat-x',
}

// The same frieze turned upright for the sides. The turn is inside the
// relief, so the light still comes from below.
export const vineDown = {
  backgroundColor: RECESS,
  backgroundImage: dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 60">${relief(`<g transform="translate(40 0) rotate(90)">${VINE}</g>`, 1.2)}</svg>`
  ),
  backgroundSize: '100% auto',
  backgroundRepeat: 'repeat-y',
}

// For inline SVG carvings (crest, parrots, elephants): same three copies.
export function reliefLayers(depth = 1.2) {
  return [
    { key: 'shadow', dy: -depth, fill: SHADOW },
    { key: 'lit', dy: depth, fill: LIT },
    { key: 'face', dy: 0, fill: SANDAL },
  ]
}
