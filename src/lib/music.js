import { useApp } from '../store.js';

/*
 * The booth's music: a slow, warm loop, played live by the browser. There are
 * no files and no borrowed songs: an electric piano plays eight bars of soft
 * seventh chords over a round bass, a few bell notes drift in on top, brushes
 * keep time far back, and a record's crackle sits under it all. A new handful
 * of bell notes is picked every pass, so the loop never repeats exactly.
 *
 * It plays in the booth only, quietly, while you walk, browse the tapes,
 * choose a frame or print. It fades out when a film starts, and back in when
 * the tape comes out or you go to print your snaps. The booth's sound switch
 * silences it along with every other sound.
 */

const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const LEVEL = 0.7; // about -31 dBFS on average, peaks near -12: well under the films and the interface sounds, still there on a phone speaker

// eight bars: Fmaj9, Em7, Dm9, Cmaj9, Fmaj9, Em7, Dm9, G13sus (upper voices, MIDI notes; the bass plays the root)
const CHORDS = [
  { bass: 41, keys: [57, 60, 64, 67] },
  { bass: 40, keys: [55, 59, 62, 64] },
  { bass: 38, keys: [53, 57, 60, 64] },
  { bass: 36, keys: [52, 55, 59, 62] },
  { bass: 41, keys: [57, 60, 64, 67] },
  { bass: 40, keys: [55, 59, 62, 67] },
  { bass: 38, keys: [53, 57, 60, 65] },
  { bass: 43, keys: [53, 57, 60, 62] },
];
// bells: C major pentatonic, above the chords
const BELLS = [72, 74, 76, 79, 81, 84];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);

/** Builds the music on an audio context; `out` is where it plays (the speakers, or an offline render to measure it). */
export function createMusic(ctx, out = ctx.destination) {
  const master = ctx.createGain();
  master.gain.value = 0;
  const warm = ctx.createBiquadFilter(); // takes the edge off everything: a little like an old cassette
  warm.type = 'lowpass';
  warm.frequency.value = 2600;
  warm.Q.value = 0.4;
  master.connect(warm).connect(out);

  // a soft room: two short, damped echoes
  const room = ctx.createGain();
  room.gain.value = 0.22;
  const d1 = ctx.createDelay(1);
  d1.delayTime.value = BEAT * 0.75;
  const fb = ctx.createGain();
  fb.gain.value = 0.28;
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = 1400;
  room.connect(d1).connect(damp).connect(fb).connect(d1);
  damp.connect(master);

  const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  // a record's crackle: a faint hiss and a few dust pops, looping under the music
  const crackleBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const cd = crackleBuf.getChannelData(0);
  for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * 0.06;
  for (let k = 0; k < 26; k++) {
    const at = Math.floor(Math.random() * (cd.length - 200));
    const amp = 0.25 + Math.random() * 0.5;
    for (let j = 0; j < 60; j++) cd[at + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j / 9);
  }
  const crackle = ctx.createBufferSource();
  crackle.buffer = crackleBuf;
  crackle.loop = true;
  const cf = ctx.createBiquadFilter();
  cf.type = 'bandpass';
  cf.frequency.value = 3200;
  cf.Q.value = 0.6;
  const cg = ctx.createGain();
  cg.gain.value = 0.18;
  crackle.connect(cf).connect(cg).connect(master);
  crackle.start();

  /** an electric piano note: a sine with a soft bell on top, a quick strike and a long fall */
  const keyNote = (t, m, vel, dur) => {
    const f = hz(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(vel * 0.35, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const a = ctx.createOscillator();
    a.frequency.value = f;
    const b = ctx.createOscillator(); // the tine: an octave and a bit up, gone quickly
    b.frequency.value = f * 4.0;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(vel * 0.18, t);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    // slow tremolo, as on a Rhodes
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.2;
    const lg = ctx.createGain();
    lg.gain.value = 0.12;
    const trem = ctx.createGain();
    trem.gain.value = 0.88;
    lfo.connect(lg).connect(trem.gain);
    a.connect(trem);
    b.connect(bg).connect(trem);
    trem.connect(g);
    g.connect(master);
    g.connect(room);
    for (const o of [a, b, lfo]) {
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  };

  const bassNote = (t, m, dur) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.15, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = hz(m);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    o.connect(lp).connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  };

  const bell = (t, m, vel) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    const o = ctx.createOscillator();
    o.frequency.value = hz(m);
    const o2 = ctx.createOscillator();
    o2.frequency.value = hz(m) * 2.76; // a struck bar's overtone
    const g2 = ctx.createGain();
    g2.gain.value = 0.12;
    o.connect(g);
    o2.connect(g2).connect(g);
    g.connect(master);
    g.connect(room);
    for (const x of [o, o2]) {
      x.start(t);
      x.stop(t + 2.3);
    }
  };

  /** brushes: a soft swish on two and four, a thump on one, all far back */
  const brush = (t, peak) => {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 5200;
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    s.connect(f).connect(g).connect(master);
    s.start(t, Math.random());
    s.stop(t + 0.3);
  };
  const thump = (t) => {
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(95, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.35);
  };

  const swing = BEAT * 0.12; // the "and"s lean late, so it sways instead of ticking

  function playBar(t, i) {
    const c = CHORDS[i % CHORDS.length];
    // the chord, rolled gently from the bottom
    c.keys.forEach((m, k) => keyNote(t + k * 0.028, m, 0.1 - k * 0.008, BAR * 0.9));
    // and a quieter push on the "and" of three
    c.keys.slice(1).forEach((m, k) => keyNote(t + BEAT * 2.5 + swing + k * 0.02, m, 0.04, BEAT * 1.4));
    bassNote(t, c.bass, BEAT * 2.2);
    bassNote(t + BEAT * 2.5 + swing, c.bass + (i % 2 ? 7 : 12), BEAT * 1.2);
    thump(t);
    thump(t + BEAT * 2);
    brush(t + BEAT, 0.05);
    brush(t + BEAT * 3, 0.05);
    for (let k = 0; k < 4; k++) brush(t + BEAT * k + BEAT * 0.5 + swing, 0.018);
    // a few bells, different every pass: a short phrase that answers the chord, or nothing
    if (Math.random() < 0.65) {
      const n = 1 + Math.floor(Math.random() * 3);
      let at = BEAT * (1 + Math.floor(Math.random() * 2) * 0.5);
      let idx = Math.floor(Math.random() * BELLS.length);
      for (let k = 0; k < n && at < BAR - BEAT * 0.5; k++) {
        bell(t + at + (k % 2 ? swing : 0), BELLS[idx], 0.035);
        at += BEAT * (Math.random() < 0.5 ? 0.5 : 1);
        idx = Math.max(0, Math.min(BELLS.length - 1, idx + (Math.random() < 0.5 ? -1 : 1)));
      }
    }
  }

  let next = 0;
  let bar = 0;
  let timer = 0;
  const schedule = () => {
    while (next < ctx.currentTime + 0.6) {
      playBar(next, bar++);
      next += BAR;
    }
  };

  return {
    /** fade in over a few seconds (from where it is) and keep playing */
    start(fade = 3) {
      if (!timer) {
        next = Math.max(next, ctx.currentTime + 0.1);
        schedule();
        timer = setInterval(schedule, 150);
      }
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(LEVEL, now + fade);
    },
    /** fade out; the bars stop being written once it is silent */
    stop(fade = 1.6, then) {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
      master.gain.exponentialRampToValueAtTime(0.0001, now + fade);
      clearInterval(timer);
      timer = 0;
      next = 0;
      if (then) setTimeout(then, fade * 1000 + 100);
    },
    /** for an offline render: write `bars` bars from time 0 at full level */
    render(bars) {
      master.gain.value = LEVEL;
      for (let i = 0; i < bars; i++) playBar(0.05 + i * BAR, i);
    },
  };
}

/* ---------- the booth's player: on while you look around, off while a film plays ---------- */

let ctx = null;
let music = null;
let playing = false;
const GESTURES = ['pointerdown', 'touchend', 'click', 'keydown'];

/** Whether the music should be heard right now. */
function wanted() {
  const s = useApp.getState();
  if (s.host !== 'booth' || !s.sound) return false;
  if (typeof document !== 'undefined' && document.hidden) return false;
  // a film has started and you are watching it (or it is still running on the booth's television): the film has the room.
  // Choosing the frame comes before the film, so the music carries on through it; printing your snaps brings it back.
  const v = s.videoEl;
  const rolling = !!v && !v.paused && !v.ended;
  // (the snaps dialog over a paused film counts as printing; over a running one, the film still has the room)
  const film = s.deck === 'playing' && s.station !== 'prints' && (rolling || (s.station === 'watch' && !s.compilerOpen));
  return !film;
}

function update() {
  const want = wanted();
  if (want === playing) return;
  playing = want;
  if (want) {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      music = createMusic(ctx);
    }
    // starts at once, during the preloader too; where the browser holds sound back until the first touch
    // or key, the music is already written and its fade-in simply begins at that touch
    ctx.resume?.().catch(() => {});
    music.start(2.5);
  } else if (music) {
    // quick when the film starts (it should not talk over the opening), gentle otherwise
    music.stop(1.2, () => {
      if (!playing) ctx?.suspend?.().catch(() => {});
    });
  }
}

