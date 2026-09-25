import { cn } from '@/lib/utils'

// Marquee bulbs: every third bulb lit, the lit ones chasing along. Round
// the theatre's name board (Scene 2) and along the poster hoarding (Scene 6).
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
