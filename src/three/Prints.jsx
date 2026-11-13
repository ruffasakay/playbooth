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

/** Where a print lies in the tray. Shared with the keyboard hotspots. */
export function restPose(photo, stackIndex) {
  const r1 = hash(photo.id);
  const r2 = hash(`${photo.id}z`);
  return {
    position: new THREE.Vector3(TRAY.x + (r1 - 0.5) * 0.12, TRAY.y + 0.01 + stackIndex * 0.004, TRAY.z + (r2 - 0.5) * 0.06),
    yaw: (r2 - 0.5) * 0.5,
  };
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
  return (
    <group>
      {photos.map((photo, i) => (
        <Print key={photo.id} photo={photo} stackIndex={i} batchIndex={batchIndex.get(photo.id)} runStart={runStart} />
      ))}
    </group>
  );
}

const tmpPos = new THREE.Vector3();

function Print({ photo, stackIndex, batchIndex, runStart }) {
  const group = useRef();
  const hover = useRef(false);
  const tex = useMemo(() => textureFor(photo), [photo]);
  const [w, h] = printSize(photo);
  const rest = useMemo(() => restPose(photo, stackIndex), [photo, stackIndex]);
  const restQ = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, rest.yaw)), [rest]);
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
        const e = k * k;
        g.position.lerpVectors(slotOut, rest.position, e);
        g.position.y += Math.sin(k * Math.PI) * 0.03;
        g.quaternion.slerpQuaternions(outQ, restQ, e);
      }
      return;
    }
    g.visible = true;
    tmpPos.copy(rest.position);
    if (hover.current) tmpPos.y += 0.025;
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
        useApp.getState().setHover({ title: photo.kind === 'strip' ? 'Photostrip' : 'Print', sub: photo.title, actions: [['click', 'View']], x: e.clientX, y: e.clientY });
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = '';
        useApp.getState().setHover(null);
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + 0.012, h + 0.012, 0.003]} />
        <meshStandardMaterial color="#f6f1e7" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
    </group>
  );
}
