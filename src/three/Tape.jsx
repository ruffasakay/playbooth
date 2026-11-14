import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { useApp } from '../store.js';
import { SLOT_ENTRY, SLOT_INSIDE, TAPE, cubbyCenters, damp, interaction, smoothstep } from './world.js';
import { backTexture, coverTexture, edgeTexture, spineTexture } from './covers.js';

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(SLOT_ENTRY.position.z + 0.14));
const SNAP_RADIUS = 0.3;
const PULL_RADIUS = 0.95;
const TAP_SLOP = 7;

const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export function Tapes() {
  const cubbies = useMemo(cubbyCenters, []);
  return MOVIES.slice(0, cubbies.length).map((movie, i) => <Tape key={movie.id} movie={movie} cubby={cubbies[i]} />);
}

/** A VHS clamshell case with the film's cover behind the clear sleeve. */
export function TapeCase({ movie, highlight }) {
  const cover = useMemo(() => coverTexture(movie), [movie]);
  const back = useMemo(() => backTexture(movie), [movie]);
  const spine = useMemo(() => spineTexture(movie), [movie]);
  const edge = useMemo(() => edgeTexture(), []);
  const shell = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f1c1a', roughness: 0.45, metalness: 0.05, emissive: '#ffd9a0', emissiveIntensity: 0 }), []);
  useFrame((_, dt) => {
    const target = highlight?.current ? 0.06 : 0;
    shell.emissiveIntensity = damp(shell.emissiveIntensity, target, 10, Math.min(dt, 0.05));
  });
  return (
    <group>
      <RoundedBox args={[TAPE.w, TAPE.h, TAPE.d]} radius={0.006} smoothness={3} material={shell} castShadow receiveShadow />
      <mesh position={[0, 0, TAPE.d / 2 + 0.0015]}>
        <planeGeometry args={[TAPE.w - 0.01, TAPE.h - 0.01]} />
        <meshStandardMaterial map={cover} roughness={0.35} metalness={0} />
      </mesh>
      {/* the back: the booth's own label */}
      <mesh position={[0, 0, -TAPE.d / 2 - 0.0015]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[TAPE.w - 0.01, TAPE.h - 0.01]} />
        <meshStandardMaterial map={back} roughness={0.45} />
      </mesh>
      {/* spine label */}
      <mesh position={[-TAPE.w / 2 - 0.0015, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[TAPE.d - 0.008, TAPE.h - 0.02]} />
        <meshStandardMaterial map={spine} roughness={0.5} />
      </mesh>
      {/* the far side, top and bottom: stripes and marks */}
      <mesh position={[TAPE.w / 2 + 0.0015, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]}>
        <planeGeometry args={[TAPE.h - 0.02, TAPE.d - 0.008]} />
        <meshStandardMaterial map={edge} roughness={0.5} />
      </mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * (TAPE.h / 2 + 0.0015), 0]} rotation={[-s * Math.PI / 2, 0, 0]}>
          <planeGeometry args={[TAPE.w - 0.012, TAPE.d - 0.008]} />
          <meshStandardMaterial map={edge} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Tape({ movie, cubby }) {
  const id = movie.id;
  const group = useRef();
  const { camera } = useThree();
  const highlight = useRef(false);

  const home = useMemo(() => {
    const pos = new THREE.Vector3(cubby.x, cubby.floorY + TAPE.h / 2 + 0.004, cubby.z);
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.16, 0, 0));
    // lifted 9 cm (the lip is 6 cm tall) and only 4 cm forward, so it never passes through the lip or the shelf above
    const lift = pos.clone().add(new THREE.Vector3(0, 0.09, 0.04));
    const liftQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.04, 0, 0));
    // the way out of the cubby: up over the lip, then forward
    const out = pos.clone().add(new THREE.Vector3(0, 0.1, 0.2));
    return { pos, quat, lift, liftQuat, out };
  }, [cubby]);

  const st = useRef({
    mode: 'shelf',
    hover: false,
    press: null,
    drag: new THREE.Vector3(),
    snapped: false,
    lastAttraction: 0,
    t: 0,
    from: { pos: new THREE.Vector3(), quat: new THREE.Quaternion() },
  });

  useEffect(() => {
    group.current?.position.copy(home.pos);
    group.current?.quaternion.copy(home.quat);
  }, [home]);

  // where the case sits on screen, for the close-up to fly out of and back into
  const { gl } = useThree();
  useEffect(() => {
    interaction.tapeRects[id] = () => {
      const g = group.current;
      if (!g) return null;
      g.updateWorldMatrix(true, false);
      const box = gl.domElement.getBoundingClientRect();
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
        tmpV.set((sx * TAPE.w) / 2, (sy * TAPE.h) / 2, (sz * TAPE.d) / 2).applyMatrix4(g.matrixWorld).project(camera);
        const x = box.left + ((tmpV.x + 1) / 2) * box.width;
        const y = box.top + ((1 - tmpV.y) / 2) * box.height;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    };
    return () => {
      delete interaction.tapeRects[id];
    };
  }, [id, camera, gl]);

  const canInteract = () => {
    const s = useApp.getState();
    return s.phase === 'inside' && s.station !== 'watch' && !s.insertingId && !s.inspectId && ['shelf', 'drag'].includes(st.current.mode) && s.insertedTapeId !== id;
  };

  const showPrompt = (e) => {
    useApp.getState().setHover({
      title: movie.title,
      cursor: 'View',
      sub: `${movie.year}  ${movie.genre}`,
      actions: [
        ['click', 'Inspect'],
        ['drag', 'Put in player'],
      ],
      x: e.clientX,
      y: e.clientY,
    });
  };

  const onPointerOver = (e) => {
    if (!canInteract()) return;
    e.stopPropagation();
    st.current.hover = true;
    document.body.style.cursor = 'grab';
    showPrompt(e);
  };
  const onPointerOut = () => {
    st.current.hover = false;
    if (st.current.mode !== 'drag') document.body.style.cursor = '';
    useApp.getState().setHover(null);
  };

  const onPointerDown = (e) => {
    if (!canInteract() || e.button > 0) return;
    e.stopPropagation();
    interaction.grabbed = true;
    e.target.setPointerCapture?.(e.pointerId);
    st.current.press = { x: e.clientX, y: e.clientY, pointerId: e.pointerId, dragging: false };
  };

  const onPointerMove = (e) => {
    const p = st.current.press;
    if (!p) {
      if (st.current.hover && e.pointerType === 'mouse') showPrompt(e);
      return;
    }
    if (p.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (!p.dragging) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < TAP_SLOP) return;
      p.dragging = true;
      st.current.mode = 'drag';
      document.body.style.cursor = 'grabbing';
      useApp.setState({ dragging: true, heldTapeId: id, hover: null });
      const s = useApp.getState();
      if (s.station === 'tapes') s.goStation('booth');
    }
    if (e.ray.intersectPlane(DRAG_PLANE, tmpV)) {
      tmpV.x = THREE.MathUtils.clamp(tmpV.x, -2.15, 2.25);
      tmpV.y = THREE.MathUtils.clamp(tmpV.y, 0.3, 2.5);
      st.current.drag.copy(tmpV);
    }
  };

  const endPress = (e, cancelled) => {
    const p = st.current.press;
    if (!p || p.pointerId !== e.pointerId) return;
    e.stopPropagation();
    e.target.releasePointerCapture?.(e.pointerId);
    st.current.press = null;
    const s = useApp.getState();
    if (p.dragging) {
      document.body.style.cursor = st.current.hover ? 'grab' : '';
      if (!cancelled && st.current.snapped) s.requestInsert(id);
      else {
        st.current.mode = 'shelf';
        useApp.setState({ dragging: false, attraction: 0, heldTapeId: null });
      }
      st.current.snapped = false;
      return;
    }
    if (!cancelled) {
      document.body.style.cursor = '';
      s.openInspect(id);
    }
  };

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = useApp.getState();
    const local = st.current;
    const reduced = s.reducedMotion;
    dt = Math.min(dt, 0.05);

    if (s.insertingId === id && local.mode !== 'insert' && local.mode !== 'inside') {
      local.mode = 'insert';
      local.path = reduced ? null : insertPath(g, home);
      local.t = 0;
    } else if (s.insertedTapeId === id && !['insert', 'inside'].includes(local.mode)) {
      local.mode = 'inside';
    } else if (local.mode === 'inside' && s.insertedTapeId !== id) {
      local.mode = 'eject';
      local.path = reduced ? null : ejectPath(home);
      local.t = 0;
    }

    g.visible = interaction.inspecting !== id && local.mode !== 'inside';
    highlight.current = local.hover || s.focusedTapeId === id || local.mode === 'drag';

    switch (local.mode) {
      case 'shelf': {
        // hovered: the case rises clear of the shelf lip first, then leans out and stands up toward you
        const up = local.hover || s.focusedTapeId === id;
        tmpV.copy(up ? home.lift : home.pos);
        // coming back from in front of the shelf: stay high until it is over its cubby, then settle down
        if (!up && g.position.z - home.pos.z > 0.012) tmpV.y = Math.max(tmpV.y, home.lift.y);
        follow(g, tmpV, up ? home.liftQuat : home.quat, reduced ? 40 : 10, dt);
        break;
      }
      case 'drag': {
        const d = local.drag.distanceTo(SLOT_ENTRY.position);
        const a = 1 - smoothstep(SNAP_RADIUS, PULL_RADIUS, d);
        local.snapped = d < SNAP_RADIUS;
        if (Math.abs(a - local.lastAttraction) > 0.04 || (a === 1) !== (local.lastAttraction === 1)) {
          local.lastAttraction = a;
          useApp.setState({ attraction: a });
        }
        if (local.snapped) follow(g, SLOT_ENTRY.position, SLOT_ENTRY.quaternion, 22, dt);
        else {
          tmpV.copy(local.drag).lerp(SLOT_ENTRY.position, a * 0.7);
          tmpE.set(0.12, 0, 0);
          tmpQ.setFromEuler(tmpE).premultiply(camera.quaternion).slerp(SLOT_ENTRY.quaternion, a);
          follow(g, tmpV, tmpQ, 16, dt);
        }
        break;
      }
      case 'insert': {
        local.t += dt;
        const done = !local.path || runPath(g, local.path, local.t);
        if (done) {
          interaction.flap = 0;
          local.mode = 'inside';
          s.insertTape(id);
        }
        break;
      }
      case 'inside': {
        g.position.copy(SLOT_INSIDE);
        g.quaternion.copy(SLOT_ENTRY.quaternion);
        break;
      }
      case 'eject': {
        local.t += dt;
        const done = !local.path || runPath(g, local.path, local.t);
        if (done) {
          interaction.flap = 0;
          g.position.copy(home.pos);
          g.quaternion.copy(home.quat);
          local.mode = 'shelf';
        }
        break;
      }
      default:
        break;
    }
  });

  return (
    <group
      ref={group}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPress(e, false)}
      onPointerCancel={(e) => endPress(e, true)}
      onLostPointerCapture={(e) => {
        if (st.current.press?.dragging) endPress(e, true);
      }}
    >
      <TapeCase movie={movie} highlight={highlight} />
      <mesh>
        <boxGeometry args={[TAPE.w + 0.06, TAPE.h + 0.06, TAPE.d + 0.12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
  );
}