/**
 * Start the music as the page opens. Most browsers keep a page silent until
 * it is first touched, clicked or typed on; where they do, the music resumes
 * on that very first touch, wherever it lands, so nothing has to be pressed
 * on purpose.
 */
export function bindMusic() {
  const unlock = () => {
    if (ctx && ctx.state !== 'running' && playing) ctx.resume?.().catch(() => {});
    if (ctx?.state === 'running') for (const e of GESTURES) window.removeEventListener(e, unlock, opts);
    update();
  };
  const opts = { capture: true, passive: true };
  for (const e of GESTURES) window.addEventListener(e, unlock, opts);
  // the film's own play and pause count too, not only the booth's state
  let video = null;
  const watchVideo = (v) => {
    if (v === video) return;
    for (const e of ['play', 'pause', 'ended']) video?.removeEventListener(e, update);
    video = v;
    for (const e of ['play', 'pause', 'ended']) video?.addEventListener(e, update);
  };
  const unsub = useApp.subscribe((st) => {
    watchVideo(st.videoEl);
    update();
  });
  watchVideo(useApp.getState().videoEl);
  update(); // straight away: during the preloader, not after it
  document.addEventListener('visibilitychange', update);
  return () => {
    for (const e of GESTURES) window.removeEventListener(e, unlock, opts);
    document.removeEventListener('visibilitychange', update);
    watchVideo(null);
    unsub();
    music?.stop(0.4);
    playing = false;
  };
}

// dev only: lets the tests see whether the music is on
if (import.meta.env.DEV && typeof window !== 'undefined') window.__music = () => ({ playing, ctx: ctx?.state ?? null });
