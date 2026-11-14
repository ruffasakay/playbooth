# PLAYBOOTH

A little movie booth you step inside. Pick a tape from the cabinet, slide it into the player, choose a frame for your photos, watch, snap the moments you love, and collect your prints from the booth's printer.

Built for the Video.js v10 Skins Design Challenge with **Video.js 10.4.0 (`@videojs/react`)**, React Three Fiber and Mux.

## Design thinking (for the submission form)

> PLAYBOOTH is a photobooth for films. You step into a little white booth on a quiet street, pick a tape from the rack and watch it on an old television. The Video.js skin is the photo frame itself: the frame you choose becomes the player's border, and its lower edge widens into a slim band that holds one row of round paper keys and a seek groove, so nothing ever covers the picture. The keys take each frame's own paper and ink, and the band sits inside the frame's edge: on the lace doily, the ticket's tear-off stub, the cocoa frame's cream mat, a linen tape on the stripe frame. Press Snap on any frame, playing or paused, and it downloads at once and waits in the booth's tray, ready to be printed one by one in its frame or stacked into a photostrip. Warm paper, brown ink and late-afternoon light, inspired by the quiet of a corner shop at golden hour.

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

- `https://playbooth.vercel.app/` — the full experience
- `https://playbooth.vercel.app/#player` — skips the walk in and opens the player with Charge loaded (for judges short on time)

## Mux bonus

All six tapes are Mux assets (`src/data/movies.js`). Submit any one playback ID, for example Charge: `xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg`. Keep the assets **public** and **live through judging**.

Playback uses Video.js's `MuxVideo` with `preferPlayback: 'mse'` and `crossOrigin="anonymous"`, so screenshots read real frames in every browser that has Media Source Extensions (including iPhone on iOS 17.1+). Mux Data is attached through `@videojs/react/extensions/mux-data` and needs no key.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/player/Skin.jsx` | **The skin.** The chosen frame is the border, and its widened lower edge is the control band, so controls never sit on the picture. One row: play, time, seek bar, duration, volume, captions (style popover above the key), a More key (±10 s, speed, picture-in-picture), Snap and fullscreen; on narrow players the seek bar takes its own line. Fullscreen keeps the picture at the film's shape and widens the frame around it, so there are no black bars. The seek bar shows a live preview card of the film on hover. Custom caption layer placed above the band. Video.js `Container`, `PlayButton`, `SeekButton`, `TimeSlider`, `Time`, `MuteButton`, `VolumeSlider`, `PlaybackRateButton`, `PiPButton`, `FullscreenButton`, `Poster`, `BufferingIndicator`, `ErrorDialog`, `Hotkey`s and `StatusAnnouncer` |
| `src/styles/skin.css` | Skin styles. Each frame sets theme tokens (`--k-surface`, `--k-ink`, `--k-band`, `--k-accent`, `--k-track`) that color its keys and seek groove. Container queries size the band to the player, not the window |
| `src/data/borders.js` | The 13 photo frames, their control colors, the spacing of each frame's control band (`deck`), and the single painter used for the player, prints and photostrips |
| `src/lib/sfx.js` | Every sound, synthesized with WebAudio (no audio files). The speaker knob next to the light switch mutes them |
| `src/three/*` | The booth: exterior, curtains, interior, cabinet, tapes with magnetic snapping, machine, printer, prints, camera rig, keyboard hotspots |
| `src/lib/photos.js` | Capture, IndexedDB storage, download and share |

The skin supports the same public CSS properties as the Video.js skins: `--media-accent-color`, `--media-accent-text-color`, `--media-border-radius`, `--media-border-color`, `--media-font-family`.

## Checklist against the brief

- **Works**: Video.js v10 player, Mux streams, real playback.
- **Essential controls**: play/pause, seek bar with a live preview card, current time and duration, mute and volume, fullscreen (the frame scales to fill the whole screen). Also ±10 s, captions with style panel, speed, picture-in-picture, Snap, Snaps compiler, album, eject.
- **Sound**: soft synthesized clicks, a shutter, paper, tape clunk and eject, curtain and light switch sounds. One knob mutes them all.
- **Day and night**: the light switch plate in the corner of the screen (from the street to inside the booth), the switch on the booth's back wall, or L turns the whole booth to night: street lamps, shop windows and string lights come on, the room dims to lamp light, and the interface switches to its dark palette.
- **Frames**: 13: No frame, Booth white, Lace, Postage stamp, Cinema ticket, Denim & lace, Red knit, Cocoa bow, Red film, Airmail, Matinee, Red polka and Linen stripe. Each one themes its own controls.
- **Snap flow**: each snap downloads the clean frame immediately and joins the Snaps compiler; print singles in any frame, or 2 to 6 as a framed photostrip.
- **Responsive**: tested at 1440×900, 1200×750, 1000×640, 390×844 and 844×390. On tall phones the walk in ends facing the tapes.
- **Keyboard**: every 3D object has a focusable hotspot (tapes, slot, screen, eject, prints, album). Escape puts a tape back, steps back out of a view, or stands up from the deck. Player shortcuts: Space/K, M, F, C, ←/→, J/L, ↑/↓, 0–9, Home/End, `<`/`>`, and S for a photo.
- **Readable over any video**: controls live in the frame's band, not over the picture. Captions sit on the picture's lower edge with an outline or box. No pop-up status text stretches the player; state changes are announced to screen readers only.
- **Touch targets**: controls are 44×44 px, 38–40 px only inside very small players; nothing is clipped at the tested sizes.
- **Reduced motion**: the walk in becomes a quick fade, the camera cuts instead of flying, tapes and prints move instantly, idle animations stop.
- Also handles `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`, RTL arrow keys in the frame picker, and a no-WebGL fallback (tapes become buttons; force it with `?flat`).

## Credits and licenses

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
- Tested in headless Chromium with software rendering. Check on a real iPhone (Safari) and in Firefox before submitting, especially screenshots and fullscreen.
- On iPhone, fullscreen hands the video to the system player, so the deck isn't shown in fullscreen there. This is platform behavior.
- Photos are stored in this browser only (IndexedDB). Private browsing may not keep them; the booth says so and offers download.
