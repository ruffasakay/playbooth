import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../store.js';
import { MOVIES } from '../data/movies.js';
import { BORDERS, borderById, setCustomBorder } from '../data/borders.js';
import { Player, usePlayer } from '../player/core.js';
import { FrameThumb, PlayboothSkin } from '../player/Skin.jsx';
import { Media } from '../player/PlayerLayer.jsx';
import { Hint } from '../ui/Hint.jsx';
import { Logo } from '../ui/Logo.jsx';
import { Credit } from '../ui/Credit.jsx';
import { bindSounds } from '../lib/sfx.js';
import * as I from '../player/icons.jsx';

/*
 * The PLAYBOOTH skin on its own, outside the booth: a sandbox for judges.
 * Left, the options (size, shape, film, frame, your own frame, playback).
 * Right, the player at exactly the size you set. Below, what it is, why
 * the controls stand up, and how it meets each requirement, measured live.
 */

// min: the narrowest player of that shape the side-by-side keys are designed for
const SHAPES = [
  { id: 'desktop', label: 'Desktop', ratio: 16 / 9, hint: '16:9', min: 640, start: 1120 },
  { id: 'laptop', label: 'Laptop', ratio: 16 / 10, hint: '16:10', min: 640, start: 1040 },
  { id: 'tablet', label: 'Tablet', ratio: 4 / 3, hint: '4:3', min: 600, start: 900 },
  { id: 'square', label: 'Square', ratio: 1, hint: '1:1', min: 600, start: 720 },
  { id: 'phone-side', label: 'Phone, sideways', ratio: 19.5 / 9, hint: '19.5:9', min: 667, start: 844 },
  { id: 'phone-up', label: 'Phone, upright', ratio: 9 / 19.5, hint: '9:19.5', min: 320, start: 390 },
];
const shapeOf = (id) => SHAPES.find((s) => s.id === id);

/** The Video.js mark, as published in the videojs/video.js repository (site/public/favicon.svg). */
function VideoJsMark({ size = 22 }) {
  return (
    <svg viewBox="0 0 209 209" width={size} height={size} aria-hidden="true" className="vjs-mark">
      <path fill="#ffa81b" d="M0 0h209v209H0z" />
      <path fill="#ff6200" d="M0 80h209v129H0z" />
      <path fill="#eb3132" d="M0 142h209v67H0z" />
      <path fill="#cc3566" d="M0 187h209v22H0z" />
      <path d="M167.09 104.5L65.13 169.81V39.19l101.96 65.31z" fill="#ebe4c1" />
    </svg>
  );
}

export default function Showcase() {
  // a phone opens the page upright, the way it is held
  const [shape, setShape] = useState(() => (typeof innerWidth !== 'undefined' && innerWidth < 640 ? 'phone-up' : 'desktop'));
  const [width, setWidth] = useState(() => shapeOf(typeof innerWidth !== 'undefined' && innerWidth < 640 ? 'phone-up' : 'desktop').start);
  const [room, setRoom] = useState(960);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(true);
  const stageRef = useRef(null);
  const userSized = useRef(false);
  const { ratio, min } = shapeOf(shape);

  // the booth's store, set up as a player that is already sitting there, film in
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    useApp.setState({
      host: 'showcase',
      phase: 'inside',
      station: 'watch',
      webgl: false,
      insertedTapeId: MOVIES[0].id,
      deck: 'playing',
      frameLocked: false,
      reducedMotion: rm.matches,
      coarsePointer: coarse.matches,
    });
    const sync = () => useApp.setState({ coarsePointer: coarse.matches });
    coarse.addEventListener('change', sync);
    const unbind = bindSounds();
    return () => {
      coarse.removeEventListener('change', sync);
      unbind();
    };
  }, []);

  // how much room the stage column has; the player never grows past it
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width);
      setRoom(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pickShape = (id) => {
    setShape(id);
    userSized.current = false;
    setWidth(shapeOf(id).start);
  };

  // as wide as asked, the column allows and the shape needs; wider than the column scrolls sideways
  const w = Math.max(min, Math.min(width, room));
  const h = Math.round(w / ratio);
  const wide = w > room + 1;

  return (
    <div className="sc">
      <a className="skip-link" href="#sc-player">Skip to the player</a>
      <header className="sc-top">
        <div className="sc-brand">
          <Logo size={34} />
          <span className="wordmark sc-word">PLAYBOOTH</span>
          <span className="sc-x" aria-hidden="true">×</span>
          <span className="sc-vjs">
            <VideoJsMark />
            <span>Video.js 10</span>
          </span>
        </div>
        <p className="sc-lede">
          A skin for Video.js where the controls stand up beside the picture, inside a photobooth frame. Try it at any
          size, any shape, any frame. Even your own.
        </p>
      </header>

      <main className="sc-main">
        <Options
          shape={shape}
          pickShape={pickShape}
          width={w}
          room={room}
          min={min}
          setWidth={(v) => {
            userSized.current = true;
            setWidth(v);
          }}
          height={h}
          autoplay={autoplay}
          setAutoplay={setAutoplay}
          loop={loop}
          setLoop={setLoop}
        />
        <section className="sc-stage" ref={stageRef} aria-label="Player">
          <div className="sc-size" aria-hidden="true">
            <span>{w} × {h}</span>
            <span>{SHAPES.find((s) => s.id === shape).label}</span>
          </div>
          <div className="sc-scroll" data-wide={wide || undefined}>
            <div id="sc-player" className="pb-host" data-fs-root style={{ width: w, height: h }}>
              <Player>
                <PlayboothSkin>
                  <Media />
                </PlayboothSkin>
                <Bridge autoplay={autoplay} loop={loop} />
              </Player>
            </div>
          </div>
          {wide && <p className="sc-note sc-wide">Wider than this screen: scroll the player sideways, or turn your phone.</p>}
          <TryRow />
        </section>
      </main>

      <Story />
      <Checks />
      <Keys />

      <footer className="sc-foot">
        <Credit className="sc-credit" />
        <p>
          Built with <code>@videojs/react</code> 10, films streamed from Mux through Video.js's <code>MuxVideo</code>. Films by the
          Blender Foundation, CC BY 4.0. Frames drawn in code, no text on any of them.
        </p>
      </footer>
      <Live />
      <Hint />
    </div>
  );
}

