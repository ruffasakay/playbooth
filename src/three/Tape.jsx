import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { useApp } from '../store.js';
import { SLOT_ENTRY, SLOT_INSIDE, TAPE, cubbyCenters, damp, interaction, mat, smoothstep } from './world.js';
import { coverTexture } from './covers.js';

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(SLOT_ENTRY.position.z + 0.14));
const SNAP_RADIUS = 0.3;
const PULL_RADIUS = 0.95;
const TAP_SLOP = 7;

const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export function Tapes() {
  const cubbies = useMemo(cubbyCenters, []);
  return MOVIES.slice(0, 9).map((movie, i) => <Tape key={movie.id} movie={movie} cubby={cubbies[i]} />);
}

/** A VHS clamshell case with the film's cover behind the clear sleeve. */
export function TapeCase({ movie, highlight }) {
  const cover = useMemo(() => coverTexture(movie), [movie]);
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
      {/* spine label */}
      <mesh position={[-TAPE.w / 2 - 0.0015, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={mat('#efe4cf')}>
        <planeGeometry args={[TAPE.d - 0.012, TAPE.h - 0.04]} />
      </mesh>
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
    return { pos, quat };
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

  const canInteract = () => {
    const s = useApp.getState();
    return s.phase === 'inside' && s.station !== 'watch' && !s.insertingId && !s.inspectId && ['shelf', 'drag'].includes(st.current.mode) && s.insertedTapeId !== id;
  };

  const showPrompt = (e) => {
    useApp.getState().setHover({
      title: movie.title,
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
      local.t = reduced ? 1 : 0;
      local.from.pos.copy(g.position);
      local.from.quat.copy(g.quaternion);
    } else if (s.insertedTapeId === id && !['insert', 'inside'].includes(local.mode)) {
      local.mode = 'inside';
    } else if (local.mode === 'inside' && s.insertedTapeId !== id) {
      local.mode = 'eject';
      local.t = reduced ? 1 : 0;
    }

    g.visible = s.inspectId !== id && local.mode !== 'inside';
    highlight.current = local.hover || s.focusedTapeId === id || local.mode === 'drag';

    switch (local.mode) {
      case 'shelf': {
        tmpV.copy(home.pos);
        if (local.hover || s.focusedTapeId === id) {
          tmpV.z += 0.06;
          tmpV.y += 0.012;
        }
        follow(g, tmpV, home.quat, reduced ? 40 : 9, dt);
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
        local.t = Math.min(1, local.t + dt / 1.0);
        const t = local.t;
        if (t < 0.6) {
          const k = easeInOut(t / 0.6);
          g.position.lerpVectors(local.from.pos, SLOT_ENTRY.position, k);
          g.position.y += Math.sin(k * Math.PI) * 0.12;
          g.quaternion.slerpQuaternions(local.from.quat, SLOT_ENTRY.quaternion, k);
        } else {
          const k = easeIn((t - 0.6) / 0.4);
          g.position.lerpVectors(SLOT_ENTRY.position, SLOT_INSIDE, k);
          g.quaternion.copy(SLOT_ENTRY.quaternion);
        }
        if (t >= 1) {
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
        local.t = Math.min(1, local.t + dt / 0.55);
        g.position.lerpVectors(SLOT_INSIDE, SLOT_ENTRY.position, easeOut(local.t));
        g.quaternion.copy(SLOT_ENTRY.quaternion);
        if (local.t >= 1) local.mode = 'shelf';
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

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeIn = (t) => t * t * t;
const easeOut = (t) => 1 - (1 - t) ** 3;
