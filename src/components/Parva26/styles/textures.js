import paperSpecks from '@p26/assets/textures/paper.webp'
import paperMottle from '@p26/assets/textures/paper-mottle.webp'
import woodBase from '@p26/assets/textures/wood.webp'
import woodPores from '@p26/assets/textures/wood-pores.webp'

// Surface materials as small bitmap tiles, baked from SVG noise. A live SVG
// noise texture is recomputed whenever its layer re-rasterises; a bitmap is
// just drawn. Each export is a style object to spread into style={...}.

const ageSpots = [
  'radial-gradient(circle at 14% 78%, rgba(140,90,40,.2) 0 .6%, rgba(140,90,40,.08) 1.4%, transparent 2.4%)',
  'radial-gradient(circle at 83% 12%, rgba(140,90,40,.16) 0 .4%, rgba(140,90,40,.06) 1%, transparent 1.8%)',
  'radial-gradient(circle at 67% 88%, rgba(140,90,40,.14) 0 .3%, transparent 1.2%)',
  'radial-gradient(circle at 28% 20%, rgba(140,90,40,.1) 0 .8%, transparent 2.6%)',
]

// Aged paper: age spots, fine brown specks and blotchy uneven tone, on top of
// the paper colour (bg-paper). The mottle tile is stored small and scaled up.
export const paper = {
  backgroundImage: [...ageSpots, `url(${paperSpecks})`, `url(${paperMottle})`].join(', '),
  backgroundSize: [...ageSpots.map(() => 'auto'), '300px', '600px'].join(', '),
}

// Dark rosewood desk: sideways-stretched grain with a layer of pores on top.
export const wood = {
  backgroundImage: `url(${woodPores}), url(${woodBase})`,
  backgroundSize: '400px 200px, 800px 400px',
}
