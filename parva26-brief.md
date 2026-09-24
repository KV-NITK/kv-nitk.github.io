# Parva 2026 design brief: a place, not a page

Companion to `parve26spec.md`. The spec says *what* is on the page; this brief says *how it should look and feel*. It covers the always-on objects and Scenes 0–3. **Scenes 4 and 6–12 are in `allscenes.md`**, and the current build status, decisions and performance rules are in section 0 of `parve26spec.md`.

## As built (24 Sep 2026): where the build differs from this brief
- **Objects on every screen:** all built. The speaker grille does not pulse and the subtitles switch does not click yet, because sound is not built. The logo is not lit by the scene's light (it has fixed shading).
- **Subtitle strip:** besides English for whatever is hovered, it also carries scene lines (`sayLine()`), and while the hall is on screen it sits on the foot of the silver screen, like a film's subtitles (`anchorStrip()`), so it never covers the tickets.
- **Scenes 0 and 1 (lamp, curtain, countdown):** paused. The lamp, smoke letters, countdown leader and curtain are built as separate pieces but not wired into the page yet. The hall itself (Scene 1's set) is built and shown straight away.
- **Scene 1 set:** as described, with these changes. The exit sign is low on the left wall, because the show board takes the right pillar. There is one wall lamp on each side. The ceiling fans are drawn in the same canvas as the beam. Audience: seven figures plus a child, in rows 5–7.
- **Scene 2:** the show board uses normal digits for the countdown and the date (rule A5). The golden fan-pass ticket sits in the middle of the three, because it is the main promotion. The camera push scales the hall until the screen fills the page width, and everything else fades to dark. The lamp does not stand at the stage edge yet (it arrives with Scene 0).
- **Scene 3:** the constant sepia tint and shake were left out for performance (a scene-sized filter repainted every frame). The flicker, dust and grain stay. The certificate's Length reads "Three full days".


Look again at the 100 pages in `100sites.md`. None of them is "a heading and three cards." Each one is a **place or an object**: a typewriter on a desk, a turntable on felt, a museum plate. Their buttons belong to the object. Parva should work the same way. Here are the rules first, then the first four scenes in detail.

## The six rules that stop it feeling like a website

1. **One place, not a page.** Everything happens inside one theatre. Scrolling moves a *camera* through it (pushing toward the screen, turning to a wall), not a document upward. A document gets read; a place gets explored.
2. **No plain cards.** Every box is a real theatre object: a ticket, a painted board, a brass plate, a frame of film. A white rounded rectangle instantly says "template."
3. **All light comes from something in the scene.** That means the diya, the projector beam, the screen glow, the bulbs and the wall lamps. Everything is lit by them and casts shadows, so when the screen turns gold, the audience's faces turn gold too. Lighting is what makes a flat drawing feel like a room.
4. **Nothing is ever fully still.** Smoke drifts, dust floats in the beam, bulbs chase, ceiling fans turn and the film flickers. Keep all of it slow and small: small, constant motion feels alive, while big, constant motion feels annoying.
5. **Every surface has a material.** Wood grain, velvet, brass, paper fibre, the dotted silver screen. Nothing is a flat colour fill.
6. **Type is made, not typed.** Every word is painted, projected, stamped, engraved, spelled out in bulbs or formed from smoke. In an old theatre nothing was printed in a web font, and the lettering is half the nostalgia.

**Depth:** every scene has 4–6 layers that move at different speeds when the mouse moves (parallax), which fakes depth. On phones, the same effect can come from tilting the phone. iPhones ask permission for this, so keep it optional.

## Objects that stay on screen everywhere

- **Logo:** "ಪರ್ವ" carved into a small round sandalwood disc, top-left. It is lit by whatever light is in the scene, so even the logo belongs to the room.
- **Sound control:** a small round speaker grille (cloth mesh in a brass ring), top-right. When sound is on, the mesh pulses faintly with the music.
- **Subtitles control:** a black toggle switch on a brass plate engraved "ಉಪಶೀರ್ಷಿಕೆ." It flips with a click sound.
- **Book button:** a torn arishina-yellow ticket stub held by a tiny brass clip. It sways very slightly and is always there.
- **Progress reel:** a small metal film reel in the bottom-left corner that spins as fast as you scroll, trailing a strip of film. A paper tag on it changes: ಮೊದಲಾರ್ಧ First Half, ವಿರಾಮ Interval, ದ್ವಿತೀಯಾರ್ಧ Second Half, ಶುಭಂ.
- **Cursor (desktop):** the glowing tip of an agarbatti, leaving a faint trail of sandalwood smoke. It brightens over anything clickable. Switch back to a normal cursor inside text fields so typing stays easy.
- **Subtitle strip:** bottom centre, in classic film-subtitle style (pale yellow text with a thin black outline). All English translations and word meanings appear here.
- **Overlay:** one layer of film grain and a dark edge vignette over everything.

---

## Scene 0: The lamp

**Camera:** you are sitting in the dark, looking at the front of the stage.

**Background**
- **Warm black (#0B0705), not pure black.** A pure black screen looks like a broken page.
- **Hints of the room:** the curtain folds catch the faintest light from a glowing agarbatti. You can *just* make out shapes, enough to sense that a room is there.

**Objects**
- **The lamp:** a tall brass inauguration lamp with five wicks around its top dish, standing on the stage edge a little left of centre.
  - The brass has engraved rings and a soft moving highlight.
  - The oil in the dish shines.
- **The agarbatti stand:** three burning sticks beside the lamp, each sending up a thin line of smoke. Sandalwood is present from the very first frame.
- **The counter:** an engraved brass plate on the lamp's base reads "೨,೧೧೪ ದೀಪಗಳು ಬೆಳಗಿವೆ." The digits sit on rolling drums, like an old odometer.

**Type**
- **"ದೀಪ ಬೆಳಗಿಸಿ" is written in the incense smoke.** The smoke gathers into the letters, holds for about 3 seconds, drifts apart, then forms them again. The letters are pale cream, lit from below by the ember.
- **English line:** "Light the lamp to begin the show" appears in the subtitle strip.

**Idle motion**
- The smoke lines curl.
- The agarbatti ember glows brighter and dimmer in a slow 2–3 second breath.
- A few dust specks drift into the ember's light.
- Nothing else moves. The stillness makes the lighting moment land harder.

**When they tap**

The whole sequence takes about 3 seconds, then Scene 1 starts on its own.
1. A small spark, then the first wick catches. The flame has layers: a blue base, a yellow core, an orange edge and a soft round glow. The temple bell rings once, and the sound starts here.
2. The flame jumps to the other four wicks one by one, about 0.3 seconds apart. Each new flame widens the circle of light:
   - 1 flame: the lamp and the floor around it.
   - 2 flames: the stage edge.
   - 3 flames: the bottom of the curtain.
   - 4 flames: the front seats.
   - 5 flames: the whole front of the theatre.
3. The brass wall lamps switch on in pairs, from the front of the hall to the back, each with a small warm-up flicker.
4. The bulbs around the name board flicker on and start chasing.
5. The brass counter rolls up by one.

Why it works: this is how real events are inaugurated. The light grows in steps, just as a real flame lights a room.

**Light detail**
- The lamp's flames are now the main light, so the lamp stand throws long shadows across the stage floor.
- Because the flames flicker, every shadow gently breathes.

**Phone layout**
- The lamp is centred and bigger, about a third of the screen height.
- The smoke text sits above it.
- **Tapping anywhere lights it.** Hitting a tiny wick exactly with a finger is frustrating.

**Skip:** a small paper tab reading "Skip ›" in the bottom-right corner, in low contrast.

---

## Scene 1: The theatre is revealed, the curtain opens, the countdown runs

**Camera:** you are sitting in about row 8, eye level just above the seat tops. On desktop, the stage and screen take the top 60%, the seats the bottom 25%, and the ceiling and beam a thin strip at the top.

**Layers from back to front**

1. **Curtain**
   - Kumkuma-red velvet. The folds are vertical bands, darker in the dips (#7A0A1C) and brighter on the ridges, with fine noise for the velvet texture.
   - An arishina-gold fringe and tassels run along the bottom.
   - The short drape across the top has a scalloped edge, gold braid and a row of embroidered lotuses.
   - It sways very slightly, as if a fan is blowing on it.
2. **Stage arch (the carved frame around the stage)**
   - Sandalwood (#C8955F), with dark recesses (#6B3F22).
   - Carved with vines, parrots and elephants at the base, and a Gandabherunda crest at the top.
   - It is lit from below by footlights, so the lower edges of the carving glow and the upper edges fall into shadow.
   - The shading shifts a little as the mouse moves, as if someone is walking past with a lamp.
3. **Name board above the arch**
   - A long maroon wooden board, hand-painted in cream and gold: "ಶ್ರೀ ಗಂಧದ ಗುಡಿ ಚಿತ್ರಮಂದಿರ."
   - A border of round bulbs chases around it. **One bulb is dead and flickers now and then.** One small imperfection makes the whole thing feel real, the same trick as the dead neon letter in the Neon Rain page.
4. **Side walls**
   - Dusty cream plaster and carved pillars.
   - Brass wall lamps with fluted glass shades.
   - A green "ನಿರ್ಗಮನ" (exit) sign glowing low on the right.
   - A round wall clock on the left showing the real time.
5. **Ceiling**
   - Two old ceiling fans turning slowly.
   - Their blades cut through the projector beam and throw moving shadows into the smoke. This one detail says "Indian single-screen theatre" instantly.
6. **Projector beam**
   - It comes from above your head, from the booth behind you, and widens toward the screen.
   - It is full of slow-curling sandalwood smoke and sparkling dust.
   - Its brightness and colour follow whatever is on screen.
7. **Seats and audience**
   - Three visible rows of maroon cushioned backs with wooden top rails, and small brass seat-number plates in Kannada numerals.
   - Seven to nine audience silhouettes: a bun with ಮಲ್ಲಿಗೆ (jasmine) flowers in it, a cap, a child on a parent's lap. The screen light glows along their edges.

**Sequence (about 6 seconds)**
- **0.0 s:** the projector starts clattering, and the booth light fades in behind you. The beam appears over the audience's heads.
- **0.5 s:** the beam hits the *closed* curtain, and the countdown starts playing on the curtain itself, bending across the folds. This is exactly what happens in real theatres, and people who have seen it will smile.
- **1.0 s:**
  - The curtain parts from the centre and gathers to both sides over about 2 seconds, starting fast and slowing at the end.
  - The footlights brighten.
  - As the curtain moves away, the projected image straightens out from the folds onto the flat screen.
- **2.5 to 6 s:** the countdown plays on the screen.

**Countdown look**
- **Frame:** a mid-grey frame with a warm sepia tint, two circles and cross-hair lines.
- **Sweep hand:** it goes round once per number, with a lighter wedge trailing behind it.
- **Numbers:** ೫ ೪ ೩ ೨, bold and black.
- **Film damage:** scratches, a hair caught at the edge, and flicker.
- **The beep:** at ೨ there is one short beep and a single white flash, then a moment of black, then the title.

Why it works: everyone recognises a film countdown, and the Kannada numerals make it ours.

**Phone layout**
- The camera sits closer and lower. The screen fills the width, and the arch is cropped to its crest and sides.
- The name board sits above the screen.
- One row of seats with three heads sits at the bottom.
- The fans are out of frame, but their shadows still pass through the beam.

---

## Scene 2: The title card (hero)

**The screen**
- Silver (#D9DCE0) with warm projector light on it and black borders around the edge.
- A very fine dot pattern, like a perforated cinema screen, is visible only near the edges.
- It curves slightly in perspective.

**What's projected: the title film**
- **Background: a painted sandalwood forest in the Western Ghats at golden hour.** It is built from four painted layers:
  - Far blue hills in mist.
  - Middle hills.
  - Sandalwood trees with small leaves and dark trunks.
  - Foreground grass.

  The layers pan slowly sideways at different speeds, with light rays and a few birds crossing. The style is flat colour with soft gradients, like hand-painted film banners. This shows the "forest" meaning of Gandhada Gudi before a single word appears.
- **"ಕನ್ನಡ ವೇದಿಕೆ ಅರ್ಪಿಸುವ":** small cream letters with a soft black shadow. They fade in and out like old opening credits.
- **"ಪರ್ವ" in the 70s–80s Kannada title style**
  - Thick hand-lettered forms, filled arishina yellow shading into deep gold.
  - A kumkuma-red outline and a deep brown 3D extrusion going down and to the right.
  - Each akshara flies in from deep in the screen, blurred and small, overshoots slightly and settles with a "dhin" sound.
  - Once all the letters land, a shine sweeps across them once.

  Those extruded, shaded titles are the exact nostalgia of that cinema era.
- **"PARVA 2026":** condensed cream letters with wide spacing, under the title.
- **Tagline:** shown in the subtitle strip.
- **After the title settles, the forest keeps drifting.** The hero is never a frozen image.

**Around the screen**
- **Countdown board**
  - A black board in a wooden frame on the right pillar, with a small lamp above it, like the show-timing boards in old theatres.
  - A painted heading reads "ಪರ್ವ ಬಿಡುಗಡೆಗೆ ಇನ್ನು" (days left to Parva's release).
  - Below it are days, hours and minutes on flip tiles, like old railway boards. The tiles flip every minute with a small click.
  - Date and venue are painted underneath.

  A countdown *widget* looks like a website; a show board looks like the theatre.
- **The three main buttons are tickets tucked into the back of the seat in front of you**
  - **Food coupon:** a banana-leaf-green ticket with a small leaf mark, reading "ಭೂರಿ ಭೋಜನ."
  - **Merch:** a cardboard price tag on a string, reading "ಪರ್ವ ಅಂಗಡಿ."
  - **Fan pass:** a golden ticket with a sandalwood border, reading "ನಿಮ್ಮ ಪಾಸ್." It glows faintly because it's the main promotion.
  - **Hover:** that ticket slides up, tilts and catches a light sweep, while the other two dip down.
  - **Click:** the ticket pulls out, flies toward the camera, and the scene moves to that section.
  - **On phones this row sits at the very bottom of the screen**, exactly where the thumb rests. The most important actions are the easiest to reach.
- **The audience reacts**
  - When "ಪರ್ವ" lands, two heads turn to each other and the child's hands go up.
  - After that, a head shifts every few seconds.
- **Light spill:** the forest's golden light tints the seat tops and the audience's faces gold.
- **Mouse movement**
  - The layers move by different amounts: the screen least, the arch more, the seats most.
  - Dust in the beam swirls away from the cursor.

**Scrolling out of the hero**
- **Your first scroll pushes the camera forward over the seats.**
  - The heads slide down out of view and the arch passes out of frame.
  - The screen grows until its edges match the edges of your browser window.
  - Its black borders become the border of the page.
- **Every scene after this plays "on screen."** Keep a thin black border and a faint flicker on all of them, so people never forget they're watching a film.
- **Scrolling back up pulls the camera back out.**

This one camera move is what turns "scrolling a website" into "leaning into a film."

---

## Scene 3: The censor certificate

**The film look (now full-screen)**
- Grain, flicker, a small constant shake and dust, all in a sepia tone.
- The slightly rounded corners of a projected film frame are faintly visible at the edges.

**The certificate**
- **Paper:** aged off-white (#EFE6D2) with visible fibres and small brown age spots, inside a double-line printed border. The corners curl slightly, shown with soft shading.
- **Header:** "ಪ್ರಮಾಣ ಪತ್ರ · CERTIFICATE" in a formal Kannada serif.
- **Fields type in one by one** in a typewriter style, with a clack sound, about 0.8 seconds each:
  - Title: ಪರ್ವ
  - Category: ಸರ್ವರಿಗೂ
  - Length: one full day
  - Language: ಕನ್ನಡ, with English subtitles
  - Certified by: Kannada Vedike
- **The stamp:** a round kumkuma-red rubber stamp, "ಕನ್ನಡ ವೇದಿಕೆ · ಅನುಮೋದಿತ" (approved), slams down.
  - The ink is uneven and bleeds, and the stamp sits slightly crooked.
  - It lands with a thump and a tiny camera shake.
- **The signature:** it draws itself in one fountain-pen stroke.
- **Small print at the bottom:** "Side effects may include: whistling, dancing in the aisle, too much holige."

**The subtitle switch lives on the certificate**
- The Language line ends in a stamped box: **"English subtitles: [ON]."**
- **Clicking it:**
  - A new "OFF" stamp comes down over the old one, a little crooked.
  - The subtitle strip at the bottom disappears right away, as a live demo.
- It controls the same setting as the switch in the top bar.

The joke teaches the feature, so nobody needs a "how to use this site" note.

**Transition out:** a small round cue mark flashes in the top-right corner, the dot old projectionists watched for before a reel change. Then there's a quick cut to Scene 4. Film lovers will catch it, and it's a clean, on-theme way to change scenes.

**Phone layout:** the certificate fills the width and the fields stack. The stamp works the same.

---

## How to make the hardest parts

What was planned, and what the build does (with the reason when it differs):
- **Flame:** stack 3–4 soft shapes (blue root, yellow core, orange edge, glow) and give each its own flicker. Built this way in `lamp.jsx`, with CSS keyframes on small elements.
- **Carved arch:** the plan was a height image lit by an SVG lighting filter or a shader. The build draws each carving three times instead (a dark copy nudged up, a pale copy nudged down, then the sandalwood face), which reads as relief lit from below and costs nothing per frame (`fx/carving.js`). The "someone walking past with a lamp" effect is a soft warm gradient that slides across the carving with the mouse. A lighting filter recomputes on every change and was too slow.
- **Velvet:** vertical gradient bands for the folds plus a slow sway, done with CSS gradients and a small skew animation.
- **Beam, smoke, dust and grain:** one canvas for the air of the hall (`fx/air.js`: beam, smoke, dust, fans, at half resolution) and one for grain, flicker and vignette (`fx/film-layer.jsx`), both on the same 12 fps tick and paused off screen.
- **Extruded title:** built live from four stacked text layers (a brown extrusion from a stack of text shadows, a kumkuma outline, a gold gradient face, and a shine), so it stays real text. It is cheap as long as the hall is promoted to its own layer while it scales (see the performance rules in `parve26spec.md`).
