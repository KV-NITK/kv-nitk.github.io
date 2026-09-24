import { useEffect, useRef } from 'react'
import { gsap } from './fx/gsap'
import { usePrefersReducedMotion } from './fx/use-reduced-motion'
import { cn } from '../../lib/utils'

// The people a few rows ahead (brief, Scene 1 and 2), seen from behind as
// dark shapes with the screen's gold light along their edges. When ಪರ್ವ lands
// two of them turn to each other and the child on a lap throws both hands up;
// after that somebody shifts in their seat every few seconds.
//
// Every figure is drawn in a 100 × 100 box, shoulders at the bottom.

const SHOULDERS = 'M2 100 C4 82 18 74 36 71 C40 70 42 66 42 60 L58 60 C58 66 60 70 64 71 C82 74 96 82 98 100 Z'
const HEAD = 'M50 16 C62 16 69 26 69 40 C69 52 63 62 50 62 C37 62 31 52 31 40 C31 26 38 16 50 16 Z'
const EARS = 'M31.5 37 C27 37 27 46 31.5 47 Z M68.5 37 C73 37 73 46 68.5 47 Z'

const FIGURES = {
  // Short hair
  man: <path d={`${SHOULDERS} ${HEAD} ${EARS}`} />,
  // Balding: the crown catches more light
  elder: (
    <>
      <path d={`${SHOULDERS} ${HEAD} ${EARS}`} />
      <path d="M40 20 C46 16 54 16 60 20 C56 19 44 19 40 20 Z" fill="#6a5238" stroke="none" />
    </>
  ),
  // Hair up in a bun, ringed with a string of jasmine (ಮಲ್ಲಿಗೆ)
  bun: (
    <>
      <path d={`${SHOULDERS} ${HEAD}`} />
      <circle cx="50" cy="58" r="11" />
      <g fill="#f4eedc" stroke="none">
        {Array.from({ length: 11 }, (_, i) => {
          const a = Math.PI * (1.05 + (i / 10) * 0.9)
          return <ellipse key={i} cx={50 + Math.cos(a) * 12} cy={58 + Math.sin(a) * 12} rx="1.9" ry="1.3" transform={`rotate(${(a * 180) / Math.PI + 90} ${50 + Math.cos(a) * 12} ${58 + Math.sin(a) * 12})`} />
        })}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={`s${i}`} cx={61 + i * 0.8} cy={62 + i * 4} rx="1.3" ry="1.8" />
        ))}
      </g>
    </>
  ),
  // A long plait down the back with a few flowers at the top
  plait: (
    <>
      <path d={`${SHOULDERS} ${HEAD}`} />
      <path d="M45 58 C43 68 47 76 45 86 C44 92 46 97 45 100 L55 100 C54 97 56 92 55 86 C53 76 57 68 55 58 Z" fill="#1d130d" />
      <g fill="#f4eedc" stroke="none">
        <circle cx="47" cy="62" r="1.5" />
        <circle cx="51" cy="61" r="1.5" />
        <circle cx="54" cy="63" r="1.4" />
      </g>
    </>
  ),
  // Gandhi cap
  cap: (
    <>
      <path d={`${SHOULDERS} ${HEAD} ${EARS}`} />
      <path d="M30 28 L70 28 L67 14 C60 9 40 9 33 14 Z" fill="#8a7e6a" />
    </>
  ),
  // Teenager with untidy hair
  teen: <path d={`${SHOULDERS} M50 13 L54 9 L56 15 L61 11 L62 18 L67 17 L66 24 C69 30 69 36 69 40 C69 52 63 62 50 62 C37 62 31 52 31 40 C31 33 32 27 35 22 L33 16 L39 17 L41 11 L46 15 Z ${EARS}`} />,
}

// A parent with a child on the lap. The child's arms go up on cue.
function ParentAndChild() {
  return (
    <>
      <path d={`${SHOULDERS} ${HEAD}`} />
      <g data-child>
        <g data-arms opacity="0">
          <path d="M72 58 C70 46 68 38 66 30 L70 29 C72 37 75 46 77 56 Z" />
          <path d="M86 58 C88 46 90 38 92 30 L88 29 C86 37 83 46 81 56 Z" />
        </g>
        <circle cx="79" cy="56" r="10" />
        <circle cx="70" cy="50" r="3.2" />
        <circle cx="88" cy="50" r="3.2" />
      </g>
    </>
  )
}

function Figure({ kind, className, style }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden data-figure className={cn('absolute overflow-visible', className)} style={style}>
      <g data-head fill="#0b0705" stroke="url(#p26-rim)" strokeWidth="2.2">
        {kind === 'family' ? <ParentAndChild /> : FIGURES[kind]}
      </g>
    </svg>
  )
}

