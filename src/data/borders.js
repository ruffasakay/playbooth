/**
 * Photo frames. One painter draws each frame everywhere it appears:
 * around the playing video, on the booth's television, in captured photos
 * and in photostrips. Sizes are fractions of the photo's width.
 */

export const FONT_SERIF = '"Fraunces Variable", Fraunces, Georgia, serif';
export const FONT_MONO = '"DM Mono", ui-monospace, "SF Mono", Menlo, monospace';
export const FONT_HAND = 'Caveat, "Segoe Print", cursive';

const C = {
  paper: '#f6f1e7',
  cream: '#efe4cf',
  ink: '#33261c',
  inkSoft: 'rgb(51 38 28 / 0.62)',
  lace: '#f5ebe7',
  wood: '#4a3125',
  woodLine: '#3a261c',
  stamp: '#8c2a22',
  burgundy: '#6b2024',
  linen: '#ece3d3',
  stripe: '#7b5a42',
  terracotta: '#9e4330',
};

export const BORDERS = [
  {
    id: 'none',
    name: 'No frame',
    hint: 'Just the film, edge to edge.',
    pads: { t: 0, r: 0, b: 0, l: 0 },
    radius: 0,
    swatch: ['#1c140f', '#1c140f'],
    strip: { bg: '#f6f1e7', ink: '#33261c' },
  },
  {
    id: 'booth',
    name: 'Booth white',
    hint: 'The plain white edge of a real photobooth print, stamped at the bottom.',
    pads: { t: 0.04, r: 0.04, b: 0.085, l: 0.04 },
    radius: 0,
    swatch: ['#f6f1e7', '#d8d0c3'],
    strip: { bg: '#f6f1e7', ink: C.ink },
  },
  {
    id: 'instant',
    name: 'Instant photo',
    hint: 'A thick white bottom edge with the film written on it by hand.',
    pads: { t: 0.055, r: 0.055, b: 0.24, l: 0.055 },
    radius: 0,
    swatch: ['#f7f4ee', '#33261c'],
    strip: { bg: '#e9e0cf', ink: '#33261c' },
  },
  {
    id: 'lace',
    name: 'Lace',
    hint: 'A cotton lace doily laid on a dark wooden table.',
    pads: { t: 0.085, r: 0.085, b: 0.085, l: 0.085 },
    radius: 0,
    swatch: ['#4a3125', '#f5ebe7'],
    strip: { bg: C.wood, ink: '#f5ebe7', wood: true },
  },
  {
    id: 'stamp',
    name: 'Postage stamp',
    hint: 'Deep red with a perforated edge, like a stamp torn from its sheet.',
    pads: { t: 0.06, r: 0.06, b: 0.06, l: 0.06 },
    radius: 0,
    swatch: ['#8c2a22', '#f6f1e7'],
    strip: { bg: '#f1ebe0', ink: C.ink },
  },
  {
    id: 'ticket',
    name: 'Cinema ticket',
    hint: 'A cream admission ticket with a numbered stub.',
    pads: { t: 0.055, r: 0.055, b: 0.15, l: 0.055 },
    radius: 0,
    swatch: ['#efe4cf', '#33261c'],
    strip: { bg: '#2e231b', ink: '#efe4cf' },
  },
  {
    id: 'negative',
    name: 'Film negative',
    hint: 'Amber film base, sprocket holes and edge printing.',
    pads: { t: 0.1, r: 0.03, b: 0.1, l: 0.03 },
    radius: 0.006,
    swatch: ['#3a2416', '#e08a3c'],
    strip: { bg: '#2a1d14', ink: '#e8b27a' },
  },
  {
    id: 'kraft',
    name: 'Kraft stitch',
    hint: 'Brown kraft paper with a cream thread stitched around the picture.',
    pads: { t: 0.07, r: 0.07, b: 0.07, l: 0.07 },
    radius: 0,
    swatch: ['#b48a5c', '#f1e3c6'],
    strip: { bg: '#b48a5c', ink: '#33261c' },
  },
  {
    id: 'gingham',
    name: 'Gingham',
    hint: 'A terracotta and cream picnic check.',
    pads: { t: 0.065, r: 0.065, b: 0.065, l: 0.065 },
    radius: 0.018,
    swatch: ['#c97a62', '#f4ede0'],
    strip: { bg: '#f4ede0', ink: '#33261c' },
  },
  {
    id: 'washi',
    name: 'Washi tape',
    hint: 'Pinned to paper with two strips of teal tape.',
    pads: { t: 0.07, r: 0.07, b: 0.07, l: 0.07 },
    radius: 0,
    swatch: ['#f4ede0', '#3c8a78'],
    strip: { bg: '#e9e0cf', ink: '#33261c' },
  },
  {
    id: 'receipt',
    name: 'Konbini receipt',
    hint: 'Printed on a corner shop’s thermal paper, torn at both ends.',
    pads: { t: 0.07, r: 0.05, b: 0.2, l: 0.05 },
    radius: 0,
    swatch: ['#fbfaf6', '#6b6259'],
    strip: { bg: '#e9e0cf', ink: '#33261c' },
  },
  {
    id: 'polka',
    name: 'Red polka',
    hint: 'Burgundy with small cream dots and softened corners.',
    pads: { t: 0.06, r: 0.06, b: 0.06, l: 0.06 },
    radius: 0.03,
    swatch: ['#6b2024', '#efe4cf'],
    strip: { bg: '#f1ebe0', ink: C.ink },
  },
  {
    id: 'stripe',
    name: 'Linen stripe',
    hint: 'Pale linen with fine brown pinstripes and a little oval label.',
    pads: { t: 0.055, r: 0.055, b: 0.055, l: 0.055 },
    radius: 0.022,
    swatch: ['#ece3d3', '#7b5a42'],
    strip: { bg: '#ece3d3', ink: C.ink, stripes: true },
  },
];

