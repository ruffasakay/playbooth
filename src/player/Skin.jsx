import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  BufferingIndicator,
  Container,
  ErrorDialog,
  Hotkey,
  MuteButton,
  PlayButton,
  Poster,
  SeekButton,
  StatusAnnouncer,
  Time,
  VolumeSlider,
  useHotkey,
} from '@videojs/react';
import { useApp, movieById } from '../store.js';
import { BORDERS, borderById, formatTimecode, frameLayout, paintComposite, paintOverlay } from '../data/borders.js';
import { snapPhoto } from '../lib/printFlow.js';
import { sfx } from '../lib/sfx.js';
import { usePlayer } from './core.js';
import * as I from './icons.jsx';

/*
 * The PLAYBOOTH player.
 *
 * Landscape (desktop, tablets, phones on their side, every full screen):
 *   [ booth rail ]   [ framed picture ]   [ progress | keys ]
 * The progress runs top to bottom, like scrolling a feed. Dragging it rolls
 * a strip of clips past the picture; hovering floats three clips with the
 * one under the pointer outlined.
 *
 * Portrait phones: the same dock lies on its side under the picture.
 *
 * While the film plays and nobody touches anything, the rail and the dock
 * step away and the framed picture grows into the room they leave.
 */

/* ---------- layout ---------- */

const SCRUB_W = 40;
const DOCK_PAD = 10;
const H_DOCK = 196; // portrait dock height
const RAIL_KEY = 46;

/** How the vertical dock arranges its keys for a given height. */
function dockSpec(h) {
  if (h >= 600) return { cols: 1, key: 46, play: 58, min: 600 };
  if (h >= 384) return { cols: 2, key: 44, play: 56, min: 384 };
  if (h >= 320) return { cols: 2, key: 40, play: 50, min: 320 };
  return { cols: 3, key: 38, play: 46, min: 214 };
}
const dockWidth = (s) => DOCK_PAD * 2 + SCRUB_W + 10 + s.cols * s.key + (s.cols - 1) * 8;

/** The frame hugging a picture as large as fits in aw × ah. */
function fitFrame(border, aspect, aw, ah) {
  const { t, r, b, l } = border.pads;
  const Wu = 1 + l + r;
  const Hu = t + b + 1 / aspect;
  const u = Math.max(40, Math.min(aw / Wu, ah / Hu));
  return { W: u * Wu, H: u * Hu, u, win: { x: l * u, y: t * u, w: u, h: u / aspect, r: (border.radius || 0) * u } };
}

/** The frame filling exactly W × H: the picture keeps its shape, the paper widens around it. */
function fillFrame(border, aspect, W, H) {
  const f = fitFrame(border, aspect, W, H);
  const ex = (W - f.W) / 2;
  const ey = (H - f.H) / 2;
  return { ...f, W, H, win: { ...f.win, x: f.win.x + ex, y: f.win.y + ey } };
}

/**
 * Everything's position inside the stage, for the controls shown and hidden.
 * Returns { frame: {x, y, ...fit}, dock, rail, title } in stage pixels.
 */
