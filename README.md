# PLAYBOOTH

A little movie booth you step inside. Pick a tape from the cabinet, slide it into the player, choose a frame for your photos, watch, snap the moments you love, and collect your prints from the booth's printer.

Built for the Video.js v10 Skins Design Challenge with **Video.js 10.4.0 (`@videojs/react`)**, React Three Fiber and Mux.

## Design thinking (for the submission form)

> PLAYBOOTH is a photobooth for films. You step into a little white booth on a quiet street, pick a tape from the rack and watch it on an old television. The Video.js skin is a photo frame with a remote beside it: the frame you choose holds the picture, and a dock of round paper keys in that frame's own colors stands at its right. The progress runs top to bottom, like scrolling a feed: drag it and a strip of clips rolls past the picture, hover it and three clips float up with the moment under your pointer outlined. When nobody touches anything the dock steps away and the framed picture grows into the room. On a phone, full screen turns the film on its side, so both thumbs rest on the controls like a game. Press Snap on any frame and it downloads at once and waits in the booth's tray, ready to be printed in its frame or stacked into a photostrip.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Node 20.19 or newer.

## Deploy (GitHub → Vercel)

1. Push this folder to your GitHub repo (`node_modules` and `dist` are ignored).
2. In Vercel, import the repo. The included `vercel.json` sets the build command and the `dist` output.
3. Every push to `main` redeploys.

Useful links for judges:

- `https://playbooth.vercel.app/` — the full experience (the **Live site URL**)
- `https://playbooth.vercel.app/player/` — the skin on its own, a Video.js sandbox for judges (the **Project URL**). It is a second page of the same build, not linked from the booth.
- `https://playbooth.vercel.app/#player` — skips the walk in and opens the player with Charge loaded

Replace `playbooth.vercel.app` with your own Vercel domain.

## The showcase page (`/player/`)

`player/index.html` → `src/showcase/`. The same `PlayboothSkin`, mounted in a box you size yourself:

- **Size**: six shapes (desktop 16:9, laptop 16:10, tablet 4:3, square, phone sideways 19.5:9, phone upright 9:19.5) and a width slider. The skin lays itself out from the box's own size, so this is a real test, not a zoom. Shapes with keys on both sides start at 600–667 px; narrower than the screen scrolls sideways.
- **Film**, **Frame** (all 30, ranked) and **Your own frame**: drop or choose a picture, fit or tile it, set the margin. The keys take the picture's average colour for their dock.
- **Playback**: autoplay (muted), loop, calm motion, key sounds.
- The left keys in the player become Frames, Next film and Surprise frame (there is no booth to go back to).
- Below: the idea (Play ×2, vertical controls, the clip reel, frames as themes), the minimum requirements and accessibility tips with live measurements (key contrast for the current frame, smallest key on screen), and every keyboard shortcut.
- The Video.js mark is the official one from the `videojs/video.js` repository (`site/public/favicon.svg`).

## Mux bonus

All six tapes are Mux assets (`src/data/movies.js`). Submit any one playback ID, for example Charge: `xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg`. Keep the assets **public** and **live through judging**.