/* ---------- the options panel ---------- */

function Options({ shape, pickShape, width, room, min, setWidth, height, autoplay, setAutoplay, loop, setLoop }) {
  const film = useApp((s) => s.insertedTapeId);
  const calm = useApp((s) => s.reducedMotion);
  const sound = useApp((s) => s.sound);
  return (
    <aside className="sc-panel" aria-label="Options">
      <Group title="Size">
        <div className="sc-chips" role="radiogroup" aria-label="Shape">
          {SHAPES.map((s) => (
            <button key={s.id} type="button" role="radio" aria-checked={shape === s.id} className="sc-chip" onClick={() => pickShape(s.id)}>
              <span className="sc-shape" style={{ aspectRatio: s.ratio }} aria-hidden="true" />
              <span>{s.label}</span>
              <span className="sc-chip-sub">{s.hint}</span>
            </button>
          ))}
        </div>
        <label className="sc-range">
          <span className="sc-range-head">
            <span>Width</span>
            <output>{width} px</output>
          </span>
          <input type="range" min={min} max={Math.max(min, room)} step={2} value={Math.min(width, Math.max(min, room))} onChange={(e) => setWidth(+e.target.value)} />
        </label>
        <p className="sc-note">
          Height follows the shape: {height} px. The skin lays itself out from the player's own size, so this is a real test,
          not a zoom.{shape !== 'phone-up' ? ` This shape starts at ${min} px, the narrowest player with keys on both sides.` : ''}
        </p>
      </Group>

      <Group title="Film">
        <label className="sc-select">
          <span className="sr-only">Film</span>
          <select value={film ?? ''} onChange={(e) => useApp.setState({ insertedTapeId: e.target.value, deck: 'playing' })}>
            {MOVIES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.year})
              </option>
            ))}
          </select>
        </label>
      </Group>

      <FramesGroup />

      <Group title="Playback">
        <Switch label="Autoplay, muted" checked={autoplay} onChange={setAutoplay} />
        <Switch label="Loop the film" checked={loop} onChange={setLoop} />
        <Switch label="Calm motion" checked={calm} onChange={(v) => useApp.setState({ reducedMotion: v })} />
        <Switch label="Key sounds" checked={sound} onChange={() => useApp.getState().toggleSound()} />
      </Group>
    </aside>
  );
}

function Group({ title, children }) {
  return (
    <section className="sc-group">
      <h2 className="sc-group-title">{title}</h2>
      {children}
    </section>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <label className="sc-switch">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="sc-switch-track" aria-hidden="true" />
    </label>
  );
}

