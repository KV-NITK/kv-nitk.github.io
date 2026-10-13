import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { En } from '@p26/lib/prefs'
import { save, useStoredState } from '@p26/lib/storage'
import { useOnScreen } from '@p26/lib/on-screen'
import { usePrefersReducedMotion } from '@p26/lib/use-reduced-motion'
import { CharacterPicker } from '@p26/market/character-picker'
import { MarketWorld } from '@p26/market/market-world'
import { PlacePrompt } from '@p26/market/place-prompt'
import { CHARACTERS } from '@p26/market/world/characters'
import { MARKET, PLACES } from '@p26/content'
import { brass } from '@p26/styles/materials'
import { cn } from '@/lib/utils'

// The Parva Market as a box in the page: the forecourt game with its start
// screen (pick who walks), the controls legend, the "Click to play" layer
// and the prompt at a place. It is a part of the page, never the whole
// screen: it is at most about two thirds of the screen's height, and the
// page scrolls past it with the wheel, a swipe or the arrow keys.
//
// The game hears the keyboard only while the box has focus (click it, or
// Tab to it); Escape or clicking elsewhere gives the keys back to the page.
// Phaser loads once the box is near the screen and pauses while it is off
// screen or while `ready` is false (the doors haven't opened yet).

// The box's shape: 3:4 on a phone, 16:9 (up to 80rem) on anything wider,
// both capped by the screen's height. The forecourt's layout follows it.
const WIDE = '(min-width: 640px)'
const BOX = 'aspect-[3/4] w-[min(100%,calc(65svh*3/4))] sm:aspect-video sm:w-[min(100%,80rem,calc(64svh*16/9))]'
const GAME_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'e', 'E'])

