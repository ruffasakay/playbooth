import * as THREE from 'three';
import { FONT_MONO, FONT_SERIF, ensureFrameFonts } from '../data/borders.js';
import { wrapLines } from './canvasTexture.js';

/**
 * Tape covers. The art is a frame from the film itself, served by Mux's
 * image API, given a warm print treatment with the title set below it.
 * A `cover` URL in movies.js (an official poster in public/covers) wins.
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
  const artH = H * 0.7;
  ctx.fillStyle = '#2b221b';
  ctx.fillRect(0, 0, W, H);
  if (img) {
    // cover-fit the still into the art area, warmed and softened like an old print
    const s = Math.max(W / img.width, artH / img.height);
    const dw = img.width * s;
    const dh = img.height * s;
    ctx.save();
    ctx.filter = 'sepia(0.22) saturate(0.88) contrast(1.04) brightness(1.03)';
    ctx.drawImage(img, (W - dw) / 2, (artH - dh) / 2, dw, dh);
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
  // halftone grain over the art
  ctx.fillStyle = 'rgb(40 25 15 / 0.07)';
  for (let y = 0; y < artH; y += 5) for (let x = (y / 5) % 2 ? 2.5 : 0; x < W; x += 5) ctx.fillRect(x, y, 1.6, 1.6);
  // soft fade into the title band
  const fade = ctx.createLinearGradient(0, artH - 60, 0, artH);
  fade.addColorStop(0, 'rgb(239 228 207 / 0)');
  fade.addColorStop(1, 'rgb(239 228 207 / 0.9)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, artH - 60, W, 60);
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
  ctx.fillText(`${movie.year ?? ''}  Blender Foundation`, 28, H - 34);
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
