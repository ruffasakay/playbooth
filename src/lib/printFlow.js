import { useApp, movieById } from '../store.js';
import { captureRaw, collagePrint, downloadPhoto, framePrint, savePhoto } from './photos.js';

/**
 * Snap: the exact frame on screen, playing or paused, downloads at once
 * and lands in the booth's compiler for printing later.
 */
export async function snapPhoto({ download = true } = {}) {
  const s = useApp.getState();
  const movie = movieById(s.insertedTapeId);
  try {
    const snap = await captureRaw({ video: s.videoEl, movie });
    useApp.getState().addSnap(snap);
    if (download) downloadPhoto(snap);
    s.announce(`Snap ${useApp.getState().snaps.length} saved at ${snap.timecode}.`);
    return snap;
  } catch (err) {
    s.announce(err?.message || 'The snap couldn’t be taken.');
    return null;
  }
}

async function keep(items) {
  for (const item of items) {
    await savePhoto(item);
    useApp.getState().addPhoto(item);
  }
}

async function sendToPrinter(items) {
  const video = useApp.getState().videoEl;
  if (video && !video.paused) video.pause();
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  useApp.setState({ compilerOpen: false });
  if (useApp.getState().phase !== 'inside') useApp.setState({ phase: 'inside' });
  useApp.getState().startPrint(items);
}

/** Print each selected snap on its own, in the frame. */
export async function printEach(snaps, borderId) {
  if (!snaps.length || useApp.getState().printing) return;
  const prints = [];
  for (const snap of snaps) prints.push(await framePrint(snap, borderId, movieById(snap.movieId)));
  await keep(prints);
  await sendToPrinter(prints);
}

/** Stack the selected snaps into one framed photostrip. */
export async function printStrip(snaps, borderId) {
  if (snaps.length < 2 || useApp.getState().printing) return;
  const ordered = [...snaps].sort((a, b) => a.createdAt - b.createdAt);
  const strip = await collagePrint(ordered, borderId, movieById(ordered[0].movieId));
  await keep([strip]);
  await sendToPrinter([strip]);
}
