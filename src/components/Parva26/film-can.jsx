import { useEffect, useRef, useState } from 'react'
import { usePrefs } from './prefs'
import { graphemes } from './text'
import { paper } from './fx/textures'
import { cn } from '../../lib/utils'

// One mixed-up reel on the booth's bench (Scene 11, allscenes.md): a round
// film can with three emoji stickers on its lid for the clue, and a strip of
// masking tape across the label to write the film's name on. Three boxes at
// the end of the tape are the tries; a wrong guess punches a hole in one. A
// paper tag tied to the can is the hint: the first pull stamps the year on
// the rim, the second pencils the first letter on the tape.

const emoji = import.meta.glob('./assets/emoji/*.svg', { eager: true, query: '?url', import: 'default' })
const emojiUrl = (code) => emoji[`./assets/emoji/${code}.svg`]

const TILTS = [-8, 5, -3]
export const MAX_TRIES = 3
export const MAX_HINTS = 2

export function FilmCan({ puzzle, wrong, hints, phase, onGuess, onHint, reduced, focusOnArrival, className }) {
  const { subtitles } = usePrefs()
  const [text, setText] = useState('')
  const [shake, setShake] = useState(0)
  const inputRef = useRef(null)
  const done = phase !== 'play'
  const first = puzzle.answer
  const firstKn = graphemes(first.kn)[0]

  // Once you're playing, each new can arrives ready to write on.
  useEffect(() => {
    if (focusOnArrival) inputRef.current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A wrong guess: clear the tape and shake the can.
  useEffect(() => {
    if (!wrong) return
    setText('')
    setShake((n) => n + 1)
  }, [wrong])

  const submit = (e) => {
    e.preventDefault()
    if (done || !text.trim()) return
    onGuess(text)
  }

  return (
    <form onSubmit={submit} className={cn('flex flex-col items-center', className)}>
      {/* A tap anywhere on the can puts the pencil on the tape */}
      <div
        key={shake}
        onClick={(e) => !e.target.closest('button') && inputRef.current?.focus()}
        className={cn(
          'group/can relative aspect-square w-[min(76vw,19rem)] cursor-text lg:w-[21rem]',
          shake > 0 && !reduced && 'animate-nope',
          phase === 'leaving' && (reduced ? 'opacity-0 transition-opacity duration-300' : 'translate-x-[60vw] rotate-[260deg] opacity-0 transition-[translate,rotate,opacity] duration-700 ease-in')
        )}
      >
        {/* The tin: brushed steel with pressed rings, a rim and a hub */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full shadow-[0_14px_20px_rgba(0,0,0,.55),inset_0_0_0_4px_#5b6166,inset_0_0_0_7px_#b9bec2,inset_0_-8px_16px_rgba(0,0,0,.35)]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 38% 30%, rgba(255,255,255,.45), transparent 42%), repeating-radial-gradient(circle at 50% 50%, #aab0b5 0 3px, #9aa1a6 3px 4px, #b3b9bd 4px 9px), radial-gradient(circle, #a4aaaf, #6f767b)',
          }}
        />
        <span aria-hidden className="absolute left-1/2 top-[40%] size-[9%] -translate-1/2 rounded-full bg-[#7c8388] shadow-[inset_0_2px_3px_rgba(0,0,0,.5)]" />

        {/* The clue: three emoji stickers */}
        <div role="img" aria-label={`Clue: ${puzzle.alt}`} className="absolute inset-x-[14%] top-[13%] flex justify-center gap-[4%]">
          {puzzle.emoji.map((code, i) => (
            <span key={code} className="grid aspect-square w-[26%] place-items-center rounded-full bg-[#fbf8ef] p-[4%] shadow-[0_2px_3px_rgba(0,0,0,.35)]" style={{ rotate: `${TILTS[i]}deg` }}>
              <img src={emojiUrl(code)} alt="" className="size-full" draggable={false} />
            </span>
          ))}
        </div>

        {/* Hint 1: the year stamped into the rim */}
        {hints > 0 && (
          <span aria-hidden className="absolute bottom-[9%] left-1/2 -translate-x-1/2 font-poster text-lg tracking-[0.3em] text-[#3c4246] [text-shadow:0_1px_0_rgba(255,255,255,.6)]">
            {puzzle.year}
          </span>
        )}

        {/* The masking tape: the answer field and the three tries */}
        <div className="absolute -inset-x-[7%] top-[55%] flex h-[19%] items-center gap-2 pl-5 pr-3" style={{ ...paper, backgroundColor: '#e9dcb4', clipPath: 'polygon(1% 8%, 3% 0, 97% 4%, 99% 0, 100% 92%, 97% 100%, 3% 96%, 0 100%)' }}>
          <label htmlFor="p26-reel-answer" className="sr-only">
            Film name, in English or Kannada
          </label>
          {phase !== 'failed' && <Pencil />}
          {hints > 1 && !done && (
            <span aria-hidden className="absolute left-5 top-0.5 font-kn-display text-xs font-semibold text-[#6b6b6b]">
              {firstKn}… · {first.en[0]}…
            </span>
          )}
          {phase === 'failed' ? (
            <p className="flex-1 truncate font-kn-display text-base font-bold leading-tight text-kumkuma">
              <span lang="kn">ಉತ್ತರ: {first.kn}</span>
              {subtitles && <span className="block text-sm font-semibold">Answer: {first.en}</span>}
            </p>
          ) : (
            <input
              ref={inputRef}
              id="p26-reel-answer"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={done}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder={subtitles ? 'ಇಲ್ಲಿ ಬರೆಯಿರಿ · Type here' : 'ಹೆಸರು ಇಲ್ಲಿ ಬರೆಯಿರಿ'}
              className={cn(
                'min-w-0 flex-1 border-b-2 border-dashed border-[#6b5a3a]/55 bg-transparent pb-0.5 font-kn-display text-lg font-bold text-[#1d2a4d] outline-none placeholder:text-base placeholder:font-semibold placeholder:text-[#6f6553] focus:border-solid focus:border-[#1d2a4d]',
                phase === 'right' && 'text-[#0f1a33]'
              )}
            />
          )}
          <span className="flex gap-1" aria-label={`${MAX_TRIES - wrong} of ${MAX_TRIES} tries left`} role="img">
            {Array.from({ length: MAX_TRIES }, (_, i) => (
              <span key={i} className="grid size-4 place-items-center border border-[#6b5a3a]/70">
                {i < wrong && <span className="size-2.5 rounded-full bg-[#2a2622] shadow-[inset_0_1px_1px_rgba(0,0,0,.6)]" />}
              </span>
            ))}
          </span>
        </div>

        {/* The hint tag on its string */}
        <button
          type="button"
          onClick={onHint}
          disabled={done || hints >= MAX_HINTS}
          aria-label={hints === 0 ? 'Hint: show the year (costs 5 points)' : hints === 1 ? 'Hint: show the first letter (costs 5 points)' : 'No more hints'}
          className={cn(
            'group absolute -right-[4%] top-[20%] flex origin-top-left flex-col items-start transition-transform duration-300 enabled:hover:rotate-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina',
            hints > 0 && 'translate-y-2'
          )}
        >
          <span aria-hidden className="ml-3 h-6 w-px bg-[#e9dcc0]" />
          <span className="rotate-[8deg] rounded-[2px] bg-[#f3ead5] px-2.5 py-1.5 text-center text-pen shadow-[0_3px_5px_rgba(0,0,0,.45)]" style={{ ...paper, clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%, 0 22%)' }}>
            <span lang="kn" className="block font-kn-display text-base font-bold leading-none">
              ಸುಳಿವು
            </span>
            {subtitles && <span className="block text-xs font-semibold">Hint</span>}
            {hints > 0 && <span className="block font-typewriter text-xs text-kumkuma">−{hints * 5}</span>}
          </span>
        </button>

        {/* Right: a yellow tick stamp. Out of tries: a red tape cross. */}
        {(phase === 'right' || (phase === 'leaving' && wrong < MAX_TRIES)) && (
          <span aria-hidden className={cn('absolute left-[58%] top-[26%] grid size-[30%] place-items-center rounded-full border-[5px] border-[#e0a800] text-6xl font-black text-[#e0a800] [filter:url(#p26-ink)]', !reduced && 'animate-in zoom-in-150 fade-in duration-200')}>
            ✓
          </span>
        )}
        {(phase === 'failed' || (phase === 'leaving' && wrong >= MAX_TRIES)) && (
          <span aria-hidden className="pointer-events-none absolute inset-[18%]">
            <span className="absolute left-1/2 top-1/2 h-[14%] w-[120%] -translate-1/2 rotate-45 bg-kumkuma/85" />
            <span className="absolute left-1/2 top-1/2 h-[14%] w-[120%] -translate-1/2 -rotate-45 bg-kumkuma/85" />
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={done || !text.trim()}
        className="mt-4 min-h-11 -rotate-2 rounded-[3px] border-[2.5px] border-arishina px-4 font-kn-display text-lg font-bold text-arishina transition-opacity disabled:opacity-40 enabled:hover:bg-arishina/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
      >
        <span lang="kn">ಲೇಬಲ್ ಹಚ್ಚಿ</span>
        {subtitles && <span className="font-kn-body text-base"> · Label it</span>}
      </button>
    </form>
  )
}

// A stub of yellow pencil at the start of the tape, nodding at it until you
// start writing.
function Pencil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0 origin-bottom-left group-focus-within/can:animate-none motion-safe:animate-wobble">
      <path d="M4 20 L6 14 L16 4 L20 8 L10 18 Z" fill="#f2c12e" stroke="#3b2a1a" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 20 L6 14 L10 18 Z" fill="#e8c9a0" stroke="#3b2a1a" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M4 20 L5 17 L7 19 Z" fill="#3b2a1a" />
      <path d="M16 4 L20 8 L21.5 6.5 L17.5 2.5 Z" fill="#e37b8a" stroke="#3b2a1a" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}