/** Every frame, ranked, plus a slot for your own picture. */
function FramesGroup() {
  const borderId = useApp((s) => s.borderId);
  const [custom, setCustom] = useState(null); // { image, url, tone }
  const [mode, setMode] = useState('fit');
  const [pad, setPad] = useState(0.1);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);
  const current = borderById(borderId);

  // rebuild "your frame" whenever its picture, fit or margin changes
  useEffect(() => {
    if (!custom) return;
    setCustomBorder({ image: custom.image, mode, pad, tone: custom.tone });
    useApp.setState((s) => ({ borderId: 'custom', borderRev: s.borderRev + 1 }));
  }, [custom, mode, pad]);

  const load = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      useApp.getState().announce('That picture could not be opened.');
      return;
    }
    setCustom({ image, url, tone: averageTone(image) });
    useApp.getState().announce('Your frame is on.');
  };

  return (
    <Group title="Frame">
      <p className="sc-current" aria-live="polite">
        <b>{current.name}</b>
        <span>{current.hint}</span>
      </p>
      <div className="sc-frames" role="radiogroup" aria-label="Frames">
        {BORDERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={borderId === b.id}
            aria-label={b.name}
            data-tip={b.name}
            className="sc-frame"
            onClick={() => useApp.setState({ borderId: b.id })}
          >
            <FrameThumb border={b} />
            {i > 0 && <span className="sc-rank" aria-hidden="true">{i}</span>}
          </button>
        ))}
      </div>
      <p className="sc-note">Ranked best first: frames drawn from your references, then the booth's own.</p>

      <div
        className="sc-drop"
        data-drag={drag || undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          load(e.dataTransfer.files?.[0]);
        }}
      >
        {custom ? (
          <button type="button" className="sc-own" aria-pressed={borderId === 'custom'} onClick={() => useApp.setState({ borderId: 'custom' })}>
            <img src={custom.url} alt="" />
            <span>Your frame</span>
          </button>
        ) : (
          <span className="sc-drop-icon" aria-hidden="true">
            <I.Frames />
          </span>
        )}
        <div className="sc-drop-copy">
          <b>Use your own frame</b>
          <span>Drop a picture here, or</span>
          <button type="button" className="btn sc-upload" onClick={() => input.current?.click()}>
            {custom ? 'Choose another' : 'Choose a picture'}
          </button>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0])} />
        </div>
      </div>
      {custom && (
        <div className="sc-own-opts">
          <div className="sc-seg" role="radiogroup" aria-label="How the picture fills the frame">
            {[
              ['fit', 'Fit', 'Stretched once around the film'],
              ['tile', 'Tile', 'Repeated, so it fits any shape'],
            ].map(([id, label, tip]) => (
              <button key={id} type="button" role="radio" aria-checked={mode === id} data-tip={tip} onClick={() => setMode(id)}>
                {label}
              </button>
            ))}
          </div>
          <label className="sc-range">
            <span className="sc-range-head">
              <span>Margin</span>
              <output>{Math.round(pad * 100)}%</output>
            </span>
            <input type="range" min={0.04} max={0.22} step={0.01} value={pad} onChange={(e) => setPad(+e.target.value)} />
          </label>
        </div>
      )}
    </Group>
  );
}

