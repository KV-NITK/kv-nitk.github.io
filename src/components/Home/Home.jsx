import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { ArrowRight, Instagram } from 'lucide-react';
import heroImg from '../../images/img-slider/aboutImg1.jpg';
import aboutImg1 from '../../images/aboutImg1.jpg';
import aboutImg2 from '../../images/aboutImg2.jpg';
import Metadata from '../MetaData/MetaData.jsx';
import { TeamSection } from './TeamSection.jsx';
import { EVENT } from '../Parva26/content/event';
import { PAST_GUESTS } from '../Parva26/content/guests';

// Photos in public/home are web-sized copies of the originals in
// public/gallery and src/images/events (those run to several MB each).

const ACTIVITIES = [
  { title: 'Parva', kn: 'ಪರ್ವ', img: '/home/do-parva.jpg', desc: 'Our flagship festival for Kannada Rajyotsava: three days of culture, competitions and a grand evening with an eminent chief guest.' },
  { title: 'Hudugata Hudakata', kn: 'ಹುಡುಗಾಟ ಹುಡುಕಾಟ', img: '/home/do-hh.jpg', desc: 'A campus-wide treasure hunt for first years. New friends, hidden clues and every corner of NITK.' },
  { title: 'Sobagu', kn: 'ಸೊಬಗು', img: '/home/do-sobagu.jpg', desc: 'Ethnic day, where students from every part of the country come dressed in their traditions.' },
  { title: 'Kannada Kalarava', kn: 'ಕನ್ನಡ ಕಲರವ', img: '/home/do-kalarava.jpg', desc: 'We visit nearby schools with cultural activities that build pride in Karnataka’s heritage.' },
  { title: 'Literary events', kn: 'ಸಾಹಿತ್ಯ', img: '/home/do-literary.jpg', desc: 'Poetry, essays, quizzes and talks that celebrate the depth of Kannada literature.' },
  { title: 'Music & stage', kn: 'ಸಂಗೀತ', img: '/home/do-music.jpg', desc: 'Concerts, Yakshagana, drama and dance — Karnataka’s performing arts, on the NITK stage.' },
];

const GALLERY = [
  { src: '/home/fra_0170.jpg', alt: 'Classical dance performance', className: 'col-span-2 row-span-2' },
  { src: '/home/fra_0003.jpg', alt: 'Chende drummers at the Parva procession', className: 'col-span-2' },
  { src: '/home/fra_0005.jpg', alt: 'Guests on stage at Parva', className: '' },
  { src: '/home/fra_0017.jpg', alt: 'Lighting the lamp', className: '' },
  { src: '/home/img_1313.jpg', alt: 'A play on the Parva stage', className: '' },
  { src: '/home/img_0183.jpg', alt: 'Students in traditional dress', className: '' },
  { src: '/home/fra_9961.jpg', alt: 'Guests in the audience at Parva', className: 'col-span-2' },
];

const PAST_EVENTS = [
  { to: '/parva', img: '/home/fra_0005.jpg', when: '31 Oct – 2 Nov 2025', title: 'Parva 2025', kn: 'ಪರ್ವ ೨೫', desc: 'Celebrating the 69th Kannada Rajyotsava and 52 years of the name Karnataka.' },
  { to: '/hh-2026', img: '/home/hh2026.jpg', when: '30 Aug 2026', title: 'Hudugata Hudakata 2026', kn: 'ಹುಡುಗಾಟ ಹುಡುಕಾಟ', desc: 'A campus-wide treasure hunt for freshers, inspired by Avane Srimannarayana.' },
  { to: '/parva-23', img: '/home/parva23-logo.jpg', when: '7 – 9 Nov 2023', title: 'Parva 2023', kn: 'ಪರ್ವ ೨೩', desc: 'Celebrating the 67th Kannada Rajyotsava and 50 years of the name Karnataka.' },
];

const STATS = [
  { value: '3 days', label: 'of Parva every Rajyotsava' },
  { value: `${PAST_GUESTS.length}`, label: 'eminent guests at Parva' },
  { value: 'Everyone', label: 'welcome, Kannadiga or not' },
];

