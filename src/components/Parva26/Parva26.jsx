import '@fontsource-variable/anek-kannada'
import '@fontsource-variable/baloo-tamma-2'
import '@fontsource/bebas-neue'
import '@fontsource-variable/noto-serif-kannada'
import '@fontsource/special-elite'
import '@fontsource/akaya-kanadaka'

import { useState } from 'react'
import MetaData from '../MetaData/MetaData'
import { cn } from '../../lib/utils'
import { PrefsProvider, Sub } from './prefs'
import { TopBar } from './top-bar'
import { FilmReel } from './film-reel'
import { SubtitleStrip } from './subtitle-strip'
import { AgarbattiCursor } from './agarbatti-cursor'
import { FilmLayer } from './fx/film-layer'
import { FilmFrame } from './fx/film-frame'
import { InkDefs } from './fx/ink-defs'
import { ACTS } from './scenes'
import { TitleScene } from './scene-title'
import { CertificateScene } from './scene-certificate'
import { GandhadaGudiScene } from './scene-gandhada-gudi'
import { NowShowingScene } from './scene-now-showing'
import { GuestsScene } from './scene-guests'
import { IntervalScene } from './scene-interval'
import { ReleaseDayScene } from './scene-release-day'
import { TimelineScene } from './scene-timeline'
import { EmojiGameScene } from './scene-emoji-game'
import { CreditsScene } from './scene-credits'

// Parva 2026 landing page: the whole page is one show at "Sri Gandhada Gudi
// Chitramandira". Full plan in parve26spec.md.
export default function Parva26() {
  // While the agarbatti cursor is active, hide the system cursor everywhere
  // except text fields.
  const [customCursor, setCustomCursor] = useState(false)

  return (
    <PrefsProvider>
      <div
        className={cn(
          'parva26-page min-h-screen scheme-dark bg-theatre font-kn-body text-gandha antialiased',
          customCursor && 'cursor-none! [&_*]:cursor-none! [&_:is(input,textarea)]:cursor-text!'
        )}
      >
        <MetaData title="ಪರ್ವ 2026 · Parva by Kannada Vedike, NITK" />
        <InkDefs />
        <FilmLayer />
        <TopBar />
        <FilmReel />
        <SubtitleStrip />
        <AgarbattiCursor onActiveChange={setCustomCursor} />
        {/* After the title, the show plays on screen (in a FilmFrame), except
            for the interval, when you step out of the hall (allscenes.md A1). */}
        <main>
          <TitleScene />
          <CertificateScene />
          <GandhadaGudiScene />
          <FilmFrame><FanPassStub /></FilmFrame>
          <FilmFrame><NowShowingScene /></FilmFrame>
          <GuestsScene />
          <IntervalScene />
          <ReleaseDayScene />
          <TimelineScene />
          <FilmFrame><EmojiGameScene /></FilmFrame>
          <FilmFrame><CreditsScene /></FilmFrame>
        </main>
      </div>
    </PrefsProvider>
  )
}

// Scene 5, ನಿಮ್ಮ ಪಾಸ್ · Fan Pass: build order puts this after the theatre
// effects and transliteration work (build plan step 11), so it stays a
// placeholder for now.
function FanPassStub() {
  return (
    <section
      id="fan-pass"
      className="flex min-h-[70vh] scroll-mt-14 flex-col items-center justify-center gap-3 border-b border-heartwood/40 px-4 py-20 text-center"
    >
      <p className="font-poster text-lg tracking-[0.2em] text-sandal">
        Scene 5 · {ACTS['first-half'].en}
      </p>
      <Sub
        as="h2"
        kn="ಅಭಿಮಾನಿ ಪಾಸ್"
        en="Fan Pass"
        knClassName="font-kn-display text-5xl font-bold leading-tight sm:text-7xl"
        enClassName="font-poster text-2xl tracking-wide text-sandal"
      />
      <p className="text-sm text-gandha/60">Coming soon</p>
    </section>
  )
}
