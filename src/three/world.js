import * as THREE from 'three';

/**
 * Late-afternoon light, worn materials, few colors.
 * Matches the CSS tokens in styles/tokens.css.
 */
export const PAL = {
  haze: '#c9d6da',
  hazeTop: '#8fb0c6',
  horizon: '#f0d2a8',
  paper: '#f4ede0',
  cream: '#ebe2d0',
  booth: '#ece6dc',
  boothShade: '#d9d1c4',
  plaster: '#efe7d9',
  ink: '#33261c',
  inkSoft: '#5a483a',
  wood: '#9a6a44',
  woodDark: '#5c3d28',
  woodLight: '#b98a5e',
  terracotta: '#9e4330',
  terracottaDeep: '#7a3024',
  teal: '#3c8a78',
  tealDeep: '#2c6658',
  navy: '#27324a',
  ochre: '#d2a24c',
  asphalt: '#6d6560',
  paver: '#b9ada0',
  metal: '#a9a59d',
  glass: '#141210',
  leaf: '#4f6b4a',
  leafLight: '#6f8a5c',
};

export const FONT_SERIF = '/fonts/Fraunces.woff';
export const FONT_MONO = '/fonts/DMMono.woff';
export const FONT_HAND = '/fonts/Caveat.woff';

const cache = new Map();
/** Matte standard material, cached. */
export function mat(color, opts = {}) {
  const key = `${color}|${JSON.stringify(opts)}`;
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...opts }));
  }
  return cache.get(key);
}

/* ---------- layout (meters, booth floor at y = 0) ---------- */

export const BOOTH = {
  halfW: 2.6,
  halfD: 2.2,
  wallH: 3.0,
  wall: 0.16,
  door: { halfW: 0.7, h: 2.3 },
};

/** Video rental rack against the back wall, left side. */
export const CABINET = { x: -1.28, z: -1.74, w: 1.74, h: 2.0, d: 0.46 };

/** Low wooden console holding the VCR, with a CRT television on top. */
export const MACHINE = { x: 0.86, z: -1.5, w: 1.36, h: 0.74, d: 0.72 };
MACHINE.front = MACHINE.z + MACHINE.d / 2;

export const TV = { x: MACHINE.x, z: -1.56, w: 1.12, h: 0.9, d: 0.66 };
TV.y = MACHINE.h + TV.h / 2;
TV.front = TV.z + TV.d / 2;

/** 4:3 picture tube. */
export const SCREEN = { x: TV.x, y: TV.y + 0.02, z: TV.front + 0.019, w: 0.8, h: 0.6 };

export const VCR = { x: MACHINE.x, y: 0.5, z: MACHINE.front - 0.2, w: 0.66, h: 0.14, d: 0.38 };
VCR.front = VCR.z + VCR.d / 2;

export const SLOT = { x: VCR.x - 0.08, y: VCR.y + 0.025, z: VCR.front + 0.004 };

/** Side table with the photo printer. */
export const TABLE = { x: 2.0, z: -1.38, w: 0.72, h: 0.56, d: 0.66 };
export const PRINTER = { x: TABLE.x, z: TABLE.z - 0.12, w: 0.48, h: 0.26, d: 0.38 };
PRINTER.base = TABLE.h;
PRINTER.y = PRINTER.base + PRINTER.h / 2;
PRINTER.front = PRINTER.z + PRINTER.d / 2;
PRINTER.slotY = PRINTER.base + 0.17;

export const TRAY = { x: TABLE.x, y: TABLE.h + 0.012, z: PRINTER.front + 0.2, w: 0.5, d: 0.32 };

/** A VHS clamshell case, cover facing out. */
export const TAPE = { w: 0.24, h: 0.4, d: 0.05 };

/** Pose just outside the VCR slot: lying flat, cover up, short edge first. */
export const SLOT_ENTRY = {
  position: new THREE.Vector3(SLOT.x, SLOT.y, SLOT.z + TAPE.h / 2 + 0.03),
  quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
};
export const SLOT_INSIDE = SLOT_ENTRY.position.clone().add(new THREE.Vector3(0, 0, -0.5));

/** Shelf positions in the rack, top row first. */
export function cubbyCenters() {
  const { x, z, w, h, d } = CABINET;
  const side = 0.06;
  const top = 0.07;
  const plinth = 0.16;
  const shelf = 0.035;
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
        z: z + d / 2 - 0.13,
        rowH,
        colW,
        index: row * 3 + col,
      });
    }
  }
  return out;
}

export const motion = {
  /** Curtain openness 0..1, driven by the camera rig. */
  curtain: { open: 0 },
};

/** Set by 3D objects on pointerdown so a drag on them doesn't also turn the camera. */
export const interaction = { grabbed: false };

export function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function damp(current, target, lambda, dt) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/* ---------- day and night ---------- */

/** 0 = day, 1 = night. Eased toward the theme by the DayNight controller. */
export const light = { t: 0 };
const glowRegistry = new Set();

/**
 * Ref callback: blend `key` on the object between a day and a night value
 * (numbers or colors). An empty key blends the object itself (a Color).
 */
export function dayNight(key, day, night) {
  const d = typeof day === 'string' ? new THREE.Color(day) : day;
  const n = typeof night === 'string' ? new THREE.Color(night) : night;
  let entry = null;
  return (obj) => {
    if (entry) glowRegistry.delete(entry);
    entry = null;
    if (!obj) return;
    entry = { obj, key, day: d, night: n };
    glowRegistry.add(entry);
    applyEntry(entry, light.t);
  };
}

function applyEntry(e, t) {
  if (e.day instanceof THREE.Color) (e.key ? e.obj[e.key] : e.obj).lerpColors(e.day, e.night, t);
  else e.obj[e.key] = e.day + (e.night - e.day) * t;
}

export function applyLight(t) {
  light.t = t;
  for (const e of glowRegistry) applyEntry(e, t);
}
