# Parva 2026 page (`/parva-26`)

The whole page is one show at *Sri Gandhada Gudi Chitramandira*. What each
scene is and why: `parve26spec.md` (start with section 0), `parva26-brief.md`
and `allscenes.md` at the repo root.

```
Parva26.jsx     the landing page: the scenes in show order, inside PageShell
scenes/         one folder per scene, numbered as in the spec
  00-intro/       parked: lamp, smoke letters, countdown leader, curtain
  02-title/       the hall and hero: index.jsx + title card, show board,
                  tickets, audience, arch, walls, name board, forest.js, air.js
  03-certificate/ 04-gandhada-gudi/  06-now-showing/
  07-guests/      wall of honour: guest-frame.jsx and its parts
  08-interval/    the move out through the doors into the Parva Market
  09-release-day/ Samudrappa's cutout, flowers (petals.js), banner, signs
  10-timeline/    the rewind bench and era title cards
  11-emoji-game/  the projection booth game
  12-credits/     the roll, making-of inset, ಶುಭಂ and the curtain
chrome/         on every screen: page shell (fonts, prefs, theatre
                background), top bar and its programme, film reel, Skip
                scene button, subtitle strip, cursor
film/           the on-screen look: film layer, film frame, ink filter
ui/             pieces used by more than one scene (coupon, flourish, bulbs,
                the ಪರ್ವ lettering); stalls/ is what the merch page draws:
                the tee and its showcase parts, and the feast poster
market/         the Parva Market game, a box in the interval (market-stage.jsx):
                the role picker, the place prompt, and world/ (the Phaser
                forecourt: layout, path finding, painted art, the two walkers).
                /parva-26/market redirects to it
lib/            gsap, prefs (Sub, En), useOnScreen, storage, willChange, text
styles/         materials, textures, carving (style objects)
content/        everything the team will change, one file per topic;
                import from @p26/content
assets/         textures/, guests/, posters/ (event poster photos), emoji/,
                making-of/
```

## House rules
- Each scene folder holds the scene (`index.jsx`) and everything only it
  uses. A scene never imports from another scene: shared pieces go to `ui/`,
  shared logic to `lib/`.
- Import with the aliases: `@p26/…` for this folder, `@/…` for `src`.
- Kannada leads; English goes in `<En>` (or `Sub`), so it hides with the
  subtitles switch but stays for screen readers. Dates, times, prices and
  counts use normal digits.
- Tailwind utilities only; tokens and keyframes live in `src/index.css`.
- Performance: one low-rate canvas for anything that always moves; pause
  what's off screen (`useOnScreen`, `PAUSED`); give big moving pieces a
  layer only while they move (`willChange`); no large filters or blend
  modes. The full list is in the spec, section 0.
- Content stand-ins are marked `TODO(content)`; things waiting for a server
  are marked `TODO(backend)`.

## The games' server
The flowers (Scene 9) and "Which film?" (Scene 11) are played against
`/api/parva26` (`server/src/routes/parva26.routes.js`, no login). The films
and their answers are on the server, not here, in
`server/content/parva26-films.json`. After changing that file, in `server/`:
```
npm run parva26:emoji             # downloads any new emoji's Twemoji image
npm run parva26:films -- --check  # checks the list (also run by the tests)
npm run parva26:films             # loads it into parva26_puzzles
```
The checks refuse a list with missing fields, duplicates, a clue that names
its film, two films whose names would count for each other, an emoji with no
image, or fewer than 50 films. Wrong guesses are kept in `parva26_guesses`;
`server/sql/005_parva26_games.sql` has the query that lists the common ones,
to add real spellings to a film's `accept`. Without the server the flowers
still count on the page, and the booth shows "the projector is down".
`?hoomale=9996` tries the flower milestones without any server.

## Checking a change
```
npx vite build && npx vite preview --port 5198      # in one terminal
node scripts/parva26-check.mjs baseline              # before the change
node scripts/parva26-check.mjs                       # after: compares shots
P26_SUBTITLES=off node scripts/parva26-check.mjs     # the same, subtitles off
node scripts/parva26-flows.mjs                       # plays the interactions
node scripts/market-flows.mjs [phone]                # the market game's
```
