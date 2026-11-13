import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  BufferingIndicator,
  CaptionsButton,
  Container,
  Controls,
  ErrorDialog,
  FullscreenButton,
  Hotkey,
  MuteButton,
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
import {
  BORDERS,
  borderById,
  ensureFrameFonts,
  formatDate,
  frameLayout,
  paintOverlay,
  windowPercents,
} from '../data/borders.js';
import { printPhotos, snapPhoto } from '../lib/printFlow.js';
import { usePlayer } from './core.js';
import {
  IconAlbum,
  IconBack,
  IconCaptions,
  IconEject,
  IconForward,
  IconFullscreen,
  IconPause,
  IconPlay,
  IconPrint,
  IconReplay,
  IconRoom,
  IconSnap,
  IconVolume,
} from './icons.jsx';

export function PlayboothSkin({ children }) {
  const deck = useApp((s) => s.deck);
  const borderId = useApp((s) => s.borderId);
  const aspect = useApp((s) => s.videoAspect);
  const movie = useApp((s) => movieById(s.insertedTapeId));
  const station = useApp((s) => s.station);

  const onKeyDown = (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || document.fullscreenElement) return;
    if (useApp.getState().station === 'watch') {
      e.preventDefault();
      useApp.getState().goStation('player');
    }
  };

  return (
    <Container
      className="pb-skin"
      data-deck={deck}
      data-frame={borderId}
      aria-label={movie ? `PLAYBOOTH player: ${movie.title}` : 'PLAYBOOTH player'}
      onKeyDown={onKeyDown}
    >
      <header className="pb-head">
        <TapeWindow movie={movie} deck={deck} />
        <div className="pb-head-keys">
          <button
            type="button"
            className="key key--small"
            onClick={() => useApp.getState().ejectTape()}
            aria-label={movie ? `Eject ${movie.title}` : 'Eject tape'}
            disabled={!movie}
          >
            <IconEject />
            <span className="key-cap">Eject</span>
          </button>
          <button
            type="button"
            className="key key--small"
            onClick={() => useApp.getState().goStation('player')}
            aria-label="Stand up and look around the booth"
          >
            <IconRoom />
            <span className="key-cap">Booth</span>
          </button>
        </div>
      </header>

      <div className="pb-screen">
        <FramedPicture borderId={borderId} aspect={aspect} movie={movie} deck={deck}>
          {children}
          <Poster.Root className="pb-poster">
            <Poster.Image className="pb-poster-img" alt="" />
          </Poster.Root>
          <BufferingIndicator
            className="pb-buffering"
            render={(props) => (
              <div {...props}>
                <span className="pb-buffering-reel" />
              </div>
            )}
          />
          <Flash />
        </FramedPicture>

        <StatusIndicator.Root className="pb-bubble">
          <StatusIndicator.Value className="pb-bubble-text" />
        </StatusIndicator.Root>
        <SeekIndicator.Root className="pb-bubble">
          <SeekIndicator.Value className="pb-bubble-text" />
        </SeekIndicator.Root>
        <VolumeIndicator.Root className="pb-bubble">
          <VolumeIndicator.Value className="pb-bubble-text" />
        </VolumeIndicator.Root>

        <ErrorDialog.Root>
          <ErrorDialog.Popup className="pb-error">
            <ErrorDialog.Title className="pb-error-title" />
            <ErrorDialog.Description className="pb-error-text" />
            <ErrorDialog.Close className="key key--wide" />
          </ErrorDialog.Popup>
        </ErrorDialog.Root>
      </div>

      <Controls.Root visibility="always">
        <Controls.Content className="pb-deck">
          {deck === 'frame' ? <FramePicker active={station === 'watch'} /> : <TransportDeck />}
        </Controls.Content>
      </Controls.Root>

      <PlayboothHotkeys enabled={deck === 'playing'} />
      <StatusAnnouncer />
    </Container>
  );
}

function TapeWindow({ movie, deck }) {
  const status = !movie
    ? 'No tape in the deck'
    : deck === 'reading'
      ? 'Reading the tape'
      : deck === 'frame'
        ? 'Choose a frame to start'
        : 'Now playing';
  return (
    <div className="pb-tape-window" style={movie ? { '--tape': movie.colors.shell } : undefined}>
      <span className="pb-tape-reels" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="pb-tape-text">
        <span className="pb-tape-status">{status}</span>
        <span className="pb-tape-title">{movie?.title ?? 'Insert a tape'}</span>
        {movie?.credit && (
          <span className="pb-tape-credit">
            {movie.credit}, {movie.license}
          </span>
        )}
      </span>
    </div>
  );
}

