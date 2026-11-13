import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { MOVIES } from '../data/movies.js';
import { useApp } from '../store.js';
import { FONT_DISPLAY, FONT_MONO } from '../data/borders.js';
import { canvasTexture, wrapLines } from './canvasTexture.js';
import { PAL, SLOT_ENTRY, SLOT_INSIDE, TAPE, cubbyCenters, damp, smoothstep } from './world.js';

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), -(SLOT_ENTRY.position.z + 0.14));
const SNAP_RADIUS = 0.3;
const PULL_RADIUS = 0.95;
const TAP_SLOP = 7; // px of movement before a press becomes a drag

const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();

export function Tapes() {
  const cubbies = useMemo(cubbyCenters, []);
  return MOVIES.slice(0, 9).map((movie, i) => <Tape key={movie.id} movie={movie} cubby={cubbies[i]} />);
}

/** Tape label as a canvas texture. Drawn once fonts are available. */
function useLabelTexture(movie) {
  const tex = useMemo(
    () =>
      canvasTexture(512, 192, () => {}, { anisotropy: 8 }),
    [],
  );
  useEffect(() => {
    let alive = true;
    const paint = () => {
      if (!alive) return;
      const { ctx } = tex.userData;
      const w = 512;
      const h = 192;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = movie.colors.label;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 18);
      ctx.fill();
      ctx.fillStyle = movie.colors.shell;
      ctx.fillRect(0, 0, w, 16);
      ctx.fillStyle = movie.colors.ink;
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      ctx.font = `700 56px ${FONT_DISPLAY}`;
      const lines = wrapLines(ctx, movie.title, w - 44, 2);
      const top = lines.length > 1 ? 72 : 96;
      lines.forEach((line, i) => ctx.fillText(line, 22, top + i * 54));
      ctx.font = `600 26px ${FONT_MONO}`;
      ctx.globalAlpha = 0.75;
      ctx.fillText(movie.note || '', 22, h - 18);
      ctx.globalAlpha = 1;
      tex.needsUpdate = true;
    };
    paint();
    document.fonts.ready.then(paint);
    document.fonts.load(`700 56px ${FONT_DISPLAY}`).then(paint).catch(() => {});
    return () => {
      alive = false;
    };
  }, [movie, tex]);
  return tex;
}

