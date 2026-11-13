import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useApp } from '../store.js';
import { BOOTH, CABINET, SCREEN, TABLE, TRAY, TV, interaction, motion, smoothstep } from './world.js';

// Timelines follow the wall clock: slow devices drop frames instead of crawling.
gsap.ticker.lagSmoothing(0);

const V = (x, y, z) => new THREE.Vector3(x, y, z);

const STATIONS = {
  hero: { target: V(-0.2, 1.55, 0.3), dir: V(-0.62, 0.26, 0.74), box: [9.4, 6.0] },
  booth: { target: V(0.3, 1.0, -1.45), dir: V(-0.2, 0.22, 1), box: [4.9, 2.4], maxDist: 3.35 },
  tapes: { target: V(CABINET.x, 1.02, -1.62), dir: V(0.22, 0.1, 1), box: [1.95, 2.25], maxDist: 3.2 },
  player: { target: V(TV.x + 0.35, 0.92, -1.3), dir: V(-0.22, 0.14, 1), box: [2.55, 1.85], maxDist: 3.0 },
  prints: { target: V(TRAY.x - 0.04, TABLE.h + 0.06, TRAY.z - 0.12), dir: V(-0.28, 0.95, 0.75), box: [0.85, 0.66], maxDist: 2.1 },
  watch: { target: V(SCREEN.x, SCREEN.y, SCREEN.z), dir: V(0, 0, 1), box: [1.05, 0.82], maxDist: 2.4 },
};
for (const s of Object.values(STATIONS)) s.dir.normalize();

const fovFor = (aspect, inside) => (aspect < 0.8 ? 60 : aspect < 1.1 ? 52 : inside ? 50 : 40);

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
      fw = 0.6;
      fh = 0.92;
      cx = 1 - fw / 2 - 0.01;
    } else {
      fw = 1;
      fh = 0.5;
      cy = 1 - fh / 2;
    }
  }
  const [bw, bh] = st.box;
  let dist = Math.max(bh / 2 / (t * fh), bw / 2 / (t * aspect * fw));
  if (st.maxDist) dist = Math.min(dist, st.maxDist);
  return { pos: st.target.clone().addScaledVector(st.dir, dist), target: st.target.clone(), fov, ox: (0.5 - cx) * width, oy: (0.5 - cy) * height };
}

const ROOM = { x: BOOTH.halfW - BOOTH.wall - 0.12, zMin: -1.0, zMax: BOOTH.halfD - BOOTH.wall - 0.1, yMin: 0.45, yMax: 2.7 };

