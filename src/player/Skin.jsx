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
  useContainer,
  useHotkey,
  useQualityOptions,
} from '@videojs/react';
import { getMediaSnapshot, subscribeToInputActions } from '@videojs/core/dom';
import { useApp, movieById } from '../store.js';
import { BORDERS, CUSTOM, borderById, formatTimecode, frameEvents, frameLayout, paintComposite, paintOverlay, warmFrame } from '../data/borders.js';
import { MOVIES } from '../data/movies.js';
import { snapPhoto } from '../lib/printFlow.js';
import { sfx } from '../lib/sfx.js';
import { usePlayer } from './core.js';
import * as I from './icons.jsx';

/*
 * The PLAYBOOTH player.
 *
 * Landscape (desktop, tablets, phones on their side, every full screen):
 *   [ booth rail ]   [ framed picture ]   [ progress | keys ]
 * The rail is one key wide, the dock as wide as its columns, and the framed
 * picture takes everything between. The progress runs top to bottom, like
 * scrolling a feed; hovering or dragging it floats three clips beside it,
 * the one you are on outlined.
 *
 * Portrait phones: the same dock lies on its side under the picture.
 *
 * While the film plays and nobody touches anything, the rail and the dock
 * step away and the framed picture grows into the room they leave.
 */

/* ---------- layout ---------- */

const SCRUB_W = 40;
const SCRUB_GAP = 14;
const H_DOCK = 196; // portrait dock height

/**
 * How the vertical dock arranges its keys for a given height. One column
 * of keys beside the progress whenever the height allows it (the slimmest
 * dock, so the picture keeps the most room); a second column only below
 * about 470 px, which is a phone on its side; a third only when even that
 * won't fit. Keys never go under 38 px.
 */