const SectionHeading = ({ eyebrow, title, intro, light = false, center = false }) => (
  <div className={`mb-10 md:mb-14 ${center ? 'text-center mx-auto' : ''} max-w-2xl`}>
    <p className={`mb-3 text-xs font-semibold tracking-[0.25em] uppercase ${light ? 'text-[#FFDA1D]' : 'text-[#c8102e]'}`}>
      {eyebrow}
    </p>
    <h2 className={`text-3xl md:text-4xl font-bold leading-tight ${light ? 'text-white' : 'text-[#1a1410]'}`}>
      {title}
    </h2>
    {intro && (
      <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/70' : 'text-[#5b5147]'}`}>{intro}</p>
    )}
  </div>
);

const Home = () => {
  return (
    <>
      <Metadata title="Home | Kannada Vedike" />

      {/* --- Hero --- */}
      <section className="relative isolate overflow-hidden bg-[#1a1410]" style={{ minHeight: 'min(calc(100vh - 130px), 760px)' }}>
        <img src={heroImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/90 via-black/65 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black/70 to-transparent" />

        <div className="mx-auto flex max-w-6xl flex-col justify-center px-4 py-20 md:px-8 md:py-28" style={{ minHeight: 'inherit' }}>
          <p className="mb-5 text-xs font-semibold tracking-[0.3em] text-[#FFDA1D] uppercase">
            NITK Surathkal · Kannada & Culture Club
          </p>
          <h1 className="noto-serif-kannada-600 text-5xl leading-tight text-white md:text-7xl">
            ಕನ್ನಡ ವೇದಿಕೆ
          </h1>
          <p className="mt-2 text-xl font-semibold tracking-wide text-white/90 md:text-2xl">Kannada Vedike</p>
          <div className="noto-serif-kannada-400 mt-6 border-l-4 border-[#FFDA1D] pl-4 text-lg leading-relaxed text-[#f2b33d] md:text-xl">
            <p>ಎಲ್ಲಾದರೂ ಇರು ಎಂತಾದರು ಇರು</p>
            <p>ಎಂದೆಂದಿಗು ನೀ ಕನ್ನಡವಾಗಿರು</p>
          </div>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
            Bringing Karnataka’s language, art and traditions to NITK — for Kannadigas and
            everyone who wants to know them.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/parva-26"
              className="inline-flex items-center gap-2 rounded-md bg-[#FFDA1D] px-6 py-3 text-sm font-bold text-black shadow-lg transition hover:bg-[#f2c438]"
            >
              Parva 2026 <ArrowRight className="h-4 w-4" />
            </Link>
            <HashLink
              smooth
              to="/#what-we-do"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              What we do
            </HashLink>
          </div>
        </div>
      </section>

      {/* --- Parva 2026 Banner --- */}
      <Link
        to="/parva-26"
        className="block relative w-full overflow-hidden bg-[#0b0705] group"
      >
        <div
          className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-80"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(212,175,55,0.25) 0%, transparent 60%)' }}
        />
        <div className="relative border-y-2 border-[#d4af37]/40 px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:gap-8">
            <div className="flex-1 text-center md:text-left">
              <p className="mb-3 font-serif text-xs tracking-[0.3em] text-[#d4af37] uppercase md:text-sm">
                Kannada Vedike Presents · {EVENT.dateEn}
              </p>
              <h2 className="mb-1 font-serif text-5xl font-black tracking-tight text-[#FFDA1D] md:text-7xl">
                ಪರ್ವ
              </h2>
              <p className="mb-4 font-serif text-lg font-bold tracking-[0.4em] text-[#f7eed6] md:text-2xl">
                PARVA 2026
              </p>
              <p className="max-w-xl text-sm leading-relaxed text-[#f7eed6]/80 md:text-base">
                Three days of Kannada films, music, drama, quizzes and food
                across campus. See the programme, play the games, and get
                your merch and food coupons.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3">
              <span className="rounded-md bg-[#FFDA1D] px-6 py-3 font-serif text-sm font-extrabold tracking-wider text-black uppercase shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:bg-[#d4af37]">
                Enter the show →
              </span>
              <span className="font-serif text-xs text-[#f7eed6]/60">{EVENT.dateKn}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* --- About --- */}
      <section id="about" className="bg-[#fbf6ea] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="About us"
              title="A home for Karnataka’s language and culture at NITK"
              intro="Kannada Vedike showcases Karnataka’s culture through festivals, competitions, outreach and workshops — and gives students from every state a way into the language and its traditions."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e8dcc0] bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#c8102e] uppercase">Our vision</p>
                <p className="text-sm leading-relaxed text-[#3d342c]">
                  To spread Karnataka’s language, culture and tradition across the institute, as a
                  platform where non-Kannadigas and Kannadigas learn them together.
                </p>
              </div>
              <div className="rounded-xl border border-[#e8dcc0] bg-white p-6 shadow-sm">
                <p className="mb-2 text-xs font-bold tracking-[0.2em] text-[#c8102e] uppercase">Our mission</p>
                <p className="text-sm leading-relaxed text-[#3d342c]">
                  To encourage the use of Kannada and its culture in the institute, celebrating the
                  state’s traditions alongside its technology.
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <img src={aboutImg2} alt="Kannada Vedike members" className="aspect-[4/3] w-full rounded-2xl object-cover shadow-xl" />
            <img
              src={aboutImg1}
              alt=""
              className="absolute -bottom-8 -left-6 hidden aspect-square w-40 rounded-xl border-4 border-[#fbf6ea] object-cover shadow-xl sm:block md:w-48"
            />
          </div>
        </div>

        <dl className="mx-auto mt-20 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-[#e8dcc0] bg-[#e8dcc0] sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white px-6 py-8 text-center">
              <dt className="text-3xl font-bold text-[#8b261b] md:text-4xl">{s.value}</dt>
              <dd className="mt-2 text-sm text-[#5b5147]">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* --- What we do --- */}
      <section id="what-we-do" className="bg-white px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What we do"
            title="Through the year"
            intro="From a treasure hunt in the first weeks of college to the grand stage of Parva in November."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITIES.map((a) => (
              <article key={a.title} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                  <img src={a.img} alt={a.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="noto-serif-kannada-600 text-sm text-[#c8102e]">{a.kn}</p>
                  <h3 className="mt-1 text-lg font-bold text-[#1a1410]">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5b5147]">{a.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- Past guests / Speakers --- */}
      <section id="speakers" className="bg-[#1a1410] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            light
            center
            eyebrow="Guests at Parva"
            title="Voices who have joined us"
            intro="Writers, filmmakers, judges, entrepreneurs and artists who have shared the Parva stage."
          />
          <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {PAST_GUESTS.map((g) => (
              <li key={g.id} className="text-center">
                <img
                  src={g.photo}
                  alt={g.name.en}
                  loading="lazy"
                  className="mx-auto aspect-[3/4] w-full max-w-[150px] rounded-xl object-cover ring-1 ring-white/15"
                />
                <p className="mt-3 text-sm font-semibold text-white">{g.name.en}</p>
                <p className="noto-serif-kannada-400 text-xs text-[#f2b33d]">{g.name.kn}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- Gallery --- */}
      <section id="gallery" className="bg-[#fbf6ea] px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Gallery" title="Moments from Parva" />
          <div className="grid auto-rows-[140px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
            {GALLERY.map((p) => (
              <div key={p.src} className={`overflow-hidden rounded-xl bg-gray-200 ${p.className}`}>
                <img src={p.src} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Past Events --- */}
      <section id="past-events" className="bg-white px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Past events" title="Look back" />
          <div className="grid gap-6 md:grid-cols-3">
            {PAST_EVENTS.map((e) => (
              <Link
                key={e.to}
                to={e.to}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#1a1410]">
                  <img src={e.img} alt={e.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-semibold tracking-[0.15em] text-[#c8102e] uppercase">{e.when}</p>
                  <h3 className="mt-2 text-lg font-bold text-[#1a1410]">
                    {e.title} <span className="noto-serif-kannada-400 text-sm font-normal text-[#8b261b]">· {e.kn}</span>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#5b5147]">{e.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#8b261b] group-hover:gap-2.5 transition-all">
                    View <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- Our Team Section --- */}
      <TeamSection />

      {/* --- Follow --- */}
      <section className="bg-[#FFDA1D] px-4 py-14 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-black md:text-3xl">Be part of Kannada Vedike</h2>
            <p className="mt-2 text-black/70">Event news, registrations and photos — first on Instagram.</p>
          </div>
          <a
            href="https://www.instagram.com/kannadavedike_nitk/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-black px-6 py-3 text-sm font-bold text-[#FFDA1D] transition hover:bg-[#1a1410]"
          >
            <Instagram className="h-4 w-4" /> @kannadavedike_nitk
          </a>
        </div>
      </section>
    </>
  );
};

export default Home;
