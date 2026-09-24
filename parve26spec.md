# Parva landing page plan: ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ

**The idea in one line:** the whole landing page is one show at a theatre called **Sri Gandhada Gudi Chitramandira**. The visitor lights the lamp to open the show, the curtain opens, and Parva plays on the ಬೆಳ್ಳಿ ಪರದೆ (belli parade, silver screen) as they scroll. The page moves through First Half, Interval, Second Half and ends on ಶುಭಂ.

**On the diya vs flowers choice:** I kept both. They happen at different moments, so they don't compete.
- **The diya is the opening.** Every Kannada event starts by lighting the lamp.
- **The flowers are the release-day celebration** in the middle of the page.

---

## 0. Where the build is (handover, 24 Sep 2026)

Read this section first when picking the work up in a new chat. The rest of this file is the original plan; where the build or a later decision differs, this section wins.

### The documents
- **`parve26spec.md` (this file):** what is on the page, scene by scene, and the current status.
- **`parva26-brief.md`:** how it should look and feel: the six rules, the objects that stay on every screen, and Scenes 0–3 in detail.
- **`allscenes.md`:** Scenes 4 and 6–12 in the same detail, plus shared rules A1–A9. Its "Decisions from review" block at the top overrides its own text.
- **`100sites.md`:** the quality bar. Every scene should feel like one of those pages: a place or an object, never "a heading and three cards".

### Decisions made along the way
- **Dates and venue:** 29 and 30 October and 1 November 2026, across the NITK campus. There is no single venue; each event gives its own.
- **Progress reel labels:** ಮೊದಲಾರ್ಧ First Half (Scenes 2–7), ವಿರಾಮ Interval (8–9), ದ್ವಿತೀಯಾರ್ಧ Second Half (10–11), ಶುಭಂ (12). Not "Climax".
- **Digits (rule A5):** prices, dates, times, seat counts and stock counts always use normal digits, even with subtitles off. Kannada numerals are decoration only (edge codes, seat plates, the clock face).
- **Scene 8 has no canteen, and only two things are sold (24 Sep 2026):** the Bhoori Bhojana meal coupon (one price per coupon, one meal on one day, no time slots) and the Parva tee (two variants, Buy now). The interval leaves the hall through padded swing doors into the lobby, where the coupon is sold at the old "ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ · Advance Booking" window and the tee hangs in a glass showcase. The tee is drawn in SVG and turns in 3D until real photos replace it (`photos` per variant in `data.js`).
- **Scene 6 posters** are drawn in code as animated SVG, one motif per kind of event. Only singer and guest posters get a real photo, through the `photo` field in `data.js`.
- **Photos:** until real guest, team and product photos arrive, use dummy details and reuse photos already in the site's gallery.
- **Scene 7 shows three things on one lobby wall:** this year's guests under velvet veils, the guests of past Parvas (lamps lit, photos cropped from the Parva 2025 guest posters), and the sponsors, credited as a film credits its backers on a "producers' board": ಕಾರ್ಯಕಾರಿ ನಿರ್ಮಾಪಕರು · Executive Producers, ಸಹಯೋಗದೊಂದಿಗೆ · In association with, ಮಾಧ್ಯಮ ಸಹಯೋಗ · Media partner. Logos stay in full colour on ivory enamel plates. The Scene 12 "Special thanks" can repeat them in single-colour cream.
- **Other scene changes:** the rest of the `allscenes.md` changes are accepted (veiled portraits for Scene 7, the night street for 9, the rewind bench for 10, the projection booth for 11, gallery and policy links inside the credits for 12).

### Status by scene

