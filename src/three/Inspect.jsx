import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useApp, movieById } from '../store.js';
import { TapeCase } from './Tape.jsx';
import { TAPE, interaction } from './world.js';

// the camera below sees 2 * 1.45 * tan(15deg) world units top to bottom
const VIEW_H = 2 * 1.45 * Math.tan((15 * Math.PI) / 180);
const FLY = 'cubic-bezier(0.22, 0.9, 0.24, 1)';

/**
 * A tape up close: the case flies off the shelf to the right, its details
 * slide in on the left, the way a game lets you pick up and turn an object.
 */
export default function Inspect() {
  const id = useApp((s) => s.inspectId);
  const movie = movieById(id);
  const primary = useRef(null);
  const root = useRef(null);
  const object = useRef(null);
  const turn = useRef(null);
  const leaving = useRef(false);
  const inserted = useApp((s) => s.insertedTapeId === id);
  const [ready, setReady] = useState(false);

  /** where the case sits inside the close-up canvas, as a screen rectangle */
  const finalRect = () => {
    const r = object.current.getBoundingClientRect();
    const h = (TAPE.h / VIEW_H) * r.height;
    const w = (TAPE.w / VIEW_H) * r.height;
    return { x: r.left + (r.width - w) / 2, y: r.top + (r.height - h) / 2, w, h, box: r };
  };
  const flight = (shelf) => {
    const f = finalRect();
    const s = shelf.h / f.h;
    const dx = shelf.x + shelf.w / 2 - (f.box.left + f.box.width / 2);
    const dy = shelf.y + shelf.h / 2 - (f.box.top + f.box.height / 2);
    return `translate(${dx}px, ${dy}px) scale(${s})`;
  };

  // fly out of the shelf once the close-up has drawn its first frame
  useEffect(() => {
    if (!ready || !movie) return;
    interaction.inspecting = movie.id;
    const shelf = interaction.tapeRects[movie.id]?.();
    const reduced = useApp.getState().reducedMotion;
    if (shelf && !reduced && object.current) {
      object.current.animate([{ transform: flight(shelf) }, { transform: 'none' }], { duration: 720, easing: FLY });
    }
    root.current?.setAttribute('data-in', '');
  }, [ready, movie]);

  useEffect(() => () => {
    interaction.inspecting = null;
  }, []);

  /** fly back to the shelf, then close; `then` runs after (put in player) */
  const leave = (then) => {
    if (leaving.current) return;
    leaving.current = true;
    const done = () => {
      interaction.inspecting = null;
      useApp.getState().closeInspect();
      then?.();
    };
    const shelf = movie && interaction.tapeRects[movie.id]?.();
    if (!shelf || useApp.getState().reducedMotion || !object.current) return done();
    turn.current?.home();
    root.current?.removeAttribute('data-in');
    root.current?.setAttribute('data-out', '');
    const anim = object.current.animate([{ transform: 'none' }, { transform: flight(shelf) }], { duration: 560, easing: 'cubic-bezier(0.5, 0, 0.3, 1)', fill: 'forwards' });
    anim.onfinish = done;
    anim.oncancel = done;
  };

  useEffect(() => {
    if (!movie) return undefined;
    leaving.current = false;
    const t = setTimeout(() => primary.current?.focus({ preventScroll: true }), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        leave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [movie]);

  useEffect(() => {
    if (!movie) {
      setReady(false);
      interaction.inspecting = null;
    }
  }, [movie]);

  if (!movie) return null;
  const play = () => {
    leave(() => {
      const s = useApp.getState();
      if (inserted) {
        s.goStation('watch');
        return;
      }
      s.goStation('player');
      setTimeout(() => useApp.getState().requestInsert(movie.id), s.reducedMotion ? 0 : 380);
    });
  };

  return (
    <section ref={root} className="inspect" role="dialog" aria-modal="true" aria-labelledby="inspect-title">
      <div className="inspect-veil" onClick={() => leave()} />
      <div className="inspect-copy">
        <h2 id="inspect-title" className="band band--teal">{movie.title}</h2>
        <p className="inspect-meta">
          {movie.year}. {movie.genre}.
        </p>
        <p className="inspect-text">{movie.synopsis}</p>
        <p className="inspect-credit">
          {movie.credit}
          <br />
          {movie.license}
        </p>
        <div className="inspect-actions">
          <button ref={primary} type="button" className="btn btn--primary" onClick={play} data-tip={inserted ? 'Watch' : 'Put in the player'} data-key="Enter">
            {inserted ? 'Watch' : 'Put in player'}
          </button>
          <button type="button" className="btn" onClick={() => leave()} data-tip="Back" data-key="Esc">
            Back
          </button>
        </div>
      </div>
      <p className="inspect-prompts" aria-hidden="true">
        <span><kbd>Drag</kbd> Turn</span>
        <span><kbd>Scroll</kbd> Zoom</span>
        <span><kbd>Esc</kbd> Back</span>
      </p>
      <div ref={object} className="inspect-object" data-ready={ready ? '' : undefined} aria-hidden="true">
        <Canvas dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 1.45] }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[-1.5, 2, 2.5]} intensity={2.2} color="#ffe0bd" />
          <directionalLight position={[2, -0.5, 1]} intensity={0.5} color="#bcd0ff" />
          <Turntable api={turn} onReady={() => setReady(true)}>
            <TapeCase movie={movie} />
          </Turntable>
        </Canvas>
      </div>
    </section>
  );
}


