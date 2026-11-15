# PLAYBOOTH

A photobooth is a little room you step into. PLAYBOOTH is one made for **play**, both kinds: **play the game** (walk in, pick a tape off the shelf, slide it into the player) and **play the film** (watch it in a frame you choose, snap the moments you love, print them as a photostrip).

Built for the Video.js v10 Skins Design Challenge with **Video.js 10.4.0 (`@videojs/react`)**, React Three Fiber and Mux.

- Live site: https://playbooth.vercel.app
- The player on its own (Project URL): https://playbooth.vercel.app/player/
- Source: https://github.com/ruffasakay/playbooth (Apache License 2.0, see `LICENSE`)
- The player on an ordinary page: https://playbooth.vercel.app/embed/

## Use it on your site

Copy the skin's `src` folder into your React project, install its packages, and render one component wherever a film should play. Apache 2.0.

```bash
npm i react react-dom @videojs/react @videojs/core @videojs/mux-video @videojs/mux-data zustand idb-keyval @fontsource-variable/fraunces @fontsource/dm-mono
```

```jsx
import { PlayboothPlayer } from './src/player/PlayboothPlayer.jsx';

export default function Film() {
  return (
    <PlayboothPlayer
      title="Sprite Fright"
      playbackId="TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs"
      credit="Blender Studio"
      year={2021}
      frame="vinyl"
      style={{ width: '100%', aspectRatio: '16 / 10' }}
    />
  );
}
```

