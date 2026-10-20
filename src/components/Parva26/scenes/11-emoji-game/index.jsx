import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { En, usePrefs } from '@p26/lib/prefs'
import { FilmCan, MAX_TRIES, MAX_HINTS } from '@p26/scenes/11-emoji-game/film-can'
import { Projector, PortWindow, BareBulb, ReelShelf, DutyChart } from '@p26/scenes/11-emoji-game/projection-booth'
import { FilmFrame } from '@p26/film/film-frame'
import { paper } from '@p26/styles/textures'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { useOnScreen, PAUSED } from '@p26/lib/on-screen'
import { useStoredState } from '@p26/lib/storage'
import { startFilmGame, getFilmGame, guessFilm, filmHint, saveFilmName, getFilmChart } from '@/api/parva26'
import { cn } from '@/lib/utils'

// Scene 11, ಯಾವ ಸಿನಿಮಾ? · Which film? (allscenes.md). The projection booth:
// the operator has mixed up today's reels. Each day there are five cans, the
// same for everyone; each shows a film as three emoji, and you write its
// name on the tape, in English or Kannada. Three tries, two hints, and the
// projector's footage counter keeps time. Labelled cans go on the shelf;
// after the fifth, the day's log slides out with a Share button and a place
// for your name on the operators' duty chart. No replays until midnight.
//
// The game is played on the server (/api/parva26/film): it holds the
// answers, checks each guess, keeps the clock and the score, and keeps the
// chart. This page only remembers which game is yours today.

const PER_DAY = 5
const IST = 5.5 * 3600_000
const DAY = 86_400_000
const CHART_EVERY_MS = 60_000
const dayNumber = (t) => Math.floor((t + IST) / DAY)