function computeLayout({ border, aspect, sw, sh, fs, picker, shown }) {
  const portrait = sw / sh < 0.9;
  const m = fs ? 0 : Math.round(Math.min(22, Math.max(10, Math.min(sw, sh) * 0.025)));
  const gap = fs ? 0 : Math.round(Math.min(18, Math.max(10, sw * 0.012)));

  if (portrait) {
    const top = !fs && !picker ? 60 : m;
    const avW = sw - m * 2;
    if (!shown) {
      const f = fitFrame(border, aspect, avW, sh - m * 2);
      return { portrait, frame: { ...f, x: (sw - f.W) / 2, y: (sh - f.H) / 2 } };
    }
    const avH = sh - top - m - H_DOCK - gap;
    const f = fitFrame(border, aspect, avW, avH);
    const groupH = f.H + gap + H_DOCK;
    const y0 = top + Math.max(0, (sh - top - m - groupH) / 2);
    const dw = Math.min(avW, Math.max(Math.min(f.W, 470), 340));
    return {
      portrait,
      frame: { ...f, x: (sw - f.W) / 2, y: y0 },
      dock: { orient: 'h', x: (sw - dw) / 2, y: y0 + f.H + gap, w: dw, h: H_DOCK, spec: { key: 44, play: 58 } },
      rail: !picker && !fs ? { orient: 'h', x: m, y: m, w: sw - m * 2, h: 48 } : null,
    };
  }

  const titleH = !fs && sh >= 540 ? 40 : 0;
  const railW = picker ? 0 : fs ? 70 : RAIL_KEY + 12;
  if (!shown) {
    const f = fs ? fillFrame(border, aspect, sw, sh) : fitFrame(border, aspect, sw - m * 2, sh - m * 2);
    return { portrait, frame: { ...f, x: (sw - f.W) / 2, y: (sh - f.H) / 2 } };
  }
  const top = m + titleH;
  const avH = sh - top - m;
  if (fs) {
    const spec = dockSpec(sh - 16);
    const dw = dockWidth(spec);
    const f = fillFrame(border, aspect, sw - railW - dw, sh);
    return {
      portrait,
      frame: { ...f, x: railW, y: 0 },
      dock: { orient: 'v', x: sw - dw, y: 0, w: dw, h: sh, spec, flush: true },
      rail: railW ? { orient: 'v', x: 0, y: 0, w: railW, h: sh, flush: true } : null,
    };
  }
  const left = railW ? m + railW : m;
  let spec = dockSpec(avH);
  let f;
  for (let i = 0; i < 4; i++) {
    const dw = dockWidth(spec);
    f = fitFrame(border, aspect, sw - left - m - gap - dw, avH);
    const next = dockSpec(f.H);
    if (next.cols === spec.cols && next.key === spec.key) break;
    spec = next;
  }
  const dw = dockWidth(spec);
  const dh = Math.max(f.H, spec.min);
  const groupW = f.W + gap + dw;
  const x0 = left + Math.max(0, (sw - left - m - groupW) / 2);
  const fy = top + (avH - f.H) / 2;
  return {
    portrait,
    frame: { ...f, x: x0, y: fy },
    dock: { orient: 'v', x: x0 + f.W + gap, y: fy + (f.H - dh) / 2, w: dw, h: dh, spec },
    rail: railW ? { orient: 'v', x: m, y: top, w: RAIL_KEY, h: avH } : null,
    title: titleH ? { x: x0, y: m, w: f.W, h: titleH - 8 } : null,
  };
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

/* ---------- full screen, landscape on phones ---------- */

const portraitQuery = typeof matchMedia !== 'undefined' ? matchMedia('(orientation: portrait)') : null;
const isCoarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
const canElementFullscreen = () => typeof document !== 'undefined' && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

/**
 * Full screen that lands in landscape on phones. Where the page can go full
 * screen (Android, desktop, iPad) it does, then asks the screen to lock to
 * landscape. iPhone Safari can't put a page in full screen, so the player
 * fills the window itself; if the phone is upright, the picture turns on
 * its side so it's the right way up once you turn the phone.
 */
function useFullscreen() {
  const pseudo = useApp((s) => s.pseudoFs);
  const [native, setNative] = useState(false);
  const [portrait, setPortrait] = useState(() => !!portraitQuery?.matches);
  const [lockFailed, setLockFailed] = useState(false);
  useEffect(() => {
    if (!portraitQuery) return undefined;
    const on = () => setPortrait(portraitQuery.matches);
    portraitQuery.addEventListener('change', on);
    return () => portraitQuery.removeEventListener('change', on);
  }, []);
  // the faceplate goes full screen, not the player, so the player can still turn inside it
  useEffect(() => {
    const on = () => {
      const el = document.fullscreenElement ?? document.webkitFullscreenElement;
      const yes = !!el && !!el.closest?.('.faceplate, .pb-skin');
      setNative(yes);
      if (!yes) {
        setLockFailed(false);
        try {
          screen.orientation?.unlock?.();
        } catch {
          /* not locked */
        }
      }
    };
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);
  useEffect(() => {
    if (!pseudo) return undefined;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [pseudo]);

  const enter = useCallback(async () => {
    const forcePseudo = import.meta.env.DEV && location.search.includes('pseudofs');
    const el = document.querySelector('.faceplate');
    if (el && canElementFullscreen() && !forcePseudo) {
      try {
        await (el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : el.webkitRequestFullscreen());
      } catch {
        useApp.setState({ pseudoFs: true });
        return;
      }
      if (isCoarse()) {
        try {
          await screen.orientation.lock('landscape');
          // some browsers accept the lock and stay upright; turn the picture ourselves then
          setTimeout(() => portraitQuery?.matches && setLockFailed(true), 700);
        } catch {
          setLockFailed(true);
        }
      }
      return;
    }
    useApp.setState({ pseudoFs: true });
  }, []);
  const exit = useCallback(() => {
    if (useApp.getState().pseudoFs) useApp.setState({ pseudoFs: false });
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
  }, []);

  const active = native || pseudo;
  const rotate = active && portrait && isCoarse() && (pseudo || lockFailed);
  return { active, rotate, enter, exit, toggle: active ? exit : enter };
}

/* ---------- the skin ---------- */

const IDLE_MS = 2800;

export function PlayboothSkin({ children }) {
  const deck = useApp((s) => s.deck);
  const borderId = useApp((s) => s.borderId);
  const aspect = useApp((s) => s.videoAspect);
  const movie = useApp((s) => movieById(s.insertedTapeId));
  const station = useApp((s) => s.station);
  const store = usePlayer();
  const paused = usePlayer((s) => s.paused);
  const fs = useFullscreen();
  const pseudo = useApp((s) => s.pseudoFs);
  const playing = deck === 'playing';
  const picker = deck === 'frame';
  const border = borderById(borderId);
  const stageRef = useRef(null);
  const frameRef = useRef(null);
  const size = useSize(stageRef);

  const [idle, setIdle] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pop, setPop] = useState(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [unlockShown, setUnlockShown] = useState(false);
  const overControls = useRef(false);
  const timer = useRef(0);
  const unlockTimer = useRef(0);
  const animate = useRef(false);
  const pointerKind = useRef('mouse');
  const lastPoint = useRef({ x: -1, y: -1 });

  const canHide = useCallback(() => {
    const s = useApp.getState();
    const el = s.videoEl;
    return s.deck === 'playing' && el && !el.paused && !overControls.current && !document.querySelector('.pb-pop, .pb-scrub[data-dragging]');
  }, []);

  const poke = useCallback(() => {
    clearTimeout(timer.current);
    setIdle((was) => {
      if (was) animate.current = true;
      return false;
    });
    timer.current = setTimeout(() => {
      if (canHide()) {
        animate.current = true;
        setIdle(true);
      }
    }, IDLE_MS);
  }, [canHide]);

  // paused, a menu open, a drag: the controls stay
  useEffect(() => {
    if (paused || pop || scrubbing || !playing) {
      clearTimeout(timer.current);
      setIdle((was) => {
        if (was) animate.current = true;
        return false;
      });
    } else poke();
  }, [paused, pop, scrubbing, playing, poke]);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!playing) setLocked(false);
  }, [playing]);

  const lock = () => {
    animate.current = true;
    setPop(null);
    setLocked(true);
    sfx('switch');
    useApp.getState().announce('Controls locked. Use the unlock key to bring them back.');
    flashUnlock();
  };
  const unlock = () => {
    animate.current = true;
    setLocked(false);
    setUnlockShown(false);
    sfx('switch');
    useApp.getState().announce('Controls unlocked.');
    poke();
    requestAnimationFrame(() => document.querySelector('.pb-lock')?.focus({ preventScroll: true, focusVisible: false }));
  };
  const flashUnlock = () => {
    setUnlockShown(true);
    clearTimeout(unlockTimer.current);
    unlockTimer.current = setTimeout(() => setUnlockShown(false), 2400);
  };

  const shown = picker || (!idle && !locked);
  const geo = useMemo(
    () => (size.w ? computeLayout({ border, aspect, sw: size.w, sh: size.h, fs: fs.active, picker, shown }) : null),
    [border, aspect, size.w, size.h, fs.active, picker, shown],
  );
  // the dock and rail keep their places while they step away
  const shownGeo = useMemo(
    () => (size.w ? (shown ? geo : computeLayout({ border, aspect, sw: size.w, sh: size.h, fs: fs.active, picker, shown: true })) : null),
    [geo, shown, border, aspect, size.w, size.h, fs.active, picker],
  );

  // the picture glides to its new size instead of jumping (FLIP)
  const last = useRef(null);
  useLayoutEffect(() => {
    const el = frameRef.current;
    const prev = last.current;
    last.current = geo;
    if (!el || !geo || !prev || !animate.current || useApp.getState().reducedMotion) {
      animate.current = false;
      return;
    }
    animate.current = false;
    const a = prev.frame;
    const b = geo.frame;
    const s = a.win.w / b.win.w;
    const tx = a.x + a.win.x - b.x - s * b.win.x;
    const ty = a.y + a.win.y - b.y - s * b.win.y;
    if (Math.abs(s - 1) < 0.002 && Math.abs(tx) < 0.5 && Math.abs(ty) < 0.5) return;
    el.style.transition = 'none';
    el.style.transformOrigin = '0 0';
    el.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    void el.offsetWidth;
    el.style.transition = 'transform 0.52s cubic-bezier(0.22, 0.7, 0.2, 1)';
    el.style.transform = '';
  }, [geo]);

  const k = border.ui;
  const theme = {
    '--k-surface': k.surface,
    '--k-ink': k.ink,
    '--k-band': k.band,
    '--k-accent': k.accent,
    '--k-track': k.track,
    '--k-dock': k.dock ?? border.swatch[0],
    '--k-play-bg': k.play?.[0] ?? k.ink,
    '--k-play-ink': k.play?.[1] ?? k.surface,
    '--bar-bg': k.surface,
  };

  const onKeyDown = (e) => {
    poke();
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (useApp.getState().pseudoFs) {
      e.preventDefault();
      fs.exit();
      return;
    }
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
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

  // mouse: click plays and pauses. touch: a tap shows or hides the controls.
  const onPictureClick = () => {
    if (locked) {
      flashUnlock();
      return;
    }
    if (pointerKind.current === 'mouse') {
      togglePlay();
      poke();
      return;
    }
    if (!playing) return;
    if (idle) poke();
    else if (canHide()) {
      animate.current = true;
      clearTimeout(timer.current);
      setIdle(true);
    } else poke();
  };

  // a moving mouse or a touch on the controls keeps them up; a resting mouse lets them go
  const onStagePointer = (e) => {
    pointerKind.current = e.pointerType || 'mouse';
    if (locked) {
      if (e.type === 'pointerdown' || e.pointerType === 'mouse') flashUnlock();
      return;
    }
    if (e.type === 'pointermove') {
      if (e.pointerType !== 'mouse') return;
      // browsers send a move when the layout shifts under a resting pointer; only real movement counts
      const p = lastPoint.current;
      const moved = Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y) > 2;
      lastPoint.current = { x: e.clientX, y: e.clientY };
      if (!moved) return;
    }
    if (e.type === 'pointerdown' && e.target.closest?.('.pb-window')) return; // the picture's own tap decides
    poke();
  };

  const controlsHover = {
    onPointerEnter: (e) => {
      if (e.pointerType === 'mouse') overControls.current = true;
    },
    onPointerLeave: () => {
      overControls.current = false;
    },
  };

  return (
    <Container
      className="pb-skin"
      data-deck={deck}
      data-frame={borderId}
      data-fs={fs.active || undefined}
      data-rotate={fs.rotate || undefined}
      data-pseudo={pseudo || undefined}
      data-portrait={geo?.portrait || undefined}
      data-idle={(!shown && !locked) || undefined}
      data-locked={locked || undefined}
      style={theme}
      aria-label={movie ? `PLAYBOOTH player, ${movie.title}` : 'PLAYBOOTH player'}
      onKeyDown={onKeyDown}
    >
      <div className="pb-stage" ref={stageRef} onPointerMove={onStagePointer} onPointerDown={onStagePointer}>
        {geo && shownGeo && (
          <>
            {shownGeo.title && (
              <p className="pb-title" data-hidden={!shown || undefined} style={{ left: shownGeo.title.x, top: shownGeo.title.y, width: shownGeo.title.w }}>
                <span className="pb-title-name">{movie?.title}</span>
                <span className="pb-title-credit">{movie ? `${movie.credit}, ${movie.license}` : ''}</span>
              </p>
            )}
            {shownGeo.rail && (
              <Rail geo={shownGeo.rail} movie={movie} hidden={!shown} portrait={geo.portrait} fs={fs.active} hover={controlsHover} />
            )}
            <div ref={frameRef} className="pb-frame" style={{ left: geo.frame.x, top: geo.frame.y, width: geo.frame.W, height: geo.frame.H }}>
              <div
                className="pb-window"
                data-cursor={locked ? 'Locked' : playing ? (paused ? 'Play' : 'Pause') : undefined}
                style={{ left: geo.frame.win.x, top: geo.frame.win.y, width: geo.frame.win.w, height: geo.frame.win.h, borderRadius: geo.frame.win.r || undefined }}
                onPointerDown={(e) => {
                  pointerKind.current = e.pointerType || 'mouse';
                }}
                onClick={onPictureClick}
                onDoubleClick={() => playing && !locked && pointerKind.current === 'mouse' && fs.toggle()}
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
              <FrameArt border={border} frame={geo.frame} />
            </div>
            {shownGeo.dock && (
              <Dock
                geo={shownGeo.dock}
                win={shownGeo.frame.win}
                aspect={aspect}
                movie={movie}
                hidden={!shown}
                inert={!playing}
                pop={pop}
                setPop={setPop}
                onScrub={setScrubbing}
                onLock={lock}
                fs={fs}
                hover={controlsHover}
              />
            )}
            {locked && (
              <button
                type="button"
                className="pb-btn pb-unlock"
                data-shown={unlockShown || undefined}
                data-cursor="Unlock"
                aria-label="Unlock controls"
                onClick={unlock}
                onFocus={() => setUnlockShown(true)}
              >
                <I.Lock />
              </button>
            )}
          </>
        )}
      </div>

      {picker && <FramePicker active={station === 'watch'} />}
      <CaptionCss />
      <PlayboothHotkeys enabled={playing && !locked} onFullscreen={fs.toggle} />
      <div className="sr-only">
        <StatusAnnouncer />
      </div>
    </Container>
  );
}

