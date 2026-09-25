import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefs } from '@p26/lib/prefs'
import { EMOJI_PUZZLES, DUTY_CHART } from '@p26/content/data'
import { FilmCan, MAX_TRIES, MAX_HINTS } from '@p26/scenes/11-emoji-game/film-can'
import { Projector, PortWindow, BareBulb, ReelShelf, DutyChart } from '@p26/scenes/11-emoji-game/projection-booth'
import { isRight } from '@p26/scenes/11-emoji-game/answers'
import { FilmFrame } from '@p26/film/film-frame'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

// Scene 11, ಯಾವ ಸಿನಿಮಾ? · Which film? (allscenes.md). The projection booth:
// the operator has mixed up today's reels. Each day there are five cans, the
// same for everyone; each shows a film as three emoji, and you write its
// name on the tape, in English or Kannada. Three tries, two hints, and the
// projector's footage counter keeps time. Labelled cans go on the shelf;
// after the fifth, the day's log slides out with a Share button, and your
// score goes on the operators' duty chart. No replays until midnight.

const PER_DAY = 5
const IST = 5.5 * 3600_000
const DAY = 86_400_000
const dayNumber = (t) => Math.floor((t + IST) / DAY)

// Today's five: a window into the pool that moves on each day.
function todaysReels(day) {
  const start = (day * PER_DAY) % EMOJI_PUZZLES.length
  return Array.from({ length: PER_DAY }, (_, i) => EMOJI_PUZZLES[(start + i) % EMOJI_PUZZLES.length])
}

// Points for one can: a base, a bonus for speed, less for wrong tries and
// hints; nothing if it was missed.
function scoreFor({ solved, wrong, hints, seconds }) {
  if (!solved) return 0
  return Math.max(10, 60 + Math.max(0, 40 - Math.floor(seconds / 3)) - 10 * wrong - 5 * hints)
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore: progress just won't survive a reload
  }
}

