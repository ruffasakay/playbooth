import * as THREE from 'three';
import { FONT_MONO, FONT_SERIF, ensureFrameFonts } from '../data/borders.js';
import { wrapLines } from './canvasTexture.js';

/**
 * Tape covers: the art above, fading softly into a cream title band with the
 * film's name, a teal rule, the year and the studio. The art is the film's
 * official poster (movies.js `cover`), its top kept and its own colours, so
 * the long billing block at its foot falls below the fold; without a poster,
 * a still from Mux with a warm print treatment.
 */
const W = 512;
const H = 864;
const covers = new Map();

export function coverUrl(movie, width = 512) {
  if (movie.cover) return movie.cover;
  if (!movie.playbackId) return null;
  return `https://image.mux.com/${movie.playbackId}/thumbnail.jpg?time=${movie.coverTime ?? 30}&width=${width}&fit_mode=smartcrop&height=${Math.round(width * 1.18)}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function paint(ctx, movie, img) {
  const poster = !!(img && movie.cover);
  const artH = H * 0.7;
  ctx.fillStyle = '#2b221b';
  ctx.fillRect(0, 0, W, H);
  if (img) {
    // cover-fit the still into the art area, warmed and softened like an old print
    const s = Math.max(W / img.width, artH / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    ctx.save();
    // a poster keeps its own colours and its top (the art); a still gets the warm print treatment, centred
    ctx.filter = poster ? 'none' : 'sepia(0.22) saturate(0.88) contrast(1.04) brightness(1.03)';
    ctx.drawImage(img, (W - dw) / 2, poster ? 0 : (artH - dh) / 2, dw, dh);
    ctx.restore();
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, artH);
    g.addColorStop(0, movie.colors?.shell ?? '#5a483a');
    g.addColorStop(1, '#2b221b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, artH);
    ctx.fillStyle = 'rgb(244 237 224 / 0.16)';
    ctx.font = `300px ${FONT_SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(movie.title[0], W / 2, artH / 2);
  }
  // halftone grain over a still (a poster is left clean)
  if (!poster) {
    ctx.fillStyle = 'rgb(40 25 15 / 0.07)';
    for (let y = 0; y < artH; y += 5) for (let x = (y / 5) % 2 ? 2.5 : 0; x < W; x += 5) ctx.fillRect(x, y, 1.6, 1.6);
  }
  // a long, eased fade into the title band, so the art's lower edge never shows as a line
  const FADE = 170;
  const fade = ctx.createLinearGradient(0, artH - FADE, 0, artH + 2);
  [[0, 0], [0.25, 0.08], [0.5, 0.3], [0.72, 0.62], [0.88, 0.88], [1, 1]].forEach(([at, a]) => fade.addColorStop(at, `rgb(239 228 207 / ${a})`));
  ctx.fillStyle = fade;
  ctx.fillRect(0, artH - FADE, W, FADE + 2);
  // title band
  ctx.fillStyle = '#efe4cf';
  ctx.fillRect(0, artH, W, H - artH);
  ctx.fillStyle = '#3c8a78';
  ctx.fillRect(28, artH + 26, 64, 6);
  ctx.fillStyle = '#33261c';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `600 62px ${FONT_SERIF}`;
  const lines = wrapLines(ctx, movie.title, W - 56, 2);
  lines.forEach((l, i) => ctx.fillText(l, 28, artH + 98 + i * 60));
  ctx.font = `24px ${FONT_MONO}`;
  ctx.fillStyle = 'rgb(51 38 28 / 0.72)';
  ctx.fillText(`${movie.year ?? ''}  ${movie.studio ?? 'Blender Studio'}`, 28, H - 34);
  // the plastic sleeve's inner edge
  ctx.strokeStyle = 'rgb(255 255 255 / 0.25)';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, W - 16, H - 16);
}

/** Shared cover texture for a movie; repaints when fonts and the still arrive. */
export function coverTexture(movie) {
  if (covers.has(movie.id)) return covers.get(movie.id);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.userData.canvas = canvas;
  covers.set(movie.id, tex);
  paint(ctx, movie, null);
  tex.needsUpdate = true;
  ensureFrameFonts().then(() => {
    paint(ctx, movie, null);
    tex.needsUpdate = true;
    const url = coverUrl(movie);
    if (!url) return;
    loadImage(url)
      .then((img) => {
        paint(ctx, movie, img);
        tex.needsUpdate = true;
      })
      .catch(() => {});
  });
  return tex;
}

export const COVER_ASPECT = W / H;

/* ---------- the rest of the case: back, spine and edges ---------- */

function mark(ctx, x, y, h, ink, accent) {
  const w = h * 0.44;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(2, h * 0.05);
  ctx.strokeRect(x, y, w, h);
  [0.1, 0.395, 0.69].forEach((f, i) => {
    ctx.fillStyle = i === 1 ? accent : ink;
    ctx.fillRect(x + w * 0.2, y + h * f, w * 0.6, h * 0.21);
  });
  ctx.restore();
}

function stripes(ctx, x, y, w, h, vertical) {
  const cols = ['#9e4330', '#d2a24c', '#3c8a78'];
  cols.forEach((c, i) => {
    ctx.fillStyle = c;
    if (vertical) ctx.fillRect(x + (w / 3) * i, y, w / 3 + 0.5, h);
    else ctx.fillRect(x, y + (h / 3) * i, w, h / 3 + 0.5);
  });
}

