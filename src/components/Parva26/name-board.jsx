import { cn } from '../../lib/utils'

// The theatre's name board over the arch (brief, Scene 1): a maroon board with
// the name hand-painted in cream with a gold shade, in a dark frame studded
// with bulbs. Every third bulb is lit and the lit ones chase round the board;
// one bulb is dead and stutters now and then, the one flaw that makes the
// rest look real.
const UNLIT = 'radial-gradient(circle, #7a5a2c 0 2px, #3a2410 3px, rgba(0,0,0,.35) 4px, transparent 4.5px)'
const LIT = 'radial-gradient(circle, #fffbea 0 2.2px, #ffd98a 3.4px, rgba(255,196,96,.5) 5px, rgba(255,180,80,.12) 8px, transparent 9px)'

// A row of bulbs along one edge. Bulbs are 1.125rem apart; the lit layer's
// pattern is three bulbs long and steps one bulb at a time.
export function Bulbs({ edge }) {
  const across = edge === 'top' || edge === 'bottom'
  const backwards = edge === 'bottom' || edge === 'left'

  return (
    <span
      aria-hidden
      className={cn(
        'absolute',
        edge === 'top' && 'inset-x-3 top-0 h-3',
        edge === 'bottom' && 'inset-x-3 bottom-0 h-3',
        edge === 'left' && 'inset-y-3 left-0 w-3',
        edge === 'right' && 'inset-y-3 right-0 w-3'
      )}
      style={{
        backgroundImage: UNLIT,
        backgroundSize: across ? '1.125rem 100%' : '100% 1.125rem',
        backgroundRepeat: across ? 'repeat-x' : 'repeat-y',
      }}
    >
      <span
        className={cn(
          'absolute',
          across ? '-inset-y-1.5 inset-x-0 motion-safe:animate-bulb-chase-x' : '-inset-x-1.5 inset-y-0 motion-safe:animate-bulb-chase-y',
          backwards && '[animation-direction:reverse]'
        )}
        style={{
          backgroundImage: LIT,
          backgroundSize: across ? '3.375rem 100%' : '100% 3.375rem',
          backgroundRepeat: across ? 'repeat-x' : 'repeat-y',
        }}
      />
    </span>
  )
}

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
