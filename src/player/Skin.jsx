import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BufferingIndicator,
  Container,
  ErrorDialog,
  FullscreenButton,
  Hotkey,
  MuteButton,
  PiPButton,
  PlayButton,
  PlaybackRateButton,
  Poster,
  SeekButton,
  StatusAnnouncer,
  Time,
  TimeSlider,
  VolumeSlider,
  useHotkey,
} from '@videojs/react';
import { useApp, movieById } from '../store.js';
import { BORDERS, borderById, ensureFrameFonts, formatDate, formatTimecode, frameLayout, paintComposite, paintOverlay } from '../data/borders.js';
import { snapPhoto } from '../lib/printFlow.js';
import { sfx } from '../lib/sfx.js';
import { usePlayer } from './core.js';
import * as I from './icons.jsx';

/**
 * The control band: one slim row of keys in the frame's lower edge. Below
 * ROW_MIN px the seek bar takes its own line above the keys.
 * Keep ROW_MIN in step with the @container band query in skin.css.
 */
const ROW_MIN = 520;
const bandHeight = (bw) => (bw >= ROW_MIN ? Math.round(Math.min(68, Math.max(56, bw * 0.068))) : 92);

/**
 * Where everything sits. The frame hugs the film, with a little room around
 * it. In fullscreen the frame fills the screen: the picture keeps the film's
 * shape and the frame's paper widens around it, so there are no black bars.
 */
function computeGeo(border, aspect, sw, sh, fullscreen) {
  const { t, r, l } = border.pads;
  const { gap, foot } = border.deck ?? { gap: border.pads.b, foot: 0 };
  const Wu = 1 + l + r;
  const Hu = t + 1 / aspect + gap + foot; // the frame's height in photo widths, without the controls
  const bandW = (u) => (l ? u : u * Wu);
  const aw = fullscreen ? sw : sw - Math.min(32, sw * 0.03);
  const ah = fullscreen ? sh : sh - Math.min(28, sh * 0.04);
  const fit = (band) => Math.max(40, Math.min(aw / Wu, (ah - band) / Hu));
  let band = bandHeight(bandW(aw / Wu));
  let u = fit(band);
  for (let i = 0; i < 3; i++) {
    const next = bandHeight(bandW(u));
    if (next === band) break;
    band = Math.max(band, next);
    u = fit(band);
  }
  band = bandHeight(bandW(u));
  const rad = (border.radius || 0) * u;
  const W = fullscreen ? sw : u * Wu;
  const H = fullscreen ? sh : u * Hu + band;
  // in fullscreen the frame's paper widens around the picture; everything else keeps its place
  const ex = Math.max(0, (W - u * Wu) / 2);
  const ey = Math.max(0, (H - u * Hu - band) / 2);
  const win = { x: l * u + ex, y: t * u + ey, w: u, h: u / aspect, r: rad };
  const Hd = win.y + win.h + gap * u;
  return { W, H, u, Hd, Hb: Hd + band, band, win };
}

function useSize(ref) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

