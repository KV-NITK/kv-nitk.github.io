# Parva 2026 — Scene designs in detail: Scene 4 and Scenes 6–12

This file continues `parva26-brief.md`, which covers Scenes 0–3 in full. It gives Scene 4 and Scenes 6–12 the same level of detail, so they can be built without guessing.

Every scene follows the six rules from the brief: one place, no plain cards, light from real sources, nothing fully still, every surface has a material, and type is made. Colours and fonts come from the brief. Any new colour is marked **(new)**.

Each scene is written in the same order: Job, Where we are, the object and its look (materials, light, colour grade), Type, Motion, Interaction, Sound, Transition out, Phone layout, Reduced motion, and Assets. "Why" notes explain choices that aren't obvious.

### Decisions from review (23 Sep 2026) — these override the text below
- **Scene 7 (24 Sep 2026):** the lobby wall also carries the guests of past Parvas (revealed, lamps lit) and the sponsors on a producers' board (Executive Producers, In association with, Media partner), logos in full colour on enamel plates. The wall pans on a laptop; a velvet rope barrier in front gives depth.
- **Dates and venue:** Parva runs on three days, 29 and 30 October and 1 November 2026, across the NITK campus. There is no single venue: each event gives its own venue in its details.
- **Scene 8 has no canteen.** Food is a **coupon** for the one day there is a meal: people buy the coupon and come and eat. **As built (24 Sep 2026):** one coupon at one price, no slots; the only merch is the tee in two variants with Buy now. The move is the ವಿರಾಮ card, the bell, house lights, then padded swing doors that open onto the lobby (no pull-back over the seats). The lobby has the Bhoori Bhojana poster with the banana leaf, the "ಮುಂಗಡ ಕಾಯ್ದಿರಿಸುವಿಕೆ · Advance Booking" window selling the coupon like a film ticket, and a glass showcase with a 3D tee.
- **The ending stays ಶುಭಂ.** The progress reel reads First Half → ವಿರಾಮ (Scenes 8–9) → Second Half → ಶುಭಂ. It does not use "Climax".
- **Photos:** until real guest, team and product photos arrive, use dummy details and reuse photos already in the site's gallery.
- **Digits:** the show board's countdown tiles and every date use normal digits (rule A5).
- The other scene changes listed at the end of this file are accepted.
- **Scene 9 (24 Sep 2026):** the Parva Hero is drawn in code (SVG) as a stand-in until the painted cutout arrives. Counts use normal digits, milestone flags included (A5). On a phone the 10,000 thank-you sits on the fan banner, clear of the hero. The walk back into the hall is the lit "ದ್ವಿತೀಯಾರ್ಧ ಆರಂಭ" sign over the entrance; the fast push into the screen is not built yet.
- **Scene 6 poster art:** posters are drawn in code as animated SVG from one template (a motif per kind of event). Only singer and guest posters get a real image later, in a photo slot the template keeps. Until the real list arrives, the events are last year's, moved to this year's dates.

---

## Part A — Rules shared by all these scenes

### A1. The show's structure

| Part of the show | Scenes | Where the camera is | Reel label |
|---|---|---|---|
| First Half | 2–7 | Inside the screen | First Half |
| Interval | 8–9 | Out of the hall: canteen, then the street outside | ವಿರಾಮ |
| Second Half | 10–11 | Back inside the screen | Second Half |
| Climax | 12 | Screen, then the whole theatre | Climax |

**Why the interval leaves the screen:** in a real cinema, the interval is the one time you get up and walk out. It is also where all the money actions live (food coupons and merch). Giving it a different place and a different light makes those sections stand out without loud colours or pop-ups.

### A2. The "on screen" look
From the brief: after the hero push, scenes play inside the screen with a thin black border, grain, faint flicker and dust. Each scene below adds its own **colour grade** (overall tint), but the border, grain and flicker never go away while we're on screen.

### A3. Cuts between scenes
- **Default cut:** the cue-mark cut from Scene 3 (a small round dot flashes top-right, then a quick cut). Use it unless a scene says otherwise.
- **Special moves** are saved for three big moments: going out for the interval (7→8), coming back for the second half (9→10), and the ending (12).
- **Why:** one repeated cut teaches the visitor the rhythm of the page. If every scene had its own fancy transition, none of them would feel special.

### A4. Scrolling
- Each scene "holds" (stays in place) for a set scroll distance while its animation plays, then lets go. The hold is given per scene, in screen heights.
- No hold is longer than about 1.5 screens. **Why:** phone users flick fast, and a long hold feels like the page is stuck.
- A fast flick always goes straight through a scene. Nothing forces the visitor to watch.
- Scroll-driven animation plays forward and backward with the scroll. **Why:** it never plays while the visitor isn't looking, and scrolling back feels like rewinding film.

### A5. Text, subtitles and numbers
- Kannada leads. When Subtitles is ON, English sits under it in smaller type (the rule from Scene 3).
- All text is real text, never baked into images, so the subtitle switch, the meanings strip and screen readers all work.
- Kannada numerals (೦–೯) are for decoration only. **Prices, dates, times, seat counts and stock counts always use normal digits, even with Subtitles OFF.** **Why:** many people don't read Kannada numerals quickly, and misreading a price or a time causes real problems.
- Glossary words (dotted underline) work in every scene.

### A6. Sound
- All sounds are short and quiet, and only play when sound is ON.
- The music dips for a moment under each sound effect, then comes back. **Why:** otherwise effects and music fight, and both sound worse.
- Where a sound repeats a lot (cheers, clicks), use 3–4 slightly different recordings picked at random. **Why:** the same whistle 40 times in a row gets irritating fast.

### A7. Tap sizes and clarity
- Anything tappable is at least fingertip size (about 44 × 44 px).
- Anything about money, time or place (prices, slots, dates, venues, sizes) is clear, high-contrast text at 16 px or bigger. The theme can decorate the edges, never the numbers.

### A8. Loading
Each scene's images and sounds load while the scene before it is on screen. **Why:** this keeps the first load under the ~3 MB budget from the brief, and the next scene is ready when the visitor gets there.

### A9. Reduced motion
When the visitor has "reduce motion" turned on: no shaking, flicker, scroll-scrubbing, flying petals or camera moves. Short fades are fine. All content and every action (booking, game, pass) still works; only the movement goes.

---

## Scene 4 — ಗಂಧದ ಗುಡಿ · Why Sandalwood

### Job
In about 20 seconds, show why Kannada cinema is called Sandalwood, so the whole theme makes sense to everyone, including students from outside Karnataka.

### Where we are
Inside the screen. The shot is a short length of film shown sideways: **three frames in a row**, joined by the film's sprocket edges. Scrolling pulls the film sideways, so each frame slides into the centre in turn, like film moving through a projector.

**Hold:** about 1.5 screens.

