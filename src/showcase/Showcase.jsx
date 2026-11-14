import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useApp } from '../store.js';
import { MOVIES } from '../data/movies.js';
import { BORDERS, borderById, setCustomBorder } from '../data/borders.js';
import { Player, usePlayer } from '../player/core.js';
import { FrameThumb, PlayboothSkin } from '../player/Skin.jsx';
import { Media } from '../player/PlayerLayer.jsx';
import { Hint } from '../ui/Hint.jsx';
import { Logotype } from '../ui/Logo.jsx';
import { Credit, REPO } from '../ui/Credit.jsx';
import { PlayTwice } from '../ui/PlayTwice.jsx';
import { bindSounds } from '../lib/sfx.js';
import * as I from '../player/icons.jsx';

/*
 * The PLAYBOOTH skin on its own, outside the booth: a sandbox for judges,
 * in one screen with nothing to scroll. The options sit in a panel beside
 * the player (under it on phones, opened from the bar at the bottom); the
 * idea, the brief, the keys and the credits open as cards over it.
 */

// min: the narrowest player of that shape with keys on both sides
const SHAPES = [
  { id: 'desktop', label: 'Desktop', ratio: 16 / 9, hint: '16:9', min: 640 },
  { id: 'laptop', label: 'Laptop', ratio: 16 / 10, hint: '16:10', min: 640 },
  { id: 'tablet', label: 'Tablet', ratio: 4 / 3, hint: '4:3', min: 600 },
  { id: 'square', label: 'Square', ratio: 1, hint: '1:1', min: 600 },
  { id: 'phone-side', label: 'Phone, sideways', ratio: 19.5 / 9, hint: '19.5:9', min: 667 },
  { id: 'phone-up', label: 'Phone, upright', ratio: 9 / 19.5, hint: '9:19.5', min: 300 },
];
const shapeOf = (id) => SHAPES.find((s) => s.id === id);

const SHEETS = [
  { id: 'idea', label: 'The idea', short: 'Idea', Icon: I.Tape },
  { id: 'brief', label: 'The brief', short: 'Brief', Icon: I.Check },
  { id: 'keys', label: 'Keyboard', short: 'Keys', Icon: I.Keyboard },
  { id: 'credits', label: 'Credits', short: 'Credits', Icon: I.Heart },
];

/** The Video.js wordmark, as supplied (the official letter logo), drawn inline so it stays crisp at any size. */
function VideoJsLogo() {
  return (
    <svg className="sc-vjs" viewBox="0 0 225 40" role="img" aria-label="Video.js">
      <path d="M52.1796 0V8.79878H41.8848V0H52.1796ZM52.1796 11.1247V38.9594H41.8848V11.1247H52.1796Z" fill="#111111" />
      <path d="M28.6137 0V30.6503L12.3047 0H0L20.743 38.9748H28.6137H33.0477H38.9085V0H28.6137Z" fill="#111111" />
      <path d="M88.4338 0V38.9748H69.2097C61.3697 38.9748 55.1406 31.0482 55.1406 23.8256C55.1406 15.6083 60.8787 8.81408 69.0102 8.81408H75.7762V17.6129H72.4469C68.8721 17.6129 65.9264 20.4438 65.9264 23.9174C65.9264 27.391 68.8261 30.176 72.4009 30.176H78.139V0H88.4338Z" fill="#111111" />
      <path d="M124.918 38.9748H107.519C98.6975 38.9748 90.9956 33.2518 90.9956 23.7644C90.9956 16.0368 98.2986 8.79886 107.565 8.79886H124.918V17.5976L118.06 27.6206H106.399L113.656 17.5976H108.363C104.436 17.5976 101.797 20.1378 101.797 23.6573C101.797 27.4217 104.742 30.1608 108.363 30.1608H124.933V38.9595L124.918 38.9748Z" fill="#111111" />
      <path d="M144.159 40.0002C134.846 40.0002 126.469 33.5886 126.469 23.9176C126.469 14.2466 135.091 7.78906 144.22 7.78906C153.349 7.78906 161.864 14.2925 161.864 23.9176C161.864 33.5427 153.425 40.0002 144.174 40.0002H144.159ZM137.239 23.9023C137.239 28.2022 140.231 31.1862 144.205 31.1862C148.178 31.1862 151.063 28.2022 151.063 23.9023C151.063 19.6024 148.224 16.5725 144.251 16.5725C140.277 16.5725 137.239 19.6942 137.239 23.9023Z" fill="#111111" />
      <path d="M210.515 14.7819H204.24C202.522 14.7819 201.141 13.9556 201.141 12.2571C201.141 10.5585 202.476 9.88523 204.148 9.85463H204.884H221.286V0H203.765C197.167 0 190.34 4.68248 190.34 12.1806C190.34 19.6787 197.167 24.0857 203.765 24.0857H210.04C211.789 24.0857 213.2 24.8814 213.2 26.6259C213.2 28.3703 211.773 29.1354 210.04 29.1354H190.555V38.9748H210.531C217.158 38.9748 224.017 34.7513 224.017 26.6259C224.017 19.0666 217.158 14.7666 210.531 14.7666L210.515 14.7819Z" fill="#FF5A1F" />
      <path d="M176.792 21.5149C176.792 23.5654 175.703 29.1201 169.643 29.1354H163V38.9901L170.932 39.0666H172.895C181.963 39.0513 187.363 33.2211 187.363 22.8768V0H176.792V21.5149Z" fill="#FF5A1F" />
    </svg>
  );
}

