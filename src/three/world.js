import * as THREE from 'three';

/** Colors shared with the CSS tokens in styles/tokens.css. */
export const PAL = {
  sky: '#d6d9f7',
  skyTop: '#b3b7ee',
  horizon: '#f7e2d6',
  grass: '#a3d9b4',
  grassDark: '#86c79c',
  butter: '#f5cf5e',
  butterDeep: '#e9b844',
  cream: '#fff1d6',
  paper: '#fff7e8',
  cherry: '#b5294e',
  cherryDeep: '#8f1f3e',
  mint: '#7fcbb5',
  mintDeep: '#5fae98',
  honey: '#d39457',
  walnut: '#7a4a2b',
  ink: '#2a2140',
  lilac: '#c9cdf5',
  periwinkle: '#5a5fc8',
  peach: '#f2a98a',
  glass: '#191527',
};

export const FONT_URL = '/fonts/DynaPuff-Bold.woff';
export const MONO_URL = '/fonts/AtkinsonMono-SemiBold.woff';

const cache = new Map();
/** Matte, clay-like standard material, cached per color + options. */
export function clay(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...opts }),
    );
  }
  return cache.get(key);
}

/* ---------- layout of the booth (meters, booth floor at y = 0) ---------- */

export const BOOTH = {
  halfW: 2.6, // outer half width (x)
  halfD: 2.2, // outer half depth (z)
  wallH: 3.0,
  wall: 0.2,
  door: { halfW: 0.72, h: 2.36 },
};

export const CABINET = { x: -1.3, z: -1.72, w: 1.72, h: 2.02, d: 0.5 };

export const MACHINE = {
  x: 0.92,
  z: -1.5,
  w: 1.5,
  h: 1.72,
  d: 0.85,
  base: 0.3,
};
MACHINE.front = MACHINE.z + MACHINE.d / 2; // -1.075

export const SCREEN = {
  x: MACHINE.x,
  y: 1.56,
  z: MACHINE.front + 0.052,
  w: 1.2,
  h: 0.675,
};

export const SLOT = {
  x: MACHINE.x,
  y: 0.6,
  z: MACHINE.front + 0.012,
};

export const PRINTER = {
  x: MACHINE.x + MACHINE.w / 2 + 0.31,
  z: -1.52,
  w: 0.62,
  h: 0.92,
  d: 0.7,
};
PRINTER.front = PRINTER.z + PRINTER.d / 2;
PRINTER.base = 0.12;
PRINTER.y = PRINTER.base + PRINTER.h / 2;
PRINTER.slotY = 0.86;

export const TRAY = {
  x: PRINTER.x,
  y: 0.3, // top surface of the tray floor
  z: PRINTER.front + 0.32,
  w: 0.62,
  d: 0.5,
};

export const TAPE = { w: 0.38, h: 0.23, d: 0.07 };

/** Pose a tape takes just outside the slot: lying flat, label up. */
export const SLOT_ENTRY = {
  position: new THREE.Vector3(SLOT.x, SLOT.y, SLOT.z + TAPE.h / 2 + 0.03),
  quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
};
export const SLOT_INSIDE = SLOT_ENTRY.position.clone().add(new THREE.Vector3(0, 0, -0.36));

/** Cubby centers in the cabinet, top row first. */
export function cubbyCenters() {
  const { x, z, w, h, d } = CABINET;
  const side = 0.07;
  const top = 0.08;
  const plinth = 0.14;
  const shelf = 0.05;
  const innerW = w - side * 2;
  const colW = innerW / 3;
  const innerH = h - top - plinth - shelf * 2;
  const rowH = innerH / 3;
  const out = [];
  for (let row = 0; row < 3; row++) {
    const floorY = h - top - (row + 1) * rowH - row * shelf;
    for (let col = 0; col < 3; col++) {
      out.push({
        x: x - innerW / 2 + colW * (col + 0.5),
        floorY,
        z: z + d / 2 - 0.12,
        rowH,
        colW,
        index: row * 3 + col,
      });
    }
  }
  return out;
}

export const motion = {
  /** Curtain openness 0..1, animated by the camera rig's timelines. */
  curtain: { open: 0 },
};

export function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function damp(current, target, lambda, dt) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}