export function EmojiGameScene() {
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const stageRef = useRef(null)
  const [now, setNow] = useState(() => Date.now())
  const day = dayNumber(now)
  const reels = useMemo(() => todaysReels(day), [day])
  const key = `parva26:reels:${day}`
  const [results, setResults] = useState(() => readJSON(key, []))
  const [wrong, setWrong] = useState(0)
  const [hints, setHints] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState('play')
  const [live, setLive] = useState(false)
  const [status, setStatus] = useState('')
  const [chartOpen, setChartOpen] = useState(false)
  const [name, setName] = useState(() => readJSON('parva26:name', ''))

  const finished = results.length >= PER_DAY
  const puzzle = reels[Math.min(results.length, PER_DAY - 1)]
  const total = results.reduce((sum, r) => sum + r.score, 0)
  const solved = results.filter((r) => r.solved).length

  // A new day brings new reels.
  useEffect(() => {
    setResults(readJSON(key, []))
  }, [key])
  useEffect(() => writeJSON(key, results), [key, results])
  useEffect(() => writeJSON('parva26:name', name), [name])

  useEffect(() => {
    const seen = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting))
    seen.observe(stageRef.current)
    return () => seen.disconnect()
  }, [])

  // The footage counter runs while a can is on the bench and you can see it.
  useEffect(() => {
    if (finished || phase !== 'play' || !live) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [finished, phase, live])

  // The clock for "new reels in …", and the rollover at midnight.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const finish = (wasSolved, wrongTries) => {
    setPhase('leaving')
    setTimeout(
      () => {
        setResults((list) => [...list, { id: puzzle.id, solved: wasSolved, wrong: wrongTries, hints, seconds, score: scoreFor({ solved: wasSolved, wrong: wrongTries, hints, seconds }) }])
        setWrong(0)
        setHints(0)
        setSeconds(0)
        setPhase('play')
      },
      reduced ? 300 : 700
    )
  }

  const onGuess = (guess) => {
    if (isRight(guess, puzzle)) {
      setPhase('right')
      setStatus(`Right! ${puzzle.answer.en}.`)
      setTimeout(() => finish(true, wrong), 1500)
      return
    }
    const tries = wrong + 1
    setWrong(tries)
    if (tries >= MAX_TRIES) {
      setPhase('failed')
      setStatus(`Out of tries. It was ${puzzle.answer.en}.`)
      setTimeout(() => finish(false, tries), 2600)
    } else {
      setStatus(`Not that one. ${MAX_TRIES - tries} ${MAX_TRIES - tries === 1 ? 'try' : 'tries'} left.`)
    }
  }

  const onHint = () => {
    if (hints >= MAX_HINTS) return
    setHints(hints + 1)
    setStatus(hints === 0 ? `Hint: it came out in ${puzzle.year}.` : `Hint: it starts with ${puzzle.answer.en[0]}.`)
  }

  const chartRows = useMemo(() => {
    const rows = [...DUTY_CHART]
    if (finished) rows.push({ name: name.trim() || (subtitles ? 'ನೀವು · You' : 'ನೀವು'), score: total, me: true })
    const sorted = rows.sort((a, b) => b.score - a.score).map((row, i) => ({ ...row, rank: i + 1 }))
    const top = sorted.slice(0, 10)
    const me = sorted.find((row) => row.me)
    return me && me.rank > 10 ? [...top, me] : top
  }, [finished, name, total, subtitles])

  return (
    <section id="emoji-game" aria-labelledby="emoji-game-title" className="scroll-mt-14">
      <FilmFrame>
        <div
          ref={stageRef}
          className={cn('relative min-h-[calc(100svh-0.75rem)] overflow-hidden sm:min-h-[calc(100svh-1.5rem)]', !live && '[&_*]:[animation-play-state:paused]')}
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 60% at 55% 20%, #3a3b33, #22241f 60%, #171814)' }}
        >
          <BareBulb className="left-1/2 top-0 lg:left-[52%]" />
          <Projector seconds={seconds} running={!finished && phase === 'play' && live} className="absolute bottom-[15%] left-[1%] hidden w-[26%] max-w-[22rem] lg:block" />
          <PortWindow title={phase === 'right' ? puzzle.answer.kn : null} className="absolute left-[25%] top-[32%] hidden w-[6.5rem] lg:block" />
          {/* The workbench */}
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[16%]" style={{ backgroundImage: 'linear-gradient(180deg, #7a4f2b 0 6px, #5a3719 6px, #3e2510)' }} />

          <div className="relative z-10 mx-auto grid max-w-6xl justify-items-center gap-y-5 px-4 pb-24 pt-[4.75rem] lg:grid-cols-[1fr_minmax(0,24rem)_1fr] lg:items-start lg:gap-x-8 lg:pt-[5.5rem]">
            <div className="flex w-full flex-col items-center lg:col-start-2">
              <h2 id="emoji-game-title" className="text-center">
                <span lang="kn" className="block font-kn-card text-5xl leading-tight text-arishina [text-shadow:0_3px_0_#3a1d0a] sm:text-6xl">
                  ಯಾವ ಸಿನಿಮಾ?
                </span>
                <span className={cn('block font-poster text-xl tracking-[0.3em] text-[#f1dfc0]/80', !subtitles && 'sr-only')}>Which film?</span>
              </h2>
              {/* On a phone the note goes below the can, so the tape stays in
                  the top half, above the keyboard */}
              <p className="mt-3 max-w-sm -rotate-1 bg-paper px-3 py-2 text-center text-pen shadow-[0_4px_8px_rgba(0,0,0,.45)] max-lg:order-last max-lg:mt-8" style={paper}>
                <span lang="kn" className="block font-kn-display text-base font-semibold leading-snug">
                  ಆಪರೇಟರ್ ಇಂದಿನ ರೀಲ್‌ಗಳನ್ನು ಗೊಂದಲ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ! ಹೆಸರು ಬರೆದು ಸಹಾಯ ಮಾಡಿ.
                </span>
                {subtitles && <span className="block text-sm leading-snug">The operator has mixed up today’s reels! Help label them.</span>}
              </p>

              <ReelShelf results={results} total={PER_DAY} className="mt-4 w-full max-w-xs lg:hidden" />

              {finished ? (
                <LogSheet results={results} reels={reels} total={total} solved={solved} now={now} day={day} name={name} setName={setName} subtitles={subtitles} />
              ) : (
                <>
                  <p className="mt-4 font-kn-display text-base font-semibold text-[#f1dfc0]/85">
                    <span lang="kn">ರೀಲ್ {results.length + 1} / {PER_DAY}</span>
                    {subtitles && <span className="font-kn-body"> · Reel {results.length + 1} of {PER_DAY}</span>}
                    <span className="ml-3 rounded-[2px] bg-black/60 px-1.5 py-0.5 font-poster tracking-[0.2em] text-[#f2e6c8] lg:hidden">{String(seconds).padStart(4, '0')}</span>
                  </p>
                  <FilmCan
                    key={puzzle.id}
                    puzzle={puzzle}
                    wrong={wrong}
                    hints={hints}
                    phase={phase}
                    onGuess={onGuess}
                    onHint={onHint}
                    reduced={reduced}
                    focusOnArrival={results.length > 0}
                    className={cn('mt-4', reduced ? 'animate-in fade-in duration-300' : 'animate-in slide-in-from-left-[40vw] fade-in duration-500')}
                  />
                </>
              )}
              <p aria-live="polite" className="sr-only">
                {status}
              </p>

              <button
                type="button"
                aria-expanded={chartOpen}
                onClick={() => setChartOpen((o) => !o)}
                className="mt-6 min-h-11 rounded-full bg-black/35 px-4 font-kn-display text-base font-semibold text-[#f1dfc0] ring-1 ring-[#c9a052]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina lg:hidden"
              >
                <span lang="kn">ಡ್ಯೂಟಿ ಚಾರ್ಟ್</span>
                {subtitles && <span className="font-kn-body"> · Duty chart</span>}
              </button>
              {chartOpen && <DutyChart rows={chartRows} className="mt-4 w-full max-w-sm lg:hidden" />}
            </div>

            <div className="hidden w-full max-w-[18rem] flex-col gap-8 justify-self-end pt-6 lg:col-start-3 lg:row-start-1 lg:flex">
              <ReelShelf results={results} total={PER_DAY} />
              <DutyChart rows={chartRows} />
            </div>
          </div>
        </div>
      </FilmFrame>
    </section>
  )
}

