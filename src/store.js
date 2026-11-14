import { create } from 'zustand';
import { MOVIES } from './data/movies.js';

/**
 * One store for the whole booth. The DOM tree (hero, deck, dialogs) and the
 * 3D tree (camera, tapes, printer) both read from it, so neither needs to
 * reach into the other.
 *
 * phase:    loading → outside → entering → inside → leaving → outside
 * station:  where the camera stands inside the booth
 * deck:     what the player machine is doing
 */
export const useApp = create((set, get) => ({
  phase: 'loading',
  introDone: false, // the landing camera has finished its slow look around
  theme: initialTheme(), // 'day' | 'night', flipped by the booth's light switch
  sound: initialSound(), // soft interface sounds on or off
  station: 'booth',
  webgl: true,
  reducedMotion: false,
  coarsePointer: false,
  sceneReady: false,
  veil: false, // full-screen fade used instead of camera flights for reduced motion
  skipToken: 0,

  // tapes
  heldTapeId: null, // lifted from the shelf (tap, keyboard or drag)
  dragging: false,
  attraction: 0, // 0..1, how close a dragged tape is to the slot
  insertedTapeId: null,
  insertingId: null, // tape currently travelling into the slot
  focusedTapeId: null, // keyboard focus on a tape's hotspot
  ejectToken: 0,

  // inspecting a tape up close
  inspectId: null,
  // prompt card that follows the pointer over 3D objects
  hover: null,

  // player
  deck: 'empty', // empty | reading | frame | playing
  borderId: 'booth',
  frameLocked: false,
  videoEl: null,
  videoAspect: 16 / 9,
  ended: false,

  // photos
  sessionPhotos: [], // framed prints made during the current tape
  sessionStrips: [],
  snaps: [], // raw frames snapped this visit (the compiler), newest last
  compilerOpen: false,
  captionStyle: loadCaptionStyle(),
  collection: [], // everything saved on this device, newest first
  printBatch: [], // photos coming out of the printer right now
  printRun: 0,
  printing: false,
  lightboxId: null,
  albumOpen: false,
  flashToken: 0,

  // announcements for the app's own live region
  message: '',
  messageToken: 0,

  announce(message) {
    set((s) => ({ message, messageToken: s.messageToken + 1 }));
  },

  setTheme(theme) {
    try {
      localStorage.setItem('playbooth.theme', theme);
    } catch {
      /* private mode */
    }
    document.documentElement.dataset.theme = theme;
    set({ theme });
    get().announce(theme === 'night' ? 'Night. The lights are low.' : 'Day. The lights are up.');
  },
  toggleSound() {
    const sound = !get().sound;
    try {
      localStorage.setItem('playbooth.sound', sound ? 'on' : 'off');
    } catch {
      /* private mode */
    }
    set({ sound });
  },
  toggleTheme() {
    get().setTheme(get().theme === 'night' ? 'day' : 'night');
  },

  setPhase(phase) {
    set({ phase });
  },

  enterBooth() {
    if (get().phase !== 'outside') return;
    set({ phase: 'entering' });
  },

  leaveBooth() {
    const s = get();
    if (s.phase !== 'inside') return;
    if (s.heldTapeId) s.returnTape();
    if (s.videoEl && !s.videoEl.paused) s.videoEl.pause();
    set({ phase: 'leaving', station: 'booth' });
  },

  skipIntro() {
    set((s) => ({ skipToken: s.skipToken + 1 }));
  },

  goStation(station) {
    const s = get();
    if (station === 'watch' && !s.insertedTapeId) return;
    set({ station });
  },

  pickTape(id) {
    const s = get();
    if (s.insertedTapeId === id) return;
    set({ heldTapeId: id });
  },

  returnTape() {
    const s = get();
    if (!s.heldTapeId) return;
    set({ heldTapeId: null, dragging: false, attraction: 0 });
  },

  /** Start the insert animation; the tape calls insertTape() when it is in. */
  requestInsert(id) {
    const s = get();
    if (!id || s.insertingId) return;
    if (s.insertedTapeId && s.insertedTapeId !== id) s.ejectTape();
    set({ insertingId: id, heldTapeId: null, dragging: false, attraction: 0 });
  },

  openInspect(id) {
    set({ inspectId: id, hover: null, heldTapeId: null });
  },
  closeInspect() {
    set({ inspectId: null });
  },
  setHover(hover) {
    set({ hover });
  },

  setFocusedTape(focusedTapeId) {
    set({ focusedTapeId });
  },

  insertTape(id) {
    const s = get();
    const movie = MOVIES.find((m) => m.id === id);
    if (!movie) return;
    set({
      heldTapeId: null,
      insertingId: null,
      dragging: false,
      attraction: 0,
      insertedTapeId: id,
      deck: 'reading',
      frameLocked: false,
      ended: false,
      sessionPhotos: [],
      sessionStrips: [],
    });
    s.announce(`${movie.title} is in the player.`);
  },

  ejectTape() {
    const s = get();
    if (!s.insertedTapeId) return;
    const movie = MOVIES.find((m) => m.id === s.insertedTapeId);
    set((st) => ({
      insertedTapeId: null,
      deck: 'empty',
      frameLocked: false,
      ended: false,
      station: st.station === 'watch' ? 'player' : st.station,
      ejectToken: st.ejectToken + 1,
    }));
    s.announce(`${movie?.title ?? 'Tape'} ejected and back on the shelf.`);
  },

  setDeck(deck) {
    set({ deck });
  },

  setBorder(borderId) {
    if (get().frameLocked) return;
    set({ borderId });
  },

  confirmFrame() {
    set({ frameLocked: true, deck: 'playing' });
  },

  setVideoEl(videoEl) {
    if (get().videoEl !== videoEl) set({ videoEl });
  },

  addPhoto(photo) {
    set((s) => ({
      sessionPhotos: [...s.sessionPhotos, photo],
      collection: [photo, ...s.collection],
    }));
  },

  addSnap(snap) {
    set((s) => ({ snaps: [...s.snaps, snap], flashToken: s.flashToken + 1 }));
  },
  removeSnaps(ids) {
    const drop = new Set(ids);
    set((s) => {
      s.snaps.filter((p) => drop.has(p.id)).forEach((p) => URL.revokeObjectURL(p.url));
      return { snaps: s.snaps.filter((p) => !drop.has(p.id)) };
    });
  },
  setCompilerOpen(compilerOpen) {
    set({ compilerOpen });
  },
  setCaptionStyle(patch) {
    set((s) => {
      const captionStyle = { ...s.captionStyle, ...patch };
      try {
        localStorage.setItem('playbooth.captions', JSON.stringify(captionStyle));
      } catch {
        /* private mode */
      }
      return { captionStyle };
    });
  },

  addStrip(strip) {
    set((s) => ({
      sessionStrips: [...s.sessionStrips, strip],
      collection: [strip, ...s.collection],
    }));
  },

  removePhoto(id) {
    set((s) => ({
      collection: s.collection.filter((p) => p.id !== id),
      sessionPhotos: s.sessionPhotos.filter((p) => p.id !== id),
      sessionStrips: s.sessionStrips.filter((p) => p.id !== id),
      printBatch: s.printBatch.filter((p) => p.id !== id),
      lightboxId: s.lightboxId === id ? null : s.lightboxId,
    }));
  },

  setCollection(collection) {
    set({ collection });
  },

  startPrint(photos) {
    if (!photos.length) return;
    set((s) => ({
      printBatch: photos,
      printRun: s.printRun + 1,
      printing: true,
      station: 'prints',
    }));
    get().announce(
      photos.length === 1 ? 'Printing 1 print.' : `Printing ${photos.length} prints.`,
    );
  },

  finishPrint() {
    const n = get().printBatch.length;
    set({ printing: false });
    get().announce(
      n === 1 ? 'Your print is in the tray.' : `${n} prints are in the tray.`,
    );
  },

  openLightbox(id) {
    set({ lightboxId: id });
  },
  closeLightbox() {
    set({ lightboxId: null });
  },
  setAlbumOpen(albumOpen) {
    set({ albumOpen });
  },
}));

function initialSound() {
  try {
    return localStorage.getItem('playbooth.sound') !== 'off';
  } catch {
    return true;
  }
}

function initialTheme() {
  let t = null;
  try {
    t = localStorage.getItem('playbooth.theme');
  } catch {
    /* private mode */
  }
  if (t !== 'day' && t !== 'night') t = typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  if (typeof document !== 'undefined') document.documentElement.dataset.theme = t;
  return t;
}

function loadCaptionStyle() {
  const fallback = { color: '#ffffff', outline: true, font: 'sans' };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem('playbooth.captions') || '{}') };
  } catch {
    return fallback;
  }
}

export const movieById = (id) => MOVIES.find((m) => m.id === id) ?? null;