const backs = new Map();
/** The back of the case: the booth's label, three stripes, the film's line. */
export function backTexture(movie) {
  if (backs.has(movie.id)) return backs.get(movie.id);
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#2b221b';
    ctx.fillRect(0, 0, W, H);
    // fine ribbing, like the plastic
    ctx.fillStyle = 'rgb(255 255 255 / 0.035)';
    for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2);
    stripes(ctx, 0, 120, W, 54, false);
    // the label: 40 px in from the case's edges, everything set 30 px inside it
    const L = 40;
    const R = W - 40;
    const pad = 30;
    ctx.fillStyle = '#efe4cf';
    ctx.fillRect(L, 230, R - L, 470);
    const markH = 104;
    mark(ctx, L + pad, 262, markH, '#33261c', '#9e4330');
    const tx = L + pad + markH * 0.44 + 20; // the name starts a fifth of the mark's height after it
    const room = R - pad - tx;
    ctx.fillStyle = '#33261c';
    ctx.textBaseline = 'alphabetic';
    let size = 52;
    ctx.font = `600 ${size}px ${FONT_SERIF}`;
    while (ctx.measureText('PLAYBOOTH').width > room && size > 24) {
      size -= 1;
      ctx.font = `600 ${size}px ${FONT_SERIF}`;
    }
    ctx.fillText('PLAYBOOTH', tx, 262 + markH * 0.52 + size * 0.36);
    let tag = 22;
    ctx.font = `${tag}px ${FONT_MONO}`;
    while (ctx.measureText('a photobooth for films').width > room && tag > 14) {
      tag -= 1;
      ctx.font = `${tag}px ${FONT_MONO}`;
    }
    ctx.fillStyle = 'rgb(51 38 28 / 0.7)';
    ctx.fillText('a photobooth for films', tx + 2, 262 + markH * 0.52 + size * 0.36 + tag + 14);
    ctx.fillStyle = '#3c8a78';
    ctx.fillRect(L + pad, 420, 72, 5);
    ctx.fillStyle = '#33261c';
    ctx.font = `600 40px ${FONT_SERIF}`;
    wrapLines(ctx, movie.title, R - L - pad * 2, 2).forEach((l, i) => ctx.fillText(l, L + pad, 480 + i * 44));
    ctx.font = `21px ${FONT_MONO}`;
    ctx.fillStyle = 'rgb(51 38 28 / 0.72)';
    ctx.fillText(`${movie.year ?? ''}  ${movie.genre ?? ''}`.trim(), L + pad, 590);
    ctx.fillText(movie.studio ?? 'Blender Studio', L + pad, 624);
    ctx.fillText('play  ·  snap  ·  print', L + pad, 666);
    // barcode
    let bx = W - 200;
    for (let i = 0; i < 30; i++) {
      const bw = i % 3 === 0 ? 4 : 2;
      ctx.fillStyle = '#efe4cf';
      ctx.fillRect(bx, H - 110, bw, 60);
      bx += bw + 2.5;
    }
    mark(ctx, 60, H - 116, 72, '#efe4cf', '#cf6a4c');
    tex.needsUpdate = true;
  };
  draw();
  ensureFrameFonts().then(draw);
  backs.set(movie.id, tex);
  return tex;
}

const spines = new Map();
/** The spine: a cream label with the title running up it and the mark on top. */
export function spineTexture(movie) {
  if (spines.has(movie.id)) return spines.get(movie.id);
  const SW = 128;
  const SH = 1024;
  const c = document.createElement('canvas');
  c.width = SW;
  c.height = SH;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const draw = () => {
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#efe4cf';
    ctx.fillRect(0, 0, SW, SH);
    ctx.fillStyle = movie.colors?.shell ?? '#3c8a78';
    ctx.fillRect(0, 0, SW, 150);
    mark(ctx, SW / 2 - 22, 28, 100, '#efe4cf', '#33261c');
    stripes(ctx, 0, SH - 110, SW, 110, false);
    ctx.save();
    ctx.translate(SW / 2 + 16, SH - 140);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#33261c';
    ctx.textBaseline = 'alphabetic';
    let size = 54;
    ctx.font = `600 ${size}px ${FONT_SERIF}`;
    while (ctx.measureText(movie.title).width > SH - 330 && size > 26) {
      size -= 2;
      ctx.font = `600 ${size}px ${FONT_SERIF}`;
    }
    ctx.fillText(movie.title, 0, 0);
    ctx.restore();
    tex.needsUpdate = true;
  };
  draw();
  ensureFrameFonts().then(draw);
  spines.set(movie.id, tex);
  return tex;
}

let edgeTex = null;
/** Top, bottom and the far side: the three stripes and a row of marks. */
export function edgeTexture() {
  if (edgeTex) return edgeTex;
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2b221b';
  ctx.fillRect(0, 0, 1024, 128);
  stripes(ctx, 0, 34, 1024, 60, false);
  for (let x = 40; x < 1024; x += 200) mark(ctx, x, 40, 48, '#efe4cf', '#33261c');
  edgeTex = new THREE.CanvasTexture(c);
  edgeTex.colorSpace = THREE.SRGBColorSpace;
  edgeTex.anisotropy = 4;
  return edgeTex;
}

/* ---------- the films' posters, whole, for the walls ---------- */

export const POSTER_ASPECT = 0.707; // every Blender Studio one-sheet here is 1 : 1.414
const posters = new Map();
const posterLoader = new THREE.TextureLoader();
/** The film's official poster as a texture (shared, loaded once), or null when the film has none. */
export function posterTexture(movie) {
  if (!movie?.cover) return null;
  if (posters.has(movie.id)) return posters.get(movie.id);
  const tex = posterLoader.load(movie.cover);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  posters.set(movie.id, tex);
  return tex;
}