function follow(obj, pos, quat, lambda, dt) {
  const k = 1 - Math.exp(-lambda * dt);
  obj.position.lerp(pos, k);
  obj.quaternion.slerp(quat, k);
}

/*
 * Insert and eject run along short keyframed paths, so every step reads:
 * the case slides out of its cubby, lifts and turns flat on its way over,
 * lines up in front of the slot, and the deck draws it in. Ejecting plays
 * the same story backwards with a beat at the slot so you see it come out.
 */
const PRE_SLOT = SLOT_ENTRY.position.clone().add(new THREE.Vector3(0, 0.015, 0.14));

function insertPath(g, home) {
  const start = { pos: g.position.clone(), quat: g.quaternion.clone() };
  const fromSlot = start.pos.distanceTo(SLOT_ENTRY.position) < 0.35; // dropped on the slot by a drag
  const legs = [];
  if (!fromSlot) {
    legs.push({ pos: home.lift, quat: home.liftQuat, dur: 0.22, ease: easeOut });
    legs.push({ pos: home.out, quat: home.liftQuat, dur: 0.22, ease: easeInOut });
    legs.push({ pos: PRE_SLOT, quat: SLOT_ENTRY.quaternion, dur: 0.85, ease: easeInOut, arc: 0.16 });
  }
  legs.push({ pos: SLOT_ENTRY.position, quat: SLOT_ENTRY.quaternion, dur: fromSlot ? 0.18 : 0.28, ease: easeInOut, flap: 1 });
  legs.push({ pos: SLOT_INSIDE, quat: SLOT_ENTRY.quaternion, dur: 0.62, ease: easeInOut, flap: 1 });
  return { start, legs };
}