export const borderById = (id) => BORDERS.find((b) => b.id === id) ?? BORDERS[0];

export function frameUnits(border, aspect) {
  const { t, r, b, l } = border.pads;
  return { W: 1 + l + r, H: 1 / aspect + t + b, win: { x: l, y: t, w: 1, h: 1 / aspect } };
}

/** Window placement as percentages of the frame box, for CSS. */
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

export function frameLayout(border, aspect, pxWidth) {
  const units = frameUnits(border, aspect);
  const u = pxWidth / units.W;
  return {
    W: Math.round(units.W * u),
    H: Math.round(units.H * u),
    u,
    win: { x: units.win.x * u, y: units.win.y * u, w: units.win.w * u, h: units.win.h * u, r: (border.radius || 0) * u },
  };
}

export function windowPath(ctx, win) {
  ctx.beginPath();
  if (win.r > 0 && ctx.roundRect) ctx.roundRect(win.x, win.y, win.w, win.h, win.r);
  else ctx.rect(win.x, win.y, win.w, win.h);
}

function fitText(ctx, text, maxWidth, font, sizePx, minPx) {
  let size = sizePx;
  ctx.font = font.replace('{s}', `${size}px`);
  while (ctx.measureText(text).width > maxWidth && size > minPx) {
    size -= 1;
    ctx.font = font.replace('{s}', `${size}px`);
  }
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

function woodGrain(ctx, x, y, w, h, scale) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = C.wood;
  ctx.fillRect(x, y, w, h);
  const plank = Math.max(40, scale * 0.22);
  for (let px = x, i = 0; px < x + w; px += plank, i++) {
    ctx.fillStyle = i % 2 ? 'rgb(255 230 200 / 0.03)' : 'rgb(0 0 0 / 0.05)';
    ctx.fillRect(px, y, plank, h);
    ctx.fillStyle = 'rgb(20 10 5 / 0.35)';
    ctx.fillRect(px, y, Math.max(1, scale * 0.002), h);
    ctx.strokeStyle = 'rgb(20 10 5 / 0.12)';
    ctx.lineWidth = Math.max(1, scale * 0.0015);
    for (let g = 0; g < 5; g++) {
      const gx = px + plank * (0.15 + g * 0.17);
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.bezierCurveTo(gx + plank * 0.05, y + h * 0.35, gx - plank * 0.04, y + h * 0.65, gx + plank * 0.02, y + h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* ---------- painters: back (under the photo) and front (over it) ---------- */

function boothBack(ctx, L) {
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgb(51 38 28 / 0.08)';
  ctx.lineWidth = Math.max(1, L.u * 0.002);
  ctx.strokeRect(L.win.x - 0.5, L.win.y - 0.5, L.win.w + 1, L.win.h + 1);
}

function boothFront(ctx, L, meta) {
  const { u, win } = L;
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.52;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.font = `${Math.round(u * 0.03)}px ${FONT_SERIF}`;
  ctx.fillText('PLAYBOOTH', win.x, y);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.inkSoft;
  const line = [meta.title, meta.date].filter(Boolean).join('   ');
  ctx.fillText(fitText(ctx, line, win.w * 0.6, `{s} ${FONT_MONO}`, Math.round(u * 0.022), 8), win.x + win.w, y);
}

function laceLayer(L) {
  const { u, win, W, H } = L;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const inset = u * 0.012;
  const scR = u * 0.022; // scallop radius
  // solid lace band
  g.fillStyle = C.lace;
  g.fillRect(inset + scR, inset + scR, W - (inset + scR) * 2, H - (inset + scR) * 2);
  // scalloped outer edge
  const edge = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / (scR * 1.9)));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      g.beginPath();
      g.arc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, scR, 0, Math.PI * 2);
      g.fill();
    }
  };
  const a = inset + scR;
  edge(a, a, W - a, a);
  edge(a, H - a, W - a, H - a);
  edge(a, a, a, H - a);
  edge(W - a, a, W - a, H - a);

  g.globalCompositeOperation = 'destination-out';
  // eyelet in every scallop
  const eyelets = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / (scR * 1.9)));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      g.beginPath();
      g.arc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, scR * 0.32, 0, Math.PI * 2);
      g.fill();
    }
  };
  eyelets(a, a, W - a, a);
  eyelets(a, H - a, W - a, H - a);
  eyelets(a, a, a, H - a);
  eyelets(W - a, a, W - a, H - a);

  // net of small holes through the band, leaving a solid rim around the photo
  const rim = u * 0.01;
  const holeR = u * 0.0042;
  const step = u * 0.0145;
  const inner = { x: win.x - rim, y: win.y - rim, w: win.w + rim * 2, h: win.h + rim * 2 };
  const bandOuter = a + scR * 0.9;
  for (let y = bandOuter, row = 0; y < H - bandOuter; y += step * 0.87, row++) {
    for (let x = bandOuter + (row % 2 ? step / 2 : 0); x < W - bandOuter; x += step) {
      if (x > inner.x - holeR * 2 && x < inner.x + inner.w + holeR * 2 && y > inner.y - holeR * 2 && y < inner.y + inner.h + holeR * 2) continue;
      g.beginPath();
      g.arc(x, y, holeR, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.globalCompositeOperation = 'source-over';

  // flowers sewn into the net
  const flower = (cx, cy, r) => {
    g.fillStyle = C.lace;
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 - Math.PI / 2;
      g.beginPath();
      g.ellipse(cx + Math.cos(ang) * r * 0.55, cy + Math.sin(ang) * r * 0.55, r * 0.42, r * 0.3, ang, 0, Math.PI * 2);
      g.fill();
    }
    g.globalCompositeOperation = 'destination-out';
    g.beginPath();
    g.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'source-over';
  };
  const mid = (bandOuter + inner.x) / 2;
  const midY = (bandOuter + inner.y) / 2;
  const fr = Math.min(inner.x - bandOuter, inner.y - bandOuter) * 0.42;
  const count = Math.max(3, Math.round(W / (u * 0.17)));
  for (let i = 0; i <= count; i++) {
    const x = bandOuter + ((W - bandOuter * 2) * i) / count;
    flower(x, midY, fr);
    flower(x, H - midY, fr);
  }
  const countY = Math.max(2, Math.round(H / (u * 0.17)));
  for (let i = 1; i < countY; i++) {
    const y = bandOuter + ((H - bandOuter * 2) * i) / countY;
    flower(mid, y, fr);
    flower(W - mid, y, fr);
  }
  // picot edge hugging the photo
  g.fillStyle = C.lace;
  g.fillRect(inner.x, inner.y, inner.w, inner.h);
  return c;
}

function laceBack(ctx, L) {
  woodGrain(ctx, 0, 0, L.W, L.H, L.u);
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.35)';
  ctx.shadowBlur = L.u * 0.008;
  ctx.shadowOffsetY = L.u * 0.003;
  ctx.drawImage(laceLayer(L), 0, 0);
  ctx.restore();
}

