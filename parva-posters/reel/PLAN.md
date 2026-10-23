# Parva 2026 theme reveal reel: build plan

A 22.13-second vertical reel for **Parva 2026** with two reveals: **the Parva theme (GANDHADA GUDI)** and **the Parva website release**. Name Parva throughout: the viewer must never see the theme or the URL without "PARVA" nearby.

It should feel abstract and like old cinema. **Do not use screenshots or recordings of the website.** Build it from the site's own canvas drawings, listed below, plus a small set of forest animals drawn for the reel.

- On-screen text is mainly **English**. Kannada appears only as a small second line under the theme name, and where it is already part of a reused drawing.
- **The first second is the hook.** Frame 0 must already be bright, with "PARVA 2026" and "THEME REVEAL" readable on the closed red curtain, and the curtain starts opening on frame 0. No fade from black, no logo intro, **no countdown**. Frame 0 is also the thumbnail people scroll past.
- Output: 1080×1920, 30 fps, H.264, exactly 22.133 s (664 frames).

## Music (timing reference only, never posted with the video)

- Track: **"Gandhada Gudi (Reprise)"**. Singer Vijay Prakash, music B. Ajaneesh Loknath, lyrics Chi. Udayashankar. It is track 1 (0:00–3:36) of https://www.youtube.com/watch?v=Kpx5iD9EwOI
- The reel uses **song 0:57.9 → 1:20.033** (22.133 s). Reel time `t` = song time − 57.9. It starts in the breath gap (57.6–57.9) before the sung line, which begins at about 58.0, and ends where the lyrics end cleanly, so the audio does not cut mid-word.
- To post: export the silent version and add the same song with Instagram's music picker, starting at **0:57.9** (or **0:58** if the picker won't allow decimals).
- Reference audio (keep it in a scratch folder, never commit it):
  ```bash
  yt-dlp --no-playlist -x --audio-format wav --download-sections "*0-60" -o "gg-ref.%(ext)s" "https://www.youtube.com/watch?v=Kpx5iD9EwOI"
  ffmpeg -ss 57.9 -t 22.133 -i gg-ref.wav -c:a pcm_s16le ref-22s.wav
  ```

## Timing map (already measured, don't redo)

Reel `t` = song − 57.9.

| Reel `t` | What happens in the music |
|---|---|
| 0.15, 1.15, 2.15, 3.15 | Kicks, then a calm build |
| **6.15** | **Big hit** (song 64.05): the strongest jump in the window |
| 9.15, 10.15, 11.15 | Kicks |
| **14.15** | **Big hit** (song 72.05) |
| 15.15, 17.15, 18.15, 19.15 | Kicks |

The lead sung line starts at about t 0.1 (song 58.0). Wider vocals and instruments come in on the big hits. Song 80.033 is the clean lyric end, where the reel stops.

Lyric subtitles are optional and **unverified**: a person must listen to the window and confirm the lyrics first. **They are not confirmed, so the reel is rendered without subtitles.**

## Reused site code (all in `src/components/Parva26`, import with `@p26/…`)

Each of these is driven by the time you pass in, so stepping it frame by frame works.

| Module | Call | Used for |
|---|---|---|
| `scenes/00-intro/stage-curtain.js` | `createStageCurtain(canvas)` → `.draw({ open, screen, projector: 0, t })` | The kumkuma curtain, lit, parting from frame 0. `projector` is 0, so the film countdown leader is never drawn |
| `scenes/02-title/forest.js` | `createForest(canvas)` → `.draw(t)` | Sandalwood forest at golden hour, behind the theme reveal and the end card |
| `scenes/02-title/air.js` | `createAir(canvas)` → `.draw(t, { screen, pointer: null, fansInView: false })` | Projector beam, smoke and dust |
| `scenes/00-intro/smoke.js` | `drawIncense`, `createSmokeLetters()` → `.layout`, `.draw(ctx, t, embers, scale)` | Agarbatti smoke gathering into GANDHADA / GUDI (two instances, one per line). They start on the normal clock at t 3.35, so the letters gather from the embers and settle on the 6.15 hit, then drift apart from about 9.15 |
| `scenes/04-gandhada-gudi/sandal-strip.js` | `stripLayout(405, 720, false)`, `createSandalStrip(canvas)` → `.resize(layout, 8/3)`, `.draw(p, t, titleFont)` (returns the frame rects) | The film strip: forest, carver's bench, tiny cinema |
| `film/film-layer.jsx` | `makeGrainTiles`, `makeVignette`, `advanceScreen`, `drawScreen` | Grain, flicker, dust, hairs, scratches and vignette, advanced at 12 fps over every frame. These four functions are exported for the reel (the only site-code change, no behaviour change) |
| `parva-posters/source/poster.html` | Ticket look (arishina ticket, notched sides, dark URL strip) | The website reveal ticket |

New in `parva-posters/reel/animals.js` (flat painted-banner silhouettes, near-black with a warm rim of light, motion from `t` only): a **leopard** lying on a branch (long low body, rosettes, thick tail hanging and curling, small round ears), a mother and calf **elephant** pair, a **hornbill**, and a spotted **deer**.

Colours (`src/index.css`): theatre `#140c08`, heartwood `#6b3f22`, sandal `#c8955f`, gandha `#f1dfc0`, arishina `#f2c12e`, kumkuma `#c8102e`, brass `#b8862b`, projector `#fff4dc`.

Fonts: Bebas Neue for English display text, Anek (Kannada variable) for the URL and small English, Baloo Tamma 2 for the small Kannada line, Akaya Kanadaka for the strip's cinema card. Imported from the same fontsource packages the site uses; the page awaits `document.fonts` before rendering.