export function PlayboothSkin({ children }) {
  const deck = useApp((s) => s.deck);
  const borderId = useApp((s) => s.borderId);
  const aspect = useApp((s) => s.videoAspect);
  const movie = useApp((s) => movieById(s.insertedTapeId));
  const station = useApp((s) => s.station);
  const fullscreen = usePlayer((s) => s.isFullscreen);
  const store = usePlayer();
  const playing = deck === 'playing';
  const border = borderById(borderId);
  const stageRef = useRef(null);
  const size = useSize(stageRef);
  const geo = useMemo(() => (size.w ? computeGeo(border, aspect, size.w, size.h, fullscreen) : null), [border, aspect, size.w, size.h, fullscreen]);
  const k = border.ui;
  const theme = {
    '--k-surface': k.surface,
    '--k-ink': k.ink,
    '--k-band': k.band,
    '--k-accent': k.accent,
    '--k-track': k.track,
    '--k-play-bg': k.play[0],
    '--k-play-ink': k.play[1],
    '--k-thumb': k.thumbColor ?? k.accent,
    '--bar-bg': k.surface,
  };

  const onKeyDown = (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || document.fullscreenElement) return;
    if (useApp.getState().station === 'watch') {
      e.preventDefault();
      useApp.getState().goStation('player');
    }
  };

  const togglePlay = () => {
    if (useApp.getState().deck !== 'playing') return;
    try {
      if (store.paused) store.play()?.catch?.(() => {});
      else store.pause();
      sfx('tap');
    } catch {
      /* no media yet */
    }
  };

  return (
    <Container
      className="pb-skin"
      data-deck={deck}
      data-frame={borderId}
      data-fs={fullscreen || undefined}
      style={theme}
      aria-label={movie ? `PLAYBOOTH player, ${movie.title}` : 'PLAYBOOTH player'}
      onKeyDown={onKeyDown}
    >
      {!fullscreen && <ChromeBar movie={movie} />}
      <div className="pb-stage" ref={stageRef}>
        {geo && (
          <div className="pb-frame" style={{ width: geo.W, height: geo.H }}>
            <div
              className="pb-window"
              style={{ left: geo.win.x, top: geo.win.y, width: geo.win.w, height: geo.win.h, borderRadius: geo.win.r || undefined }}
              onClick={togglePlay}
              onDoubleClick={() => playing && (fullscreen ? store.exitFullscreen() : store.requestFullscreen())?.catch?.(() => {})}
            >
              {children}
              <Poster.Root className="pb-poster">
                <Poster.Image className="pb-poster-img" alt="" />
              </Poster.Root>
              <CaptionLayer />
              <BufferingIndicator className="pb-buffering" render={(props) => <div {...props}><span className="pb-spinner" /></div>} />
              <Flash />
              <ErrorDialog.Root>
                <ErrorDialog.Popup className="pb-error">
                  <ErrorDialog.Title className="pb-error-title" />
                  <ErrorDialog.Description className="pb-error-text" />
                  <ErrorDialog.Close className="btn btn--primary" />
                </ErrorDialog.Popup>
              </ErrorDialog.Root>
            </div>
            <FrameArt border={border} geo={geo} movie={movie} />
            <div
              className="pb-band"
              style={{ left: border.pads.l ? geo.win.x : 0, width: border.pads.l ? geo.win.w : geo.W, top: geo.Hd, height: geo.band, '--band-h': `${geo.band}px` }}
              inert={!playing || undefined}
            >
              <ControlBand movie={movie} />
            </div>
          </div>
        )}
      </div>

      {deck === 'frame' && <FramePicker active={station === 'watch'} />}
      <CaptionCss />
      <PlayboothHotkeys enabled={playing} />
      <div className="sr-only">
        <StatusAnnouncer />
      </div>
    </Container>
  );
}

/* ---------- the frame, painted to the exact size of the player ---------- */

function FrameArt({ border, geo, movie }) {
  const canvas = useRef(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    ensureFrameFonts().then(() => setTick((t) => t + 1));
  }, []);
  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const L = {
      W: Math.round(geo.W * d),
      H: Math.round(geo.H * d),
      u: geo.u * d,
      Hd: geo.Hd * d,
      Hb: geo.Hb * d,
      win: { x: geo.win.x * d, y: geo.win.y * d, w: geo.win.w * d, h: geo.win.h * d, r: geo.win.r * d },
    };
    el.width = L.W;
    el.height = L.H;
    paintOverlay(el.getContext('2d'), border, L, { title: movie?.title, date: formatDate() });
  }, [border, geo, movie, tick]);
  return <canvas ref={canvas} className="pb-frame-art" aria-hidden="true" />;
}