function ejectPath(home) {
  const start = { pos: SLOT_INSIDE.clone(), quat: SLOT_ENTRY.quaternion.clone() };
  return {
    start,
    legs: [
      { pos: SLOT_ENTRY.position, quat: SLOT_ENTRY.quaternion, dur: 0.6, ease: easeOut, flap: 1 },
      { pos: PRE_SLOT, quat: SLOT_ENTRY.quaternion, dur: 0.35, ease: easeInOut, flap: 1 },
      { pos: PRE_SLOT, quat: SLOT_ENTRY.quaternion, dur: 0.15, ease: (t) => t },
      { pos: home.out, quat: home.liftQuat, dur: 0.9, ease: easeInOut, arc: 0.16 },
      { pos: home.lift, quat: home.liftQuat, dur: 0.24, ease: easeInOut },
      { pos: home.pos, quat: home.quat, dur: 0.28, ease: easeInOut },
    ],
  };
}

/** Place `g` at time `t` along the path; true when it has arrived. */
function runPath(g, path, t) {
  let from = path.start;
  for (const leg of path.legs) {
    if (t < leg.dur) {
      const k = leg.ease(Math.max(0, t / leg.dur));
      g.position.lerpVectors(from.pos, leg.pos, k);
      if (leg.arc) g.position.y += Math.sin(k * Math.PI) * leg.arc;
      g.quaternion.slerpQuaternions(from.quat, leg.quat, k);
      interaction.flap = leg.flap ?? 0;
      return false;
    }
    t -= leg.dur;
    from = leg;
  }
  g.position.copy(from.pos);
  g.quaternion.copy(from.quat);
  return true;
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t) => 1 - (1 - t) ** 3;
