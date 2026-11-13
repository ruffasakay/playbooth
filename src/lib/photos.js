import { createStore, set as idbSet, del as idbDel, values as idbValues } from 'idb-keyval';
import {
  borderById,
  ensureFrameFonts,
  formatDate,
  formatTimecode,
  frameLayout,
  paintComposite,
  paintStrip,
} from '../data/borders.js';

let store;
function photoStore() {
  if (!store) store = createStore('playbooth', 'photos');
  return store;
}

const MAX_WIDTH = 1600;

export class CaptureError extends Error {}

/**
 * Grab the current frame exactly as the film shows it, no frame around it.
 * Needs a CORS-clean video (crossOrigin="anonymous" plus CORS headers).
 */
export async function captureRaw({ video, movie }) {
  if (!video || video.readyState < 2 || !video.videoWidth) {
    throw new CaptureError('The picture isn’t ready yet. Try again in a moment.');
  }
  const scale = Math.min(1, 1920 / video.videoWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  const time = video.currentTime;
  let blob;
  try {
    blob = await toJpeg(canvas);
  } catch {
    throw new CaptureError('This browser won’t let the booth read this video’s pixels, so the snap couldn’t be saved.');
  }
  return {
    id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    kind: 'snap',
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    movieId: movie?.id ?? null,
    title: movie?.title ?? 'Untitled',
    time,
    timecode: formatTimecode(time),
    createdAt: Date.now(),
  };
}

function toJpeg(canvas) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/jpeg', 0.92);
    } catch (e) {
      reject(e);
    }
  });
}

async function framedCanvas(snap, border, movie) {
  const bitmap = await createImageBitmap(snap.blob);
  const aspect = bitmap.width / bitmap.height;
  const units = 1 + border.pads.l + border.pads.r;
  const L = frameLayout(border, aspect, Math.min(MAX_WIDTH, Math.round(bitmap.width * units)));
  const canvas = document.createElement('canvas');
  canvas.width = L.W;
  canvas.height = L.H;
  paintComposite(canvas.getContext('2d'), border, L, { title: movie?.title ?? snap.title, date: formatDate(), timecode: snap.timecode }, (c, win) => {
    c.drawImage(bitmap, win.x, win.y, win.w, win.h);
  });
  bitmap.close?.();
  return canvas;
}

const makeId = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

/** One snap, printed in a frame. */
export async function framePrint(snap, borderId, movie) {
  await ensureFrameFonts();
  const border = borderById(borderId);
  const canvas = await framedCanvas(snap, border, movie);
  const blob = await toJpeg(canvas);
  return {
    id: makeId('p'),
    kind: 'print',
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    movieId: snap.movieId,
    title: snap.title,
    time: snap.time,
    timecode: snap.timecode,
    borderId: border.id,
    createdAt: Date.now(),
  };
}

/** Several snaps, each in its frame, stacked into a photostrip. */
export async function collagePrint(snaps, borderId, movie) {
  await ensureFrameFonts();
  const border = borderById(borderId);
  const framed = [];
  for (const snap of snaps) framed.push(await framedCanvas(snap, border, movie));
  const canvas = document.createElement('canvas');
  paintStrip(canvas.getContext('2d'), border, framed, { title: movie?.title ?? snaps[0].title, date: formatDate() });
  const blob = await toJpeg(canvas);
  return {
    id: makeId('s'),
    kind: 'strip',
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    movieId: snaps[0].movieId,
    title: snaps[0].title,
    time: snaps[0].time,
    timecode: `${snaps[0].timecode}–${snaps[snaps.length - 1].timecode}`,
    borderId: border.id,
    createdAt: Date.now(),
    parts: snaps.map((p) => p.id),
  };
}

export async function savePhoto(photo) {
  const { url, ...record } = photo;
  try {
    await idbSet(photo.id, record, photoStore());
    return true;
  } catch {
    return false;
  }
}

export async function deletePhoto(id) {
  try {
    await idbDel(id, photoStore());
  } catch {
    /* already gone */
  }
}

export async function loadPhotos() {
  try {
    const all = await idbValues(photoStore());
    return all
      .filter((p) => p && p.blob)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((p) => ({ ...p, url: URL.createObjectURL(p.blob) }));
  } catch {
    return [];
  }
}

export function photoFileName(photo) {
  const slug = (photo.title || 'photo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const tc = (photo.timecode || '').replace(/:/g, 'm');
  const kind = photo.kind === 'strip' ? '-strip' : photo.kind === 'snap' ? '-snap' : '';
  return `playbooth-${slug}${kind}${tc ? `-${tc.replace(/[^0-9m]/g, '')}` : ''}.jpg`;
}

export function downloadPhoto(photo) {
  const a = document.createElement('a');
  a.href = photo.url;
  a.download = photoFileName(photo);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function sharePhoto(photo) {
  const file = new File([photo.blob], photoFileName(photo), { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: `PLAYBOOTH: ${photo.title}` });
    return true;
  }
  return false;
}
