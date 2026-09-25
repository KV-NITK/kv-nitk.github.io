// The ಪರ್ವ title lettering's depth (Scene 2), reused on the 2026 frame of
// the rewind bench (Scene 10).
// A 70s–80s Kannada film title: deep brown block extrusion down and to the
// right, from the lit front face to the dark back.
export const EXTRUSION = (() => {
  const steps = 12
  const step = 0.0072
  const shades = ['#7a3710', '#6a2e0c', '#5a270a', '#4b2008', '#3e1a06', '#331505']
  const layers = Array.from({ length: steps }, (_, i) => {
    const d = ((i + 1) * step).toFixed(4)
    return `${d}em ${d}em 0 ${shades[Math.floor((i / steps) * shades.length)]}`
  })
  const depth = (steps * step).toFixed(3)
  layers.push(`${depth}em ${depth}em 0.12em rgba(0,0,0,.55)`)
  return layers.join(', ')
})()
