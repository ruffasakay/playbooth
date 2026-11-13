import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useApp } from '../store.js';
import { PAL, PRINTER, TRAY } from './world.js';

const PRINT_W = 0.34;
const EMERGE = 1.1; // seconds a print takes to come out of the slot
const FALL = 0.55;
const GAP = 0.35;
export const TRAY_LIMIT = 8;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/** Where a print lies in the tray. Shared with the keyboard hotspots. */
export function restPose(photo, stackIndex) {
  const r1 = hash(photo.id);
  const r2 = hash(`${photo.id}z`);
  return {
    position: new THREE.Vector3(
      TRAY.x + (r1 - 0.5) * 0.14,
      TRAY.y + 0.006 + stackIndex * 0.005,
      TRAY.z + (r2 - 0.5) * 0.1,
    ),
    yaw: (r2 - 0.5) * 0.6,
  };
}

/** The photos lying in the tray, bottom first. */
export function useTrayPhotos() {
  const collection = useApp((s) => s.collection);
  const batch = useApp((s) => s.printBatch);
  return useMemo(() => {
    const batchIds = new Set(batch.map((p) => p.id));
    const older = collection.filter((p) => !batchIds.has(p.id)).slice(0, Math.max(0, TRAY_LIMIT - batch.length)).reverse();
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

  // free textures for photos that were deleted
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
      {photos.map((photo, stackIndex) => (
        <Print
          key={photo.id}
          photo={photo}
          stackIndex={stackIndex}
          batchIndex={batchIndex.get(photo.id)}
          runStart={runStart}
        />
      ))}
    </group>
  );
}

const tmpPos = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const flatQ = (yaw) => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, yaw, 'XYZ'));

function Print({ photo, stackIndex, batchIndex, runStart }) {
  const group = useRef();
  const hover = useRef(false);
  const tex = useMemo(() => textureFor(photo), [photo]);
  const height = PRINT_W * (photo.height / photo.width);
  const rest = useMemo(() => restPose(photo, stackIndex), [photo, stackIndex]);
  const restQ = useMemo(() => flatQ(rest.yaw), [rest]);
  const slotStart = useMemo(
    () => new THREE.Vector3(PRINTER.x, PRINTER.slotY, PRINTER.front - height / 2 - 0.02),
    [height],
  );
  const slotOut = useMemo(
    () => new THREE.Vector3(PRINTER.x, PRINTER.slotY - 0.02, PRINTER.front + height / 2 - 0.04),
    [height],
  );
  const outQ = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.18, 0, 0)), []);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const s = useApp.getState();
    const animating = batchIndex !== undefined && s.printing && !s.reducedMotion;
    if (animating) {
      const local = clock.elapsedTime - runStart.current - batchIndex * (EMERGE + GAP);
      if (local < 0) {
        g.visible = false;
        return;
      }
      g.visible = true;
      if (local < EMERGE) {
        // feed out of the slot in small steps, like a real printer
        const k = local / EMERGE;
        const stepped = Math.floor(k * 14) / 14 + (k * 14 - Math.floor(k * 14)) * 0.35 / 14;
        g.position.lerpVectors(slotStart, slotOut, Math.min(1, stepped));
        g.quaternion.copy(outQ);
      } else {
        const k = Math.min(1, (local - EMERGE) / FALL);
        const e = k * k;
        g.position.lerpVectors(slotOut, rest.position, e);
        g.position.y += Math.sin(k * Math.PI) * 0.05;
        g.quaternion.slerpQuaternions(outQ, restQ, e);
      }
      return;
    }
    g.visible = true;
    tmpPos.copy(rest.position);
    if (hover.current) tmpPos.y += 0.04;
    const k = 1 - Math.exp(-12 * Math.min(dt, 0.05));
    if (g.position.lengthSq() === 0) g.position.copy(rest.position);
    g.position.lerp(tmpPos, k);
    tmpQ.copy(restQ);
    g.quaternion.slerp(tmpQ, k);
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        const s = useApp.getState();
        if (s.phase !== 'inside' || s.station === 'watch' || s.printing) return;
        e.stopPropagation();
        s.openLightbox(photo.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.current = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        hover.current = false;
        document.body.style.cursor = '';
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[PRINT_W + 0.016, height + 0.016, 0.004]} />
        <meshStandardMaterial color={PAL.paper} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.0025]}>
        <planeGeometry args={[PRINT_W, height]} />
        <meshStandardMaterial map={tex} roughness={0.45} />
      </mesh>
    </group>
  );
}
