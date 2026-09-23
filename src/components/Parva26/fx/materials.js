// Metal, wood, cloth and film finishes for the always-on theatre objects,
// built from CSS gradients (no images). Each is a style object to spread into
// style={...}; they are static, so they cost nothing per frame.

// Brushed brass: fine vertical brushing over a warm, top-lit gradient.
export const brass = {
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(255,245,210,.08) 0 1px, transparent 1px 3px), linear-gradient(180deg, #f0d48e 0%, #caa045 35%, #9c6d23 72%, #74501a 100%)',
}

// Sandalwood cut across the grain: growth rings, lit from the top left.
export const sandalRings = {
  backgroundImage:
    'radial-gradient(circle at 32% 28%, rgba(255,238,205,.45), transparent 55%), repeating-radial-gradient(circle at 44% 42%, #c8955f 0 2px, #b7824d 2.6px 3.8px, #d2a06a 4.4px 6px)',
}

// Speaker cloth: a fine woven dot grid on dark fabric.
export const speakerCloth = {
  backgroundImage:
    'radial-gradient(circle, rgba(0,0,0,.6) .8px, transparent 1.2px), radial-gradient(circle at 40% 35%, #6b4a2c, #2e1d10 75%)',
  backgroundSize: '3px 3px, 100% 100%',
}

// A strip of film: sprocket holes along both edges.
export const filmSprockets = {
  backgroundImage:
    'linear-gradient(90deg, rgba(241,223,192,.6) 3px, transparent 3px), linear-gradient(90deg, rgba(241,223,192,.6) 3px, transparent 3px)',
  backgroundSize: '8px 2px, 8px 2px',
  backgroundPosition: '0 2px, 0 calc(100% - 2px)',
  backgroundRepeat: 'repeat-x',
}
