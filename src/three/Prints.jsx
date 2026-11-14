import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useApp } from '../store.js';
import { PRINTER, TRAY, interaction } from './world.js';

const MAX_W = 0.3;
const MAX_H = 0.3;
const EMERGE = 1.2;
const FALL = 0.55;
const GAP = 0.35;
export const TRAY_LIMIT = 8;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

export function printSize(photo) {
  const a = photo.width / photo.height;
  return a >= MAX_W / MAX_H ? [MAX_W, MAX_W / a] : [MAX_H * a, MAX_H];
}

/*
 * How prints settle in the tray, worked out for the whole stack at once.
 * The tray's inside is 0.476 m wide and 0.296 m deep (front to back), its
 * floor 8 mm and its rim 40 mm above the tray's base. Prints come out of the
 * printer behind the tray, image top first towards the printer:
 * - a print that fits lies flat, turned a little, kept clear of the walls;
 * - a strip longer than the tray is deep lands with its leading (bottom) end
 *   on the floor against the front wall and its trailing (top) end resting on
 *   the back rim, so it leans, the way paper really falls into a short tray;
 * - once a strip leans, everything printed after it lies on top of it, at the
 *   same lean, so nothing passes through anything;
 * - every layer sits 4.5 mm above the one under it (paper is 3 mm), which is
 *   enough that no two faces ever share a depth and nothing flickers.
 */
const T = 0.003; // card thickness
const LAYER = 0.0045;
const IN_X = TRAY.w / 2 - 0.012 - 0.006; // half the inside width, with a little air
const IN_Z = TRAY.d / 2 - 0.012 - 0.004; // half the inside depth
const FLOOR = TRAY.y + 0.008;
const RIM = TRAY.y + 0.04;
const LEAN = Math.atan2(RIM - FLOOR, IN_Z * 2); // about 6 degrees

function layout(photos) {
  let leaning = false;
  return photos.map((photo, i) => {
    const [w, h] = printSize(photo);
    const W = w + 0.012;
    const L = h + 0.012;
    const lift = i * LAYER;
    const r1 = hash(photo.id);
    const r2 = hash(`${photo.id}z`);
    if (!leaning && L > IN_Z * 2) leaning = true;
    if (leaning) {
      // on the lean: centred along the slope, the whole card inside the walls (a long one runs over the back rim)
      const room = Math.max(0, IN_Z * 2 - L);
      const s = L / 2 + room * (0.25 + r2 * 0.5); // distance along the slope from the front contact
      const yaw = (r1 - 0.5) * 0.06;
      const xRoom = Math.max(0, IN_X - W / 2);
      return {
        position: new THREE.Vector3(
          TRAY.x + (r1 - 0.5) * 2 * xRoom * 0.6,
          FLOOR + lift + T / 2 + Math.sin(LEAN) * s + Math.cos(LEAN) * 0.0005,
          TRAY.z + IN_Z - Math.cos(LEAN) * s,
        ),
        yaw,
        lean: LEAN,
      };
    }
    // flat: turn it a little, then keep the turned card clear of the walls
    let yaw = (r2 - 0.5) * 0.3;
    let ex = Math.abs(W * Math.cos(yaw)) + Math.abs(L * Math.sin(yaw));
    let ez = Math.abs(W * Math.sin(yaw)) + Math.abs(L * Math.cos(yaw));
    if (ex > IN_X * 2 || ez > IN_Z * 2) {
      yaw = 0;
      ex = W;
      ez = L;
    }
    const ox = Math.max(0, IN_X - ex / 2) * 0.8;
    const oz = Math.max(0, IN_Z - ez / 2) * 0.8;
    return {
      position: new THREE.Vector3(TRAY.x + (r1 - 0.5) * 2 * ox, FLOOR + lift + T / 2 + 0.0005, TRAY.z + (r2 - 0.5) * 2 * oz),
      yaw,
      lean: 0,
    };
  });
}

/** Where every print in the tray lies, bottom of the stack first. Shared with the keyboard hotspots. */
export function useTrayLayout(photos) {
  return useMemo(() => layout(photos), [photos]);
}

/** Where one print lies (kept for callers that need a single pose). */
export function restPose(photo, stackIndex, photos) {
  return layout(photos ?? [photo])[photos ? stackIndex : 0];
}

export function useTrayPhotos() {
  const collection = useApp((s) => s.collection);
  const batch = useApp((s) => s.printBatch);
  return useMemo(() => {
    const ids = new Set(batch.map((p) => p.id));
    const older = collection.filter((p) => !ids.has(p.id)).slice(0, Math.max(0, TRAY_LIMIT - batch.length)).reverse();
    return [...older, ...batch.slice(-TRAY_LIMIT)];
  }, [collection, batch]);
}