// After the day's five cans: the log sheet, Share, a name for the chart,
// and when the next reels arrive.
function LogSheet({ results, reels, total, solved, now, day, name, setName, subtitles }) {
  const [copied, setCopied] = useState(false)
  const left = (day + 1) * DAY - IST - now
  const h = Math.floor(left / 3_600_000)
  const m = Math.floor((left % 3_600_000) / 60_000)

  const share = async () => {
    const text = `ಯಾವ ಸಿನಿಮಾ? ${results.map((r) => (r.solved ? '🎞️' : '⬛')).join('')} ${solved}/${PER_DAY} · ${total}\n${window.location.origin}/parva-26#emoji-game`
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // ignore: the visitor closed the share sheet
    }
  }

  return (
    <div className="relative mt-5 w-full max-w-sm animate-in slide-in-from-bottom-8 fade-in rotate-[-1deg] bg-paper px-5 pb-5 pt-4 text-pen shadow-[0_12px_20px_rgba(0,0,0,.55)] duration-500" style={paper}>
      <h3 className="text-center">
        <span lang="kn" className="block font-kn-display text-xl font-bold">
          ಇಂದಿನ ಲಾಗ್
        </span>
        <span className="block font-typewriter text-base">
          {subtitles ? 'Today’s log: ' : ''}
          {solved}/{PER_DAY} · {total} {subtitles ? 'points' : 'ಅಂಕ'}
        </span>
      </h3>
      <ol className="mt-3 space-y-1 font-typewriter text-sm">
        {results.map((r, i) => {
          const p = reels.find((x) => x.id === r.id) ?? reels[i]
          return (
            <li key={r.id} className="flex items-baseline gap-2 border-b border-pen/10 pb-1">
              <span className={cn('w-4 font-bold', r.solved ? 'text-[#2f7a2f]' : 'text-kumkuma')}>{r.solved ? '✓' : '✕'}</span>
              <span lang="kn" className="flex-1 truncate font-kn-display text-base font-semibold">
                {p.answer.kn}
              </span>
              <span>{r.score}</span>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={share}
          className="min-h-11 -rotate-1 rounded-[3px] bg-arishina px-4 font-kn-display text-lg font-bold text-theatre shadow-[0_3px_5px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pen"
        >
          <span lang="kn">ಹಂಚಿಕೊಳ್ಳಿ</span>
          {subtitles && <span className="font-kn-body text-base"> · Share</span>}
        </button>
        <p aria-live="polite" className="font-typewriter text-sm">
          {copied && (subtitles ? 'ನಕಲಾಯಿತು · Copied' : 'ನಕಲಾಯಿತು')}
        </p>
      </div>

      <label className="mt-4 block">
        <span className="block font-kn-display text-sm font-semibold">
          <span lang="kn">ಚಾರ್ಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು</span>
          {subtitles && <span className="font-kn-body"> · Your name on the chart</span>}
        </span>
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b-2 border-dashed border-pen/40 bg-transparent font-kn-display text-lg font-bold text-pen outline-none focus-visible:border-arishina"
        />
      </label>

      {/* A note pinned to the corner */}
      <p className="absolute -bottom-6 -right-3 rotate-[4deg] bg-[#fdf6c9] px-2.5 py-1 text-pen shadow-[0_3px_5px_rgba(0,0,0,.4)]">
        <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight">
          ಹೊಸ ರೀಲ್‌ಗಳು {h} ಗಂ {m} ನಿ ನಲ್ಲಿ
        </span>
        {subtitles && (
          <span className="block text-sm font-semibold leading-tight">
            New reels in {h}h {m}m
          </span>
        )}
      </p>
    </div>
  )
}