/* ---------- the frame, painted to the exact size of the picture ---------- */

function FrameArt({ border, frame }) {
  const canvas = useRef(null);
  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const d = Math.min(2, window.devicePixelRatio || 1);
    const L = {
      W: Math.round(frame.W * d),
      H: Math.round(frame.H * d),
      u: frame.u * d,
      win: { x: frame.win.x * d, y: frame.win.y * d, w: frame.win.w * d, h: frame.win.h * d, r: frame.win.r * d },
    };
    el.width = L.W;
    el.height = L.H;
    paintOverlay(el.getContext('2d'), border, L);
  }, [border, frame]);
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

/* ---------- the booth rail: back, snaps, album, eject ---------- */

function Rail({ geo, movie, hidden, portrait, fs, hover }) {
  const snaps = useApp((s) => s.snaps.length);
  const total = useApp((s) => s.collection.length);
  const back = () => {
    if (useApp.getState().pseudoFs) useApp.setState({ pseudoFs: false });
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    useApp.getState().goStation('player');
  };
  return (
    <nav
      className="pb-rail"
      data-orient={geo.orient}
      data-flush={geo.flush || undefined}
      data-hidden={hidden || undefined}
      aria-label="Booth"
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h }}
      inert={hidden || undefined}
      {...hover}
    >
      <button type="button" className="pb-btn pb-rail-key" aria-label="Back to the booth" data-cursor="Booth" onClick={back}>
        <I.Back />
      </button>
      {portrait && !fs && (
        <p className="pb-rail-title">
          <span className="pb-title-name">{movie?.title}</span>
        </p>
      )}
      <div className="pb-rail-group">
        <button type="button" className="pb-btn pb-rail-key" aria-label={`Snaps, ${snaps}`} data-cursor="Snaps" onClick={() => useApp.getState().setCompilerOpen(true)}>
          <I.Stack />
          {snaps > 0 && <span className="pb-badge" aria-hidden="true">{snaps}</span>}
        </button>
        <button type="button" className="pb-btn pb-rail-key" aria-label={`Album, ${total} prints`} data-cursor="Album" onClick={() => useApp.getState().setAlbumOpen(true)}>
          <I.Album />
        </button>
        <button type="button" className="pb-btn pb-rail-key" aria-label={`Eject ${movie?.title ?? 'tape'}`} data-cursor="Eject" onClick={() => useApp.getState().ejectTape()}>
          <I.Eject />
        </button>
      </div>
    </nav>
  );
}