const loader = new THREE.TextureLoader();
const textures = new Map();
function textureFor(photo) {
  if (!textures.has(photo.id)) {
    const tex = loader.load(photo.url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    textures.set(photo.id, tex);
  }
  return textures.get(photo.id);
}

export function Prints() {
  const photos = useTrayPhotos();
  const batch = useApp((s) => s.printBatch);
  const printRun = useApp((s) => s.printRun);
  const runStart = useRef(-1);
  const done = useRef(true);
  const clockRef = useRef(0);

  useEffect(() => {
    const keep = new Set(useApp.getState().collection.map((p) => p.id));
    for (const [id, tex] of textures) {
      if (!keep.has(id)) {
        tex.dispose();
        textures.delete(id);
      }
    }
  }, [photos]);

  useEffect(() => {
    if (!printRun) return;
    runStart.current = clockRef.current;
    done.current = false;
  }, [printRun]);

  useFrame(({ clock }) => {
    clockRef.current = clock.elapsedTime;
    const s = useApp.getState();
    if (!done.current && s.printing) {
      const total = s.printBatch.length * (EMERGE + GAP) + FALL;
      if (s.reducedMotion || clock.elapsedTime - runStart.current > total) {
        done.current = true;
        s.finishPrint();
      }
    }
  });

  const batchIndex = useMemo(() => new Map(batch.map((p, i) => [p.id, i])), [batch]);
  const poses = useTrayLayout(photos);
  return (
    <group>
      {photos.map((photo, i) => (
        <Print key={photo.id} photo={photo} rest={poses[i]} batchIndex={batchIndex.get(photo.id)} runStart={runStart} />
      ))}
    </group>
  );
}

const tmpPos = new THREE.Vector3();

function Print({ photo, rest, batchIndex, runStart }) {
  const group = useRef();
  const hover = useRef(false);
  const tex = useMemo(() => textureFor(photo), [photo]);
  const [w, h] = printSize(photo);
  // lying flat is -90 degrees about x; leaning lifts the far (top) end by the lean angle
  const restQ = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + rest.lean, 0, rest.yaw)), [rest]);
  const slotStart = useMemo(() => new THREE.Vector3(PRINTER.x, PRINTER.slotY, PRINTER.front - h / 2 - 0.02), [h]);
  const slotOut = useMemo(() => new THREE.Vector3(PRINTER.x, PRINTER.slotY - 0.01, PRINTER.front + h / 2 - 0.03), [h]);
  const outQ = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.12, 0, 0)), []);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const s = useApp.getState();
    if (batchIndex !== undefined && s.printing && !s.reducedMotion) {
      const local = clock.elapsedTime - runStart.current - batchIndex * (EMERGE + GAP);
      if (local < 0) {
        g.visible = false;
        return;
      }
      g.visible = true;
      if (local < EMERGE) {
        const k = local / EMERGE;
        const stepped = Math.floor(k * 16) / 16 + ((k * 16) % 1) * 0.3 / 16;
        g.position.lerpVectors(slotStart, slotOut, Math.min(1, stepped));
        g.quaternion.copy(outQ);
      } else {
        const k = Math.min(1, (local - EMERGE) / FALL);
        const e = k * k; // gravity: slow off the slot, fast into the tray
        g.position.lerpVectors(slotOut, rest.position, e);
        // it slides forward and drops; a slight lift early so it clears the cards already lying there
        g.position.y += Math.sin(Math.min(1, k * 1.6) * Math.PI) * 0.02;
        g.quaternion.slerpQuaternions(outQ, restQ, Math.min(1, e * 1.15));
      }
      return;
    }
    g.visible = true;
    tmpPos.copy(rest.position);
    if (hover.current) tmpPos.y += 0.02;
    const k = 1 - Math.exp(-12 * Math.min(dt, 0.05));
    if (g.position.lengthSq() === 0) g.position.copy(rest.position);
    g.position.lerp(tmpPos, k);
    g.quaternion.slerp(restQ, k);
  });

  const can = () => {
    const s = useApp.getState();
    return s.phase === 'inside' && s.station !== 'watch' && !s.printing && !s.inspectId;
  };
  return (
    <group
      ref={group}
      onClick={(e) => {
        if (!can()) return;
        e.stopPropagation();
        useApp.getState().openLightbox(photo.id);
      }}
      onPointerDown={() => {
        if (can()) interaction.grabbed = true;
      }}
      onPointerOver={(e) => {
        if (!can()) return;
        e.stopPropagation();
        hover.current = true;
        document.body.style.cursor = 'pointer';
        useApp.getState().setHover({ title: photo.kind === 'strip' ? 'Photostrip' : 'Print', sub: photo.title, cursor: 'View', actions: [['click', 'View']], x: e.clientX, y: e.clientY });
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = '';
        useApp.getState().setHover(null);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + 0.012, h + 0.012, T]} />
        <meshStandardMaterial color="#f6f1e7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, T / 2 + 0.0008]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
    </group>
  );
}
