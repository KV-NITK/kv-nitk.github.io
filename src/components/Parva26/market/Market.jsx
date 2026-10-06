import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { En } from '@p26/lib/prefs'
import { useStoredState } from '@p26/lib/storage'
import { PageShell } from '@p26/chrome/page-shell'
import { CharacterPicker } from '@p26/market/character-picker'
import { MarketWorld } from '@p26/market/market-world'
import { PlacePrompt } from '@p26/market/place-prompt'
import { CHARACTERS } from '@p26/market/world/characters'
import { MARKET, PLACES } from '@p26/content'
import { brass } from '@p26/styles/materials'
import { cn } from '@/lib/utils'

// Parva Market (/parva-26/market): the forecourt outside the theatre, walked
// by a boy or a girl you pick. The door of the theatre leads back to the
// landing page; the three shops are stand-ins until their panels are built.
export default function Market() {
  return (
    <PageShell title="ಪರ್ವ ಸಂತೆ · Parva Market" topBar={{ home: '/parva-26', ticket: false }}>
      <MarketPage />
    </PageShell>
  )
}

function useIsPortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const onChange = () => setPortrait(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return portrait
}

function MarketPage() {
  const navigate = useNavigate()
  const portrait = useIsPortrait()
  const [characterId, setCharacterId] = useStoredState('parva26:market:character', null)
  const [changing, setChanging] = useState(false)
  const [near, setNear] = useState(null)

  const character = CHARACTERS.find((c) => c.id === characterId)

  // Using a place: the theatre goes back to the landing page, the merch stall
  // to its shop page; the other shops do nothing yet.
  const use = useCallback(
    (id) => {
      const place = PLACES.find((p) => p.id === id)
      if (place?.go) navigate(place.go)
    },
    [navigate]
  )

  return (
    <main className="fixed inset-0 overflow-hidden bg-theatre">
      {character && <MarketWorld character={character} portrait={portrait} onNear={setNear} onAction={use} />}

      {/* The same places, for anyone who can't walk the forecourt */}
      <nav aria-label="Places" className="sr-only">
        <ul>
          {PLACES.map((p) => (
            <li key={p.id}>
              {p.go ? <Link to={p.go}>{p.en}</Link> : `${p.en}: ${MARKET.soon.en}`}
            </li>
          ))}
        </ul>
      </nav>

      {character && (
        <>
          <Hint />
          <PlacePrompt placeId={near} onUse={use} />
          <button
            type="button"
            onClick={() => setChanging(true)}
            data-en={MARKET.change.en}
            className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-30 cursor-pointer rounded-[5px] px-3 py-1.5 text-left shadow-[0_3px_8px_rgba(0,0,0,.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arishina"
            style={brass}
          >
            <En className="block font-poster text-base leading-none tracking-widest text-[#4a3208]">{MARKET.change.en}</En>
            <span lang="kn" className="block font-kn-display text-xs font-extrabold leading-tight text-[#4a3208]">
              {MARKET.change.kn}
            </span>
          </button>
        </>
      )}

      {(!character || changing) && (
        <CharacterPicker
          onPick={(id) => {
            setCharacterId(id)
            setChanging(false)
          }}
          onClose={character ? () => setChanging(false) : undefined}
        />
      )}
    </main>
  )
}

// How to walk, shown for a few seconds after the market opens.
function Hint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 9000)
    return () => clearTimeout(id)
  }, [])
  return (
    <p
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+4.25rem)] z-30 mx-auto w-fit max-w-[90vw] rounded-sm bg-theatre/80 px-4 py-2 text-center font-kn-body text-base font-semibold text-gandha transition-opacity duration-700 motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* A phone has no arrow keys */}
      <span className="pointer-coarse:hidden">
        <En className="block">{MARKET.hint.en}</En>
        <span lang="kn" className="block text-sm font-medium text-gandha/75">{MARKET.hint.kn}</span>
      </span>
      <span className="hidden pointer-coarse:block">
        <En className="block">{MARKET.hintTouch.en}</En>
        <span lang="kn" className="block text-sm font-medium text-gandha/75">{MARKET.hintTouch.kn}</span>
      </span>
    </p>
  )
}