| Scene | State | Notes |
|---|---|---|
| Objects on every screen | Built | Logo disc, brass subtitles plate, speaker grille, Book ticket stub, progress reel, subtitle strip, agarbatti cursor, grain and vignette. Sound itself is not built, so the grille does not pulse. |
| 0 Lamp, 1 Curtain and countdown | Paused | Pieces built but not wired in: `lamp.jsx`, `fx/smoke.js` (smoke letters), `fx/leader.js` (೫ ೪ ೩ ೨ countdown), `fx/stage-curtain.js` (curtain that shows the projection bent over its folds, opens and closes). Still to do: the darkness overlay, the sequence on the page (camera close on the lamp, lights coming up, curtain, then title), scroll lock, Skip tab, returning-visitor skip, reduced motion. |
| 1 The hall (set) | Built | Carved arch with crest, parrots and elephants; top drape; tied-back curtains; footlights; name board with chasing bulbs and a dead bulb; pillars, wall lamps, real-time clock, exit sign (left wall); beam, smoke, dust and ceiling fans on one canvas; audience rows that react when the title lands; mouse parallax by depth. |
| 2 Title (hero) | Built | Curved silver screen, painted forest film, extruded ಪರ್ವ with the opening-credits sequence, flip-tile show board (days, hours, minutes), three tickets in the seat in front, scroll-pinned camera push into the screen. Subtitles sit on the screen while the hall shows. |
| 3 Certificate | Built | Typed fields, signature, stamp, ON/OFF subtitles stamp, cue-mark cut. Length now reads "Three full days". |
| 4 Why sandalwood | Built | Film strip pulled sideways by the scroll (pinned, 2 screens): forest, carver's bench, tiny theatre; the agarbatti smoke crosses into frame 3 and becomes its beam. Kannada caption lines still to be written by the club. |
| 5 Fan pass | Paused | Only `fx/transliterate.js` (rule-based English→Kannada spellings) exists, uncommitted. A placeholder section is on the page. |
| 6 Now Showing | Built | Poster hoarding with six painted posters (stand-in events from Parva 2025), genre stamps, posters that turn over to time, venue and a Register stamp, "All shows" sign. |
| 7 Special appearance | Built | The lobby's wall of honour. Laptop: pinned, the camera pans along the wall (1.1 screens) with a velvet rope barrier sliding past in front. Phone: stacked, normal scroll. This year: five arched frames under kumkuma veils with gold cord, wax seal and a date tag; the next guest due gets a countdown stamp and a trembling tag; tapping a veil shakes it and turns the tag over to the PR teaser. The one-time unveiling (seal cracks, cord drops, velvet slides down, lamp flickers on, arishina and kumkuma puff) is remembered in `localStorage`; see it with `/parva-26?unveil`. Then the Parva 2025 guests and the producers' board. Stand-in reveal dates and teasers; no names in the page code. |
| 8 Interval | Built | Pinned 1.4 screens: a worn ವಿರಾಮ card (scratches, one jump) with a "[Interval bell rings]" caption, house lights up, the padded swing doors slide in and swing open onto the lobby, whose tube light flickers on. The lobby (pale green distemper, glossy dado, terrazzo): the Bhoori Bhojana poster with the dishes served onto a banana leaf once the lights are on; the booking window (warm cabin behind bars, coupons-left plate, "few left" chit, HOUSEFULL board when sold out) with the coupon pushed out through the hole as the Book button, and a chalk slate with the price; on a phone a copy of the coupon waits at the bottom of the screen while the poster or window is in view but the coupon isn't; the showcase's glass door swings open on the first tap and the tee comes forward (turns by drag or button, two colours, size tokens with sold-out stamps, size chart, early-price flag, order deadline, Buy now that asks for a size first). Book links in the top bar and on the seat tickets land in the lobby with the move done. Stand-ins from Parva 2025's coupon (OSC, 12:00 PM, ₹199) on 1 Nov; Book and Buy go nowhere until payment is decided. |
| 9 Release day | Built | The street at night, reached through the theatre's folding iron gate (it folds aside as the scene scrolls in). A painted plywood cutout of Samudrappa, our own police-officer hero (khaki uniform, peaked cap, long curly hair, a pistol raised in one hand and a lathi in the other; his name on the base board, his name plate and the "ಸಮುದ್ರಪ್ಪ ಅಭಿಮಾನಿಗಳ ಸಂಘ" fan banner; drawn in code as a stand-in for the artist's painting) on bamboo scaffolding with serial lights, focus lamps and a marigold garland, against the front wall, with its up-lit shadow. Tap the cutout or the flower basket (hold for a stream): marigold, rose and jasmine petals fly up, hit, flutter down and pile on the base board and street; arishina and kumkuma puffs. The fan-club banner shows the shared count and your own (kept in the browser). Every 1,000: a flag and a longer garland; more light strings come on as the count grows, a second focus lamp at 5,000; at 10,000 fireworks and a thank-you banner. Below, the entrance: "ದ್ವಿತೀಯಾರ್ಧ ಆರಂಭ" lights up with a "[Second bell rings]" caption. Preview any count with `?hoomale=9990`. The shared count is a stand-in until the backend exists. |
| 10 Through the years | Built | The rewind bench, pinned 1.5 screens: a film strip between two turning reels over a humming light box, a loupe on the middle frame, blank leader at both ends. Scrolling (or dragging, on a laptop) pulls the film and it snaps to the nearest frame; ◀ ▶ step one frame; tapping a frame goes to it. The frame under the loupe plays large above with a jump cut and its year and line as burned-in subtitles. 13 title cards lettered in their era's style (talkie, faded early colour, painted poster, 2000s gloss, modern, and ಪರ್ವ "ನೀವು ಇಲ್ಲಿದ್ದೀರಿ"), a clear-tape splice at each new era, the year in the film's edge in Kannada numerals. The last frame links to the fan pass. |
| 11–12 | Not started | First-pass placeholder sections are on the page, inside the on-screen film frame. |