/* ---------- the dock: progress and keys ---------- */

function Dock({ geo, win, aspect, movie, hidden, inert, pop, setPop, onScrub, onLock, fs, hover }) {
  const store = usePlayer();
  const showing = usePlayer((s) => s.subtitlesShowing);
  const hasText = usePlayer((s) => (s.textTrackList ?? []).some((t) => t.kind === 'captions' || t.kind === 'subtitles'));
  const [flash, setFlash] = useState(false);
  const busy = useRef(false);
  const snap = async () => {
    if (busy.current) return;
    busy.current = true;
    setFlash(true);
    sfx('shutter');
    setTimeout(() => setFlash(false), 420);
    await snapPhoto();
    busy.current = false;
  };
  const v = geo.orient === 'v';
  const spec = geo.spec;

  const keys = {
    time: (
      <div className="pb-readout" key="time" aria-hidden="true">
        <Time.Value type="current" className="pb-time" />
        <span className="pb-time-sep" />
        <Time.Value type="duration" className="pb-time pb-time--total" />
      </div>
    ),
    play: (
      <PlayButton
        key="play"
        className="pb-btn pb-play"
        label={(s) => (s.ended ? 'Replay' : s.paused ? 'Play' : 'Pause')}
        render={(props, s) => (
          <button {...props} data-cursor={s.ended ? 'Replay' : s.paused ? 'Play' : 'Pause'}>
            {s.ended ? <I.Replay /> : s.paused ? <I.Play /> : <I.Pause />}
          </button>
        )}
      />
    ),
    back: <SeekButton key="back" seconds={-10} className="pb-btn pb-step" label="Back 10 seconds" render={(props) => <button {...props} data-cursor="−10s"><I.Seek back /></button>} />,
    fwd: <SeekButton key="fwd" seconds={10} className="pb-btn pb-step" label="Forward 10 seconds" render={(props) => <button {...props} data-cursor="+10s"><I.Seek /></button>} />,
    vol: <VolumeKey key="vol" v={v} />,
    cc: (
      <button
        key="cc"
        type="button"
        className="pb-btn pb-cc"
        aria-label="Captions"
        aria-pressed={showing}
        data-cursor={showing ? 'CC off' : 'CC on'}
        disabled={!hasText}
        onClick={() => {
          store.toggleSubtitles?.();
          sfx('switch');
        }}
      >
        <I.Captions on={showing} />
      </button>
    ),
    settings: <SettingsKey key="settings" open={pop === 'settings'} setOpen={(o) => setPop(o ? 'settings' : null)} />,
    lock: (
      <button key="lock" type="button" className="pb-btn pb-lock" aria-label="Lock controls" data-cursor="Lock" onClick={onLock}>
        <I.Unlock />
      </button>
    ),
    snap: (
      <button key="snap" type="button" className="pb-btn pb-snap" aria-label="Snap this frame" data-cursor="Snap" data-flash={flash || undefined} onClick={snap}>
        {flash ? <I.Check /> : <I.Camera />}
      </button>
    ),
    fs: (
      <button key="fs" type="button" className="pb-btn pb-fs" aria-label={fs.active ? 'Exit full screen' : 'Full screen'} data-cursor={fs.active ? 'Exit' : 'Full'} onClick={fs.toggle}>
        <I.Fullscreen exit={fs.active} />
      </button>
    ),
  };

  // the keys' order reads top to bottom: setup, sound, playing, keeping
  const order = v
    ? spec.cols === 1
      ? [['time'], ['lock', 'settings', 'cc', 'vol'], ['back', 'play', 'fwd'], ['snap', 'fs']]
      : spec.cols === 2
        ? [['time'], ['lock', 'settings', 'cc', 'vol'], ['play'], ['back', 'fwd'], ['snap', 'fs']]
        : [['time'], ['lock', 'settings', 'cc'], ['back', 'play', 'fwd'], ['vol', 'snap', 'fs']]
    : [['vol', 'back', 'play', 'fwd', 'snap'], ['lock', 'cc', 'settings', 'fs']];

  return (
    <div
      className="pb-dock"
      data-orient={geo.orient}
      data-cols={spec.cols}
      data-flush={geo.flush || undefined}
      data-hidden={hidden || undefined}
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h, '--key': `${spec.key}px`, '--play': `${spec.play}px`, '--pop-room': `${Math.max(200, geo.y - 12)}px` }}
      inert={hidden || inert || undefined}
      {...hover}
    >
      <Scrubber orient={geo.orient} movie={movie} win={win} aspect={aspect} onScrub={onScrub} />
      <div className="pb-keys" role="group" aria-label="Player">
        {!v && keys.time}
        {order.map((group, i) => (
          <div key={i} className="pb-key-group" data-g={group.join(' ')}>
            {group.map((id) => (v || id !== 'time' ? keys[id] : null))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Mute on the key; on desktop a level slider slides out beside it. */
function VolumeKey({ v }) {
  return (
    <div className="pb-volume" data-orient={v ? 'v' : 'h'}>
      <MuteButton
        className="pb-btn"
        label={(s) => (s.muted ? 'Unmute' : 'Mute')}
        render={(props, s) => (
          <button {...props} data-cursor={s.muted ? 'Sound' : 'Mute'}>
            <I.Volume level={s.muted || s.volumeLevel === 'off' ? 'off' : s.volumeLevel === 'low' ? 'low' : 'high'} />
          </button>
        )}
      />
      <div className="pb-vol-pop">
        <VolumeSlider.Root className="pb-vol" label="Volume" data-cursor="Drag">
          <VolumeSlider.Track className="pb-vol-track">
            <VolumeSlider.Fill className="pb-vol-fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="pb-vol-thumb" />
        </VolumeSlider.Root>
      </div>
    </div>
  );
}

/* ---------- progress: a groove you drag along, with a reel of clips ---------- */

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function Scrubber({ orient, movie, win, aspect, onScrub }) {
  const store = usePlayer();
  const time = usePlayer((s) => s.currentTime);
  const duration = usePlayer((s) => s.duration);
  const buffered = usePlayer((s) => s.buffered);
  const track = useRef(null);
  const [drag, setDrag] = useState(null);
  const [hover, setHover] = useState(null);
  const lastSeek = useRef(0);
  const v = orient === 'v';

  const measure = (e) => {
    const el = track.current;
    const r = el.getBoundingClientRect();
    const rotated = !!el.closest('[data-rotate]');
    let pos;
    let len;
    if (rotated) {
      // turned a quarter clockwise: local down runs to the screen's left, local right runs down
      if (v) [pos, len] = [r.right - e.clientX, r.width];
      else [pos, len] = [e.clientY - r.top, r.height];
    } else if (v) [pos, len] = [e.clientY - r.top, r.height];
    else [pos, len] = [e.clientX - r.left, r.width];
    return { f: clamp(pos / len, 0, 1), len };
  };

  const seekTo = (f, force) => {
    if (!duration) return;
    const now = performance.now();
    if (!force && now - lastSeek.current < 160) return;
    lastSeek.current = now;
    try {
      store.seek(f * duration);
    } catch {
      /* no media */
    }
  };

  const onPointerDown = (e) => {
    if (e.button > 0 || !duration) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const m = measure(e);
    setDrag(m);
    setHover(null);
    onScrub(true);
    seekTo(m.f, true);
    sfx('tick');
  };
  const onPointerMove = (e) => {
    if (drag) {
      const m = measure(e);
      setDrag(m);
      seekTo(m.f);
      return;
    }
    if (e.pointerType === 'mouse' && duration) setHover(measure(e));
  };
  const end = (e) => {
    if (!drag) return;
    const m = measure(e);
    seekTo(m.f, true);
    setDrag(null);
    onScrub(false);
  };

  const onKeyDown = (e) => {
    const step = { ArrowDown: 5, ArrowRight: 5, ArrowUp: -5, ArrowLeft: -5, PageDown: 30, PageUp: -30 }[e.key];
    if (step != null && duration) {
      e.preventDefault();
      e.stopPropagation();
      try {
        store.seek(clamp(time + step, 0, duration));
      } catch {
        /* no media */
      }
    } else if ((e.key === 'Home' || e.key === 'End') && duration) {
      e.preventDefault();
      e.stopPropagation();
      store.seek(e.key === 'Home' ? 0 : duration - 0.5);
    }
  };

  const f = drag ? drag.f : duration ? time / duration : 0;
  const bufEnd = buffered?.length ? Math.max(...buffered.map((b) => b[1])) : 0;
  const bf = duration ? clamp(bufEnd / duration, 0, 1) : 0;
  const reel = drag ? { ...drag, mode: 'drag' } : hover ? { ...hover, mode: 'hover' } : null;

  return (
    <div
      className="pb-scrub"
      data-orient={orient}
      data-dragging={drag ? '' : undefined}
      data-cursor={drag ? 'Drag' : 'Seek'}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-orientation={v ? 'vertical' : 'horizontal'}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration || 0)}
      aria-valuenow={Math.round(f * (duration || 0))}
      aria-valuetext={`${formatTimecode(f * (duration || 0))} of ${formatTimecode(duration || 0)}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onPointerLeave={() => setHover(null)}
      onKeyDown={onKeyDown}
      style={{ '--f': f, '--b': bf }}
    >
      <div className="pb-scrub-track" ref={track}>
        <div className="pb-scrub-buffer" />
        <div className="pb-scrub-fill" />
      </div>
      <div className="pb-scrub-thumb" />
      {reel && duration > 0 && <Reel orient={orient} reel={reel} duration={duration} movie={movie} win={win} aspect={aspect} />}
    </div>
  );
}

/**
 * The clips around a moment. Dragging rolls a long strip past the picture,
 * faster than the finger, like flicking through a feed; hovering floats three
 * clips with the one under the pointer outlined.
 */
function Reel({ orient, reel, duration, movie, win, aspect }) {
  const v = orient === 'v';
  const { f, len, mode } = reel;
  const drag = mode === 'drag';
  const gap = 8;
  const N = clamp(Math.round(len / 22), 8, 80);
  const step = duration / N;
  const k0 = Math.min(N - 1, Math.floor(f * N));
  // size: a third of the picture's width when rolling, a little smaller hovering
  let w = clamp(win.w * (drag ? 0.3 : 0.24), 104, drag ? 280 : 220);
  let h = w / aspect;
  if (v && !drag) {
    const room = (len - gap * 2) / 3;
    if (h > room) {
      h = Math.max(48, room);
      w = h * aspect;
    }
  }
  if (!v) {
    const room = (len - gap * 2) / (drag ? 3 : 3);
    if (w > room) {
      w = Math.max(80, room);
      h = w / aspect;
    }
  }
  const along = v ? h : w;
  const pitch = along + gap;
  const pos = f * len;
  const items = [];
  if (drag) {
    const anchor = clamp(pos, along / 2 + 2, len - along / 2 - 2);
    const R = Math.ceil(len / pitch) + 1;
    for (let k = Math.max(0, k0 - R); k <= Math.min(N - 1, k0 + R); k++) {
      const d = k + 0.5 - f * N; // in clips; the strip slides continuously
      const c = anchor + d * pitch;
      if (c < -along || c > len + along) continue;
      items.push({ k, c, active: k === k0, fade: Math.min(0.8, Math.abs(k - k0) * 0.22 + 0.12) });
    }
  } else {
    const anchor = clamp(pos, pitch + along / 2, len - pitch - along / 2);
    for (let d = -1; d <= 1; d++) {
      const k = k0 + d;
      if (k < 0 || k >= N) continue;
      items.push({ k, c: anchor + d * pitch, active: d === 0, fade: 0.55 });
    }
  }
  const t = f * duration;
  return (
    <div className="pb-reel" data-mode={mode} data-orient={orient} aria-hidden="true" style={{ '--w': `${w}px`, '--h': `${h}px`, [v ? 'height' : 'width']: len }}>
      {items.map((it) => (
        <div
          key={it.k}
          className="pb-clip"
          data-active={it.active || undefined}
          style={{ [v ? 'top' : 'left']: it.c - along / 2, opacity: it.active ? 1 : 1 - it.fade }}
        >
          <Thumb movie={movie} time={(it.k + 0.5) * step} />
          {it.active && <span className="pb-clip-time">{formatTimecode(t)}</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------- clip images: Mux serves any frame; local files get a quiet second video ---------- */

const local = { src: null, video: null, map: new Map(), queue: [], busy: false, subs: new Set() };

function localThumb(src, time) {
  const key = time.toFixed(1);
  if (local.src !== src) {
    local.src = src;
    local.map.clear();
    local.queue = [];
    local.busy = false;
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'auto';
    v.crossOrigin = 'anonymous';
    v.src = src;
    local.video = v;
  }
  if (local.map.has(key)) return local.map.get(key);
  if (!local.queue.includes(key)) {
    local.queue.push(key);
    if (local.queue.length > 24) local.queue.shift();
  }
  pumpLocal();
  return null;
}

function pumpLocal() {
  const v = local.video;
  if (!v || local.busy || !local.queue.length) return;
  if (v.readyState < 1) {
    v.addEventListener('loadedmetadata', pumpLocal, { once: true });
    return;
  }
  local.busy = true;
  const key = local.queue.pop(); // newest request first
  const done = () => {
    try {
      const c = document.createElement('canvas');
      c.width = 240;
      c.height = Math.round((240 * (v.videoHeight || 9)) / (v.videoWidth || 16));
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      local.map.set(key, c.toDataURL('image/jpeg', 0.72));
    } catch {
      local.map.set(key, '');
    }
    local.busy = false;
    local.subs.forEach((fn) => fn());
    pumpLocal();
  };
  v.addEventListener('seeked', done, { once: true });
  v.currentTime = Math.min(Number(key), Math.max(0, (v.duration || Number(key)) - 0.1));
}

function Thumb({ movie, time }) {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    local.subs.add(fn);
    return () => local.subs.delete(fn);
  }, []);
  const t = Math.round(time * 10) / 10;
  const src = movie?.playbackId ? `https://image.mux.com/${movie.playbackId}/thumbnail.webp?time=${t}&width=320` : movie?.src ? localThumb(movie.src, t) : null;
  return src ? <img className="pb-clip-img" src={src} alt="" draggable={false} /> : <span className="pb-clip-img pb-clip-img--wait" />;
}

/* ---------- settings: speed, subtitles, picture in picture ---------- */

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
    requestAnimationFrame(() => wrap.current?.querySelector('.pb-pop button')?.focus({ preventScroll: true, focusVisible: false }));
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open, wrap, trigger]);
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const rateName = (r) => (r === 1 ? 'Normal' : `${r}×`);

export const CAPTION_COLORS = [
  { id: 'white', name: 'White', value: '#ffffff' },
  { id: 'yellow', name: 'Yellow', value: '#ffe14d' },
  { id: 'cream', name: 'Cream', value: '#f4e3c1' },
  { id: 'cyan', name: 'Cyan', value: '#8ee8f0' },
  { id: 'pink', name: 'Pink', value: '#ffb3c7' },
];
const CAPTION_FONTS = {
  sans: { name: 'Sans', css: "'Atkinson Hyperlegible Next Variable', 'Atkinson Hyperlegible Next', system-ui, sans-serif" },
  serif: { name: 'Serif', css: "'Literata Variable', Literata, Georgia, serif" },
  mono: { name: 'Mono', css: "'DM Mono', ui-monospace, monospace" },
};
const CAPTION_SIZES = { s: { name: 'Small', scale: 0.8 }, m: { name: 'Medium', scale: 1 }, l: { name: 'Large', scale: 1.25 }, xl: { name: 'Extra large', scale: 1.55 } };

function SettingsKey({ open, setOpen }) {
  const wrap = useRef(null);
  const [page, setPage] = useState('main');
  usePopover(open, setOpen, wrap, '.pb-settings');
  useEffect(() => {
    if (!open) setPage('main');
  }, [open]);
  useEffect(() => {
    if (open) requestAnimationFrame(() => wrap.current?.querySelector('.pb-pop button')?.focus({ preventScroll: true, focusVisible: false }));
  }, [page, open]);
  return (
    <div className="pb-pop-wrap" ref={wrap}>
      <button type="button" className="pb-btn pb-settings" aria-label="Settings" aria-haspopup="dialog" aria-expanded={open} data-cursor="Setup" onClick={() => setOpen(!open)}>
        <I.Settings />
      </button>
      {open && (
        <div className="pb-pop" role="dialog" aria-label="Settings">
          {page === 'main' && <SettingsMain go={setPage} />}
          {page === 'speed' && <SpeedPage back={() => setPage('main')} />}
          {page === 'subs' && <SubtitlesPage back={() => setPage('main')} />}
        </div>
      )}
    </div>
  );
}

function SettingsMain({ go }) {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate);
  const pipOk = usePlayer((s) => s.pictureInPictureAvailability === 'available');
  const pip = usePlayer((s) => s.isPictureInPicture);
  const style = useApp((s) => s.captionStyle);
  return (
    <div className="pb-menu">
      <p className="pb-menu-title">Settings</p>
      <button type="button" className="pb-row" onClick={() => go('speed')} data-cursor="Open">
        <span>Playback speed</span>
        <span className="pb-row-value">{rateName(rate)}</span>
        <I.Chevron />
      </button>
      <button type="button" className="pb-row" onClick={() => go('subs')} data-cursor="Open">
        <span>Subtitle style</span>
        <span className="pb-row-value">{`${CAPTION_FONTS[style.font]?.name ?? 'Sans'}, ${(CAPTION_SIZES[style.size] ?? CAPTION_SIZES.m).name.toLowerCase()}`}</span>
        <I.Chevron />
      </button>
      {pipOk && (
        <button
          type="button"
          className="pb-row"
          role="switch"
          aria-checked={pip}
          data-cursor={pip ? 'Off' : 'On'}
          onClick={() => (pip ? store.exitPictureInPicture() : store.requestPictureInPicture())?.catch?.(() => {})}
        >
          <span>Picture in picture</span>
          <span className="pb-toggle" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function SpeedPage({ back }) {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate);
  return (
    <div className="pb-menu">
      <button type="button" className="pb-menu-back" onClick={back} data-cursor="Back">
        <I.Chevron back />
        Playback speed
      </button>
      <div role="radiogroup" aria-label="Playback speed" className="pb-list">
        {RATES.map((r) => (
          <button key={r} type="button" role="radio" aria-checked={rate === r} className="pb-row pb-row--choice" onClick={() => store.setPlaybackRate(r)}>
            <span className="pb-row-check">{rate === r && <I.Check />}</span>
            <span>{rateName(r)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SubtitlesPage({ back }) {
  const style = useApp((s) => s.captionStyle);
  const set = useApp((s) => s.setCaptionStyle);
  const custom = !CAPTION_COLORS.some((c) => c.value === style.color);
  const pick = (patch) => {
    set(patch);
    sfx('tick');
  };
  const Seg = ({ label, value, options, field }) => (
    <div className="pb-field">
      <span className="pb-field-label">{label}</span>
      <div className="pb-seg" role="radiogroup" aria-label={label} style={{ '--n': options.length }}>
        {options.map(([v, text, css]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => pick({ [field]: v })} style={css}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
  return (
    <div className="pb-menu">
      <button type="button" className="pb-menu-back" onClick={back} data-cursor="Back">
        <I.Chevron back />
        Subtitle style
      </button>
      <p className="pb-sample" aria-hidden="true">
        <span
          className="pb-cue"
          data-box={!style.outline || undefined}
          style={{ color: style.color, fontFamily: (CAPTION_FONTS[style.font] ?? CAPTION_FONTS.sans).css, fontSize: `${15 * (CAPTION_SIZES[style.size] ?? CAPTION_SIZES.m).scale}px` }}
        >
          The booth keeps it.
        </span>
      </p>
      <Seg label="Font" field="font" value={style.font} options={Object.entries(CAPTION_FONTS).map(([k, f]) => [k, f.name, { fontFamily: f.css }])} />
      <Seg label="Size" field="size" value={style.size ?? 'm'} options={[['s', 'S'], ['m', 'M'], ['l', 'L'], ['xl', 'XL']]} />
      <div className="pb-field">
        <span className="pb-field-label">Color</span>
        <div className="pb-swatches" role="radiogroup" aria-label="Subtitle color">
          {CAPTION_COLORS.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={style.color === c.value} aria-label={c.name} className="pb-swatch" style={{ '--c': c.value }} onClick={() => pick({ color: c.value })} />
          ))}
          <label className="pb-swatch pb-swatch--custom" data-checked={custom || undefined} style={{ '--c': custom ? style.color : 'conic-gradient(#ff6b6b, #ffe14d, #8ee8f0, #b48cff, #ff6b6b)' }}>
            <span className="sr-only">Custom color</span>
            <input type="color" value={custom ? style.color : '#ffffff'} onChange={(e) => set({ color: e.target.value })} />
          </label>
        </div>
      </div>
      <Seg label="Edge" field="outline" value={style.outline} options={[[true, 'Outline'], [false, 'Box']]} />
    </div>
  );
}

/* ---------- captions on the picture ---------- */

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
  return (
    <div className="pb-captions" aria-hidden="true" style={{ '--cap-scale': (CAPTION_SIZES[style.size] ?? CAPTION_SIZES.m).scale }}>
      {lines.map((text, i) => (
        <p key={i} className="pb-cue" data-box={!style.outline || undefined} style={{ color: style.color, fontFamily: (CAPTION_FONTS[style.font] ?? CAPTION_FONTS.sans).css }}>
          {text.split('\n').map((l, j) => (
            <span key={j}>{l}</span>
          ))}
        </p>
      ))}
    </div>
  );
}

/* ---------- frame picker ---------- */

function FrameThumb({ border }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const L = frameLayout(border, 16 / 9, 220);
    el.width = L.W;
    el.height = L.H;
    paintComposite(el.getContext('2d'), border, L, {}, (g, win) => {
      const grad = g.createLinearGradient(0, win.y, 0, win.y + win.h);
      grad.addColorStop(0, '#d9b98f');
      grad.addColorStop(1, '#6d5444');
      g.fillStyle = grad;
      g.fillRect(win.x, win.y, win.w, win.h);
    });
  }, [border]);
  return <canvas ref={ref} className="frame-thumb" aria-hidden="true" />;
}

/**
 * Every frame in one grid that fills the panel: the column count always
 * divides the number of frames, so no row is left half empty.
 */
function useFrameGrid(ref, count) {
  const [grid, setGrid] = useState({ cols: 3, rows: Math.ceil(count / 3), size: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const divisors = [];
      for (let c = 1; c <= count; c++) if (count % c === 0) divisors.push(c);
      // tiles are about 1.35 times as wide as tall (thumbnail + name)
      let best = null;
      for (const cols of divisors) {
        const rows = count / cols;
        const tw = (w - (cols - 1) * 6) / cols;
        const th = (h - (rows - 1) * 6) / rows;
        const size = Math.min(tw, th * 1.35);
        const score = size - (tw / th > 2.4 || th / tw > 1.2 ? 1000 : 0);
        if (!best || score > best.score) best = { cols, rows, size, score };
      }
      setGrid(best);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, count]);
  return grid;
}

function FramePicker({ active }) {
  const borderId = useApp((s) => s.borderId);
  const setBorder = useApp((s) => s.setBorder);
  const group = useRef(null);
  const selected = borderById(borderId);
  const grid = useFrameGrid(group, BORDERS.length);

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
      <div className="pb-picker-head">
        <h2 className="pb-picker-title" id="pb-picker-title">Choose a frame</h2>
        <p className="pb-picker-name" aria-live="polite">{selected.name}</p>
      </div>
      <div
        ref={group}
        className="pb-frames"
        role="radiogroup"
        aria-labelledby="pb-picker-title"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${grid.rows}, minmax(0, 1fr))` }}
        onKeyDown={(e) => {
          const rtl = document.dir === 'rtl';
          const cols = grid.cols;
          const map = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: cols, ArrowUp: -cols };
          if (map[e.key] != null) {
            e.preventDefault();
            move(map[e.key]);
          }
        }}
      >
        {BORDERS.map((b) => {
          const on = b.id === borderId;
          return (
            <button key={b.id} type="button" role="radio" aria-checked={on} aria-label={b.name} tabIndex={on ? 0 : -1} data-id={b.id} data-cursor="Pick" className="frame-opt" onClick={() => choose(b.id)}>
              <FrameThumb border={b} />
            </button>
          );
        })}
      </div>
      <div className="pb-picker-actions">
        <button type="button" className="btn" data-cursor="Back" onClick={() => useApp.getState().goStation('player')}>
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          data-cursor="Start"
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
      </div>
    </aside>
  );
}

/* ---------- keys ---------- */

function PlayboothHotkeys({ enabled, onFullscreen }) {
  const off = !enabled;
  const snap = useCallback(() => {
    sfx('shutter');
    snapPhoto();
  }, []);
  useHotkey({ keys: 's', action: 'snapshot', disabled: off, onActivate: snap });
  useHotkey({ keys: 'f', action: 'fullscreen', disabled: off, onActivate: onFullscreen });
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
      <Hotkey keys="c" action="toggleSubtitles" disabled={off} />
      <Hotkey keys="i" action="togglePictureInPicture" disabled={off} />
    </>
  );
}
