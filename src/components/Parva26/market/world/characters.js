// The two walkers you can pick on the market page. Each sheet is 4 rows of 4
// frames, 192 × 288 each. They are drawn at 3x, so show them at a third of
// that size or smaller. A row is a facing; across a row is the walk cycle,
// where the first frame (and the third) is the standing pose.
// scripts/market-characters/ redraws the sheets.
import boy from '@p26/market/assets/characters/boy.webp'
import girl from '@p26/market/assets/characters/girl.webp'

export const FRAME = { width: 192, height: 288 }
export const FRAMES_PER_ROW = 4
export const FACING_ROW = { down: 0, left: 1, right: 2, up: 3 }
// Where the feet and their shadow sit in a frame, so a sprite placed on the
// ground stands on it.
export const FEET_ORIGIN = { x: 0.5, y: 0.92 }

// Frame number of a facing at a step of the walk (0–3).
export const frameOf = (facing, step = 0) => FACING_ROW[facing] * FRAMES_PER_ROW + step

// TODO(content): proofread the Kannada.
export const CHARACTERS = [
  { id: 'boy', sheet: boy, kn: 'ಹುಡುಗ', en: 'Boy' },
  { id: 'girl', sheet: girl, kn: 'ಹುಡುಗಿ', en: 'Girl' },
]
