import { cn } from '@/lib/utils'
import { Bulbs } from '@p26/ui/bulbs'

// The theatre's name board over the arch (brief, Scene 1): a maroon board with
// the name hand-painted in cream with a gold shade, in a dark frame studded
// with bulbs. Every third bulb is lit and the lit ones chase round the board;
// one bulb is dead and stutters now and then, the one flaw that makes the
// rest look real.
export function NameBoard({ className, ...props }) {
  return (
    <div
      {...props}
      className={cn('relative rounded-[5px] bg-[#22100a] p-3 shadow-[0_10px_22px_rgba(0,0,0,.65),inset_0_1px_0_rgba(255,210,160,.18)]', className)}
      data-en="Sri Gandhada Gudi Chitramandira · the Temple of Sandalwood cinema"
    >
      <Bulbs edge="top" />
      <Bulbs edge="right" />
      <Bulbs edge="bottom" />
      <Bulbs edge="left" />
      {/* The dead bulb, eleventh along the top */}
      <span aria-hidden className="absolute left-[calc(0.75rem+10.5*1.125rem)] top-1.5 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial-[at_40%_35%] from-[#6a5a44] to-[#241a10]">
        <span className="absolute -inset-1 rounded-full bg-radial from-[#fff0c0] via-[#ffc870]/60 via-40% to-transparent to-70% opacity-0 motion-safe:animate-dead-bulb" />
      </span>

      <div
        className="relative rounded-[3px] px-4 py-1 text-center outline-1 -outline-offset-4 outline-[#d9a94a]/55 lg:px-8 lg:py-1.5"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 9px), linear-gradient(180deg, #86222a, #621519 55%, #4a1013)',
        }}
      >
        <p
          lang="kn"
          className="whitespace-nowrap font-kn-display text-lg font-bold leading-snug text-[#f7e8c3] [text-shadow:1.5px_1.5px_0_#b8862b,0_2px_3px_rgba(0,0,0,.5)] lg:text-[1.75rem]"
        >
          ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
        </p>
        {/* Bulb light falling on the painted surface */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_14px_rgba(255,200,120,.35)]" />
      </div>
    </div>
  )
}