function Flash() {
  const token = useApp((s) => s.flashToken);
  const ref = useRef(null);
  useEffect(() => {
    if (!token || !ref.current) return;
    const el = ref.current;
    el.removeAttribute('data-on');
    void el.offsetWidth;
    el.setAttribute('data-on', '');
  }, [token]);
  return <div ref={ref} className="pb-flash" aria-hidden="true" />;
}

/* ---------- outside the frame: back, snaps, album, eject ---------- */

function ChromeBar({ movie }) {
  const snaps = useApp((s) => s.snaps.length);
  const total = useApp((s) => s.collection.length);
  return (
    <div className="pb-chrome">
      <button type="button" className="pb-chip" onClick={() => useApp.getState().goStation('player')}>
        <I.Back />
        <span>Booth</span>
      </button>
      <p className="pb-chrome-title">
        <span className="pb-chrome-name">{movie?.title}</span>
        <span className="pb-chrome-credit">{movie ? `${movie.credit}, ${movie.license}` : ''}</span>
      </p>
      <div className="pb-chrome-group">
        <button type="button" className="pb-chip" onClick={() => useApp.getState().setCompilerOpen(true)}>
          <I.Stack />
          <span>Snaps</span>
          {snaps > 0 && <span className="pb-chip-count">{snaps}</span>}
        </button>
        <button type="button" className="pb-chip" onClick={() => useApp.getState().setAlbumOpen(true)} aria-label={`Album, ${total} prints`}>
          <I.Album />
          <span>Album</span>
        </button>
        <button type="button" className="pb-chip" onClick={() => useApp.getState().ejectTape()} aria-label={`Eject ${movie?.title ?? 'tape'}`}>
          <I.Eject />
          <span>Eject</span>
        </button>
      </div>
    </div>
  );
}

/* ---------- the controls, living in the frame's lower edge ---------- */

function ControlBand({ movie }) {
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(null);
  const snap = async () => {
    if (busy) return;
    setBusy(true);
    sfx('shutter');
    await snapPhoto();
    setBusy(false);
  };
  const opener = (id) => (open) => setPop(open ? id : null);
  return (
    <div className="pb-controls">
      <PlayButton className="pb-btn pb-play" label={(s) => (s.ended ? 'Replay' : s.paused ? 'Play' : 'Pause')} render={(props, s) => <button {...props}>{s.ended ? <I.Replay /> : s.paused ? <I.Play /> : <I.Pause />}</button>} />
      <SeekRow movie={movie} />
      <div className="pb-keys" role="group" aria-label="Picture and sound">
        <div className="pb-volume">
          <MuteButton className="pb-btn" label={(s) => (s.muted ? 'Unmute' : 'Mute')} render={(props, s) => <button {...props}><I.Volume level={s.muted || s.volumeLevel === 'off' ? 'off' : s.volumeLevel === 'low' ? 'low' : 'high'} /></button>} />
          <VolumeSlider.Root className="pb-vol" label="Volume">
            <VolumeSlider.Track className="pb-vol-track">
              <VolumeSlider.Fill className="pb-vol-fill" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="pb-vol-thumb" />
          </VolumeSlider.Root>
        </div>
        <CaptionsControl open={pop === 'cc'} setOpen={opener('cc')} />
        <MoreControl open={pop === 'more'} setOpen={opener('more')} />
        <button type="button" className="pb-btn pb-snap" onClick={snap} aria-label="Snap this frame" aria-keyshortcuts="S" data-busy={busy || undefined}>
          <I.Camera />
        </button>
        <FullscreenButton className="pb-btn" label={(s) => (s.fullscreen ? 'Exit full screen' : 'Full screen')} render={(props, s) => <button {...props}><I.Fullscreen exit={s.fullscreen} /></button>} />
      </div>
    </div>
  );
}

