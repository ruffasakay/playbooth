import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BufferingIndicator,
  CaptionsButton,
  Container,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Gesture,
  Hotkey,
  MuteButton,
  PiPButton,
  PlayButton,
  PlaybackRateButton,
  Poster,
  SeekButton,
  SeekIndicator,
  Slider,
  StatusAnnouncer,
  StatusIndicator,
  Time,
  TimeSlider,
  VolumeIndicator,
  VolumeSlider,
  useHotkey,
} from '@videojs/react';
import { useApp, movieById } from '../store.js';
import { BORDERS, borderById, ensureFrameFonts, formatDate, frameLayout, paintComposite, paintOverlay, windowPercents } from '../data/borders.js';
import { snapPhoto } from '../lib/printFlow.js';
import * as I from './icons.jsx';

export function PlayboothSkin({ children }) {
  const deck = useApp((s) => s.deck);
  const borderId = useApp((s) => s.borderId);
  const aspect = useApp((s) => s.videoAspect);
  const movie = useApp((s) => movieById(s.insertedTapeId));
  const station = useApp((s) => s.station);
  const playing = deck === 'playing';
  const [styleOpen, setStyleOpen] = useState(false);
  const border = borderById(borderId);
  const p = windowPercents(border, aspect);

  const onKeyDown = (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || document.fullscreenElement) return;
    if (useApp.getState().station === 'watch') {
      e.preventDefault();
      useApp.getState().goStation('player');
    }
  };

  return (
    <Container className="pb-skin" data-deck={deck} data-frame={borderId} aria-label={movie ? `PLAYBOOTH player, ${movie.title}` : 'PLAYBOOTH player'} onKeyDown={onKeyDown}>
      <div className="pb-stage">
        <div className="pb-frame" style={{ '--frame-ar': p.aspectRatio }}>
          <FrameArt border={border} aspect={aspect} movie={movie} />
          <div
            className="pb-window"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.width}%`,
              height: `${p.height}%`,
              borderRadius: p.radiusPct ? `${p.radiusPct}% / ${p.radiusPct * aspect}%` : undefined,
            }}
          >
            {children}
            <Poster.Root className="pb-poster">
              <Poster.Image className="pb-poster-img" alt="" />
            </Poster.Root>
            <BufferingIndicator className="pb-buffering" render={(props) => <div {...props}><span className="pb-spinner" /></div>} />
            <Flash />
            <StatusIndicator.Root className="pb-bubble"><StatusIndicator.Value /></StatusIndicator.Root>
            <SeekIndicator.Root className="pb-bubble"><SeekIndicator.Value /></SeekIndicator.Root>
            <VolumeIndicator.Root className="pb-bubble"><VolumeIndicator.Value /></VolumeIndicator.Root>
            <ErrorDialog.Root>
              <ErrorDialog.Popup className="pb-error">
                <ErrorDialog.Title className="pb-error-title" />
                <ErrorDialog.Description className="pb-error-text" />
                <ErrorDialog.Close className="btn btn--primary" />
              </ErrorDialog.Popup>
            </ErrorDialog.Root>
            {playing && (
              <Controls.Root visibility={styleOpen ? 'always' : 'auto'}>
                <Controls.Backdrop className="pb-backdrop" />
                <Controls.Content className="pb-controls-content">
                  <TopBar movie={movie} />
                  <BottomBar styleOpen={styleOpen} onStyle={() => setStyleOpen((o) => !o)} />
                </Controls.Content>
              </Controls.Root>
            )}
          </div>
        </div>
      </div>

      {deck === 'frame' && <FramePicker active={station === 'watch'} />}
      {playing && styleOpen && <CaptionPanel onClose={() => setStyleOpen(false)} />}
      <CaptionCss />

      {playing && (
        <>
          <Gesture type="tap" action="togglePaused" pointer="mouse" />
          <Gesture type="tap" action="toggleControls" pointer="touch" />
          <Gesture type="doubletap" action="seekStep" value={-10} region="left" />
          <Gesture type="doubletap" action="toggleFullscreen" region="center" />
          <Gesture type="doubletap" action="seekStep" value={10} region="right" />
        </>
      )}
      <PlayboothHotkeys enabled={playing} />
      <StatusAnnouncer />
    </Container>
  );
}

/** The frame is drawn on a canvas sized to the player, with a hole for the video. */
function FrameArt({ border, aspect, movie }) {
  const canvas = useRef(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    ensureFrameFonts().then(() => setTick((t) => t + 1));
  }, []);
  useLayoutEffect(() => {
    const el = canvas.current;
    if (!el) return undefined;
    const paint = () => {
      const w = el.clientWidth;
      if (!w) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const L = frameLayout(border, aspect, Math.round(w * dpr));
      el.width = L.W;
      el.height = L.H;
      paintOverlay(el.getContext('2d'), border, L, { title: movie?.title, date: formatDate() });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, [border, aspect, movie, tick]);
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

/* ---------- controls ---------- */

function TopBar({ movie }) {
  const total = useApp((s) => s.collection.length);
  const snaps = useApp((s) => s.snaps.length);
  return (
    <div className="pb-bar pb-bar--top">
      <button type="button" className="pb-btn" onClick={() => useApp.getState().goStation('player')} aria-label="Back to the booth">
        <I.Back />
      </button>
      <div className="pb-title">
        <span className="pb-title-name">{movie?.title}</span>
        <span className="pb-title-credit">{movie ? `${movie.credit}, ${movie.license}` : ''}</span>
      </div>
      <div className="pb-group">
        <button type="button" className="pb-btn pb-btn--snaps" onClick={() => useApp.getState().setCompilerOpen(true)} aria-label={`Snaps, ${snaps} this visit`}>
          <I.Stack />
          {snaps > 0 && <span className="pb-count" aria-hidden="true">{snaps}</span>}
        </button>
        <button type="button" className="pb-btn" onClick={() => useApp.getState().setAlbumOpen(true)} aria-label={`Album, ${total} prints`}>
          <I.Album />
        </button>
        <button type="button" className="pb-btn" onClick={() => useApp.getState().ejectTape()} aria-label={`Eject ${movie?.title ?? 'tape'}`}>
          <I.Eject />
        </button>
      </div>
    </div>
  );
}

function BottomBar({ styleOpen, onStyle }) {
  const [busy, setBusy] = useState(false);
  const snap = async () => {
    if (busy) return;
    setBusy(true);
    await snapPhoto();
    setBusy(false);
  };
  return (
    <div className="pb-bar pb-bar--bottom">
      <TimeSlider.Root className="pb-seek">
        <TimeSlider.Track className="pb-seek-track">
          <TimeSlider.Buffer className="pb-seek-buffer" />
          <TimeSlider.Fill className="pb-seek-fill" />
        </TimeSlider.Track>
        <TimeSlider.Thumb className="pb-seek-thumb" />
        <TimeSlider.Preview className="pb-seek-preview" overflow="clamp">
          <Slider.Thumbnail.Root className="pb-seek-shot">
            <Slider.Thumbnail.Image className="pb-seek-shot-img" alt="" />
          </Slider.Thumbnail.Root>
          <TimeSlider.Value type="pointer" className="pb-seek-time" />
        </TimeSlider.Preview>
      </TimeSlider.Root>
      <div className="pb-row">
        <div className="pb-group">
          <PlayButton className="pb-btn pb-btn--play" render={(props, state) => <button {...props}>{state.ended ? <I.Replay /> : state.paused ? <I.Play /> : <I.Pause />}</button>} />
          <SeekButton seconds={-10} className="pb-btn pb-seek-step" label="Back 10 seconds" render={(props) => <button {...props}><I.Seek back /></button>} />
          <SeekButton seconds={10} className="pb-btn pb-seek-step" label="Forward 10 seconds" render={(props) => <button {...props}><I.Seek /></button>} />
          <div className="pb-volume">
            <MuteButton
              className="pb-btn"
              label={(s) => (s.muted ? 'Unmute' : 'Mute')}
              render={(props, s) => <button {...props}><I.Volume level={s.muted || s.volumeLevel === 'off' ? 'off' : s.volumeLevel === 'low' ? 'low' : 'high'} /></button>}
            />
            <VolumeSlider.Root className="pb-vol">
              <VolumeSlider.Track className="pb-vol-track">
                <VolumeSlider.Fill className="pb-vol-fill" />
              </VolumeSlider.Track>
              <VolumeSlider.Thumb className="pb-vol-thumb" />
            </VolumeSlider.Root>
          </div>
          <Time.Group className="pb-time">
            <Time.Value type="current" />
            <Time.Separator className="pb-time-sep">/</Time.Separator>
            <Time.Value type="duration" className="pb-time-total" />
          </Time.Group>
        </div>
        <div className="pb-group">
          <CaptionsButton className="pb-btn" label={(s) => (s.subtitlesShowing ? 'Captions off' : 'Captions on')} render={(props, s) => <button {...props}><I.Captions on={s.subtitlesShowing} /></button>} />
          <button type="button" className="pb-btn pb-opt" onClick={onStyle} aria-label="Caption style" aria-expanded={styleOpen} aria-controls="pb-caption-panel" data-active={styleOpen || undefined}>
            <I.TextStyle />
          </button>
          <PlaybackRateButton className="pb-btn pb-opt pb-btn--rate" label={(s) => `Speed ${s.rate}×`} render={(props, s) => <button {...props}><span className="pb-rate">{s.rate}×</span></button>} />
          <PiPButton className="pb-btn pb-opt pb-pip" label={(s) => (s.pip ? 'Exit picture in picture' : 'Picture in picture')} render={(props) => <button {...props}><I.Pip /></button>} />
          <FullscreenButton className="pb-btn pb-btn--fs" label={(s) => (s.fullscreen ? 'Exit full screen' : 'Full screen')} render={(props, s) => <button {...props}><I.Fullscreen exit={s.fullscreen} /></button>} />
          <button type="button" className="pb-snap" onClick={snap} aria-label="Snap this frame" aria-keyshortcuts="S" data-busy={busy || undefined}>
            <I.Camera />
            <span className="pb-snap-text" aria-hidden="true">Snap</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- caption style ---------- */

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

/** Native cues can only be styled through ::cue, so the choice is written as a rule. */
function CaptionCss() {
  const { color, outline, font } = useApp((s) => s.captionStyle);
  const shadow = outline ? '0 0 2px #000, 0 0 3px #000, 1px 1px 2px #000, -1px -1px 2px #000' : 'none';
  const bg = outline ? 'transparent' : 'rgb(10 7 5 / 0.72)';
  return (
    <style>{`.pb-window video::cue{color:${color};font-family:${CAPTION_FONTS[font] ?? CAPTION_FONTS.sans};text-shadow:${shadow};background:${bg};}`}</style>
  );
}

function CaptionPanel({ onClose }) {
  const style = useApp((s) => s.captionStyle);
  const set = useApp((s) => s.setCaptionStyle);
  const ref = useRef(null);
  const custom = !CAPTION_COLORS.some((c) => c.value === style.color);
  useEffect(() => {
    ref.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        document.querySelector('[aria-controls="pb-caption-panel"]')?.focus();
      }
    };
    const onDown = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest?.('[aria-controls="pb-caption-panel"]')) onClose();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [onClose]);
  return (
    <div ref={ref} className="pb-panel" id="pb-caption-panel" role="dialog" aria-label="Caption style">
      <p className="pb-panel-sample" style={{ color: style.color, fontFamily: CAPTION_FONTS[style.font], textShadow: style.outline ? '0 0 2px #000, 0 0 3px #000, 1px 1px 2px #000' : 'none', background: style.outline ? 'transparent' : 'rgb(10 7 5 / 0.72)' }}>
        The quick fox, at dusk.
      </p>
      <fieldset className="pb-field">
        <legend>Color</legend>
        <div className="pb-swatches" role="radiogroup" aria-label="Caption color">
          {CAPTION_COLORS.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={style.color === c.value} aria-label={c.name} className="pb-swatch" style={{ '--c': c.value }} onClick={() => set({ color: c.value })} />
          ))}
          <label className="pb-swatch pb-swatch--custom" data-checked={custom || undefined} style={{ '--c': custom ? style.color : 'conic-gradient(#ff6b6b, #ffe14d, #8ee8f0, #b48cff, #ff6b6b)' }}>
            <span className="sr-only">Custom color</span>
            <input type="color" value={custom ? style.color : '#ffffff'} onChange={(e) => set({ color: e.target.value })} />
          </label>
        </div>
      </fieldset>
      <fieldset className="pb-field">
        <legend>Outline</legend>
        <div className="pb-seg" role="radiogroup" aria-label="Caption outline">
          <button type="button" role="radio" aria-checked={style.outline} onClick={() => set({ outline: true })}>Outline</button>
          <button type="button" role="radio" aria-checked={!style.outline} onClick={() => set({ outline: false })}>Box</button>
        </div>
      </fieldset>
      <fieldset className="pb-field">
        <legend>Font</legend>
        <div className="pb-seg" role="radiogroup" aria-label="Caption font">
          <button type="button" role="radio" aria-checked={style.font === 'sans'} onClick={() => set({ font: 'sans' })} style={{ fontFamily: CAPTION_FONTS.sans }}>Sans</button>
          <button type="button" role="radio" aria-checked={style.font === 'serif'} onClick={() => set({ font: 'serif' })} style={{ fontFamily: CAPTION_FONTS.serif }}>Serif</button>
        </div>
      </fieldset>
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
      const L = frameLayout(border, 16 / 9, 160);
      el.width = L.W;
      el.height = L.H;
      paintComposite(el.getContext('2d'), border, L, { title: '', date: '' }, (g, win) => {
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
    const id = setTimeout(() => group.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true }), useApp.getState().reducedMotion ? 30 : 700);
    return () => clearTimeout(id);
  }, [active]);

  const move = (dir) => {
    const i = BORDERS.findIndex((b) => b.id === borderId);
    const next = BORDERS[(i + dir + BORDERS.length) % BORDERS.length];
    setBorder(next.id);
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
            <button key={b.id} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} data-id={b.id} className="frame-opt" onClick={(e) => { setBorder(b.id); e.currentTarget.focus(); }}>
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
            // the picker is about to unmount: keep keyboard focus inside the player
            requestAnimationFrame(() => document.querySelector('.pb-skin')?.focus({ preventScroll: true }));
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

function PlayboothHotkeys({ enabled }) {
  const off = !enabled;
  useHotkey({ keys: 's', action: 'snapshot', disabled: off, onActivate: () => snapPhoto() });
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
