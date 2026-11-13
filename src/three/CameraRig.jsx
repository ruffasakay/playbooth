import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';

// Keep timelines on the wall clock, so slow devices skip frames instead of crawling.
gsap.ticker.lagSmoothing(0);
import { useApp } from '../store.js';
import { CABINET, SCREEN, TRAY, motion, smoothstep } from './world.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

/**
 * Each station frames a box (width × height, meters) around a target, seen
 * from a direction. The distance is solved from the viewport so the same
 * framing works on a phone held upright and on an ultrawide monitor.
 */
const STATIONS = {
  hero: { target: V(0.1, 1.85, 0.5), dir: V(-0.6, 0.33, 0.73), box: [8.6, 6.6] },
  booth: { target: V(0.3, 1.05, -1.4), dir: V(-0.22, 0.27, 1), box: [4.9, 2.5], maxDist: 3.35 },
  tapes: { target: V(CABINET.x, 1.08, -1.62), dir: V(0.22, 0.12, 1), box: [1.95, 2.4], maxDist: 3.2 },
  player: { target: V(1.25, 1.02, -1.2), dir: V(-0.24, 0.17, 1), box: [2.4, 2.15], maxDist: 2.95 },
  prints: { target: V(TRAY.x - 0.08, 0.5, TRAY.z - 0.12), dir: V(-0.3, 0.95, 0.72), box: [1.0, 0.82], maxDist: 2.3 },
  watch: { target: V(SCREEN.x, SCREEN.y - 0.15, SCREEN.z), dir: V(0, 0, 1), box: [1.5, 1.1], maxDist: 3.0 },
};
for (const s of Object.values(STATIONS)) s.dir.normalize();

const fovFor = (aspect, inside) => (aspect < 0.8 ? 60 : aspect < 1.1 ? 52 : inside ? 50 : 42);

export function poseFor(name, width, height) {
  const st = STATIONS[name];
  const aspect = width / height;
  const fov = fovFor(aspect, name !== 'hero');
  const t = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  let fw = 0.94;
  let fh = 0.9;
  let cx = 0.5;
  let cy = 0.5;
  if (name === 'hero') {
    if (aspect >= 1.05) {
      fw = 0.54;
      fh = 0.86;
      cx = 1 - fw / 2 - 0.02;
      cy = 0.52;
    } else {
      fw = 0.96;
      fh = 0.46;
      cx = 0.5;
      cy = 1 - fh / 2 - 0.02;
    }
  }
  const [bw, bh] = st.box;
  let dist = Math.max(bh / 2 / (t * fh), bw / 2 / (t * aspect * fw));
  if (st.maxDist) dist = Math.min(dist, st.maxDist);
  return {
    pos: st.target.clone().addScaledVector(st.dir, dist),
    target: st.target.clone(),
    fov,
    ox: (0.5 - cx) * width,
    oy: (0.5 - cy) * height,
  };
}

