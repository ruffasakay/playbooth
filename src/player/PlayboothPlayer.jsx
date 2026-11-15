import { useEffect, useLayoutEffect, useMemo } from 'react';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '../styles/tokens.css';
import '../styles/skin.css';
import './embed.css';
import { useApp, registerMovie } from '../store.js';
import { borderById } from '../data/borders.js';
import { Player } from './core.js';
import { PlayboothSkin } from './Skin.jsx';
import { Media } from './PlayerLayer.jsx';
import { Hint } from '../ui/Hint.jsx';
import { useFramePicture } from './frameUpload.js';

/**
 * The PLAYBOOTH player on any page: the Video.js 10 skin in its frame, with
 * the same keys, reel, scenes and settings as in the booth, minus the booth.
 *
 *   <PlayboothPlayer
 *     title="Sprite Fright"
 *     playbackId="TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs"   // a Mux playback ID, or
 *     src="https://example.com/film.m3u8"                           // any HLS or MP4 URL
 *     credit="Blender Studio"
 *     frame="cocoadots"                                                 // any frame id in data/borders.js
 *     style={{ width: '100%', aspectRatio: '16 / 9' }}
 *   />
 *
 * The player lays itself out from its own box, so give it a width and a
 * height (an aspect ratio is enough). On a phone it picks its own shape
 * (`adaptive`, on by default): held upright, a tall box, so the picture sits
 * on top with the keys under it, as in a phone's own player; held sideways,
 * the height of the screen, keys beside the picture. Pass adaptive={false}
 * to keep your box everywhere. One player per page: it shares one store,
 * like the booth.
 */
export function PlayboothPlayer({ title = 'Untitled', playbackId, src, captions, credit = '', year = '', frame, className = '', style, adaptive = true }) {
  const id = `embed:${playbackId || src || title}`;
  const movie = useMemo(
    () => ({ id, title, playbackId, src, captions, studio: credit, credit, license: '', year: String(year), colors: { shell: '#3c8a78' } }),
    [id, title, playbackId, src, captions, credit, year],
  );
  registerMovie(movie);

  useLayoutEffect(() => {
    const rm = matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = matchMedia('(pointer: coarse)');
    useApp.setState({
      host: 'embed',
      phase: 'inside',
      station: 'watch',
      webgl: false,
      insertedTapeId: movie.id,
      deck: 'playing',
      frameLocked: false,
      reducedMotion: rm.matches,
      coarsePointer: coarse.matches,
      ...(frame && borderById(frame)?.id === frame ? { borderId: frame } : {}),
      // the frame chooser's "Your own frame": a landscape picture becomes the frame
      frameUpload: useFramePicture,
    });
  }, [movie, frame]);

  useEffect(() => {
    const coarse = matchMedia('(pointer: coarse)');
    const sync = () => useApp.setState({ coarsePointer: coarse.matches });
    coarse.addEventListener('change', sync);
    return () => coarse.removeEventListener('change', sync);
  }, []);

  return (
    <>
      <div className={`pb-host${adaptive ? ' pb-host--adapt' : ''} ${className}`.trim()} data-fs-root style={style}>
        <Player>
          <PlayboothSkin>
            <Media />
          </PlayboothSkin>
        </Player>
      </div>
      <Live />
      <Hint />
    </>
  );
}

/** Spoken updates (snaps, scenes, volume) for screen readers. */
function Live() {
  const message = useApp((s) => s.message);
  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
      {message}
    </div>
  );
}

export default PlayboothPlayer;
