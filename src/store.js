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

  // player
  deck: 'empty', // empty | reading | frame | playing
  borderId: 'strip',
  frameLocked: false,
  videoEl: null,
  videoAspect: 16 / 9,
  ended: false,

  // photos
  sessionPhotos: [], // captured during the current tape
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
    const movie = MOVIES.find((m) => m.id === id);
    s.announce(`Holding ${movie?.title ?? 'a tape'}. Put it in the player’s slot.`);
  },

  returnTape() {
    const s = get();
    if (!s.heldTapeId) return;
    set({ heldTapeId: null, dragging: false, attraction: 0 });
    s.announce('Tape back on the shelf.');
  },

  /** Start the insert animation; the tape calls insertTape() when it is in. */
  requestInsert(id) {
    const s = get();
    if (!id || s.insertingId) return;
    if (s.insertedTapeId && s.insertedTapeId !== id) s.ejectTape();
    set({ insertingId: id, heldTapeId: null, dragging: false, attraction: 0 });
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
    });
    s.announce(`${movie.title} is in. The player is reading the tape.`);
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
      flashToken: s.flashToken + 1,
    }));
  },

  removePhoto(id) {
    set((s) => ({
      collection: s.collection.filter((p) => p.id !== id),
      sessionPhotos: s.sessionPhotos.filter((p) => p.id !== id),
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
      photos.length === 1 ? 'Printing 1 photo.' : `Printing ${photos.length} photos.`,
    );
  },

  finishPrint() {
    const n = get().printBatch.length;
    set({ printing: false });
    get().announce(
      n === 1
        ? 'Your print is in the tray. Select it to see it larger or download it.'
        : `${n} prints are in the tray. Select one to see it larger or download it.`,
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

export const movieById = (id) => MOVIES.find((m) => m.id === id) ?? null;
