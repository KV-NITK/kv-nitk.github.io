import { EXTRUSION } from '@p26/scenes/02-title/title-card'
import { graphemes } from '@p26/lib/text'
import { paper } from '@p26/styles/textures'
import { cn } from '@/lib/utils'

// Title cards for the rewind bench (Scene 10, allscenes.md), each lettered
// in the style of its era, never copied from the film's real title design.
// Sized with container units, so the same card works as a frame on the
// strip and large on the projected view.

const OUTLINE = (c, w = '0.02em') => `-${w} -${w} 0 ${c}, ${w} -${w} 0 ${c}, -${w} ${w} 0 ${c}, ${w} ${w} 0 ${c}`

const ERAS = {
  // 1930s–50s: black and white, heavy grain, an ornate border, serif Kannada.
  talkie: {
    ground: { backgroundImage: 'radial-gradient(ellipse 70% 65% at 50% 48%, #77746c, #2a2926 70%, #111 100%)' },
    grain: 0.55,
    title: 'font-kn-serif font-bold text-[#f0ebdf] [text-shadow:0_0_0.08em_rgba(255,255,255,.35)]',
    frame: true,
  },
  // 1960s–70s: early colour, faded to cyan and magenta, bold painted letters
  // slightly out of register.
  colour: {
    ground: {
      backgroundImage:
        'radial-gradient(ellipse 60% 50% at 30% 30%, rgba(255,240,200,.35), transparent 70%), linear-gradient(155deg, #3d7d84, #6f5a78 55%, #b0786a)',
    },
    grain: 0.35,
    title: 'font-kn-display font-extrabold text-[#f7d046]',
    shadow: `${OUTLINE('#6e1414', '0.03em')}, 0.05em 0.02em 0 rgba(60,200,220,.55), -0.04em -0.02em 0 rgba(230,60,150,.45)`,
    swoosh: true,
  },
  // 1980s–90s: strong colours and chunky outlined letters with drop shadows,
  // like a painted poster.
  poster: {
    ground: { backgroundImage: 'repeating-conic-gradient(from 0deg at 50% 60%, #e8401c 0 7deg, #f2a31c 7deg 14deg)' },
    grain: 0.25,
    title: 'font-kn-display font-extrabold text-[#fff04a]',
    shadow: `${OUTLINE('#111', '0.045em')}, 0.08em 0.08em 0 #111`,
  },
  // 2000s: cleaner and glossier, gradient-filled letters, a lens flare.
  gloss: {
    ground: {
      backgroundImage:
        'radial-gradient(circle at 72% 28%, rgba(255,255,255,.55) 0 1%, rgba(160,200,255,.25) 3%, transparent 14%), linear-gradient(180deg, #0b1733, #1d3f7c 60%, #0c1a38)',
    },
    grain: 0.12,
    title: 'font-kn-display font-extrabold bg-linear-to-b from-[#ffffff] via-[#d9e6ff] to-[#8fa6d6] bg-clip-text text-transparent',
    glow: true,
  },
  // 2010s–20s: modern, simple, high contrast, almost no grain.
  modern: {
    ground: { backgroundColor: '#0b0b0b' },
    grain: 0,
    title: 'font-kn-body font-extrabold tracking-[0.04em] text-[#f5f5f0]',
    rule: true,
  },
}

export function EraCard({ entry, subtitles, className }) {
  if (entry.era === 'now') return <NowCard entry={entry} subtitles={subtitles} className={className} />
  const era = ERAS[entry.era] ?? ERAS.modern
  // Size the title by its aksharas: short titles on one line, big; long ones
  // on two.
  const n = graphemes(entry.kn).length
  const size = n <= 8 ? Math.min(22, 76 / n) : Math.min(15, 190 / n)
  return (
    <div className={cn('relative aspect-[4/3] overflow-hidden [container-type:inline-size]', className)} style={era.ground}>
      {era.grain > 0 && <span aria-hidden className="absolute inset-0" style={{ ...paper, opacity: era.grain }} />}
      {era.frame && (
        <>
          <span aria-hidden className="absolute inset-[5%] border-[0.8cqw] border-double border-[#e8e2d2]/80" />
          {['left-[5%] top-[5%]', 'right-[5%] top-[5%]', 'bottom-[5%] left-[5%]', 'bottom-[5%] right-[5%]'].map((at) => (
            <span key={at} aria-hidden className={cn('absolute size-[5cqw] -translate-1/2 rotate-45 border-[0.5cqw] border-[#e8e2d2]/80 bg-[#2a2926]', at.includes('right') && 'translate-x-1/2', at.includes('bottom') && 'translate-y-1/2')} />
          ))}
        </>
      )}
      {era.swoosh && (
        <span aria-hidden className="absolute left-[10%] top-[36%] h-[34%] w-[80%] -rotate-3 rounded-[50%] bg-[#c8102e]/55" />
      )}
      {entry.era === 'poster' && (
        <span aria-hidden className="absolute left-[8%] top-[10%] text-[12cqw] leading-none text-[#fff04a] [text-shadow:0.06em_0.06em_0_#111]">
          ★
        </span>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center">
        <p
          lang="kn"
          className={cn('leading-[1.15]', era.title, n <= 8 && 'whitespace-nowrap')}
          style={{ fontSize: `${size.toFixed(1)}cqw`, textShadow: era.shadow, filter: era.glow ? 'drop-shadow(0 0 0.06em rgba(170,200,255,.6))' : undefined }}
        >
          {entry.kn}
        </p>
        {era.rule && <span aria-hidden className="mt-[2.5cqw] block h-[0.5cqw] w-[16cqw] bg-kumkuma" />}
        {subtitles && (
          <p className={cn('mt-[2cqw] font-poster text-[5cqw] tracking-[0.25em]', entry.era === 'modern' || entry.era === 'gloss' || entry.era === 'talkie' ? 'text-white/70' : 'text-[#1d1a17]/75')}>
            {entry.film}
          </p>
        )}
      </div>
    </div>
  )
}

// 2026: the ಪರ್ವ lettering from the hero, and "you are here".
function NowCard({ entry, subtitles, className }) {
  return (
    <div
      className={cn('relative aspect-[4/3] overflow-hidden [container-type:inline-size]', className)}
      style={{ backgroundImage: 'radial-gradient(ellipse 60% 55% at 50% 45%, #5a3218, #221108 70%, #140c08)' }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* The extrusion is a layer of its own: a text shadow would show
            through the gradient's transparent fill */}
        <p lang="kn" className="relative font-kn-display text-[24cqw] font-extrabold leading-none">
          <span aria-hidden className="absolute inset-0 text-[#7a3710]" style={{ textShadow: EXTRUSION }}>
            {entry.kn}
          </span>
          <span className="relative bg-linear-to-b from-[#fff3c4] via-[#f2c12e] to-[#c8801a] bg-clip-text text-transparent">{entry.kn}</span>
        </p>
        <p lang="kn" className="mt-[3cqw] font-kn-display text-[6.5cqw] font-bold leading-tight text-[#f1dfc0]">
          ನೀವು ಇಲ್ಲಿದ್ದೀರಿ
        </p>
        {subtitles && <p className="font-poster text-[5cqw] tracking-[0.3em] text-[#f1dfc0]/70">You are here</p>}
      </div>
    </div>
  )
}