function dockSpec(h) {
  if (h >= 600) return { cols: 1, key: 46, play: 58, min: 600 };
  if (h >= 530) return { cols: 1, key: 42, play: 52, min: 530 };
  if (h >= 470) return { cols: 1, key: 38, play: 48, min: 470 };
  if (h >= 384) return { cols: 2, key: 44, play: 56, min: 384 };
  if (h >= 320) return { cols: 2, key: 40, play: 50, min: 320 };
  return { cols: 3, key: 38, play: 46, min: 214 };
}
const keysWidth = (s) => (s.cols === 1 ? Math.max(s.key, s.play) : s.cols === 2 ? s.key * 2 + 8 : s.key * 2 + s.play + 12);
const dockWidth = (s) => SCRUB_W + SCRUB_GAP + keysWidth(s);

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
function computeLayout({ border, aspect, sw, sh, fs, picker, shown, host = 'booth' }) {
  const portrait = sw / sh < 0.9;
  const m = fs ? 0 : Math.round(Math.min(22, Math.max(10, Math.min(sw, sh) * 0.025)));
  const gap = fs ? 0 : Math.round(Math.min(18, Math.max(10, sw * 0.012)));

  // choosing a frame is about the frame: show the picture in it, the controls come with the film
  if (picker) {
    const titleH = sh >= 420 ? 40 : 0;
    const f = fitFrame(border, aspect, sw - m * 2, sh - m * 2 - titleH);
    const y = titleH + m + (sh - m * 2 - titleH - f.H) / 2;
    return { portrait, frame: { ...f, x: (sw - f.W) / 2, y }, title: titleH ? { x: (sw - f.W) / 2, y: m, w: f.W, h: titleH - 8 } : null };
  }

  if (portrait) {
    const avW = sw - m * 2;
    if (!shown) {
      const f = fitFrame(border, aspect, avW, sh - m * 2);
      return { portrait, frame: { ...f, x: (sw - f.W) / 2, y: (sh - f.H) / 2 } };
    }
    /*
     * Top to bottom, as one group centred in the height. In the booth: its
     * keys in a row of their own, then the title right above the picture it
     * names (the whole width, so it never gets cut short), the picture and
     * the dock. Outside the booth there are no booth keys: the frames, the
     * films gather in one wide key under the dock, where the
     * thumb already is.
     */
    const head = !fs;
    const booth = host === 'booth';
    const ROW = 44;
    const TITLE = 54; // the name, and room for the credit to take two lines on a narrow phone
    const PILL = 48;
    const headH = head ? (booth ? ROW + gap : 0) + TITLE : 0;
    const footH = head && !booth ? gap + PILL : 0;
    const f = fitFrame(border, aspect, avW, sh - m * 2 - headH - H_DOCK - gap - footH);
    const total = headH + f.H + gap + H_DOCK + footH;
    const y0 = m + Math.max(0, (sh - m * 2 - total) / 2);
    const fy = y0 + headH;
    const dw = Math.min(avW, Math.max(Math.min(f.W, 470), 340));
    const dockY = fy + f.H + gap;
    const pw = Math.min(avW, 280);
    return {
      portrait,
      frame: { ...f, x: (sw - f.W) / 2, y: fy },
      dock: { orient: 'h', x: (sw - dw) / 2, y: dockY, w: dw, h: H_DOCK, spec: { key: 44, play: 58 } },
      rail: head && booth ? { orient: 'h', x: m, y: y0, w: avW, h: ROW, key: ROW } : null,
      title: head ? { x: m, y: y0 + (booth ? ROW + gap : 0), w: avW, h: TITLE - 6 } : null,
      menu: head && !booth ? { x: (sw - pw) / 2, y: dockY + H_DOCK + gap, w: pw, h: PILL } : null,
    };
  }

  const titleH = !fs && sh >= 540 ? 40 : 0;
  // the booth rail needs one key's width; on a very narrow player it steps aside for the picture
  const rail = !picker && sw - m * 2 - (gap + dockWidth(dockSpec(sh - m * 2))) - (gap + 46) >= 200;
  if (!shown) {
    const f = fs ? fillFrame(border, aspect, sw, sh) : fitFrame(border, aspect, sw - m * 2, sh - m * 2);
    return { portrait, frame: { ...f, x: (sw - f.W) / 2, y: (sh - f.H) / 2 } };
  }

  /*
   * Rail | frame | dock, each taking only the room it needs: the rail one key
   * wide, the dock its progress and key columns, and the framed picture every
   * pixel in between. When the picture is limited by height, the three are
   * centred together, so the margins left and right still match.
   */
  if (fs) {
    const mv = 16;
    const g = 14;
    const edge = 12;
    const spec = dockSpec(sh - mv * 2);
    const dw = dockWidth(spec);
    const left = edge + (rail ? spec.key + g : 0);
    const right = g + dw + edge;
    const f = fillFrame(border, aspect, sw - left - right, sh);
    return {
      portrait,
      frame: { ...f, x: left, y: 0 },
      dock: { orient: 'v', x: sw - edge - dw, y: mv, w: dw, h: sh - mv * 2, spec },
      rail: rail ? { orient: 'v', x: edge, y: mv, w: spec.key, h: sh - mv * 2, key: spec.key, top: spec.cols === 1 ? 44 : 26 } : null,
    };
  }
  const top = m + titleH;
  const avH = sh - top - m;
  // the column count follows the height the dock has, not the picture: as few columns as fit
  let spec = dockSpec(avH);
  const sides = (sp) => (rail ? sp.key + gap : 0) + gap + dockWidth(sp);
  let f = fitFrame(border, aspect, sw - m * 2 - sides(spec), avH);
  // a wide picture is shorter than the room: size the keys to the frame (never adding a column) so the dock lines up with it
  for (let i = 0; i < 3; i++) {
    const tight = dockSpec(f.H);
    if (tight.cols !== spec.cols || tight.key >= spec.key) break;
    spec = tight;
    f = fitFrame(border, aspect, sw - m * 2 - sides(spec), avH);
  }
  const dw = dockWidth(spec);
  const dh = Math.max(f.H, spec.min);
  const groupW = sides(spec) + f.W;
  const gx = m + Math.max(0, (sw - m * 2 - groupW) / 2);
  const x0 = gx + (rail ? spec.key + gap : 0);
  const fy = top + (avH - f.H) / 2;
  const dy = fy + (f.H - dh) / 2;
  return {
    portrait,
    frame: { ...f, x: x0, y: fy },
    dock: { orient: 'v', x: x0 + f.W + gap, y: dy, w: dw, h: dh, spec },
    rail: rail ? { orient: 'v', x: gx, y: dy, w: spec.key, h: dh, key: spec.key, top: spec.cols === 1 ? 44 : 26 } : null,
    // the title sits right above the picture it names, not up at the edge when the picture is centred lower
    title: titleH ? { x: x0, y: Math.max(m, fy - titleH), w: f.W, h: titleH - 8 } : null,
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
      const yes = !!el && !!el.closest?.('[data-fs-root], .pb-skin');
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
    const el = document.querySelector('[data-fs-root]');
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
  const host = useApp((s) => s.host);
  const brightness = useApp((s) => s.brightness);
  const store = usePlayer();
  const paused = usePlayer((s) => s.paused);
  const fs = useFullscreen();
  const pseudo = useApp((s) => s.pseudoFs);
  const calm = useApp((s) => s.reducedMotion);
  useApp((s) => s.borderRev); // a new picture for "your frame" repaints under the same id
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

  // locking is instant: the keys go, one unlock key stays, one click brings everything back
  const lock = () => {
    animate.current = false;
    // the lock key is about to go, and with it the focus; the hotkeys only listen inside the player, so
    // hand the focus to the player itself, or volume and brightness keys would stop answering
    const root = (document.activeElement?.closest?.('.pb-skin')) || stageRef.current?.closest('.pb-skin');
    requestAnimationFrame(() => root?.focus({ preventScroll: true, focusVisible: false }));
    setPop(null);
    setLocked(true);
    sfx('switch');
    useApp.getState().announce('Controls locked. Use the unlock key to bring them back.');
    flashUnlock();
  };
  const unlock = () => {
    animate.current = false;
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
    () => (size.w ? computeLayout({ border, aspect, sw: size.w, sh: size.h, fs: fs.active, picker, shown, host }) : null),
    [border, aspect, size.w, size.h, fs.active, picker, shown, host],
  );
  // the dock and rail keep their places while they step away
  const shownGeo = useMemo(
    () => (size.w ? (shown ? geo : computeLayout({ border, aspect, sw: size.w, sh: size.h, fs: fs.active, picker, shown: true, host })) : null),
    [geo, shown, border, aspect, size.w, size.h, fs.active, picker, host],
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
    '--k-play-bg': k.playKey?.[0] ?? k.ink,
    '--k-play-ink': k.playKey?.[1] ?? k.surface,
    '--k-glow': luminance(k.accent) >= 0.25 ? k.accent : k.surface,
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
    if (useApp.getState().host === 'booth' && useApp.getState().station === 'watch') {
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

  /*
   * The picture itself. Mouse: a click plays or pauses. Touch: with the
   * controls away, a tap brings them back; with them up, a tap plays or
   * pauses. Either way a large key flashes in the middle to say what
   * happened (the dock's own keys don't need it: they show it themselves).
   */
  const playFromPicture = () => {
    const was = store.paused;
    togglePlay();
    showFeedback({ icon: was ? 'play' : 'pause' });
  };
  // touch: a double tap on the left or right of the picture steps back or forward 10 s, as on any phone player
  const taps = useRef({ t: 0, side: null, timer: 0 });
  useEffect(() => () => clearTimeout(taps.current.timer), []);
  const touchTap = () => {
    if (idle) poke();
    else {
      playFromPicture();
      poke();
    }
  };
  const onPictureClick = (e) => {
    if (swipeEnded.current) return; // the end of a swipe is not a tap
    if (locked) {
      flashUnlock();
      return;
    }
    if (!playing) return;
    if (pointerKind.current === 'mouse') {
      playFromPicture();
      poke();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const f = (e.clientX - r.left) / r.width;
    const side = f < 0.4 ? 'back' : f > 0.6 ? 'fwd' : null;
    const now = performance.now();
    const tp = taps.current;
    if (side && tp.side === side && now - tp.t < 320) {
      clearTimeout(tp.timer);
      tp.t = now; // keep tapping to keep stepping
      try {
        const st = store.state;
        store.seek(clamp((st.currentTime || 0) + (side === 'back' ? -10 : 10), 0, Math.max(0, (st.duration || 0) - 0.25)));
      } catch {
        /* no media yet */
      }
      showFeedback({ icon: side, step: 10, side });
      sfx('tick');
      return;
    }
    clearTimeout(tp.timer);
    taps.current = { t: now, side, timer: side ? setTimeout(touchTap, 270) : 0 };
    if (!side) touchTap();
  };

  /*
   * Phones and tablets: hold and slide up or down on the picture. The right
   * half sets the volume, the left half the brightness, each with a level
   * that rises beside your thumb. iPhones keep the volume for their own
   * buttons, so there the right half says so instead.
   */
  const swipe = useRef(null);
  const swipeEnded = useRef(false);
  const [gauge, setGauge] = useState(null);
  const gaugeTimer = useRef(0);
  const onWindowDown = (e) => {
    pointerKind.current = e.pointerType || 'mouse';
    if (e.pointerType !== 'touch' || !playing) return; // works while locked too: sound and light stay in reach
    const r = e.currentTarget.getBoundingClientRect();
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY, h: r.height, side: e.clientX - r.left < r.width / 2 ? 'brightness' : 'volume', on: false };
  };
  const onWindowMove = (e) => {
    const sw = swipe.current;
    if (!sw || e.pointerId !== sw.id) return;
    if (!sw.on) {
      const dx = e.clientX - sw.x;
      const dy = e.clientY - sw.y;
      if (Math.abs(dy) < 14 || Math.abs(dy) < Math.abs(dx) * 1.3) return;
      sw.on = true;
      sw.y = e.clientY;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      if (sw.side === 'volume') {
        const st = store.state;
        if (st.volumeAvailability === 'unsupported') {
          sw.fixed = true;
          showFeedback({ icon: 'volume', label: 'Use the phone’s volume buttons' });
          return;
        }
        sw.start = st.muted ? 0 : st.volume;
      } else sw.start = useApp.getState().brightness;
    }
    if (sw.fixed) return;
    clearTimeout(gaugeTimer.current);
    const delta = -(e.clientY - sw.y) / Math.max(120, sw.h * 0.8);
    if (sw.side === 'volume') {
      const v = clamp(sw.start + delta, 0, 1);
      store.setVolume(v);
      setGauge({ kind: 'volume', level: v, pct: Math.round(v * 100) });
    } else {
      const b = clamp(sw.start + delta * 1.2, BRIGHT_MIN, BRIGHT_MAX);
      useApp.setState({ brightness: b });
      setGauge({ kind: 'brightness', level: (b - BRIGHT_MIN) / (BRIGHT_MAX - BRIGHT_MIN), pct: Math.round(b * 100) });
    }
  };
  const onWindowUp = (e) => {
    const sw = swipe.current;
    if (!sw || e.pointerId !== sw.id) return;
    swipe.current = null;
    if (!sw.on) return;
    swipeEnded.current = true;
    setTimeout(() => (swipeEnded.current = false), 350);
    clearTimeout(gaugeTimer.current);
    gaugeTimer.current = setTimeout(() => setGauge(null), 650);
    if (!sw.fixed) useApp.getState().announce(sw.side === 'volume' ? `Volume ${Math.round((store.state.muted ? 0 : store.state.volume) * 100)}%.` : `Brightness ${Math.round(useApp.getState().brightness * 100)}%.`);
  };
  useEffect(() => () => clearTimeout(gaugeTimer.current), []);
  // the volume and brightness keys show the same level as the slides
  useEffect(() => {
    if (!gaugeBus) return undefined;
    const on = (e) => {
      clearTimeout(gaugeTimer.current);
      setGauge(e.detail);
      gaugeTimer.current = setTimeout(() => setGauge(null), 900);
    };
    gaugeBus.addEventListener('show', on);
    return () => gaugeBus.removeEventListener('show', on);
  }, []);

  // a moving mouse or a touch on the controls keeps them up; a resting mouse lets them go
  const onStagePointer = (e) => {
    pointerKind.current = e.pointerType || 'mouse';
    if (locked) {
      // locked: the unlock key hides; a tap, or a mouse that really moves, brings it back for a moment
      if (e.type === 'pointerdown') flashUnlock();
      else if (e.pointerType === 'mouse') {
        const p = lastPoint.current;
        const moved = !p || Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y) > 2;
        lastPoint.current = { x: e.clientX, y: e.clientY };
        if (moved) flashUnlock();
      }
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
      data-calm={calm || undefined}
      data-scrubbing={scrubbing || undefined}
      style={theme}
      aria-label={movie ? `PLAYBOOTH player, ${movie.title}` : 'PLAYBOOTH player'}
      onKeyDown={onKeyDown}
    >
      <div className="pb-stage" ref={stageRef} onPointerMove={onStagePointer} onPointerDown={onStagePointer}>
        {geo && shownGeo && (
          <>
            {shownGeo.title && (
              <p className="pb-title" data-hidden={!shown || undefined} style={{ left: shownGeo.title.x, top: shownGeo.title.y, width: shownGeo.title.w, height: shownGeo.title.h }}>
                <span className="pb-title-name">{movie?.title}</span>
                <span className="pb-title-credit">{movie ? `${movie.studio ?? movie.credit} · ${movie.year}` : ''}</span>
              </p>
            )}
            {shownGeo.rail && (
              <Rail geo={shownGeo.rail} movie={movie} hidden={!shown} hover={controlsHover} pop={pop} setPop={setPop} />
            )}
            <div ref={frameRef} className="pb-frame" style={{ left: geo.frame.x, top: geo.frame.y, width: geo.frame.W, height: geo.frame.H }}>
              <div
                className="pb-window"
                style={{
                  left: geo.frame.win.x,
                  top: geo.frame.win.y,
                  width: geo.frame.win.w,
                  height: geo.frame.win.h,
                  borderRadius: geo.frame.win.r || undefined,
                  '--bright': brightness,
                  '--osd': `${Math.round(clamp(Math.min(geo.frame.win.w, geo.frame.win.h) * 0.2, 52, 92))}px`,
                }}
                onPointerDown={onWindowDown}
                onPointerMove={onWindowMove}
                onPointerUp={onWindowUp}
                onPointerCancel={onWindowUp}
                onClick={onPictureClick}
                onDoubleClick={() => playing && !locked && pointerKind.current === 'mouse' && fs.toggle()}
              >
                {children}
                <Poster.Root className="pb-poster">
                  <Poster.Image className="pb-poster-img" alt="" />
                </Poster.Root>
                <BufferingIndicator className="pb-buffering" render={(props) => <div {...props}><span className="pb-spinner" /></div>} />
                <Flash />
                <Feedback />
                <Gauge g={gauge} />
                <ErrorDialog.Root>
                  <ErrorDialog.Popup className="pb-error">
                    <ErrorDialog.Title className="pb-error-title" />
                    <ErrorDialog.Description className="pb-error-text" />
                    <ErrorDialog.Close className="btn btn--primary" />
                  </ErrorDialog.Popup>
                </ErrorDialog.Root>
              </div>
              <FrameArt border={border} frame={geo.frame} />
              <div className="pb-capbox" style={{ left: geo.frame.win.x, top: geo.frame.win.y, width: geo.frame.win.w, height: geo.frame.win.h }}>
                <CaptionLayer />
              </div>
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
            {shownGeo.menu && <FilmMenu geo={shownGeo.menu} hidden={!shown} hover={controlsHover} pop={pop} setPop={setPop} />}
            {locked && (
              <button
                type="button"
                className="pb-btn pb-unlock"
                data-bright={unlockShown || undefined}
                aria-label="Unlock controls"
                data-tip="Unlock the controls"
                onClick={unlock}
                onFocus={() => {
                  clearTimeout(unlockTimer.current);
                  setUnlockShown(true);
                }}
                onBlur={flashUnlock}
                // resting on it keeps it there; leaving starts the short countdown again
                onPointerEnter={() => clearTimeout(unlockTimer.current)}
                onPointerLeave={flashUnlock}
              >
                <I.Lock />
              </button>
            )}
          </>
        )}
      </div>

      {picker && <FramePicker active={station === 'watch'} />}
      <CaptionCss />
      <PlayboothHotkeys enabled={playing && !locked} levels={playing} onFullscreen={fs.toggle} />
      <div className="sr-only">
        <StatusAnnouncer />
      </div>
    </Container>
  );
}

/* ---------- the frame, painted to the exact size of the picture ---------- */

/** A tick that changes whenever a pattern frame's picture finishes loading, so painted frames redraw. */
function useFrameImages() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!frameEvents) return undefined;
    const on = () => setN((x) => x + 1);
    frameEvents.addEventListener('load', on);
    return () => frameEvents.removeEventListener('load', on);
  }, []);
  return n;
}

