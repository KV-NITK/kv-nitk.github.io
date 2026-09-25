import { useEffect, useRef } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { ACTS } from '@p26/content'
import { useCurrentScene } from '@p26/lib/use-current-scene'
import { filmSprockets } from '@p26/styles/materials'
import { paper } from '@p26/styles/textures'

const R_FULL = 27 // film wound all the way out to the flange
const R_HUB = 10

// Bottom-left progress reel (spec §2). It turns as fast as you scroll, the
// film wound on it thins out as the show goes on, and a strip of film runs off
// it to a paper tag naming the current act. Updates happen only on scroll and
// touch a few small elements, so the reel costs nothing while the page is still.
// On phones it would sit over content, so there it only shows while
// scrolling (like a scrollbar) and never takes taps.
export function FilmReel() {
  const { subtitles } = usePrefs()
  const scene = useCurrentScene()
  const act = ACTS[scene?.act ?? 'first-half']
  const barRef = useRef(null)
  const spinRef = useRef(null)
  const filmRef = useRef(null)
  const sprocketRef = useRef(null)

  useEffect(() => {
    let raf = 0
    let fade = 0
    const update = () => {
      raf = 0
      barRef.current.dataset.scrolling = 'true'
      clearTimeout(fade)
      fade = setTimeout(() => { barRef.current.dataset.scrolling = 'false' }, 1500)
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? Math.min(y / max, 1) : 0
      spinRef.current.style.transform = `rotate(${y * 0.6}deg)`
      filmRef.current.setAttribute('r', R_HUB + (R_FULL - R_HUB) * (1 - progress))
      sprocketRef.current.style.transform = `translateX(${-((y * 0.6) % 8)}px)`
      barRef.current.setAttribute('aria-valuenow', Math.round(progress * 100))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(fade)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div
      ref={barRef}
      role="progressbar"
      aria-label="Show progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={act.en}
      data-en={`Now playing: ${act.en}`}
      className="fixed bottom-3 left-3 z-50 flex items-center transition-opacity duration-300 max-sm:pointer-events-none max-sm:opacity-0 max-sm:data-[scrolling=true]:opacity-100 sm:bottom-5 sm:left-5"
    >
      <div className="relative z-10 drop-shadow-[0_3px_4px_rgba(0,0,0,.6)]">
        <div ref={spinRef} className="size-11 will-change-transform sm:size-14">
          <ReelSvg filmRef={filmRef} />
        </div>
      </div>

      <div aria-hidden className="-ml-1.5 h-3.5 w-6 overflow-hidden bg-[#2b1a0e]/90 sm:w-9">
        <div ref={sprocketRef} className="h-full w-[calc(100%+8px)]" style={filmSprockets} />
      </div>

      {/* Remounts per act so the tag swings when the act changes */}
      <div
        key={act.en}
        className="relative origin-left rounded-r-sm bg-paper py-1 pl-3.5 pr-2.5 text-print shadow-[0_2px_5px_rgba(0,0,0,.5)] motion-safe:animate-tag-swing"
        style={paper}
      >
        <span aria-hidden className="absolute left-1 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-theatre shadow-[inset_0_1px_1px_rgba(0,0,0,.6)]" />
        <span lang="kn" className="block font-kn-serif text-xs font-bold leading-tight sm:text-sm">{act.kn}</span>
        {subtitles && <span className="block font-typewriter text-[0.6rem] leading-tight text-print/70">{act.en}</span>}
      </div>
    </div>
  )
}

// A metal reel seen from the front: film wound on the hub shows through three
// windows in the flange, and the back flange shows as the film runs out.
function ReelSvg({ filmRef }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="size-full">
      <defs>
        <linearGradient id="p26-reel-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6e3dc" />
          <stop offset=".45" stopColor="#a9a59c" />
          <stop offset="1" stopColor="#5d5a54" />
        </linearGradient>
        <mask id="p26-reel-windows">
          <circle cx="32" cy="32" r="31" fill="white" />
          {[0, 120, 240].map((angle) => (
            <ellipse key={angle} cx="32" cy="15" rx="8" ry="9.5" fill="black" transform={`rotate(${angle} 32 32)`} />
          ))}
        </mask>
      </defs>
      <circle cx="32" cy="32" r="31" fill="#4a4741" />
      <circle ref={filmRef} cx="32" cy="32" r={R_FULL} fill="#2b1a0e" stroke="#4a3120" strokeWidth=".6" />
      <circle cx="32" cy="32" r="31" fill="url(#p26-reel-metal)" mask="url(#p26-reel-windows)" />
      <circle cx="32" cy="32" r="30.3" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth=".8" />
      <circle cx="32" cy="32" r="7" fill="url(#p26-reel-metal)" stroke="#3a3833" strokeWidth=".8" />
      <rect x="30.6" y="26.2" width="2.8" height="2.4" fill="#1b1a18" />
      <rect x="30.6" y="26.2" width="2.8" height="2.4" fill="#1b1a18" transform="rotate(120 32 32)" />
      <rect x="30.6" y="26.2" width="2.8" height="2.4" fill="#1b1a18" transform="rotate(240 32 32)" />
      <circle cx="32" cy="32" r="2" fill="#1b1a18" />
    </svg>
  )
}
