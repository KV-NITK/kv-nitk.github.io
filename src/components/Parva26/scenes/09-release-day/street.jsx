import { En } from '@p26/lib/prefs'

// Night sky, the theatre's front wall lit from below, and the street.
export function NightStreet({ subtitles }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 34% 8%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 58% 14%, #fff 0 1.2px, transparent 1.7px), radial-gradient(circle at 81% 6%, #fff 0 1px, transparent 1.5px), radial-gradient(circle at 90% 22%, #fff 0 .8px, transparent 1.3px), radial-gradient(circle at 70% 26%, #fff 0 .8px, transparent 1.3px), linear-gradient(180deg, #17122a, #2b2140 45%, #3b2c48)',
        }}
      />
      {/* Crescent moon */}
      <span className="absolute right-[12%] top-[9%] size-10 rounded-full shadow-[inset_-9px_4px_0_0_#f6ecc8] sm:size-14 sm:shadow-[inset_-13px_6px_0_0_#f6ecc8]" />
      {/* The front wall, lime-washed, warm where the cutout's lamps reach */}
      <div
        className="absolute inset-x-0 bottom-[7%] top-[20%]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 38% 70% at 42% 100%, rgba(255,214,150,.45), transparent 70%), repeating-linear-gradient(90deg, transparent 0 15%, rgba(0,0,0,.18) 15% 16.5%, transparent 16.5% 17%), linear-gradient(180deg, #5b4a36, #463826 60%, #3a2e20)',
        }}
      >
        <span className="absolute inset-x-0 top-0 h-3 bg-[#2e2418] shadow-[0_4px_8px_rgba(0,0,0,.4)]" />
      </div>
      {/* The theatre's name along the top of the wall, in bulb-lit letters */}
      <p className="absolute right-[4%] top-[22.5%] hidden text-right sm:block">
        <span lang="kn" className="block font-kn-card text-[clamp(1.6rem,3vw,2.6rem)] leading-none text-[#ffe6a8] [text-shadow:0_0_6px_rgba(255,200,90,.9),0_0_18px_rgba(255,170,60,.5)]">
          ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ
        </span>
        <En className="mt-1 block font-poster text-lg tracking-[0.3em] text-[#ffe6a8]/70">Sri Gandhada Gudi Chitramandira</En>
      </p>
      {/* Street and kerb, under an orange street light */}
      <div
        className="absolute inset-x-0 bottom-0 h-[8%]"
        style={{ backgroundImage: 'linear-gradient(180deg, #6b6356 0 3px, #2a2622 3px, #1d1a17)' }}
      />
      <span className="absolute -left-[10%] bottom-0 h-[40%] w-[45%] bg-radial-[ellipse_at_30%_100%] from-[#ff9a3c]/25 to-transparent to-65%" />
    </div>
  )
}