function Tape({ movie, cubby }) {
  const id = movie.id;
  const group = useRef();
  const { camera, size } = useThree();
  const label = useLabelTexture(movie);
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: movie.colors.shell,
        roughness: 0.55,
        emissive: movie.colors.shell,
        emissiveIntensity: 0,
      }),
    [movie],
  );

  const home = useMemo(() => {
    const pos = new THREE.Vector3(cubby.x, cubby.floorY + TAPE.h / 2 + 0.012, cubby.z);
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.14, 0, 0));
    return { pos, quat };
  }, [cubby]);

  const st = useRef({
    mode: 'shelf',
    hover: false,
    press: null,
    drag: new THREE.Vector3().copy(home.pos),
    snapped: false,
    lastAttraction: 0,
    t: 0,
    from: { pos: new THREE.Vector3(), quat: new THREE.Quaternion() },
    placed: false,
  });

  // Put the tape on its shelf on first frame.
  useEffect(() => {
    if (!group.current) return;
    group.current.position.copy(home.pos);
    group.current.quaternion.copy(home.quat);
  }, [home]);

  const setCursor = (c) => {
    document.body.style.cursor = c;
  };

  const canInteract = () => {
    const s = useApp.getState();
    return (
      s.phase === 'inside' &&
      s.station !== 'watch' &&
      !s.insertingId &&
      ['shelf', 'carry', 'drag'].includes(st.current.mode) &&
      s.insertedTapeId !== id
    );
  };

  const onPointerOver = (e) => {
    if (!canInteract()) return;
    e.stopPropagation();
    st.current.hover = true;
    setCursor(st.current.mode === 'drag' ? 'grabbing' : 'grab');
  };
  const onPointerOut = () => {
    st.current.hover = false;
    if (st.current.mode !== 'drag') setCursor('');
  };

  const onPointerDown = (e) => {
    if (!canInteract() || e.button > 0) return;
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    st.current.press = {
      x: e.clientX,
      y: e.clientY,
      pointerId: e.pointerId,
      wasCarry: st.current.mode === 'carry',
      dragging: false,
    };
  };

  const onPointerMove = (e) => {
    const p = st.current.press;
    if (!p || p.pointerId !== e.pointerId) return;
    e.stopPropagation();
    if (!p.dragging) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < TAP_SLOP) return;
      p.dragging = true;
      st.current.mode = 'drag';
      setCursor('grabbing');
      const s = useApp.getState();
      useApp.setState({ dragging: true, heldTapeId: id });
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
      setCursor(st.current.hover ? 'grab' : '');
      if (!cancelled && st.current.snapped) {
        s.requestInsert(id);
      } else {
        st.current.mode = 'shelf';
        useApp.setState({ dragging: false, attraction: 0, heldTapeId: null });
        s.announce(`${movie.title} is back on the shelf.`);
      }
      st.current.snapped = false;
      return;
    }
    if (cancelled) return;
    // A tap: pick the tape up, or put a carried tape back.
    if (p.wasCarry) s.returnTape();
    else {
      s.pickTape(id);
      s.goStation('player');
    }
  };

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = useApp.getState();
    const local = st.current;
    const reduced = s.reducedMotion;
    dt = Math.min(dt, 0.05);

    // react to the store
    if (s.insertingId === id && local.mode !== 'insert' && local.mode !== 'inside') {
      local.mode = 'insert';
      local.t = reduced ? 1 : 0;
      local.from.pos.copy(g.position);
      local.from.quat.copy(g.quaternion);
      g.visible = true;
    } else if (s.insertedTapeId === id && !['insert', 'inside'].includes(local.mode)) {
      local.mode = 'inside';
    } else if (local.mode === 'inside' && s.insertedTapeId !== id) {
      local.mode = 'eject';
      local.t = reduced ? 1 : 0;
      g.visible = true;
    } else if (local.mode === 'shelf' && s.heldTapeId === id && !s.dragging) {
      local.mode = 'carry';
    } else if (local.mode === 'carry' && s.heldTapeId !== id) {
      local.mode = 'shelf';
    }

    const highlight =
      local.hover || s.focusedTapeId === id || local.mode === 'carry' || local.mode === 'drag';
    shell.emissiveIntensity = damp(shell.emissiveIntensity, highlight ? 0.22 : 0, 10, dt);

    switch (local.mode) {
      case 'shelf': {
        tmpV.copy(home.pos);
        if (local.hover || s.focusedTapeId === id) {
          tmpV.z += 0.07;
          tmpV.y += 0.015;
        }
        follow(g, tmpV, home.quat, reduced ? 40 : 9, dt);
        break;
      }
      case 'carry': {
        const aspect = size.width / size.height;
        const fov = THREE.MathUtils.degToRad(camera.fov);
        const halfH = 0.95 * Math.tan(fov / 2);
        const halfW = halfH * aspect;
        tmpV.set(halfW * 0.55, -halfH * 0.58, -0.95).applyMatrix4(camera.matrixWorld);
        tmpE.set(0.3, -0.35, 0.06);
        tmpQ.setFromEuler(tmpE).premultiply(camera.quaternion);
        follow(g, tmpV, tmpQ, reduced ? 40 : 10, dt);
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
        if (local.snapped) {
          follow(g, SLOT_ENTRY.position, SLOT_ENTRY.quaternion, 22, dt);
        } else {
          tmpV.copy(local.drag).lerp(SLOT_ENTRY.position, a * 0.7);
          tmpE.set(0.18, 0, 0);
          tmpQ.setFromEuler(tmpE).premultiply(camera.quaternion).slerp(SLOT_ENTRY.quaternion, a);
          follow(g, tmpV, tmpQ, 16, dt);
        }
        break;
      }
      case 'insert': {
        local.t = Math.min(1, local.t + dt / 0.85);
        const t = local.t;
        if (t < 0.55) {
          const k = easeInOut(t / 0.55);
          g.position.lerpVectors(local.from.pos, SLOT_ENTRY.position, k);
          g.quaternion.slerpQuaternions(local.from.quat, SLOT_ENTRY.quaternion, k);
        } else {
          const k = easeIn((t - 0.55) / 0.45);
          g.position.lerpVectors(SLOT_ENTRY.position, SLOT_INSIDE, k);
          g.quaternion.copy(SLOT_ENTRY.quaternion);
        }
        if (t >= 1) {
          local.mode = 'inside';
          g.visible = false;
          s.insertTape(id);
        }
        break;
      }
      case 'inside': {
        g.position.copy(SLOT_INSIDE);
        g.quaternion.copy(SLOT_ENTRY.quaternion);
        g.visible = false;
        break;
      }
      case 'eject': {
        local.t = Math.min(1, local.t + dt / 0.5);
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
      <RoundedBox args={[TAPE.w, TAPE.h, TAPE.d]} radius={0.018} smoothness={3} material={shell} castShadow />
      {/* label */}
      <mesh position={[0, 0.035, TAPE.d / 2 + 0.002]}>
        <planeGeometry args={[TAPE.w - 0.05, 0.124]} />
        <meshStandardMaterial map={label} transparent roughness={0.7} />
      </mesh>
      {/* reel window */}
      <mesh position={[0, -0.06, TAPE.d / 2 + 0.002]}>
        <planeGeometry args={[0.2, 0.06]} />
        <meshStandardMaterial color={PAL.glass} roughness={0.25} />
      </mesh>
      {[-0.058, 0.058].map((x) => (
        <mesh key={x} position={[x, -0.06, TAPE.d / 2 + 0.004]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.004, 16]} />
          <meshStandardMaterial color={PAL.paper} roughness={0.5} />
        </mesh>
      ))}
      {/* generous invisible hit area so the tape is easy to grab on touch */}
      <mesh>
        <boxGeometry args={[TAPE.w + 0.08, TAPE.h + 0.1, TAPE.d + 0.14]} />
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