/** Progress with a peek: hovering shows that moment in a card; the film keeps going. */
function SeekRow({ movie }) {
  const duration = usePlayer((s) => s.duration);
  const wrap = useRef(null);
  const [peek, setPeek] = useState(null);
  const onMove = (e) => {
    const el = wrap.current?.querySelector('.pb-seek');
    if (!el || !duration) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setPeek({ f, x: e.clientX - wrap.current.getBoundingClientRect().left, t: f * duration });
  };
  return (
    <div className="pb-seek-row" ref={wrap} onPointerMove={onMove} onPointerLeave={() => setPeek(null)}>
      <Time.Value type="current" className="pb-time" />
      <TimeSlider.Root className="pb-seek" label="Seek">
        <TimeSlider.Track className="pb-seek-track">
          <TimeSlider.Buffer className="pb-seek-buffer" />
          <TimeSlider.Fill className="pb-seek-fill" />
        </TimeSlider.Track>
        <TimeSlider.Thumb className="pb-seek-thumb" />
      </TimeSlider.Root>
      <Time.Value type="duration" className="pb-time pb-time--total" />
      {peek && <PeekCard movie={movie} peek={peek} width={wrap.current?.clientWidth ?? 0} />}
    </div>
  );
}

/** Closes on an outside press or Escape, and hands focus back to its key. */
function usePopover(open, setOpenProp, wrap, trigger) {
  const setter = useRef(setOpenProp);
  setter.current = setOpenProp;
  useEffect(() => {
    if (!open) return undefined;
    const setOpen = (v) => setter.current(v);
    const onDown = (e) => {
      if (!wrap.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        wrap.current?.querySelector(trigger)?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey, true);
    requestAnimationFrame(() => wrap.current?.querySelector('.pb-pop button, .pb-pop input')?.focus({ preventScroll: true, focusVisible: false }));
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open, wrap, trigger]);
}

/** Speed, skip and picture in picture, tucked behind one key. */
function MoreControl({ open, setOpen }) {
  const wrap = useRef(null);
  usePopover(open, setOpen, wrap, '.pb-more');
  return (
    <div className="pb-pop-wrap" ref={wrap}>
      <button type="button" className="pb-btn pb-more" aria-label="More controls" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <I.More />
      </button>
      {open && (
        <div className="pb-pop pb-pop--more" role="dialog" aria-label="More controls">
          <div className="pb-pop-row">
            <span className="pb-pop-label">Skip</span>
            <div className="pb-pop-keys">
              <SeekButton seconds={-10} className="pb-key" label="Back 10 seconds" render={(props) => <button {...props}><I.Seek back /></button>} />
              <SeekButton seconds={10} className="pb-key" label="Forward 10 seconds" render={(props) => <button {...props}><I.Seek /></button>} />
            </div>
          </div>
          <div className="pb-pop-row">
            <span className="pb-pop-label">Speed</span>
            <PlaybackRateButton className="pb-key pb-key--wide" label={(s) => `Speed ${s.rate} times`} render={(props, s) => <button {...props}><span className="pb-rate">{s.rate}×</span></button>} />
          </div>
          <div className="pb-pop-row pb-pop-row--pip">
            <span className="pb-pop-label">Picture in picture</span>
            <PiPButton className="pb-key" label={(s) => (s.pip ? 'Exit picture in picture' : 'Picture in picture')} render={(props) => <button {...props}><I.Pip /></button>} />
          </div>
        </div>
      )}
    </div>
  );
}

const PEEK_W = 176;

function PeekCard({ movie, peek, width }) {
  const t = Math.round(peek.t / 2) * 2;
  const left = Math.min(Math.max(peek.x - PEEK_W / 2, 0), Math.max(0, width - PEEK_W));
  return (
    <div className="pb-peek" style={{ left }} aria-hidden="true">
      <PeekImage movie={movie} time={t} />
      <span className="pb-peek-time">{formatTimecode(peek.t)}</span>
    </div>
  );
}

/** Mux serves any frame as an image; local files get a quiet second <video>. */
function PeekImage({ movie, time }) {
  const canvas = useRef(null);
  const shadow = useRef(null);
  const src = movie?.playbackId ? `https://image.mux.com/${movie.playbackId}/thumbnail.webp?time=${time}&width=320` : null;
  useEffect(() => {
    if (src || !movie?.src) return undefined;
    let v = shadow.current;
    if (!v || v.dataset.src !== movie.src) {
      v = document.createElement('video');
      v.muted = true;
      v.preload = 'auto';
      v.crossOrigin = 'anonymous';
      v.src = movie.src;
      v.dataset.src = movie.src;
      shadow.current = v;
    }
    const draw = () => {
      const c = canvas.current;
      if (!c || !v.videoWidth) return;
      c.width = 320;
      c.height = Math.round((320 * v.videoHeight) / v.videoWidth);
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    };
    v.addEventListener('seeked', draw);
    const go = () => {
      v.currentTime = Math.min(time, (v.duration || time) - 0.1);
    };
    if (v.readyState >= 1) go();
    else v.addEventListener('loadedmetadata', go, { once: true });
    return () => v.removeEventListener('seeked', draw);
  }, [src, movie, time]);
  if (src) return <img className="pb-peek-img" src={src} alt="" />;
  return <canvas ref={canvas} className="pb-peek-img" />;
}

/* ---------- captions ---------- */

export const CAPTION_COLORS = [
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'yellow', name: 'Yellow', value: '#ffe14d' },
  { id: 'cream', name: 'Cream', value: '#f4e3c1' },
  { id: 'cyan', name: 'Cyan', value: '#8ee8f0' },
];
const CAPTION_FONTS = {
  sans: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif",
  serif: "'Literata Variable', Literata, Georgia, serif",
};