function FrameArt({ border, frame }) {
  const canvas = useRef(null);
  const loaded = useFrameImages();
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
  }, [border, frame, loaded]);
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

function Rail(props) {
  const host = useApp((s) => s.host);
  return host === 'booth' ? <BoothRail {...props} /> : <ShowcaseRail {...props} />;
}

/** What the keys outside the booth do: open the frames, surprise me with one, change the film. */
const showcase = {
  frames() {
    useApp.setState({ deck: 'frame' });
    sfx('tap');
  },
  nextFilm() {
    const s = useApp.getState();
    const i = MOVIES.findIndex((m) => m.id === s.insertedTapeId);
    const next = MOVIES[(i + 1) % MOVIES.length];
    useApp.setState({ insertedTapeId: next.id, deck: 'playing' });
    s.announce(`${next.title}.`);
    sfx('tap');
  },
  shuffle() {
    const s = useApp.getState();
    const pool = BORDERS.filter((b) => b.id !== s.borderId && b.id !== 'none');
    const b = pool[Math.floor(Math.random() * pool.length)];
    useApp.setState({ borderId: b.id });
    s.announce(`${b.name} frame.`);
    sfx('paper');
  },
};

/**
 * Outside the booth the left keys do what a demo needs: the frame (choose
 * one, surprise me), then the next film. An embedded player has one film.
 */