Playback uses Video.js's `MuxVideo` with `preferPlayback: 'mse'` and `crossOrigin="anonymous"`, so screenshots read real frames in every browser that has Media Source Extensions (including iPhone on iOS 17.1+). Mux Data is attached through `@videojs/react/extensions/mux-data` and needs no key.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/player/Skin.jsx` | **The skin.** Frame on the left, dock on the right: a full-height vertical progress groove (drag: the picture scrubs with the time beside the thumb; hover: three floating clips, the current one outlined) and one column of keys: time, lock, settings, captions on/off, sound, ±10 s, play, Snap, full screen. The booth's own actions (back, snaps, album, eject) sit in a column on the left that mirrors the player's keys across the frame, so both sides balance; every key is its own solid circle, with no panel behind. While you choose a frame, only the framed picture shows; the controls arrive with the film. Dragging the progress scrubs the picture itself with the time beside the thumb; hovering floats three clips. Controls step away after a few seconds of play and the picture grows (an animated FLIP). Lock hides everything until the unlock key. Settings has playback speed, subtitle style (font, size, color, outline or box) and picture-in-picture. Upright phones lay the dock under the picture. Full screen fills the screen with the frame's own paper, and on phones lands in landscape (screen orientation lock, or a CSS turn where the browser can't lock, such as iPhone Safari). Video.js `Container`, `PlayButton`, `SeekButton`, `Time`, `MuteButton`, `VolumeSlider`, `Poster`, `BufferingIndicator`, `ErrorDialog`, `Hotkey`s, `StatusAnnouncer` and the player store |
| `src/styles/skin.css` | Skin styles. Each frame sets theme tokens (`--k-dock`, `--k-surface`, `--k-ink`, `--k-band`, `--k-accent`, `--k-track`, `--k-play-bg`) that color its dock, keys and progress groove. Keys show state by filling in, never by a ring drawn around them |
| `src/data/borders.js` | The 30 photo frames (graphics only: no words, numbers or lettering, and always a straight-edged rectangular window so nothing crops the film), their control colors, the painter used for the player, prints and photostrips, and `setCustomBorder` for a frame made from your own picture |
| `src/ui/Hint.jsx` | Hover hints like a game's key prompts: rest the mouse on a control and a small card names it with its key ("Snap this frame  S"). Mouse only, nothing on touch |
| `src/ui/Dialogs.jsx` | Snaps, Album and the photo viewer as full-screen panels with a Back key: every picture fits the screen without scrolling, and turns into pages only when there are too many |
| `src/lib/sfx.js` | Every sound, synthesized with WebAudio (no audio files). The sound toggle mutes them |
| `src/three/Machine.jsx` | The TV corner: the television (a bouncing PLAYBOOTH logo while it waits; a loading screen in the booth's colours with a cream cassette whose reels turn and a filling bar while a tape goes in; then the film in its frame), the VCR standing on its own shelf, and the printer. At night the screen lights the room, the VCR's figures and the printer's lamp glow green, and a neon line runs under the cabinet top |
| `src/three/Tape.jsx`, `src/three/Inspect.jsx` | Tapes on keyframed paths: inserting slides the case out of its cubby, lifts and turns it flat on the way over, lines it up in front of the slot (the flap opens) and the deck draws it in; ejecting plays the same story backwards with a beat at the slot. Clicking a tape flies it from the shelf into the close-up and back again when you leave |
| `src/ui/About.jsx`, `src/ui/Credit.jsx` | The About card (the name, the idea, the controls, the credit), opened from the hero's About key, the PLAYBOOTH name in the booth's corner, or `?` |
| `src/three/*` | The booth: exterior, curtains, interior, cabinet, tapes with magnetic snapping, machine, printer, prints, camera rig, keyboard hotspots |
| `src/lib/photos.js` | Capture, IndexedDB storage, download and share |

The skin supports the same public CSS properties as the Video.js skins: `--media-accent-color`, `--media-accent-text-color`, `--media-border-radius`, `--media-border-color`, `--media-font-family`.

## Checklist against the brief

- **Works**: Video.js v10 player, Mux streams, real playback.
- **Essential controls**: play/pause, a vertical seek groove with clip previews, current time and duration, mute and volume, full screen (no black bars; landscape on phones). Also ±10 s, captions on/off, a settings menu (speed, subtitle style, picture-in-picture), a lock, Snap, Snaps compiler, album, eject.
- **Sound**: synthesized key clicks with a felt low thock, a shutter, paper, tape clunk and eject, curtain and light switch sounds. One toggle mutes them all.
- **Day and night**: the sun/moon toggle in the corner of the screen (from the street to inside the booth), the switch on the booth's back wall, or L turns the whole booth to night: street lamps, shop windows and string lights come on, the room dims to lamp light, and the interface switches to its dark palette. At night the PLAYBOOTH sign lights up like neon, two street lamps and most windows come on, and the room keeps warm lamp light, so everything stays visible. A light night layer over the 3D view keeps the change clear on phones, where the renderer runs lean.
- **Frames**: 30, all pure graphics with rectangular windows, ranked by design and uniqueness. After No frame, first the frames drawn from the references: Vinyl cream, Star confetti, Comic blocks, Lace, Red film, Lavender swirl, Red knit, Paper hearts, Airmail, Matinee, Denim & lace, Vinyl red, Comic wave, Butter doodle, Pixel lilac, Cocoa bow, Vinyl pink, Newsprint, Black strip; then the booth's own: Velvet curtain, Granny squares, Starry night, Sage checker, Cinema ticket, Postage stamp, Pressed flowers, Red polka, Linen stripe, Booth white. Each one colors its own controls, and all are drawn relative to the picture's width, so they hold up from a phone to a TV. The picker always fills its panel: its column count divides 30, so no row is half empty.
- **Snap flow**: each snap downloads the clean frame immediately and joins the Snaps compiler; print singles in any frame, or 2 to 6 as a framed photostrip.
- **Responsive**: tested at 1440×900, 1280×760, 1180×820, 820×1180, 412×915, 390×844 and 844×390, plus full screen on each. On tall phones the walk in ends facing the tapes.
- **Keyboard**: every 3D object has a focusable hotspot (tapes, slot, screen, eject, prints, album). Escape puts a tape back, steps back out of a view, or stands up from the deck. Player shortcuts (working, never printed on screen): Space/K, M, F, C, ←/→, J/L, ↑/↓, 0–9, Home/End, `<`/`>`, and S for a photo. The progress groove takes ↑/↓, Page Up/Down, Home and End when focused.
- **Readable over any video**: controls live in the dock beside the frame, not over the picture; every floating button is solid. Captions sit on the picture's lower edge with an outline or box. No pop-up status text stretches the player; state changes are announced to screen readers only.
- **Touch targets**: controls are 44×44 px, 38–40 px only inside very small players; nothing is clipped at the tested sizes.
- **Reduced motion**: the walk in becomes a quick fade, the camera cuts instead of flying, tapes and prints move instantly, idle animations stop.
- Also handles `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`, RTL arrow keys in the frame picker, and a no-WebGL fallback (tapes become buttons; force it with `?flat`).

## Credits and licenses

Made with love by [@ruffasakay](https://contra.com/ruffasakay). The credit is on the About card in the booth and in the footer of the showcase page.


Films, all by the Blender Foundation, hosted on Mux:

| Film | Credit | License |
| --- | --- | --- |
| Charge (2022) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Sprite Fright (2021) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Wing It! (2023) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Tears of Steel (2012) | (CC) Blender Foundation, mango.blender.org | CC BY 3.0 |
| Big Buck Bunny (2008) | © 2008 Blender Foundation, www.bigbuckbunny.org | CC BY 3.0 |
| Sintel (2010) | © Blender Foundation, durian.blender.org | CC BY 3.0 |

Fonts: Fraunces (headings and reading text), DM Mono (interface), Caveat (handwritten notes), Atkinson Hyperlegible Next (caption sans) and Literata (caption serif), all SIL Open Font License 1.1.

All 3D models, icons and illustrations are original and drawn in code.

This entry is licensed under the Apache License, Version 2.0, per the challenge guidelines. Add the full license text with GitHub's "Add file → Create new file → LICENSE → Choose a license template → Apache 2.0".

## Known limits

- Add `?lite` to the URL to force the lightweight renderer (no shadows or reflections); it also switches on by itself on slow devices.
- Browsers may ask once to allow multiple downloads when you snap several frames.
- Tape covers use a frame from each film via Mux's image API; drop official posters in `public/covers/` and set `cover` in `src/data/movies.js` to use them instead.
- Tested in headless Chromium with software rendering and phone emulation. Check on a real iPhone (Safari), an Android phone and Firefox before submitting, especially full screen turning to landscape, clip previews and sounds.
- iPhone Safari has no page full screen, so there the player fills the window itself and turns on its side; the browser bar may still show until scrolled away. Sounds on iPhone follow the ring/silent switch.
- Photos are stored in this browser only (IndexedDB). Private browsing may not keep them; the booth says so and offers download.
