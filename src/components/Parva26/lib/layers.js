// Big moving pieces get their own compositor layer while they move, so each
// frame only moves what is already painted, and give it up afterwards
// (spec §0, performance rule 2). `value` is what will change, e.g.
// 'transform' or 'opacity'; a falsy value removes the hint.
export function willChange(elements, value) {
  for (const el of elements) if (el) el.style.willChange = value || ''
}
