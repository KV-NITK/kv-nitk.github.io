import { useEffect, useState } from 'react'
import { toKannadaDigits } from './text'
import { brass } from './fx/materials'
import { paper } from './fx/textures'
import { cn } from '../../lib/utils'

// The side walls (brief, Scene 1): dusty plaster in the dark, carved pillars,
// brass wall lamps with fluted glass shades that throw a scallop of light up
// and down the wall, a round wall clock keeping real time and a green exit
// sign low on the left wall (the right wall holds the show board). Desktop only: on phones the camera is
// too close to the stage to see the walls.
export function TheatreWalls({ className, ref }) {
  return (
    <div ref={ref} data-fade className={cn('pointer-events-none absolute inset-0 hidden lg:block', className)}>
      {/* Plaster: the paper tile's mottle, pushed dark */}
      <div aria-hidden className="absolute inset-0 opacity-[0.07]" style={paper} />

      <Pillar className="left-[6.5%]" />
      <Pillar className="left-[96.5%]" />

      <WallLamp className="left-[14.5%] top-[38%]" />
      <WallLamp className="left-[81.8%] top-[38%]" />

      <WallClock className="left-[6.5%] top-[17%]" />
      <ExitSign className="bottom-[7%] left-[2.5%]" />
    </div>
  )
}

// A fluted plaster pillar with a carved capital and base, lit by the nearest
// wall lamp from the side facing the stage.
function Pillar({ className }) {
  return (
    <div aria-hidden className={cn('absolute bottom-[28%] top-[4%] w-[2.6rem] -translate-x-1/2', className)}>
      <div className="absolute inset-x-0 top-0 h-5 rounded-t-[3px] bg-linear-to-b from-[#4a3526] to-[#2a1d14] shadow-[0_4px_6px_rgba(0,0,0,.6)]" />
      <div
        className="absolute inset-x-1 bottom-5 top-5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,.35) 0 2px, rgba(255,225,180,.06) 3px, transparent 6px 8px), linear-gradient(90deg, #1c140e, #3a2a1e 45%, #22180f)',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-5 rounded-b-[3px] bg-linear-to-b from-[#2a1d14] to-[#15100a]" />
    </div>
  )
}

// A brass bracket holding an upturned tulip of fluted glass.
function WallLamp({ className }) {
  return (
    <div aria-hidden className={cn('absolute -translate-x-1/2', className)}>
      {/* Scallops of light on the plaster, strongest above the open shade */}
      <div className="absolute left-1/2 top-1/2 h-72 w-40 -translate-x-1/2 -translate-y-[62%] bg-radial-[ellipse_50%_50%_at_50%_40%] from-[#ffc98a]/22 via-[#ffb870]/6 via-45% to-transparent" />
      <div className="relative flex flex-col items-center">
        <div
          className="h-7 w-6 rounded-t-[50%_40%] rounded-b-[40%_60%] shadow-[0_0_22px_8px_rgba(255,190,110,.4)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,.22) 0 1px, transparent 1px 4px), radial-gradient(ellipse at 50% 20%, #fff6dc, #ffd08a 45%, #c98a3a)',
          }}
        />
        <div className="h-1.5 w-4 rounded-b-[3px]" style={brass} />
        <div className="h-3 w-1" style={brass} />
        <div className="h-2 w-6 rounded-[2px] shadow-[0_2px_3px_rgba(0,0,0,.6)]" style={brass} />
      </div>
    </div>
  )
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

// Brass-rimmed wall clock with Kannada numerals at the quarters and the real
// local time. Its label goes to the subtitle strip.
function WallClock({ className }) {
  const now = useNow()
  const s = now.getSeconds()
  const m = now.getMinutes() + s / 60
  const h = (now.getHours() % 12) + m / 60
  const label = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })

  return (
    <div
      className={cn('pointer-events-auto absolute size-[4.2rem] -translate-x-1/2 rounded-full p-[4px] shadow-[0_6px_12px_rgba(0,0,0,.7)]', className)}
      style={brass}
      data-en={`Wall clock · ${label}`}
    >
      <div className="relative size-full rounded-full bg-radial from-[#f1e6cc] to-[#c9b48c] shadow-[inset_0_1px_4px_rgba(0,0,0,.5)]">
        {[0, 3, 6, 9].map((hour) => (
          <span
            key={hour}
            lang="kn"
            aria-hidden
            className="absolute left-1/2 top-1/2 font-kn-serif text-[0.55rem] font-bold leading-none text-[#3b2a1a]"
            style={{ transform: `translate(-50%, -50%) rotate(${hour * 30}deg) translateY(-1.45rem) rotate(${-hour * 30}deg)` }}
          >
            {toKannadaDigits(hour || 12)}
          </span>
        ))}
        {Array.from({ length: 12 }, (_, i) => i % 3 !== 0 && (
          <span key={i} aria-hidden className="absolute left-1/2 top-1/2 h-1 w-px bg-[#3b2a1a]/70" style={{ transform: `rotate(${i * 30}deg) translateY(-1.55rem)` }} />
        ))}
        <Hand angle={h * 30} className="h-[0.95rem] w-[2.5px]" />
        <Hand angle={m * 6} className="h-[1.35rem] w-[1.5px]" />
        <Hand angle={s * 6} className="h-[1.45rem] w-px bg-kumkuma" />
        <span aria-hidden className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={brass} />
        {/* Glass glare, and the warm light of the lamp beside it */}
        <span aria-hidden className="absolute inset-0 rounded-full bg-linear-to-br from-white/25 via-transparent via-40% to-[#ffb870]/15" />
      </div>
    </div>
  )
}

function Hand({ angle, className }) {
  return (
    <span
      aria-hidden
      className={cn('absolute bottom-1/2 left-1/2 origin-bottom rounded-full bg-[#1e1610]', className)}
      style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
    />
  )
}

// A green-lit exit box and the glow it leaves on the wall.
function ExitSign({ className }) {
  return (
    <div className={cn('pointer-events-auto absolute', className)} data-en="Exit">
      <div aria-hidden className="absolute -inset-10 bg-radial from-[#3cd67a]/16 to-transparent to-70%" />
      <div className="relative rounded-[3px] border border-[#2c5a3a] bg-[#0d2616] px-2 pb-0.5 pt-1 text-center shadow-[0_0_14px_3px_rgba(60,210,120,.32),inset_0_0_8px_rgba(120,255,170,.25)]">
        <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight text-[#c6ffd9] [text-shadow:0_0_6px_rgba(110,255,160,.9)]">
          ನಿರ್ಗಮನ
        </span>
        <span aria-hidden className="block font-poster text-[0.55rem] leading-none tracking-[0.3em] text-[#9df2b9]">EXIT →</span>
      </div>
    </div>
  )
}
