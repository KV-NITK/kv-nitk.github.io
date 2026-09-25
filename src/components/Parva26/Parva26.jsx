import '@fontsource-variable/anek-kannada'
import '@fontsource-variable/baloo-tamma-2'
import '@fontsource/bebas-neue'
import '@fontsource-variable/noto-serif-kannada'
import '@fontsource/special-elite'
import '@fontsource/akaya-kanadaka'

import { useState } from 'react'
import MetaData from '@/components/MetaData/MetaData'
import { cn } from '@/lib/utils'
import { PrefsProvider } from '@p26/lib/prefs'
import { TopBar } from '@p26/chrome/top-bar'
import { FilmReel } from '@p26/chrome/film-reel'
import { SubtitleStrip } from '@p26/chrome/subtitle-strip'
import { AgarbattiCursor } from '@p26/chrome/agarbatti-cursor'
import { FilmLayer } from '@p26/film/film-layer'
import { FilmFrame } from '@p26/film/film-frame'
import { InkDefs } from '@p26/film/ink-defs'
import { TitleScene } from '@p26/scenes/02-title'
import { CertificateScene } from '@p26/scenes/03-certificate'
import { GandhadaGudiScene } from '@p26/scenes/04-gandhada-gudi'
import { FanPassScene } from '@p26/scenes/05-fan-pass'
import { NowShowingScene } from '@p26/scenes/06-now-showing'
import { GuestsScene } from '@p26/scenes/07-guests'
import { IntervalScene } from '@p26/scenes/08-interval'
import { ReleaseDayScene } from '@p26/scenes/09-release-day'
import { TimelineScene } from '@p26/scenes/10-timeline'
import { EmojiGameScene } from '@p26/scenes/11-emoji-game'
import { CreditsScene } from '@p26/scenes/12-credits'

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
          <FilmFrame><FanPassScene /></FilmFrame>
          <FilmFrame><NowShowingScene /></FilmFrame>
          <GuestsScene />
          <IntervalScene />
          <ReleaseDayScene />
          <TimelineScene />
          <EmojiGameScene />
          <CreditsScene />
        </main>
      </div>
    </PrefsProvider>
  )
}
