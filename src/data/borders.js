/**
 * Photo frames. One painter draws each frame everywhere it appears:
 * around the playing video, on the booth's television, in captured photos
 * and in photostrips. Sizes are fractions of the photo's width.
 *
 * In the player the frame's bottom edge grows to hold the controls; a layout
 * passes that as L.Hd (the bottom of the decorated border) inside L.H.
 * Each frame also carries `ui`, the look its controls inherit.
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

/*
 * ui: surface/ink = pill fill and icon color; band = text on the frame itself;
 * accent = progress fill; track = unplayed track; play = big key fill/icon;
 * edge = pill edging (none, lace, perf, zigzag, stitch, ticket, airmail);
 * bar = progress style (plain, lace, perf, stitch, dots, film, airmail, pin);
 * thumb = handle (dot, star, button, bow, flower, sprocket).
 */
const ui = (o) => ({ edge: 'none', bar: 'plain', thumb: 'dot', thumbColor: null, ...o });

export const BORDERS = [
  {
    id: 'none',
    name: 'No frame',
    hint: 'Just the film, with a quiet dark bar for the controls.',
    pads: { t: 0, r: 0, b: 0, l: 0 },
    radius: 0,
    swatch: ['#1c140f', '#1c140f'],
    strip: { bg: '#f6f1e7', ink: '#33261c' },
    ui: ui({ surface: '#2a211b', ink: '#f4ede0', band: '#f4ede0', accent: '#cf6a4c', track: 'rgb(244 237 224 / 0.22)', play: ['#f4ede0', '#1b1511'] }),
  },
  {
    id: 'booth',
    name: 'Booth white',
    hint: 'The plain white edge of a real photobooth print, stamped at the bottom.',
    pads: { t: 0.04, r: 0.04, b: 0.085, l: 0.04 },
    radius: 0,
    swatch: ['#f6f1e7', '#d8d0c3'],
    strip: { bg: '#f6f1e7', ink: C.ink },
    ui: ui({ surface: '#ece4d6', ink: '#33261c', band: '#33261c', accent: '#33261c', track: 'rgb(51 38 28 / 0.16)', play: ['#33261c', '#f6f1e7'] }),
  },
  {
    id: 'lace',
    name: 'Lace',
    hint: 'A cotton lace doily laid on a dark wooden table.',
    pads: { t: 0.085, r: 0.085, b: 0.085, l: 0.085 },
    radius: 0,
    swatch: ['#4a3125', '#f5ebe7'],
    strip: { bg: C.wood, ink: '#f5ebe7', wood: true },
    ui: ui({ surface: '#fbf6f2', ink: '#4a3125', band: '#4a3125', accent: '#7a5340', track: 'rgb(74 49 37 / 0.22)', play: ['#fbf6f2', '#4a3125'], edge: 'lace', bar: 'lace', thumb: 'flower', thumbColor: '#7a5340' }),
  },
  {
    id: 'stamp',
    name: 'Postage stamp',
    hint: 'Deep red with a perforated edge, like a stamp torn from its sheet.',
    pads: { t: 0.06, r: 0.06, b: 0.06, l: 0.06 },
    radius: 0,
    swatch: ['#8c2a22', '#f6f1e7'],
    strip: { bg: '#f1ebe0', ink: C.ink },
    ui: ui({ surface: '#f6f1e7', ink: '#8c2a22', band: '#f6f1e7', accent: '#f6f1e7', track: 'rgb(246 241 231 / 0.3)', play: ['#f6f1e7', '#8c2a22'], edge: 'perf', bar: 'perf' }),
  },
  {
    id: 'ticket',
    name: 'Cinema ticket',
    hint: 'A cream admission ticket with a numbered stub.',
    pads: { t: 0.055, r: 0.055, b: 0.15, l: 0.055 },
    radius: 0,
    swatch: ['#efe4cf', '#33261c'],
    strip: { bg: '#2e231b', ink: '#efe4cf' },
    ui: ui({ surface: '#e3d4b9', ink: '#33261c', band: '#33261c', accent: '#9e4330', track: 'rgb(51 38 28 / 0.2)', play: ['#33261c', '#efe4cf'], edge: 'ticket', bar: 'stitch' }),
  },
  {
    id: 'denim',
    name: 'Denim & lace',
    hint: 'Blue denim edged in lace, with two gingham star patches.',
    pads: { t: 0.08, r: 0.07, b: 0.08, l: 0.07 },
    radius: 0,
    swatch: ['#4c6a96', '#f7f1ea'],
    strip: { bg: '#4c6a96', ink: '#f7f1ea' },
    ui: ui({ surface: '#f7f1ea', ink: '#2d4166', band: '#f7f1ea', accent: '#f2c6cf', track: 'rgb(247 241 234 / 0.3)', play: ['#f7f1ea', '#2d4166'], edge: 'lace', bar: 'stitch', thumb: 'star', thumbColor: '#ecd77c' }),
  },
  {
    id: 'knit',
    name: 'Red knit',
    hint: 'A burgundy knit with a stamp-cut mat, a ribbon bow, a pin and a button.',
    pads: { t: 0.09, r: 0.08, b: 0.09, l: 0.08 },
    radius: 0,
    swatch: ['#86232a', '#fbf7f0'],
    strip: { bg: '#86232a', ink: '#fbf7f0' },
    ui: ui({ surface: '#fbf7f0', ink: '#86232a', band: '#fbf7f0', accent: '#fbf7f0', track: 'rgb(251 247 240 / 0.28)', play: ['#fbf7f0', '#86232a'], edge: 'perf', bar: 'perf', thumb: 'button', thumbColor: '#efe8dc' }),
  },
  {
    id: 'cocoa',
    name: 'Cocoa bow',
    hint: 'Chocolate polka dots, a pinked cream mat and a little bow. Memories.',
    pads: { t: 0.07, r: 0.07, b: 0.15, l: 0.07 },
    radius: 0,
    swatch: ['#3a2822', '#efe6d7'],
    strip: { bg: '#3a2822', ink: '#efe6d7' },
    ui: ui({ surface: '#f4ecdd', ink: '#3a2822', band: '#efe6d7', accent: '#efe6d7', track: 'rgb(239 230 215 / 0.25)', play: ['#f4ecdd', '#3a2822'], edge: 'zigzag', bar: 'dots', thumb: 'bow', thumbColor: '#c79b7c' }),
  },
  {
    id: 'reel',
    name: 'Red film',
    hint: 'A strip of red film with sprocket holes down both sides.',
    pads: { t: 0.07, r: 0.085, b: 0.1, l: 0.085 },
    radius: 0,
    swatch: ['#8a2b2b', '#f5ede1'],
    strip: { bg: '#8a2b2b', ink: '#f5ede1' },
    ui: ui({ surface: '#6b1f1f', ink: '#f5ede1', band: '#f5ede1', accent: '#f5ede1', track: 'rgb(245 237 225 / 0.22)', play: ['#f5ede1', '#8a2b2b'], bar: 'film', thumb: 'sprocket' }),
  },
  {
    id: 'airmail',
    name: 'Airmail',
    hint: 'Ledger paper, airmail stripes, a postmark and a paperclip.',
    pads: { t: 0.075, r: 0.07, b: 0.08, l: 0.07 },
    radius: 0,
    swatch: ['#f2e9d6', '#b8433a'],
    strip: { bg: '#f2e9d6', ink: '#2f4a86' },
    ui: ui({ surface: '#f8f2e8', ink: '#2f4a86', band: '#2f4a86', accent: '#b8433a', track: 'rgb(47 74 134 / 0.18)', play: ['#2f4a86', '#f8f2e8'], edge: 'airmail', bar: 'airmail', thumb: 'star', thumbColor: '#b8433a' }),
  },
  {
    id: 'matinee',
    name: 'Matinee',
    hint: 'Dark denim with a cream admission ticket above the picture.',
    pads: { t: 0.16, r: 0.07, b: 0.07, l: 0.07 },
    radius: 0,
    swatch: ['#2f4672', '#f4e9d8'],
    strip: { bg: '#2f4672', ink: '#f4e9d8' },
    ui: ui({ surface: '#f4e9d8', ink: '#a3323a', band: '#f4e9d8', accent: '#f4e9d8', track: 'rgb(244 233 216 / 0.25)', play: ['#f4e9d8', '#a3323a'], edge: 'ticket', bar: 'stitch' }),
  },
  {
    id: 'polka',
    name: 'Red polka',
    hint: 'Burgundy with small cream dots and softened corners.',
    pads: { t: 0.06, r: 0.06, b: 0.06, l: 0.06 },
    radius: 0.03,
    swatch: ['#6b2024', '#efe4cf'],
    strip: { bg: '#f1ebe0', ink: C.ink },
    ui: ui({ surface: '#efe4cf', ink: '#6b2024', band: '#efe4cf', accent: '#efe4cf', track: 'rgb(239 228 207 / 0.28)', play: ['#efe4cf', '#6b2024'], bar: 'dots' }),
  },
  {
    id: 'stripe',
    name: 'Linen stripe',
    hint: 'Pale linen with fine brown pinstripes and a little oval label.',
    pads: { t: 0.055, r: 0.055, b: 0.055, l: 0.055 },
    radius: 0.022,
    swatch: ['#ece3d3', '#7b5a42'],
    strip: { bg: '#ece3d3', ink: C.ink, stripes: true },
    ui: ui({ surface: '#f6efe3', ink: '#5a3f2c', band: '#33261c', accent: '#7b5a42', track: 'rgb(123 90 66 / 0.22)', play: ['#7b5a42', '#f6efe3'], edge: 'stitch', bar: 'pin' }),
  },
];