/** The picture area: the video sits in the frame's window, the frame is a canvas on top. */
function FramedPicture({ borderId, aspect, movie, deck, children }) {
  const border = borderById(borderId);
  const p = windowPercents(border, aspect);
  const store = usePlayer();
  const onClick = () => {
    if (useApp.getState().deck !== 'playing') return;
    try {
      if (store.paused) store.play()?.catch?.(() => {});
      else store.pause();
    } catch {
      /* no media yet */
    }
  };
  return (
    <div className="pb-frame" style={{ '--frame-ar': p.aspectRatio }}>
      <div
        className="pb-window"
        style={{
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.width}%`,
          height: `${p.height}%`,
          borderRadius: p.radiusPct ? `${p.radiusPct}% / ${p.radiusPct * aspect}%` : undefined,
        }}
        onClick={onClick}
        data-deck={deck}
      >
        {children}
      </div>
      <FrameOverlay border={border} aspect={aspect} movie={movie} />
    </div>
  );
}

function FrameOverlay({ border, aspect, movie }) {
  const canvas = useRef(null);
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    ensureFrameFonts().then(() => setFontsTick((t) => t + 1));
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
      paintOverlay(el.getContext('2d'), border, L, { title: movie?.title, date: formatDate(), timecode: '' });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    return () => ro.disconnect();
  }, [border, aspect, movie, fontsTick]);
  return <canvas ref={canvas} className="pb-frame-art" aria-hidden="true" />;
}

function Flash() {
  const token = useApp((s) => s.flashToken);
  const ref = useRef(null);
  useEffect(() => {
    if (!token || !ref.current) return;
    const el = ref.current;
    el.removeAttribute('data-on');
    void el.offsetWidth; // restart the animation
    el.setAttribute('data-on', '');
  }, [token]);
  return <div ref={ref} className="pb-flash" aria-hidden="true" />;
}

/* ---------- frame picker (before playback) ---------- */

function FramePicker({ active }) {
  const borderId = useApp((s) => s.borderId);
  const setBorder = useApp((s) => s.setBorder);
  const group = useRef(null);
  const selected = borderById(borderId);

  useEffect(() => {
    if (!active) return undefined;
    const id = setTimeout(() => {
      group.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
    }, useApp.getState().reducedMotion ? 30 : 700);
    return () => clearTimeout(id);
  }, [active]);

  const move = (dir) => {
    const i = BORDERS.findIndex((b) => b.id === borderId);
    const next = BORDERS[(i + dir + BORDERS.length) % BORDERS.length];
    setBorder(next.id);
    requestAnimationFrame(() => group.current?.querySelector(`[data-id="${next.id}"]`)?.focus());
  };

  const confirm = () => {
    const s = useApp.getState();
    s.confirmFrame();
    s.announce(`${selected.name} frame set. Playing.`);
  };

  return (
    <div className="pb-picker">
      <div className="pb-picker-copy">
        <p className="pb-picker-title" id="pb-picker-title">
          Choose a frame for your photos
        </p>
        <p className="pb-picker-hint">{selected.hint}</p>
      </div>
      <div
        ref={group}
        className="pb-frame-keys"
        role="radiogroup"
        aria-labelledby="pb-picker-title"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            move(document.dir === 'rtl' && e.key === 'ArrowRight' ? -1 : 1);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            move(document.dir === 'rtl' && e.key === 'ArrowLeft' ? 1 : -1);
          }
        }}
      >
        {BORDERS.map((b) => {
          const on = b.id === borderId;
          return (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-id={b.id}
              className="frame-key"
              onClick={() => setBorder(b.id)}
            >
              <span className="frame-swatch" style={{ '--a': b.swatch[0], '--b': b.swatch[1] }} aria-hidden="true" />
              <span className="frame-name">{b.name}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="key key--wide key--cherry pb-confirm" onClick={confirm}>
        <IconPlay />
        <span>Use this frame and play</span>
      </button>
    </div>
  );
}

/* ---------- transport deck (during playback) ---------- */

function TransportDeck() {
  const count = useApp((s) => s.sessionPhotos.length);
  const total = useApp((s) => s.collection.length);
  const printing = useApp((s) => s.printing);
  const [snapping, setSnapping] = useState(false);
  const snap = async () => {
    if (snapping) return;
    setSnapping(true);
    await snapPhoto();
    setSnapping(false);
  };

  return (
    <>
      <div className="pb-track-row">
        <Time.Group className="pb-lcd">
          <Time.Value type="current" className="pb-lcd-now" />
          <Time.Separator className="pb-lcd-sep">/</Time.Separator>
          <Time.Value type="duration" className="pb-lcd-total" />
        </Time.Group>
        <TimeSlider.Root className="pb-seek">
          <TimeSlider.Track className="pb-seek-track">
            <TimeSlider.Buffer className="pb-seek-buffer" />
            <TimeSlider.Fill className="pb-seek-fill" />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="pb-seek-thumb" />
          <TimeSlider.Preview className="pb-seek-preview" overflow="clamp">
            <Slider.Thumbnail.Root className="pb-seek-thumbnail">
              <Slider.Thumbnail.Image className="pb-seek-thumbnail-img" alt="" />
            </Slider.Thumbnail.Root>
            <TimeSlider.Value type="pointer" className="pb-seek-time" />
          </TimeSlider.Preview>
        </TimeSlider.Root>
      </div>

      <div className="pb-keys">
        <Controls.Group className="pb-cluster" aria-label="Playback">
          <SeekButton
            seconds={-10}
            className="key"
            label="Back 10 seconds"
            render={(props) => (
              <button {...props}>
                <IconBack />
                <span className="key-cap">Back 10</span>
              </button>
            )}
          />
          <PlayButton
            className="key key--big key--cherry"
            render={(props, state) => (
              <button {...props}>
                {state.ended ? <IconReplay /> : state.paused ? <IconPlay /> : <IconPause />}
              </button>
            )}
          />
          <SeekButton
            seconds={10}
            className="key"
            label="Ahead 10 seconds"
            render={(props) => (
              <button {...props}>
                <IconForward />
                <span className="key-cap">Ahead 10</span>
              </button>
            )}
          />
        </Controls.Group>

        <Controls.Group className="pb-cluster pb-cluster--sound" aria-label="Sound">
          <MuteButton
            className="key"
            label={(state) => (state.muted ? 'Unmute' : 'Mute')}
            render={(props, state) => (
              <button {...props}>
                <IconVolume level={state.muted ? 'off' : state.volumeLevel === 'low' ? 'low' : state.volumeLevel === 'off' ? 'off' : 'high'} />
                <span className="key-cap">{state.muted ? 'Unmute' : 'Mute'}</span>
              </button>
            )}
          />
          <VolumeSlider.Root className="pb-fader">
            <VolumeSlider.Track className="pb-fader-track">
              <VolumeSlider.Fill className="pb-fader-fill" />
            </VolumeSlider.Track>
            <VolumeSlider.Thumb className="pb-fader-thumb" />
          </VolumeSlider.Root>
        </Controls.Group>

        <Controls.Group className="pb-cluster" aria-label="Screen">
          <CaptionsButton
            className="key"
            label={(state) => (state.subtitlesShowing ? 'Turn captions off' : 'Turn captions on')}
            render={(props, state) => (
              <button {...props}>
                <IconCaptions on={state.subtitlesShowing} />
                <span className="key-cap">Captions</span>
              </button>
            )}
          />
          <PlaybackRateButton
            className="key key--rate"
            label={(state) => `Speed, ${state.rate} times`}
            render={(props, state) => (
              <button {...props}>
                <span className="key-rate">{`${state.rate}×`}</span>
                <span className="key-cap">Speed</span>
              </button>
            )}
          />
          <FullscreenButton
            className="key"
            label={(state) => (state.fullscreen ? 'Exit full screen' : 'Full screen')}
            render={(props, state) => (
              <button {...props}>
                <IconFullscreen exit={state.fullscreen} />
                <span className="key-cap">{state.fullscreen ? 'Exit full screen' : 'Full screen'}</span>
              </button>
            )}
          />
        </Controls.Group>

        <div className="pb-cluster pb-cluster--camera" role="group" aria-label="Photos">
          <button
            type="button"
            className="key key--big key--butter key--snap"
            onClick={snap}
            aria-label={`Take a photo of this moment. ${count} taken from this tape.`}
            aria-keyshortcuts="S"
            data-busy={snapping || undefined}
          >
            <IconSnap />
            {count > 0 && (
              <span className="key-badge" aria-hidden="true">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="key"
            onClick={() => useApp.getState().setAlbumOpen(true)}
            aria-label={`Open the photo album, ${total} saved`}
          >
            <IconAlbum />
            <span className="key-cap">Album</span>
          </button>
          <button
            type="button"
            className="key key--lever"
            onClick={() => printPhotos()}
            disabled={printing}
            aria-label={count ? `Print ${Math.min(count, 8)} photo${count === 1 ? '' : 's'} now` : 'Print this moment now'}
          >
            <IconPrint />
            <span className="key-cap">Print</span>
          </button>
        </div>
      </div>
    </>
  );
}

function PlayboothHotkeys({ enabled }) {
  const off = !enabled;
  useHotkey({
    keys: 's',
    action: 'snapshot',
    disabled: off,
    onActivate: () => snapPhoto(),
  });
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
    </>
  );
}
