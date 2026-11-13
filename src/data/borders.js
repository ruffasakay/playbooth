/**
 * Photo frames. One painter draws each frame everywhere it appears:
 * the live preview on the deck screen, the 3D screen in the booth,
 * and the captured photo. That keeps the frame identical in all three.
 *
 * Sizes are fractions of the photo's width, so a frame scales with the photo.
 */

export const FONT_DISPLAY = 'DynaPuff';
export const FONT_TEXT = '"Atkinson Hyperlegible Next Variable", "Atkinson Hyperlegible Next", system-ui, sans-serif';
export const FONT_MONO = '"Atkinson Hyperlegible Mono", ui-monospace, monospace';

const C = {
  paper: '#fff7e8',
  ink: '#2a2140',
  cherry: '#b5294e',
  butter: '#f5cf5e',
  mint: '#7fcbb5',
  lilac: '#d6d9f7',
  periwinkle: '#5a5fc8',
  film: '#1e1a2b',
};

export const BORDERS = [
  {
    id: 'strip',
    name: 'Booth strip',
    hint: 'White paper with the PLAYBOOTH stamp',
    pads: { t: 0.05, r: 0.05, b: 0.19, l: 0.05 },
    radius: 0,
    swatch: [C.paper, C.cherry],
  },
  {
    id: 'film',
    name: 'Film reel',
    hint: 'Dark film with sprocket holes',
    pads: { t: 0.105, r: 0.025, b: 0.105, l: 0.025 },
    radius: 0.006,
    swatch: [C.film, C.lilac],
  },
  {
    id: 'candy',
    name: 'Cherry pop',
    hint: 'Cherry red with butter dots and round corners',
    pads: { t: 0.07, r: 0.07, b: 0.07, l: 0.07 },
    radius: 0.045,
    swatch: [C.cherry, C.butter],
  },
  {
    id: 'postcard',
    name: 'Postcard',
    hint: 'Airmail edge, a stamp and a greeting',
    pads: { t: 0.065, r: 0.065, b: 0.15, l: 0.065 },
    radius: 0,
    swatch: [C.paper, C.periwinkle],
  },
  {
    id: 'clean',
    name: 'Clean edge',
    hint: 'A thin ink line, nothing else',
    pads: { t: 0.016, r: 0.016, b: 0.016, l: 0.016 },
    radius: 0.012,
    swatch: [C.ink, C.paper],
  },
];

export const borderById = (id) => BORDERS.find((b) => b.id === id) ?? BORDERS[0];

/** Frame proportions for a photo of the given aspect, in photo-width units. */
export function frameUnits(border, aspect) {
  const { t, r, b, l } = border.pads;
  const W = 1 + l + r;
  const H = 1 / aspect + t + b;
  return { W, H, win: { x: l, y: t, w: 1, h: 1 / aspect } };
}

/** Window position as percentages of the frame box, for CSS placement. */
export function windowPercents(border, aspect) {
  const { W, H, win } = frameUnits(border, aspect);
  return {
    aspectRatio: W / H,
    left: (win.x / W) * 100,
    top: (win.y / H) * 100,
    width: (win.w / W) * 100,
    height: (win.h / H) * 100,
    radiusPct: ((border.radius || 0) / win.w) * 100,
  };
}

/** Pixel layout for a frame drawn `pxWidth` wide. */
export function frameLayout(border, aspect, pxWidth) {
  const units = frameUnits(border, aspect);
  const u = pxWidth / units.W; // pixels per photo width
  return {
    W: Math.round(units.W * u),
    H: Math.round(units.H * u),
    u,
    win: {
      x: units.win.x * u,
      y: units.win.y * u,
      w: units.win.w * u,
      h: units.win.h * u,
      r: (border.radius || 0) * u,
    },
  };
}

export function windowPath(ctx, win) {
  ctx.beginPath();
  if (win.r > 0 && ctx.roundRect) ctx.roundRect(win.x, win.y, win.w, win.h, win.r);
  else ctx.rect(win.x, win.y, win.w, win.h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function fitText(ctx, text, maxWidth, font, sizePx, minPx) {
  let size = sizePx;
  ctx.font = font.replace('{s}', `${size}px`);
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 1;
    ctx.font = font.replace('{s}', `${size}px`);
  }
  if (ctx.measureText(text).width > maxWidth) {
    let t = text;
    while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
    return `${t}…`;
  }
  return text;
}

/* ---------- painters ---------- */

function paintStripBack(ctx, L) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, L.W, L.H);
  // a whisper of tooth on the paper edge
  ctx.strokeStyle = 'rgb(42 33 64 / 0.08)';
  ctx.lineWidth = Math.max(1, L.u * 0.004);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, L.W - ctx.lineWidth, L.H - ctx.lineWidth);
}

