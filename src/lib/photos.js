import { createStore, set as idbSet, del as idbDel, values as idbValues } from 'idb-keyval';
import {
  borderById,
  ensureFrameFonts,
  formatDate,
  formatTimecode,
  frameLayout,
  paintComposite,
} from '../data/borders.js';

let store;
function photoStore() {
  if (!store) store = createStore('playbooth', 'photos');
  return store;
}

const MAX_WIDTH = 1600;

export class CaptureError extends Error {}

/**
 * Draw the current video frame inside the chosen frame and return a photo.
 * Needs a CORS-clean video (crossOrigin="anonymous" and CORS headers on the
 * media), otherwise the browser refuses to read the pixels back.
 */
export async function capturePhoto({ video, borderId, movie }) {
  if (!video || video.readyState < 2 || !video.videoWidth) {
    throw new CaptureError('The picture isn’t ready yet. Try again in a moment.');
  }
  await ensureFrameFonts();
  const border = borderById(borderId);
  const aspect = video.videoWidth / video.videoHeight;
  const units = 1 + border.pads.l + border.pads.r;
  const pxWidth = Math.min(MAX_WIDTH, Math.round(video.videoWidth * units));
  const L = frameLayout(border, aspect, pxWidth);
  const canvas = document.createElement('canvas');
  canvas.width = L.W;
  canvas.height = L.H;
  const ctx = canvas.getContext('2d');
  const time = video.currentTime;
  const meta = { title: movie?.title, date: formatDate(), timecode: formatTimecode(time) };
  paintComposite(ctx, border, L, meta, (c, win) => {
    c.drawImage(video, win.x, win.y, win.w, win.h);
  });

  let blob;
  try {
    blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('empty'))), 'image/jpeg', 0.92);
    });
  } catch {
    throw new CaptureError(
      'This browser won’t let the booth read this video’s pixels, so the photo couldn’t be saved.',
    );
  }

  const photo = {
    id: `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    blob,
    width: L.W,
    height: L.H,
    movieId: movie?.id ?? null,
    title: movie?.title ?? 'Untitled',
    time,
    timecode: meta.timecode,
    borderId: border.id,
    createdAt: Date.now(),
  };
  photo.url = URL.createObjectURL(blob);
  return photo;
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
  return `playbooth-${slug}${tc ? `-${tc}s` : ''}.jpg`;
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