/** The browser's own cue box is hidden; this layer draws captions so they can be styled and placed. */
function CaptionCss() {
  return <style>{`.pb-window video::cue{color:transparent;background:transparent;text-shadow:none}.pb-window video::-webkit-media-text-track-display{opacity:0}`}</style>;
}

function CaptionLayer() {
  const video = useApp((s) => s.videoEl);
  const showing = usePlayer((s) => s.subtitlesShowing);
  const style = useApp((s) => s.captionStyle);
  const [lines, setLines] = useState([]);
  useEffect(() => {
    if (!video || !showing) {
      setLines([]);
      return undefined;
    }
    const tracks = video.textTracks;
    let track = null;
    const update = () => {
      const cues = track?.activeCues ? Array.from(track.activeCues) : [];
      setLines(cues.map((c) => c.text.replace(/<[^>]+>/g, '')));
    };
    const pick = () => {
      if (track) track.removeEventListener('cuechange', update);
      track = Array.from(tracks).find((t) => t.mode === 'showing' && (t.kind === 'captions' || t.kind === 'subtitles')) ?? null;
      if (track) track.addEventListener('cuechange', update);
      update();
    };
    pick();
    tracks.addEventListener('change', pick);
    tracks.addEventListener('addtrack', pick);
    return () => {
      tracks.removeEventListener('change', pick);
      tracks.removeEventListener('addtrack', pick);
      if (track) track.removeEventListener('cuechange', update);
    };
  }, [video, showing]);
  if (!lines.length) return null;
  const outline = style.outline;
  return (
    <div className="pb-captions" aria-hidden="true">
      {lines.map((text, i) => (
        <p
          key={i}
          className="pb-cue"
          data-box={!outline || undefined}
          style={{ color: style.color, fontFamily: CAPTION_FONTS[style.font] ?? CAPTION_FONTS.sans }}
        >
          {text.split('\n').map((l, j) => (
            <span key={j}>{l}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

function CaptionsControl({ open, setOpen }) {
  const store = usePlayer();
  const showing = usePlayer((s) => s.subtitlesShowing);
  const style = useApp((s) => s.captionStyle);
  const set = useApp((s) => s.setCaptionStyle);
  const wrap = useRef(null);
  const custom = !CAPTION_COLORS.some((c) => c.value === style.color);
  usePopover(open, setOpen, wrap, '.pb-cc');

  const pick = (patch) => {
    set(patch);
    sfx('tick');
  };

  return (
    <div className="pb-pop-wrap" ref={wrap}>
      <button
        type="button"
        className="pb-btn pb-cc"
        aria-label="Captions"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-on={showing || undefined}
        onClick={() => setOpen(!open)}
      >
        <I.Captions on={showing} />
      </button>
      {open && (
        <div className="pb-pop" role="dialog" aria-label="Captions">
          <div className="pb-pop-row">
            <span className="pb-pop-label">Captions</span>
            <button
              type="button"
              role="switch"
              aria-checked={showing}
              className="pb-switch"
              onClick={() => {
                store.toggleSubtitles?.();
                sfx('switch');
              }}
            >
              <span className="sr-only">Captions</span>
            </button>
          </div>
          <div className="pb-pop-row pb-pop-row--stack">
            <span className="pb-pop-label">Color</span>
            <div className="pb-swatches" role="radiogroup" aria-label="Caption color">
              {CAPTION_COLORS.map((c) => (
                <button key={c.id} type="button" role="radio" aria-checked={style.color === c.value} aria-label={c.name} className="pb-swatch" style={{ '--c': c.value }} onClick={() => pick({ color: c.value })} />
              ))}
              <label className="pb-swatch pb-swatch--custom" data-checked={custom || undefined} style={{ '--c': custom ? style.color : 'conic-gradient(#ff6b6b, #ffe14d, #8ee8f0, #b48cff, #ff6b6b)' }}>
                <span className="sr-only">Custom color</span>
                <input type="color" value={custom ? style.color : '#ffffff'} onChange={(e) => set({ color: e.target.value })} />
              </label>
            </div>
          </div>
          <div className="pb-pop-row">
            <span className="pb-pop-label">Edge</span>
            <div className="pb-seg" role="radiogroup" aria-label="Caption edge">
              <button type="button" role="radio" aria-checked={style.outline} onClick={() => pick({ outline: true })}>Outline</button>
              <button type="button" role="radio" aria-checked={!style.outline} onClick={() => pick({ outline: false })}>Box</button>
            </div>
          </div>
          <div className="pb-pop-row">
            <span className="pb-pop-label">Font</span>
            <div className="pb-seg" role="radiogroup" aria-label="Caption font">
              <button type="button" role="radio" aria-checked={style.font === 'sans'} onClick={() => pick({ font: 'sans' })} style={{ fontFamily: CAPTION_FONTS.sans }}>Sans</button>
              <button type="button" role="radio" aria-checked={style.font === 'serif'} onClick={() => pick({ font: 'serif' })} style={{ fontFamily: CAPTION_FONTS.serif }}>Serif</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- frame picker ---------- */

function FrameThumb({ border }) {
  const ref = useRef(null);
  useEffect(() => {
    let alive = true;
    ensureFrameFonts().then(() => {
      const el = ref.current;
      if (!alive || !el) return;
      const L = frameLayout(border, 16 / 9, 220);
      el.width = L.W;
      el.height = L.H;
      paintComposite(el.getContext('2d'), border, L, { title: 'Film', date: '' }, (g, win) => {
        const grad = g.createLinearGradient(0, win.y, 0, win.y + win.h);
        grad.addColorStop(0, '#d9b98f');
        grad.addColorStop(1, '#6d5444');
        g.fillStyle = grad;
        g.fillRect(win.x, win.y, win.w, win.h);
      });
    });
    return () => {
      alive = false;
    };
  }, [border]);
  return <canvas ref={ref} className="frame-thumb" aria-hidden="true" />;
}

function FramePicker({ active }) {
  const borderId = useApp((s) => s.borderId);
  const setBorder = useApp((s) => s.setBorder);
  const group = useRef(null);
  const selected = borderById(borderId);

  useEffect(() => {
    if (!active) return undefined;
    const id = setTimeout(() => group.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true, focusVisible: false }), useApp.getState().reducedMotion ? 30 : 700);
    return () => clearTimeout(id);
  }, [active]);

  const choose = (id) => {
    if (id === useApp.getState().borderId) return;
    setBorder(id);
    sfx('paper');
  };
  const move = (dir) => {
    const i = BORDERS.findIndex((b) => b.id === borderId);
    const next = BORDERS[(i + dir + BORDERS.length) % BORDERS.length];
    choose(next.id);
    requestAnimationFrame(() => group.current?.querySelector(`[data-id="${next.id}"]`)?.focus());
  };

  return (
    <aside className="pb-picker" aria-labelledby="pb-picker-title">
      <h2 className="band band--teal" id="pb-picker-title">Choose a frame</h2>
      <p className="pb-picker-hint">{selected.hint}</p>
      <div
        ref={group}
        className="pb-frames"
        role="radiogroup"
        aria-labelledby="pb-picker-title"
        onKeyDown={(e) => {
          const rtl = document.dir === 'rtl';
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            move(rtl && e.key === 'ArrowRight' ? -1 : 1);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            move(rtl && e.key === 'ArrowLeft' ? 1 : -1);
          }
        }}
      >
        {BORDERS.map((b) => {
          const on = b.id === borderId;
          return (
            <button key={b.id} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} data-id={b.id} className="frame-opt" onClick={() => choose(b.id)}>
              <FrameThumb border={b} />
              <span className="frame-name">{b.name}</span>
            </button>
          );
        })}
      </div>
      <div className="pb-picker-actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            const s = useApp.getState();
            s.confirmFrame();
            s.announce(`${selected.name} frame. Playing.`);
            sfx('start');
            requestAnimationFrame(() => document.querySelector('.pb-play')?.focus({ preventScroll: true, focusVisible: false }));
          }}
        >
          Start the film
        </button>
        <button type="button" className="btn" onClick={() => useApp.getState().goStation('player')}>
          Back
        </button>
      </div>
    </aside>
  );
}

/* ---------- keys ---------- */

function PlayboothHotkeys({ enabled }) {
  const off = !enabled;
  const snap = useCallback(() => {
    sfx('shutter');
    snapPhoto();
  }, []);
  useHotkey({ keys: 's', action: 'snapshot', disabled: off, onActivate: snap });
  return (
    <>
      <Hotkey keys="Space" action="togglePaused" disabled={off} />
      <Hotkey keys="k" action="togglePaused" disabled={off} />
      <Hotkey keys="m" action="toggleMuted" disabled={off} />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-5} disabled={off} />
      <Hotkey keys="ArrowRight" action="seekStep" value={5} disabled={off} />
      <Hotkey keys="j" action="seekStep" value={-10} disabled={off} />
      <Hotkey keys="l" action="seekStep" value={10} disabled={off} />
      <Hotkey keys="ArrowUp" action="volumeStep" disabled={off} />
      <Hotkey keys="ArrowDown" action="volumeStep" disabled={off} />
      <Hotkey keys="0-9" action="seekToPercent" disabled={off} />
      <Hotkey keys="Home" action="seekToPercent" value={0} disabled={off} />
      <Hotkey keys="End" action="seekToPercent" value={100} disabled={off} />
      <Hotkey keys=">" action="speedUp" disabled={off} />
      <Hotkey keys="<" action="speedDown" disabled={off} />
      <Hotkey keys="f" action="toggleFullscreen" disabled={off} />
      <Hotkey keys="c" action="toggleSubtitles" disabled={off} />
      <Hotkey keys="i" action="togglePictureInPicture" disabled={off} />
    </>
  );
}

