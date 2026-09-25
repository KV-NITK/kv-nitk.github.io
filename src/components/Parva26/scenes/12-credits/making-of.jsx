import { useEffect, useRef, useState } from 'react'
import { En } from '@p26/lib/prefs'
import { CONTACT } from '@p26/content'
import { useOnScreen } from '@p26/lib/on-screen'
import { cn } from '@/lib/utils'
import { GLOW } from '@p26/scenes/12-credits/glow'

const photos = Object.values(import.meta.glob('@p26/assets/making-of/*.webp', { eager: true, query: '?url', import: 'default' }))

// The "making of" inset: photos from past Parvas and the club, each one
// starting in sepia and turning to colour before the next comes in. It is
// also the way to the full gallery.
export function MakingOf({ ref, reduced, subtitles }) {
  const [i, setI] = useState(0)
  const [developed, setDeveloped] = useState(false)
  const boxRef = useRef(null)

  const live = useOnScreen(boxRef)
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setI((n) => (n + 1) % photos.length), 4200)
    return () => clearInterval(id)
  }, [live])
  // Each photo comes in sepia and develops into colour.
  useEffect(() => {
    setDeveloped(false)
    if (!live) return
    const id = setTimeout(() => setDeveloped(true), 250)
    return () => clearTimeout(id)
  }, [i, live])

  return (
    <div ref={ref} className="w-full max-w-sm justify-self-center lg:self-start">
      <div ref={boxRef} className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#0d0b09] shadow-[0_0_0_1px_rgba(241,223,192,.2),0_0_30px_rgba(241,223,192,.08)]">
        <img
          key={i}
          src={photos[i]}
          alt=""
          decoding="async"
          className={cn(
            'absolute inset-0 size-full object-cover',
            !reduced && 'animate-in fade-in transition-[filter] duration-[2600ms] ease-out',
            developed ? 'sepia-0 saturate-100' : 'sepia saturate-50'
          )}
        />
        {/* The next photo, loading out of sight */}
        <img src={photos[(i + 1) % photos.length]} alt="" loading="lazy" className="hidden" />
        <span aria-hidden className="absolute inset-0 rounded-[inherit] shadow-[inset_0_0_24px_8px_rgba(0,0,0,.6)]" />
      </div>
      <p className={cn('mt-3 text-center font-kn-display text-sm', GLOW)}>
        <span lang="kn">ಚಿತ್ರೀಕರಣದ ಕ್ಷಣಗಳು</span>
        <En className="font-kn-body opacity-80"> · The making of</En>
      </p>
      <a
        href={CONTACT.gallery}
        className={cn('mx-auto mt-1 flex min-h-11 w-fit items-center font-kn-display text-base font-semibold underline decoration-[#f1dfc0]/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina', GLOW)}
      >
        <span lang="kn">ಗ್ಯಾಲರಿ</span>
        <En className="font-kn-body"> · Full gallery →</En>
      </a>
    </div>
  )
}
