import { En } from '@p26/lib/prefs'
import { HOOMALE } from '@p26/content'
import { cn } from '@/lib/utils'

// The painted board at the cutout's feet.
export function BaseBoard({ ref, subtitles }) {
  return (
    <div ref={ref} className="absolute bottom-[13%] left-1/2 z-10 w-[min(88%,24rem)] -translate-x-1/2 sm:bottom-[5%] lg:left-[30%] lg:w-[min(30%,26rem)]">
      <div
        className="relative rounded-[3px] border-[3px] border-[#1d1a17] bg-arishina px-3 py-1.5 text-center shadow-[0_8px_14px_rgba(0,0,0,.5)]"
        style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 32%, rgba(0,0,0,.12) 32% 33.5%, transparent 33.5% 66%)' }}
      >
        <p lang="kn" className="font-kn-display text-2xl font-extrabold leading-tight text-kumkuma sm:text-3xl">
          {HOOMALE.hero.kn}
        </p>
        <p lang="kn" className="font-kn-display text-sm font-bold leading-tight text-[#1d1a17] sm:text-base">
          ಪರ್ವ ಬಿಡುಗಡೆ ದಿನ · ಅಭಿಮಾನಿಗಳ ಹಾರ್ದಿಕ ಸ್ವಾಗತ
        </p>
        <En as="p" className="font-poster text-sm leading-tight tracking-wider text-[#1d1a17]/80">{HOOMALE.hero.en} · Parva release day · A warm welcome from the fans</En>
      </div>
      {/* Legs */}
      <span aria-hidden className="absolute -bottom-3 left-[12%] h-3 w-2 bg-[#4a2c14]" />
      <span aria-hidden className="absolute -bottom-3 right-[12%] h-3 w-2 bg-[#4a2c14]" />
    </div>
  )
}

// Focus lamps on the street, pointing up at the hero's face. A second one
// comes on at 5,000 flowers.
export function FocusLamps({ two }) {
  const lamp = (at, tilt) => (
    <div className={cn('absolute bottom-[7.5%] z-30', at)}>
      <span
        className="absolute bottom-full left-1/2 h-[60vh] w-[26vh] -translate-x-1/2 origin-bottom opacity-60"
        style={{ rotate: `${tilt}deg`, clipPath: 'polygon(44% 100%, 56% 100%, 100% 0, 0 0)', backgroundImage: 'linear-gradient(0deg, rgba(255,236,190,.35), rgba(255,236,190,0) 80%)' }}
      />
      <span className="relative block h-4 w-7 rounded-t-[6px] bg-[#141414] shadow-[0_-2px_8px_rgba(255,220,150,.7)]" style={{ rotate: `${tilt}deg` }} />
      <span className="mx-auto block h-2 w-1.5 bg-[#141414]" />
    </div>
  )
  return (
    <div aria-hidden className="pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 lg:left-[30%] lg:right-auto">
        {lamp('left-1/2 -translate-x-[180%] lg:left-0 lg:-translate-x-[170%]', 8)}
        {two && lamp('left-1/2 translate-x-[80%] lg:left-0 lg:translate-x-[90%]', -8)}
      </div>
    </div>
  )
}
