import { useEffect, useRef, useState } from 'react';
import { MOVIES } from '../data/movies.js';
import { useApp } from '../store.js';
import { Logo, Wordmark } from './Logo.jsx';
import * as I from '../player/icons.jsx';

/* ---------- preloader ---------- */

export function Preloader() {
  const ready = useApp((s) => s.sceneReady);
  const webgl = useApp((s) => s.webgl);
  const [minDone, setMinDone] = useState(false);
  const [gone, setGone] = useState(false);
  const done = (ready || !webgl) && minDone;
  useEffect(() => {
    const id = setTimeout(() => setMinDone(true), 1100);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!done) return undefined;
    const st = useApp.getState();
    if (st.phase === 'loading') {
      useApp.setState({ phase: 'outside' });
      // the camera takes a slow look around first; words arrive after it
      const wait = !st.webgl || st.reducedMotion ? 0 : 4300;
      setTimeout(() => useApp.setState({ introDone: true }), wait);
    }
    const id = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(id);
  }, [done]);
  if (gone) return null;
  return (
    <div className="preloader" data-done={done || undefined} role="status" aria-live="polite">
      <div className="preloader-inner">
        <Logo size={56} />
        <Wordmark className="preloader-mark" />
        <span className="preloader-line" aria-hidden="true"><span /></span>
        <span className="preloader-text">{done ? 'Open' : 'Warming up the booth'}</span>
      </div>
    </div>
  );
}

/* ---------- hero ---------- */

export function Hero() {
  const phase = useApp((s) => s.phase);
  const intro = useApp((s) => s.introDone);
  const enter = useApp((s) => s.enterBooth);
  const visible = phase === 'outside' && intro;
  const cta = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'Enter' && document.activeElement === document.body) enter();
      if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey) useApp.getState().toggleTheme();
    };
    window.addEventListener('keydown', onKey);
    if (document.activeElement === document.body) cta.current?.focus({ preventScroll: true });
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, enter]);

  return (
    <section className="hero" data-visible={visible || undefined} data-leaving={phase === 'entering' || undefined} aria-labelledby="hero-title" inert={!visible || undefined}>
      <div className="hero-copy">
        <p className="hero-kicker reveal" style={{ '--i': 0 }}>
          <Logo size={26} /> a photobooth for films
        </p>
        <Wordmark as="h1" id="hero-title" className="hero-title reveal reveal--1" />
        <p className="hero-hand reveal" style={{ '--i': 2 }}>
          play a film, keep the moment
        </p>
        <p className="hero-lede reveal" style={{ '--i': 3 }}>
          Step inside, slide a tape into the player and watch. Press Snap on any frame you love and the booth keeps it,
          ready to print.
        </p>
        <ol className="hero-beats reveal" style={{ '--i': 4 }}>
          <li>
            <span className="beat-name">Play</span>
            <span className="beat-text">Pick a film from the rack and frame your screen.</span>
          </li>
          <li>
            <span className="beat-name">Snap</span>
            <span className="beat-text">Catch any frame, playing or paused. It downloads at once.</span>
          </li>
          <li>
            <span className="beat-name">Print</span>
            <span className="beat-text">Print snaps one by one, or stack them into a photostrip.</span>
          </li>
        </ol>
        <div className="hero-actions reveal" style={{ '--i': 5 }}>
          <button ref={cta} type="button" className="btn btn--primary btn--lg" onClick={enter} disabled={!visible} data-tip="Step inside" data-key="Enter">
            Enter to play
          </button>
        </div>
      </div>
    </section>
  );
}

