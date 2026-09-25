import { useEffect, useMemo, useRef, useState } from 'react'
import { En } from '@p26/lib/prefs'
import { sayLine } from '@p26/chrome/subtitle-strip'
import { brass } from '@p26/styles/materials'
import { cn } from '@/lib/utils'
import ironGate from '@p26/assets/textures/iron-gate.webp'

// At 10,000 flowers a painted banner unrolls across the top.
export function ThankYouBanner({ subtitles, reduced }) {
  return (
    <div
      className={cn('absolute right-[4%] top-[10%] z-40 hidden w-[min(40rem,50%)] origin-top sm:block', !reduced && 'motion-safe:animate-unroll')}
    >
      <p className="rounded-[2px] border-y-4 border-arishina bg-kumkuma px-4 py-2 text-center text-[#fff4dc] shadow-[0_10px_20px_rgba(0,0,0,.5)]">
        <span lang="kn" className="block font-kn-display text-xl font-extrabold leading-tight lg:text-2xl">
          10,000 ಹೂವು! ಧನ್ಯವಾದ ಅಭಿಮಾನಿಗಳೇ
        </span>
        <En className="block font-poster text-base tracking-[0.2em] lg:text-lg">10,000 flowers! Thank you, fans</En>
      </p>
    </div>
  )
}

// The theatre's entrance: when you reach it, the second-half sign lights up
// and the bell rings. The next scene plays on the screen again.
export function SecondHalfSign({ subtitles }) {
  const ref = useRef(null)
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const seen = new IntersectionObserver(
      ([entry]) => {
        setLit(entry.isIntersecting)
        if (entry.isIntersecting) sayLine('[Second bell rings]', 3000)
      },
      { threshold: 0.6 }
    )
    seen.observe(ref.current)
    return () => seen.disconnect()
  }, [])
  const bulbs = useMemo(() => Array.from({ length: 18 }, (_, i) => i), [])
  return (
    <div className="relative flex min-h-[55svh] flex-col items-center justify-end overflow-hidden px-4 pb-0 pt-16" style={{ backgroundImage: 'linear-gradient(180deg, #1d1a17, #2a2218 60%, #3a2e20)' }}>
      <div ref={ref} className="relative z-10 mb-8 rounded-[4px] border-[3px] border-[#1d1a17] bg-[#2a1a10] px-8 py-4 text-center shadow-[0_10px_20px_rgba(0,0,0,.6)]">
        {bulbs.map((i) => (
          <span
            key={i}
            aria-hidden
            className={cn('absolute size-2 rounded-full transition-[background-color,box-shadow] duration-500', lit ? 'bg-[#ffe6a0] shadow-[0_0_6px_2px_rgba(255,210,120,.8)]' : 'bg-[#4a3a26]')}
            style={i < 9 ? { top: -5, left: `${6 + i * 11}%`, transitionDelay: `${i * 40}ms` } : { bottom: -5, left: `${6 + (i - 9) * 11}%`, transitionDelay: `${i * 40}ms` }}
          />
        ))}
        <p
          lang="kn"
          className={cn(
            'font-kn-display text-3xl font-extrabold leading-tight transition-[color,text-shadow] duration-700 sm:text-4xl',
            lit ? 'text-[#ffe6a8] [text-shadow:0_0_8px_rgba(255,200,90,.9),0_0_22px_rgba(255,160,60,.5)]' : 'text-[#6b5a40]'
          )}
        >
          ದ್ವಿತೀಯಾರ್ಧ ಆರಂಭ
        </p>
        <p className={cn('font-poster text-lg tracking-[0.25em] transition-colors duration-700', lit ? 'text-[#ffe6a8]/80' : 'text-[#6b5a40]', !subtitles && 'sr-only')}>
          The second half is starting
        </p>
      </div>
      {/* The entrance, warm inside, with the gate folded to one side */}
      <div aria-hidden className="relative h-40 w-[min(90%,34rem)] rounded-t-[1.5rem] bg-[#140c08] shadow-[0_0_40px_10px_rgba(255,190,110,.18)] sm:h-52" style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at 50% 100%, rgba(255,196,120,.55), transparent 70%)' }}>
        <span className="absolute inset-y-0 left-0 w-6" style={{ backgroundImage: `url(${ironGate})`, backgroundSize: '0.9rem 3rem' }} />
        <span className="absolute inset-y-0 right-0 w-6" style={{ backgroundImage: `url(${ironGate})`, backgroundSize: '0.9rem 3rem' }} />
        <span className="absolute inset-x-0 bottom-0 h-2" style={brass} />
      </div>
    </div>
  )
}
