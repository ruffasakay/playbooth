import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Video } from '@videojs/react/video';
import { MuxVideo } from '@videojs/react/media/mux-video';
import { MuxData } from '@videojs/react/extensions/mux-data';
import { useApp, movieById } from '../store.js';
import { Player, usePlayer } from './core.js';
import { PlayboothSkin } from './Skin.jsx';

/**
 * The deck you sit in front of. It is always mounted, because the same
 * <video> also feeds the 3D screen in the room. It only becomes visible
 * (and focusable) while you are watching.
 */
export function PlayerLayer() {
  const phase = useApp((s) => s.phase);
  const station = useApp((s) => s.station);
  const webgl = useApp((s) => s.webgl);
  const inserted = useApp((s) => s.insertedTapeId);
  const open = phase === 'inside' && (station === 'watch' || (!webgl && !!inserted));
  const movie = movieById(inserted);

  return (
    <div className="faceplate" data-open={open || undefined} inert={!open || undefined}>
      <Player>
        <PlayboothSkin>
          <Media />
        </PlayboothSkin>
        {movie?.playbackId && <MuxData playerSoftwareName="playbooth" />}
        <DeckBridge />
      </Player>
    </div>
  );
}

function Media() {
  const movie = useApp((s) => movieById(s.insertedTapeId));
  const setVideoEl = useApp((s) => s.setVideoEl);
  const ref = useCallback((el) => {
    if (el) setVideoEl(el);
  }, [setVideoEl]);
  const source = useMemo(
    () => (movie?.playbackId ? { playbackId: movie.playbackId, preferPlayback: 'mse' } : null),
    [movie?.playbackId],
  );
  const onLoadedMetadata = (e) => {
    const v = e.currentTarget;
    if (v.videoWidth && v.videoHeight) useApp.setState({ videoAspect: v.videoWidth / v.videoHeight });
  };
  const tracks = movie?.captions ? (
    <track kind="captions" src={movie.captions} srcLang="en" label="English" />
  ) : null;

  if (movie?.playbackId) {
    return (
      <MuxVideo
        key={movie.id}
        ref={ref}
        className="pb-media"
        source={source}
        crossOrigin="anonymous"
        playsInline
        preload="auto"
        onLoadedMetadata={onLoadedMetadata}
      >
        {tracks}
      </MuxVideo>
    );
  }
  return (
    <Video
      key={movie?.id ?? 'empty'}
      ref={ref}
      className="pb-media"
      src={movie?.src}
      crossOrigin="anonymous"
      playsInline
      preload={movie ? 'auto' : 'none'}
      onLoadedMetadata={onLoadedMetadata}
    >
      {tracks}
    </Video>
  );
}

/** Moves the deck through reading → frame → playing, and prints at the end. */
function DeckBridge() {
  const store = usePlayer();
  const ended = usePlayer((s) => s.ended);
  const error = usePlayer((s) => s.error);
  const deck = useApp((s) => s.deck);
  const inserted = useApp((s) => s.insertedTapeId);
  const readingSince = useRef(0);

  // reading: wait for the media (at least long enough to see the reels turn)
  useEffect(() => {
    if (deck !== 'reading') return undefined;
    readingSince.current = performance.now();
    const reduced = useApp.getState().reducedMotion;
    const minWait = reduced ? 200 : 1500;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      const s = useApp.getState();
      if (s.deck !== 'reading') return;
      s.setDeck('frame');
      useApp.setState({ videoAspect: guessAspect(s.videoEl) });
      s.goStation('watch');
      const movie = movieById(s.insertedTapeId);
      s.announce(`${movie?.title ?? 'The tape'} is ready. Choose a frame for your photos.`);
    };
    const check = setInterval(() => {
      const elapsed = performance.now() - readingSince.current;
      if ((useApp.getState().videoEl?.readyState ?? 0) >= 2 && elapsed > minWait) finish();
      else if (elapsed > 8000) finish();
    }, 120);
    return () => clearInterval(check);
  }, [deck, inserted]);

  useEffect(() => {
    if (error && useApp.getState().deck === 'reading') useApp.getState().setDeck('frame');
  }, [error]);

  // keep paused until a frame is confirmed, then roll
  useEffect(() => {
    if (deck === 'frame') safely(() => store.pause());
    if (deck === 'playing') {
      try {
        store.play().catch(() => useApp.getState().announce('Press play to start the movie.'));
      } catch {
        useApp.getState().announce('Press play to start the movie.');
      }
    }
  }, [deck, store]);

  // movie finished: off to the printer
  useEffect(() => {
    if (ended && useApp.getState().deck === 'playing' && !useApp.getState().printing) {
      const st = useApp.getState();
      if (st.snaps.length) {
        st.announce('The film ended. Your snaps are ready to print.');
        st.setCompilerOpen(true);
      }
    }
  }, [ended]);

  // tape ejected: stop the media
  useEffect(() => {
    if (!inserted) safely(() => store.pause());
  }, [inserted, store]);

  return null;
}

/** Player actions throw when no media is attached yet; that is fine here. */
function safely(fn) {
  try {
    const r = fn();
    if (r && typeof r.catch === 'function') return r.catch(() => {});
    return r;
  } catch {
    return undefined;
  }
}

function guessAspect(video) {
  if (video?.videoWidth && video?.videoHeight) return video.videoWidth / video.videoHeight;
  return 16 / 9;
}
