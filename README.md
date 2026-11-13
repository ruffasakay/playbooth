# PLAYBOOTH

A little movie booth you step inside. Pick a tape from the cabinet, slide it into the player, choose a frame for your photos, watch, snap the moments you love, and collect your prints from the booth's printer.

Built for the Video.js v10 Skins Design Challenge with **Video.js 10.4.0 (`@videojs/react`)**, React Three Fiber and Mux.

## Design thinking (for the submission form)

> PLAYBOOTH treats the player as a place, not a panel. You enter a photobooth, pick a VHS-style tape, and the Video.js skin is the front of the booth's machine: a framed screen above a chunky physical deck. The controls are keys with real travel, a film-strip seek bar with a reel thumb, an LCD time readout and a volume fader. They sit on the deck, never over the picture, so they stay readable over any footage. Every visible control works, the whole booth is operable by keyboard and screen reader, and the frame you choose is drawn by one painter for the live preview, the 3D screen and your printed photos.

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
- `https://playbooth.vercel.app/#player` — skips the walk in and goes straight to the deck with Charge loaded

## Mux bonus

All six tapes are Mux assets (`src/data/movies.js`). Submit any one playback ID, for example Charge: `xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg`. Keep the assets **public** and **live through judging**.

Playback uses Video.js's `MuxVideo` with `preferPlayback: 'mse'` and `crossOrigin="anonymous"`, so screenshots read real frames in every browser that has Media Source Extensions (including iPhone on iOS 17.1+). Mux Data is attached through `@videojs/react/extensions/mux-data` and needs no key.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/player/Skin.jsx` | **The skin.** Video.js `Container`, `Controls`, `PlayButton`, `SeekButton`, `TimeSlider` (with Mux storyboard thumbnails), `Time`, `MuteButton`, `VolumeSlider`, `CaptionsButton`, `PlaybackRateButton`, `FullscreenButton`, `Poster`, `BufferingIndicator`, status, seek and volume indicators, `ErrorDialog`, `Hotkey`s and `StatusAnnouncer`, plus the photo keys |
| `src/styles/skin.css` | Skin styles. Container queries size the deck to the player, not the window |
| `src/data/borders.js` | The five photo frames and the single painter used everywhere |
| `src/three/*` | The booth: exterior, curtains, interior, cabinet, tapes with magnetic snapping, machine, printer, prints, camera rig, keyboard hotspots |
| `src/lib/photos.js` | Capture, IndexedDB storage, download and share |

The skin supports the same public CSS properties as the Video.js skins: `--media-accent-color`, `--media-accent-text-color`, `--media-border-radius`, `--media-border-color`, `--media-font-family`.

## Checklist against the brief

- **Works**: Video.js v10 player, Mux streams, real playback.
- **Essential controls**: play/pause, seek bar, current time and duration, mute and volume, fullscreen (the whole machine goes fullscreen). Also captions, speed, ±10 s, snapshot, album, print, eject.
- **Responsive**: tested at 1440×900, 1200×750, 1000×640, 390×844 and 844×390. On tall phones the walk in ends facing the tapes.
- **Keyboard**: every 3D object has a focusable hotspot (tapes, slot, screen, eject, prints, album). Escape puts a tape back, steps back out of a view, or stands up from the deck. Player shortcuts: Space/K, M, F, C, ←/→, J/L, ↑/↓, 0–9, Home/End, `<`/`>`, and S for a photo.
- **Readable over any video**: controls are on the deck, not over the picture. Indicators and the error dialog use solid surfaces.
- **Touch targets**: every deck control is at least 44×44 px (checked automatically at phone sizes).
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

Fonts: DynaPuff, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono, SIL Open Font License 1.1 (licenses in `public/fonts`).

All 3D models, icons and illustrations are original and drawn in code.

This entry is licensed under the Apache License, Version 2.0, per the challenge guidelines. Add the full license text with GitHub's "Add file → Create new file → LICENSE → Choose a license template → Apache 2.0".

## Known limits

- Tested in headless Chromium with software rendering. Check on a real iPhone (Safari) and in Firefox before submitting, especially screenshots and fullscreen.
- On iPhone, fullscreen hands the video to the system player, so the deck isn't shown in fullscreen there. This is platform behavior.
- Photos are stored in this browser only (IndexedDB). Private browsing may not keep them; the booth says so and offers download.