function ShowcaseRail({ geo, hidden, hover, pop, setPop }) {
  const v = geo.orient === 'v';
  const films = useApp((s) => s.host) !== 'embed';
  return (
    <nav
      className="pb-rail"
      data-orient={geo.orient}
      data-tip-side={v ? 'right' : 'bottom'}
      data-hidden={hidden || undefined}
      aria-label="Frames and films"
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h, '--key': geo.key ? `${geo.key}px` : undefined }}
      inert={hidden || undefined}
      {...hover}
    >
      <div className="pb-rail-group">
        <button type="button" className="pb-btn pb-rail-key" aria-label="Choose a frame" data-tip="Frames" onClick={showcase.frames}>
          <I.Frames />
        </button>
        <button type="button" className="pb-btn pb-rail-key" aria-label="Surprise frame" data-tip="Surprise frame" onClick={showcase.shuffle}>
          <I.Shuffle />
        </button>
      </div>
      {films && (
        <button type="button" className="pb-btn pb-rail-key" aria-label="Next film" data-tip="Next film" onClick={showcase.nextFilm}>
          <I.Tape />
        </button>
      )}
    </nav>
  );
}

/**
 * Upright, outside the booth: the frames and the films in one
 * wide key under the dock, where the thumb rests. It is a pill with words,
 * filled with the keys' ink, so it never reads as one of the playback keys.
 */
