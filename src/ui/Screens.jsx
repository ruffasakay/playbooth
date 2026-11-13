import { useEffect, useRef, useState } from 'react';
import { MOVIES } from '../data/movies.js';
import { useApp, movieById } from '../store.js';
import { Logo } from './Logo.jsx';

/* ---------- preloader ---------- */

export function Preloader() {
  const ready = useApp((s) => s.sceneReady);
  const webgl = useApp((s) => s.webgl);
  const [minDone, setMinDone] = useState(false);
  const [gone, setGone] = useState(false);
  const done = (ready || !webgl) && minDone;
  useEffect(() => {
    const id = setTimeout(() => setMinDone(true), 900);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!done) return undefined;
    if (useApp.getState().phase === 'loading') useApp.setState({ phase: 'outside' });
    const id = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(id);
  }, [done]);
  if (gone) return null;
  return (
    <div className="preloader" data-done={done || undefined} role="status" aria-live="polite">
      <div className="preloader-inner">
        <Logo size={88} />
        <p className="preloader-title">PLAYBOOTH</p>
        <div className="preloader-strip" aria-hidden="true">
          <span />
        </div>
        <p className="preloader-text">{done ? 'The booth is open.' : 'Setting up the booth…'}</p>
      </div>
    </div>
  );
}

/* ---------- hero ---------- */

export function Hero() {
  const phase = useApp((s) => s.phase);
  const enter = useApp((s) => s.enterBooth);
  const visible = phase === 'outside' || phase === 'loading';
  const cta = useRef(null);
  const leaving = phase === 'entering';

  useEffect(() => {
    if (phase === 'outside' && document.activeElement === document.body) {
      // land keyboard users on the main action without scrolling
      cta.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  const goStraight = (e) => {
    e.preventDefault();
    deepLinkToPlayer();
  };

  return (
    <section
      className="hero"
      data-visible={visible || undefined}
      data-leaving={leaving || undefined}
      aria-labelledby="hero-title"
      inert={!visible || undefined}
    >
      <div className="hero-copy">
        <div className="hero-brand">
          <Logo size={64} />
          <h1 id="hero-title" className="hero-title">
            PLAYBOOTH
          </h1>
        </div>
        <p className="hero-lede">
          Your own little movie booth. Pick a movie, step inside, capture your favorite moments,
          and print them as memories.
        </p>
        <ol className="hero-steps">
          <li>
            <span>
              <strong>Choose a movie</strong> from the tape cabinet.
            </span>
          </li>
          <li>
            <span>
              <strong>Pick a frame</strong> for your movie screen.
            </span>
          </li>
          <li>
            <span>
              <strong>Watch and snap</strong> the moments you love.
            </span>
          </li>
          <li>
            <span>
              <strong>Collect your prints</strong> from the booth’s printer.
            </span>
          </li>
        </ol>
        <div className="hero-actions">
          <button ref={cta} type="button" className="cta" onClick={enter} disabled={phase !== 'outside'}>
            <span className="cta-face">Enter to play</span>
          </button>
          <a className="quiet-link" href="#player" onClick={goStraight}>
            Go straight to the player
          </a>
        </div>
      </div>
    </section>
  );
}

/** Skip the walk-in: open the booth with the first tape already reading. */
export function deepLinkToPlayer() {
  const s = useApp.getState();
  if (s.phase === 'inside') {
    if (!s.insertedTapeId) s.requestInsert(MOVIES[0].id);
    return;
  }
  useApp.setState({ phase: 'inside', station: 'booth' });
  if (s.webgl) {
    import('../three/world.js').then(({ motion }) => {
      motion.curtain.open = 1;
    });
  }
  setTimeout(() => {
    if (!s.webgl) useApp.getState().insertTape(MOVIES[0].id);
    else useApp.getState().requestInsert(MOVIES[0].id);
  }, 350);
}

/* ---------- inside the booth ---------- */

const STATIONS = [
  { id: 'tapes', label: 'Tapes' },
  { id: 'booth', label: 'Whole booth' },
  { id: 'player', label: 'Player' },
  { id: 'prints', label: 'Prints' },
];

export function RoomUI() {
  const phase = useApp((s) => s.phase);
  const station = useApp((s) => s.station);
  const webgl = useApp((s) => s.webgl);
  const veil = useApp((s) => s.veil);
  return (
    <>
      {phase === 'entering' || phase === 'leaving' ? <SkipButton /> : null}
      {phase === 'inside' && station !== 'watch' && webgl && (
        <>
          <Plaque station={station} />
          <Hint />
        </>
      )}
      <div className="veil" data-on={veil || undefined} aria-hidden="true" />
    </>
  );
}

function SkipButton() {
  const skip = useApp((s) => s.skipIntro);
  const phase = useApp((s) => s.phase);
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);
  return (
    <button ref={ref} type="button" className="skip" onClick={skip}>
      {phase === 'entering' ? 'Skip the walk in' : 'Skip the walk out'}
    </button>
  );
}

function Plaque({ station }) {
  const go = useApp((s) => s.goStation);
  const leave = useApp((s) => s.leaveBooth);
  const inserted = useApp((s) => s.insertedTapeId);
  const deck = useApp((s) => s.deck);
  return (
    <nav className="plaque" aria-label="Move around the booth">
      <ul className="plaque-keys">
        {STATIONS.map((st) => (
          <li key={st.id}>
            <button
              type="button"
              className="plaque-key"
              aria-current={station === st.id ? 'location' : undefined}
              onClick={() => go(st.id)}
            >
              {st.label}
            </button>
          </li>
        ))}
        {inserted && deck !== 'reading' && (
          <li>
            <button type="button" className="plaque-key plaque-key--watch" onClick={() => go('watch')}>
              Sit and watch
            </button>
          </li>
        )}
        <li className="plaque-out">
          <button type="button" className="plaque-key plaque-key--out" onClick={leave}>
            Step outside
          </button>
        </li>
      </ul>
    </nav>
  );
}

function Hint() {
  const held = useApp((s) => movieById(s.heldTapeId));
  const dragging = useApp((s) => s.dragging);
  const inserted = useApp((s) => movieById(s.insertedTapeId));
  const deck = useApp((s) => s.deck);
  const printing = useApp((s) => s.printing);
  const station = useApp((s) => s.station);
  const printBatch = useApp((s) => s.printBatch.length);
  const coarse = useApp((s) => s.coarsePointer);

  let text;
  if (printing) text = 'Printing your photos…';
  else if (dragging) text = 'Bring the tape to the glowing slot. It snaps in when it’s close.';
  else if (held) text = `Holding ${held.title}. ${coarse ? 'Tap' : 'Click'} the glowing slot under the screen, or drag the tape into it.`;
  else if (inserted && deck === 'reading') text = `Reading ${inserted.title}…`;
  else if (station === 'prints' && printBatch) text = `${coarse ? 'Tap' : 'Click'} a print to see it larger or save it. The tray is your album.`;
  else if (inserted) text = `${inserted.title} is in. ${coarse ? 'Tap' : 'Click'} the screen to sit down and watch.`;
  else text = coarse
    ? 'Tap a tape to pick it up, then tap the glowing slot on the player.'
    : 'Drag a tape into the player’s slot, or click a tape and then the slot.';

  return (
    <p className="hint" aria-hidden="true">
      {text}
    </p>
  );
}

/* ---------- live region ---------- */

export function Announcer() {
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
