import { useApp } from '../store.js';

/**
 * The booth's sounds, synthesized on the spot: no files to download.
 * Everything is short and quiet, closer to touching paper and plastic
 * than to a game's beeps. The sound toggle silences all of it.
 */
let ctx = null;
let master = null;
let noiseBuf = null;
let last = 0;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.55;
  // a gentle limiter so the louder set never clips
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function env(g, t, a, peak, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function noise(t, dur, { type = 'bandpass', freq = 2000, q = 1, peak = 0.5, attack = 0.003, sweep } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, attack, peak, dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

function tone(t, dur, { freq = 440, to, type = 'sine', peak = 0.3, attack = 0.004 } = {}) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  env(g, t, attack, peak, dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const SOUNDS = {
  /** a key going down: a crisp click over a short, felt thock */
  tick: (t) => {
    noise(t, 0.025, { freq: 3400, q: 2.2, peak: 0.5 });
    tone(t, 0.06, { freq: 190, to: 110, type: 'sine', peak: 0.42, attack: 0.002 });
    noise(t + 0.045, 0.02, { freq: 2400, q: 3, peak: 0.16 });
  },
  /** quieter still: the pointer finding something */
  hover: (t) => noise(t, 0.02, { freq: 4200, q: 4, peak: 0.12 }),
  /** a wooden tap: play and pause */
  tap: (t) => {
    tone(t, 0.09, { freq: 420, to: 250, type: 'triangle', peak: 0.4 });
    tone(t, 0.07, { freq: 150, to: 95, type: 'sine', peak: 0.35, attack: 0.002 });
    noise(t, 0.02, { freq: 2600, q: 2, peak: 0.3 });
  },
  /** the wall switch: snap, then a low thunk */
  switch: (t) => {
    noise(t, 0.025, { freq: 2400, q: 3, peak: 0.75 });
    tone(t + 0.01, 0.1, { freq: 150, to: 80, type: 'sine', peak: 0.5 });
  },
  /** a camera shutter: two leaves */
  shutter: (t) => {
    noise(t, 0.04, { type: 'highpass', freq: 1800, peak: 0.55 });
    noise(t + 0.07, 0.06, { freq: 1200, q: 1.5, peak: 0.4 });
    tone(t + 0.07, 0.05, { freq: 220, to: 140, peak: 0.12 });
  },
  /** a sheet of paper turning: frames, cards */
  paper: (t) => noise(t, 0.16, { freq: 1800, sweep: 4200, q: 0.8, peak: 0.18, attack: 0.03 }),
  /** a tape sliding toward the slot */
  slide: (t) => noise(t, 0.35, { freq: 700, sweep: 1500, q: 0.7, peak: 0.12, attack: 0.08 }),
  /** a tape seating in the VCR */
  clunk: (t) => {
    tone(t, 0.14, { freq: 120, to: 70, type: 'sine', peak: 0.5 });
    noise(t, 0.05, { freq: 900, q: 1.2, peak: 0.35 });
    noise(t + 0.18, 0.12, { freq: 500, q: 2, peak: 0.12 });
  },
  eject: (t) => {
    noise(t, 0.03, { freq: 1600, q: 2, peak: 0.4 });
    noise(t + 0.04, 0.3, { freq: 1300, sweep: 600, q: 0.8, peak: 0.14, attack: 0.04 });
  },
  /** the printer feeding paper */
  whirr: (t) => {
    for (let i = 0; i < 6; i++) {
      tone(t + i * 0.16, 0.12, { freq: 180 + (i % 2) * 20, type: 'sawtooth', peak: 0.04, attack: 0.02 });
      noise(t + i * 0.16, 0.1, { freq: 900, q: 3, peak: 0.06, attack: 0.02 });
    }
  },
  /** velvet curtains */
  curtain: (t) => noise(t, 0.9, { type: 'lowpass', freq: 500, sweep: 1600, peak: 0.16, attack: 0.25 }),
  /** a two-note chime when the film starts */
  start: (t) => {
    tone(t, 0.5, { freq: 523.25, peak: 0.12, attack: 0.01 });
    tone(t + 0.12, 0.6, { freq: 783.99, peak: 0.1, attack: 0.01 });
  },
};

export function sfx(name) {
  const s = useApp.getState();
  if (!s.sound || !SOUNDS[name]) return;
  const a = audio();
  if (!a) return;
  if (a.state === 'suspended') a.resume().catch(() => {});
  last = performance.now();
  try {
    SOUNDS[name](a.currentTime + 0.005);
  } catch {
    /* audio unavailable */
  }
}

/** True if a sound already played for this interaction. */
export function justPlayed(ms = 60) {
  return performance.now() - last < ms;
}

/** Wire the booth's events to sounds, and give every button a soft click. */
export function bindSounds() {
  const onClick = (e) => {
    const el = e.target.closest?.('button, [role="radio"], [role="switch"], a, label.pb-swatch');
    if (!el || el.disabled || justPlayed()) return;
    sfx(el.dataset.sfx || 'tick');
  };
  // bubble phase on window: runs after React's own handlers, so a specific sound wins
  window.addEventListener('click', onClick);
  const unsub = useApp.subscribe((s, p) => {
    if (s.insertingId && !p.insertingId) sfx('slide');
    if (s.insertedTapeId && s.insertedTapeId !== p.insertedTapeId) sfx('clunk');
    if (!s.insertedTapeId && p.insertedTapeId) sfx('eject');
    if (s.printRun !== p.printRun) sfx('whirr');
    if (s.theme !== p.theme) sfx('switch');
    if ((s.phase === 'entering' && p.phase !== 'entering') || (s.phase === 'leaving' && p.phase !== 'leaving')) sfx('curtain');
    if (s.inspectId && !p.inspectId) sfx('paper');
    if (s.hover?.title && s.hover.title !== p.hover?.title) sfx('hover');
  });
  return () => {
    window.removeEventListener('click', onClick);
    unsub();
  };
}