function FilmMenu({ geo, hidden, hover, pop, setPop }) {
  const open = pop === 'menu';
  const wrap = useRef(null);
  const films = useApp((s) => s.host) !== 'embed';
  usePopover(open, (o) => setPop(o ? 'menu' : null), wrap, '.pb-menu-key');
  const run = (fn) => () => {
    setPop(null);
    fn();
  };
  const items = [
    ['frames', 'Frames', <I.Frames key="i" />, run(showcase.frames)],
    ['shuffle', 'Surprise frame', <I.Shuffle key="i" />, run(showcase.shuffle)],
    films && ['next', 'Next film', <I.Tape key="i" />, run(showcase.nextFilm)],
  ].filter(Boolean);
  return (
    <div
      className="pb-filmmenu"
      ref={wrap}
      data-hidden={hidden || undefined}
      inert={hidden || undefined}
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h }}
      {...hover}
    >
      <button type="button" className="pb-menu-key" aria-haspopup="menu" aria-expanded={open} onClick={() => setPop(open ? null : 'menu')}>
        <I.Frames />
        <span>{films ? 'Frames and films' : 'Frames'}</span>
        <I.Chevron />
      </button>
      {open && (
        <div className="pb-pop pb-pop--menu" role="menu" aria-label="Frames and films">
          {items.map(([id, label, icon, act]) => (
            <button key={id} type="button" role="menuitem" className="pb-row pb-row--icon" onClick={act}>
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BoothRail({ geo, movie, hidden, hover, pop, setPop }) {
  const snaps = useApp((s) => s.snaps.length);
  const total = useApp((s) => s.collection.length);
  const v = geo.orient === 'v';
  const back = () => {
    if (useApp.getState().pseudoFs) useApp.setState({ pseudoFs: false });
    if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    useApp.getState().goStation('player');
  };
  // grouped by what they do: leave, your pictures (snaps, album), the tape
  return (
    <nav
      className="pb-rail"
      data-orient={geo.orient}
      data-tip-side={v ? 'right' : 'bottom'}
      data-hidden={hidden || undefined}
      aria-label="Booth"
      style={{ left: geo.x, top: geo.y, width: geo.w, height: geo.h, '--key': geo.key ? `${geo.key}px` : undefined }}
      inert={hidden || undefined}
      {...hover}
    >
      <button type="button" className="pb-btn pb-rail-key" aria-label="Back to the booth" data-tip="Back to the booth" data-key="Esc" onClick={back}>
        <I.Back />
      </button>
      <div className="pb-rail-group">
        <button type="button" className="pb-btn pb-rail-key" aria-label={`Snaps, ${snaps}`} data-tip="Your snaps" onClick={() => useApp.getState().setCompilerOpen(true)}>
          <I.Stack />
          {snaps > 0 && <span className="pb-badge" aria-hidden="true">{snaps}</span>}
        </button>
        <button type="button" className="pb-btn pb-rail-key" aria-label={`Album, ${total} prints`} data-tip="Album" onClick={() => useApp.getState().setAlbumOpen(true)}>
          <I.Album />
        </button>
      </div>
      <button type="button" className="pb-btn pb-rail-key" aria-label={`Eject ${movie?.title ?? 'tape'}`} data-tip="Eject the tape" onClick={() => useApp.getState().ejectTape()}>
        <I.Eject />
      </button>
    </nav>
  );
}

/* ---------- feedback: the key you used, large, in the middle of the picture ---------- */

const BRIGHT_MIN = 0.3;
const BRIGHT_MAX = 1.5;
const feedbackBus = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
function showFeedback(detail) {
  feedbackBus?.dispatchEvent(new CustomEvent('show', { detail }));
}
const gaugeBus = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
/** The level beside the picture's edge: volume on the right, brightness on the left. */
function showGauge(kind, value) {
  const level = kind === 'brightness' ? (value - BRIGHT_MIN) / (BRIGHT_MAX - BRIGHT_MIN) : value;
  gaugeBus?.dispatchEvent(new CustomEvent('show', { detail: { kind, level: clamp(level, 0, 1), pct: Math.round(value * 100) } }));
}
/** Brightness by key: one step is 10%. */
function stepBrightness(dir) {
  const b = clamp(Math.round((useApp.getState().brightness + dir * 0.1) * 10) / 10, BRIGHT_MIN, BRIGHT_MAX);
  useApp.setState({ brightness: b });
  showGauge('brightness', b);
}
const clock = (t) => {
  const s = Math.max(0, Math.floor(t || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

/**
 * Keyboard shortcuts and taps on the picture get a large copy of the key
 * they stand for, in the middle of the picture for a moment: play, pause,
 * sound, captions, a step back or forward, the volume, the speed. Pressing
 * the dock's keys doesn't: the key itself already shows what changed.
 */
function Feedback() {
  const [item, setItem] = useState(null);
  const container = useContainer();
  const store = usePlayer();
  const storeRef = useRef(store);
  storeRef.current = store;
  const timer = useRef(0);
  useEffect(() => {
    if (!feedbackBus) return undefined;
    const on = (e) => {
      clearTimeout(timer.current);
      setItem({ ...e.detail, n: Math.random() });
      timer.current = setTimeout(() => setItem(null), e.detail.label ? 1300 : 760);
    };
    feedbackBus.addEventListener('show', on);
    return () => {
      feedbackBus.removeEventListener('show', on);
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!container) return undefined;
    return subscribeToInputActions(container, (ev) => {
      if (ev.source !== 'hotkey') return;
      const before = getMediaSnapshot(storeRef.current);
      // the store settles a moment after the key (rate and volume come back from the media element)
      const after = (fn) => setTimeout(() => showFeedback(fn(storeRef.current.state)), 90);
      switch (ev.action) {
        case 'togglePaused':
          showFeedback({ icon: before.paused ? 'play' : 'pause' });
          break;
        case 'toggleMuted':
          after((st) => (st.muted ? { icon: 'mute' } : { icon: 'volume', level: st.volume }));
          break;
        case 'toggleSubtitles':
          showFeedback({ icon: before.subtitlesAvailable && !before.subtitlesShowing ? 'cc-on' : 'cc-off' });
          break;
        case 'seekStep':
          showFeedback({ icon: (ev.value ?? 0) < 0 ? 'back' : 'fwd', step: Math.abs(ev.value ?? 10) });
          break;
        case 'volumeStep':
          // a level, not a big key: the same gauge as sliding on a phone
          setTimeout(() => {
            const st = storeRef.current.state;
            showGauge('volume', st.muted ? 0 : st.volume);
          }, 90);
          break;
        case 'speedUp':
        case 'speedDown':
          after((st) => ({ icon: 'text', text: `${st.playbackRate}×` }));
          break;
        case 'seekToPercent': {
          const pct = ev.value ?? (Number.isFinite(+ev.key) ? +ev.key * 10 : 0);
          showFeedback({ icon: 'text', text: clock(((before.duration || 0) * pct) / 100) });
          break;
        }
        default:
          break;
      }
    });
  }, [container]);
  if (!item) return null;
  const glyph = {
    play: <I.Play />,
    pause: <I.Pause />,
    mute: <I.Volume level="off" />,
    volume: <I.Volume level={item.level != null && item.level < 0.5 ? 'low' : 'high'} />,
    'cc-on': <I.Captions on />,
    'cc-off': <I.Captions />,
    back: <I.Seek back step={item.step} />,
    fwd: <I.Seek step={item.step} />,
    text: <span className="pb-osd-text">{item.text}</span>,
  }[item.icon];
  return (
    <div className="pb-osd" key={item.n} data-kind={item.icon} data-side={item.side} aria-hidden="true">
      <span className="pb-osd-key">{glyph}</span>
      {item.label && <span className="pb-osd-label">{item.label}</span>}
    </div>
  );
}

/** The level beside your thumb while you slide: brightness on the left, volume on the right. */
function Gauge({ g }) {
  if (!g) return null;
  const bright = g.kind === 'brightness';
  return (
    <div className="pb-gauge" data-side={bright ? 'left' : 'right'} aria-hidden="true">
      <span className="pb-gauge-icon">{bright ? <I.Brightness /> : <I.Volume level={g.level === 0 ? 'off' : g.level < 0.5 ? 'low' : 'high'} />}</span>
      <span className="pb-gauge-track">
        <span className="pb-gauge-fill" style={{ height: `${Math.round(g.level * 100)}%` }} />
      </span>
      <span className="pb-gauge-value">{g.pct}%</span>
    </div>
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
          <button {...props} data-tip={s.ended ? 'Replay' : s.paused ? 'Play' : 'Pause'} data-key="K">
            {s.ended ? <I.Replay /> : s.paused ? <I.Play /> : <I.Pause />}
          </button>
        )}
      />
    ),
    back: <SeekButton key="back" seconds={-10} className="pb-btn pb-step" label="Back 10 seconds" render={(props) => <button {...props} data-tip="Back 10 seconds" data-key="J"><I.Seek back /></button>} />,
    fwd: <SeekButton key="fwd" seconds={10} className="pb-btn pb-step" label="Forward 10 seconds" render={(props) => <button {...props} data-tip="Forward 10 seconds" data-key="L"><I.Seek /></button>} />,
    vol: <VolumeKey key="vol" v={v} />,
    cc: (
      <button
        key="cc"
        type="button"
        className="pb-btn pb-cc"
        aria-label="Captions"
        aria-pressed={showing}
        data-tip={showing ? 'Captions off' : 'Captions on'}
        data-key="C"
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
      <button key="lock" type="button" className="pb-btn pb-lock" aria-label="Lock controls" data-tip="Lock the controls" onClick={onLock}>
        <I.Unlock />
      </button>
    ),
    snap: (
      <button key="snap" type="button" className="pb-btn pb-snap" aria-label="Snap this frame" data-tip="Snap this frame" data-key="S" data-flash={flash || undefined} onClick={snap}>
        {flash ? <I.Check /> : <I.Camera />}
      </button>
    ),
    fs: (
      <button key="fs" type="button" className="pb-btn pb-fs" aria-label={fs.active ? 'Exit full screen' : 'Full screen'} data-tip={fs.active ? 'Exit full screen' : 'Full screen'} data-key="F" onClick={fs.toggle}>
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
      data-tip-side={geo.orient === 'v' ? 'left' : 'top'}
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

/** Where a key sits inside its dock, so a pop-out can line up with it from outside the dock. */
function useKeyAnchor() {
  const ref = useRef(null);
  const [at, setAt] = useState({ top: 0, left: 0, w: 0, h: 0 });
  const measure = useCallback(() => {
    const b = ref.current?.querySelector('.pb-btn');
    if (b) setAt({ top: b.offsetTop, left: b.offsetLeft, w: b.offsetWidth, h: b.offsetHeight });
  }, []);
  return [ref, at, measure];
}

/**
 * Mute on the key; with a mouse, a level slider slides out beside the dock,
 * level with the key and clear of the progress. The key's hint card leads
 * the slider, in the same style as every other hint: "Mute M", then the level.
 */
function VolumeKey({ v }) {
  const [ref, at, measure] = useKeyAnchor();
  const muted = usePlayer((s) => s.muted);
  const style = v ? { top: at.top + at.h / 2, '--bridge': `${10 + at.left}px` } : { left: Math.max(0, at.left + at.w / 2 - 120), '--bridge': `${10 + at.top}px` };
  return (
    <div className="pb-volume" data-orient={v ? 'v' : 'h'} ref={ref} onPointerEnter={measure} onFocus={measure}>
      <MuteButton
        className="pb-btn"
        label={(s) => (s.muted ? 'Unmute' : 'Mute')}
        render={(props, s) => (
          <button {...props}>
            <I.Volume level={s.muted || s.volumeLevel === 'off' ? 'off' : s.volumeLevel === 'low' ? 'low' : 'high'} />
          </button>
        )}
      />
      <div className="pb-vol-pop" style={style}>
        <span className="hint pb-vol-hint" aria-hidden="true">
          <span>{muted ? 'Unmute' : 'Mute'}</span>
          <kbd>M</kbd>
        </span>
        <span className="pb-vol-level">
          <VolumeSlider.Root className="pb-vol" label="Volume">
            <VolumeSlider.Track className="pb-vol-track">
              <VolumeSlider.Fill className="pb-vol-fill" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="pb-vol-thumb" />
          </VolumeSlider.Root>
        </span>
      </div>
    </div>
  );
}

/* ---------- progress: a groove you drag along, with a reel of clips ---------- */

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

/** Relative luminance of a #rrggbb color, 0 (black) to 1 (white). */
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

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
    if (!force && now - lastSeek.current < 110) return;
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
  useEffect(() => {
    if (movie) loadBoard(movie);
  }, [movie]);
  // once the reel has been opened it stays built (hidden), so its stills never load twice
  const [used, setUsed] = useState(false);
  if (reel && !used) setUsed(true);

  return (
    <div
      className="pb-scrub"
      data-orient={orient}
      data-dragging={drag ? '' : undefined}
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
      {(reel || used) && duration > 0 && <Reel orient={orient} reel={reel} duration={duration} movie={movie} win={win} aspect={aspect} />}
    </div>
  );
}

/*
 * The reel: when you hover or drag the progress, real frames of the film at
 * the pointer's moment. Like YouTube's previews, the frames come from one
 * storyboard image (Mux serves it for every asset), so moving the pointer only
 * shifts a sprite and never waits on the network. The clip at the pointer is
 * the largest, outlined, with the exact time; the moments before and after
 * get smaller and quieter the further they are, and the whole reel rides
 * with the pointer along the bar.
 */
const REEL = [
  { k: 0, scale: 1, alpha: 1 },
  { k: -1, scale: 0.72, alpha: 0.85 },
  { k: 1, scale: 0.72, alpha: 0.85 },
  { k: -2, scale: 0.52, alpha: 0.6 },
  { k: 2, scale: 0.52, alpha: 0.6 },
  { k: -3, scale: 0.38, alpha: 0.38 },
  { k: 3, scale: 0.38, alpha: 0.38 },
];

function Reel({ orient, reel, duration, movie, win, aspect }) {
  const v = orient === 'v';
  const sb = useStoryboard(movie);
  const [len, setLen] = useState(0);
  if (reel?.len && Math.abs(reel.len - len) > 1) setLen(reel.len);
  if (!len || !duration) return null;
  const on = !!reel;
  const gap = 6;
  // the active clip: a quarter of the picture's width, kept inside the bar
  let w0 = v ? clamp(win.w * 0.24, 120, 240) : clamp(win.w * 0.36, 108, 200);
  let h0 = w0 / aspect;
  if (v && h0 > len * 0.42) {
    h0 = len * 0.42;
    w0 = h0 * aspect;
  }
  const along0 = v ? h0 : w0;
  const f = on ? reel.f : 0;
  const t = f * duration;
  const step = duration / 24; // neighbours a few scenes apart, like flicking reels
  const c0 = clamp(f * len, along0 / 2, len - along0 / 2);
  // place the neighbours outwards from the active clip, each a little smaller
  const place = {};
  place[0] = c0;
  for (const dir of [-1, 1]) {
    let edge = c0 + (dir * along0) / 2;
    for (let n = 1; n <= 3; n++) {
      const sc = REEL[n * 2 - 1].scale;
      const a = along0 * sc;
      place[dir * n] = edge + dir * (gap + a / 2);
      edge += dir * (gap + a);
    }
  }
  return (
    <div className="pb-reel" data-on={on || undefined} data-mode={reel?.mode} data-orient={orient} aria-hidden="true" style={v ? { height: len, width: w0 } : { width: len, height: h0 }}>
      {REEL.map(({ k, scale, alpha }) => {
        const w = w0 * scale;
        const h = h0 * scale;
        const a = v ? h : w;
        const time = t + k * step;
        const c = place[k];
        const fits = time >= 0 && time <= duration && c - a / 2 >= -2 && c + a / 2 <= len + 2;
        const style = v
          ? { width: w, height: h, top: c - a / 2, right: 0, opacity: on && fits ? alpha : 0 }
          : { width: w, height: h, left: c - a / 2, bottom: 0, opacity: on && fits ? alpha : 0 };
        return (
          <div key={k} className="pb-clip" data-active={k === 0 || undefined} style={style}>
            <Still sb={sb} movie={movie} time={clamp(time, 0, duration)} w={w} h={h} exact={k === 0 && on} />
            {k === 0 && on && <span className="pb-clip-time">{formatTimecode(t)}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- storyboards: one sprite of frames per film ---------- */

const boards = new Map(); // key -> { status, tiles, url, sw, sh, subs }

function parseVtt(text, base) {
  const tiles = [];
  const ts = (x) => {
    const p = x.trim().split(':').map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  };
  const blocks = text.replace(/\r/g, '').split('\n\n');
  let url = null;
  for (const bl of blocks) {
    const lines = bl.split('\n').filter(Boolean);
    const timing = lines.find((l) => l.includes('-->'));
    const ref = lines.find((l) => l.includes('#xywh='));
    if (!timing || !ref) continue;
    const [a, b] = timing.split('-->').map(ts);
    const [u, frag] = ref.trim().split('#xywh=');
    const [x, y, w, h] = frag.split(',').map(Number);
    url = new URL(u, base).href;
    tiles.push({ start: a, end: b, x, y, w, h });
  }
  return { tiles, url };
}

function loadBoard(movie) {
  const key = movie.playbackId || movie.src;
  if (!key) return null;
  let b = boards.get(key);
  if (b) return b;
  b = { status: 'loading', tiles: [], url: null, sw: 0, sh: 0, subs: new Set() };
  boards.set(key, b);
  const done = () => b.subs.forEach((fn) => fn());
  const fail = () => {
    b.status = 'failed';
    done();
  };
  if (movie.playbackId) {
    const vtt = `https://image.mux.com/${movie.playbackId}/storyboard.vtt`;
    fetch(vtt)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((text) => {
        const { tiles, url } = parseVtt(text, vtt);
        if (!tiles.length || !url) return fail();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          Object.assign(b, { status: 'ready', tiles, url, sw: img.naturalWidth, sh: img.naturalHeight });
          done();
        };
        img.onerror = fail;
        img.src = url;
        return undefined;
      })
      .catch(fail);
  } else buildLocalBoard(movie.src, b, done, fail);
  return b;
}

/** Local files (dev): grab frames with a quiet second video into a sprite, the same shape Mux serves. */
function buildLocalBoard(src, b, done, fail) {
  const v = document.createElement('video');
  v.muted = true;
  v.preload = 'auto';
  v.crossOrigin = 'anonymous';
  v.src = src;
  const N = 40;
  const cols = 8;
  const tw = 160;
  v.addEventListener(
    'loadedmetadata',
    () => {
      const th = Math.round((tw * (v.videoHeight || 9)) / (v.videoWidth || 16));
      const c = document.createElement('canvas');
      c.width = cols * tw;
      c.height = Math.ceil(N / cols) * th;
      const g = c.getContext('2d');
      const span = v.duration / N;
      let i = 0;
      const next = () => {
        if (i >= N) {
          try {
            Object.assign(b, { status: 'ready', url: c.toDataURL('image/jpeg', 0.7), sw: c.width, sh: c.height });
            done();
          } catch {
            fail();
          }
          return;
        }
        v.currentTime = Math.min(v.duration - 0.05, (i + 0.5) * span);
      };
      v.addEventListener('seeked', () => {
        const x = (i % cols) * tw;
        const y = Math.floor(i / cols) * th;
        g.drawImage(v, x, y, tw, th);
        b.tiles.push({ start: i * span, end: (i + 1) * span, x, y, w: tw, h: th });
        i += 1;
        next();
      });
      next();
    },
    { once: true },
  );
  v.addEventListener('error', fail, { once: true });
}

function useStoryboard(movie) {
  const [, bump] = useState(0);
  const b = movie ? loadBoard(movie) : null;
  useEffect(() => {
    if (!b) return undefined;
    const fn = () => bump((n) => n + 1);
    b.subs.add(fn);
    return () => b.subs.delete(fn);
  }, [b]);
  return b?.status === 'ready' ? b : b?.status === 'failed' ? 'failed' : null;
}

function tileAt(sb, t) {
  const tiles = sb.tiles;
  let lo = 0;
  let hi = tiles.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (tiles[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  return tiles[lo];
}

/**
 * One frame of the film at a moment: a window onto the storyboard sprite.
 * The active clip also asks Mux for the exact frame once the pointer rests,
 * and lays it over the sprite when it arrives, so a pause gives a sharp still.
 */
function Still({ sb, movie, time, w, h, exact }) {
  const [sharp, setSharp] = useState(null);
  const want = exact && movie?.playbackId ? Math.round(time * 2) / 2 : null;
  useEffect(() => {
    if (want == null) return undefined;
    const id = setTimeout(() => {
      const src = `https://image.mux.com/${movie.playbackId}/thumbnail.webp?time=${want}&width=${Math.round(Math.min(480, w * 2))}`;
      const img = new Image();
      img.onload = () => setSharp({ src, at: want });
      img.src = src;
    }, 140);
    return () => clearTimeout(id);
  }, [want, movie?.playbackId, w]);
  if (sb && sb !== 'failed') {
    const tile = tileAt(sb, time);
    const kx = w / tile.w;
    const ky = h / tile.h;
    return (
      <>
        <span
          className="pb-clip-img"
          style={{ backgroundImage: `url("${sb.url}")`, backgroundSize: `${sb.sw * kx}px ${sb.sh * ky}px`, backgroundPosition: `${-tile.x * kx}px ${-tile.y * ky}px` }}
        />
        {sharp && sharp.at === want && <img className="pb-clip-img pb-clip-sharp" src={sharp.src} alt="" draggable={false} />}
      </>
    );
  }
  if (sb === 'failed' && movie?.playbackId) {
    // no storyboard: fall back to single frames from Mux
    return <img className="pb-clip-img" src={`https://image.mux.com/${movie.playbackId}/thumbnail.webp?time=${Math.round(time)}&width=320`} alt="" draggable={false} />;
  }
  return <span className="pb-clip-img pb-clip-img--wait" />;
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
  const popRef = useRef(null);
  const [page, setPage] = useState('main');
  const [place, setPlace] = useState(null);
  usePopover(open, setOpen, wrap, '.pb-settings');
  // line the menu's top up with the key (proximity), kept inside the player
  useLayoutEffect(() => {
    if (!open) return;
    const key = wrap.current?.querySelector('.pb-settings');
    const dock = wrap.current?.closest('.pb-dock');
    const skin = dock?.offsetParent;
    const pop = popRef.current;
    if (!key || !dock || !skin || !pop) return;
    if (dock.dataset.orient === 'v') {
      const room = skin.clientHeight - 16;
      const h = Math.min(pop.scrollHeight, room);
      const top = Math.max(8 - dock.offsetTop, Math.min(key.offsetTop, skin.clientHeight - 8 - dock.offsetTop - h));
      setPlace({ top, maxHeight: room });
    } else setPlace({ maxHeight: Math.max(160, dock.offsetTop - 16) });
  }, [open, page]);
  useEffect(() => {
    if (!open) {
      setPage('main');
      setPlace(null);
    }
  }, [open]);
  useEffect(() => {
    if (open) requestAnimationFrame(() => wrap.current?.querySelector('.pb-pop button')?.focus({ preventScroll: true, focusVisible: false }));
  }, [page, open]);
  return (
    <div className="pb-pop-wrap" ref={wrap}>
      <button type="button" className="pb-btn pb-settings" aria-label="Settings" data-tip="Settings" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)}>
        <I.Settings />
      </button>
      {open && (
        <div className="pb-pop" role="dialog" aria-label="Settings" ref={popRef} style={place ?? { visibility: 'hidden' }}>
          {page === 'main' && <SettingsMain go={setPage} />}
          {page === 'speed' && <SpeedPage back={() => setPage('main')} />}
          {page === 'quality' && <QualityPage back={() => setPage('main')} />}
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
  const quality = useQualityOptions();
  return (
    <div className="pb-menu">
      <p className="pb-menu-title">Settings</p>
      {quality && !quality.hidden && (
        <button type="button" className="pb-row" onClick={() => go('quality')}>
          <span>Quality</span>
          <span className="pb-row-value">{quality.selectedLabel}</span>
          <I.Chevron />
        </button>
      )}
      <button type="button" className="pb-row" onClick={() => go('speed')}>
        <span>Playback speed</span>
        <span className="pb-row-value">{rateName(rate)}</span>
        <I.Chevron />
      </button>
      <button type="button" className="pb-row" onClick={() => go('subs')}>
        <span>Subtitle style</span>
        <span className="pb-row-value">{`${CAPTION_FONTS[style.font]?.name ?? 'Sans'}, ${(CAPTION_SIZES[style.size] ?? CAPTION_SIZES.m).name.toLowerCase()}`}</span>
        <I.Chevron />
      </button>
      <BrightnessField />
      {pipOk && (
        <button
          type="button"
          className="pb-row"
          role="switch"
          aria-checked={pip}
          onClick={() => (pip ? store.exitPictureInPicture() : store.requestPictureInPicture())?.catch?.(() => {})}
        >
          <span>Picture in picture</span>
          <span className="pb-toggle" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/** The picture's brightness, also set by sliding up or down on the left of the picture on a phone. */
function BrightnessField() {
  const b = useApp((s) => s.brightness);
  const pct = Math.round(b * 100);
  const min = BRIGHT_MIN * 100;
  const max = BRIGHT_MAX * 100;
  return (
    <label className="pb-field pb-bright">
      <span className="pb-field-head">
        <span className="pb-field-label">Brightness</span>
        <output className="pb-row-value">{pct}%</output>
      </span>
      <input
        type="range"
        className="pb-range"
        min={min}
        max={max}
        step={5}
        value={pct}
        style={{ '--fill': `${((pct - min) / (max - min)) * 100}%` }}
        onChange={(e) => useApp.setState({ brightness: +e.target.value / 100 })}
        onDoubleClick={() => useApp.setState({ brightness: 1 })}
      />
    </label>
  );
}

/** Every rendition the stream offers (1080p, 720p, …) and Auto, from Video.js's quality feature. */
function QualityPage({ back }) {
  const q = useQualityOptions();
  return (
    <div className="pb-menu">
      <button type="button" className="pb-menu-back" onClick={back}>
        <I.Chevron back />
        Quality
      </button>
      <div role="radiogroup" aria-label="Quality" className="pb-list">
        {[...(q?.options ?? [])].sort((a, b) => (a.value === 'auto' ? -1 : b.value === 'auto' ? 1 : (parseInt(b.label, 10) || 0) - (parseInt(a.label, 10) || 0))).map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={q.value === o.value}
            disabled={o.disabled}
            className="pb-row pb-row--choice"
            onClick={() => {
              q.setValue(o.value);
              sfx('tick');
            }}
          >
            <span className="pb-row-check">{q.value === o.value && <I.Check />}</span>
            <span>{o.label}</span>
            {o.tier && <span className="pb-tier">{o.tier}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function SpeedPage({ back }) {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate);
  return (
    <div className="pb-menu">
      <button type="button" className="pb-menu-back" onClick={back}>
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
      <button type="button" className="pb-menu-back" onClick={back}>
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

export function FrameThumb({ border }) {
  const ref = useRef(null);
  const loaded = useFrameImages();
  useEffect(() => {
    warmFrame(border);
    const el = ref.current;
    if (!el) return;
    // a pattern frame is a thin band around a film; in the list its picture is what tells frames apart,
    // so its thumbnail shows a wider band of it (the same picture, at the same proportions, just more of it)
    const pattern = (border.raster && border.id !== 'pinkdoc') || border.id === 'custom';
    const shown = pattern ? { ...border, pads: { t: 0.24, r: 0.24, b: border.pads.b > border.pads.t ? 0.36 : 0.24, l: 0.24 } } : border;
    const L = frameLayout(shown, 16 / 9, 220);
    el.width = L.W;
    el.height = L.H;
    paintComposite(el.getContext('2d'), shown, L, {}, (g, win) => {
      const grad = g.createLinearGradient(0, win.y, 0, win.y + win.h);
      grad.addColorStop(0, '#d9b98f');
      grad.addColorStop(1, '#6d5444');
      g.fillStyle = grad;
      g.fillRect(win.x, win.y, win.w, win.h);
    });
  }, [border, loaded]);
  return <canvas ref={ref} className="frame-thumb" aria-hidden="true" />;
}

/** How many columns the list has right now (one on a narrow panel, more on a wide one), read from the layout. */
function listColumns(el) {
  const items = el ? [...el.querySelectorAll('.frame-opt')] : [];
  if (!items.length) return 1;
  const top = items[0].offsetTop;
  let n = 0;
  while (n < items.length && items[n].offsetTop === top) n++;
  return Math.max(1, n);
}

function FramePicker({ active }) {
  const borderId = useApp((s) => s.borderId);
  const setBorder = useApp((s) => s.setBorder);
  const group = useRef(null);
  const selected = borderById(borderId);
  // your own frame, once made, stays in the list (first, beside the upload) even after you try another
  const rev = useApp((s) => s.borderRev);
  const list = useMemo(() => (CUSTOM.border ? [CUSTOM.border, ...BORDERS] : BORDERS), [rev, borderId]); // eslint-disable-line react-hooks/exhaustive-deps
  // you can make a frame from your own picture, right here, wherever the player is
  const upload = useApp((s) => s.frameUpload);
  const fileRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  // outside the booth the chooser opens over a playing film: Back puts the frame it had back
  const opened = useRef(useApp.getState().borderId);
  const booth = useApp((s) => s.host === 'booth');
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !upload) return;
    const problem = await upload(file);
    setUploadError(problem || '');
    if (!problem) {
      sfx('paper');
      requestAnimationFrame(() => {
        const el = group.current?.querySelector('[data-id="custom"]');
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: 'nearest' });
      });
    }
  };

  useEffect(() => {
    if (!active) return undefined;
    // the chosen frame is brought into view in the list (instantly, so nothing slides) and takes the focus
    const on = () => group.current?.querySelector('[aria-checked="true"]');
    const raf = requestAnimationFrame(() => on()?.scrollIntoView({ block: 'center' }));
    const id = setTimeout(() => on()?.focus({ preventScroll: true, focusVisible: false }), useApp.getState().reducedMotion ? 30 : 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(id);
    };
  }, [active]);

  const choose = (id) => {
    if (id === useApp.getState().borderId) return;
    setBorder(id);
    sfx('paper');
  };
  const move = (dir) => {
    const i = list.findIndex((b) => b.id === borderId);
    const next = list[(i + dir + list.length) % list.length];
    choose(next.id);
    requestAnimationFrame(() => {
      const el = group.current?.querySelector(`[data-id="${next.id}"]`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ block: 'nearest' });
    });
  };

  return (
    <aside className="pb-picker" aria-labelledby="pb-picker-title" data-upload={upload ? '' : undefined}>
      <div className="pb-picker-head">
        <h2 className="pb-picker-title" id="pb-picker-title">Choose a frame</h2>
        <p className="pb-picker-name" aria-live="polite">{selected.name}</p>
      </div>
      {/* the list scrolls; the title above and Back and the confirm key below stay where they are */}
      <div className="pb-frames-scroll">
        {upload && (
          <div className="pb-picker-own">
            <button type="button" className="pb-picker-upload" onClick={() => fileRef.current?.click()} aria-describedby="pb-picker-own-note">
              <span className="pb-picker-plus" aria-hidden="true">+</span>
              <span className="pb-picker-upload-text">
                <b>{CUSTOM.border ? 'Another picture' : 'Your own frame'}</b>
                <span id="pb-picker-own-note">Upload a landscape picture; it becomes the frame</span>
              </span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
            {uploadError && (
              <p className="pb-picker-error" role="alert">
                {uploadError}
              </p>
            )}
          </div>
        )}
        <div
          ref={group}
          className="pb-frames"
          role="radiogroup"
          aria-labelledby="pb-picker-title"
          onKeyDown={(e) => {
            const rtl = document.dir === 'rtl';
            const cols = listColumns(group.current);
            const map = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, ArrowDown: cols, ArrowUp: -cols };
            if (map[e.key] != null) {
              e.preventDefault();
              move(map[e.key]);
            }
          }}
        >
          {list.map((b) => {
            const on = b.id === borderId;
            return (
              <button key={b.id} type="button" role="radio" aria-checked={on} aria-label={b.name} aria-describedby={`pb-fh-${b.id}`} tabIndex={on ? 0 : -1} data-id={b.id} className="frame-opt" onClick={() => choose(b.id)}>
                <span className="frame-opt-pic">
                  <FrameThumb border={b} />
                </span>
                <span className="frame-opt-text">
                  <span className="frame-opt-name">{b.name}</span>
                  <span className="frame-opt-hint" id={`pb-fh-${b.id}`}>
                    {b.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pb-picker-actions">
        <button
          type="button"
          className="btn"
          onClick={() => {
            const s = useApp.getState();
            // outside the booth the film is already playing behind the chooser: Back cancels the change and returns to it
            if (s.host !== 'booth') {
              useApp.setState({ deck: 'playing', borderId: borderById(opened.current)?.id === opened.current ? opened.current : s.borderId });
              s.announce('Frame unchanged.');
            } else s.goStation('player');
          }}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            const s = useApp.getState();
            s.confirmFrame();
            s.announce(booth ? `${selected.name} frame. Playing.` : `${selected.name} frame.`);
            sfx(booth ? 'start' : 'paper');
            requestAnimationFrame(() => document.querySelector('.pb-play')?.focus({ preventScroll: true, focusVisible: false }));
          }}
        >
          {booth ? 'Start the film' : 'Use this frame'}
        </button>
      </div>
    </aside>
  );
}

/* ---------- keys ---------- */

function PlayboothHotkeys({ enabled, levels, onFullscreen }) {
  const off = !enabled;
  // volume and brightness are the keys a lock leaves on: you can still hear and see comfortably
  const lvOff = !levels;
  const snap = useCallback(() => {
    sfx('shutter');
    snapPhoto();
  }, []);
  useHotkey({ keys: 's', action: 'snapshot', disabled: off, onActivate: snap });
  useHotkey({ keys: 'f', action: 'fullscreen', disabled: off, onActivate: onFullscreen });
  useHotkey({ keys: 'Shift+ArrowUp', action: 'brightnessUp', disabled: lvOff, onActivate: () => stepBrightness(1) });
  useHotkey({ keys: 'Shift+ArrowDown', action: 'brightnessDown', disabled: lvOff, onActivate: () => stepBrightness(-1) });
  return (
    <>
      <Hotkey keys="Space" action="togglePaused" disabled={off} />
      <Hotkey keys="k" action="togglePaused" disabled={off} />
      <Hotkey keys="m" action="toggleMuted" disabled={off} />
      <Hotkey keys="ArrowLeft" action="seekStep" value={-10} disabled={off} />
      <Hotkey keys="ArrowRight" action="seekStep" value={10} disabled={off} />
      <Hotkey keys="j" action="seekStep" value={-10} disabled={off} />
      <Hotkey keys="l" action="seekStep" value={10} disabled={off} />
      <Hotkey keys="ArrowUp" action="volumeStep" disabled={lvOff} />
      <Hotkey keys="ArrowDown" action="volumeStep" disabled={lvOff} />
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
