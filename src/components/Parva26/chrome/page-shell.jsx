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
import { InkDefs } from '@p26/film/ink-defs'

// Everything the Parva 2026 pages share: the fonts, the preferences (the
// subtitles switch), the dark theatre background, the film layer, the pieces
// that stay on screen (top bar, subtitle strip, agarbatti cursor) and the
// page title. `reel` adds the progress reel, which follows the landing
// page's scenes; `topBar` is passed to the top bar (see TopBar). The page
// itself goes in `children`.
export function PageShell({ title, reel = false, topBar, children }) {
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
        <MetaData title={title} />
        <InkDefs />
        <FilmLayer />
        <TopBar {...topBar} />
        {reel && <FilmReel />}
        <SubtitleStrip />
        <AgarbattiCursor onActiveChange={setCustomCursor} />
        {children}
      </div>
    </PrefsProvider>
  )
}