export function CameraRig() {
  const { camera, size, gl } = useThree();
  if (import.meta.env.DEV) window.__camera = camera;
  const cur = useRef(null);
  const tl = useRef(null);
  const zoom = useRef({ value: 1, target: 1 });
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const tmpPos = useRef(new THREE.Vector3());
  const tmpTarget = useRef(new THREE.Vector3());
  const offsetKey = useRef('');

  const snapTo = (pose) => {
    cur.current = {
      px: pose.pos.x, py: pose.pos.y, pz: pose.pos.z,
      tx: pose.target.x, ty: pose.target.y, tz: pose.target.z,
      fov: pose.fov, ox: pose.ox, oy: pose.oy,
    };
  };

  const tweenTo = (pose, duration) => {
    tl.current?.kill();
    if (!cur.current || duration === 0) {
      snapTo(pose);
      return;
    }
    tl.current = gsap.to(cur.current, {
      px: pose.pos.x, py: pose.pos.y, pz: pose.pos.z,
      tx: pose.target.x, ty: pose.target.y, tz: pose.target.z,
      fov: pose.fov, ox: pose.ox, oy: pose.oy,
      duration,
      ease: 'power3.inOut',
    });
  };

  const currentStationName = () => {
    const s = useApp.getState();
    return s.phase === 'inside' ? s.station : 'hero';
  };

  // first frame: stand at the hero spot
  if (!cur.current) snapTo(poseFor('hero', size.width, size.height));

  // the cinematic walk in
  const runEntry = () => {
    const s = useApp.getState();
    // On a tall phone the cabinet and the player don't fit side by side,
    // so the walk in ends facing the tapes: picking one is the first thing to do.
    const first = size.width / size.height < 0.8 ? 'tapes' : 'booth';
    const end = poseFor(first, size.width, size.height);
    if (s.reducedMotion) {
      veilCut(() => {
        motion.curtain.open = 1;
        snapTo(end);
        useApp.setState({ phase: 'inside', station: first });
      });
      return;
    }
    const c = cur.current;
    const start = V(c.px, c.py, c.pz);
    const startT = V(c.tx, c.ty, c.tz);
    const path = new THREE.CatmullRomCurve3(
      [start, V(-3.7, 3.1, 8.0), V(2.1, 2.35, 6.5), V(0.32, 1.78, 4.3), V(0.12, 1.64, 2.7), V(0.08, 1.6, 1.7), end.pos],
      false,
      'centripetal',
    );
    const look = new THREE.CatmullRomCurve3(
      [startT, V(0, 1.6, 0.8), V(0, 1.45, 1.7), V(0, 1.32, 2.2), V(0, 1.25, 0.2), end.target],
      false,
      'centripetal',
    );
    const ox0 = c.ox;
    const oy0 = c.oy;
    const fov0 = c.fov;
    const prog = { t: 0 };
    const p = new THREE.Vector3();
    const l = new THREE.Vector3();
    tl.current?.kill();
    const duration = 4.6;
    tl.current = gsap
      .timeline({
        onComplete: () => {
          motion.curtain.open = 1;
          snapTo(end);
          useApp.setState({ phase: 'inside', station: first });
        },
      })
      .to(prog, {
        t: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          path.getPointAt(prog.t, p);
          look.getPointAt(Math.min(1, prog.t * 1.02), l);
          const k = smoothstep(0, 0.4, prog.t);
          Object.assign(cur.current, {
            px: p.x, py: p.y, pz: p.z, tx: l.x, ty: l.y, tz: l.z,
            ox: ox0 * (1 - k), oy: oy0 * (1 - k),
            fov: fov0 + (end.fov - fov0) * smoothstep(0.5, 1, prog.t),
          });
        },
      })
      .to(motion.curtain, { open: 1, duration: 1.15, ease: 'power2.out' }, duration * 0.4);
  };

  const runExit = () => {
    const s = useApp.getState();
    const end = poseFor('hero', size.width, size.height);
    const finish = () => {
      motion.curtain.open = 0;
      snapTo(end);
      useApp.setState({ phase: 'outside', station: 'booth' });
    };
    if (s.reducedMotion) {
      veilCut(finish);
      return;
    }
    const c = cur.current;
    const path = new THREE.CatmullRomCurve3(
      [V(c.px, c.py, c.pz), V(0.1, 1.62, 1.8), V(0.14, 1.66, 2.9), V(0.6, 2.0, 4.8), V(-2.4, 3.0, 7.6), end.pos],
      false,
      'centripetal',
    );
    const look = new THREE.CatmullRomCurve3(
      [V(c.tx, c.ty, c.tz), V(0, 1.4, 3.6), V(0, 1.5, 6), V(0, 1.6, 2.6), end.target],
      false,
      'centripetal',
    );
    // looking back at the booth once outside
    const prog = { t: 0 };
    const p = new THREE.Vector3();
    const l = new THREE.Vector3();
    tl.current?.kill();
    const duration = 3.4;
    tl.current = gsap
      .timeline({ onComplete: finish })
      .to(prog, {
        t: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          path.getPointAt(prog.t, p);
          look.getPointAt(prog.t, l);
          const k = smoothstep(0.6, 1, prog.t);
          Object.assign(cur.current, {
            px: p.x, py: p.y, pz: p.z, tx: l.x, ty: l.y, tz: l.z,
            ox: end.ox * k, oy: end.oy * k, fov: end.fov,
          });
        },
      })
      .to(motion.curtain, { open: 0, duration: 1.0, ease: 'power2.inOut' }, duration * 0.38);
  };

  // react to phase and station changes
  useEffect(() => {
    let prev = useApp.getState();
    return useApp.subscribe((s) => {
      // update first: the actions below can set state, which re-enters this listener
      const before = prev;
      prev = s;
      if (s.phase !== before.phase) {
        if (s.phase === 'entering') runEntry();
        else if (s.phase === 'leaving') runExit();
      } else if (s.phase === 'inside' && s.station !== before.station) {
        zoom.current.target = 1;
        tweenTo(poseFor(s.station, size.width, size.height), s.reducedMotion ? 0 : 1.15);
      }
      if (s.skipToken !== before.skipToken && tl.current) tl.current.progress(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  // re-frame on resize
  useEffect(() => {
    const s = useApp.getState();
    if (s.phase === 'entering' || s.phase === 'leaving') return;
    tl.current?.kill();
    snapTo(poseFor(currentStationName(), size.width, size.height));
  }, [size.width, size.height]);

  // pointer parallax, wheel and pinch zoom
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const zoomable = () => {
      const s = useApp.getState();
      return s.phase === 'inside' && s.station !== 'watch' && !s.dragging;
    };
    const onWheel = (e) => {
      if (!zoomable()) return;
      e.preventDefault();
      const z = zoom.current;
      z.target = THREE.MathUtils.clamp(z.target * Math.exp(e.deltaY * 0.0012), 0.7, 1.2);
    };
    const touches = new Map();
    let pinchStart = 0;
    let zoomStart = 1;
    const onDown = (e) => {
      if (e.pointerType !== 'touch') return;
      touches.set(e.pointerId, e);
      if (touches.size === 2) {
        const [a, b] = [...touches.values()];
        pinchStart = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        zoomStart = zoom.current.target;
      }
    };
    const onTouchMove = (e) => {
      if (!touches.has(e.pointerId)) return;
      touches.set(e.pointerId, e);
      if (touches.size === 2 && zoomable() && pinchStart > 0) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        zoom.current.target = THREE.MathUtils.clamp(zoomStart * (pinchStart / d), 0.7, 1.2);
      }
    };
    const onUp = (e) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinchStart = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onTouchMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onTouchMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [gl]);

  useEffect(() => () => tl.current?.kill(), []);

  useFrame((state, dt) => {
    const c = cur.current;
    const s = useApp.getState();
    dt = Math.min(dt, 0.05);
    const z = zoom.current;
    z.value += (z.target - z.value) * (1 - Math.exp(-8 * dt));
    const p = pointer.current;
    const still = s.reducedMotion || s.dragging || s.station === 'watch' || s.phase === 'entering' || s.phase === 'leaving';
    const k = 1 - Math.exp(-3 * dt);
    p.sx += ((still ? 0 : p.x) - p.sx) * k;
    p.sy += ((still ? 0 : p.y) - p.sy) * k;

    const pos = tmpPos.current.set(c.px, c.py, c.pz);
    const target = tmpTarget.current.set(c.tx, c.ty, c.tz);
    if (s.phase === 'inside') pos.sub(target).multiplyScalar(z.value).add(target);
    const dist = pos.distanceTo(target);
    const amp = s.phase === 'inside' ? 0.035 : 0.05;
    camera.position.copy(pos);
    camera.lookAt(target);
    camera.translateX(p.sx * amp * dist);
    camera.translateY(-p.sy * amp * 0.6 * dist);
    camera.lookAt(target);

    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }
    const key = `${Math.round(c.ox)}|${Math.round(c.oy)}|${size.width}|${size.height}`;
    if (key !== offsetKey.current) {
      offsetKey.current = key;
      if (Math.abs(c.ox) > 0.5 || Math.abs(c.oy) > 0.5) {
        camera.setViewOffset(size.width, size.height, c.ox, c.oy, size.width, size.height);
      } else {
        camera.clearViewOffset();
      }
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

/** Reduced motion: a quick fade instead of a camera flight. */
function veilCut(fn) {
  useApp.setState({ veil: true });
  setTimeout(() => {
    fn();
    setTimeout(() => useApp.setState({ veil: false }), 60);
  }, 220);
}
