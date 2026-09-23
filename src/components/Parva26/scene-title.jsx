import { Shirt, Ticket, UtensilsCrossed } from 'lucide-react'
import { Sub } from './prefs'
import { toKannadaDigits } from './text'
import { EVENT } from './data'
import { useCountdown } from './use-countdown'

export function TitleScene() {
  const { days, hours } = useCountdown(EVENT.date)

  return (
    <section id="title" className="flex min-h-screen scroll-mt-14 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <p lang="kn" className="font-kn-body text-lg text-sandal">ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ</p>

      <div>
        <h1 lang="kn" className="font-kn-display text-8xl font-extrabold text-arishina drop-shadow-[0_0_30px_rgba(242,193,46,0.35)] sm:text-9xl">
          ಪರ್ವ
        </h1>
        <p className="font-poster text-3xl tracking-[0.15em] text-gandha sm:text-4xl">PARVA 2026</p>
      </div>

      <Sub
        kn="ಗಂಧದ ಗುಡಿಯ ಹಬ್ಬ"
        en="A festival for the land of sandalwood: its forests, its craft and its cinema"
        className="max-w-xl"
        knClassName="font-kn-display text-xl text-gandha/90"
        enClassName="mt-1 text-sm text-gandha/60"
      />

      <p className="text-sm text-sandal">
        <span lang="kn">{EVENT.dateLabel.split(' · ')[0]}</span> · {EVENT.dateLabel.split(' · ')[1]} · {EVENT.venue}
      </p>

      <div className="flex flex-col items-center gap-1 rounded-2xl border border-heartwood bg-heartwood/10 px-8 py-4">
        <p lang="kn" className="text-xs tracking-wide text-sandal">ಪ್ರದರ್ಶನ ಪ್ರಾರಂಭಕ್ಕೆ</p>
        <div className="flex items-baseline gap-3 font-poster text-4xl text-projector">
          <span>{toKannadaDigits(days)}<span className="text-base text-sandal"> ದಿನ</span></span>
          <span>{toKannadaDigits(hours)}<span className="text-base text-sandal"> ಗಂಟೆ</span></span>
        </div>
        <p className="text-xs text-gandha/60">{days} days {hours} hours to showtime</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <a href="#interval" className="inline-flex items-center gap-2 rounded-full bg-kumkuma px-5 py-2.5 font-poster text-lg tracking-wide text-projector transition-colors hover:bg-kumkuma/80">
          <UtensilsCrossed className="size-4" />
          <span><span lang="kn">ಭೂರಿ ಭೋಜನ</span> · Get food coupon</span>
        </a>
        <a href="#interval" className="inline-flex items-center gap-2 rounded-full bg-heartwood px-5 py-2.5 font-poster text-lg tracking-wide text-gandha transition-colors hover:bg-heartwood/80">
          <Shirt className="size-4" />
          <span><span lang="kn">ಪರ್ವ ಅಂಗಡಿ</span> · Merch</span>
        </a>
        <a href="#fan-pass" className="inline-flex items-center gap-2 rounded-full bg-arishina px-5 py-2.5 font-poster text-lg tracking-wide text-theatre transition-colors hover:bg-projector">
          <Ticket className="size-4" />
          <span><span lang="kn">ನಿಮ್ಮ ಪಾಸ್</span> · Get your fan pass</span>
        </a>
      </div>
    </section>
  )
}