**Coordinates:** the reel is a phone screen of **405×720 CSS px drawn at pixel scale 8/3**, which gives a 1080×1920 canvas. Text is centred at x 191 (the middle of the safe area).

## Storyboard

| Reel `t` | Picture | Text |
|---|---|---|
| **0.00**–1.2 | **The hook.** Frame 0 is the closed, fully lit red curtain. It opens from frame 0 (`open` 0→1 over 1.2 s, easeInOut), revealing the dimmed forest, the beam, three incense embers and the leopard. A small curtain shimmy at 0.75. | Visible at frame 0, no fade-in: small **PARVA 2026** at the top, big **THEME REVEAL** below it. At 1.15 this swaps to small **THE PARVA 2026 THEME IS…** |
| **1.2**–5.75 | Calm build over the forest: beam, dust, rising incense smoke, the leopard on its branch, elephants walking. The smoke letters start gathering from the embers at 3.35. | THE PARVA 2026 THEME IS… |
| **5.75**–6.15 | A short build: the beam brightens and the embers glow up into the hit. | — |
| **6.15**–10.15 | **Big hit: the theme reveal.** Warm flash (cream overlay peaking at 0.35, decaying over 0.3 s). The crisp **GANDHADA GUDI** in arishina with a sandal glow cross-fades in over the settled smoke (0.3 s), and the leopard lifts its head. Slow push 100→105%. Light pulse at 9.15. The smoke drifts apart from about 9.15. The hornbill crosses at about 7.6–9.9. | A lockup: small **PARVA 2026 · THEME** above, **GANDHADA GUDI** large, ಗಂಧದ ಗುಡಿ (small) under it, and from 7.15 **A FESTIVAL FOR THE LAND OF SANDALWOOD** |
| **10.15**–14.15 | Hard cut to the **sandal strip**. `p` is 0 at 10.15 (forest, with the deer), 0.5 at 11.15 (craft), 1 at 12.15 (cinema); each 0.35 s ease lands on its beat. Holds to 14.15. | A small header **PARVA 2026 · GANDHADA GUDI**. A label under each frame as it centres: **FOREST**, **CRAFT**, **CINEMA** |
| **14.15**–22.13 | **Big hit: the website reveal.** The ticket drops in over the dimmed forest and the beam, and holds to the end. The URL types itself out from 14.45 to 15.45. On 17.15 the dates slide in. On 18.15 a **DOORS OPEN** rubber stamp thumps onto the ticket (scaling 130→100%, landing exactly on 18.15, with a shake). The end card holds to the last frame with the grain still moving, and works as a cover: Parva, the theme and the URL all readable. | **PARVA 2026 · GANDHADA GUDI** above / **THE PARVA WEBSITE IS LIVE** / the URL on the ticket as two lines, **kannadavedike.nitk.ac.in/** small and **parva-26** very large / **29, 30, 31 OCT & 1 NOV · NITK SURATHKAL** / **DOORS OPEN** stamp / small **KANNADA VEDIKE, NITK** at the bottom |

- **The film layer** draws on top of every frame, from start to end, and keeps moving through the held end card.
- **Subtitles**, only if confirmed: show A–E on their phrase times as transliterated Kannada in old-film subtitle style (cream with a black shadow, Anek, about 20 CSS px), centred at y ≈ 540 CSS px. Never show them over the opening hook. Currently not used.

**Instagram safe area** (in CSS px): keep all text within x 22–360 and y 80–555. The bottom ~155 px is covered by the caption and buttons, and the right ~45 px by the icons. `render.mjs` records every text box and reports any that leave this area (only the dates band mid-slide, at the start of its entrance, is reported).

## How to build

Files in `parva-posters/reel/`: `reel.html`, `reel.js` (storyboard and text), `animals.js` (wildlife), `render.mjs`.

1. Start the dev server in the background (`BROWSER=none npx vite --port 5199 --strictPort`). It serves `/parva-posters/reel/reel.html`; `window.renderAt(t)` paints every layer for time `t`. Frames must be rendered in order.
2. `node parva-posters/reel/render.mjs` renders `frames/0000.jpg … 0663.jpg` (1080×1920, quality 95) with Chromium from `~/.cache/ms-playwright`. For single stills while developing: `node parva-posters/reel/render.mjs --stills 0,2.5,10.3 --dir <folder> --safe`.
3. Encode:
   ```bash
   # post version (silent)
   ffmpeg -y -framerate 30 -i frames/%04d.jpg -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -movflags +faststart parva26-reel.mp4
   # preview with the reference music, for checking timing only, never posted
   ffmpeg -y -i parva26-reel.mp4 -i ref-22s.wav -c:v copy -c:a aac -b:a 192k -af "afade=t=in:d=0.05,afade=t=out:st=21.5:d=0.633" parva26-reel-preview.mp4
   ```
4. Review: take stills at t = 0, 0.6, 2.5, 5.0, 6.4, 7.6, 9.5, 10.4, 11.4, 12.4, 14.6, 16.0, 18.4 and 22.1 into one contact sheet (`tile=7x2`) and check that:
   - frame 0 reads as a hook on its own (PARVA 2026, THEME REVEAL, lit curtain)
   - the theme is readable on the 6.15 hit
   - all text is inside the safe area
   - the last frame works as a cover
5. Afterwards, delete `frames/` and stop the dev server. Don't commit the audio or the MP4s.

## Hand-off

Give the user both files:
- `parva26-reel.mp4`, the silent version to post, with a note to add "Gandhada Gudi (Reprise)" in Instagram starting at **0:57.9** (or **0:58** if the picker won't allow decimals)
- `parva26-reel-preview.mp4`, the version with music (with a short fade at the end), to check the timing
