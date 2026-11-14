import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useApp, movieById } from '../store.js';
import { TapeCase } from './Tape.jsx';

/**
 * A tape up close: the case on the right, its details on the left,
 * the way a game lets you pick up and turn an object.
 */
export default function Inspect() {
  const id = useApp((s) => s.inspectId);
  const movie = movieById(id);
  const primary = useRef(null);
  const inserted = useApp((s) => s.insertedTapeId === id);

  useEffect(() => {
    if (!movie) return undefined;
    const t = setTimeout(() => primary.current?.focus({ preventScroll: true }), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        useApp.getState().closeInspect();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [movie]);

  if (!movie) return null;
  const play = () => {
    const s = useApp.getState();
    s.closeInspect();
    if (inserted) {
      s.goStation('watch');
      return;
    }
    s.goStation('player');
    setTimeout(() => useApp.getState().requestInsert(movie.id), s.reducedMotion ? 0 : 450);
  };

  return (
    <section className="inspect" role="dialog" aria-modal="true" aria-labelledby="inspect-title">
      <div className="inspect-veil" onClick={() => useApp.getState().closeInspect()} />
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
          <button type="button" className="btn" onClick={() => useApp.getState().closeInspect()} data-tip="Back" data-key="Esc">
            Back
          </button>
        </div>
      </div>
      <p className="inspect-prompts" aria-hidden="true">
        <span><kbd>Drag</kbd> Turn</span>
        <span><kbd>Scroll</kbd> Zoom</span>
        <span><kbd>Esc</kbd> Back</span>
      </p>
      <div className="inspect-object" aria-hidden="true">
        <Canvas dpr={[1, 2]} camera={{ fov: 30, position: [0, 0, 1.45] }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[-1.5, 2, 2.5]} intensity={2.2} color="#ffe0bd" />
          <directionalLight position={[2, -0.5, 1]} intensity={0.5} color="#bcd0ff" />
          <Turntable>
            <TapeCase movie={movie} />
          </Turntable>
        </Canvas>
      </div>
    </section>
  );
}

function Turntable({ children }) {
  const group = useRef();
  const st = useRef({ yaw: -0.35, pitch: 0.06, ty: -0.35, tp: 0.06, zoom: 1, tz: 1, drag: null, idle: 0 });
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
  useFrame((state, dt) => {
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
