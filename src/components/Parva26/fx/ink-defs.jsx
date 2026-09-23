// Shared SVG filters, rendered once per page.
// p26-ink: roughened edges and patchy coverage, like a rubber stamp pressed
// unevenly. Use as filter="url(#p26-ink)" on SVG or [filter:url(#p26-ink)].
export function InkDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="p26-ink" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="grit" />
          <feDisplacementMap in="SourceGraphic" in2="grit" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="11" result="patches" />
          <feColorMatrix in="patches" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.35" result="coverage" />
          <feComposite in="rough" in2="coverage" operator="in" />
        </filter>
      </defs>
    </svg>
  )
}