// Seat tops of a row further ahead: a repeating wooden-railed back, with the
// screen light on each rail.
const SEAT_TOP = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" preserveAspectRatio="none"><path d="M3 30 L3 9 C3 4 7 2 11 2 L49 2 C53 2 57 4 57 9 L57 30 Z" fill="#4a0c16"/><path d="M3 9 C3 4 7 2 11 2 L49 2 C53 2 57 4 57 9 L57 11 L3 11 Z" fill="#2e1a0e"/><path d="M5 5 C7 3 9 2.6 11 2.6 L49 2.6 C51 2.6 53 3 55 5" fill="none" stroke="#e8b76a" stroke-opacity=".55" stroke-width="1.1"/></svg>'
)}")`

function SeatTops({ className, size }) {
  return <div aria-hidden className={cn('absolute inset-x-[-2%]', className)} style={{ backgroundImage: SEAT_TOP, backgroundSize: `${size} 100%`, backgroundRepeat: 'repeat-x' }} />
}

export function Audience({ className }) {
  const rootRef = useRef(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const root = rootRef.current
    const heads = Array.from(root.querySelectorAll('[data-head]'))
    const [left, right] = ['[data-pair=left] [data-head]', '[data-pair=right] [data-head]'].map((s) => root.querySelector(s))
    const arms = root.querySelector('[data-arms]')
    let shifter = 0

    // Figures lean from the base of the shoulders; the arms grow up from the child.
    gsap.set(heads, { transformOrigin: '50% 100%' })
    gsap.set(arms, { transformOrigin: '50% 100%', scaleY: 0 })

    const react = () => {
      gsap.timeline()
        .to(left, { rotation: 7, x: 2, duration: 0.35, ease: 'power2.out' }, 0)
        .to(right, { rotation: -7, x: -2, duration: 0.35, ease: 'power2.out' }, 0.1)
        .to(arms, { autoAlpha: 1, scaleY: 1, duration: 0.3, ease: 'back.out(2)' }, 0.15)
        .to(arms, { rotation: 5, yoyo: true, repeat: 3, duration: 0.18, ease: 'sine.inOut' }, 0.45)
        .to([left, right], { rotation: 0, x: 0, duration: 0.6, ease: 'power2.inOut' }, 1.8)
        .to(arms, { scaleY: 0, rotation: 0, duration: 0.35, ease: 'power2.in' }, 1.9)
        .set(arms, { autoAlpha: 0 })
      // Somebody settles in their seat now and then.
      const shift = () => {
        const head = heads[Math.floor(Math.random() * heads.length)]
        gsap.to(head, { x: gsap.utils.random(-3, 3), rotation: gsap.utils.random(-4, 4), duration: 0.5, yoyo: true, repeat: 1, repeatDelay: 1.2, ease: 'sine.inOut' })
        shifter = setTimeout(shift, gsap.utils.random(2500, 5500))
      }
      shifter = setTimeout(shift, 3500)
    }

    window.addEventListener('p26:title-landed', react, { once: true })
    return () => {
      window.removeEventListener('p26:title-landed', react)
      clearTimeout(shifter)
      gsap.killTweensOf([...heads, arms])
    }
  }, [reduced])

  return (
    <div ref={rootRef} aria-hidden className={cn('pointer-events-none absolute inset-x-0 h-[11rem] lg:h-[12rem]', className)}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="p26-rim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffd08a" stopOpacity=".9" />
            <stop offset=".35" stopColor="#e8a85a" stopOpacity=".35" />
            <stop offset=".6" stopColor="#e8a85a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Light from the stage behind them, so the heads read as dark shapes */}
      <div className="absolute inset-x-0 bottom-0 h-[130%] bg-radial-[ellipse_75%_55%_at_50%_100%] from-[#8a5e34]/40 via-[#3a2414]/12 via-60% to-transparent" />

      {/* Row 5 */}
      <Figure kind="elder" className="bottom-[4.4rem] left-[25%] hidden w-[5.4vw] lg:block" />
      <Figure kind="man" className="bottom-[4.4rem] left-[69%] hidden w-[5.6vw] lg:block" />
      <Figure kind="plait" className="bottom-[4.4rem] left-[88%] hidden w-[5.4vw] lg:block" />
      <SeatTops className="bottom-[3.1rem] hidden h-[1.9rem] lg:block" size="5.4vw" />

      {/* Row 6 */}
      <div data-pair="left">
        <Figure kind="bun" className="bottom-[1rem] left-[0%] w-[19vw] sm:left-[3%] sm:w-[10vw] lg:w-[8.4vw]" />
      </div>
      <div data-pair="right">
        <Figure kind="teen" className="bottom-[1rem] left-[11%] hidden w-[8.2vw] lg:block" />
      </div>
      <Figure kind="family" className="bottom-[1rem] right-[-1%] w-[21vw] sm:right-[3%] sm:w-[11vw] lg:left-[20%] lg:right-auto lg:w-[9vw]" />
      <SeatTops className="-bottom-[0.6rem] h-[2.6rem] lg:h-[3rem]" size="max(7.6vw, 5rem)" />
    </div>
  )
}

// The man in the cap, one seat to the right in the row just ahead.
export function RowSevenNeighbour() {
  return <Figure kind="cap" className="bottom-[calc(100%-5.4rem)] left-[5%] w-[30%]" />
}
