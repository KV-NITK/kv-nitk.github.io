# Parva landing page plan: ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ

**The idea in one line:** the whole landing page is one show at a theatre called **Sri Gandhada Gudi Chitramandira**. The visitor lights the lamp to open the show, the curtain opens, and Parva plays on the ಬೆಳ್ಳಿ ಪರದೆ (belli parade, silver screen) as they scroll. The page moves through First Half, Interval, Second Half and ends on ಶುಭಂ.

**On the diya vs flowers choice:** I kept both. They happen at different moments, so they don't compete.
- **The diya is the opening.** Every Kannada event starts by lighting the lamp.
- **The flowers are the release-day celebration** in the middle of the page.

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

**Kannada numerals.** Use Kannada numerals (೦-೯) for decoration, and show normal digits in the English subtitles. Many Kannada speakers don't read Kannada numerals quickly.

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
- **Reel progress:** a small film reel in the corner that unwinds as you scroll, with labels First Half / ವಿರಾಮ / Second Half / Climax. It shows people where they are and how much is left.

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
- **Countdown to Parva** in days and hours.
- **Three buttons:**
  - "ಭೂರಿ ಭೋಜನ · Get food coupon"
  - "ಪರ್ವ ಅಂಗಡಿ · Merch"
  - "ನಿಮ್ಮ ಪಾಸ್ · Get your fan pass"

### Scene 3: Censor certificate (a joke card)
- **Card text:**
  - "ಪ್ರಮಾಣ ಪತ್ರ · Certificate"
  - Title: ಪರ್ವ
  - Category: ಸರ್ವರಿಗೂ (for everyone)
  - Length: one full day
  - Language: ಕನ್ನಡ, with English subtitles
  - Certified by: Kannada Vedike
- **The Subtitles switch sits right next to it.** This introduces the language toggle through a joke everyone understands.
- Make it clearly a parody. Don't copy the official CBFC certificate design.

### Scene 4: Why sandalwood, "ಗಂಧದ ಗುಡಿ"
Three film-strip frames:
1. **ಕಾಡು · The forest:** "Karnataka has long been called ಗಂಧದ ಗುಡಿ, the temple of sandalwood, home to some of the world's most prized sandalwood trees."
2. **ಕಲೆ · The craft:** "Carvers turned the wood into boxes and figures. In 1916, Mysuru built a factory that turned sandalwood oil into the famous Mysore Sandal soap."
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

### Scene 8: ವಿರಾಮ · Interval (the canteen)
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