/** The picture's average colour, so the keys' dock matches it. */
function averageTone(image) {
  try {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(image, 0, 0, 16, 16);
    const d = g.getImageData(0, 0, 16, 16).data;
    let r = 0;
    let gr = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      gr += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4;
    const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(gr)}${hex(b)}`;
  } catch {
    return null;
  }
}

/* ---------- the player's helpers ---------- */

/** Autoplay (muted, as browsers require) and loop, applied to whichever film is in. */
function Bridge({ autoplay, loop }) {
  const store = usePlayer();
  const video = useApp((s) => s.videoEl);
  const film = useApp((s) => s.insertedTapeId);
  useEffect(() => {
    if (!video) return undefined;
    video.loop = loop;
    if (!autoplay) return undefined;
    const go = () => {
      video.muted = true;
      try {
        store.play()?.catch?.(() => {});
      } catch {
        /* not ready */
      }
    };
    if (video.readyState >= 2) go();
    video.addEventListener('loadeddata', go, { once: true });
    return () => video.removeEventListener('loadeddata', go);
  }, [video, film, autoplay, loop, store]);
  return null;
}

function TryRow() {
  const coarse = useApp((s) => s.coarsePointer);
  return (
    <ul className="sc-try" aria-label="Things to try">
      {coarse ? (
        <>
          <li>Drag the progress column: the clip reel follows your thumb</li>
          <li>Tap the picture to tuck the keys away</li>
          <li>Full screen turns your phone to landscape</li>
        </>
      ) : (
        <>
          <li>
            Rest the mouse on the progress column <span className="sc-dim">for the clip reel</span>
          </li>
          <li>
            <kbd>Tab</kbd> through the keys <span className="sc-dim">for the focus ring</span>
          </li>
          <li>
            <kbd>F</kbd> full screen, <kbd>S</kbd> snap a frame
          </li>
        </>
      )}
    </ul>
  );
}

function Live() {
  const message = useApp((s) => s.message);
  const token = useApp((s) => s.messageToken);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!token) return undefined;
    setText('');
    const id = setTimeout(() => setText(message), 60);
    return () => clearTimeout(id);
  }, [token, message]);
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  );
}

/* ---------- the story ---------- */

function Story() {
  return (
    <section className="sc-story" aria-labelledby="sc-story-title">
      <h2 id="sc-story-title" className="sc-h2">
        The idea
      </h2>
      <div className="sc-cards">
        <article className="sc-card sc-card--play">
          <p className="sc-badge">Play ×2</p>
          <h3>A name that plays twice</h3>
          <p>
            PLAYBOOTH is <b>play</b> as in a game: you walk into a little booth, pick a tape off the shelf and slide it into the
            player. And <b>play</b> as in a film: you watch, snap the frames you love and print them as a photostrip. This page is
            the second half on its own: the player.
          </p>
        </article>
        <article className="sc-card">
          <p className="sc-badge">Mobile first</p>
          <h3>Controls that stand up</h3>
          <p>
            Hold a phone sideways and your thumbs rest on its two short edges, not along the bottom. So the keys stand in columns
            beside the picture: progress and playback under the right thumb, frames and films under the left, nothing on the
            film itself. Turn the phone upright and the same keys lie down under the picture.
          </p>
          <p>
            On a desktop it is a new way to move through a film: the timeline is a column you run your mouse down, and the
            picture keeps its full width because the keys live in the margin a wide screen already has.
          </p>
        </article>
        <article className="sc-card">
          <p className="sc-badge">The reel</p>
          <h3>A clip carousel you scroll like a feed</h3>
          <p>
            Rest on the progress column, or drag it, and a reel of stills slides out beside it: the moment you are on is outlined,
            the moments before and after stack above and below, so finding a scene feels like scrolling. Let go and the film jumps
            there. Stills come from Mux's thumbnail service for each film.
          </p>
        </article>
        <article className="sc-card">
          <p className="sc-badge">Frames</p>
          <h3>The frame is the theme</h3>
          <p>
            Every frame carries its own key colours, so the controls always match what surrounds the film. The keys stay solid
            and never sit over the picture, so any film, bright or dark, leaves them readable. Upload your own picture and it
            becomes a frame too, fitted or tiled.
          </p>
        </article>
      </div>
    </section>
  );
}

/* ---------- requirements, measured where they can be ---------- */

function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la == null || lb == null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Live numbers from the player as it is right now. */
function useMeasures() {
  const borderId = useApp((s) => s.borderId);
  useApp((s) => s.borderRev);
  const [m, setM] = useState({ smallest: 0, count: 0 });
  useEffect(() => {
    const read = () => {
      const keys = [...document.querySelectorAll('.pb-host .pb-dock .pb-btn, .pb-host .pb-rail .pb-btn')].filter((e) => e.offsetParent);
      const sizes = keys.map((e) => {
        const r = e.getBoundingClientRect();
        return Math.min(r.width, r.height);
      });
      setM({ smallest: sizes.length ? Math.round(Math.min(...sizes)) : 0, count: keys.length });
    };
    read();
    const id = setInterval(read, 1200);
    return () => clearInterval(id);
  }, [borderId]);
  const ui = borderById(borderId).ui;
  return { ...m, ratio: contrast(ui.surface, ui.ink), playRatio: contrast(ui.playKey?.[0] ?? ui.ink, ui.playKey?.[1] ?? ui.surface) };
}

function Checks() {
  const { smallest, count, ratio, playRatio } = useMeasures();
  const calm = useApp((s) => s.reducedMotion);
  const focusPlayer = () => {
    const el = document.querySelector('.pb-host .pb-play');
    el?.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
    el?.focus({ preventScroll: true });
  };
  const fmt = (r) => (r ? `${r.toFixed(1)}:1` : 'n/a');
  const REQ = [
    {
      title: 'Works',
      text: (
        <>
          A real Video.js 10 player: <code>createPlayer</code> with <code>videoFeatures</code> from <code>@videojs/react</code>, the
          films streamed by <code>MuxVideo</code>. Every playback key talks to the Video.js store: play, seek, volume, captions,
          speed, picture-in-picture, full screen. Only the frame, film, lock and snap keys are the booth's own.
        </>
      ),
      live: 'Press play in the player',
    },
    {
      title: 'Has essential controls',
      text: 'Play and pause, a progress column with the time and the clip reel, back and forward 10 seconds, sound and volume, captions, settings (speed, caption style, picture-in-picture), lock, snap and full screen.',
      live: `${count} keys on screen now`,
    },
    {
      title: 'Is responsive',
      text: 'Laid out from the player’s own size, not the window. Wide: keys stand in one, two or three columns depending on height, the frame’s other side mirrors them. Tall: the keys lie down under the picture. Full screen on a phone asks for landscape, and turns the picture itself where the browser can’t.',
      live: 'Change the shape and width above',
    },
    {
      title: 'Works with a keyboard',
      text: 'Every key is a real button in a sensible Tab order, the progress column is a slider (arrows, Page Up and Down, Home and End), and the shortcuts below work whenever the player has focus.',
      live: 'Focus the play key',
      action: focusPlayer,
    },
  ];
  const TIPS = [
    {
      title: 'Readable over any video',
      text: 'The keys never sit on the picture. They stand on the frame or the dark stage around it, as solid paper keys with dark icons. Captions sit in their own layer, with an outline or a box, and a size and colour you choose.',
      live: `Key contrast in this frame ${fmt(ratio)}, play key ${fmt(playRatio)}`,
    },
    {
      title: 'Easy to tap',
      text: 'Keys are 38 to 58 px across, larger when there is room, the play key largest of all, with at least 6 px between them.',
      live: smallest ? `Smallest key right now: ${smallest} px` : 'Measuring…',
    },
    {
      title: 'Visible focus',
      text: 'Keyboard focus draws a double ring inside the key, in its icon colour and its paper colour, so it shows against any frame and is never clipped by its neighbours.',
      live: 'Press Tab inside the player',
      action: focusPlayer,
    },
    {
      title: 'Calm on request',
      text: 'With reduced motion asked for, by your system or the switch on this page: the picture stops gliding when the keys step away, menus appear without moving, the snap flash is one soft step, and in the booth the camera holds still.',
      live: calm ? 'Calm motion is on' : 'Calm motion is off',
    },
  ];
  return (
    <section className="sc-checks" aria-labelledby="sc-checks-title">
      <h2 id="sc-checks-title" className="sc-h2">
        How it meets the brief
      </h2>
      <div className="sc-check-cols">
        <CheckList title="Minimum requirements" items={REQ} />
        <CheckList title="Accessibility" items={TIPS} />
      </div>
    </section>
  );
}

function CheckList({ title, items }) {
  return (
    <div className="sc-checklist">
      <h3 className="sc-h3">{title}</h3>
      <ol>
        {items.map((it) => (
          <li key={it.title} className="sc-check">
            <span className="sc-tick" aria-hidden="true">
              <I.Check />
            </span>
            <div>
              <h4>{it.title}</h4>
              <p>{it.text}</p>
              {it.action ? (
                <button type="button" className="sc-live sc-live--btn" onClick={it.action}>
                  {it.live}
                </button>
              ) : (
                <p className="sc-live">{it.live}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const SHORTCUTS = [
  [['Space', 'K'], 'Play or pause'],
  [['J', 'L'], 'Back or forward 10 seconds'],
  [['←', '→'], 'Back or forward 5 seconds'],
  [['↑', '↓'], 'Volume'],
  [['M'], 'Sound on or off'],
  [['C'], 'Captions'],
  [['<', '>'], 'Slower or faster'],
  [['0', '9'], 'Jump to 0% … 90%'],
  [['Home', 'End'], 'Start or end'],
  [['I'], 'Picture-in-picture'],
  [['S'], 'Snap the frame on screen'],
  [['F'], 'Full screen'],
  [['Esc'], 'Leave full screen'],
];

function Keys() {
  return (
    <section className="sc-keys" aria-labelledby="sc-keys-title">
      <h2 id="sc-keys-title" className="sc-h2">
        Keyboard
      </h2>
      <dl className="sc-keylist">
        {SHORTCUTS.map(([keys, what]) => (
          <div key={what}>
            <dt>
              {keys.map((k, i) => (
                <span key={k}>
                  {i > 0 && <span className="sc-dim"> {k === '9' ? '–' : '/'} </span>}
                  <kbd>{k}</kbd>
                </span>
              ))}
            </dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