### The film strip (the object)
- **Base colour:** dark amber, like old film base, #2A1A0E **(new)**.
- **Sprocket holes:** small rounded rectangles along the top and bottom edges. Light shines through them from behind (projector light #FFF4DC, low strength). **Why:** light through the holes says "film held up to a light" without any label.
- **Edge numbers:** tiny yellow numbers printed along the margin, like the codes on real film edges: "ಪರ್ವ ೨೬ ▸ ೧", "▸ ೨", "▸ ೩". Film lovers notice them; everyone else just sees texture.
- **Wear:** thin scratches running along the length, a few dust specks, grain.
- **Frame shape:** nearly square (about 4:3) with slightly rounded corners, like old films. **Why:** the hero is wide, so a squarer frame instantly feels older and marks this as a "flashback".

### Frame 1 — ಕಾಡು · The forest
- **Picture (4 layers):** far hills in misty blue-grey; a middle row of slender sandalwood trees (small, thin-trunked, dark leaves, not a giant rainforest); one near tree slightly out of focus; low mist across the ground.
- **Colour grade:** cool, slightly green-grey, with lifted blacks, like faded early colour film.
- **Light:** a low dawn sun from the left, with soft rays falling through the leaves. **Why:** these rays are the forest's version of a projector beam, and they quietly set up the "smoke becomes a beam" moment in Frame 3.
- **Motion:** mist drifts left to right very slowly (about a 40-second loop), leaves sway slightly, and a pair of small birds crosses every 10–15 seconds.
- **Sound:** soft morning birdsong, only while this frame is in the centre.

### Frame 2 — ಕಲೆ · The craft
- **Picture (5 layers):** a carver's bench in a small workshop. We see only the carver's hands (no face), carving an elephant onto a small box lid. Chisels lie in a row, wood shavings curl on the bench, and an agarbatti burns in a small brass stand at the right edge.
- **Colours:** sandalwood surface #C8955F, fresh shavings #E0B988 **(new)**, brass stand #B8862B.
- **Colour grade:** warm amber.
- **Light:** a small brass oil lamp on the bench, the only light in the frame. Its flicker makes the chisels' shadows sway a little.
- **Motion:** the hands repeat one slow carving stroke (about a 6-second loop) and a shaving curls off and drops; the lamp flickers; the agarbatti smoke rises in a thin line that bends slowly.
- **Sound:** a soft chisel tap once per loop.

### Frame 3 — ಸಿನಿಮಾ · The cinema
- **Picture (3 layers):** a tiny old theatre seen from the back row, a small version of our own theatre. Its little screen is dark at first.
- **Colour grade:** silver-blue tint. **Why:** it links to ಬೆಳ್ಳಿ ಪರದೆ (silver screen), the site's main idea.

### The key moment: smoke becomes the beam
- As Frame 3 slides toward the centre, the agarbatti smoke from Frame 2 **crosses the black gap between the frames** and enters Frame 3.
- Inside Frame 3, the smoke straightens and brightens into the projector beam of the tiny theatre.
- When the beam reaches the tiny screen, it lights up and shows a small hand-lettered "ಗಂಧದ ಗುಡಿ" title card (our own drawing, not copied from the real film).
- This is driven by scroll. If the visitor stops halfway, the smoke hangs halfway.
- **Why the smoke breaks the frame line:** in every other scene, frame edges are strict. Breaking the rule once, here, makes the link between the wood and the cinema feel physical. This is the one idea the whole theme rests on, so it gets the one rule-break.

### Type
- **Frame titles** (ಕಾಡು, ಕಲೆ, ಸಿನಿಮಾ) are painted in the top-left corner of each frame in Akaya Kanadaka, like old film title cards.
- **Captions** appear as **burned-in subtitles** at the bottom of each frame: off-white text with a slightly soft edge and a faint dark outline, like subtitles printed onto old film prints. Kannada line first, English under it when Subtitles is ON. **Why:** burned-in subtitles are a real film object, and they match the subtitle idea Scene 3 introduced.

### Caption copy (Kannada to be written and proofread by the club)
1. **ಕಾಡು:** "Karnataka has long been called ಗಂಧದ ಗುಡಿ, the temple of sandalwood, home to some of the world's most prized sandalwood trees."
2. **ಕಲೆ:** "Carvers turned the wood into boxes and figures. In 1916, the Mysore kingdom set up a factory to make soap from sandalwood oil, the start of Mysore Sandal soap."
   - **Verify:** the soap factory was set up in Bengaluru by the Mysore kingdom. The spec's earlier wording ("Mysuru built a factory") could be read as the city, so this line says "the Mysore kingdom" instead.
3. **ಸಿನಿಮಾ:** "The fragrance became a name. Kannada cinema is called Sandalwood. In 1973, the same year Mysore State became Karnataka, Dr. Rajkumar starred in *Gandhada Gudi*."

### Transition out
Hold for about half a screen after Frame 3 so people can read the last caption, then the default cue-mark cut to Scene 5.

### Phone layout
- One frame at a time, full width. The strip still moves **sideways**, driven by the normal up-down scroll.
- No sideways swipe. **Why:** on phones, sideways swipes fight with the page's up-down scroll, and people get stuck.
- The smoke crossing still happens: it comes out of the right edge of Frame 2 as Frame 3 slides in.
- Drop the birds and the near-tree layer to save weight.

### Reduced motion
The three frames appear one after another with fades. The smoke is a still picture already joining Frame 2 to Frame 3.

### Assets
- Frame 1: 4 illustration layers.
- Frame 2: 5 layers (bench, hands in 2–3 poses for the loop, chisels, lamp, agarbatti).
- Frame 3: 3 layers, plus the tiny ಗಂಧದ ಗುಡಿ title card.
- Film strip texture (repeatable), sprocket hole shape, scratch and dust overlay (shared with other scenes).
- Smoke: drawn in code or as a short image sequence.
- Sounds: birdsong, chisel tap (CC0).
- Copy: 3 captions in Kannada and English.

---

## Scene 6 — ಇಂದೇ ನೋಡಿ · Now Showing

### Job
Show the 4–6 headline events and get people to register, or to open the full events page.

### Where we are
Inside the screen. The film cuts to a shot of the theatre's **poster hoarding**: the big wooden board outside a single-screen theatre where new posters are pasted every Friday. We see it straight on, in the evening.

**Hold:** about 1 screen. On desktop all posters fit at once; if there are more than 5, the camera slides slowly sideways along the board as you scroll.

### The board (the object)
- **Frame:** heavy wooden frame in heartwood #6B3F22, with visible nails at the corners.
- **Header:** "ಇಂದೇ ನೋಡಿ" hand-painted across the top in big letters, arishina yellow #F2C12E with a kumkuma red #C8102E drop shadow, the classic Kannada poster lettering style. "NOW SHOWING" painted smaller underneath (Bebas Neue with a brush-edge texture and slightly uneven fill, so it looks painted, not typed).
- **Bulbs:** a row of marquee bulbs along the top edge. Brass sockets #B8862B, warm bulbs #FFE9A8 **(new)**. They "chase" slowly (one step about every 180 ms). One bulb is dead; one flickers. **Why:** a perfect row of bulbs looks digital. One broken bulb makes it real.

### The posters
- **4–6 posters**, portrait (2:3), pasted on the board.
- **Not a neat grid:** each poster is tilted a small random amount (between −1.5° and +1.5°), and neighbours overlap a little at the edges, like fresh posters pasted over old ones.
- **Old poster scraps** peek out from behind: torn bits of paper in faded colours. **Why:** the overlap and the scraps are the difference between "a real board" and "a card grid".
- **Paper:** poster paper with small wrinkles and paste bubbles, and slightly darker glue stains along the edges.
- **Poster design:** an original illustration in the old hand-painted Kannada poster style: big title lettering, one central image, a tagline, and a date strip along the bottom. Each poster has its own main colour, all taken from the palette.
- **Front of each poster:**
  - Kannada title (big), English title under it (follows the Subtitles switch).
  - Date strip: "ನವೆಂಬರ್ 1 · 1 Nov".
  - **Genre stamp** in the top-right corner: a round rubber stamp, same style as the Scene 3 stamp. Quiz: ರೋಮಾಂಚಕ · THRILLER. CTF: ನಿಗೂಢ · MYSTERY. Build events: ಸಾಹಸ · ACTION. Music: ಸಂಗೀತಮಯ · MUSICAL. (Proofread these genre words.)

### Light
- The bulbs light the top half of the posters more than the bottom half (soft fall-off going down).
- A street lamp just outside the frame on the left adds a weak cool side light, #9FB3C8 **(new)**.
- **Why two light colours:** warm light from above and cool light from the side is what makes it look like an evening street, not a flat picture.

### Motion (idle)
- Bulb chase and the flickering bulb.
- Every ~8 seconds, one random poster's bottom corner lifts in the breeze and settles back.
- Nice to have: 2–3 small moths fluttering around the bulbs.

### Interaction: turning a poster over
- **Hover (desktop):** the poster lifts slightly off the board (its shadow grows) and its bottom-right corner curls up a little.
- **Tap / click:** the poster peels off from one corner and **turns over**, rotating around its left edge (about 0.5 s).
- **The back** is plain paper with paste marks. On it, as if written with a marker and a rubber stamp:
  - Time and venue (clear text, normal digits).
  - One line about the event.
  - A stamped box button: "ನೋಂದಣಿ · Register".
- **Closing:** tap the poster again, or anywhere outside it. It turns back and re-sticks with a small "slap".
- **Only one poster is open at a time.** **Why:** two open posters overlap on a phone and become confusing.
- **Why turning over instead of a pop-up:** a pop-up box breaks the "real object" rule, while turning a poster over to read the back is something everyone's hand already knows.

### "See all events"
A small painted arrow sign nailed to the right side of the board: "ಎಲ್ಲಾ ಚಿತ್ರಗಳು → All shows". It opens the full events page.

### Sound
Very quiet evening street sound (distant traffic, one far-off auto horn); paper rustle when a poster turns; a soft "slap" when it re-sticks.

### Transition out
Default cue-mark cut to Scene 7.

### Phone layout
- Posters in 2 columns, still tilted and slightly overlapping (not straight rows).
- The board scrolls normally with the page (no sideways camera move).
- On the back of a turned poster, the Register button spans the full poster width.

### Reduced motion
No bulb chase, lifting corners or moths. Turning a poster over becomes a quick fade from front to back.

### Accessibility
Each poster is a button with a clear label, for example: "Quiz, Thriller, 1 November. Tap for details."

### Assets
- Board frame, nails, header lettering (painted by an artist, or built from fonts with a paint texture).
- Bulb and socket images (on, off, dead).
- 4–6 poster illustrations. **The biggest art job in this scene; assign it early.**
- 3–4 old poster scraps; poster back texture with paste marks.
- 4 genre stamps; arrow sign.
- Sounds: street ambience, paper rustle, slap.

---

## Scene 7 — ವಿಶೇಷ ಪಾತ್ರದಲ್ಲಿ · Special Appearance (guests)

### Job
Build excitement by revealing guests one at a time before Parva, and give people a reason to come back to the site.

### Where we are
Inside the screen. The shot is the theatre's **wall of honour** in the lobby: a sandalwood-panelled wall with framed guest portraits. Guests not yet revealed are **covered with a velvet cloth**, waiting to be unveiled (ಅನಾವರಣ), the way portraits and plaques are unveiled at Indian functions.

**Why an unveiling instead of sealed cards:** pulling a cloth off a portrait is a ceremony everyone here has seen at school and college functions. It turns "a hidden card" into an event.

**Hold:** about 1 screen. The camera pans slowly along the wall as you scroll.

### The wall
Sandalwood panels #C8955F with a carved vine border along the top and bottom, grooves in heartwood #6B3F22, and faint wood grain on every panel.

### The frames
- Carved heartwood frames with an **arched top** that echoes the stage arch from the hero.
- The Chief Guest frame is bigger and sits in the centre; the others are the same size, evenly spaced.
- Below each frame: a **brass nameplate** with engraved text (letters slightly darker, with a thin highlight on their lower edge).

### A covered frame (not yet revealed)
- **Veil:** deep kumkuma red velvet #C8102E with darker folds #8E0B20 **(new)**, draped over the frame.
- **Cord:** a gold thread tied around it, the knot sealed with a **wax seal** stamped with the Kannada Vedike emblem.
- **Tag** hanging from the cord: "ಅನಾವರಣ: ಅಕ್ಟೋಬರ್ 20" with "Unveiling on 20 Oct" under it.
- **Nameplate:** blank brass.
- **The next guest due** has a live countdown on its tag ("2 ದಿನ · 2 days"), and its cord trembles very slightly every few seconds. **Why:** it gives the eye one place to go on a wall of red cloths.

### A revealed frame
- **Photo:** a real photo of the guest, used only with their written permission.
- **Treatment:** at rest, every photo uses the same warm, sepia-leaning two-tone look; on hover or tap it turns to full colour. **Why:** guest photos will arrive in every kind of quality and lighting. One shared look hides the differences and makes the wall feel like one set.
- **Nameplate:** name engraved (Kannada, English under it).
- **Role band** under the nameplate: "ಮುಖ್ಯ ಅತಿಥಿ · Chief Guest", "ಭಾಷಣಕಾರರು · Speaker", "ಹಿನ್ನೆಲೆ ಗಾಯಕರು · Playback Singer" (proofread).
- **The removed velvet** lies folded at the base of the frame.

### Light
- A small brass **picture lamp** above each frame, like the lamps over paintings in museums.
- **Revealed frames:** lamp ON, a warm pool of light on the portrait. **Covered frames:** lamp OFF, lit only by soft lobby light.
- **Why:** lit and unlit frames show at a glance who's been revealed, with no text needed.
- **Colour grade:** warm and clean. The lobby is brighter than the evening street of Scene 6.

### The unveiling moment
The first time a visitor sees a newly revealed guest (remembered in their browser):
1. The frame is still covered when they arrive.
2. The wax seal cracks (snap sound).
3. The cord falls away.
4. The velvet slides down and gathers at the base (3–4 drawn cloth positions are enough).
5. The picture lamp switches on with a small click.
6. A small puff of arishina and kumkuma powder, and a short burst of applause.

About 2 seconds in total. On later visits that guest simply shows as revealed. **Why only once:** a 2-second animation that repeats on every visit gets annoying.

### Tapping
- **Revealed frame:** it comes forward a little, and a small paper card appears tucked into the corner of the frame with one line about the guest and their session ("ಬೆಳಿಗ್ಗೆ 11:00 · 11:00 AM, Main Hall"), plus a link to their event.
- **Covered frame:** the veil gives a small shake ("not yet!") and the tag flips to show a **teaser hint**, if the PR team has written one (for example: "A voice you've heard in 200 songs"). **Why:** a covered frame that does nothing when tapped feels broken, and teasers give the PR team something to post each week.

### Security (from the spec)
The server sends a guest's name and photo **only after their reveal date**. Before that, only the date and the teaser hint are sent. **Why:** if names sit anywhere in the page's code, your CTF players will find them early.

### Motion (idle)
The velvet sways very slightly, the next guest's cord trembles, and dust drifts in the picture-lamp light.

### Sound
Seal crack, lamp click, a soft cloth sound as the veil falls, and applause (recorded at a club meeting).

### Transition out
This scene hands over to the interval move (see Scene 8).

### Phone layout
- Chief Guest frame full width at the top, then the others two per row.
- Normal scrolling instead of the camera pan.
- The info card opens below the frame instead of tucked into its corner (no room on small screens).

### Reduced motion
The veil simply fades out; no powder and no trembling cord. The lamp turns on without a flicker.

### Assets
- Wall panel texture with carved border; one frame design (scaled for the Chief Guest).
- Picture lamp (on and off).
- Velvet veil in 3–4 positions, folded velvet, wax seal (whole and cracked), cord, tag.
- Brass nameplate texture.
- Guest photos with written permission.
- Sounds: seal crack, click, cloth, applause.

---

## Scene 8 — ವಿರಾಮ · Interval (the canteen)

### Job
Sell Bhoori Bhojana coupons and merch. This is the money scene, so everything here must be clear and quick, even while it stays in the theme.

### The move out (transition in)
This is the biggest camera move after the hero.
1. The screen shows a vintage **ವಿರಾಮ card**: a painted card with an ornate border, "ವಿರಾಮ" big in the centre, "INTERVAL" under it. The film look is heavier here, with more scratches and one small jump, like a worn reel.
2. The long electric **interval bell** rings.
3. **House lights come up:** the wall lamps glow on and the screen dims.
4. **The camera pulls back out of the screen**, the hero push in reverse. The seats come back into view, and a few audience heads disappear one by one as the drawn crowd "gets up".
5. The camera turns toward the back of the hall and goes through swing doors marked "ಕ್ಯಾಂಟೀನ್ · Canteen".

Driven by scroll across about 1.5 screens; a fast flick skips it.
**Why such a big move:** this is the only time the page leaves the screen, so the move must be clear enough that the visitor feels "I've stepped out". It is also the one place we want them to slow down, because it's where they buy.

### The "Book" shortcut
The sticky **Book** button in the top bar jumps straight here, with the interval move already done. **Why:** someone who just wants a coupon shouldn't have to sit through a 3-second animation.

### The canteen (the place)
- An old theatre canteen in the lobby: a long wooden counter, a painted menu board on the wall behind it, a steel tea kettle with steam, and a ceiling fan above.
- **Light:**
  - One **tube light** over the counter, cool white #EAF2E8 **(new)**. When the visitor arrives, it starts the way old tube lights do: two or three quick flickers, then on, with a soft "tink".
  - One **warm bulb** over the cash drawer.
  - **Why a tube light:** the whole theatre is warm and dark, so a cooler, brighter light tells the visitor at once that this is a different place. Keep the tube light gentle so the cream paper and the food still look warm.
- **Ceiling fan:** its slow shadow sweeps across the counter.

Two stations sit side by side: food on the left, merch on the right.

### Left: the Bhoori Bhojana counter

**Heading** painted on the menu board: "ಭೂರಿ ಭೋಜನ" big, with "ಬಾಳೆ ಎಲೆ ಊಟ · A full meal on a banana leaf" under it.

**The banana leaf (the main object):**
- A full banana leaf lying on the counter, seen almost from above.
- Leaf #3E7B2E **(new)**, lighter veins #7FAE5A **(new)**, one edge slightly torn.
- 5–6 small shiny water drops on the leaf. **Why:** leaves are sprinkled with water before serving, and anyone who has eaten a banana-leaf meal will recognise it.

**Serving the menu:**
- When the leaf comes into view, menu items are placed on it **one at a time**, in the traditional serving order, each with a soft sound.
- Each item is a small illustration. Hover or tap shows its name in Kannada and English in the meanings strip at the bottom. **Why:** it teaches food names to visitors from outside Karnataka, using a strip they already know.
- **The exact items and order depend on your real menu.** Ask the caterer and a club member who knows the serving custom. Don't guess; people will notice a wrong order.
- Plays once per visit.

**Price:** chalk-written on a small slate standing on the counter. Real text, normal digits, large.

**Slots as show timings:**
- A painted **show-timings board** with brass hooks, from which wooden tiles hang: "ಮಧ್ಯಾಹ್ನ 12:00", "12:45", "1:30".
- Under each tile: a row of 10 tiny seat icons that fill red as the slot sells (each icon is one-tenth of capacity). **Why seats instead of a progress bar:** it keeps the cinema idea, and "two seats left" reads instantly.
- **Few left** (under about 15%): a hand-written chit clipped to the tile, "ಕೆಲವೇ ಸೀಟು · Few left".
- **Sold out:** a red rubber stamp "ಹೌಸ್‌ಫುಲ್ · HOUSEFULL" slams onto the tile, same stamp style and thump as Scene 3. The tile turns grey and can't be picked.
- **Choosing a slot:** tapping a tile flips it to its yellow side (#F2C12E). Only one slot can be chosen.

**Book button:**
- Shaped like a paper coupon with a perforated edge, arishina yellow, "ಬುಕ್ ಮಾಡಿ · Book".
- The strongest colour in the whole scene. **Why:** the button that brings in money must be the most obvious thing here. The theme never hides it.

### Right: Parva Angadi (merch)

**The object: a glass showcase cabinet** on the canteen's side wall, the kind that usually holds snacks, now used as the Parva shop.
- Wooden frame, glass doors with soft reflections that slide a little as the mouse moves.
- Inside, on shelves: a folded tee with a paper band, a tote on a hook, a jar of stickers, bookmarks in a holder.
- **Why a showcase instead of framed posters (a change from the content spec):** framed posters would repeat Scene 6. In a showcase, a tee looks like a tee, which matters when people are buying clothes.

**On each item:**
- A paper **price tag** on a string, price hand-written (real text, normal digits).
- While the early price runs: a small red paper flag, "ಮೊದಲ ದಿನ ಮೊದಲ ಆಟ · First Day First Show price", with a counter: "32/50 sold".

**Tapping an item:** the glass door swings open with a small creak, and the item comes forward into a **product card** made as a large paper price card:
- A **real photo** of the product. **Why not an illustration:** people buying clothes need to see the real colour and print.
- **Sizes** as small wooden tokens: S, M, L, XL, XXL. Sold-out sizes get a tiny HOUSEFULL stamp and can't be picked.
- A folded paper "size chart" that opens when tapped.
- The same yellow coupon-shaped button: "ಕೊಳ್ಳಿ · Buy".

**Combo:** a small painted banner on top of the showcase: "ಫುಲ್ ಶೋ ಕಾಂಬೋ · Full Show Combo: Tee + Bhoori Bhojana, ₹___".

**Pre-order deadline:** a small board inside the showcase: "Orders close on ___". After the deadline, every item shows "ಬುಕಿಂಗ್ ಮುಗಿದಿದೆ · Booking closed" and can't be bought.

### Payment steps
- After Book or Buy, the payment step is a plain, clean page with only a ticket-style header. **Why:** people trust a clear payment screen, and the gateway's own page looks standard anyway. A heavily themed checkout feels less safe.
- The "confirming payment" state (for slow UPI payments, from the spec) shows a small spinning film reel with plain text: "Confirming your payment. Please don't pay again."

### Motion (idle)
Kettle steam, fan shadow, glass reflections, and a rare tiny tube-light flicker (about every 20 seconds).

### Sound
Very quiet canteen sound (low chatter, cups clinking), the tube-light "tink", a soft sound as each food item lands, the stamp thump, and the glass door creak.

### Transition out
Continues straight into Scene 9 (see there).

### Phone layout
- Top to bottom: menu board heading → leaf (full width) → slot tiles (3 in a row, big enough to tap) → Book button → showcase items in a 2-column grid of shelf boxes.
- The Book button sticks to the bottom of the screen while the food station is in view.
- Shorter move out: the ವಿರಾಮ card, the bell, then a quick "through the doors" wipe. No pull-back over seats (the brief already drops seats on phones after the hero).

### Reduced motion
Food items are already on the leaf. Stamps appear without the slam. No fan shadow and no tube-light flicker.

### Assets
- ವಿರಾಮ card, interval bell, swing doors.
- Canteen counter, wall, painted menu board, kettle, ceiling fan, tube light, bulb.
- Banana leaf (high quality, with water drops).
- One illustration per menu item (depends on the final menu).
- Slate, show-timings board and tiles, seat icons, "Few left" chit, HOUSEFULL stamp.
- Showcase cabinet with glass and shelves.
- Real product photos, price tags, early-price flags, size tokens, combo banner.
- Sounds: canteen ambience, tube light, food landing, stamp, door creak.

---

## Scene 9 — ಬಿಡುಗಡೆ ದಿನ · Release Day cutout

### Job
Pure fun with a shared goal. People tap, watch the number grow together, and come back to push it higher.

### Where we are
Still in the interval. From the canteen, the camera goes out through the theatre's **folding iron gate** (the collapsible grille old theatres have) onto the street in front of the theatre, at night. The giant cutout stands against the theatre's front wall.

- The gate slides aside with a metal rattle as the camera passes.
- **Hold:** about 1 screen. Tapping doesn't need scrolling, so the visitor can stay as long as they like.

### The cutout (the object)
- A giant painted **"Parva Hero"** in the style of hand-painted plywood cutouts: bold outlines, flat bright colours, a heroic pose with one hand raised in greeting.
- The hero wears a **Mysuru peta** (the traditional Mysuru turban) and a sandalwood-coloured shawl. **Why the peta:** it says "Karnataka" instantly and belongs to no single star, so no fan group can take offence.
- Seen at a slight angle, so the **thickness of the plywood edge** shows. **Why:** that edge is what tells the eye "this is a cutout", not a painting.
- **Base board**, painted: "ಪರ್ವ · ಬಿಡುಗಡೆ ದಿನ" and "ಅಭಿಮಾನಿಗಳ ಹಾರ್ದಿಕ ಸ್ವಾಗತ" (proofread).
- **Bamboo scaffolding** behind it, poles tied with coir rope.
- **Garland:** a big marigold garland on the hero's shoulders. It starts short and grows (see Milestones).

### The fan banner (the counter)
- Beside the cutout: a fan-club style banner stretched between two bamboo poles.
- It shows the shared count: "ಹೂಮಳೆ · ೪,೨೧೩" with "4,213 flowers so far" in the subtitle line.
- Under it, smaller: "ನಿಮ್ಮ ಹೂವು · Your flowers: 37". **Why a personal count:** a big shared number feels far away; your own number is what makes you feel you helped.
- **Why a fan banner:** on real release days, that's exactly where fans put their club names and numbers.

### Light
- **Night sky:** deep blue-purple #2B2140 **(new)**.
- **Focus lamp** at the base, pointing up at the hero's face, the way real cutouts are lit at night. Strong up-light, long shadows.
- **Serial lights:** strings of small yellow and red bulbs draped over the scaffolding.
- **The lights grow with the count:** at the start, only one string is on. Each milestone switches on another string or another focus lamp. **Why:** the scene visibly celebrates more as the crowd grows, so people can see the shared progress, not just read it.

### Interaction: throwing flowers
- **Tap anywhere on the cutout**, or on a clear button on the banner: "ಹೂ ಎಸೆಯಿರಿ · Throw flowers". **Why a button too:** not everyone guesses they should tap a picture.
- **Each tap:**
  - A handful of petals flies up from the bottom of the screen (as if from the visitor's own hand), arcs through the air and hits the cutout: marigold (orange and yellow), rose (red) and jasmine (white).
  - A puff of arishina yellow and kumkuma red powder bursts and drifts slowly down.
  - Some petals land and stay on the base board and scaffolding, piling up during the visit.
  - A whistle or cheer plays (random from 3–4 recordings).
- **Holding down** throws a steady stream.
- **Petal limit on screen:** about 150 on desktop, 80 on phones; older petals fade out as new ones land. **Why:** hundreds of moving petals will slow down cheap phones.
- **Counting (from the spec):** the number goes up on screen at once; taps are sent to the server in batches every few seconds, with a cap per visitor per minute. If the server is down, the animation still works.

### Milestones
- **Every 1,000 flowers:** a new section of garland is added (it visibly grows longer), a short drum roll plays, and a small painted flag pops up on the banner: "೧,೦೦೦!".
- **At 10,000:** fireworks burst over the theatre, and a painted banner unrolls across the top: "೧೦,೦೦೦ ಹೂವು! ಧನ್ಯವಾದ ಅಭಿಮಾನಿಗಳೇ" (proofread), with "10,000 flowers! Thank you, fans" under it.
- A visitor arriving after a milestone sees the longer garland and the extra lights already in place.

### Motion (idle)
Serial lights twinkle, the garland sways a little in the wind, and now and then a loose petal rolls across the ground.

### Sound
Whistles, cheers, petal whoosh, drum roll at milestones, fireworks at 10,000. Record the whistles and cheers at a club meeting: free, fun, and no copyright issues.

### Transition out: the second half begins
1. A second bell rings, and a painted sign lights up: "ದ್ವಿತೀಯಾರ್ಧ ಆರಂಭ · The second half is starting" (proofread).
2. The camera turns back through the gate, into the hall, and **pushes into the screen again** (a faster replay of the hero push, about 1 second).
3. The reel progress in the corner moves to "Second Half".

### Phone layout
- The cutout fills the screen height.
- The "Throw flowers" button is fixed at the bottom of the scene, within thumb reach.
- Lower petal limit and a simpler powder puff.
- The move back into the hall is a quick wipe instead of the camera turn.

### Reduced motion
Petals don't fly; a few petals fade in at the base with each tap, and the counter still goes up. No fireworks; the milestone banner simply appears.

### Assets
- Parva Hero cutout illustration. **The biggest art job on the page and the image people will screenshot most. Assign it first.**
- Base board, scaffolding, coir rope; garland in 10+ sections; fan banner.
- Serial light strings, focus lamps; night sky, theatre front wall, iron gate.
- Petal images (3 flower types, 2–3 shapes each), powder puff, fireworks.
- Sounds: recorded whistles and cheers (3–4 each), whoosh, drum roll, fireworks, gate rattle, second bell.

---

## Scene 10 — ಬೆಳ್ಳಿ ಪರದೆಯ ಪಯಣ · Sandalwood through the years

### Job
A quick, loving tour of Kannada cinema, from the first talkie to today, ending with "you are here".

### Where we are
Back inside the screen, at the start of the Second Half. The shot is the projection booth's **rewind bench**: a long strip of film stretched between two metal reels, over a glowing light box.

**Why a rewind bench:** it is the one real object where people pull film by hand, frame by frame, which is exactly what scrolling through a timeline is.

**Hold:** about 1.5 screens (13 frames).

### Layout
- **Top part of the screen (about 60%): the projected view.** It shows the current frame large, as if playing on a screen.
- **Bottom part (about 40%): the bench.** The two reels at the left and right edges, with the film strip between them over the light box.

### The bench (the object)
- **Reels:** metal spools with round holes cut in them, dark grey with worn edges.
- **Light box:** a glowing panel under the strip in projector light #FFF4DC. It is the scene's main light: it lights the frames from behind and gives the reels a thin rim of light from below.
- **Loupe:** a small magnifying glass resting on the light box at the centre. The frame under it is the "current" frame. **Why a loupe:** film editors used one to look at single frames, so it marks "this one" without an arrow or a highlight box.

### The film strip
- Celluloid, with sprocket holes glowing from the light box beneath.
- **13 frames**, 3–4 visible at a time on desktop.
- **A splice at each new era:** a strip of clear tape with tiny air bubbles joins the film where the style changes. **Why:** the splice marks "a new era" without an extra label.
- **The year** is printed along the film's edge in Kannada numerals, like the codes on real film. The subtitle line shows it in normal digits.

### Each frame: a title card in its era's style
Each frame is a **title card**, not a still from the film. The style changes by era:
- **1930s–1950s:** black and white, heavy grain, ornate border, serif Kannada lettering, dark corners.
- **1960s–1970s:** early colour with a faded cyan-and-magenta tint, bold painted lettering.
- **1980s–1990s:** strong colours, chunky outlined letters with drop shadows, like painted posters.
- **2000s:** cleaner and glossier, with gradient-filled letters.
- **2010s–2020s:** modern, simple, high contrast, almost no grain.
- **2026 · ಪರ್ವ:** the ಪರ್ವ logo lettering with "ನೀವು ಇಲ್ಲಿದ್ದೀರಿ · You are here". If the visitor made a fan pass, their Kannada name appears under it.

**Don't copy any real film's title design.** Make a card in the style of the era with our own lettering. **Why:** copying a real title design is still copying someone's artwork, and making our own is quicker anyway.

The list of 13 films and years is in the content spec. **Verify every year before publishing.**

### Interaction
- **Scrolling** moves the strip sideways across the bench. **Dragging** the strip also works on desktop.
- **Arrow buttons:** two small brass buttons (◀ ▶) under the bench step one frame at a time. **Why:** drag-only controls lock out people using a keyboard, and some people simply prefer buttons.
- **The reels turn as the strip moves**, in the right direction and at a matching speed. **Why:** if the reels don't match the strip, the whole bench looks fake.
- **Snap:** when scrolling stops, the strip settles so one frame sits exactly under the loupe (about 0.3 s). **Why:** half a frame under the loupe looks broken, and the projected view needs one clear frame.
- **Projected view:** when a frame sits under the loupe (or is tapped), the top part shows it large, with a quick flicker as it changes, like a jump cut. The 2–3 line story appears as **burned-in subtitles**, the same style as Scene 4.
- **Easter egg (desktop):** a small hand crank on the right reel can be grabbed and turned.

### End of the scene
When the 2026 frame reaches the loupe, the projected view shows the Parva card. If the visitor hasn't made a fan pass, a small line appears under it: "ಮುಂದಿನ ಫ್ರೇಮ್ ನಿಮ್ಮದು · The next frame is yours: make your fan pass", linking back to Scene 5. **Why:** it turns a history lesson into an action.

### Motion (idle)
Dust drifting in the light-box glow, a very slight hum-flicker in the light box, and a faint vibration in the strip while it moves.

### Sound
A soft click each time a frame passes under the loupe; a reel whirr when the strip moves fast.

### Transition out
Default cue-mark cut to Scene 11.

### Phone layout
- Projected view on top (about 55%), bench below showing about 1.5 frames.
- Scrolling moves the strip; the ◀ ▶ buttons are large and sit right under the bench.
- No crank.

### Reduced motion
No scrubbing. The ◀ ▶ buttons step frame by frame, and the projected view changes with a simple fade.

### Assets
- 2 reels, light box, loupe, brass arrow buttons, crank.
- Film strip texture with sprocket holes, splice tape.
- 13 title cards. These can be built from fonts plus textures, which is lighter and quicker than full illustrations.
- Grain overlays per era.
- Sounds: frame click, reel whirr.
- Copy: 13 short stories, verified.

---

## Scene 11 — ಯಾವ ಸಿನಿಮಾ? · Which film? (emoji game)

### Job
A daily game that brings people back and gets shared.

### Where we are
Inside the screen. The shot is the **projection booth**, the small room at the back where the projectionist works.

**The story:** "ಆಪರೇಟರ್ ಇಂದಿನ ರೀಲ್‌ಗಳನ್ನು ಗೊಂದಲ ಮಾಡಿಕೊಂಡಿದ್ದಾರೆ! · The operator has mixed up today's reels! Help label them." (proofread). In Kannada theatres the projectionist is often just called "operator", which gives it a local touch.

**Why the booth (a change from the short version, which used a letter board):** changeable-letter marquee boards are more of an American thing; Kannada theatres had painted boards. The booth is a real part of our theatre that no other scene uses, and labelling mixed-up reels gives the game a small story.

**Hold:** the scene stays in place while the visitor plays. Scrolling past is always possible.

### The booth (the place)
- The big projector on the left, seen from the side, with its lamp house.
- A small square **port window** looking out into the hall; the distant screen glows through it.
- A wooden workbench in front, with a single bare bulb hanging above it.
- A shelf on the wall for finished reels.
- A duty chart pinned to the wall (the leaderboard, below).
- **Light:** the bare bulb (warm), warm streaks of light leaking from the projector's lamp-house vents, and the glow from the port window.

### A puzzle, step by step
1. **A film can** (a round metal tin) slides to the centre of the bench. Its lid carries **3 emoji stickers**: the clue. Emoji are images from one open emoji set (Twemoji or Noto Emoji, credited). **Why:** emoji look different on iPhone and Android, and a clue can become unreadable on one of them.
2. **The answer field** is a strip of masking tape across the can's label. Placeholder in faint pencil: "ಚಿತ್ರದ ಹೆಸರು ಬರೆಯಿರಿ · Write the film's name". Typed text appears in a marker-pen style.
   - Answers are accepted in **English or Kannada script**. **Why:** people who type in Kannada shouldn't be forced to switch to English.
   - Spelling variants and small typos are accepted, checked on the server (from the spec).
3. **Tries:** 3 small boxes at the end of the tape. Each wrong try punches a hole in one, like a ticket punch. **Why:** it shows tries left without a number.
4. **Hint:** a small paper tag tied to the can, "ಸುಳಿವು · Hint". Pulling it reveals the year stamped on the can's edge (a second pull reveals the first letter). A small pencil note shows the points lost: "−2".
5. **Right answer:** the marker text darkens, a yellow tick stamp lands on the label, the can rolls onto the shelf with a clunk, and the projector clicks on for a moment, flickering a tiny title through the port window. A small cheer plays.
6. **Three wrong answers:** the correct answer is written on the tape in red pencil ("ಉತ್ತರ: ಮುಂಗಾರು ಮಳೆ · Answer: Mungaru Male"), and the can goes on the shelf with a red tape cross. **Why show the answer:** people want to know, and learning the film is part of the fun.
7. **Timer:** the projector's **footage counter** (the rolling number counter on the machine) runs while a can is on the bench. **Why:** speed counts in the score, so there must be a visible clock, and the footage counter is the booth's own clock.

5 cans a day (from the spec).

### After the day's 5 cans
- A **log sheet** slides out: "ಇಂದಿನ ಲಾಗ್ · Today's log: 4/5, 312 points".
- **Share button:** builds the share text ("ಯಾವ ಸಿನಿಮಾ? 🎞️🎞️🎞️🎞️⬛ 4/5"), opens the phone's share sheet, and copies the text on desktop.
- **Coming back the same day:** the shelf shows today's labelled cans, the log sheet, and a pinned note: "ಹೊಸ ರೀಲ್‌ಗಳು 5 ಗಂಟೆಯಲ್ಲಿ · New reels in 5h 12m". No replays. **Why:** replays would make the leaderboard unfair and remove the reason to come back tomorrow.

### The leaderboard: the duty chart
- A paper chart pinned to the booth wall: "ಆಪರೇಟರ್ ಡ್ಯೂಟಿ ಚಾರ್ಟ್ · Today's top 10".
- Names and scores look hand-written (real text in a handwriting-style font).
- The visitor's own row, if they're on it, has a yellow highlighter streak.
- The display name comes from their fan pass, or a small pencil prompt asks for one. The bad-word filter from the spec applies.
- Resets at midnight.

### Motion (idle)
The bare bulb sways very slightly, dust drifts in the vent light, and the port-window glow flickers faintly.

### Sound
Low projector hum, can sliding, tape punch for wrong tries, clunk on the shelf, a small cheer for right answers.

### Transition out
The climax beat into Scene 12 (see there).

### Phone layout
- The can and tape field sit in the **top half** of the screen. **Why:** the phone keyboard covers the bottom half; if the field sits low, people type without seeing it.
- The projector and port window are cropped out; the shelf becomes a row of small cans at the top.
- The duty chart opens as a full-width sheet when tapped.

### Reduced motion
Cans appear and disappear with fades; no rolling and no projector flicker.

### Accessibility
Each emoji image has plain alt text describing the picture ("rain cloud, rabbit, broken heart"). This describes the clue without giving the answer away.

### Assets
- Booth background, projector (side view), port window, bench, bare bulb, shelf.
- Film can (one design), masking tape strip, hint tag, punch holes, tick stamp, red tape cross.
- Emoji image set (with credit), footage counter digits.
- Log sheet, duty chart paper, pinned note.
- Sounds: hum, slide, punch, clunk, cheer.
- Content: 40+ puzzles with answers, spelling variants and hints (from the spec).

---

## Scene 12 — Credits and ಶುಭಂ

### Job
Thank the team warmly, show the gallery and the footer information (links and policies), and end the show with a feeling.

### Transition in: the climax beat
- The reel progress moves to "Climax".
- After Scene 11, the flicker speeds up a little and the projector whirr rises for a moment. Then the screen goes **black for half a second, in silence**.
- **Why the black pause:** every film has that silent beat before the credits. It tells the visitor "this is the end", so they don't expect more content below.

### The credits
- **Screen:** black, with grain and flicker. Text in gandha cream #F1DFC0.
- **Text style:** each letter has a faint soft glow around it, like light spreading on a real screen. **Why:** that glow is what makes text look projected rather than typed.
- **Layout (desktop), split screen:**
  - **Right side:** the classic credit roll. Role on the left (Kannada larger, English smaller under it), names on the right (Kannada spelling confirmed by each person, English under it).
  - **Left side:** a small inset frame plays **"making of" photos**: the Parva team at work and photos from past Parvas. Each photo starts in sepia and turns to colour, then the next one comes in.
  - **Why the inset:** many Indian films show behind-the-scenes photos beside the end credits, so it fits the theme. It is also where the **gallery** lives on the landing page. A small "ಗ್ಯಾಲರಿ · Full gallery →" link under the inset opens the full gallery page.
- **Roles (from the spec):**
  - ನಿರ್ದೇಶನ · Directed by (convener)
  - ನಿರ್ಮಾಣ · Produced by (finance)
  - ಸಂಗೀತ · Music (cultural)
  - ಕಲಾ ನಿರ್ದೇಶನ · Art direction (design)
  - ವಿಶೇಷ ಪರಿಣಾಮಗಳು · Special effects (web and tech)
  - ಪ್ರಚಾರ · Publicity (PR)
  - ಸ್ವಯಂಸೇವಕರು · Crew (volunteers)
- **Special thanks** (if you have sponsors): "ವಿಶೇಷ ಕೃತಜ್ಞತೆ · Special thanks", with sponsor logos in single-colour cream. **Why:** full-colour logos break the film look. Ask sponsors first whether a single-colour version is okay.
- **Asset credits:** a short section for sounds, fonts and the emoji set, with their licences. **Why:** some licences require credit, and it's good practice anyway.

### How the roll moves
- Scrolling moves the credits up.
- If the visitor stops scrolling for about 3 seconds, the credits keep drifting up slowly on their own and stop at the end.
- **Why both:** real credits roll by themselves, but fast scrollers shouldn't have to wait.

### The thank-you card
After the roles, the roll pauses on its own card: "ಅಭಿಮಾನಿ ದೇವರುಗಳಿಗೆ ಧನ್ಯವಾದ", with "Thank you to our fans, who are our gods" under it (a nod to Dr. Rajkumar calling his fans gods).

### The footer, inside the credits
- At the very end of the roll, in the same credit style but smaller:
  - "ಸಂಪರ್ಕ · Contact" and the social links, as small cream icons.
  - Policy links: Terms, Privacy, Refunds, Contact.
- **Why here:** real films put their legal lines at the very end of the credits. The payment gateway needs these links on the site, and this way they fit the theme instead of sitting in a plain website footer.

### ಶುಭಂ
1. After the last line, the screen fades fully to black.
2. **ಶುಭಂ** fades in, large, in the centre: hand-lettered, with an ornate flourish, cream on black with a warm glow, like the end cards of old Kannada films.
3. Under it: "ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ".
4. **House lights come up.** The camera pulls back out of the screen one last time, showing the whole theatre: the drawn audience standing up to leave, and the **diya from Scene 0 still burning** at the edge of the stage. **Why the diya:** the show began with the visitor lighting it. Seeing it still burning at the end ties the beginning to the end.
5. The curtain slowly closes over the screen.

### After the curtain closes
Two painted buttons on the stage front:
- "ಮತ್ತೊಮ್ಮೆ ನೋಡಿ · Watch again": scrolls back to the top. The curtain opens again, skipping the lamp (it's already lit).
- The yellow **Book** button, one last time.

**Why:** people who reach the end are the most interested visitors, so give them one last clear thing to do.

### Sound
The club's recorded music swells as the credits start, applause as the curtain closes, then everything fades to quiet.

### Phone layout
- One column: the gallery inset sits above the credits, and credits are stacked (role above names).
- A simpler ending: the curtain closes straight over the screen, without showing the seats.

### Reduced motion
Credits shown as a still list in sections (no roll). ಶುಭಂ appears with a short fade. The curtain is shown already closed.

### Assets
- Credits text, with every name's Kannada spelling confirmed by that person.
- Team and past-Parva photos, with consent from the people in them.
- Hand-lettered ಶುಭಂ.
- Sponsor logos (single colour), if any.
- Final theatre view (reuses the hero layers), curtain closing.
- Sounds: end music (club recording), applause.

---

## Part B — Lists across all these scenes

### New colours added in this file

| Name | Use | Colour |
|---|---|---|
| Film base | Film strips (Scenes 4, 10) | #2A1A0E |
| Fresh shavings | Wood curls (Scene 4) | #E0B988 |
| Bulb glow | Marquee bulbs (Scene 6) | #FFE9A8 |
| Street lamp | Cool side light (Scene 6) | #9FB3C8 |
| Velvet shadow | Veil folds (Scene 7) | #8E0B20 |
| Tube light | Canteen light (Scene 8) | #EAF2E8 |
| Banana leaf | Leaf (Scene 8) | #3E7B2E |
| Leaf vein | Leaf veins (Scene 8) | #7FAE5A |
| Night sky | Cutout street (Scene 9) | #2B2140 |

### Art jobs, biggest first (assign early)
1. Parva Hero cutout (Scene 9).
2. 4–6 event posters (Scene 6).
3. Canteen, banana leaf and food items (Scene 8).
4. Forest, workshop and tiny-theatre frames (Scene 4).
5. Projection booth (Scene 11).
6. Wall of honour, frames and veil (Scene 7).
7. Rewind bench (Scene 10).
8. Hand-lettered ಶುಭಂ (Scene 12).

### Kannada lines to proofread
Every Kannada line in this file, especially: Scene 4 captions; Scene 6 genre words; Scene 7 role names and tag text; Scene 8 labels; Scene 9 base board, milestone banner and second-half sign; Scene 10 "you are here" and fan-pass line; Scene 11 story line, hints and notes; Scene 12 thank-you card.

### Facts to verify
- Scene 4: the 1916 soap factory line.
- Scene 10: all 13 years.
- Scene 8: the traditional serving order for your actual menu.

### Changes from the short version (need your approval)
- **Scene 7:** sealed cards became covered portraits that get unveiled.
- **Scene 8:** the canteen gets a tube light, and merch moves from framed posters into a glass showcase.
- **Scene 9:** set at night, with lights that grow with the count (instead of dusk turning to night).
- **Scene 10:** the draggable reel became a rewind bench with a projected view above it.
- **Scene 11:** the marquee letter board became the projection booth.
- **Scene 12:** now also holds the gallery (the making-of inset) and the policy links.

*Once approved, merge this into `parva26-brief.md` so every scene from 0 to 12 has full coverage.*