const narrowQuery = typeof matchMedia !== 'undefined' ? matchMedia('(max-width: 899px)') : null;
function useNarrow() {
  const [narrow, setNarrow] = useState(() => !!narrowQuery?.matches);
  useEffect(() => {
    if (!narrowQuery) return undefined;
    const on = () => setNarrow(narrowQuery.matches);
    narrowQuery.addEventListener('change', on);
    return () => narrowQuery.removeEventListener('change', on);
  }, []);
  return narrow;
}

export default function Showcase() {
  const narrow = useNarrow();
  const [shape, setShape] = useState(() => (narrowQuery?.matches && innerWidth < innerHeight ? 'phone-up' : 'desktop'));
  const [width, setWidth] = useState(null); // null: as large as the stage allows
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(true);
  const [sheet, setSheet] = useState(null);
  const [tools, setTools] = useState(false); // phones: the options panel under the player
  const [custom, setCustom] = useState(null);
  const stageRef = useRef(null);
  const { ratio, min } = shapeOf(shape);

  // the booth's store, set up as a player that is already sitting there, film in
  useEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    document.documentElement.dataset.theme = 'day';
    useApp.setState({
      host: 'showcase',
      theme: 'day',
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

  // the stage's room, both ways: the player is the largest box of its shape that fits
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setStage({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitW = Math.floor(Math.min(stage.w, stage.h * ratio));
  const maxW = Math.max(min, fitW);
  const w = Math.max(min, Math.min(width ?? maxW, maxW));
  const h = Math.round(w / ratio);
  // a shape bigger than the screen (a desktop player on a phone) is laid out at its real size and shown smaller
  const pseudo = useApp((st) => st.pseudoFs);
  const scale = pseudo || !stage.w ? 1 : Math.min(1, stage.w / w, stage.h / h);

  const pickShape = (id) => {
    setShape(id);
    setWidth(null);
  };
  const open = useCallback((id) => {
    setSheet(id);
    setTools(false);
  }, []);

  return (
    <div className="sc" data-tools={tools || undefined}>
      <a className="skip-link" href="#sc-player">Skip to the player</a>
      <header className="sc-top">
        <div className="sc-brand">
          {/* the name takes you back to the booth itself */}
          <a className="sc-home" href="/" data-tip="Step into the booth" data-tip-side="bottom" aria-label="PLAYBOOTH, back to the booth">
            <Logotype className="sc-word" />
          </a>
          <span className="sc-x" aria-hidden="true">×</span>
          <a className="sc-vjs-link" href="https://videojs.org/" target="_blank" rel="noopener noreferrer" data-tip="Video.js, the player inside" data-tip-side="bottom">
            <VideoJsLogo />
          </a>
        </div>
        <nav className="sc-nav" aria-label="About this skin">
          {SHEETS.map(({ id, label }) => (
            <button key={id} type="button" className="sc-navbtn" aria-pressed={sheet === id} onClick={() => open(sheet === id ? null : id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="sc-main">
        {(!narrow || tools) && (
          <Options
            narrow={narrow}
            shape={shape}
            pickShape={pickShape}
            width={w}
            min={min}
            max={maxW}
            setWidth={setWidth}
            height={h}
            autoplay={autoplay}
            setAutoplay={setAutoplay}
            loop={loop}
            setLoop={setLoop}
            custom={custom}
            setCustom={setCustom}
            close={() => setTools(false)}
          />
        )}
        <section className="sc-stage" aria-label="Player">
          <div className="sc-size" aria-hidden="true">
            <span>
              {w} × {h} px
            </span>
            <span>{shapeOf(shape).label}</span>
          </div>
          <div className="sc-room" ref={stageRef}>
            <div className="sc-fit" style={{ width: w * scale, height: h * scale }}>
              <div id="sc-player" className="pb-host" data-fs-root style={{ width: w, height: h, transform: scale < 1 ? `scale(${scale})` : undefined }}>
                <Player>
                  <PlayboothSkin>
                    <Media />
                  </PlayboothSkin>
                  <Bridge autoplay={autoplay} loop={loop} />
                </Player>
              </div>
            </div>
          </div>
          {scale < 0.995 && (
            <p className="sc-over">
              Shown at {Math.round(scale * 100)}% to fit this screen. The layout is the real {w} × {h} one.
            </p>
          )}
        </section>
        {sheet && <Sheet id={sheet} close={() => setSheet(null)} />}
      </main>

      <nav className="sc-bar" aria-label="Sections">
        <button type="button" className="sc-barbtn" aria-pressed={tools} onClick={() => (setSheet(null), setTools((t) => !t))}>
          <I.Frames />
          <span>Customize</span>
        </button>
        {SHEETS.map(({ id, short, Icon }) => (
          <button key={id} type="button" className="sc-barbtn" aria-pressed={sheet === id} onClick={() => open(sheet === id ? null : id)}>
            <Icon />
            <span>{short}</span>
          </button>
        ))}
      </nav>
      <Live />
      <Hint />
    </div>
  );
}

/* ---------- the options: one section open at a time, so it never needs scrolling ---------- */

function Options({ narrow, shape, pickShape, width, min, max, setWidth, height, autoplay, setAutoplay, loop, setLoop, custom, setCustom, close }) {
  const [openId, setOpenId] = useState('size');
  const film = useApp((s) => s.insertedTapeId);
  const calm = useApp((s) => s.reducedMotion);
  const sound = useApp((s) => s.sound);
  const borderId = useApp((s) => s.borderId);
  const movie = MOVIES.find((m) => m.id === film);
  const sections = [
    {
      id: 'size',
      title: 'Size',
      value: `${shapeOf(shape).label}, ${width} px`,
      body: (
        <>
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
              <output>
                {width} × {height}
              </output>
            </span>
            <input type="range" min={min} max={max} step={2} value={width} onChange={(e) => setWidth(+e.target.value)} disabled={max <= min} />
          </label>
          <p className="sc-note">The skin lays itself out from the player's own size: a real test, not a zoom.</p>
        </>
      ),
    },
    {
      id: 'play',
      title: 'Playback',
      value: [autoplay && 'autoplay', loop && 'loop', calm && 'calm'].filter(Boolean).join(', ') || 'default',
      body: (
        <>
          <Switch label="Autoplay, muted" checked={autoplay} onChange={setAutoplay} />
          <Switch label="Loop the film" checked={loop} onChange={setLoop} />
          <Switch label="Calm motion" checked={calm} onChange={(v) => useApp.setState({ reducedMotion: v })} />
          <Switch label="Key sounds" checked={sound} onChange={() => useApp.getState().toggleSound()} />
        </>
      ),
    },
    {
      id: 'film',
      title: 'Film',
      value: movie?.title,
      body: (
        <div className="sc-films" role="radiogroup" aria-label="Film">
          {MOVIES.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={film === m.id} className="sc-film" onClick={() => useApp.setState({ insertedTapeId: m.id, deck: 'playing' })}>
              <span>{m.title}</span>
              <span className="sc-chip-sub">{m.year}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'frame',
      title: 'Frame',
      value: borderById(borderId).name,
      body: <Frames />,
    },
    {
      id: 'own',
      title: 'Your own frame',
      value: custom ? 'On' : 'Upload a picture',
      body: <OwnFrame custom={custom} setCustom={setCustom} />,
    },
  ];
  return (
    <aside className="sc-panel" aria-label="Options">
      {narrow && (
        <div className="sc-panel-head">
          <b>Customize</b>
          <button type="button" className="sc-close" onClick={close} aria-label="Close the options">
            <I.Chevron />
          </button>
        </div>
      )}
      {narrow ? (
        // phones: the sections become tabs, one row, the open one below
        <>
          <div className="sc-tabs" role="tablist" aria-label="Options">
            {sections.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={(openId ?? 'size') === s.id} className="sc-tab" onClick={() => setOpenId(s.id)}>
                {s.title === 'Your own frame' ? 'Upload' : s.title}
              </button>
            ))}
          </div>
          <div className="sc-tabpanel" role="tabpanel">
            {(sections.find((s) => s.id === openId) ?? sections[0]).body}
          </div>
        </>
      ) : (
        sections.map((s) => (
          <section key={s.id} className="sc-acc" data-open={openId === s.id || undefined}>
            <h2 className="sc-acc-h">
              <button type="button" aria-expanded={openId === s.id} onClick={() => setOpenId(openId === s.id ? null : s.id)}>
                <span className="sc-acc-title">{s.title}</span>
                <span className="sc-acc-value">{s.value}</span>
                <I.Chevron />
              </button>
            </h2>
            {openId === s.id && <div className="sc-acc-body">{s.body}</div>}
          </section>
        ))
      )}
    </aside>
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

/** Every frame, ranked best first. */
function Frames() {
  const borderId = useApp((s) => s.borderId);
  const current = borderById(borderId);
  return (
    <>
      <div className="sc-frames" role="radiogroup" aria-label="Frames">
        {BORDERS.map((b, i) => (
          <button key={b.id} type="button" role="radio" aria-checked={borderId === b.id} aria-label={`${i}. ${b.name}`} data-tip={b.name} className="sc-frame" onClick={() => useApp.setState({ borderId: b.id })}>
            <FrameThumb border={b} />
          </button>
        ))}
      </div>
      <p className="sc-current" aria-live="polite">
        <b>{current.name}</b> <span>{current.hint}</span>
      </p>
    </>
  );
}

function OwnFrame({ custom, setCustom }) {
  const borderId = useApp((s) => s.borderId);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  // rebuild "your frame" whenever its picture, fit or margin changes
  useEffect(() => {
    if (!custom) return;
    setCustomBorder({ image: custom.image, mode: custom.mode, pad: custom.pad, tone: custom.tone });
    useApp.setState((s) => ({ borderId: 'custom', borderRev: s.borderRev + 1 }));
  }, [custom]);

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
    setCustom({ image, url, tone: averageTone(image), mode: custom?.mode ?? 'fit', pad: custom?.pad ?? 0.06 });
    useApp.getState().announce('Your frame is on.');
  };
  const set = (patch) => setCustom((c) => ({ ...c, ...patch }));

  return (
    <>
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
          <button type="button" className="sc-own" aria-pressed={borderId === 'custom'} onClick={() => useApp.setState({ borderId: 'custom' })} data-tip="Use your frame">
            <img src={custom.url} alt="Your picture" />
          </button>
        ) : (
          <span className="sc-drop-icon" aria-hidden="true">
            <I.Frames />
          </span>
        )}
        <div className="sc-drop-copy">
          <b>Any picture becomes a frame</b>
          <span>Drop it here, or</span>
          <button type="button" className="btn sc-upload" onClick={() => input.current?.click()}>
            {custom ? 'Choose another' : 'Choose a picture'}
          </button>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0])} />
        </div>
      </div>
      {custom && (
        <>
          <div className="sc-seg" role="radiogroup" aria-label="How the picture fills the frame">
            {[
              ['fit', 'Fit', 'Scaled to cover, never stretched'],
              ['tile', 'Tile', 'Repeated, so it fits any shape'],
            ].map(([id, label, tip]) => (
              <button key={id} type="button" role="radio" aria-checked={custom.mode === id} data-tip={tip} onClick={() => set({ mode: id })}>
                {label}
              </button>
            ))}
          </div>
          <label className="sc-range">
            <span className="sc-range-head">
              <span>Margin</span>
              <output>{Math.round(custom.pad * 100)}%</output>
            </span>
            <input type="range" min={0.03} max={0.16} step={0.01} value={custom.pad} onChange={(e) => set({ pad: +e.target.value })} />
          </label>
        </>
      )}
      {!custom && <p className="sc-note">Fit scales it to cover the frame, keeping its proportions; Tile repeats it, so it suits any shape. The keys take its average colour.</p>}
    </>
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

/* ---------- the cards that open over the player ---------- */

function Sheet({ id, close }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('.sc-sheet-back')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, close]);
  const title = SHEETS.find((s) => s.id === id).label;
  return (
    <section ref={ref} className="sc-sheet" data-sheet={id} role="dialog" aria-modal="false" aria-labelledby="sc-sheet-title">
      <header className="sc-sheet-head">
        <button type="button" className="float-btn sc-sheet-back" onClick={close} data-tip="Back to the player" data-key="Esc">
          <I.Back />
          <span>Player</span>
        </button>
        <h2 id="sc-sheet-title" className="sc-sheet-title">
          {title}
        </h2>
        <span aria-hidden="true" />
      </header>
      <div className="sc-sheet-body">
        {id === 'idea' && <Idea />}
        {id === 'brief' && <Brief close={close} />}
        {id === 'keys' && <Keys />}
        {id === 'credits' && <Credits />}
      </div>
    </section>
  );
}

const IDEAS = [
  {
    badge: 'Play ×2',
    title: 'A booth made for play, both kinds',
    text: (
      <>
        A photobooth is a little room you step into. PLAYBOOTH is one made for <b>play</b>. <b>Play the game:</b> walk in, pick a tape
        off the shelf, slide it into the player. <b>Play the film:</b> watch, snap the frames you love, print them as a photostrip.
        This page is its player, on its own.
      </>
    ),
    art: true,
  },
  {
    badge: 'Mobile first',
    title: 'Controls that stand up',
    text: (
      <>
        Hold a phone sideways and your thumbs rest on its short edges, so the keys stand in columns beside the picture: progress
        and playback under the right thumb, frames and films under the left, nothing on the film. Upright, they lie down under
        it. On a desktop the timeline becomes a column you run your mouse down, and the picture keeps its full width.
      </>
    ),
  },
  {
    badge: 'The reel',
    title: 'A reel that rides your pointer',
    text: (
      <>
        Hover the progress column and a reel of real frames rides beside your pointer: the moment you point at is the largest,
        outlined, with its time; the moments before and after shrink and fade the further they are. Drag and the picture itself
        scrubs too. The frames come from Mux's storyboard, loaded once, so it never waits on the network.
      </>
    ),
  },
  {
    badge: 'Frames',
    title: 'The frame is the theme',
    text: (
      <>
        Every frame carries its own key colours, so the controls match what surrounds the film, and the keys stay solid and off
        the picture, so any film leaves them readable. Upload a picture and it becomes a frame too.
      </>
    ),
  },
];

function Idea() {
  const [i, setI] = useState(0);
  return (
    <div className="sc-idea">
      <div className="sc-cards">
        {IDEAS.map((c, k) => (
          <article key={c.title} className="sc-card" data-play={c.art || undefined} data-on={k === i || undefined}>
            {c.art && <PlayTwice className="sc-card-art" size={120} />}
            <p className="sc-badge">{c.badge}</p>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </article>
        ))}
      </div>
      {/* phones: one card at a time */}
      <div className="sc-pager">
        <button type="button" className="pb-btn sc-pg" aria-label="Previous" onClick={() => setI((i + IDEAS.length - 1) % IDEAS.length)}>
          <I.Back />
        </button>
        <span className="sc-dots" aria-live="polite">
          {IDEAS.map((c, k) => (
            <span key={c.title} data-on={k === i || undefined} />
          ))}
          <span className="sr-only">
            {i + 1} of {IDEAS.length}
          </span>
        </span>
        <button type="button" className="pb-btn sc-pg sc-pg--next" aria-label="Next" onClick={() => setI((i + 1) % IDEAS.length)}>
          <I.Back />
        </button>
      </div>
    </div>
  );
}

/* requirements, measured where they can be */

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

function Brief({ close }) {
  const { smallest, count, ratio, playRatio } = useMeasures();
  const calm = useApp((s) => s.reducedMotion);
  const [tab, setTab] = useState('req');
  const focusPlayer = () => {
    close();
    requestAnimationFrame(() => document.querySelector('.pb-host .pb-play')?.focus({ preventScroll: true }));
  };
  const fmt = (r) => (r ? `${r.toFixed(1)}:1` : 'n/a');
  const REQ = [
    {
      title: 'Works',
      text: (
        <>
          A real Video.js 10 player (<code>createPlayer</code>, <code>videoFeatures</code>, <code>@videojs/react</code>), films streamed
          by <code>MuxVideo</code>. Playback keys use the Video.js store; frame, film, lock and snap keys are the booth's own.
        </>
      ),
      live: 'Press play',
      action: focusPlayer,
    },
    {
      title: 'Has essential controls',
      text: 'Play, a progress column with time and clip reel, ±10 s, sound and volume, captions, settings (speed, caption style, picture-in-picture), lock, snap, full screen.',
      live: `${count} keys on screen now`,
    },
    {
      title: 'Is responsive',
      text: 'Laid out from the player’s own size. Wide: one column of keys each side, two only when the height is short, three when very short. Tall: the keys lie under the picture. Phones go landscape in full screen.',
      live: 'Change the size in Customize',
    },
    {
      title: 'Works with a keyboard',
      text: 'Real buttons in Tab order, a progress slider (arrows, Page Up/Down, Home/End) and every shortcut in Keyboard.',
      live: 'Focus the play key',
      action: focusPlayer,
    },
  ];
  const TIPS = [
    {
      title: 'Readable over any video',
      text: 'Keys never sit on the picture: solid paper keys on the frame or the dark stage. Captions have an outline or box, a size and a colour you choose.',
      live: `Key contrast here ${fmt(ratio)}, play key ${fmt(playRatio)}`,
    },
    {
      title: 'Easy to tap',
      text: 'Keys are 38 to 58 px, the play key largest, at least 6 px apart.',
      live: smallest ? `Smallest key right now: ${smallest} px` : 'Measuring…',
    },
    {
      title: 'Visible focus',
      text: 'A double ring drawn inside the key, in its icon and paper colours, so it shows on every frame and never gets clipped.',
      live: 'Tab into the player',
      action: focusPlayer,
    },
    {
      title: 'Calm on request',
      text: 'Reduced motion (your system, or the switch in Customize): no gliding picture, menus without movement, one soft snap flash, a still camera in the booth.',
      live: calm ? 'Calm motion is on' : 'Calm motion is off',
    },
  ];
  return (
    <div className="sc-brief" data-tab={tab}>
      <div className="sc-seg sc-brief-tabs" role="tablist" aria-label="The brief">
        <button type="button" role="tab" aria-selected={tab === 'req'} onClick={() => setTab('req')}>
          Requirements
        </button>
        <button type="button" role="tab" aria-selected={tab === 'tips'} onClick={() => setTab('tips')}>
          Accessibility
        </button>
      </div>
      <CheckList id="req" title="Minimum requirements" items={REQ} />
      <CheckList id="tips" title="Accessibility" items={TIPS} />
    </div>
  );
}

function CheckList({ id, title, items }) {
  const [open, setOpen] = useState(0); // phones show one explanation at a time; wide screens show all
  return (
    <div className="sc-checklist" data-list={id}>
      <h3 className="sc-h3">{title}</h3>
      <ol>
        {items.map((it, i) => (
          <li key={it.title} className="sc-check" data-open={open === i || undefined}>
            <span className="sc-tick" aria-hidden="true">
              <I.Check />
            </span>
            <div>
              <h4>
                <button type="button" className="sc-check-h" aria-expanded={open === i} onClick={() => setOpen(i)}>
                  {it.title}
                </button>
              </h4>
              <p className="sc-check-text">{it.text}</p>
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
  [['J', 'L'], 'Back or forward 10 s'],
  [['←', '→'], 'Back or forward 5 s'],
  [['↑', '↓'], 'Volume'],
  [['M'], 'Sound on or off'],
  [['C'], 'Captions'],
  [['<', '>'], 'Slower or faster'],
  [['0', '9'], 'Jump to 0% … 90%'],
  [['Home', 'End'], 'Start or end'],
  [['I'], 'Picture-in-picture'],
  [['S'], 'Snap the frame'],
  [['F'], 'Full screen'],
  [['Esc'], 'Leave full screen'],
];

function Keys() {
  return (
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
  );
}

/** The same card as the booth's About card: the name, the emblem, who made it. */
function Credits() {
  return (
    <article className="about-card sc-credits">
      <header className="about-head">
        <div className="about-names">
          <Logotype as="p" className="about-title" />
          <p className="about-tag">a photobooth for films</p>
        </div>
        <PlayTwice className="about-emblem" size={150} />
      </header>
      <p className="about-text">
        A photobooth is a little room you step into; this one is made for <b>play</b>, both kinds. <b>Play the game:</b> walk in, pick
        a tape and slide it into the player. <b>Play the film:</b> watch it, snap any frame you love and print your snaps as a
        photostrip. This page is the booth's player on its own, built on Video.js 10.
      </p>
      <dl className="sc-credit-list">
        <div>
          <dt>Player</dt>
          <dd>
            <code>@videojs/react</code> 10, films streamed from Mux with <code>MuxVideo</code>
          </dd>
        </div>
        <div>
          <dt>Films</dt>
          <dd>Ten Blender Foundation open movies, Creative Commons</dd>
        </div>
        <div>
          <dt>Frames</dt>
          <dd>30, drawn in code, no text on any of them</dd>
        </div>
      </dl>
      <footer className="about-foot">
        <Credit className="about-credit" />
        <nav className="about-links" aria-label="More">
          <a href="/" data-tip="The whole booth: walk in, pick a tape">
            Enter the booth ↗
          </a>
          <a href={REPO} target="_blank" rel="noopener noreferrer" data-tip="Open source, Apache 2.0">
            GitHub ↗
          </a>
        </nav>
      </footer>
    </article>
  );
}
