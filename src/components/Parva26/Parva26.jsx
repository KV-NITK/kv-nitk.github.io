import { PageShell } from '@p26/chrome/page-shell'
import { FilmFrame } from '@p26/film/film-frame'
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
  return (
    <PageShell title="ಪರ್ವ 2026 · Parva by Kannada Vedike, NITK" reel>
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
    </PageShell>
  )
}