export function EmojiGameScene() {
  const reduced = usePrefersReducedMotion()
  const { subtitles } = usePrefs()
  const stageRef = useRef(null)
  const [now, setNow] = useState(() => Date.now())
  const day = dayNumber(now)
  // Your game today; at midnight the key changes and a new day starts.
  const [playId, setPlayId] = useStoredState(`parva26:film:${day}`, null)
  const [play, setPlay] = useState(null)
  const [trouble, setTrouble] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  // The reel just ended: its answer, and whether it was lost
  const [reveal, setReveal] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState('play')
  const [status, setStatus] = useState('')
  const [chartOpen, setChartOpen] = useState(false)
  const [chart, setChart] = useState({ rows: [], me: null })
  const [name, setName] = useStoredState('parva26:name', '')

  const live = useOnScreen(stageRef)
  const perDay = play?.reelCount ?? PER_DAY
  const results = play?.results ?? []
  const finished = !!play?.finished
  const total = play?.total ?? 0
  const solved = results.filter((r) => r.solved).length
  const puzzle = play && !finished ? { ...play.reels[play.reel], letter: play.letter, answer: reveal?.answer ?? null } : null
  const wrong = reveal?.lost ? MAX_TRIES : (play?.wrong ?? 0)

  // Today's game: picked up where you left it, or a new one the first time
  // the booth comes into view (the clock starts then).
  useEffect(() => {
    if (!live || (play && play.day === day)) return
    let cancelled = false
    ;(async () => {
      try {
        let game = null
        if (playId) game = await getFilmGame(playId).catch((e) => (e.status === 404 ? null : Promise.reject(e)))
        if (!game) game = await startFilmGame()
        if (cancelled) return
        setPlayId(game.id)
        setPlay(game)
        setTrouble(false)
      } catch {
        if (!cancelled) setTrouble(true)
      }
    })()
    return () => (cancelled = true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, day, attempt])

  const refreshChart = useCallback(() => {
    getFilmChart(play?.id)
      .then(setChart)
      .catch(() => {})
  }, [play?.id])

  // The chart, now and every minute while you can see it, and when you finish
  useEffect(() => {
    if (!live) return
    refreshChart()
    const id = setInterval(refreshChart, CHART_EVERY_MS)
    return () => clearInterval(id)
  }, [live, refreshChart, finished])

  // The footage counter runs while a can is on the bench and you can see it.
  // It's for show; the server keeps the time that counts.
  useEffect(() => {
    if (!play || finished || phase !== 'play' || !live) return
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [play, finished, phase, live])

  // The clock for "new reels in …", and the rollover at midnight.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // The can leaves the bench, and the server's next state comes in.
  const leave = (next) => {
    setPhase('leaving')
    setTimeout(
      () => {
        setPlay(next)
        setReveal(null)
        setSeconds(0)
        setPhase('play')
      },
      reduced ? 300 : 700
    )
  }

  // Our copy is out of date (a second tab, say): fetch the game again.
  const resync = async () => {
    try {
      setPlay(await getFilmGame(play.id))
    } catch {
      setTrouble(true)
    }
  }

  const onGuess = async (guess) => {
    if (busy || !play) return
    setBusy(true)
    try {
      const r = await guessFilm(play.id, guess)
      if (r.outcome === 'wrong') {
        setPlay(r.play)
        const left = MAX_TRIES - r.play.wrong
        setStatus(`Not that one. ${left} ${left === 1 ? 'try' : 'tries'} left.`)
      } else if (r.outcome === 'right') {
        setReveal({ answer: r.answer, lost: false })
        setPhase('right')
        setStatus(`Right! ${r.answer.en}.`)
        setTimeout(() => leave(r.play), 1500)
      } else {
        setReveal({ answer: r.answer, lost: true })
        setPhase('failed')
        setStatus(`Out of tries. It was ${r.answer.en}.`)
        setTimeout(() => leave(r.play), 2600)
      }
    } catch (e) {
      if (e.status === 409 || e.status === 404) await resync()
      else setStatus('The projector jammed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const onHint = async () => {
    if (busy || !play || play.hints >= MAX_HINTS) return
    setBusy(true)
    try {
      const next = await filmHint(play.id)
      setPlay(next)
      setStatus(next.hints === 1 ? `Hint: it came out in ${puzzle.year}.` : `Hint: it starts with ${next.letter?.en}.`)
    } catch (e) {
      if (e.status === 409 || e.status === 404) await resync()
      else setStatus('The projector jammed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const onSaveName = async () => {
    const r = await saveFilmName(play.id, name)
    setName(r.name)
    setPlay((p) => ({ ...p, name: r.name }))
    setChart(r.chart)
  }

  // The server's top 10, with you on it once you've finished: by your name if
  // you've given one, as "You" until then.
  const chartRows = useMemo(() => {
    const rows = chart.rows.map((row) => ({ ...row }))
    if (finished && !rows.some((row) => row.me)) {
      rows.push({ name: chart.me?.name || name.trim() || (subtitles ? 'ನೀವು · You' : 'ನೀವು'), score: total, me: true, rank: chart.me?.rank })
    }
    const sorted = rows.sort((a, b) => b.score - a.score).map((row, i) => ({ ...row, rank: row.me && row.rank > 10 ? row.rank : i + 1 }))
    const top = sorted.slice(0, 10)
    const me = sorted.find((row) => row.me)
    return me && !top.includes(me) ? [...top, me] : top
  }, [chart, finished, name, total, subtitles])

  return (
    <section id="emoji-game" aria-labelledby="emoji-game-title" className="scroll-mt-14">
      <FilmFrame>
        <div
          ref={stageRef}
          className={cn('relative min-h-[calc(100svh-0.75rem)] overflow-hidden sm:min-h-[calc(100svh-1.5rem)]', !live && PAUSED)}
          style={{ backgroundImage: 'radial-gradient(ellipse 70% 60% at 55% 20%, #3a3b33, #22241f 60%, #171814)' }}
        >
          <BareBulb className="left-1/2 top-0 lg:left-[52%]" />
          <Projector seconds={seconds} running={!!puzzle && phase === 'play' && live} className="absolute bottom-[15%] left-[1%] hidden w-[26%] max-w-[22rem] lg:block" />
          <PortWindow title={phase === 'right' ? reveal?.answer.kn : null} className="absolute left-[25%] top-[32%] hidden w-[6.5rem] lg:block" />
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
                <En className="block text-sm leading-snug">The operator has mixed up today’s reels! Help label them.</En>
              </p>

              <ReelShelf results={results} total={perDay} className="mt-4 w-full max-w-xs lg:hidden" />

              {finished ? (
                <LogSheet results={results} total={total} solved={solved} perDay={perDay} now={now} day={day} name={name} setName={setName} savedName={play.name} onSave={onSaveName} subtitles={subtitles} />
              ) : puzzle ? (
                <>
                  <p className="mt-4 font-kn-display text-base font-semibold text-[#f1dfc0]/85">
                    <span lang="kn">ರೀಲ್ {play.reel + 1} / {perDay}</span>
                    <En className="font-kn-body"> · Reel {play.reel + 1} of {perDay}</En>
                    <span className="ml-3 rounded-[2px] bg-black/60 px-1.5 py-0.5 font-poster tracking-[0.2em] text-[#f2e6c8] lg:hidden">{String(seconds).padStart(4, '0')}</span>
                  </p>
                  <FilmCan
                    key={puzzle.id}
                    puzzle={puzzle}
                    wrong={wrong}
                    hints={play.hints}
                    phase={phase}
                    busy={busy}
                    onGuess={onGuess}
                    onHint={onHint}
                    reduced={reduced}
                    focusOnArrival={play.reel > 0}
                    className={cn('mt-4', reduced ? 'animate-in fade-in duration-300' : 'animate-in slide-in-from-left-[40vw] fade-in duration-500')}
                  />
                </>
              ) : (
                <BoothNote trouble={trouble} onRetry={() => setAttempt((n) => n + 1)} />
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
                <En className="font-kn-body"> · Duty chart</En>
              </button>
              {chartOpen && <DutyChart rows={chartRows} className="mt-4 w-full max-w-sm lg:hidden" />}
            </div>

            <div className="hidden w-full max-w-[18rem] flex-col gap-8 justify-self-end pt-6 lg:col-start-3 lg:row-start-1 lg:flex">
              <ReelShelf results={results} total={perDay} />
              <DutyChart rows={chartRows} />
            </div>
          </div>
        </div>
      </FilmFrame>
    </section>
  )
}

// While the reels are on their way, or when the server can't be reached.
// TODO(content): proofread the Kannada.
function BoothNote({ trouble, onRetry }) {
  return (
    <div className="mt-6 w-full max-w-sm rotate-[-1deg] bg-paper px-5 py-4 text-center text-pen shadow-[0_8px_14px_rgba(0,0,0,.5)]" style={paper}>
      {trouble ? (
        <>
          <p lang="kn" className="font-kn-display text-lg font-bold">
            ಪ್ರೊಜೆಕ್ಟರ್ ಕೆಟ್ಟಿದೆ!
          </p>
          <En as="p" className="text-sm font-semibold">
            The projector is down. Please try again in a little while.
          </En>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 min-h-11 -rotate-1 rounded-[3px] bg-arishina px-4 font-kn-display text-lg font-bold text-theatre shadow-[0_3px_5px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pen"
          >
            <span lang="kn">ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ</span>
            <En className="font-kn-body text-base"> · Try again</En>
          </button>
        </>
      ) : (
        <p className="font-typewriter text-base">
          <span lang="kn" className="font-kn-display font-semibold">
            ರೀಲ್‌ಗಳು ಬರುತ್ತಿವೆ…
          </span>
          <En> · Fetching the reels…</En>
        </p>
      )}
    </div>
  )
}

// After the day's five cans: the log sheet, Share, your name for the chart,
// and when the next reels arrive.
function LogSheet({ results, total, solved, perDay, now, day, name, setName, savedName, onSave, subtitles }) {
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nameError, setNameError] = useState('')
  const left = (day + 1) * DAY - IST - now
  const h = Math.floor(left / 3_600_000)
  const m = Math.floor((left % 3_600_000) / 60_000)
  const saved = !!savedName && savedName === name.trim().replace(/\s+/g, ' ')

  const share = async () => {
    const text = `ಯಾವ ಸಿನಿಮಾ? ${results.map((r) => (r.solved ? '🎞️' : '⬛')).join('')} ${solved}/${perDay} · ${total}\n${window.location.origin}/rcb#emoji-game`
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

  const save = async (e) => {
    e.preventDefault()
    if (saving || !name.trim()) return
    setSaving(true)
    setNameError('')
    try {
      await onSave()
    } catch (err) {
      setNameError(err.status === 400 ? err.message : 'Could not save your name. Please try again.')
    } finally {
      setSaving(false)
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
          {solved}/{perDay} · {total} {subtitles ? 'points' : 'ಅಂಕ'}
        </span>
      </h3>
      <ol className="mt-3 space-y-1 font-typewriter text-sm">
        {results.map((r) => (
          <li key={r.id} className="flex items-baseline gap-2 border-b border-pen/10 pb-1">
            <span className={cn('w-4 font-bold', r.solved ? 'text-[#2f7a2f]' : 'text-kumkuma')}>{r.solved ? '✓' : '✕'}</span>
            <span lang="kn" className="flex-1 truncate font-kn-display text-base font-semibold">
              {r.answer.kn}
            </span>
            <span>{r.score}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={share}
          className="min-h-11 -rotate-1 rounded-[3px] bg-arishina px-4 font-kn-display text-lg font-bold text-theatre shadow-[0_3px_5px_rgba(0,0,0,.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pen"
        >
          <span lang="kn">ಹಂಚಿಕೊಳ್ಳಿ</span>
          <En className="font-kn-body text-base"> · Share</En>
        </button>
        <p aria-live="polite" className="font-typewriter text-sm">
          {copied && (subtitles ? 'ನಕಲಾಯಿತು · Copied' : 'ನಕಲಾಯಿತು')}
        </p>
      </div>

      <form onSubmit={save} className="mt-4">
        <label htmlFor="p26-chart-name" className="block font-kn-display text-sm font-semibold">
          <span lang="kn">ಚಾರ್ಟ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಹೆಸರು</span>
          <En className="font-kn-body"> · Your name on the chart</En>
        </label>
        <div className="mt-1 flex items-end gap-2">
          <input
            id="p26-chart-name"
            value={name}
            maxLength={20}
            autoComplete="nickname"
            onChange={(e) => {
              setName(e.target.value)
              setNameError('')
            }}
            className="min-w-0 flex-1 border-b-2 border-dashed border-pen/40 bg-transparent font-kn-display text-lg font-bold text-pen outline-none focus-visible:border-arishina"
          />
          <button
            type="submit"
            disabled={saving || saved || !name.trim()}
            className="min-h-11 shrink-0 rounded-[3px] border-[2.5px] border-pen px-3 font-kn-display text-base font-bold text-pen transition-opacity disabled:opacity-40 enabled:hover:bg-pen/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
          >
            {saved ? (
              <>
                <span lang="kn">ಉಳಿಸಲಾಗಿದೆ</span>
                <En className="font-kn-body text-sm"> · Saved</En>
              </>
            ) : (
              <>
                <span lang="kn">ಉಳಿಸಿ</span>
                <En className="font-kn-body text-sm"> · Save</En>
              </>
            )}
          </button>
        </div>
        <p aria-live="polite" className="mt-1 min-h-5 text-sm font-semibold text-kumkuma">
          {nameError}
        </p>
      </form>

      {/* A note pinned to the corner */}
      <p className="absolute -bottom-6 -right-3 rotate-[4deg] bg-[#fdf6c9] px-2.5 py-1 text-pen shadow-[0_3px_5px_rgba(0,0,0,.4)]">
        <span lang="kn" className="block font-kn-display text-sm font-bold leading-tight">
          ಹೊಸ ರೀಲ್‌ಗಳು {h} ಗಂ {m} ನಿ ನಲ್ಲಿ
        </span>
        <En className="block text-sm font-semibold leading-tight">
          New reels in {h}h {m}m
        </En>
      </p>
    </div>
  )
}
