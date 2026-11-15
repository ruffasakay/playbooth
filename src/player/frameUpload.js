import { useApp } from '../store.js';
import { setCustomBorder } from '../data/borders.js';

/** The picture's average colour, so the keys' dock matches it. */
export function averageTone(image) {
  try {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(image, 0, 0, 16, 16);
    const d = g.getImageData(0, 0, 16, 16).data;
    let r = 0;
    let gr = 0;
    let b = 0;
    for (let i = 0; i < d.length; i += 4) {
      r += d[i];
      gr += d[i + 1];
      b += d[i + 2];
    }
    const n = d.length / 4;
    const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');
    return `#${hex(r)}${hex(gr)}${hex(b)}`;
  } catch {
    return null;
  }
}

/**
 * Read a picture someone chose and check it can be a frame: a landscape
 * picture (wider than it is tall). Resolves to { image, url, tone } or to
 * { error } with the reason, in words for the person who chose it.
 */
export async function readFramePicture(file) {
  if (!file || !file.type.startsWith('image/')) return { error: 'That file isn’t a picture. Choose a JPG, PNG or WebP.' };
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(url);
    return { error: 'That picture could not be opened.' };
  }
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  if (w <= h) {
    URL.revokeObjectURL(url);
    useApp.getState().announce('A frame picture has to be landscape.');
    return { error: `That picture is ${w} × ${h}, ${w === h ? 'square' : 'upright'}. Choose a landscape one: wider than it is tall.` };
  }
  return { image, url, tone: averageTone(image) };
}

/** The simplest use: the picture becomes "Your frame" at once (an embedded player). Returns the reason it didn't, or ''. */
export async function useFramePicture(file) {
  const r = await readFramePicture(file);
  if (r.error) return r.error;
  setCustomBorder({ image: r.image, mode: 'fit', pad: 0.06, tone: r.tone });
  useApp.setState((s) => ({ borderId: 'custom', borderRev: s.borderRev + 1 }));
  useApp.getState().announce('Your frame is on.');
  return '';
}