export const borderById = (id) => BORDERS.find((b) => b.id === id) ?? BORDERS[1];

export function frameUnits(border, aspect) {
  const { t, r, b, l } = border.pads;
  return { W: 1 + l + r, H: 1 / aspect + t + b, win: { x: l, y: t, w: 1, h: 1 / aspect } };
}

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
  const y = win.y + win.h + ((L.Hd ?? L.H) - win.y - win.h) * 0.52;
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
  const Hd = L.Hd ?? H; // below this, the controls sit on plain lace
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
      if (y > Hd - bandOuter * 0.5 && Hd < H) continue;
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
    flower(x, Hd - midY, fr);
  }
  const countY = Math.max(2, Math.round(H / (u * 0.17)));
  for (let i = 1; i < countY; i++) {
    const y = bandOuter + ((Hd - bandOuter * 2) * i) / countY;
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
  const y = stubTop + ((L.Hd ?? L.H) - stubTop) * 0.5;
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
  const cy = win.y + win.h + ((L.Hd ?? L.H) - win.y - win.h) / 2;
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

/* ---------- shared craft pieces for the newer frames ---------- */

function denimFill(ctx, x, y, w, h, u, base = '#4c6a96') {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const step = Math.max(2, u * 0.006);
  ctx.lineWidth = Math.max(1, u * 0.0024);
  for (let i = -h; i < w + h; i += step) {
    ctx.strokeStyle = (i / step) % 3 < 1 ? 'rgb(255 255 255 / 0.10)' : 'rgb(10 20 40 / 0.10)';
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  for (let k = 0; k < 900; k++) {
    ctx.fillStyle = k % 2 ? 'rgb(255 255 255 / 0.06)' : 'rgb(0 10 30 / 0.07)';
    ctx.fillRect(x + ((k * 97.31) % w), y + ((k * 53.17) % h), u * 0.006, u * 0.0016);
  }
  ctx.restore();
}

/** A cotton lace trim running along a horizontal edge; dir 1 hangs down, -1 rises up. */
function laceTrim(ctx, x0, x1, y, dir, u, color = '#f7f1ea') {
  const band = u * 0.03;
  const r = u * 0.011;
  ctx.save();
  ctx.fillStyle = color;
  const top = dir > 0 ? y : y - band;
  ctx.fillRect(x0, top, x1 - x0, band);
  const n = Math.max(2, Math.round((x1 - x0) / (r * 2)));
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.arc(x0 + ((x1 - x0) * i) / n, dir > 0 ? y + band : y - band, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i <= n; i++) {
    ctx.beginPath();
    ctx.arc(x0 + ((x1 - x0) * i) / n, dir > 0 ? y + band * 0.55 : y - band * 0.55, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function starPath(ctx, cx, cy, R, r, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = rot + (i * Math.PI) / 5;
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  ctx.closePath();
}

/** A fabric star patch: gingham fill, puffy edge, stitched outline. */
function starPatch(ctx, cx, cy, R, u, a, b, rot) {
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.28)';
  ctx.shadowBlur = u * 0.01;
  ctx.shadowOffsetY = u * 0.004;
  starPath(ctx, cx, cy, R, R * 0.5, rot);
  ctx.fillStyle = a;
  ctx.fill();
  ctx.restore();
  ctx.save();
  starPath(ctx, cx, cy, R, R * 0.5, rot);
  ctx.clip();
  const s = R * 0.22;
  ctx.fillStyle = b;
  for (let x = cx - R; x < cx + R; x += s * 2) ctx.fillRect(x, cy - R, s, R * 2);
  for (let y = cy - R; y < cy + R; y += s * 2) ctx.fillRect(cx - R, y, R * 2, s);
  ctx.restore();
  ctx.save();
  ctx.setLineDash([u * 0.006, u * 0.005]);
  ctx.strokeStyle = 'rgb(255 255 255 / 0.85)';
  ctx.lineWidth = Math.max(1, u * 0.0028);
  starPath(ctx, cx, cy, R * 0.82, R * 0.41, rot);
  ctx.stroke();
  ctx.restore();
}

/** A satin ribbon bow. */
function bow(ctx, cx, cy, s, color, shade) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = 'rgb(0 0 0 / 0.3)';
  ctx.shadowBlur = s * 0.12;
  ctx.shadowOffsetY = s * 0.05;
  ctx.fillStyle = color;
  // tails
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(sx * s * 0.08, s * 0.05);
    ctx.lineTo(sx * s * 0.42, s * 0.75);
    ctx.lineTo(sx * s * 0.28, s * 0.68);
    ctx.lineTo(sx * s * 0.2, s * 0.82);
    ctx.lineTo(-sx * s * 0.02, s * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  // loops
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(sx * s * 0.25, -s * 0.55, sx * s * 0.75, -s * 0.45, sx * s * 0.62, s * 0.02);
    ctx.bezierCurveTo(sx * s * 0.55, s * 0.32, sx * s * 0.2, s * 0.18, 0, 0);
    ctx.fill();
  }
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = shade;
  ctx.lineWidth = s * 0.04;
  for (const sx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(sx * s * 0.12, -s * 0.05);
    ctx.quadraticCurveTo(sx * s * 0.38, -s * 0.28, sx * s * 0.5, -s * 0.05);
    ctx.stroke();
  }
  ctx.fillStyle = shade;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-s * 0.1, -s * 0.13, s * 0.2, s * 0.24, s * 0.06);
  else ctx.rect(-s * 0.1, -s * 0.13, s * 0.2, s * 0.24);
  ctx.fill();
  ctx.restore();
}

function sewButton(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.3)';
  ctx.shadowBlur = r * 0.4;
  ctx.shadowOffsetY = r * 0.15;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgb(0 0 0 / 0.12)';
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgb(60 40 30 / 0.55)';
  for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * r * 0.22, cy + dy * r * 0.22, r * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function safetyPin(ctx, x, y, len, angle, u) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#c9c6c0';
  ctx.lineWidth = Math.max(1, u * 0.005);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.arc(len, len * 0.06, len * 0.06, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(len * 0.12, len * 0.12);
  ctx.stroke();
  ctx.fillStyle = '#a9a59e';
  ctx.fillRect(-len * 0.02, -len * 0.04, len * 0.16, len * 0.2);
  ctx.restore();
}

/** A white photo mat with a postage-stamp perforated edge. */
function perfMat(ctx, x, y, w, h, u, color = '#fbf7f0') {
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.3)';
  ctx.shadowBlur = u * 0.012;
  ctx.shadowOffsetY = u * 0.004;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - u * 0.03, y - u * 0.03, w + u * 0.06, h + u * 0.06);
  ctx.clip();
  ctx.globalCompositeOperation = 'destination-out';
  const r = u * 0.009;
  const step = r * 2.9;
  for (let px = x; px <= x + w + 0.1; px += w / Math.round(w / step)) {
    ctx.beginPath();
    ctx.arc(px, y, r, 0, Math.PI * 2);
    ctx.arc(px, y + h, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let py = y; py <= y + h + 0.1; py += h / Math.round(h / step)) {
    ctx.beginPath();
    ctx.arc(x, py, r, 0, Math.PI * 2);
    ctx.arc(x + w, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A cream mat cut with pinking shears. */
function pinkedMat(ctx, x, y, w, h, u, color = '#f4ecdd') {
  const t = u * 0.016;
  const pts = [];
  const nx = Math.round(w / t);
  const ny = Math.round(h / t);
  for (let i = 0; i <= nx; i++) pts.push([x + (w * i) / nx, y - (i % 2 ? t * 0.5 : 0)]);
  for (let i = 0; i <= ny; i++) pts.push([x + w + (i % 2 ? t * 0.5 : 0), y + (h * i) / ny]);
  for (let i = nx; i >= 0; i--) pts.push([x + (w * i) / nx, y + h + (i % 2 ? t * 0.5 : 0)]);
  for (let i = ny; i >= 0; i--) pts.push([x - (i % 2 ? t * 0.5 : 0), y + (h * i) / ny]);
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.35)';
  ctx.shadowBlur = u * 0.012;
  ctx.shadowOffsetY = u * 0.004;
  ctx.fillStyle = color;
  ctx.beginPath();
  pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ---------- Denim & lace ---------- */

function denimBack(ctx, L) {
  const { u, win } = L;
  denimFill(ctx, 0, 0, L.W, L.H, u);
  laceTrim(ctx, 0, L.W, 0, 1, u);
  laceTrim(ctx, 0, L.W, L.H, -1, u);
  // stitched line and a fine ivory rim around the picture
  const g = u * 0.018;
  ctx.fillStyle = '#f3ede4';
  ctx.fillRect(win.x - u * 0.006, win.y - u * 0.006, win.w + u * 0.012, win.h + u * 0.012);
  ctx.save();
  ctx.setLineDash([u * 0.012, u * 0.008]);
  ctx.strokeStyle = 'rgb(245 230 200 / 0.85)';
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.strokeRect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2);
  ctx.restore();
}

function denimFront(ctx, L) {
  const { u, win } = L;
  starPatch(ctx, win.x + u * 0.01, win.y + win.h * 0.62, u * 0.06, u, '#ecd77c', '#f6eab0', -1.9);
  starPatch(ctx, win.x + win.w - u * 0.012, win.y + u * 0.03, u * 0.05, u, '#e9b8c2', '#f6dbe1', -1.2);
}

/* ---------- Red knit ---------- */

function knitBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#86232a';
  ctx.fillRect(0, 0, L.W, L.H);
  // rib stitches: little Vs in columns
  const cw = u * 0.022;
  const rh = u * 0.016;
  ctx.lineWidth = Math.max(1, u * 0.004);
  ctx.lineCap = 'round';
  for (let x = cw / 2, c = 0; x < L.W; x += cw, c++) {
    for (let y = 0; y < L.H; y += rh) {
      ctx.strokeStyle = c % 2 ? 'rgb(255 200 190 / 0.1)' : 'rgb(40 0 5 / 0.16)';
      ctx.beginPath();
      ctx.moveTo(x - cw * 0.3, y);
      ctx.lineTo(x, y + rh * 0.8);
      ctx.lineTo(x + cw * 0.3, y);
      ctx.stroke();
    }
  }
  laceTrim(ctx, 0, L.W, 0, 1, u, '#f6f2ec');
  laceTrim(ctx, 0, L.W, L.H, -1, u, '#f6f2ec');
  const m = u * 0.03;
  perfMat(ctx, win.x - m, win.y - m, win.w + m * 2, win.h + m * 2, u);
}

function knitFront(ctx, L) {
  const { u, win } = L;
  bow(ctx, win.x + win.w - u * 0.01, win.y - u * 0.005, u * 0.11, '#d9d6d1', '#a8a49d');
  safetyPin(ctx, win.x - u * 0.015, win.y + u * 0.02, u * 0.11, -0.7, u);
  sewButton(ctx, win.x + u * 0.01, win.y + win.h - u * 0.005, u * 0.035, '#efe8dc');
}

/* ---------- Cocoa bow ---------- */

function cocoaBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#3a2822';
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = 'rgb(255 240 220 / 0.04)';
  for (let x = 0; x < L.W; x += u * 0.012) ctx.fillRect(x, 0, Math.max(1, u * 0.002), L.H);
  ctx.fillStyle = '#efe6d7';
  const step = u * 0.16;
  for (let y = step * 0.3, r = 0; y < L.H + step; y += step, r++) {
    for (let x = (r % 2 ? step * 0.5 : 0) + step * 0.15; x < L.W + step; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, u * 0.022, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const m = u * 0.03;
  const Hd = L.Hd ?? L.H;
  const below = Math.min(u * 0.075, Hd - (win.y + win.h) - m);
  pinkedMat(ctx, win.x - m, win.y - m, win.w + m * 2, win.h + m + below, u);
}

function cocoaFront(ctx, L) {
  const { u, win } = L;
  const Hd = L.Hd ?? L.H;
  const m = u * 0.03;
  const below = Math.min(u * 0.075, Hd - (win.y + win.h) - m);
  ctx.fillStyle = '#4a3328';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.round(u * 0.05)}px ${FONT_HAND}`;
  ctx.fillText('Memories', win.x + win.w / 2, win.y + win.h + below * 0.55);
  bow(ctx, win.x + u * 0.005, win.y + win.h + below * 0.35, u * 0.08, '#6b4632', '#4a2f22');
}

/* ---------- Red film ---------- */

function reelBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#8a2b2b';
  ctx.fillRect(0, 0, L.W, L.H);
  const holeW = u * 0.024;
  const holeH = u * 0.032;
  const gap = u * 0.055;
  ctx.fillStyle = '#f5ede1';
  for (const cx of [win.x * 0.5, L.W - win.x * 0.5]) {
    for (let y = gap * 0.5; y < L.H; y += gap) {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(cx - holeW / 2, y, holeW, holeH, holeW * 0.25);
      else ctx.rect(cx - holeW / 2, y, holeW, holeH);
      ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgb(245 237 225 / 0.7)';
  ctx.lineWidth = Math.max(1, u * 0.003);
  const g = u * 0.012;
  ctx.strokeRect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2);
}

function reelFront(ctx, L, meta) {
  const { u, win } = L;
  const Hd = L.Hd ?? L.H;
  ctx.fillStyle = '#f5ede1';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.font = `${Math.round(u * 0.03)}px ${FONT_SERIF}`;
  ctx.fillText('Own the moment', win.x + win.w / 2, win.y + win.h + (Hd - win.y - win.h) * 0.55);
  ctx.textAlign = 'right';
  ctx.font = `${Math.round(u * 0.018)}px ${FONT_MONO}`;
  ctx.fillText(meta.timecode ? `▸ ${meta.timecode}` : '', win.x + win.w, win.y - u * 0.028);
}

/* ---------- Airmail ---------- */

function airmailStripes(ctx, x, y, w, h, band, u) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.rect(x + band, y + band, w - band * 2, h - band * 2);
  ctx.clip('evenodd');
  const s = u * 0.028;
  for (let i = -h, k = 0; i < w + h; i += s, k++) {
    ctx.fillStyle = ['#b8433a', '#f6efe3', '#2f4a86', '#f6efe3'][k % 4];
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + s, y);
    ctx.lineTo(x + i + s - h, y + h);
    ctx.lineTo(x + i - h, y + h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function airmailBack(ctx, L) {
  const { u, win } = L;
  ctx.fillStyle = '#f2e9d6';
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.fillStyle = 'rgb(80 110 170 / 0.16)';
  for (let y = u * 0.03; y < L.H; y += u * 0.03) ctx.fillRect(0, y, L.W, Math.max(1, u * 0.0018));
  ctx.fillStyle = 'rgb(180 60 50 / 0.28)';
  ctx.fillRect(u * 0.05, 0, Math.max(1, u * 0.002), L.H);
  const m = u * 0.022;
  airmailStripes(ctx, win.x - m, win.y - m, win.w + m * 2, win.h + m * 2, u * 0.012, u);
}

function airmailFront(ctx, L) {
  const { u, win } = L;
  // postmark over the top right corner
  const cx = win.x + win.w - u * 0.06;
  const cy = win.y + u * 0.05;
  ctx.save();
  ctx.strokeStyle = 'rgb(60 50 70 / 0.55)';
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.beginPath();
  ctx.arc(cx, cy, u * 0.045, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, u * 0.034, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    for (let x = 0; x <= u * 0.12; x += u * 0.004) ctx.lineTo(cx - u * 0.14 + x, cy - u * 0.02 + i * u * 0.012 + Math.sin(x / (u * 0.012)) * u * 0.003);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgb(60 50 70 / 0.6)';
  ctx.font = `${Math.round(u * 0.012)}px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PLAYBOOTH', cx, cy - u * 0.005);
  ctx.fillText('POST', cx, cy + u * 0.01);
  ctx.restore();
  // paperclip on the left edge
  ctx.save();
  ctx.translate(win.x + u * 0.04, win.y - u * 0.035);
  ctx.strokeStyle = '#9d9a94';
  ctx.lineWidth = Math.max(1, u * 0.004);
  ctx.beginPath();
  ctx.moveTo(0, u * 0.08);
  ctx.lineTo(0, u * 0.012);
  ctx.arc(u * 0.012, u * 0.012, u * 0.012, Math.PI, 0);
  ctx.lineTo(u * 0.024, u * 0.07);
  ctx.arc(u * 0.016, u * 0.07, u * 0.008, 0, Math.PI);
  ctx.lineTo(u * 0.008, u * 0.03);
  ctx.stroke();
  ctx.restore();
  starPath(ctx, win.x + win.w + u * 0.004, win.y + win.h - u * 0.02, u * 0.03, u * 0.014, -1.5);
  ctx.fillStyle = '#a8342e';
  ctx.fill();
}

/* ---------- Matinee ---------- */

function ticketPanel(ctx, x, y, w, h, u) {
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.3)';
  ctx.shadowBlur = u * 0.01;
  ctx.shadowOffsetY = u * 0.003;
  ctx.fillStyle = '#f4e9d8';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (const cx of [x, x + w]) {
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, h * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgb(163 50 58 / 0.6)';
  ctx.lineWidth = Math.max(1, u * 0.002);
  ctx.strokeRect(x + u * 0.008, y + u * 0.008, w - u * 0.016, h - u * 0.016);
}

function matineeBack(ctx, L) {
  const { u, win } = L;
  denimFill(ctx, 0, 0, L.W, L.H, u, '#2f4672');
  const m = u * 0.022;
  ticketPanel(ctx, win.x, u * 0.025, win.w, win.y - u * 0.05, u);
  ctx.fillStyle = '#f4e9d8';
  ctx.fillRect(win.x - m, win.y - m * 0.6, win.w + m * 2, win.h + m * 1.2);
  ctx.strokeStyle = '#a3323a';
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.strokeRect(win.x - u * 0.006, win.y - u * 0.006, win.w + u * 0.012, win.h + u * 0.012);
}

function matineeFront(ctx, L, meta) {
  const { u, win } = L;
  const top = u * 0.025;
  const h = win.y - u * 0.05;
  const cy = top + h / 2;
  ctx.fillStyle = '#a3323a';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = `600 ${Math.round(Math.min(h * 0.46, u * 0.05))}px ${FONT_HAND}`;
  ctx.fillText('Movie matinee', win.x + u * 0.03, cy);
  ctx.textAlign = 'right';
  ctx.font = `500 ${Math.round(Math.min(h * 0.24, u * 0.022))}px ${FONT_MONO}`;
  ctx.fillText('ADMIT ONE', win.x + win.w - u * 0.03, cy - h * 0.13);
  ctx.fillText(fitText(ctx, (meta.title || 'ONE DAY').toUpperCase(), win.w * 0.3, `500 {s} ${FONT_MONO}`, Math.round(Math.min(h * 0.24, u * 0.022)), 7), win.x + win.w - u * 0.03, cy + h * 0.16);
}

/** Photostrip backings for frames whose texture should carry onto the strip. */
const STRIP_PAINT = {
  denim: (ctx, w, h) => {
    denimFill(ctx, 0, 0, w, h, w);
    laceTrim(ctx, 0, w, 0, 1, w);
    laceTrim(ctx, 0, w, h, -1, w);
  },
  knit: (ctx, w, h) => knitBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  cocoa: (ctx, w, h) => {
    ctx.fillStyle = '#3a2822';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#efe6d7';
    for (let y = w * 0.05, r = 0; y < h; y += w * 0.16, r++) for (let x = (r % 2 ? w * 0.08 : 0) + w * 0.03; x < w; x += w * 0.16) { ctx.beginPath(); ctx.arc(x, y, w * 0.022, 0, Math.PI * 2); ctx.fill(); }
  },
  reel: (ctx, w, h) => reelBack(ctx, { W: w, H: h, u: w, win: { x: w * 0.07, y: -1e5, w: w * 0.86, h: 0 } }),
  airmail: (ctx, w, h) => {
    ctx.fillStyle = '#f2e9d6';
    ctx.fillRect(0, 0, w, h);
    airmailStripes(ctx, 0, 0, w, h, w * 0.025, w);
  },
  matinee: (ctx, w, h) => denimFill(ctx, 0, 0, w, h, w, '#2f4672'),
};

const PAINTERS = {
  none: [noneBack, () => {}],
  booth: [boothBack, boothFront],
  lace: [laceBack, () => {}],
  stamp: [stampBack, stampFront],
  ticket: [ticketBack, ticketFront],
  denim: [denimBack, denimFront],
  knit: [knitBack, knitFront],
  cocoa: [cocoaBack, cocoaFront],
  reel: [reelBack, reelFront],
  airmail: [airmailBack, airmailFront],
  matinee: [matineeBack, matineeFront],
  polka: [polkaBack, () => {}],
  stripe: [stripeBack, stripeFront],
};

/** No frame: nothing around the picture, a dark bar under it for the controls. */
function noneBack(ctx, L) {
  if (L.Hd != null && L.Hd < L.H) {
    ctx.fillStyle = '#16110d';
    ctx.fillRect(0, L.Hd, L.W, L.H - L.Hd);
  }
}

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
  if (STRIP_PAINT[border.id]) STRIP_PAINT[border.id](ctx, width, H);
  else if (s.wood) woodGrain(ctx, 0, 0, width, H, width);
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
