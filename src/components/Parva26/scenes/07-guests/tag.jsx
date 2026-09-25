import { En } from '@p26/lib/prefs'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'
import { timeLeft } from '@p26/scenes/07-guests/reveal-time'

// The paper tag on the cord: the unveiling date, and for the next guest a
// countdown stamp. Tapping the frame turns it over to the PR team's hint.
export function Tag({ guest, day, next, now, hinted, subtitles }) {
  const left = next ? timeLeft(guest.revealDate, now) : null
  const teaser = guest.teaser ?? { kn: 'ಕಾದು ನೋಡಿ', en: 'Wait and see' }
  const face =
    'col-start-1 row-start-1 flex flex-col items-center rounded-[2px] bg-paper px-2 pb-2 pt-4 text-center text-pen shadow-[0_0.3rem_0.5rem_rgba(40,8,8,.45)] backface-hidden'
  const shape = { ...paper, clipPath: 'polygon(16% 0, 84% 0, 100% 14%, 100% 100%, 0 100%, 0 14%)' }
  return (
    <div
      data-tag
      className={cn('pointer-events-none absolute left-1/2 top-[52.9%] z-10 w-[min(8.75rem,88cqw)] -translate-x-1/2 origin-top [perspective:700px]', next && 'motion-safe:animate-tremble')}
    >
      <div className={cn('grid rotate-[-3deg] transition-transform duration-500 transform-3d motion-reduce:transition-none', hinted && 'rotate-y-180')}>
        <div className={face} style={shape}>
          <Eyelet />
          <span lang="kn" className="font-kn-display text-[0.8rem] font-semibold leading-none text-pen/75">
            ಅನಾವರಣ
          </span>
          <span lang="kn" className="mt-0.5 font-kn-display text-base font-bold leading-tight">
            {day.kn}
          </span>
          <span className={cn('font-poster text-base leading-tight tracking-wider text-pen/80', !subtitles && 'sr-only')}>Unveiling {day.en}</span>
          {left && (
            <span className="mt-1 -rotate-3 rounded-[2px] border-2 border-kumkuma px-1.5 font-kn-display text-base font-bold leading-snug text-kumkuma [filter:url(#p26-ink)]">
              <span lang="kn">{left.kn}</span>
              <En> · {left.en}</En>
            </span>
          )}
        </div>
        <div className={cn(face, 'justify-center rotate-y-180')} style={shape}>
          <Eyelet />
          <span lang="kn" className="font-kn-display text-[0.95rem] font-semibold leading-snug">
            {teaser.kn}
          </span>
          <En className="mt-1 text-[0.85rem] leading-snug text-pen/80">{teaser.en}</En>
        </div>
      </div>
    </div>
  )
}

function Eyelet() {
  return <span aria-hidden className="absolute left-1/2 top-1.5 size-2 -translate-x-1/2 rounded-full bg-[#5e0715] shadow-[0_0_0_2px_#c9962f]" />
}