| Prop | What it does |
| --- | --- |
| `playbackId` | a Mux public playback ID |
| `src` | or any HLS (`.m3u8`) or MP4 URL; HLS plays through hls.js, so it gets the quality menu too |
| `title`, `credit`, `year` | shown above the picture |
| `captions` | a WebVTT URL (Mux's own captions need nothing) |
| `frame` | any frame id from `src/data/borders.js` (`vinyl`, `lace`, `comic`, …) |
| `style`, `className` | give it a width and a height, or a width and an `aspectRatio`: the skin lays itself out from its own box |

`src/player/PlayboothPlayer.jsx` brings its own styles (`tokens.css`, `skin.css` and a small `embed.css` scoped to the player), so it doesn't restyle your page, and it never loads three.js: only the booth needs it. One player per page, since it shares one store, like the booth. `/embed/` (`embed/index.html` → `src/embed/`) is an ordinary page built exactly this way, as proof; the same snippet is in the showcase's **Use it** card with Copy buttons (both read `src/embed/usage.js`, so they can't drift apart).

## Design thinking (for the submission form)

> PLAYBOOTH is a booth made for play: play the game, play the film. You step into a little white booth on a quiet street, pick a tape from the rack and watch it on an old television. The Video.js skin is a photo frame with a remote beside it: the frame you choose holds the picture, and a dock of round paper keys in that frame's own colors stands at its right. The progress runs top to bottom, like scrolling a feed: hover or drag it and a reel of real frames rides beside your pointer, the moment you are on the largest and outlined. When nobody touches anything the dock steps away and the framed picture grows into the room. On a phone, full screen turns the film on its side, so both thumbs rest on the controls like a game. Press Snap on any frame and it downloads at once and waits in the booth's tray, ready to be printed in its frame or stacked into a photostrip.

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

`player/index.html` → `src/showcase/`. One screen, nothing to scroll: options beside the player (on phones, a Customize panel under it), and The idea, The brief, Keyboard, Use it and Credits open as cards over the player. The same `PlayboothSkin`, mounted in a box you size yourself:

- **Size**: six shapes (desktop 16:9, laptop 16:10, tablet 4:3, square, phone sideways 19.5:9, phone upright 9:19.5) and a width slider. The skin lays itself out from the box's own size, so this is a real test. A shape bigger than the screen (a desktop player on a phone) is laid out at its real size and shown scaled down, and the page says so.
- **Film**, **Frame** (all 30, ranked) and **Your own frame**: drop or choose a picture, fit or tile it, set the margin. The keys take the picture's average colour for their dock.
- **Playback**: autoplay (muted), loop, calm motion, key sounds, and **Dark page**.
- **Light and dark page**: the moon/sun key in the header (or Customize › Playback › Dark page) turns the whole page dark or light, so the skin can be judged against both, as the brief asks. Both logos follow it: PLAYBOOTH's wordmark and the Video.js letters switch ink; the orange "JS" stays. Remembered on the device; the first visit follows the system setting.
- **Your own frame, in the player too**: on this page the player's Frames key has an **Upload your own frame** tile under the frames. Choose a landscape picture (wider than it is tall) and it becomes the frame, selected at once, its average colour tinting the keys' dock; an upright or square picture is turned away with its size and the reason. Customize › Your own frame uses the same loader and adds Fit or Tile and a margin slider. The booth keeps its own 30 frames only.
- The left keys in the player become Frames and Surprise frame, then Scenes and Next film (there is no booth to go back to). Upright, they gather in one wide key under the dock ("Frames, film, scenes"), filled with the keys' ink so it never reads as a playback key, opening a menu upward, where the thumb already is.
- The cards: the idea (a booth made for play, vertical controls, the photostrip reel, frames as themes), the minimum requirements and accessibility tips with live measurements (key contrast for the current frame, smallest key on screen), and every keyboard shortcut.
- The Video.js mark is the official one from the `videojs/video.js` repository (`site/public/favicon.svg`).

## Mux bonus

All ten tapes are Mux assets (`src/data/movies.js`), listed below so the entry is transparent. Keep every asset **public** and **live through judging**.

| Shelf | Film | Mux playback ID |
| --- | --- | --- |
| Top | Singularity (2026) | `HcEBfBVn9gNbjtm101wUr00PBpzCNZfFwdeDfnT6j8gSI` |
| Top | Wing It! (2023) | `rCJR1vEOG00kz2ppqCanigCEtDSniE4o02xi02em6gRUL4` |
| Top | Charge (2022) | `xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg` |
| Middle | Sprite Fright (2021) | `TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs` |
| Middle | Agent 327: Operation Barbershop (2017) | `yZxPit1BWmxEWyBf01ym2Ez8dtU84Nrjjb2hAwVOYpVM` |
| Middle | Cosmos Laundromat (2015) | `7O8N1XhgouGf1WdofHO9o1d02lp3Sx56MU5b013XhBXGs` |
| Middle | Tears of Steel (2012) | `B00XyRvdblOoE022lFSoAB39hNNEX0013a9Mx8yQPQ2V01I` |
| Bottom | Sintel (2010) | `qoXh2JaPC1dQ26yr6vB6ybJqKMn2K5a5aHsIO7rtpes` |
| Bottom | Big Buck Bunny (2008) | `W02G8oHMlhhE202Uw9C02eSvmVBHA01ZDF3qusCKvQ02oiIs` |
| Bottom | Elephants Dream (2006) | `qGpuC17ZuBsL4Wwb00LDkXBEtroYB2rvV5zJGF9wnsB4` |

The shelves hold 3, 4 and 3 tapes, newest first (left to right, top to bottom), every cubby filled. Each tape wears the film's official poster (`public/covers/`): its art, in its own colours, fades softly into the tape's cream title band with the film's name, the year and "Blender Studio", so the long billing block at the poster's foot stays below the fold. The player names the studio and the year under the title; the full credit line and license still travel with every photo, and the license is on each tape's close-up.

Playback uses Video.js's `MuxVideo` with `preferPlayback: 'mse'` and `crossOrigin="anonymous"`, so screenshots read real frames in every browser that has Media Source Extensions (including iPhone on iOS 17.1+). Mux Data is attached through `@videojs/react/extensions/mux-data` and needs no key.

## How the pieces fit

| Where | What |
| --- | --- |
| `src/player/Skin.jsx` | **The skin.** Rail, frame, dock: the booth's own keys (back, snaps, album, eject) in a one-key-wide rail on the left, the framed picture taking everything in between, and on the right a full-height vertical progress plus one column of keys (time, lock, settings, captions on/off, sound, ±10 s, play, Snap, full screen; two columns only on short players such as a phone on its side). Hover or drag the progress and a reel of real frames rides beside the pointer, like YouTube's previews: the clip at the pointer is the largest, outlined, with the exact time (and a sharp frame from Mux once the pointer rests), the moments before and after smaller and quieter the further they are. The frames come from Mux's storyboard sprite (`image.mux.com/<id>/storyboard.vtt`), loaded once when a film goes in, so moving the pointer never waits on the network. Dragging also scrubs the picture itself, dimmed slightly so the reel reads first. The volume slider (led by its own "Mute M" hint card) and the settings menu open beside the whole dock, level with their keys, never over the progress; hint cards stand outside the dock too. Lock is instant: the keys go, one unlock key stays, one click brings them back. Controls step away after a few seconds of play and the picture grows (an animated FLIP). Settings has quality (every rendition the stream offers, 1080p, 720p, 480p, 360p and Auto, from Video.js's own quality feature, `useQualityOptions`), playback speed, subtitle style (font, size, color, outline or box), brightness (30–150%, the picture only) and picture-in-picture. **Scenes** (a rail key, beside Eject) opens a contact sheet of the film over the player: up to 12 stills from the Mux storyboard, sharpened by Mux thumbnails, the one playing now marked; pick one (click, tap, arrows and Enter) and the film goes there. **Feedback**: a keyboard shortcut or a click on the picture flashes a large copy of its key in the middle of the picture (play, pause, sound, mute, captions, ±5/±10, volume with its level, speed, 0–9 jumps), driven by Video.js's input-action events, so the dock's own keys, which show their state themselves, never double it. **Touch**: with the keys away a tap on the picture brings them back; with them up a tap plays or pauses, with the same large key. Hold and slide up or down on the picture: the left half sets brightness, the right half the volume, each with a level gauge beside the thumb (iPhone keeps volume for its side buttons, so there the right half says so). Upright phones lay the dock under the picture. Full screen lands in landscape on phones (orientation lock, or a CSS turn where the browser can't lock, such as iPhone Safari). Video.js `Container`, `PlayButton`, `SeekButton`, `Time`, `MuteButton`, `VolumeSlider`, `Poster`, `BufferingIndicator`, `ErrorDialog`, `Hotkey`s, `StatusAnnouncer` and the player store |
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

## Layout in landscape

Rail, frame, dock: the booth rail is one key wide, the dock is its progress plus one column of keys (two below about 470 px of height, three below 320 px, so phones on their side get two), and the framed picture takes everything in between. Keys are sized to line up with the frame. The booth keys sit together in the middle of the rail, grouped by what they do (back · snaps and album · scenes and eject; in the showcase, frames and surprise frame · scenes and next film), with a wider step between groups than between keys. Upright, they form one centred row at the top, and the title gets the whole width right above the picture. The booth opens at night every visit; the switch changes it for the visit.

## Playback performance

- While you sit and watch, the 3D room stops drawing about 1.6 s after the camera settles (it sits fully hidden behind the player), so the GPU is left to the video. All the room's animations keep ticking, so it picks up exactly where it was when you stand up; a resize while watching still draws one fresh frame.
- hls.js runs with `capLevelOnFPSDrop: false`, so a burst of dropped frames (opening full screen, a screen recorder starting) can't lock the film to a low rendition for the rest of the session, and with a 4 Mbps starting bandwidth estimate, so it opens near HD instead of climbing up from the lowest rung. On a slow connection it steps down after the first segments.
- The player faceplate is a near-opaque gradient instead of a blurred backdrop, which was a full-screen blur recomputed every frame.

## Prints in the tray

Prints land image-top towards the printer. A print that fits lies flat, turned a little, clear of the walls; a strip longer than the tray is deep lands with its bottom end on the floor at the front and its top end resting on the back rim, so it leans. Anything printed after a leaning strip lies on top of it at the same lean. Every layer sits 4.5 mm above the one below (cards are 3 mm), with a logarithmic depth buffer, so nothing passes through anything or flickers.

## Checklist against the brief

- **Works**: Video.js v10 player, Mux streams, real playback.
- **Essential controls**: play/pause, a vertical seek groove with clip previews, current time and duration, mute and volume, full screen (no black bars; landscape on phones). Also ±10 s, captions on/off, scenes, a settings menu (quality, speed, subtitle style, brightness, picture-in-picture), a lock, Snap, Snaps compiler, album, eject.
- **Sound**: synthesized key clicks with a felt low thock, a shutter, paper, tape clunk and eject, curtain and light switch sounds. One toggle mutes them all.
- **Day and night**: the sun/moon toggle in the corner of the screen (from the street to inside the booth), the switch on the booth's back wall, or L turns the whole booth to night: street lamps, shop windows and string lights come on, the room dims to lamp light, and the interface switches to its dark palette. At night the PLAYBOOTH sign lights up like neon, two street lamps and most windows come on, and the room keeps warm lamp light, so everything stays visible. A light night layer over the 3D view keeps the change clear on phones, where the renderer runs lean.
- **Frames**: 30, all pure graphics with rectangular windows and slim margins (the picture takes 73–81% of a 16:9 frame; every sticker stays in the margin, never on the film), ranked by design and uniqueness. After No frame, first the frames drawn from the references: Vinyl cream, Star confetti, Comic blocks, Lace, Red film, Lavender swirl, Red knit, Paper hearts, Airmail, Matinee, Denim & lace, Vinyl red, Comic wave, Butter doodle, Pixel lilac, Cocoa bow, Vinyl pink, Newsprint, Black strip; then the booth's own: Velvet curtain, Granny squares, Starry night, Sage checker, Cinema ticket, Postage stamp, Pressed flowers, Red polka, Linen stripe, Booth white. Each one colors its own controls, and all are drawn relative to the picture's width, so they hold up from a phone to a TV. The picker always fills its panel: its column count divides 30, so no row is half empty.
- **Snap flow**: each snap downloads the clean frame immediately and joins the Snaps compiler; print singles in any frame, or 2 to 6 as a framed photostrip.
- **Responsive**: tested at 1440×900, 1280×760, 1180×820, 820×1180, 412×915, 390×844 and 844×390, plus full screen on each. On tall phones the walk in ends facing the tapes.
- **Keyboard**: every 3D object has a focusable hotspot (tapes, slot, screen, eject, prints, album). Escape puts a tape back, steps back out of a view, or stands up from the deck. Player shortcuts (working, never printed on screen): Space/K, M, F, C, ←/→, J/L, ↑/↓, 0–9, Home/End, `<`/`>`, and S for a photo. The progress groove takes ↑/↓, Page Up/Down, Home and End when focused.
- **Readable over any video**: controls live in the dock beside the frame, not over the picture; every floating button is solid. Captions sit on the picture's lower edge with an outline or box. No pop-up status text stretches the player; state changes are announced to screen readers only.
- **Touch targets**: controls are 44×44 px, 38–40 px only inside very small players; nothing is clipped at the tested sizes.
- **Reduced motion**: the walk in becomes a quick fade, the camera cuts instead of flying, tapes and prints move instantly, idle animations stop.
- Also handles `prefers-reduced-transparency`, `prefers-contrast: more`, `forced-colors`, RTL arrow keys in the frame picker, and a no-WebGL fallback (tapes become buttons; force it with `?flat`).

## Credits and licenses

Made with love by [@ruffasakay](https://contra.com/ruffasakay). The credit is on the About card in the booth and in the footer of the showcase page.


Films, all Blender Foundation open movies, hosted on Mux:

| Film | Credit | License |
| --- | --- | --- |
| Big Buck Bunny (2008) | © 2008 Blender Foundation, www.bigbuckbunny.org | CC BY 3.0 |
| Sintel (2010) | © Blender Foundation, durian.blender.org | CC BY 3.0 |
| Agent 327: Operation Barbershop (2017) | (CC) Blender Foundation, agent327.com | CC BY-ND (played unaltered) |
| Charge (2022) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Cosmos Laundromat: First Cycle (2015) | (CC) Blender Foundation, gooseberry.blender.org | CC BY-SA 4.0 (as distributed by Blender) |
| Sprite Fright (2021) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Tears of Steel (2012) | (CC) Blender Foundation, mango.blender.org | CC BY 3.0 |
| Wing It! (2023) | (CC) Blender Foundation, studio.blender.org | CC BY 4.0 |
| Singularity (2026) | (CC) Blender Foundation, studio.blender.org | Creative Commons Attribution |
| Elephants Dream (2006) | (CC) Blender Foundation, orange.blender.org | CC BY 2.5 |

The tape covers are each film's official poster, by the Blender Foundation / Blender Studio, released with the films; on the tapes the art fades into the title band, so the billing block is left out.

Fonts: Fraunces (headings and reading text), DM Mono (interface), Caveat (handwritten notes), Atkinson Hyperlegible Next (caption sans) and Literata (caption serif), all SIL Open Font License 1.1.

All 3D models, icons and illustrations are original and drawn in code (the posters above excepted).

This entry is open source under the Apache License, Version 2.0 (full text in `LICENSE`), per the challenge guidelines: https://github.com/ruffasakay/playbooth

## Known limits

- Add `?lite` to the URL to force the lightweight renderer (no shadows or reflections); it also switches on by itself on slow devices.
- Browsers may ask once to allow multiple downloads when you snap several frames.
- Tape covers are the films' official posters from Blender Studio (`public/covers/`); a film without a `cover` falls back to a still from Mux's image API.
- The quality menu appears whenever the stream has more than one rendition (every Mux and HLS film); a plain MP4 has one, so the row is left out. On iPhone, where Safari can play HLS itself, the list follows what the engine in use reports.
- Volume can't be set by a web page on iPhone (Apple keeps it for the side buttons), so the right-half slide says so there instead of moving a level.
- Tested in headless Chromium with software rendering and phone emulation. Check on a real iPhone (Safari), an Android phone and Firefox before submitting, especially full screen turning to landscape, clip previews and sounds.
- iPhone Safari has no page full screen, so there the player fills the window itself and turns on its side; the browser bar may still show until scrolled away. Sounds on iPhone follow the ring/silent switch.
- Photos are stored in this browser only (IndexedDB). Private browsing may not keep them; the booth says so and offers download.
