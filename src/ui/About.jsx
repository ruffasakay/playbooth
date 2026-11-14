import { useEffect } from 'react';
import { useApp } from '../store.js';
import { BackKey, useModal } from './Dialogs.jsx';
import { Logo } from './Logo.jsx';
import { Credit } from './Credit.jsx';

/** Controls, as a game's pause card lists them. Touch screens get touch words. */
const ROOM_KEYS = [
  [['Click'], 'Pick up a tape and look at it', ['Tap']],
  [['Drag'], 'Slide a tape into the player', ['Drag']],
  [['1', '4'], 'Look at the films, player, prints, room', ['Keys']],
  [['W'], 'Sit down and watch', ['Watch']],
  [['5'], 'Your snaps, ready to print', ['Snaps']],
  [['L'], 'Lights up, lights down', ['Switch']],
];
const PLAYER_KEYS = [
  [['Space'], 'Play and pause', ['Tap']],
  [['J', 'L'], 'Back or forward 10 seconds', ['±10']],
  [['S'], 'Snap the frame on screen', ['Snap']],
  [['F'], 'Full screen, turned sideways on phones', ['Full']],
  [['C'], 'Captions on and off', ['CC']],
  [['M'], 'Sound on and off', ['Sound']],
];

function Keys({ keys }) {
  return (
    <span className="about-keys">
      {keys.map((k, i) => (
        <span key={k}>
          {i > 0 && <span className="about-sep">{keys.length === 2 && /^\d$/.test(k) ? '–' : '/'}</span>}
          <kbd>{k}</kbd>
        </span>
      ))}
    </span>
  );
}

function ControlList({ title, rows, touch }) {
  return (
    <section className="about-controls" aria-label={title}>
      <h3 className="about-label">{title}</h3>
      <dl>
        {rows.map(([keys, what, t]) => (
          <div key={what} className="about-row">
            <dt>{touch ? <span className="about-touch">{t[0]}</span> : <Keys keys={keys} />}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * About the booth: one card, like a game's title card. The name, the idea,
 * the controls and who made it. No scrolling, a Back key, Esc closes it.
 */
export function AboutDialog() {
  const open = useApp((s) => s.aboutOpen);
  const touch = useApp((s) => s.coarsePointer);
  const close = () => useApp.getState().setAboutOpen(false);
  const ref = useModal(open, close);
  return (
    <dialog ref={ref} className="about" aria-labelledby="about-title">
      {open && (
        <>
          <div className="about-back">
            <BackKey onClick={close} />
          </div>
          <article className="about-card">
            <header className="about-head">
              <Logo size={46} className="about-logo" />
              <div>
                <h2 id="about-title" className="wordmark about-title">PLAYBOOTH</h2>
                <p className="about-tag">a photobooth for films</p>
              </div>
            </header>

            <div className="about-idea">
              <p className="about-play">
                <span className="about-x">Play</span> <span className="about-times">×2</span>
              </p>
              <p className="about-text">
                <b>Play</b> as in a game: walk into the booth, pick a tape off the shelf and slide it into the player.{' '}
                <b>Play</b> as in a film: watch it, snap any frame you love and print your snaps as a photostrip.
              </p>
            </div>

            <div className="about-grid">
              <ControlList title="In the booth" rows={ROOM_KEYS} touch={touch} />
              <ControlList title="In the player" rows={PLAYER_KEYS} touch={touch} />
            </div>

            <footer className="about-foot">
              <Credit className="about-credit" />
              <p className="about-fine">Player built on Video.js 10. Films by the Blender Foundation, CC BY.</p>
            </footer>
          </article>
        </>
      )}
    </dialog>
  );
}

/** "?" opens the card anywhere outside the player. */
export function useAboutKey(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      if (e.key !== '?' || e.target.closest?.('input, textarea, dialog')) return;
      e.preventDefault();
      useApp.getState().setAboutOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
