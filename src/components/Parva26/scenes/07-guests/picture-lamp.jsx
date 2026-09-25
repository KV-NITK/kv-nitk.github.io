import { brass } from '@p26/styles/materials'
import { cn } from '@/lib/utils'

// The brass picture lamp: a plate on the wall, a stem, and a hood over the
// frame. When on, the lip under the hood glows, light spills on the wall
// behind the frame and falls across the portrait, and dust drifts in it.
export function PictureLamp({ on }) {
  const light = on ? 'opacity-100' : 'opacity-0'
  return (
    <>
      <span
        aria-hidden
        data-lamp-light
        className={cn(
          'pointer-events-none absolute -inset-x-[55%] -top-[48%] -z-10 h-[125%] bg-radial-[ellipse_50%_46%_at_50%_38%] from-[#fff3cc]/85 via-[#ffe2a0]/30 via-40% to-transparent to-70%',
          light
        )}
      />
      <span aria-hidden className="absolute left-1/2 top-[-25cqw] h-[4.6cqw] w-[11cqw] -translate-x-1/2 rounded-[1.2cqw] shadow-[0_0.4cqw_0.5cqw_rgba(50,24,6,.45)]" style={brass} />
      <span aria-hidden className="absolute left-1/2 top-[-21cqw] h-[9cqw] w-[1.8cqw] -translate-x-1/2 shadow-[0.4cqw_0_0.4cqw_rgba(50,24,6,.3)]" style={brass} />
      <span
        aria-hidden
        className="absolute left-1/2 top-[-13cqw] z-20 h-[5cqw] w-[52cqw] -translate-x-1/2 rounded-[50%/40%_40%_60%_60%] shadow-[0_0.6cqw_0.8cqw_rgba(50,24,6,.5)]"
        style={brass}
      >
        <span
          data-lamp-light
          className={cn('absolute inset-x-[7%] -bottom-[0.5cqw] h-[1.4cqw] rounded-full bg-[#fff8de] shadow-[0_0_1.6cqw_0.6cqw_rgba(255,226,150,.85)]', light)}
        />
      </span>
      <span
        aria-hidden
        data-lamp-light
        className={cn('pointer-events-none absolute -inset-x-[4%] top-[-9cqw] z-20 h-[74%]', light)}
        style={{ clipPath: 'polygon(26% 0, 74% 0, 100% 100%, 0 100%)', backgroundImage: 'linear-gradient(180deg, rgba(255,238,196,.34), rgba(255,230,180,.08) 60%, transparent)' }}
      >
        {on && (
          <>
            <span className="absolute left-[38%] top-[8%] size-[0.9cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote" />
            <span className="absolute left-[58%] top-[20%] size-[0.7cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote [animation-delay:-2.2s]" />
            <span className="absolute left-[47%] top-[36%] size-[0.8cqw] min-h-0.5 min-w-0.5 rounded-full bg-[#fff6da] motion-safe:animate-mote [animation-delay:-4.1s]" />
          </>
        )}
      </span>
    </>
  )
}
