# Parva 2026 design brief: a place, not a page

Companion to `parve26spec.md`. The spec says *what* is on the page; this brief says *how it should look and feel*. It currently covers the always-on objects and Scenes 0–3; Scenes 4–12 are still to be written in the same detail.

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

- **Flame:** stack 3–4 soft blurred shapes (blue, yellow, orange, glow) and move their edges with a small noise wobble. A single flame drawing always looks fake.
- **Carved arch:** draw the carving once as a greyscale "height" image, where lighter means raised. Then light it with an SVG lighting filter or a small WebGL shader, so the light can move across the relief.
- **Velvet:** vertical gradient bands for the folds, plus fine noise, plus a slow sideways shift for the sway.
- **Beam, smoke, dust and grain:** draw them all on **one** canvas layer with glowing (additive) blending, and pause it when it's off-screen. One canvas is much lighter on phones than many animated elements.
- **Extruded title:** draw it as a finished SVG in a design tool rather than building the 3D effect live. It looks better and loads faster.