function paintStripFront(ctx, L, meta) {
  const { u, win } = L;
  const baseY = win.y + win.h + (L.H - win.y - win.h) * 0.56;
  const pad = win.x;
  // wordmark
  ctx.fillStyle = C.cherry;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `700 ${Math.round(u * 0.058)}px ${FONT_DISPLAY}`;
  ctx.fillText('PLAYBOOTH', pad, baseY);
  // title and date
  ctx.textAlign = 'right';
  ctx.fillStyle = C.ink;
  const right = L.W - pad;
  const title = fitText(ctx, meta.title || '', win.w * 0.5, `700 {s} ${FONT_TEXT}`, Math.round(u * 0.034), 9);
  ctx.fillText(title, right, baseY - u * 0.02);
  ctx.font = `500 ${Math.round(u * 0.026)}px ${FONT_MONO}`;
  ctx.fillStyle = 'rgb(42 33 64 / 0.72)';
  ctx.fillText([meta.date, meta.timecode].filter(Boolean).join('  ·  '), right, baseY + u * 0.026);
}

function paintFilmBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = C.film;
  ctx.fillRect(0, 0, L.W, L.H);
  // sprocket holes along the top and bottom bands
  const holeW = u * 0.034;
  const holeH = u * 0.046;
  const gap = u * 0.072;
  const count = Math.floor(L.W / gap);
  const start = (L.W - (count - 1) * gap) / 2;
  ctx.fillStyle = C.lilac;
  for (const bandY of [win.y / 2, win.y + win.h + (L.H - win.y - win.h) / 2]) {
    for (let i = 0; i < count; i++) {
      roundRect(ctx, start + i * gap - holeW / 2, bandY - holeH / 2, holeW, holeH, holeW * 0.28);
      ctx.fill();
    }
  }
}