function stampBack(ctx, L) {
  const { u } = L;
  ctx.fillStyle = C.stamp;
  ctx.fillRect(0, 0, L.W, L.H);
  // fine paper tooth
  ctx.fillStyle = 'rgb(255 255 255 / 0.035)';
  for (let i = 0; i < 400; i++) ctx.fillRect((i * 97.3) % L.W, (i * 61.7) % L.H, u * 0.003, u * 0.003);
  // inner rule around the photo
  ctx.strokeStyle = C.paper;
  ctx.lineWidth = Math.max(1, u * 0.004);
  const g = u * 0.012;
  ctx.strokeRect(L.win.x - g, L.win.y - g, L.win.w + g * 2, L.win.h + g * 2);
}

function stampFront(ctx, L) {
  // perforations: cream bites along every edge, cut out of the red
  const { u } = L;
  const r = u * 0.017;
  const step = r * 3.1;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const along = (len, fn) => {
    const n = Math.max(2, Math.round(len / step));
    for (let i = 0; i <= n; i++) fn((len * i) / n);
  };
  along(L.W, (x) => {
    ctx.beginPath();
    ctx.arc(x, 0, r, 0, Math.PI * 2);
    ctx.arc(x, L.H, r, 0, Math.PI * 2);
    ctx.fill();
  });
  along(L.H, (y) => {
    ctx.beginPath();
    ctx.arc(0, y, r, 0, Math.PI * 2);
    ctx.arc(L.W, y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function serial(meta) {
  const s = `${meta.title || ''}${meta.date || ''}`;
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000000;
  return String(h).padStart(6, '0');
}

function ticketBack(ctx, L) {
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgb(51 38 28 / 0.55)';
  ctx.lineWidth = Math.max(1, L.u * 0.0025);
  const g = L.u * 0.01;
  ctx.strokeRect(L.win.x - g, L.win.y - g, L.win.w + g * 2, L.win.h + g * 2);
}

function ticketFront(ctx, L, meta) {
  const { u, win } = L;
  const stubTop = win.y + win.h + u * 0.035;
  // perforation line
  ctx.fillStyle = 'rgb(51 38 28 / 0.55)';
  for (let x = u * 0.03; x < L.W - u * 0.02; x += u * 0.022) ctx.fillRect(x, stubTop, u * 0.011, Math.max(1, u * 0.003));
  const y = stubTop + (L.H - stubTop) * 0.5;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'left';
  ctx.font = `${Math.round(u * 0.04)}px ${FONT_MONO}`;
  ctx.fillText(serial(meta), win.x, y);
  ctx.font = `${Math.round(u * 0.034)}px ${FONT_SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText(fitText(ctx, `ADMIT ONE  ·  ${meta.title || 'PLAYBOOTH'}`.toUpperCase(), win.w * 0.5, `{s} ${FONT_SERIF}`, Math.round(u * 0.032), 8), L.W / 2, y - u * 0.012);
  ctx.font = `${Math.round(u * 0.02)}px ${FONT_MONO}`;
  ctx.fillStyle = C.inkSoft;
  ctx.fillText(meta.date || '', L.W / 2, y + u * 0.024);
  // barcode
  let bx = win.x + win.w - u * 0.17;
  for (let i = 0; i < 34; i++) {
    const bw = u * (i % 3 === 0 ? 0.0045 : 0.0022);
    ctx.fillStyle = C.ink;
    ctx.fillRect(bx, y - u * 0.03, bw, u * 0.06);
    bx += bw + u * 0.0023;
  }
  // notched corners
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const r = u * 0.028;
  for (const [cx, cy] of [[0, 0], [L.W, 0], [0, L.H], [L.W, L.H], [0, stubTop], [L.W, stubTop]]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function polkaBack(ctx, L) {
  const { u } = L;
  ctx.fillStyle = C.burgundy;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(0, 0, L.W, L.H, u * 0.03) : ctx.rect(0, 0, L.W, L.H);
  ctx.fill();
  ctx.fillStyle = C.cream;
  const step = u * 0.034;
  const r = u * 0.0065;
  for (let y = step / 2, row = 0; y < L.H; y += step, row++) {
    for (let x = row % 2 ? step : step / 2; x < L.W; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function stripeBack(ctx, L) {
  const { u } = L;
  ctx.fillStyle = C.linen;
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = 'rgb(123 90 66 / 0.55)';
  const step = u * 0.016;
  for (let x = step / 2; x < L.W; x += step) ctx.fillRect(x, 0, Math.max(1, u * 0.0026), L.H);
  // linen weave
  ctx.fillStyle = 'rgb(51 38 28 / 0.03)';
  for (let y = 0; y < L.H; y += Math.max(2, u * 0.004)) ctx.fillRect(0, y, L.W, 1);
}

function stripeFront(ctx, L) {
  const { u, win } = L;
  const cx = win.x + win.w - u * 0.1;
  const cy = win.y + win.h + (L.H - win.y - win.h) / 2;
  ctx.save();
  ctx.fillStyle = C.linen;
  ctx.strokeStyle = C.stripe;
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.beginPath();
  ctx.ellipse(cx, cy, u * 0.075, u * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = `${Math.round(u * 0.02)}px ${FONT_SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLAYBOOTH', cx, cy + u * 0.001);
  ctx.restore();
}


function instantBack(ctx, L) {
  ctx.fillStyle = '#f7f4ee';
  ctx.fillRect(0, 0, L.W, L.H);
  const g = ctx.createLinearGradient(0, 0, 0, L.H);
  g.addColorStop(0, 'rgb(255 255 255 / 0.25)');
  g.addColorStop(1, 'rgb(51 38 28 / 0.05)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgb(51 38 28 / 0.12)';
  ctx.lineWidth = Math.max(1, L.u * 0.002);
  ctx.strokeRect(L.win.x, L.win.y, L.win.w, L.win.h);
}

function instantFront(ctx, L, meta) {
  const { u, win } = L;
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.52;
  ctx.fillStyle = '#2e3f6b';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const text = fitText(ctx, meta.title || 'playbooth', win.w * 0.62, `600 {s} ${FONT_HAND}`, Math.round(u * 0.085), 10);
  ctx.save();
  ctx.translate(win.x + u * 0.02, y);
  ctx.rotate(-0.025);
  ctx.fillText(text, 0, 0);
  ctx.restore();
  ctx.textAlign = 'right';
  ctx.fillStyle = C.inkSoft;
  ctx.font = `${Math.round(u * 0.022)}px ${FONT_MONO}`;
  ctx.fillText(meta.date || '', win.x + win.w, y + u * 0.01);
}

function negativeBack(ctx, L) {
  const { u, win } = L;
  const g = ctx.createLinearGradient(0, 0, L.W, L.H);
  g.addColorStop(0, '#3d2617');
  g.addColorStop(1, '#2a1a10');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, L.W, L.H);
  const holeW = u * 0.03;
  const holeH = u * 0.042;
  const gap = u * 0.066;
  const count = Math.floor(L.W / gap);
  const start = (L.W - (count - 1) * gap) / 2;
  ctx.fillStyle = 'rgb(244 226 200 / 0.88)';
  for (const bandY of [win.y * 0.42, win.y + win.h + (L.H - win.y - win.h) * 0.58]) {
    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(start + i * gap - holeW / 2, bandY - holeH / 2, holeW, holeH, holeW * 0.25);
      else ctx.rect(start + i * gap - holeW / 2, bandY - holeH / 2, holeW, holeH);
      ctx.fill();
    }
  }
}

function negativeFront(ctx, L, meta) {
  const { u, win } = L;
  ctx.fillStyle = '#e08a3c';
  ctx.font = `500 ${Math.round(u * 0.019)}px ${FONT_MONO}`;
  ctx.textBaseline = 'middle';
  const y = win.y * 0.86;
  ctx.textAlign = 'left';
  ctx.fillText('PLAYBOOTH 400', win.x + u * 0.01, y);
  ctx.textAlign = 'right';
  ctx.fillText(`▸ ${meta.timecode || '12'}`, win.x + win.w - u * 0.01, y);
  ctx.textAlign = 'center';
  ctx.fillText('13A', L.W / 2, win.y + win.h + (L.H - win.y - win.h) * 0.16);
}

function kraftBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#b48a5c';
  ctx.fillRect(0, 0, L.W, L.H);
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = i % 3 ? 'rgb(90 60 30 / 0.12)' : 'rgb(255 240 210 / 0.12)';
    ctx.fillRect((i * 97.13) % L.W, (i * 53.71) % L.H, u * 0.004 * (1 + (i % 3)), u * 0.0012);
  }
  const inset = u * 0.03;
  ctx.strokeStyle = '#f1e3c6';
  ctx.lineWidth = Math.max(1, u * 0.004);
  ctx.setLineDash([u * 0.016, u * 0.011]);
  ctx.strokeRect(win.x - inset, win.y - inset, win.w + inset * 2, win.h + inset * 2);
  ctx.setLineDash([]);
}

function ginghamBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, L.W, L.H);
  const step = u * 0.032;
  ctx.fillStyle = 'rgb(176 82 58 / 0.42)';
  for (let x = 0; x < L.W; x += step * 2) ctx.fillRect(x, 0, step, L.H);
  for (let y = 0; y < L.H; y += step * 2) ctx.fillRect(0, y, L.W, step);
  ctx.fillStyle = '#f4ede0';
  const rim = u * 0.008;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(win.x - rim, win.y - rim, win.w + rim * 2, win.h + rim * 2, win.r + rim);
  else ctx.rect(win.x - rim, win.y - rim, win.w + rim * 2, win.h + rim * 2);
  ctx.fill();
}