function useMatches(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

export function MarketStage({ ready = true, className }) {
  const navigate = useNavigate()
  const reduced = usePrefersReducedMotion()
  const boxRef = useRef(null)
  const gameApi = useRef(null)
  const portrait = !useMatches(WIDE)
  const [characterId, setCharacterId] = useStoredState('parva26:market:character', null)
  const [visited, setVisited] = useStoredState('parva26:market:visited', [])
  const [changing, setChanging] = useState(false)
  const [near, setNear] = useState(null)
  const [active, setActive] = useState(false) // the game has the keyboard
  const [nudge, setNudge] = useState(0) // keys pressed before clicking the game

  // Load when close, run only when seen
  const close = useOnScreen(boxRef, { rootMargin: '150% 0px' })
  const seen = useOnScreen(boxRef)
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (close) setArmed(true)
  }, [close])

  const character = CHARACTERS.find((c) => c.id === characterId)

  // Clicking or tapping the game gives it the keyboard. Phaser stops the
  // canvas's mousedown, so the box doesn't take focus by itself.
  const takeKeys = () => {
    if (!boxRef.current.contains(document.activeElement)) boxRef.current.focus({ preventScroll: true })
  }
  const giveKeysBack = () => {
    if (boxRef.current.contains(document.activeElement)) document.activeElement.blur()
  }

  const use = useCallback(
    (id) => {
      const place = PLACES.find((p) => p.id === id)
      if (!place) return
      if (place.scroll) {
        giveKeysBack()
        document.getElementById(place.scroll)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' })
        return
      }
      if (!place.go) return
      // Saved now: the page is about to leave, before an effect would run
      const seenStalls = visited.includes(id) ? visited : [...visited, id]
      setVisited(seenStalls)
      save('parva26:market:visited', seenStalls)
      // Back from the shop returns here, not to the top of the page
      window.history.replaceState(window.history.state, '', '#parva-sante')
      navigate(place.go)
    },
    [navigate, reduced, visited, setVisited]
  )

  // Keys pressed while the game doesn't have them still scroll the page, but
  // the "Click to play" button shakes to say why the walker didn't move.
  useEffect(() => {
    if (!seen || !character || active) return
    const onKey = (e) => {
      if (!GAME_KEYS.has(e.key) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      setNudge((n) => n + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seen, character, active])

  return (
    <div
      ref={boxRef}
      id="parva-sante"
      tabIndex={0}
      role="application"
      aria-roledescription="game"
      aria-label={`${MARKET.title.en}. Walk with the arrow keys or W A S D, press E at a stall to enter it, Escape to leave the game.`}
      onPointerDown={takeKeys}
      onFocus={() => {
        setActive(true)
        setNudge(0)
      }}
      onBlur={(e) => {
        if (boxRef.current.contains(e.relatedTarget)) return
        setActive(false)
        gameApi.current?.releaseKeys()
      }}
      onKeyDown={(e) => e.key === 'Escape' && !changing && giveKeysBack()}
      className={cn(
        'relative mx-auto scroll-mt-24 overflow-hidden rounded-md bg-[#140c08] shadow-[0_1.2rem_2.4rem_rgba(0,0,0,.6)] ring-2 ring-[#d6a65a]/60 [container-type:size] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-arishina',
        active && 'ring-arishina',
        BOX,
        className
      )}
    >
      {armed && character && (
        <MarketWorld
          character={character}
          portrait={portrait}
          visited={visited}
          running={ready && seen}
          keyTarget={boxRef}
          apiRef={gameApi}
          onNear={setNear}
          onAction={use}
        />
      )}

      {character && (
        <>
          <Legend learned={visited.length > 0} active={active} />
          <PlacePrompt placeId={near} onUse={use} />
          <button
            type="button"
            onClick={() => setChanging(true)}
            data-en={MARKET.change.en}
            className="absolute right-2 top-2 z-20 cursor-pointer rounded-[4px] px-2.5 py-1 text-left shadow-[0_3px_8px_rgba(0,0,0,.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
            style={brass}
          >
            <span lang="kn" className="block font-kn-display text-xs font-extrabold leading-tight text-[#4a3208]">
              {MARKET.change.kn}
            </span>
            <En className="block font-poster text-xs leading-none tracking-widest text-[#4a3208]">{MARKET.change.en}</En>
          </button>
          {!active && !changing && <PlayGate nudge={nudge} onPlay={takeKeys} />}
        </>
      )}

      {(!character || changing) && (
        <CharacterPicker
          onPick={(id) => {
            setCharacterId(id)
            setChanging(false)
            boxRef.current.focus({ preventScroll: true })
          }}
          onClose={character ? () => setChanging(false) : undefined}
        />
      )}
    </div>
  )
}

// What the controls are, in a corner for as long as you play. Once a stall
// has been visited it folds into a "?" that opens it again. A mouse and
// keyboard get keys; a touch screen gets taps.
function Legend({ learned, active }) {
  const [open, setOpen] = useState(!learned)
  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 flex max-w-[calc(100%-7.5rem)] flex-col items-start gap-1.5">
      {learned && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={MARKET.help.en}
          className="pointer-events-auto grid size-8 cursor-pointer place-items-center rounded-full bg-theatre/80 font-poster text-lg leading-none text-arishina ring-1 ring-arishina/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
        >
          {open ? '×' : '?'}
        </button>
      )}
      {open && (
        <div className="rounded-md bg-theatre/95 px-2.5 py-2 text-gandha shadow-[0_4px_10px_rgba(0,0,0,.45)] ring-1 ring-[#d6a65a]/40">
          {/* Keyboard and mouse */}
          <ul className="hidden flex-col gap-1.5 pointer-fine:flex">
            <Row label={MARKET.walk}>
              <span className="grid grid-cols-3 gap-0.5" aria-hidden>
                <span />
                <Key>↑</Key>
                <span />
                <Key>←</Key>
                <Key>↓</Key>
                <Key>→</Key>
              </span>
              <span className="font-poster text-xs tracking-widest text-gandha/70" aria-hidden>
                WASD
              </span>
            </Row>
            <Row label={MARKET.enter}>
              <Key wide>E</Key>
            </Row>
            <Row label={{ kn: 'ಹೋಗಬೇಕಾದಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ', en: 'Or click where to go' }}>
              <Mouse />
            </Row>
          </ul>
          {/* Touch */}
          <ul className="hidden flex-col gap-1.5 pointer-coarse:flex">
            <Row label={MARKET.tapWalk}>
              <Finger />
            </Row>
            <Row label={MARKET.tapShop}>
              <Stall />
            </Row>
          </ul>
        </div>
      )}
      {active && (
        <p className="hidden rounded-full bg-arishina px-2.5 py-0.5 font-kn-body text-xs font-bold text-theatre shadow-[0_2px_6px_rgba(0,0,0,.45)] pointer-fine:block">
          <span aria-hidden>● </span>
          <En>{MARKET.playing.en}</En>
        </p>
      )}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <li className="flex items-center gap-2">
      <span className="flex shrink-0 items-center gap-1.5">{children}</span>
      <span className="font-kn-body text-xs font-semibold leading-tight">
        <span lang="kn" className="block">{label.kn}</span>
        <En className="block text-gandha/75">{label.en}</En>
      </span>
    </li>
  )
}

