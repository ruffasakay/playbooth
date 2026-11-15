import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { PlayboothPlayer } from '../player/PlayboothPlayer.jsx';
import { USAGE } from './usage.js';
import './embed-page.css';
import { useApp } from '../store.js';

if (import.meta.env.DEV) window.__app = useApp;

/*
 * An ordinary page that knows nothing about the booth: a heading, some text,
 * and the PLAYBOOTH player as one component. It is the proof that the skin
 * works outside its own site, exactly as the README and the showcase say.
 */
function Page() {
  return (
    <main className="ep">
      <p className="ep-kicker">An ordinary page</p>
      <h1>The PLAYBOOTH player, dropped in</h1>
      <p className="ep-lede">
        This page has none of the booth: no 3D room, no shelf, no printer. It renders one component, <code>&lt;PlayboothPlayer&gt;</code>,
        with a Mux playback ID, and gets the whole Video.js 10 skin: the frame (and the frame chooser, with your own picture), the vertical
        progress and its reel, quality, brightness, captions, snaps and every keyboard shortcut.
      </p>
      <PlayboothPlayer
        title="Sprite Fright"
        playbackId={import.meta.env.DEV && location.search.includes('local') ? undefined : 'TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs'}
        src={import.meta.env.DEV && location.search.includes('local') ? '/dev/sample.mp4' : undefined}
        credit="Blender Studio"
        year={2021}
        frame="cocoadots"
        style={{ width: '100%', aspectRatio: '16 / 10' }}
      />
      <h2>The code for it</h2>
      <pre className="ep-code">
        <code>{USAGE.jsx}</code>
      </pre>
      <p className="ep-foot">
        Sprite Fright © Blender Foundation, studio.blender.org, CC BY 4.0. Skin:{' '}
        <a href="https://github.com/ruffasakay/playbooth">github.com/ruffasakay/playbooth</a> (Apache 2.0) ·{' '}
        <a href="/player/">the showcase</a> · <a href="/">the booth</a>
      </p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
    <Analytics />
  </StrictMode>,
);
