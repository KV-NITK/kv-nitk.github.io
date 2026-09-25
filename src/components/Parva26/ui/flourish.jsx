// A gold scroll for the corners of painted cards: the interval card
// (Scene 8) and the ಶುಭಂ end card (Scene 12).
export function Flourish({ className }) {
  return (
    <svg viewBox="0 0 60 60" aria-hidden className={className} fill="none" stroke="#c9a052" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 56 C4 26 26 4 56 4" />
      <path d="M11 56 C11 31 31 11 56 11" strokeOpacity=".6" />
      <path d="M4 38 C14 36 20 30 22 20 C24 12 32 8 38 12 C42 15 40 21 35 21 C31 21 30 17 33 16" />
      <circle cx="21" cy="21" r="2.4" fill="#c9a052" stroke="none" />
    </svg>
  )
}