export function CameraRig() {
  const { camera, size, gl } = useThree();
  if (import.meta.env.DEV) window.__camera = camera;
  const cur = useRef(null);
  const tl = useRef(null);
  const zoom = useRef({ value: 1, target: 1 });
  const look = useRef({ yaw: 0, pitch: 0, ty: 0, tp: 0 });
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const tmp = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3(), off: new THREE.Vector3(), axis: new THREE.Vector3() });
  const offsetKey = useRef('');
  const introDone = useRef(false);

  const snapTo = (pose) => {
    cur.current = { px: pose.pos.x, py: pose.pos.y, pz: pose.pos.z, tx: pose.target.x, ty: pose.target.y, tz: pose.target.z, fov: pose.fov, ox: pose.ox, oy: pose.oy };
  };

  const tweenTo = (pose, duration, ease = 'power3.inOut') => {
    tl.current?.kill();
    if (!cur.current || duration === 0) return snapTo(pose);
    tl.current = gsap.to(cur.current, { px: pose.pos.x, py: pose.pos.y, pz: pose.pos.z, tx: pose.target.x, ty: pose.target.y, tz: pose.target.z, fov: pose.fov, ox: pose.ox, oy: pose.oy, duration, ease });
  };

  const resetLook = () => {
    const l = look.current;
    l.ty = 0;
    l.tp = 0;
    zoom.current.target = 1;
  };

  if (!cur.current) {
    // the landing page opens a little farther out, then settles in
    const pose = poseFor('hero', size.width, size.height);
    pose.pos.sub(pose.target).multiplyScalar(1.28).add(pose.target);
    snapTo(pose);
  }

  const runEntry = () => {
    const s = useApp.getState();
    const first = size.width / size.height < 0.8 ? 'tapes' : 'booth';
    const end = poseFor(first, size.width, size.height);
    resetLook();
    if (s.reducedMotion) {
      veilCut(() => {
        motion.curtain.open = 1;
        snapTo(end);
        useApp.setState({ phase: 'inside', station: first });
      });
      return;
    }
    const c = cur.current;
    const path = new THREE.CatmullRomCurve3(
      [V(c.px, c.py, c.pz), V(-3.6, 2.7, 7.6), V(1.6, 2.0, 6.2), V(0.3, 1.7, 4.2), V(0.12, 1.6, 2.7), V(0.08, 1.56, 1.7), end.pos],
      false,
      'centripetal',
    );
    const lookAt = new THREE.CatmullRomCurve3(
      [V(c.tx, c.ty, c.tz), V(0, 1.5, 0.8), V(0, 1.4, 1.7), V(0, 1.3, 2.2), V(0, 1.2, 0.2), end.target],
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
    const duration = 4.4;
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
          lookAt.getPointAt(Math.min(1, prog.t * 1.02), l);
          const k = smoothstep(0, 0.4, prog.t);
          Object.assign(cur.current, { px: p.x, py: p.y, pz: p.z, tx: l.x, ty: l.y, tz: l.z, ox: ox0 * (1 - k), oy: oy0 * (1 - k), fov: fov0 + (end.fov - fov0) * smoothstep(0.5, 1, prog.t) });
        },
      })
      .to(motion.curtain, { open: 1, duration: 1.2, ease: 'power2.out' }, duration * 0.4);
  };

  const runExit = () => {
    const s = useApp.getState();
    const end = poseFor('hero', size.width, size.height);
    resetLook();
    const finish = () => {
      motion.curtain.open = 0;
      snapTo(end);
      useApp.setState({ phase: 'outside', station: 'booth' });
    };
    if (s.reducedMotion) return veilCut(finish);
    const c = cur.current;
    const path = new THREE.CatmullRomCurve3([V(c.px, c.py, c.pz), V(0.1, 1.58, 1.8), V(0.14, 1.62, 2.9), V(0.6, 1.9, 4.8), V(-2.6, 2.6, 7.4), end.pos], false, 'centripetal');
    const lookAt = new THREE.CatmullRomCurve3([V(c.tx, c.ty, c.tz), V(0, 1.4, 3.6), V(0, 1.5, 6), V(0, 1.6, 2.6), end.target], false, 'centripetal');
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
          lookAt.getPointAt(prog.t, l);
          const k = smoothstep(0.6, 1, prog.t);
          Object.assign(cur.current, { px: p.x, py: p.y, pz: p.z, tx: l.x, ty: l.y, tz: l.z, ox: end.ox * k, oy: end.oy * k, fov: end.fov });
        },
      })
      .to(motion.curtain, { open: 0, duration: 1.0, ease: 'power2.inOut' }, duration * 0.38);
  };

  useEffect(() => {
    let prev = useApp.getState();
    return useApp.subscribe((s) => {
      const before = prev;
      prev = s;
      if (s.phase !== before.phase) {
        if (s.phase === 'entering') runEntry();
        else if (s.phase === 'leaving') runExit();
        else if (s.phase === 'outside' && before.phase === 'loading' && !introDone.current) {
          introDone.current = true;
          tweenTo(poseFor('hero', size.width, size.height), s.reducedMotion ? 0 : 2.8, 'power2.out');
        }
      } else if (s.phase === 'inside' && s.station !== before.station) {
        resetLook();
        tweenTo(poseFor(s.station, size.width, size.height), s.reducedMotion ? 0 : 1.15);
      }
      if (s.skipToken !== before.skipToken && tl.current) tl.current.progress(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height]);

  useEffect(() => {
    const s = useApp.getState();
    if (s.phase === 'entering' || s.phase === 'leaving' || s.phase === 'loading') return;
    tl.current?.kill();
    snapTo(poseFor(s.phase === 'inside' ? s.station : 'hero', size.width, size.height));
  }, [size.width, size.height]);

  // drag to look around, wheel and pinch to zoom
  useEffect(() => {
    const el = gl.domElement;
    const lookable = () => {
      const s = useApp.getState();
      return s.phase === 'inside' && s.station !== 'watch' && !s.dragging && !s.inspectId && !s.insertingId;
    };
    let drag = null;
    const touches = new Map();
    let pinch = null;

    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (touches.has(e.pointerId)) touches.set(e.pointerId, e);
      if (pinch && touches.size === 2) {
        const [a, b] = [...touches.values()];
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        zoom.current.target = THREE.MathUtils.clamp(pinch.zoom * (pinch.dist / d), 0.7, 1.2);
        return;
      }
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) > 4) {
        drag.moved = true;
        el.style.cursor = 'grabbing';
      }
      if (!drag.moved) return;
      const l = look.current;
      const k = 2.6 / Math.max(window.innerWidth, 600);
      l.ty = THREE.MathUtils.clamp(drag.yaw - dx * k, -0.95, 0.95);
      l.tp = THREE.MathUtils.clamp(drag.pitch - dy * k, -0.32, 0.42);
    };
    // Runs after R3F's handlers (window is last in the bubble path), so it knows if an object took the press.
    const onDown = (e) => {
      if (e.target !== el) return;
      if (e.pointerType === 'touch') {
        touches.set(e.pointerId, e);
        if (touches.size === 2 && lookable()) {
          const [a, b] = [...touches.values()];
          pinch = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom: zoom.current.target };
          drag = null;
          return;
        }
      }
      if (interaction.grabbed || !lookable() || e.button > 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: look.current.ty, pitch: look.current.tp, moved: false };
    };
    const onUp = (e) => {
      touches.delete(e.pointerId);
      if (touches.size < 2) pinch = null;
      if (drag?.id === e.pointerId) {
        drag = null;
        el.style.cursor = '';
      }
      interaction.grabbed = false;
    };
    const onWheel = (e) => {
      if (!lookable()) return;
      e.preventDefault();
      zoom.current.target = THREE.MathUtils.clamp(zoom.current.target * Math.exp(e.deltaY * 0.0012), 0.7, 1.2);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  useEffect(() => () => tl.current?.kill(), []);

  useFrame((state, dt) => {
    const c = cur.current;
    const s = useApp.getState();
    dt = Math.min(dt, 0.05);
    const z = zoom.current;
    z.value += (z.target - z.value) * (1 - Math.exp(-8 * dt));
    const l = look.current;
    const lk = 1 - Math.exp(-10 * dt);
    l.yaw += (l.ty - l.yaw) * lk;
    l.pitch += (l.tp - l.pitch) * lk;
    const p = pointer.current;
    const still = s.reducedMotion || s.dragging || s.station === 'watch' || s.phase === 'entering' || s.phase === 'leaving' || s.inspectId;
    const k = 1 - Math.exp(-3 * dt);
    p.sx += ((still ? 0 : p.x) - p.sx) * k;
    p.sy += ((still ? 0 : p.y) - p.sy) * k;

    const { pos, target, off, axis } = tmp.current;
    pos.set(c.px, c.py, c.pz);
    target.set(c.tx, c.ty, c.tz);
    if (s.phase === 'inside') {
      off.copy(pos).sub(target).multiplyScalar(z.value);
      off.applyAxisAngle(THREE.Object3D.DEFAULT_UP, l.yaw);
      axis.set(off.z, 0, -off.x).normalize();
      if (axis.lengthSq() > 0) off.applyAxisAngle(axis, -l.pitch);
      pos.copy(target).add(off);
      if (s.station !== 'watch') {
        pos.x = THREE.MathUtils.clamp(pos.x, -ROOM.x, ROOM.x);
        pos.z = THREE.MathUtils.clamp(pos.z, ROOM.zMin, ROOM.zMax);
        pos.y = THREE.MathUtils.clamp(pos.y, ROOM.yMin, ROOM.yMax);
      }
    }
    const dist = pos.distanceTo(target);
    const amp = s.phase === 'inside' ? 0.02 : 0.035;
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
      if (Math.abs(c.ox) > 0.5 || Math.abs(c.oy) > 0.5) camera.setViewOffset(size.width, size.height, c.ox, c.oy, size.width, size.height);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function veilCut(fn) {
  useApp.setState({ veil: true });
  setTimeout(() => {
    fn();
    setTimeout(() => useApp.setState({ veil: false }), 60);
  }, 220);
}