function Turntable({ children, api, onReady }) {
  const group = useRef();
  const frames = useRef(0);
  // starts facing you like it stood on the shelf, then turns to show its side
  const st = useRef({ yaw: 0, pitch: -0.12, ty: -0.35, tp: 0.06, zoom: 1, tz: 1, drag: null, idle: 0 });
  const reduced = useApp((s) => s.reducedMotion);
  useEffect(() => {
    const el = group.current?.parent ? document.querySelector('.inspect-object') : null;
    if (!el) return undefined;
    const down = (e) => {
      st.current.drag = { x: e.clientX, y: e.clientY, yaw: st.current.ty, pitch: st.current.tp };
      el.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      const d = st.current.drag;
      if (!d) return;
      st.current.ty = d.yaw + (e.clientX - d.x) * 0.01;
      st.current.tp = Math.max(-0.9, Math.min(0.9, d.pitch + (e.clientY - d.y) * 0.01));
      st.current.idle = 0;
    };
    const up = () => (st.current.drag = null);
    const wheel = (e) => {
      e.preventDefault();
      st.current.tz = Math.max(0.75, Math.min(1.5, st.current.tz * Math.exp(-e.deltaY * 0.0015)));
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
    };
  }, []);
  if (api) {
    api.current = {
      home() {
        const s = st.current;
        s.ty = Math.round(s.yaw / (Math.PI * 2)) * Math.PI * 2;
        s.tp = -0.12;
        s.tz = 1;
        s.drag = null;
        s.idle = -10;
      },
    };
  }
  useFrame((state, dt) => {
    if (frames.current < 3 && ++frames.current === 3) onReady?.();
    const s = st.current;
    dt = Math.min(dt, 0.05);
    s.idle += dt;
    if (!s.drag && !reduced && s.idle > 2) s.ty += dt * 0.25;
    const k = 1 - Math.exp(-8 * dt);
    s.yaw += (s.ty - s.yaw) * k;
    s.pitch += (s.tp - s.pitch) * k;
    s.zoom += (s.tz - s.zoom) * k;
    const g = group.current;
    g.rotation.set(s.pitch, s.yaw, 0);
    g.scale.setScalar(s.zoom);
    g.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 1.2) * 0.006;
  });
  return <group ref={group}>{children}</group>;
}