export function deepLinkToPlayer() {
  const s = useApp.getState();
  if (s.phase === 'inside') {
    if (!s.insertedTapeId) s.requestInsert(MOVIES[0].id);
    return;
  }
  useApp.setState({ phase: 'inside', station: 'player' });
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

const NAV = [
  { id: 'tapes', key: '1', label: 'Films' },
  { id: 'player', key: '2', label: 'Player' },
  { id: 'prints', key: '3', label: 'Prints' },
  { id: 'booth', key: '4', label: 'Room' },
];

/**
 * Two small toggles, top right from the street to the booth: lights and
 * sound. The knob carries the icon and slides, so on and off read at a
 * glance without a word.
 */
function Switches() {
  const night = useApp((s) => s.theme === 'night');
  const sound = useApp((s) => s.sound);
  return (
    <div className="switches">
      <button
        type="button"
        role="switch"
        aria-checked={night}
        aria-label="Night lights"
        data-tip={night ? 'Lights up' : 'Lights down'}
        data-key="L"
        data-tip-side="left"
        className="toggle toggle--light"
        data-sfx="none"
        onClick={() => useApp.getState().toggleTheme()}
      >
        <span className="toggle-knob">{night ? <I.Moon /> : <I.Sun />}</span>
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={sound}
        aria-label="Sound"
        data-tip={sound ? 'Sound off' : 'Sound on'}
        data-tip-side="left"
        className="toggle toggle--sound"
        onClick={() => useApp.getState().toggleSound()}
      >
        <span className="toggle-knob"><I.Volume level={sound ? 'high' : 'off'} /></span>
      </button>
    </div>
  );
}

export function RoomUI() {
  const phase = useApp((s) => s.phase);
  const intro = useApp((s) => s.introDone);
  const station = useApp((s) => s.station);
  const webgl = useApp((s) => s.webgl);
  const veil = useApp((s) => s.veil);
  const inspect = useApp((s) => s.inspectId);
  return (
    <>
      {(phase === 'entering' || phase === 'leaving') && <SkipButton />}
      {phase === 'inside' && station !== 'watch' && webgl && !inspect && (
        <>
          <RoomBrand />
          <RoomNav station={station} />
        </>
      )}
      {((phase === 'outside' && intro) || phase === 'entering' || phase === 'leaving' || (phase === 'inside' && station !== 'watch' && !inspect)) && <Switches />}
      <PromptCard />
      <div className="veil" data-on={veil || undefined} aria-hidden="true" />
    </>
  );
}

function RoomBrand() {
  return (
    <div className="room-brand" aria-hidden="true">
      <Logo size={24} />
      <Wordmark />
    </div>
  );
}

function SkipButton() {
  const skip = useApp((s) => s.skipIntro);
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);
  return (
    <button ref={ref} type="button" className="btn skip" onClick={skip} data-tip="Skip the walk" data-key="Esc">
      Skip
    </button>
  );
}

function RoomNav({ station }) {
  const go = useApp((s) => s.goStation);
  const leave = useApp((s) => s.leaveBooth);
  const inserted = useApp((s) => s.insertedTapeId);
  const deck = useApp((s) => s.deck);
  const canWatch = inserted && deck !== 'reading';
  const snaps = useApp((s) => s.snaps.length);

  // the keyboard still works everywhere; nothing on screen spells it out
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, dialog, [role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const hit = NAV.find((n) => n.key === e.key);
      if (hit) go(hit.id);
      else if ((e.key === 'w' || e.key === 'W') && canWatch) go('watch');
      else if (e.key === 'q' || e.key === 'Q') leave();
      else if (e.key === '5') useApp.getState().setCompilerOpen(true);
      else if (e.key === 'l' || e.key === 'L') useApp.getState().toggleTheme();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, leave, canWatch]);

  return (
    <>
      <button type="button" className="float-btn room-exit" onClick={leave} aria-label="Step out of the booth" data-tip="Step out" data-key="Q">
        <I.Exit />
        <span>Step out</span>
      </button>
      <nav className="room-views" aria-label="Look around the booth">
        {NAV.map((n) => {
          const Icon = NAV_ICONS[n.id];
          return (
            <button key={n.id} type="button" className="float-btn view-btn" aria-current={station === n.id ? 'location' : undefined} data-tip={n.label} data-key={n.key} onClick={() => go(n.id)}>
              <Icon />
              <span>{n.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="room-actions">
        <button type="button" className="float-btn" onClick={() => useApp.getState().setCompilerOpen(true)} aria-label={`Snaps, ${snaps}`} data-tip="Snaps" data-key="5">
          <I.Stack />
          <span>Snaps</span>
          {snaps > 0 && <span className="float-badge" aria-hidden="true">{snaps}</span>}
        </button>
        {canWatch && (
          <button type="button" className="float-btn float-btn--primary" onClick={() => go('watch')} data-tip="Sit and watch" data-key="W">
            <I.Play />
            <span>Watch</span>
          </button>
        )}
      </div>
    </>
  );
}

const NAV_ICONS = { tapes: I.Tape, player: I.Screen, prints: I.Print, booth: I.Rooms };

/** The little card that names what's under the pointer, like a game's interact prompt. */
function PromptCard() {
  const hover = useApp((s) => s.hover);
  const coarse = useApp((s) => s.coarsePointer);
  if (!hover || coarse) return null;
  const left = Math.min(hover.x + 18, window.innerWidth - 270);
  const top = Math.min(hover.y + 18, window.innerHeight - 140);
  return (
    <div className="prompt-card" style={{ left, top }} aria-hidden="true">
      <p className="prompt-title">{hover.title}</p>
      {hover.sub && <p className="prompt-sub">{hover.sub}</p>}
      <ul>
        {hover.actions.map(([key, label]) => (
          <li key={label}>
            <kbd>{key === 'click' ? 'Click' : key === 'drag' ? 'Drag' : key}</kbd>
            {label}
          </li>
        ))}
      </ul>
    </div>
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