### Where the code lives
Route `/parva-26`, lazy-loaded from `src/App.jsx`. `/parva` still shows Parva 2025 until launch. Everything is in `src/components/Parva26/`:
- **Page and data:** `Parva26.jsx` (scene order, which scenes get a `FilmFrame`), `scenes.js` (scene ids and acts), `data.js` (event date and venue, events, genres, guests, meal, merch, timeline, credits; all stand-ins are marked `TODO(content)`), `prefs.jsx` (subtitles and sound preferences, the `Sub` component).
- **Always on:** `top-bar.jsx`, `film-reel.jsx`, `subtitle-strip.jsx` (`sayLine()` for scene lines, `anchorStrip()` to sit on the screen), `agarbatti-cursor.jsx`.
- **The hall and hero:** `scene-title.jsx` (composition, silver screen, forest canvas, air canvas, parallax, camera push), `title-card.jsx`, `show-board.jsx`, `seat-tickets.jsx`, `name-board.jsx` (exports `Bulbs`), `proscenium.jsx`, `theatre-walls.jsx`, `audience.jsx`.
- **Other built scenes:** `scene-certificate.jsx`, `scene-gandhada-gudi.jsx`, `scene-now-showing.jsx`, `poster-art.jsx`, `scene-guests.jsx` (the lobby wall, pan, producers' board) and `honour-frame.jsx` (one frame: lamp, veil, tag, nameplate, unveiling), `scene-interval.jsx` (the interval move and the lobby), `feast-poster.jsx` (banana leaf and dishes), `booking-counter.jsx` (the booking window and coupon), `tee-showcase.jsx` (showcase, 3D tee, choices, Buy now), `scene-release-day.jsx` (street, scaffolding, banner, basket, milestones, gate, second-half sign), `parva-hero.jsx` (the cutout and its garland), `fx/petals.js` (petals, powder and fireworks on one canvas that only runs while something is in the air; landed petals are stamped onto a second canvas), `scene-timeline.jsx` (the rewind bench) and `era-cards.jsx` (the title cards by era).
- **Images:** `assets/guests/` (past guests' portraits as small WebP), `assets/sandal-panel.webp` (the lobby wall's grain tile), `assets/door-quilt.webp` (the swing doors' quilted rexine), `assets/iron-gate.webp` (the folding gate's lattice). Sponsor logos are still read from `public/sponsors/`.
- **Shared effects (`fx/`):** `film-layer.jsx` (grain and flicker canvas; `useFilmScreen`, `useFilmTick`), `film-frame.jsx` (the on-screen frame and cue mark), `forest.js`, `air.js`, `sandal-strip.js`, `carving.js`, `materials.js` and `textures.js` (materials as style objects), `gsap.js` (GSAP with ScrollTrigger and DrawSVG registered), `ink-defs.jsx` (the rubber-stamp SVG filter).
- **Styling:** Tailwind v4 utilities only. Palette, fonts and keyframes are tokens in the `@theme` block of `src/index.css`. Fonts are self-hosted with `@fontsource` (Anek Kannada, Baloo Tamma 2, Noto Serif Kannada, Bebas Neue, Special Elite, Akaya Kanadaka).
- **Gotchas:** don't use `<figure>`/`<figcaption>` in the page: `src/components/Cards/Cards.css` styles every `figure` on the site (white box, padding). `position: sticky` does not work on this site (html, body and #root have `overflow-x: hidden`), so use GSAP pinning or `fixed`. SVG `textPath` breaks Kannada shaping, so lay aksharas out one by one with `graphemes()` from `text.js`. `src/App.css` has a global Poppins rule, scoped away from `.parva26-page`. In React 19 development mode refs are already null in effect cleanups, so capture DOM elements when the effect starts.

### Performance: rules for every new scene
Measured problems and the fixes that worked. Follow these in Scenes 7–12 and the opening.
1. **One canvas per scene for anything that moves all the time,** on the shared 12 fps tick (`useFilmTick`), paused when off screen with an IntersectionObserver. Paint still parts once into offscreen canvases and only composite them each frame (see `forest.js`, `sandal-strip.js`). Cap each canvas's pixel count (the hero forest uses about 480k pixels; the air canvas runs at half resolution).
2. **Never scale or fade a big DOM subtree without promoting it.** Scaling the hall repainted everything at every zoom step: about 5.4 s of painting in a 3 s scroll. Give the moving parts `will-change` only while they move and remove it about 200 ms after they stop, so they repaint once, sharp. The pattern is in `useCameraPush` in `scene-title.jsx`. The interval walk-out (Scene 8) and the ending pull-back (Scene 12) must reuse it. The exception is something that only slides and never scales (the Scene 7 wall): keep its layer for as long as it is near the screen, or every new scroll re-rasters it.
3. **Never write a CSS custom property on `:root` (or `html`/`body`) per frame.** It restyles the whole page. Set it on the one element that uses it (see `anchorStrip`).
4. **Full-screen canvases redraw on their tick, not on every scroll frame.**
5. **No CSS `filter`, `backdrop-filter` or `mix-blend-mode` on large areas, and no live SVG noise textures.** Small elements are fine (stamps use the ink filter). Bake textures to small WebP tiles (`assets/`). On big moving surfaces, bake the grain and grooves too: tiles of a textured wall are painted the first time they slide into view, which is most of the Scene 7 pan's cost.
6. **Small SVG motifs animate with CSS keyframes on transform and opacity only,** and are paused (`animation-play-state`) when off screen (see Scene 6).
7. **Turn mouse parallax off during scroll-driven moves.**
8. **Read layout (`getBoundingClientRect`) once per frame in one place,** after writes, never in a read-write-read loop.
9. **Scroll-driven scenes:** pin with ScrollTrigger and scrub 0.5–0.6; drive drawing from a proxy tween's `onUpdate`. Keep holds under about 1.5 screens (A4).
10. **Every scene needs a reduced-motion path:** no scrubbing, shaking or camera moves; short fades are fine; all content and actions still work.
11. **Page weight:** the Parva chunk is about 57 kB gzipped (through Scene 7) and fonts about 0.6 MB. Keep the first load under 3 MB and load each later scene's images and sound just before it (A8).
12. **Measuring:** profile a production build (`npx vite build && npx vite preview`) with Playwright's headless Chromium, and use a trace to see raster, style and compositing time. The developer's laptop has no GPU (`nomodeset`), so frame rates there are a worst case; compositing that a GPU does for free shows up as CPU time. Judge by raster and style time. Before the push fix: 24 fps; after: raster 5.4 s → 0.25 s and style 0.8 s → 0.1 s.

### Deploying
The live site is nginx on the NITK campus server (10.14.0.80), not GitHub Pages. Every push to `master` is built on GitHub and deployed by the self-hosted runner on that server (`deploy.sh`), and is live within about a minute. Anything pushed to `master` is public, so consider a branch for unfinished work, and add `noindex` to the page until launch. `/events` on the live site returns 403 (nginx `try_files` hitting the real `public/events/` folder).

### What is left
- **Scenes:** 11 projection booth game; 12 credits and ಶುಭಂ; then resume the opening (0–1) and the fan pass (5).
- **Features:** sound (music loop, effects, ducking, pause when hidden), word meanings (glossary), phone tilt parallax (optional).
- **Backend, separate from payments:** counters (lamps, flowers: Scene 9 batches taps and has the send left as a TODO), guest reveals by date, emoji game (daily set, answer checking in Kannada and English, leaderboard with a name filter), optional spelling server for the fan pass.
- **Decision:** booking and payment for the food coupon and the tee (where Book and Buy now go; quantity; pickup).
- **Scene 8 extras not built:** sounds (bell, door creak, lobby chatter), waiting for the site-wide sound step.
- **Scene 10 not built:** the hand crank on the right reel (desktop easter egg), dust in the light-box glow, the strip's vibration while moving, sounds (frame click, reel whirr), the fan-pass name on the 2026 frame (waits for Scene 5), Kannada subtitles for the 13 lines (`lineKn`).
- **Scene 9 not built:** sounds (whistles, cheers, whoosh, drum roll, fireworks, gate rattle, second bell); the fast push back into the screen after the second bell (the entrance sign stands in for it); a loose petal rolling across the street now and then. The cutout is a code-drawn stand-in: the artist's painting is still the biggest art job on the page.
- **Content from the team:** the real event list (the board shows last year's events as stand-ins); the meal day, time, place, price, number of coupons, and the menu in its serving order; the tee's two designs, photos (front and back), prices, early-price quota, sizes in stock and order deadline; guests with photos, permission, reveal dates and teaser lines; this year's sponsors and their tiers (and single-colour logos for the credits); singer and guest poster photos; Scene 4 Kannada captions; 40+ emoji puzzles; 30–50 glossary words; credits with confirmed Kannada spellings; social links and contact; policy texts; music and whistle recordings; the Parva Hero cutout art; a proofread of every Kannada line (including the stand-in event titles and genre stamps) and a check of the timeline years.
- **Launch:** `noindex` until launch, link-preview image and favicon, page-weight check, testing on a cheap Android phone and slow data, reduced motion and accessibility, then point `/parva` to the new page.
- **Leftovers:** "coming soon" placeholders in unbuilt scenes, the dead meal Book button, Register links that go nowhere, timeline film names tagged as Kannada.
- **Server:** fix `/events` 403, merge the two scripts pasted into `deploy.sh`, change the server password if not done.

---

## 1. Look and feel

**Palette.** Keep the theatre warm and dark so the screen glows. Use yellow and red only as accents so the flag colours stay special.

| Name | Use | Colour |
|---|---|---|
| Theatre dark | Background | #140C08 (warm black) |
| Heartwood | Carvings, borders | #6B3F22 |
| Sandalwood | Wood surfaces | #C8955F |
| Gandha cream | Cards, paper, text on dark | #F1DFC0 |
| Arishina yellow | Buttons, highlights | #F2C12E |
| Kumkuma red | Curtain, stamps, HOUSEFULL | #C8102E |
| Brass | Diya, bulbs | #B8862B |
| Projector light | Screen glow | #FFF4DC |

**Fonts.** All of these are free (OFL licence). Host them yourselves so Kannada conjuncts (ottaksharas) never break on phones.
- **The ಪರ್ವ logo:** hand-letter it. It's only three aksharas, and it makes the logo unique.
- **Kannada headings:** Baloo Tamma 2 for a bold poster feel, or Akaya Kanadaka for decorative title cards.
- **Body text and buttons:** Anek Kannada. It has Kannada and English in the same design, so the two languages look consistent.
- **English poster headings:** Bebas Neue or Oswald. Condensed letters like old posters.
- **Ticket and pass numbers:** any monospace font.

**Kannada numerals.** Use Kannada numerals (೦-೯) for decoration only. Prices, dates, times, seat counts and stock counts always use normal digits, even with subtitles off (rule A5 in `allscenes.md`). Many Kannada speakers don't read Kannada numerals quickly.

**The ಬೆಳ್ಳಿ ಪರದೆ effect (the hero visual).**
- **Screen:**
  - A slightly curved silver screen with black borders.
  - The brightness changes by a small, irregular 2-4% with a very small shake, like film in an old projector.
  - Dust specks, the odd scratch, grain and dark corners.
  - It must never strobe. For people who turn on "reduced motion," the screen goes still. Strong flicker can hurt people with light sensitivity.
- **Projector beam:** a cone of light from the projection window at the back, passing above the seats. Sandalwood incense smoke drifts slowly inside it, with sparkling dust. The beam's colour follows whatever is on screen.
- **Seats:**
  - 3-4 rows seen from behind, with a few audience heads. The screen's glow lights their top edges.
  - One empty seat is labelled "ನಿಮ್ಮ ಸೀಟು · Your seat." After the visitor makes a fan pass, their name appears on it.
- **Desktop:** the seat rows stay fixed at the bottom of the window, so every section looks like it's "playing" on the screen.
- **Phone:** seats appear only in the hero. After that, content goes full width, because fixed seats would take up too much of a small screen.

---

## 2. Things on every screen

- **Top bar:**
  - The logo.
  - **Subtitles switch** ("ಉಪಶೀರ್ಷಿಕೆ · Subtitles: ON/OFF").
  - Sound on/off.
  - A sticky **"Book"** button for coupons and merch. The actions that bring in money should always be one tap away.
- **Reel progress:** a small film reel in the corner that unwinds as you scroll, with labels ಮೊದಲಾರ್ಧ First Half / ವಿರಾಮ Interval / ದ್ವಿತೀಯಾರ್ಧ Second Half / ಶುಭಂ. It shows people where they are and how much is left.

---

## 3. The page, scene by scene (with content)

### Scene 0: Pre-show, the lamp (ದೀಪ)
- **On screen:** almost black. There is only an unlit brass diya and a faint outline of the theatre behind it.
- **Text:** "ದೀಪ ಬೆಳಗಿಸಿ · Light the lamp to begin the show"
- **When they tap the wick:**
  - The flame catches and a temple bell rings.
  - Warm light spreads outward and reveals the theatre.
- **Counter below:** "ಇದುವರೆಗೆ ೨,೧೧೪ ದೀಪಗಳು ಬೆಳಗಿವೆ · 2,114 lamps lit so far"
- **A small "Skip" link** in the corner.
- **Returning visitors skip this.** The page remembers they've lit it and opens straight on the hero, with the lamp already burning at the edge of the stage. People coming back to buy coupons shouldn't have to redo the intro.
- **Why it matters:**
  - The visitor gets to "inaugurate" Parva themselves.
  - This tap also unlocks sound. Browsers block audio until the user taps something.

### Scene 1: Curtain and countdown (6-8 seconds total)
- **Name board above the stage:** "ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ," with light bulbs chasing around it.
- **Stage frame:** a carved sandalwood arch with the Gandabherunda at the top.
- **Curtain:** kumkuma red with arishina yellow trim, which is the flag on the curtain.
- **Sequence:**
  1. The projector starts whirring.
  2. The beam appears through the incense smoke.
  3. The curtain opens.
  4. A countdown runs ೫ ೪ ೩ ೨, with a beep on ೨ like real film leaders.
  5. The title card appears.
- **Why this length:** it's long enough to feel like a show and short enough that people don't leave.

### Scene 2: Title card on the screen (hero)
- **Opening line:** "ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ" (Kannada Vedike presents). This is how old Kannada film title cards open.
- **Big hand-lettered ಪರ್ವ**, then "Parva 2026."
- **Tagline:** "ಗಂಧದ ಗುಡಿಯ ಹಬ್ಬ · A festival for the land of sandalwood: its forests, its craft and its cinema"
- **Date and venue.**
- **Countdown to Parva** in days, hours and minutes (flip tiles, normal digits).
- **Three buttons:**
  - "ಭೂರಿ ಭೋಜನ · Get food coupon"
  - "ಪರ್ವ ಅಂಗಡಿ · Merch"
  - "ನಿಮ್ಮ ಪಾಸ್ · Get your fan pass"

### Scene 3: Censor certificate (a joke card)
- **Card text:**
  - "ಪ್ರಮಾಣ ಪತ್ರ · Certificate"
  - Title: ಪರ್ವ
  - Category: ಸರ್ವರಿಗೂ (for everyone)
  - Length: three full days (Parva runs on 29 and 30 October and 1 November)
  - Language: ಕನ್ನಡ, with English subtitles
  - Certified by: Kannada Vedike
- **The Subtitles switch sits right next to it.** This introduces the language toggle through a joke everyone understands.
- Make it clearly a parody. Don't copy the official CBFC certificate design.

### Scene 4: Why sandalwood, "ಗಂಧದ ಗುಡಿ"
Three film-strip frames:
1. **ಕಾಡು · The forest:** "Karnataka has long been called ಗಂಧದ ಗುಡಿ, the temple of sandalwood, home to some of the world's most prized sandalwood trees."
2. **ಕಲೆ · The craft:** "Carvers turned the wood into boxes and figures. In 1916, the Mysore kingdom set up a factory to make soap from sandalwood oil, the start of Mysore Sandal soap."
3. **ಸಿನಿಮಾ · The cinema:** "The fragrance became a name. Kannada cinema is called Sandalwood. In 1973, the same year Mysore State became Karnataka, Dr. Rajkumar starred in *Gandhada Gudi*."

**Visual:** smoke rises from an agarbatti in frame 2 and turns into the projector beam that lights frame 3. This is a small version of the "smoke to screen" trick. It explains the theme to people who don't know why it's called Sandalwood.

### Scene 5: Box office, the Kannada fan pass
- **How it works:**
  1. The visitor types their name in English.
  2. The site suggests 3-4 Kannada spellings to choose from, plus an option to edit.
  3. The pass "prints" out of a box-office window with a stamp sound.
  4. The visitor taps **Share** or **Download**.
- **Why several spellings:** names can be written many ways in Kannada, and a wrong spelling on someone's shareable pass is embarrassing.
- **What's on the pass (1080×1920, Instagram story size):**
  - Theatre name, then "ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ ಪರ್ವ 2026."
  - Their name large in Kannada, with the English version small below it.
  - "ಅಭಿಮಾನಿ ಪಾಸ್ · Fan Pass."
  - A random seat: "ಸಾಲು ಕ · ಆಸನ ೧೭" (Row ಕ, Seat 17).
  - Pass number, date and venue.
  - A QR code that links to the website. People scan it from stories, so it's free promotion.
  - A sandalwood border and a perforated stub.
  - Small text: **"Not an entry ticket."** This matters, so nobody shows it at the gate or the food counter.
- **Tech notes:**
  - **Transliteration:** AI4Bharat's IndicXlit is open source and built for Indian words typed in English letters, so it handles casual spellings well. It needs a small server. A lighter option is a rule-based library in the browser, but its output is rougher, so the edit option becomes important.
  - **Font loading:** draw the image only after the Kannada font has loaded. Otherwise the name comes out as boxes.
  - **Sharing:** on phones, use the phone's share sheet so the image goes straight to Instagram. Download is the fallback.
  - **Privacy:** don't save names unless the person also joins the game leaderboard.
  - **Small bonus:** after making a pass, their name appears on the "Your seat" chair in the hero.

### Scene 6: ಇಂದೇ ನೋಡಿ · Now Showing (event highlights)
- **Posters:** 4-6 poster cards. Tapping one flips it to show time, venue and a register link. A "See all events" button leads to the events page.
- **Genre labels as a joke:** Quiz = Thriller, CTF = Mystery, build events = Action, music = Musical.
- ಇಂದೇ ನೋಡಿ ("see it today itself") is the classic phrase on Kannada film posters.

### Scene 7: ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance (guests)
- **Sealed cards** carry a kumkuma wax seal and a reveal date.
- **Revealed cards** show the name, the role (Chief Guest / Speaker / Playback Singer) and one line about them.
- **The server sends each guest only after their reveal date.** If the names sit in the page's code, your CTF crowd will find them early.

### Scene 8: ವಿರಾಮ · Interval

**Changed (24 Sep 2026): there is no canteen.** Food is one coupon for the one meal day, and the only merch is the tee. As built, see section 0: the interval goes through the swing doors to the lobby's advance booking window and tee showcase.

- **Screen:** a vintage "ವಿರಾಮ" card, with an interval bell.
- **Bhoori Bhojana card:**
  - Heading: "ಬಾಳೆ ಎಲೆ ಊಟ · A full meal on a banana leaf."
  - Menu items appear on the leaf one by one.
  - Slots are shown like show timings, for example "Lunch show 12:00 · 12:45 · 1:30."
  - A "seats left" bar per slot, which turns into a HOUSEFULL stamp when full.
  - Price and a **Book** button.
- **Parva Angadi (ಪರ್ವ ಅಂಗಡಿ, merch):**
  - Items shown as framed posters.
  - A "First Day First Show price" tag for early buyers.
  - A HOUSEFULL stamp on sold-out sizes or items.

### Scene 9: ಬಿಡುಗಡೆ ದಿನ · Release Day cutout
- **The cutout:** a big original "Parva Hero" illustration, not a real star, standing on bamboo scaffolding with a garland.
- **Why not a real star:**
  - Using a real actor's face raises permission questions.
  - Picking one star can start fan-group fights.
- **Each tap:**
  - Throws marigold, rose and jasmine petals, plus bursts of arishina yellow and kumkuma red powder.
  - Plays whistles and cheers.
- **Counter:** "ಹೂಮಳೆ · 4,213 flowers so far." Hoomale means a rain of flowers.
- **Milestones:**
  - The garland grows longer every 1,000 flowers.
  - At 10,000, fireworks go off and a banner appears.
  - A shared goal gives people a reason to come back.
- **Backend rules:**
  - Add up taps in the browser and send them to the server every few seconds, with a cap per visitor per minute. This keeps server load low and stops bots from pumping the number.
  - If the server is down, the animation still works locally.

### Scene 10: ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ · Sandalwood through the years
- **The strip:** a horizontal film strip you can drag.
- **Each frame is a title card** in the lettering style of its era, not a film still. That avoids copyright problems and is quicker to make.
- **Tapping a frame** "projects" it onto the screen with a 2-3 line story.
- **Draft entries.** Please verify every date before publishing.

| Year | Film | Line |
|---|---|---|
| 1934 | Sati Sulochana | The first Kannada talkie |
| 1954 | Bedara Kannappa | Dr. Rajkumar's first film as hero |
| 1964 | Amarashilpi Jakanachari | Often called the first Kannada film in colour |
| 1970 | Samskara | National Award for Best Feature Film; start of the parallel cinema wave |
| 1972 | Naagarahaavu | Vishnuvardhan's first lead role |
| 1973 | Gandhada Gudi | The same year the state was renamed Karnataka |
| 1995 | Om | Upendra's cult film, famous for being re-released again and again |
| 2002 | Appu | Puneeth Rajkumar's first film as lead |
| 2006 | Mungaru Male | The rain-soaked romance that broke box-office records |
| 2013 | Lucia | Crowdfunded by its own audience |
| 2018 | K.G.F: Chapter 1 | Took Kannada cinema across India |
| 2022 | Kantara | Rishab Shetty later won the National Award for Best Actor |
| 2026 | ಪರ್ವ | "You are here," with their name if they made a pass |

### Scene 11: ಯಾವ ಸಿನಿಮಾ? · Which film? (emoji game)
- **Rules:**
  - 5 films a day from a bank of 40 or more.
  - 3 tries per film.
  - A hint (the year or the first letter) costs points.
  - Score is based on correct answers and speed.
- **Check answers on the server,** so nobody can read them from the page code.
- **Accept spelling variants and small typos** (Mungaru Male / Mungaaru Male). English spellings of Kannada titles vary a lot.
- **Daily leaderboard:**
  - Shows the top 10 and resets at midnight.
  - The display name comes from their fan pass, or they type one.
  - Run a basic bad-word filter, because it's public.
- **Share result:** a Wordle-style result ("ಯಾವ ಸಿನಿಮಾ? 4/5 🎬") that spreads the site.
- **Use one open emoji set as images** (Twemoji or Noto Emoji; check the licence and credit it). Emoji look different on iPhone and Android, and a clue can become unreadable on one of them.
- **Starter puzzles:**
  - 🌧️🐰💔 = Mungaru Male
  - 🪁🪁🪁 = Gaalipata
  - 🐗🔥🌳 = Kantara
  - ⛏️🪙👑 = K.G.F
  - 🐕❄️🛣️ = 777 Charlie
  - 🏹👁️🔱 = Bedara Kannappa
  - ↩️🌉👻 = U Turn
  - 🔦💊😴 = Lucia

### Scene 12: Credits and ಶುಭಂ
- **Team credits roll with film titles:**
  - ನಿರ್ದೇಶನ · Directed by (convener)
  - ನಿರ್ಮಾಣ · Produced by (finance)
  - ಸಂಗೀತ · Music (cultural)
  - ಕಲಾ ನಿರ್ದೇಶನ · Art direction (design)
  - ವಿಶೇಷ ಪರಿಣಾಮಗಳು · Special effects (web and tech)
  - ಪ್ರಚಾರ · Publicity (PR)
  - ಸ್ವಯಂಸೇವಕರು · Crew (volunteers)
- **Thank-you line:** "ಅಭಿಮಾನಿ ದೇವರುಗಳಿಗೆ ಧನ್ಯವಾದ," a nod to Dr. Rajkumar calling his fans gods.
- **Footer:** social links and policy pages.
- **Ending:** a big ಶುಭಂ fades in, with "ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ" under it.

---

## 4. Features that run across the page

**Subtitles toggle and meanings**
- **Kannada always stays on screen.** When Subtitles is ON, English appears under it. It's ON by default, so non-Kannada visitors aren't lost, while Kannada still leads visually.
- **Word meanings:** Kannada words with a dotted underline show their meaning when hovered (desktop) or tapped (phone). A subtitle-style strip at the bottom shows the transliteration and meaning. Glossary starter:
  - ಪರ್ವ · parva · festival, special occasion
  - ಗಂಧದ ಗುಡಿ · gandhada gudi · temple of sandalwood, Karnataka's nickname
  - ಬೆಳ್ಳಿ ಪರದೆ · belli parade · silver screen
  - ವಿರಾಮ · virāma · interval
  - ಶುಭಂ · shubham · "the end" in old films (literally "auspicious")
  - ಭೂರಿ ಭೋಜನ · bhoori bhojana · grand feast
  - ಅರಿಶಿನ-ಕುಂಕುಮ · arishina-kumkuma · turmeric and vermilion, the flag colours
  - ಹೂಮಳೆ · hoomale · rain of flowers
  - ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ · sirigannadam gelge · may glorious Kannada prevail
- **Keep all text as real text, never baked into images.** Otherwise the toggle, the meanings and screen readers can't work with it.

**Music and sound**
- **Starting:** music starts on the diya tap.
- **Sound button:** always visible, and the site remembers the visitor's choice.
- **Behaviour:**
  - Music pauses when the tab is hidden.
  - Volume stays low.
  - Music fades down when other sounds play. Nobody wants surprise loud music in a lecture hall.
- **The track:** a warm instrumental loop, 60-90 seconds, that loops without a gap. For example flute or veena over soft drums.
  - Record it with your club's musicians, or use royalty-free music with a clear licence.
  - **No film songs.** Film music belongs to labels, and a takedown near event day would hurt.
- **Loading:** load the music after the first tap, so the page opens fast.

---

## 5. Assets list

**Visuals**

| Asset | Notes | How | Priority |
|---|---|---|---|
| ಪರ್ವ logo and English lockup | Hand-lettered, SVG | Draw | Must |
| Kannada Vedike logo | Vector version | Collect | Must |
| Brass diya | Flame animated in code | Draw + code | Must |
| Carved sandalwood arch with Gandabherunda crest | One large SVG | Draw | Must |
| Name board "ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ" | Bulb chase in code | Draw + code | Must |
| Curtain (red with yellow trim) | Can be done fully in code | Code | Must |
| Seat rows and audience silhouettes | 3-4 rows, back view | Draw | Must |
| Beam, smoke, dust, grain, flicker, scratches | One canvas layer | Code | Must |
| Countdown leader ೫-೧ | | Code | Must |
| Sandalwood texture | Generated in code; photograph a real sandalwood box or carving as colour reference | Code + photo | Must |
| 3 "Gandhada Gudi" story frames | Forest, craft, cinema | Draw | Must |
| Event posters (4-6) | One template with swappable art and text, saves a lot of time | Design | Must |
| Guest cards: sealed and revealed | Guest photos with permission, all in the same duotone | Design + collect | Must |
| Banana leaf and food icons | Based on your real menu | Draw | Must |
| Merch mockups and HOUSEFULL stamp | Tee front/back, tote, stickers, keychain | Design | Must |
| Parva Hero cutout, bamboo scaffold, garland in parts | Garland in parts so it can grow | Draw | Must |
| Petals (3-4 shapes) | Powder bursts done in code | Draw + code | Must |
| Timeline title cards (13) | Each in its era's lettering style | Design | Must |
| Fan pass template (1080×1920) | | Design | Must |
| Emoji set | Twemoji or Noto Emoji, with credit | Collect | Must |
| Icons: sound, subtitles, share, download, menu | | Icon set | Must |
| Link preview image (1200×630) and favicon | How the link looks on WhatsApp and Instagram | Design | Must |
| Censor certificate card | | Design | Nice |
| Vintage interval card | | Design | Nice |

**Audio.** Keep a list of every sound's source and licence.

| Asset | How | Priority |
|---|---|---|
| Background music loop (60-90 s) | Record with club musicians | Must |
| Match strike, flame and temple bell | Record, or CC0 from Freesound | Must |
| Projector whirr loop | CC0 | Must |
| Whistles and cheers for the cutout | Record at a club meeting: free, fun and copyright-free | Must |
| Curtain swish, interval bell, ticket print, petal pop | CC0 | Nice |
| Countdown beep, game right/wrong sounds | Generated in code or CC0 | Nice |

**Content to write or collect**
- **Section copy:** final Kannada and English text for every section (drafts above).
- **Events:** name, one line, genre label, date, time, venue, register link.
- **Guests:** name, role, one line, photo, reveal date, and written permission to feature them.
- **Bhoori Bhojana:** menu, price, slots, capacity per slot, venue, rules.
- **Merch:** items, prices, sizes, size chart, pre-order deadline, pickup place and time.
- **Timeline:** 13 entries with verified years.
- **Emoji bank:** 40+ puzzles with answers, spelling variants and hints.
- **Glossary:** 30-50 words with transliteration and meaning.
- **Team credits:** names and roles. Ask each person to confirm the Kannada spelling of their own name.
- **Club info:** about text, social links, contact.
- **Policy pages:** terms, privacy, refund/cancellation and contact. Payment gateways usually require these on the site.

**Small backend**
- **Counters:** lamps lit and flowers thrown, batched and rate-limited.
- **Guest reveals:** served by date.
- **Emoji game:** daily set, answer checking, leaderboard with a name filter.
- **Transliteration service:** only if you use IndicXlit.
- **Keep this server separate from the payment and ticket server.** These are public toys. A bug or a traffic spike here must never touch the part that handles money.

---

## 6. Things to watch

- **Get every Kannada line proofread by a fluent member.** My Kannada can have mistakes, and an error on a Kannada club's own site is the most visible kind.
- **No film stills, posters or songs anywhere.** Draw tributes and record your own sound.
- **Build for phones first, then test on a cheap Android phone and slow mobile data.** That is what most of your visitors will use.
- **Set a page weight budget:** under about 3 MB for the first load. Load music, timeline cards and the game only when they're needed.

---

## 7. Build order

1. **Content and assets (starts now, runs alongside everything else):** write the copy, get it proofread, collect event, guest, menu and team details, and assign the illustrations.
2. **Design:** palette, fonts, then phone wireframes for all 13 scenes, then desktop.
3. **Static page:** build every section with the real content and no effects yet. This proves the content works before you polish it.
4. **Hero effects:** the belli parde, beam, flicker, seats, diya intro, curtain, countdown and sound.
5. **Core features:** fan pass, then the subtitles toggle and glossary.
6. **Backend:** counters, guest reveals, emoji game and leaderboard.
7. **Remaining scenes:** cutout, timeline, credits.
8. **Test and launch:** reduced-motion mode, slow phones, a final Kannada proofread, then launch.