function Key({ wide, children }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid h-5 place-items-center rounded-[3px] bg-[#f7ecd0] font-poster text-xs leading-none text-theatre shadow-[inset_0_-2px_0_rgba(43,10,14,.35)]',
        wide ? 'w-7 text-sm' : 'w-5'
      )}
    >
      {children}
    </span>
  )
}

function Mouse() {
  return (
    <svg viewBox="0 0 20 28" aria-hidden className="h-6 w-5" fill="none" stroke="#f7ecd0" strokeWidth="1.6">
      <rect x="2" y="2" width="16" height="24" rx="8" />
      <path d="M10 2v9M2 11h16" />
      <path d="M2.8 11V10a7.2 7.2 0 0 1 7.2-7.6V11Z" fill="#f2c12e" stroke="none" />
    </svg>
  )
}

// A little stall: a striped awning over a counter.
function Stall() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6" stroke="#2b0a0e" strokeWidth="1.1" strokeLinejoin="round">
      <path d="M2 9 4 3h16l2 6Z" fill="#f2c12e" />
      <path d="M8 3 7 9M12 3v6M16 3l1 6" />
      <path d="M2 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" fill="#c8102e" />
      <path d="M4 11.5V21h16v-9.5M4 16h16" fill="#c8955f" />
    </svg>
  )
}

function Finger() {
  return (
    <svg viewBox="0 0 24 28" aria-hidden className="h-7 w-6" fill="#f7ecd0" stroke="#2b0a0e" strokeWidth="1.2" strokeLinejoin="round">
      <circle cx="9" cy="5" r="4" fill="none" stroke="#f2c12e" strokeWidth="1.6" />
      <path d="M7.5 5.5a1.5 1.5 0 0 1 3 0v8l1.2-.3a1.5 1.5 0 0 1 1.8 1l.1.3 1.6-.2a1.5 1.5 0 0 1 1.7 1.1l1.4-.1a1.5 1.5 0 0 1 1.7 1.5V21c0 3-2.4 5.5-5.5 5.5h-1.4a5 5 0 0 1-4.2-2.3L4.4 19a1.6 1.6 0 0 1 2.4-2l.7.8Z" />
    </svg>
  )
}

// Over the game while it doesn't have the keyboard, where there is one: a
// light dimming and a big button. A touch screen never needs it, since a
// tap walks straight away.
function PlayGate({ nudge, onPlay }) {
  const [asked, setAsked] = useState(false)
  useEffect(() => {
    if (!nudge) return
    setAsked(true)
    const id = setTimeout(() => setAsked(false), 2500)
    return () => clearTimeout(id)
  }, [nudge])

  return (
    // A click anywhere on it plays (the box takes the keys on pointer down);
    // it covers the game, so that first click doesn't also send the walker.
    <div className="absolute inset-0 z-10 hidden cursor-pointer place-items-center bg-black/35 pointer-fine:grid">
      <button
        key={nudge}
        type="button"
        onClick={onPlay}
        className="flex cursor-pointer flex-col items-center rounded-sm bg-arishina px-6 py-3 text-theatre shadow-[0_0.6rem_1.2rem_rgba(0,0,0,.6)] transition-transform hover:scale-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-kumkuma motion-safe:animate-nudge motion-reduce:transition-none"
        style={nudge ? undefined : { animation: 'none' }}
      >
        <span className="flex items-center gap-2 font-kn-display text-2xl font-extrabold leading-none">
          <span aria-hidden className="text-xl">▶</span>
          <span lang="kn">{asked ? MARKET.playFirst.kn : MARKET.play.kn}</span>
        </span>
        <En className="mt-1 font-poster text-lg leading-none tracking-widest">{asked ? MARKET.playFirst.en : MARKET.play.en}</En>
      </button>
    </div>
  )
}
