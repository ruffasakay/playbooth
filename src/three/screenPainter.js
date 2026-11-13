import * as THREE from 'three';
import {
  FONT_DISPLAY,
  FONT_TEXT,
  borderById,
  formatDate,
  frameLayout,
  paintOverlay,
} from '../data/borders.js';
import { PAL } from './world.js';

/**
 * Paints the booth's 3D screen. The same <video> element that Video.js
 * controls is drawn here, inside the chosen frame, so the screen in the room
 * always shows what the deck is playing.
 */
export class ScreenPainter {
  constructor(width = 1024, height = 576) {
    this.width = width;
    this.height = height;
    this.canvas = this.makeCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.tainted = false;
    this.overlay = null;
    this.overlayKey = '';
  }

  makeCanvas() {
    const c = document.createElement('canvas');
    c.width = this.width;
    c.height = this.height;
    return c;
  }

  /** A canvas that once held cross-origin pixels can never be read again. */
  resetCanvas() {
    this.canvas = this.makeCanvas();
    this.ctx = this.canvas.getContext('2d');
    this.texture.image = this.canvas;
    this.texture.needsUpdate = true;
  }

  glass() {
    const { ctx, width: w, height: h } = this;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#2b2545');
    g.addColorStop(1, '#16121f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  sheen() {
    const { ctx, width: w, height: h } = this;
    const g = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, w * 0.8);
    g.addColorStop(0, 'rgba(255,255,255,0.10)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  paintIdle(time, holding) {
    const { ctx, width: w, height: h } = this;
    this.glass();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PAL.butter;
    ctx.font = `700 64px ${FONT_DISPLAY}`;
    ctx.fillText('PLAYBOOTH', w / 2, h * 0.36);
    ctx.fillStyle = PAL.paper;
    ctx.font = `700 38px ${FONT_TEXT}`;
    ctx.fillText(holding ? 'Slide the tape into the slot below' : 'Pick a tape from the cabinet', w / 2, h * 0.55);
    // arrow pointing down at the slot, bobbing
    const bob = Math.sin(time * 3) * 8;
    ctx.fillStyle = holding ? PAL.mint : 'rgba(255,247,232,0.5)';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 34, h * 0.72 + bob);
    ctx.lineTo(w / 2 + 34, h * 0.72 + bob);
    ctx.lineTo(w / 2, h * 0.84 + bob);
    ctx.closePath();
    ctx.fill();
    this.sheen();
  }

  paintReading(time, movie) {
    const { ctx, width: w, height: h } = this;
    this.glass();
    const cy = h * 0.42;
    for (const dx of [-120, 120]) {
      ctx.save();
      ctx.translate(w / 2 + dx, cy);
      ctx.rotate(time * 3.2);
      ctx.fillStyle = PAL.paper;
      ctx.beginPath();
      ctx.arc(0, 0, 78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2b2545';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 44, Math.sin(a) * 44, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = PAL.butter;
    ctx.font = `700 40px ${FONT_TEXT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const dots = '.'.repeat(1 + (Math.floor(time * 3) % 3));
    ctx.fillText(`Reading ${movie?.title ?? 'tape'}${dots}`, w / 2, h * 0.8);
    this.sheen();
  }

  overlayFor(border, aspect, movie, layoutW) {
    const key = `${border.id}|${aspect.toFixed(3)}|${movie?.id}|${layoutW}`;
    if (key !== this.overlayKey) {
      const L = frameLayout(border, aspect, layoutW);
      const c = document.createElement('canvas');
      c.width = L.W;
      c.height = L.H;
      paintOverlay(c.getContext('2d'), border, L, { title: movie?.title, date: formatDate(), timecode: '' });
      this.overlay = { canvas: c, L };
      this.overlayKey = key;
    }
    return this.overlay;
  }

  paintShow({ video, borderId, aspect, movie }) {
    const { ctx, width: w, height: h } = this;
    this.glass();
    const border = borderById(borderId);
    // fit the framed photo inside the 16:9 screen
    const probe = frameLayout(border, aspect, 1000);
    const scale = Math.min((w * 0.94) / probe.W, (h * 0.92) / probe.H);
    const layoutW = Math.round(probe.W * scale);
    const { canvas: overlay, L } = this.overlayFor(border, aspect, movie, layoutW);
    const ox = Math.round((w - L.W) / 2);
    const oy = Math.round((h - L.H) / 2);
    const win = L.win;

    ctx.fillStyle = '#000';
    ctx.fillRect(ox + win.x, oy + win.y, win.w, win.h);
    const ready = video && video.readyState >= 2 && video.videoWidth > 0;
    if (ready && !this.tainted) {
      ctx.drawImage(video, ox + win.x, oy + win.y, win.w, win.h);
      try {
        ctx.getImageData(ox + win.x + 2, oy + win.y + 2, 1, 1);
      } catch {
        // Cross-origin pixels without CORS: start over and stop drawing video.
        this.tainted = true;
        this.resetCanvas();
        this.paintShow({ video: null, borderId, aspect, movie });
        return;
      }
    } else {
      ctx.fillStyle = movie?.colors?.shell ?? PAL.cherry;
      ctx.fillRect(ox + win.x, oy + win.y, win.w, win.h);
      ctx.fillStyle = PAL.paper;
      ctx.font = `700 ${Math.round(win.h * 0.12)}px ${FONT_DISPLAY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(movie?.title ?? '', ox + win.x + win.w / 2, oy + win.y + win.h / 2);
    }
    ctx.drawImage(overlay, ox, oy);
    this.sheen();
  }
}