function paintFilmFront(ctx, L, meta) {
  const { u, win } = L;
  ctx.fillStyle = C.butter;
  ctx.font = `600 ${Math.round(u * 0.02)}px ${FONT_MONO}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.88;
  ctx.fillText('PLAYBOOTH 400', win.x + u * 0.01, y);
  ctx.textAlign = 'right';
  ctx.fillText(meta.timecode ? `▸ ${meta.timecode}` : '', L.W - win.x - u * 0.01, y);
}

function paintCandyBack(ctx, L) {
  const { u } = L;
  ctx.fillStyle = C.cherry;
  ctx.fillRect(0, 0, L.W, L.H);
  // butter dots on a loose grid
  ctx.fillStyle = C.butter;
  const step = u * 0.06;
  const r = u * 0.009;
  for (let y = step / 2, row = 0; y < L.H; y += step, row++) {
    for (let x = (row % 2 ? step : step / 2); x < L.W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function star(ctx, cx, cy, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 ? inner : outer;
    const a = (Math.PI / points) * i - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
}

function paintCandyFront(ctx, L) {
  const { u, win } = L;
  // a sticker star peeking over the top-left corner of the photo
  const cx = win.x + u * 0.02;
  const cy = win.y + u * 0.02;
  ctx.save();
  ctx.shadowColor = 'rgb(42 33 64 / 0.25)';
  ctx.shadowBlur = u * 0.01;
  ctx.shadowOffsetY = u * 0.004;
  ctx.fillStyle = C.paper;
  star(ctx, cx, cy, u * 0.058, u * 0.032);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = C.butter;
  star(ctx, cx, cy, u * 0.044, u * 0.023);
  ctx.fill();
}

function paintPostcardBack(ctx, L) {
  const { u } = L;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, L.W, L.H);
  // airmail edge: diagonal stripes in a band around the card
  const band = u * 0.022;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, L.W, L.H);
  ctx.rect(band, band, L.W - band * 2, L.H - band * 2);
  ctx.clip('evenodd');
  const stripe = u * 0.03;
  for (let i = -L.H, k = 0; i < L.W + L.H; i += stripe, k++) {
    ctx.fillStyle = k % 2 ? C.cherry : C.periwinkle;
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripe, 0);
    ctx.lineTo(i + stripe - L.H, L.H);
    ctx.lineTo(i - L.H, L.H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function paintPostcardFront(ctx, L, meta) {
  const { u, win } = L;
  // stamp overlapping the top-right corner of the photo
  const sw = u * 0.13;
  const sh = u * 0.155;
  const sx = win.x + win.w - sw * 0.78;
  const sy = win.y - sh * 0.22;
  ctx.save();
  ctx.translate(sx + sw / 2, sy + sh / 2);
  ctx.rotate(0.06);
  ctx.translate(-sw / 2, -sh / 2);
  ctx.shadowColor = 'rgb(42 33 64 / 0.22)';
  ctx.shadowBlur = u * 0.012;
  ctx.shadowOffsetY = u * 0.004;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, sw, sh);
  ctx.shadowColor = 'transparent';
  // perforations
  ctx.fillStyle = C.paper;
  const pr = u * 0.0075;
  ctx.globalCompositeOperation = 'destination-out';
  for (let x = pr * 2; x < sw; x += pr * 3) {
    ctx.beginPath(); ctx.arc(x, 0, pr, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, sh, pr, 0, Math.PI * 2); ctx.fill();
  }
  for (let y = pr * 2; y < sh; y += pr * 3) {
    ctx.beginPath(); ctx.arc(0, y, pr, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(sw, y, pr, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // stamp art: a tiny booth with its curtain
  const ix = sw * 0.14;
  const iy = sh * 0.12;
  const iw = sw * 0.72;
  const ih = sh * 0.76;
  ctx.fillStyle = C.mint;
  ctx.fillRect(ix, iy, iw, ih);
  ctx.fillStyle = C.butter;
  ctx.fillRect(ix + iw * 0.2, iy + ih * 0.32, iw * 0.6, ih * 0.6);
  ctx.fillStyle = C.cherry;
  ctx.fillRect(ix + iw * 0.14, iy + ih * 0.18, iw * 0.72, ih * 0.16);
  ctx.fillStyle = C.ink;
  ctx.fillRect(ix + iw * 0.38, iy + ih * 0.52, iw * 0.24, ih * 0.4);
  ctx.restore();

  // greeting
  ctx.fillStyle = C.ink;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.5;
  const text = fitText(
    ctx,
    `Greetings from ${meta.title || 'the booth'}`,
    win.w * 0.72,
    `700 {s} ${FONT_DISPLAY}`,
    Math.round(u * 0.046),
    10,
  );
  ctx.fillText(text, win.x, y);
  ctx.textAlign = 'right';
  ctx.font = `500 ${Math.round(u * 0.024)}px ${FONT_MONO}`;
  ctx.fillStyle = 'rgb(42 33 64 / 0.72)';
  ctx.fillText(meta.date || '', win.x + win.w, y);
}

function paintCleanBack(ctx, L) {
  ctx.fillStyle = C.ink;
  roundRect(ctx, 0, 0, L.W, L.H, L.win.r + L.win.x);
  ctx.fill();
}

const PAINTERS = {
  strip: [paintStripBack, paintStripFront],
  film: [paintFilmBack, paintFilmFront],
  candy: [paintCandyBack, paintCandyFront],
  postcard: [paintPostcardBack, paintPostcardFront],
  clean: [paintCleanBack, () => {}],
};

export function paintBack(ctx, border, L, meta = {}) {
  PAINTERS[border.id][0](ctx, L, meta);
}

export function paintFront(ctx, border, L, meta = {}) {
  ctx.save();
  PAINTERS[border.id][1](ctx, L, meta);
  ctx.restore();
}

/** Frame with a transparent window, for laying over live video. */
export function paintOverlay(ctx, border, L, meta) {
  ctx.clearRect(0, 0, L.W, L.H);
  paintBack(ctx, border, L, meta);
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  windowPath(ctx, L.win);
  ctx.fill();
  ctx.restore();
  paintFront(ctx, border, L, meta);
}

/** Full composite with a picture (video frame, poster) inside the window. */
export function paintComposite(ctx, border, L, meta, drawPicture) {
  ctx.clearRect(0, 0, L.W, L.H);
  paintBack(ctx, border, L, meta);
  ctx.save();
  windowPath(ctx, L.win);
  ctx.clip();
  ctx.fillStyle = '#000';
  ctx.fillRect(L.win.x, L.win.y, L.win.w, L.win.h);
  drawPicture(ctx, L.win);
  ctx.restore();
  paintFront(ctx, border, L, meta);
}

export function formatTimecode(seconds) {
  if (!Number.isFinite(seconds)) return '';
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

export function formatDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

let fontsReady;
export function ensureFrameFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all([
      document.fonts.load(`700 24px ${FONT_DISPLAY}`),
      document.fonts.load(`700 24px "Atkinson Hyperlegible Next Variable"`),
      document.fonts.load(`500 24px "Atkinson Hyperlegible Mono"`),
      document.fonts.load(`600 24px "Atkinson Hyperlegible Mono"`),
    ]).catch(() => {});
  }
  return fontsReady;
}