function washiBack(ctx, L) {
  ctx.fillStyle = '#f4ede0';
  ctx.fillRect(0, 0, L.W, L.H);
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = 'rgb(120 90 60 / 0.05)';
    ctx.fillRect((i * 71.3) % L.W, (i * 37.9) % L.H, L.u * 0.006, L.u * 0.006);
  }
}

function tape(ctx, cx, cy, w, h, angle, u) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = 'rgb(60 138 120 / 0.78)';
  ctx.beginPath();
  const teeth = 7;
  ctx.moveTo(-w / 2, -h / 2);
  ctx.lineTo(w / 2, -h / 2);
  for (let i = 0; i <= teeth; i++) ctx.lineTo(w / 2 + (i % 2 ? u * 0.006 : 0), -h / 2 + (h * i) / teeth);
  ctx.lineTo(-w / 2, h / 2);
  for (let i = teeth; i >= 0; i--) ctx.lineTo(-w / 2 - (i % 2 ? u * 0.006 : 0), -h / 2 + (h * i) / teeth);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgb(244 237 224 / 0.55)';
  for (let x = -w / 2 + u * 0.015; x < w / 2; x += u * 0.03) {
    ctx.beginPath();
    ctx.arc(x, 0, u * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function washiFront(ctx, L) {
  const { u, win } = L;
  tape(ctx, win.x + u * 0.03, win.y + u * 0.01, u * 0.22, u * 0.055, -0.62, u);
  tape(ctx, win.x + win.w - u * 0.03, win.y + win.h - u * 0.01, u * 0.22, u * 0.055, -0.62, u);
}

function receiptBack(ctx, L) {
  ctx.fillStyle = '#fbfaf6';
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgb(51 38 28 / 0.18)';
  ctx.lineWidth = Math.max(1, L.u * 0.002);
  ctx.strokeRect(L.win.x, L.win.y, L.win.w, L.win.h);
}

function receiptFront(ctx, L, meta) {
  const { u, win } = L;
  const left = win.x;
  const right = win.x + win.w;
  ctx.fillStyle = '#4a433c';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${Math.round(u * 0.024)}px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('PLAYBOOTH  CORNER STORE', L.W / 2, win.y * 0.55);
  const base = win.y + win.h + u * 0.04;
  ctx.textAlign = 'left';
  const line = fitText(ctx, `1 x ${meta.title || 'FILM'}`.toUpperCase(), win.w * 0.7, `{s} ${FONT_MONO}`, Math.round(u * 0.022), 8);
  ctx.fillText(line, left, base);
  ctx.textAlign = 'right';
  ctx.fillText(meta.timecode || '', right, base);
  ctx.fillStyle = 'rgb(74 67 60 / 0.5)';
  for (let x = left; x < right; x += u * 0.014) ctx.fillRect(x, base + u * 0.026, u * 0.007, Math.max(1, u * 0.0015));
  ctx.fillStyle = '#4a433c';
  ctx.textAlign = 'left';
  ctx.fillText(meta.date || '', left, base + u * 0.06);
  ctx.textAlign = 'right';
  ctx.fillText('THANK YOU', right, base + u * 0.06);
  let bx = L.W / 2 - u * 0.12;
  for (let i = 0; i < 40; i++) {
    const bw = u * (i % 3 === 0 ? 0.004 : 0.002);
    ctx.fillRect(bx, base + u * 0.09, bw, u * 0.035);
    bx += bw + u * 0.0022;
  }
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  const tooth = u * 0.016;
  for (const y of [0, L.H]) {
    ctx.beginPath();
    for (let x = 0; x <= L.W + tooth; x += tooth) {
      ctx.moveTo(x - tooth / 2, y);
      ctx.lineTo(x, y + (y ? -tooth * 0.55 : tooth * 0.55));
      ctx.lineTo(x + tooth / 2, y);
    }
    ctx.fill();
  }
  ctx.restore();
}

const PAINTERS = {
  none: [() => {}, () => {}],
  instant: [instantBack, instantFront],
  negative: [negativeBack, negativeFront],
  kraft: [kraftBack, () => {}],
  gingham: [ginghamBack, () => {}],
  washi: [washiBack, washiFront],
  receipt: [receiptBack, receiptFront],
  booth: [boothBack, boothFront],
  lace: [laceBack, () => {}],
  stamp: [stampBack, stampFront],
  ticket: [ticketBack, ticketFront],
  polka: [polkaBack, () => {}],
  stripe: [stripeBack, stripeFront],
};

export function paintBack(ctx, border, L, meta = {}) {
  ctx.save();
  PAINTERS[border.id][0](ctx, L, meta);
  ctx.restore();
}

export function paintFront(ctx, border, L, meta = {}) {
  ctx.save();
  PAINTERS[border.id][1](ctx, L, meta);
  ctx.restore();
}

/** Frame with a transparent window, laid over live video. */
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

/** Frame with a picture inside the window. */
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

/**
 * Three framed photos stacked into a classic photobooth strip,
 * on a backing that matches the frame.
 */
export function paintStrip(ctx, border, images, meta, width = 900) {
  const pad = width * 0.07;
  const gap = width * 0.045;
  const cellW = width - pad * 2;
  const heights = images.map((im) => cellW * (im.height / im.width));
  const footer = width * 0.3;
  const H = Math.round(pad + heights.reduce((a, b) => a + b, 0) + gap * (images.length - 1) + footer);
  ctx.canvas.width = width;
  ctx.canvas.height = H;
  const s = border.strip;
  if (s.wood) woodGrain(ctx, 0, 0, width, H, width);
  else {
    ctx.fillStyle = s.bg;
    ctx.fillRect(0, 0, width, H);
    if (s.stripes) {
      ctx.fillStyle = 'rgb(123 90 66 / 0.4)';
      for (let x = 6; x < width; x += width * 0.016) ctx.fillRect(x, 0, Math.max(1, width * 0.0025), H);
    }
  }
  let y = pad;
  images.forEach((im, i) => {
    ctx.save();
    ctx.shadowColor = 'rgb(0 0 0 / 0.22)';
    ctx.shadowBlur = width * 0.012;
    ctx.shadowOffsetY = width * 0.004;
    ctx.drawImage(im, pad, y, cellW, heights[i]);
    ctx.restore();
    y += heights[i] + gap;
  });
  const fy = y - gap + footer * 0.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = s.ink;
  ctx.font = `${Math.round(width * 0.075)}px ${FONT_SERIF}`;
  ctx.fillText('PLAYBOOTH', width / 2, fy - width * 0.035);
  ctx.globalAlpha = 0.8;
  ctx.font = `${Math.round(width * 0.034)}px ${FONT_MONO}`;
  ctx.fillText(fitText(ctx, [meta.title, meta.date].filter(Boolean).join('   '), width - pad * 2, `{s} ${FONT_MONO}`, Math.round(width * 0.034), 10), width / 2, fy + width * 0.045);
  ctx.globalAlpha = 1;
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
      document.fonts.load(`500 32px "Fraunces Variable"`),
      document.fonts.load(`400 32px "DM Mono"`),
      document.fonts.load(`500 32px "DM Mono"`),
      document.fonts.load(`600 32px Caveat`),
    ]).catch(() => {});
  }
  return fontsReady;
}
