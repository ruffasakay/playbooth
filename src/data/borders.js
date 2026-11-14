/**
 * Photo frames. One painter draws each frame everywhere it appears:
 * around the playing video, on the booth's television, in captured photos
 * and in photostrips. Sizes are fractions of the photo's width.
 *
 * Frames are pictures only: no words, no numbers. Each frame also carries
 * `ui`, the paper and ink its control dock and keys are made of.
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
    ui: ui({ dock: '#17110d', surface: '#f4ede0', ink: '#33261c', band: '#f4ede0', accent: '#cf6a4c', track: 'rgb(244 237 224 / 0.22)', play: ['#f4ede0', '#1b1511'], playKey: ['#cf6a4c', '#fff8ef'] }),
  },
  /* ---- from your references, ranked by design and uniqueness ---- */
  {
    id: 'vinyl',
    name: 'Vinyl cream',
    hint: 'Cream card with a black record peeking out and red hearts.',
    pads: { t: 0.045, r: 0.095, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#f1e8d8', '#16120f'],
    strip: { bg: '#f1e8d8', ink: '#8e1f26' },
    ui: ui({ dock: '#f1e8d8', surface: '#fbf6ec', ink: '#8e1f26', band: '#8e1f26', accent: '#c2363e', track: 'rgb(142 31 38 / 0.18)', play: ['#8e1f26', '#fbf6ec'] }),
  },
  {
    id: 'confetti',
    name: 'Star confetti',
    hint: 'White card with bright paper stars stuck all around.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#ffffff', '#e0463c'],
    strip: { bg: '#ffffff', ink: '#33261c' },
    ui: ui({ dock: '#ffffff', surface: '#ffffff', ink: '#2c3e8f', band: '#2c3e8f', accent: '#f0b429', track: 'rgb(44 62 143 / 0.18)', play: ['#2c3e8f', '#ffffff'] }),
  },
  {
    id: 'comic',
    name: 'Comic blocks',
    hint: 'Four halftone colour blocks and a bold ink panel, like a comic page.',
    pads: { t: 0.05, r: 0.05, b: 0.055, l: 0.05 },
    radius: 0,
    swatch: ['#7fa6d6', '#a8c48f'],
    strip: { bg: '#f4ecdc', ink: '#5a3f2c' },
    ui: ui({ dock: '#7fa6d6', surface: '#fbf7ee', ink: '#3b4f78', band: '#fbf7ee', accent: '#f4d35e', track: 'rgb(251 247 238 / 0.28)', play: ['#3b4f78', '#fbf7ee'] }),
  },
  {
    id: 'lace',
    name: 'Lace',
    hint: 'A cotton lace doily laid on a dark wooden table.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#4a3125', '#f5ebe7'],
    strip: { bg: C.wood, ink: '#f5ebe7', wood: true },
    ui: ui({ dock: '#f5ebe7', surface: '#fbf6f2', ink: '#4a3125', band: '#4a3125', accent: '#7a5340', track: 'rgb(74 49 37 / 0.22)', play: ['#4a3125', '#fbf6f2'], edge: 'lace', bar: 'lace', thumb: 'flower', thumbColor: '#7a5340' }),
  },
  {
    id: 'reel',
    name: 'Red film',
    hint: 'A strip of red film with sprocket holes down both sides.',
    pads: { t: 0.045, r: 0.055, b: 0.06, l: 0.055 },
    radius: 0,
    swatch: ['#8a2b2b', '#f5ede1'],
    strip: { bg: '#8a2b2b', ink: '#f5ede1' },
    ui: ui({ dock: '#8a2b2b', surface: '#f5ede1', ink: '#8a2b2b', band: '#f5ede1', accent: '#f5ede1', track: 'rgb(245 237 225 / 0.22)', play: ['#f5ede1', '#8a2b2b'], bar: 'film', thumb: 'sprocket' }),
  },
  {
    id: 'lavender',
    name: 'Lavender swirl',
    hint: 'Lilac paper with soft scrollwork and a little pixel flower.',
    pads: { t: 0.05, r: 0.05, b: 0.08, l: 0.05 },
    radius: 0,
    swatch: ['#b9a7cf', '#ffffff'],
    strip: { bg: '#c2b2d8', ink: '#5f4c80' },
    ui: ui({ dock: '#b9a7cf', surface: '#f6f1fb', ink: '#5f4c80', band: '#f6f1fb', accent: '#d9c9f0', track: 'rgb(246 241 251 / 0.25)', play: ['#5f4c80', '#f6f1fb'] }),
  },
  {
    id: 'knit',
    name: 'Red knit',
    hint: 'A burgundy knit with a stamp-cut mat, a ribbon bow, a pin and a button.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#86232a', '#fbf7f0'],
    strip: { bg: '#86232a', ink: '#fbf7f0' },
    ui: ui({ dock: '#86232a', surface: '#fbf7f0', ink: '#86232a', band: '#fbf7f0', accent: '#fbf7f0', track: 'rgb(251 247 240 / 0.28)', play: ['#fbf7f0', '#86232a'], edge: 'perf', bar: 'perf', thumb: 'button', thumbColor: '#efe8dc' }),
  },
  {
    id: 'heart',
    name: 'Paper hearts',
    hint: 'Crinkled pink paper, a white mat and paper hearts cut out all around.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#f2b8c6', '#ffffff'],
    strip: { bg: '#f2b8c6', ink: '#5b7fc4' },
    ui: ui({ dock: '#f2b8c6', surface: '#fff5f8', ink: '#b23a5e', band: '#fff5f8', accent: '#ffe1ea', track: 'rgb(255 245 248 / 0.3)', play: ['#b23a5e', '#fff5f8'] }),
  },
  {
    id: 'airmail',
    name: 'Airmail',
    hint: 'Ledger paper, airmail stripes, a postmark and a paperclip.',
    pads: { t: 0.045, r: 0.045, b: 0.05, l: 0.045 },
    radius: 0,
    swatch: ['#f2e9d6', '#b8433a'],
    strip: { bg: '#f2e9d6', ink: '#2f4a86' },
    ui: ui({ dock: '#f2e9d6', surface: '#f8f2e8', ink: '#2f4a86', band: '#2f4a86', accent: '#b8433a', track: 'rgb(47 74 134 / 0.18)', play: ['#2f4a86', '#f8f2e8'], edge: 'airmail', bar: 'airmail', thumb: 'star', thumbColor: '#b8433a' }),
  },
  {
    id: 'matinee',
    name: 'Matinee',
    hint: 'Dark denim with a cream admission ticket above the picture.',
    pads: { t: 0.09, r: 0.045, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#2f4672', '#f4e9d8'],
    strip: { bg: '#2f4672', ink: '#f4e9d8' },
    ui: ui({ dock: '#2f4672', surface: '#f4e9d8', ink: '#a3323a', band: '#f4e9d8', accent: '#f4e9d8', track: 'rgb(244 233 216 / 0.25)', play: ['#f4e9d8', '#a3323a'], edge: 'ticket', bar: 'stitch' }),
  },
  {
    id: 'denim',
    name: 'Denim & lace',
    hint: 'Blue denim edged in lace, with two gingham star patches.',
    pads: { t: 0.045, r: 0.045, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#4c6a96', '#f7f1ea'],
    strip: { bg: '#4c6a96', ink: '#f7f1ea' },
    ui: ui({ dock: '#4c6a96', surface: '#f7f1ea', ink: '#2d4166', band: '#f7f1ea', accent: '#f2c6cf', track: 'rgb(247 241 234 / 0.3)', play: ['#f7f1ea', '#2d4166'], edge: 'lace', bar: 'stitch', thumb: 'star', thumbColor: '#ecd77c' }),
  },
  {
    id: 'vinylred',
    name: 'Vinyl red',
    hint: 'Deep red card with a clear record and white hearts.',
    pads: { t: 0.045, r: 0.095, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#8e1f26', '#efe9e1'],
    strip: { bg: '#8e1f26', ink: '#f6ece2' },
    ui: ui({ dock: '#8e1f26', surface: '#fbf3ea', ink: '#8e1f26', band: '#fbf3ea', accent: '#f6c9cc', track: 'rgb(251 243 234 / 0.25)', play: ['#8e1f26', '#fbf3ea'] }),
  },
  {
    id: 'oval',
    name: 'Comic wave',
    hint: 'Leaf-green halftone, a wavy cream mat and a yellow starburst.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#a8c48f', '#f4d35e'],
    strip: { bg: '#a8c48f', ink: '#3f5a3b' },
    ui: ui({ dock: '#a8c48f', surface: '#fbf7ee', ink: '#3f5a3b', band: '#2c4129', accent: '#fbf7ee', track: 'rgb(44 65 41 / 0.2)', play: ['#3f5a3b', '#fbf7ee'] }),
  },
  {
    id: 'butter',
    name: 'Butter doodle',
    hint: 'Butter-yellow paper with blue pen doodles: a cup, a record, hearts.',
    pads: { t: 0.05, r: 0.05, b: 0.085, l: 0.05 },
    radius: 0,
    swatch: ['#f8f0bf', '#5b7fc4'],
    strip: { bg: '#f8f0bf', ink: '#5b7fc4' },
    ui: ui({ dock: '#f8f0bf', surface: '#fffcea', ink: '#3d5fa6', band: '#3d5fa6', accent: '#7d9edb', track: 'rgb(61 95 166 / 0.18)', play: ['#3d5fa6', '#fffcea'] }),
  },
  {
    id: 'pixel',
    name: 'Pixel lilac',
    hint: 'A wide lilac margin with a heart drawn in white dots.',
    pads: { t: 0.045, r: 0.045, b: 0.045, l: 0.12 },
    radius: 0,
    swatch: ['#a99bc0', '#ffffff'],
    strip: { bg: '#a99bc0', ink: '#ffffff' },
    ui: ui({ dock: '#a99bc0', surface: '#f7f3fc', ink: '#56477a', band: '#f7f3fc', accent: '#e6dcf7', track: 'rgb(247 243 252 / 0.25)', play: ['#56477a', '#f7f3fc'] }),
  },
  {
    id: 'cocoa',
    name: 'Cocoa bow',
    hint: 'Chocolate polka dots, a pinked cream mat and a little bow. Memories.',
    pads: { t: 0.045, r: 0.045, b: 0.08, l: 0.045 },
    radius: 0,
    swatch: ['#3a2822', '#efe6d7'],
    strip: { bg: '#3a2822', ink: '#efe6d7' },
    ui: ui({ dock: '#3a2822', surface: '#f8f2e6', ink: '#3a2822', band: '#efe6d7', accent: '#e7c9a9', track: 'rgb(239 230 215 / 0.22)', play: ['#f4ecdd', '#3a2822'], edge: 'zigzag', bar: 'dots', thumb: 'bow', thumbColor: '#c79b7c' }),
  },
  {
    id: 'vinylpink',
    name: 'Vinyl pink',
    hint: 'Blush pink with soft hearts, a black record and white doodles.',
    pads: { t: 0.045, r: 0.095, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#f2cfd3', '#16120f'],
    strip: { bg: '#f2cfd3', ink: '#3a2528' },
    ui: ui({ dock: '#f2cfd3', surface: '#fff7f8', ink: '#3a2528', band: '#3a2528', accent: '#d9677a', track: 'rgb(58 37 40 / 0.16)', play: ['#3a2528', '#fff7f8'] }),
  },
  {
    id: 'news',
    name: 'Newsprint',
    hint: 'Cream newsprint, a halftone wash, a black band of hearts and stickers.',
    pads: { t: 0.07, r: 0.045, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#f3ecdc', '#1d1a17'],
    strip: { bg: '#f3ecdc', ink: '#1d1a17' },
    ui: ui({ dock: '#f3ecdc', surface: '#fffaf0', ink: '#1d1a17', band: '#1d1a17', accent: '#5b7fc4', track: 'rgb(29 26 23 / 0.16)', play: ['#1d1a17', '#fffaf0'] }),
  },
  {
    id: 'mono',
    name: 'Black strip',
    hint: 'A black and white booth strip with soft rounded corners.',
    pads: { t: 0.04, r: 0.045, b: 0.04, l: 0.045 },
    radius: 0.018,
    swatch: ['#141210', '#f4f1ea'],
    strip: { bg: '#141210', ink: '#f4f1ea' },
    ui: ui({ dock: '#141210', surface: '#f4f1ea', ink: '#141210', band: '#f4f1ea', accent: '#f4f1ea', track: 'rgb(244 241 234 / 0.22)', play: ['#141210', '#f4f1ea'] }),
  },
  /* ---- the booth's own, ranked the same way ---- */
  {
    id: 'velvet',
    name: 'Velvet curtain',
    hint: 'Deep red velvet and a gold rope, like the front row of an old cinema.',
    pads: { t: 0.055, r: 0.055, b: 0.055, l: 0.055 },
    radius: 0,
    swatch: ['#6e1420', '#d9a646'],
    strip: { bg: '#6e1420', ink: '#e7c27a' },
    ui: ui({ dock: '#5a101a', surface: '#f3e3c2', ink: '#5a101a', band: '#f0d9a4', accent: '#e2b85c', track: 'rgb(240 217 164 / 0.22)', play: ['#f3e3c2', '#5a101a'] }),
  },
  {
    id: 'crochet',
    name: 'Granny squares',
    hint: 'A blanket of crocheted squares in warm yarn around the picture.',
    pads: { t: 0.06, r: 0.06, b: 0.06, l: 0.06 },
    radius: 0,
    swatch: ['#c2703f', '#efe4cf'],
    strip: { bg: '#efe4cf', ink: '#7a3f22' },
    ui: ui({ dock: '#e9dcc4', surface: '#f8f0e1', ink: '#7a3f22', band: '#7a3f22', accent: '#c2703f', track: 'rgb(122 63 34 / 0.18)', play: ['#7a3f22', '#f8f0e1'] }),
  },
  {
    id: 'starry',
    name: 'Starry night',
    hint: 'A navy sky full of small stars, with a gold moon in the corner.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    swatch: ['#1b2442', '#e8c56a'],
    strip: { bg: '#1b2442', ink: '#e8c56a' },
    ui: ui({ dock: '#1b2442', surface: '#f2e6c4', ink: '#1b2442', band: '#f2e6c4', accent: '#e8c56a', track: 'rgb(242 230 196 / 0.2)', play: ['#f2e6c4', '#1b2442'] }),
  },
  {
    id: 'checker',
    name: 'Sage checker',
    hint: 'Sage and cream tiles, like a café floor, around a soft cream mat.',
    pads: { t: 0.055, r: 0.055, b: 0.055, l: 0.055 },
    radius: 0.012,
    swatch: ['#9fb08d', '#f4ecdc'],
    strip: { bg: '#f4ecdc', ink: '#4f6b4a' },
    ui: ui({ dock: '#9fb08d', surface: '#f7f1e4', ink: '#3f5a3b', band: '#2f4430', accent: '#f7f1e4', track: 'rgb(47 68 48 / 0.22)', play: ['#f7f1e4', '#3f5a3b'] }),
  },
  {
    id: 'ticket',
    name: 'Cinema ticket',
    hint: 'A cream admission ticket with a punched stub.',
    pads: { t: 0.04, r: 0.04, b: 0.08, l: 0.04 },
    radius: 0,
    swatch: ['#efe4cf', '#33261c'],
    strip: { bg: '#2e231b', ink: '#efe4cf' },
    ui: ui({ dock: '#efe4cf', surface: '#f8f1e3', ink: '#33261c', band: '#33261c', accent: '#9e4330', track: 'rgb(51 38 28 / 0.2)', play: ['#33261c', '#efe4cf'], edge: 'ticket', bar: 'stitch' }),
  },
  {
    id: 'stamp',
    name: 'Postage stamp',
    hint: 'Deep red with a perforated edge, like a stamp torn from its sheet.',
    pads: { t: 0.045, r: 0.045, b: 0.045, l: 0.045 },
    radius: 0,
    swatch: ['#8c2a22', '#f6f1e7'],
    strip: { bg: '#f1ebe0', ink: C.ink },
    ui: ui({ dock: '#8c2a22', surface: '#f6f1e7', ink: '#8c2a22', band: '#f6f1e7', accent: '#f6f1e7', track: 'rgb(246 241 231 / 0.3)', play: ['#f6f1e7', '#8c2a22'], edge: 'perf', bar: 'perf' }),
  },
  {
    id: 'pressed',
    name: 'Pressed flowers',
    hint: 'Cream card with little flowers and leaves pressed into the margin.',
    pads: { t: 0.055, r: 0.055, b: 0.055, l: 0.055 },
    radius: 0,
    swatch: ['#f3ecdf', '#7d9468'],
    strip: { bg: '#f3ecdf', ink: '#4f6b4a' },
    ui: ui({ dock: '#f3ecdf', surface: '#fbf7ef', ink: '#3f5a3b', band: '#3f5a3b', accent: '#7d9468', track: 'rgb(63 90 59 / 0.18)', play: ['#3f5a3b', '#fbf7ef'] }),
  },
  {
    id: 'polka',
    name: 'Red polka',
    hint: 'Burgundy with small cream dots and softened corners.',
    pads: { t: 0.045, r: 0.045, b: 0.045, l: 0.045 },
    radius: 0.03,
    swatch: ['#6b2024', '#efe4cf'],
    strip: { bg: '#f1ebe0', ink: C.ink },
    ui: ui({ dock: '#6b2024', surface: '#efe4cf', ink: '#6b2024', band: '#efe4cf', accent: '#efe4cf', track: 'rgb(239 228 207 / 0.28)', play: ['#efe4cf', '#6b2024'], bar: 'dots' }),
  },
  {
    id: 'stripe',
    name: 'Linen stripe',
    hint: 'Pale linen with fine brown pinstripes and a little oval label.',
    pads: { t: 0.04, r: 0.04, b: 0.04, l: 0.04 },
    radius: 0.022,
    swatch: ['#ece3d3', '#7b5a42'],
    strip: { bg: '#ece3d3', ink: C.ink, stripes: true },
    ui: ui({ dock: '#ece3d3', surface: '#f6efe3', ink: '#5a3f2c', band: '#33261c', accent: '#7b5a42', track: 'rgb(123 90 66 / 0.22)', play: ['#7b5a42', '#f6efe3'], edge: 'stitch', bar: 'pin' }),
  },
  {
    id: 'booth',
    name: 'Booth white',
    hint: 'The plain white edge of a real photobooth print, stamped at the bottom.',
    pads: { t: 0.03, r: 0.03, b: 0.06, l: 0.03 },
    radius: 0,
    swatch: ['#f6f1e7', '#d8d0c3'],
    strip: { bg: '#f6f1e7', ink: C.ink },
    ui: ui({ dock: '#f6f1e7', surface: '#ece4d6', ink: '#33261c', band: '#33261c', accent: '#33261c', track: 'rgb(51 38 28 / 0.16)', play: ['#33261c', '#f6f1e7'] }),
  },
];

export const borderById = (id) => BORDERS.find((b) => b.id === id) ?? (id === 'custom' ? CUSTOM.border : null) ?? BORDERS[1];

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

/** The opening the picture shows through: always a straight-edged rectangle, so nothing crops the film. */
export function windowPath(ctx, win) {
  const { x, y, w, h } = win;
  ctx.beginPath();
  if (win.r > 0 && ctx.roundRect) ctx.roundRect(x, y, w, h, win.r);
  else ctx.rect(x, y, w, h);
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

function boothFront(ctx, L) {
  const { u, win } = L;
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.5;
  logoMark(ctx, win.x + u * 0.012, y, Math.min(u * 0.05, (L.H - win.y - win.h) * 0.62), C.ink, C.terracotta);
  ctx.fillStyle = 'rgb(51 38 28 / 0.35)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(win.x + win.w - u * 0.008 - i * u * 0.022, y, u * 0.0055, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The PLAYBOOTH mark as a drawing: a three-frame strip, the middle frame lit. */
function logoMark(ctx, x, cy, h, ink, accent) {
  const w = h * 0.44;
  const y = cy - h / 2;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, h * 0.045);
  ctx.strokeRect(x, y, w, h);
  const cw = w * 0.6;
  const ch = h * 0.21;
  const cx = x + (w - cw) / 2;
  [0.1, 0.395, 0.69].forEach((f, i) => {
    ctx.fillStyle = i === 1 ? accent : ink;
    ctx.fillRect(cx, y + h * f, cw, ch);
  });
  ctx.restore();
}

function laceLayer(L) {
  const { u, win, W, H } = L;
  const Hd = L.Hd ?? H; // below this, the controls sit on plain lace
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  // the lace was drawn for a wide margin; on a slim one every stitch shrinks with it
  const k = win.w > 0 ? Math.min(1, Math.min(win.x, win.y) / (u * 0.085)) : 1;
  const inset = u * 0.012 * k;
  const scR = u * 0.022 * k; // scallop radius
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
  const rim = u * 0.01 * k;
  const holeR = u * 0.0042 * k;
  const step = u * 0.0145 * k;
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
    if (r < 1.5) return;
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
  const fr = Math.max(0, Math.min(inner.x - bandOuter, inner.y - bandOuter) * 0.42);
  const count = Math.max(3, Math.round(W / (u * 0.17)));
  for (let i = 0; i <= count; i++) {
    const x = bandOuter + ((W - bandOuter * 2) * i) / count;
    flower(x, midY, fr);
    if (Hd - midY - fr > inner.y + inner.h) flower(x, Hd - midY, fr);
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

function stars(ctx, cx, cy, n, R, gapX, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    starPath(ctx, cx + (i - (n - 1) / 2) * gapX, cy, R, R * 0.45);
    ctx.fill();
  }
}

function ticketBack(ctx, L) {
  ctx.fillStyle = C.cream;
  ctx.fillRect(0, 0, L.W, L.H);
  ctx.strokeStyle = 'rgb(51 38 28 / 0.55)';
  ctx.lineWidth = Math.max(1, L.u * 0.0025);
  const g = L.u * 0.01;
  ctx.strokeRect(L.win.x - g, L.win.y - g, L.win.w + g * 2, L.win.h + g * 2);
}

function ticketFront(ctx, L) {
  const { u, win } = L;
  const stubTop = win.y + win.h + u * 0.035;
  // perforation line
  ctx.fillStyle = 'rgb(51 38 28 / 0.55)';
  for (let x = u * 0.03; x < L.W - u * 0.02; x += u * 0.022) ctx.fillRect(x, stubTop, u * 0.011, Math.max(1, u * 0.003));
  const y = stubTop + (L.H - stubTop) * 0.5;
  const room = L.H - stubTop;
  // a punched hole, three stars, a barcode: a ticket without a word on it
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.beginPath();
  ctx.arc(win.x + u * 0.03, y, Math.min(u * 0.018, room * 0.28), 0, Math.PI * 2);
  ctx.stroke();
  stars(ctx, L.W / 2, y, 3, Math.min(u * 0.016, room * 0.24), u * 0.05, C.terracotta);
  let bx = win.x + win.w - u * 0.17;
  for (let i = 0; i < 34; i++) {
    const bw = u * (i % 3 === 0 ? 0.0045 : 0.0022);
    ctx.fillStyle = C.ink;
    ctx.fillRect(bx, y - Math.min(u * 0.03, room * 0.34), bw, Math.min(u * 0.06, room * 0.68));
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
  const calm = (y) => L.Hb != null && y > L.Hd - step * 0.4 && y < L.Hb + step * 0.4; // a plain strip behind the controls
  for (let y = step / 2, row = 0; y < L.H; y += step, row++) {
    if (calm(y)) continue;
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
  if (L.Hb != null) {
    // a plain linen tape behind the controls, stitched along both edges
    const y0 = L.Hd - u * 0.008;
    const y1 = L.Hb + u * 0.008;
    ctx.fillStyle = C.linen;
    ctx.fillRect(0, y0, L.W, y1 - y0);
    ctx.save();
    ctx.setLineDash([u * 0.01, u * 0.007]);
    ctx.strokeStyle = 'rgb(123 90 66 / 0.55)';
    ctx.lineWidth = Math.max(1, u * 0.0022);
    for (const y of [y0 + u * 0.006, y1 - u * 0.006]) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(L.W, y);
      ctx.stroke();
    }
    ctx.restore();
  }
  // linen weave
  ctx.fillStyle = 'rgb(51 38 28 / 0.03)';
  for (let y = 0; y < L.H; y += Math.max(2, u * 0.004)) ctx.fillRect(0, y, L.W, 1);
}

function stripeFront(ctx, L) {
  const { u, win } = L;
  const room = L.H - win.y - win.h;
  const cx = win.x + win.w - u * 0.1;
  const cy = win.y + win.h + room / 2;
  const ry = Math.min(u * 0.026, room * 0.36);
  ctx.save();
  ctx.fillStyle = C.linen;
  ctx.strokeStyle = C.stripe;
  ctx.lineWidth = Math.max(1, u * 0.003);
  ctx.beginPath();
  ctx.ellipse(cx, cy, ry * 2.6, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  logoMark(ctx, cx - ry * 0.35, cy, ry * 1.5, C.ink, C.terracotta);
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

/** The margin around the picture on each side, for stickers that must stay off the film. */
function margins(L) {
  const { win, W, H } = L;
  return { l: win.x, t: win.y, r: W - win.x - win.w, b: H - win.y - win.h, right: win.x + win.w, bottom: win.y + win.h };
}

function denimFront(ctx, L) {
  const { u, win } = L;
  if (!(win.w > 0)) return;
  const m = margins(L);
  // two star patches sewn into the margin corners
  starPatch(ctx, m.l * 0.5, win.y + win.h * 0.66, m.l * 0.62, u, '#ecd77c', '#f6eab0', -1.9);
  starPatch(ctx, m.right + m.r * 0.5, m.t * 0.5 + u * 0.004, Math.min(m.r, m.t) * 0.55, u, '#e9b8c2', '#f6dbe1', -1.2);
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
  if (!(win.w > 0)) return;
  const m = margins(L);
  const P = Math.min(m.t, m.r, m.b, m.l);
  // a bow tied on the top right corner, a pin through the bottom margin, a button at the left
  bow(ctx, m.right - P * 0.2, m.t * 0.42, P * 0.78, '#d9d6d1', '#a8a49d');
  safetyPin(ctx, win.x + win.w * 0.08, m.bottom + m.b * 0.42, Math.min(u * 0.11, win.w * 0.12), 0, Math.min(u, P * 14));
  sewButton(ctx, m.l * 0.5, m.bottom - win.h * 0.12, m.l * 0.3, '#efe8dc');
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
  const bottom = L.Hb != null ? L.Hb + u * 0.014 : win.y + win.h + below;
  pinkedMat(ctx, win.x - m, win.y - m, win.w + m * 2, bottom - (win.y - m), u);
}

function cocoaFront(ctx, L) {
  const { u, win } = L;
  const m = u * 0.03;
  const below = Math.min(u * 0.075, L.H - (win.y + win.h) - m);
  const y = win.y + win.h + below * 0.55;
  // a stitched line with a little heart sewn in the middle
  ctx.save();
  ctx.strokeStyle = '#6b4632';
  ctx.lineWidth = Math.max(1, u * 0.0028);
  ctx.setLineDash([u * 0.012, u * 0.008]);
  const hw = u * 0.022;
  ctx.beginPath();
  ctx.moveTo(win.x + win.w * 0.2, y);
  ctx.lineTo(win.x + win.w / 2 - hw * 1.6, y);
  ctx.moveTo(win.x + win.w / 2 + hw * 1.6, y);
  ctx.lineTo(win.x + win.w * 0.8, y);
  ctx.stroke();
  ctx.restore();
  heart(ctx, win.x + win.w / 2, y, hw, '#a5523f');
  const bs = Math.min(u * 0.08, below * 0.75);
  bow(ctx, win.x + bs * 0.8, win.y + win.h + below * 0.5, bs, '#6b4632', '#4a2f22');
}

function heart(ctx, cx, cy, r, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.9);
  ctx.bezierCurveTo(cx - r * 1.6, cy - r * 0.2, cx - r * 0.7, cy - r * 1.3, cx, cy - r * 0.45);
  ctx.bezierCurveTo(cx + r * 0.7, cy - r * 1.3, cx + r * 1.6, cy - r * 0.2, cx, cy + r * 0.9);
  ctx.fill();
  ctx.restore();
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

function reelFront(ctx, L) {
  const { u, win } = L;
  const y = win.y + win.h + (L.H - win.y - win.h) * 0.5;
  const s = Math.min(u * 0.014, (L.H - win.y - win.h) * 0.22);
  // the edge marks printed on real film, as shapes
  ctx.fillStyle = '#f5ede1';
  for (let i = 0; i < 5; i++) {
    const x = win.x + win.w / 2 + (i - 2) * s * 4.2;
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y - s);
    ctx.lineTo(x + s, y);
    ctx.lineTo(x - s * 0.7, y + s);
    ctx.closePath();
    ctx.globalAlpha = i === 2 ? 1 : 0.55;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillRect(win.x, y - Math.max(1, u * 0.0015), win.w * 0.18, Math.max(1, u * 0.003));
  ctx.fillRect(win.x + win.w * 0.82, y - Math.max(1, u * 0.0015), win.w * 0.18, Math.max(1, u * 0.003));
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
  if (!(win.w > 0)) return;
  const m = margins(L);
  const P = Math.min(m.t, m.r);
  // a postmark in the top margin, its wavy cancel lines running to the left
  const R = P * 0.42;
  const cx = m.right - R * 1.2;
  const cy = m.t * 0.5;
  ctx.save();
  ctx.strokeStyle = 'rgb(60 50 70 / 0.55)';
  ctx.lineWidth = Math.max(1, R * 0.07);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.74, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let x = 0; x <= R * 2.8; x += R * 0.1) ctx.lineTo(cx - R * 4.2 + x, cy - R * 0.45 + i * R * 0.45 + Math.sin(x / (R * 0.28)) * R * 0.08);
    ctx.stroke();
  }
  starPath(ctx, cx, cy, R * 0.36, R * 0.16);
  ctx.fillStyle = 'rgb(60 50 70 / 0.55)';
  ctx.fill();
  ctx.restore();
  // a paperclip lying along the top margin
  const k = (m.t * 0.7) / 0.03;
  ctx.save();
  ctx.translate(win.x + u * 0.03, m.t * 0.5);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(k / u, k / u);
  ctx.translate(-u * 0.012, -u * 0.045);
  ctx.strokeStyle = '#9d9a94';
  ctx.lineWidth = Math.max(1, u * 0.004) * (u / k);
  ctx.beginPath();
  ctx.moveTo(0, u * 0.08);
  ctx.lineTo(0, u * 0.012);
  ctx.arc(u * 0.012, u * 0.012, u * 0.012, Math.PI, 0);
  ctx.lineTo(u * 0.024, u * 0.07);
  ctx.arc(u * 0.016, u * 0.07, u * 0.008, 0, Math.PI);
  ctx.lineTo(u * 0.008, u * 0.03);
  ctx.stroke();
  ctx.restore();
  starPath(ctx, m.right + m.r * 0.5, m.bottom + m.b * 0.5, Math.min(m.r, m.b) * 0.42, Math.min(m.r, m.b) * 0.19, -1.5);
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

function matineeFront(ctx, L) {
  const { u, win } = L;
  const top = u * 0.025;
  const h = win.y - u * 0.05;
  const cy = top + h / 2;
  const r = Math.min(h * 0.3, u * 0.028);
  // a little film reel, a row of stars, a barcode
  ctx.save();
  ctx.fillStyle = '#a3323a';
  const rx = win.x + u * 0.03 + r;
  ctx.beginPath();
  ctx.arc(rx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(rx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(rx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  stars(ctx, win.x + win.w / 2, cy, 5, Math.min(h * 0.16, u * 0.014), u * 0.042, '#a3323a');
  let bx = win.x + win.w - u * 0.15;
  for (let i = 0; i < 26; i++) {
    const bw = u * (i % 3 === 0 ? 0.004 : 0.002);
    ctx.fillStyle = '#a3323a';
    ctx.fillRect(bx, cy - h * 0.26, bw, h * 0.52);
    bx += bw + u * 0.002;
  }
}

/* ---------- Velvet curtain ---------- */

function velvetBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#6e1420';
  ctx.fillRect(0, 0, W, H);
  // soft folds
  const n = Math.max(6, Math.round(W / (u * 0.07)));
  for (let i = 0; i < n; i++) {
    const x0 = (i * W) / n;
    const g = ctx.createLinearGradient(x0, 0, x0 + W / n, 0);
    g.addColorStop(0, 'rgb(0 0 0 / 0.3)');
    g.addColorStop(0.45, 'rgb(255 210 210 / 0.08)');
    g.addColorStop(1, 'rgb(0 0 0 / 0.3)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, 0, W / n + 1, H);
  }
  const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  v.addColorStop(0, 'rgb(0 0 0 / 0)');
  v.addColorStop(1, 'rgb(0 0 0 / 0.4)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  if (win.w > 0) rope(ctx, win.x - u * 0.022, win.y - u * 0.022, win.w + u * 0.044, win.h + u * 0.044, u * 0.016);
}

/** A twisted gold rope along a rectangle. */
function rope(ctx, x, y, w, h, t) {
  ctx.save();
  ctx.lineWidth = t;
  ctx.strokeStyle = '#a8792a';
  ctx.strokeRect(x, y, w, h);
  const seg = t * 0.85;
  const run = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / seg));
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.translate(x0 + ux * (i + 0.5) * (len / n), y0 + uy * (i + 0.5) * (len / n));
      ctx.rotate(Math.atan2(uy, ux) + 0.85);
      ctx.fillStyle = '#efcf7d';
      ctx.beginPath();
      ctx.ellipse(0, 0, t * 0.52, t * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };
  run(x, y, x + w, y);
  run(x + w, y, x + w, y + h);
  run(x + w, y + h, x, y + h);
  run(x, y + h, x, y);
  ctx.restore();
}

function tassel(ctx, x, y, len) {
  ctx.save();
  ctx.fillStyle = '#d9a646';
  ctx.beginPath();
  ctx.arc(x, y + len * 0.16, len * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - len * 0.08, y + len * 0.3);
  ctx.lineTo(x + len * 0.08, y + len * 0.3);
  ctx.lineTo(x + len * 0.17, y + len);
  ctx.lineTo(x - len * 0.17, y + len);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a8792a';
  ctx.lineWidth = Math.max(1, len * 0.02);
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * len * 0.02, y + len * 0.36);
    ctx.lineTo(x + i * len * 0.046, y + len * 0.97);
    ctx.stroke();
  }
  ctx.fillStyle = '#a8792a';
  ctx.fillRect(x - len * 0.1, y + len * 0.27, len * 0.2, len * 0.06);
  ctx.restore();
}

function velvetFront(ctx, L) {
  const { u, win } = L;
  const len = Math.min(u * 0.075, win.x * 0.9);
  tassel(ctx, win.x - u * 0.045, win.y - u * 0.03, len);
  tassel(ctx, win.x + win.w + u * 0.045, win.y - u * 0.03, len);
}

/* ---------- Pressed flowers ---------- */

function seeded(n) {
  let x = n * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}

function sprig(ctx, x, y, s, angle, flower) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.strokeStyle = '#6f8a5c';
  ctx.lineWidth = Math.max(1, s * 0.035);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.5);
  ctx.quadraticCurveTo(s * 0.1, 0, 0, -s * 0.42);
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const t = 0.32 - i * 0.2;
    const side = i % 2 ? 1 : -1;
    ctx.save();
    ctx.translate(s * 0.04, t * s);
    ctx.rotate(side * 0.95);
    ctx.fillStyle = i % 2 ? '#7d9468' : '#93a77a';
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.09, s * 0.045, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, -s * 0.46);
  ctx.fillStyle = flower;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * s * 0.07, Math.sin(a) * s * 0.07, s * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8c56a';
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pressedBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#f3ecdf';
  ctx.fillRect(0, 0, W, H);
  const rnd = seeded(11);
  ctx.fillStyle = 'rgb(120 100 70 / 0.08)';
  for (let i = 0; i < (W * H) / (u * u) * 900; i++) ctx.fillRect(rnd() * W, rnd() * H, u * 0.002, u * 0.002);
  if (win.w > 0) {
    ctx.strokeStyle = '#7d9468';
    ctx.lineWidth = Math.max(1, u * 0.0025);
    const g = u * 0.016;
    ctx.strokeRect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2);
  }
  // sprigs around the margin, alternating leaning in and out
  const colors = ['#d98c7a', '#b9a3c9', '#e7a96b', '#d98c7a', '#9fb7c9'];
  const size = Math.min(u * 0.1, Math.max(win.x, u * 0.06) * 1.05);
  const place = (x, y, a, i) => sprig(ctx, x, y, size, a + (rnd() - 0.5) * 0.5, colors[i % colors.length]);
  let i = 0;
  const step = u * 0.12;
  const topY = win.w > 0 ? win.y / 2 : size * 0.7;
  const botY = win.w > 0 ? H - (H - win.y - win.h) / 2 : H - size * 0.7;
  const leftX = win.w > 0 ? win.x / 2 : size * 0.7;
  const rightX = win.w > 0 ? W - (W - win.x - win.w) / 2 : W - size * 0.7;
  for (let x = step * 0.6; x < W - step * 0.3; x += step) {
    place(x, topY, Math.PI / 2 + (i % 2 ? 0.5 : -0.5), i++);
    place(W - x, botY, -Math.PI / 2 + (i % 2 ? 0.5 : -0.5), i++);
  }
  for (let y = step * 1.1; y < H - step; y += step) {
    place(leftX, y, (i % 2 ? 0.4 : -0.4), i++);
    place(rightX, H - y, Math.PI + (i % 2 ? 0.4 : -0.4), i++);
  }
}

/* ---------- Granny squares ---------- */

const YARN = [
  ['#c2703f', '#e8c56a', '#7d9468'],
  ['#7d9468', '#d98c7a', '#efe4cf'],
  ['#e8c56a', '#c2703f', '#9fb7c9'],
  ['#d98c7a', '#7d9468', '#e8c56a'],
];

function grannySquare(ctx, x, y, w, h, colors) {
  const s = Math.min(w, h);
  const rounds = ['#f6eddc', ...colors];
  rounds.forEach((c, i) => {
    const ins = i * s * 0.11 + s * 0.02;
    ctx.fillStyle = c;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x + ins, y + ins, w - ins * 2, h - ins * 2, s * 0.06);
    else ctx.rect(x + ins, y + ins, w - ins * 2, h - ins * 2);
    ctx.fill();
  });
  // chain spaces between rounds
  ctx.fillStyle = 'rgb(70 45 30 / 0.28)';
  for (let r = 1; r <= 3; r++) {
    const ins = r * s * 0.11 + s * 0.02 - s * 0.012;
    const n = 4 - (r - 1);
    for (let k = 0; k < n; k++) {
      const f = (k + 0.5) / n;
      for (const [px, py] of [[x + ins + (w - ins * 2) * f, y + ins], [x + ins + (w - ins * 2) * f, y + h - ins], [x + ins, y + ins + (h - ins * 2) * f], [x + w - ins, y + ins + (h - ins * 2) * f]]) {
        ctx.beginPath();
        ctx.arc(px, py, s * 0.018, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.fillStyle = 'rgb(70 45 30 / 0.35)';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function crochetBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#efe4cf';
  ctx.fillRect(0, 0, W, H);
  const band = win.w > 0 ? Math.min(win.x, win.y) : u * 0.12;
  const nx = Math.max(3, Math.round(W / band));
  const sw = W / nx;
  const ny = Math.max(2, Math.round((H - band * 2) / band));
  const sh = (H - band * 2) / ny;
  let k = 0;
  for (let i = 0; i < nx; i++) {
    grannySquare(ctx, i * sw, 0, sw, band, YARN[k++ % 4]);
    grannySquare(ctx, i * sw, H - band, sw, band, YARN[k++ % 4]);
  }
  for (let j = 0; j < ny; j++) {
    grannySquare(ctx, 0, band + j * sh, band, sh, YARN[k++ % 4]);
    grannySquare(ctx, W - band, band + j * sh, band, sh, YARN[k++ % 4]);
  }
  if (win.w > 0) {
    const g = u * 0.012;
    ctx.fillStyle = '#f6eddc';
    ctx.fillRect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2);
    ctx.strokeStyle = '#c2703f';
    ctx.setLineDash([u * 0.008, u * 0.006]);
    ctx.lineWidth = Math.max(1, u * 0.003);
    ctx.strokeRect(win.x - g * 0.5, win.y - g * 0.5, win.w + g, win.h + g);
    ctx.setLineDash([]);
  }
}

/* ---------- Starry night ---------- */

function starryBack(ctx, L) {
  const { u, win, W, H } = L;
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, '#151d3a');
  g.addColorStop(1, '#2a2f58');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const rnd = seeded(5);
  const count = Math.round((W * H) / (u * u) * 260);
  for (let i = 0; i < count; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const r = u * (0.0016 + rnd() * 0.003);
    ctx.globalAlpha = 0.35 + rnd() * 0.65;
    ctx.fillStyle = rnd() > 0.8 ? '#f6d98c' : '#f4ede0';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (let i = 0; i < Math.round((W * H) / (u * u) * 8); i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    ctx.fillStyle = '#f6d98c';
    starPath(ctx, x, y, u * 0.012, u * 0.0035, rnd());
    ctx.fill();
  }
  if (win.w > 0) {
    ctx.fillStyle = '#e8c56a';
    const gp = u * 0.018;
    const dot = u * 0.0035;
    const step = u * 0.014;
    for (let x = win.x - gp; x <= win.x + win.w + gp; x += step) {
      ctx.fillRect(x, win.y - gp, dot, dot);
      ctx.fillRect(x, win.y + win.h + gp, dot, dot);
    }
    for (let y = win.y - gp; y <= win.y + win.h + gp; y += step) {
      ctx.fillRect(win.x - gp, y, dot, dot);
      ctx.fillRect(win.x + win.w + gp, y, dot, dot);
    }
  }
}

function starryFront(ctx, L) {
  const { u, win } = L;
  const r = Math.min(win.y * 0.34, u * 0.032);
  const cx = win.x + win.w - u * 0.05;
  const cy = win.y * 0.5;
  // a crescent: a gold disc with a bite taken out of it
  const c = document.createElement('canvas');
  c.width = Math.ceil(r * 2.4);
  c.height = Math.ceil(r * 2.4);
  const g = c.getContext('2d');
  g.fillStyle = '#e8c56a';
  g.beginPath();
  g.arc(c.width / 2, c.height / 2, r, 0, Math.PI * 2);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(c.width / 2 + r * 0.45, c.height / 2 - r * 0.25, r * 0.85, 0, Math.PI * 2);
  g.fill();
  ctx.drawImage(c, cx - c.width / 2, cy - c.height / 2);
}

/* ---------- Sage checker ---------- */

function checkerBack(ctx, L) {
  const { u, win, W, H } = L;
  const s = u * 0.042;
  for (let y = 0, r = 0; y < H; y += s, r++) {
    for (let x = 0, q = 0; x < W; x += s, q++) {
      ctx.fillStyle = (r + q) % 2 ? '#9fb08d' : '#f4ecdc';
      ctx.fillRect(x, y, s + 0.5, s + 0.5);
    }
  }
  if (win.w > 0) {
    const m = u * 0.03;
    ctx.save();
    ctx.shadowColor = 'rgb(40 50 35 / 0.3)';
    ctx.shadowBlur = u * 0.014;
    ctx.shadowOffsetY = u * 0.004;
    ctx.fillStyle = '#f7f1e4';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(win.x - m, win.y - m, win.w + m * 2, win.h + m * 2, u * 0.022);
    else ctx.rect(win.x - m, win.y - m, win.w + m * 2, win.h + m * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#7d9468';
    ctx.lineWidth = Math.max(1, u * 0.0025);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(win.x - m * 0.45, win.y - m * 0.45, win.w + m * 0.9, win.h + m * 0.9, u * 0.016);
    else ctx.rect(win.x - m * 0.45, win.y - m * 0.45, win.w + m * 0.9, win.h + m * 0.9);
    ctx.stroke();
  }
}

/* ---------- frames from the booth's own references ---------- */

function grain(ctx, W, H, u, color, seed = 3, density = 700) {
  const rnd = seeded(seed);
  ctx.fillStyle = color;
  const n = Math.round(((W * H) / (u * u)) * density);
  for (let i = 0; i < n; i++) ctx.fillRect(rnd() * W, rnd() * H, u * 0.0022, u * 0.0022);
}

/** A white print edge around the picture, as on a real booth print. */
function printEdge(ctx, win, u, color = '#ffffff', g = 0.012) {
  if (!(win.w > 0)) return;
  const e = u * g;
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.18)';
  ctx.shadowBlur = u * 0.01;
  ctx.shadowOffsetY = u * 0.003;
  ctx.fillStyle = color;
  ctx.fillRect(win.x - e, win.y - e, win.w + e * 2, win.h + e * 2);
  ctx.restore();
}

/** Loose scrollwork curls. */
function swirl(ctx, x, y, r, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, r * 0.09);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 3.2; t += 0.12) {
    const rr = r * (1 - t / (Math.PI * 3.6));
    const px = Math.cos(t) * rr;
    const py = Math.sin(t) * rr;
    if (t === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.bezierCurveTo(r * 1.8, r * 0.2, r * 2.2, -r * 0.9, r * 3, -r * 0.4);
  ctx.stroke();
  ctx.restore();
}

const PIXEL_FLOWER = [
  '..##.##..',
  '.#######.',
  '###...###',
  '.##.#.##.',
  '###...###',
  '.#######.',
  '..##.##..',
  '....#....',
  '.##.#....',
  '..###.##.',
  '....###..',
  '....#....',
];

function pixelArt(ctx, rows, cx, cy, cell, color) {
  const w = rows[0].length * cell;
  const h = rows.length * cell;
  ctx.fillStyle = color;
  rows.forEach((row, j) => {
    [...row].forEach((c, i) => {
      if (c === '#') ctx.fillRect(cx - w / 2 + i * cell, cy - h / 2 + j * cell, cell * 0.92, cell * 0.92);
    });
  });
}

function lavenderBack(ctx, L) {
  const { u, win, W, H } = L;
  const g = ctx.createLinearGradient(0, 0, W * 0.4, H);
  g.addColorStop(0, '#c7b7dd');
  g.addColorStop(1, '#ad9ac6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(255 255 255 / 0.18)', 4, 900);
  const rnd = seeded(9);
  for (let i = 0; i < ((W * H) / (u * u)) * 16; i++) swirl(ctx, rnd() * W, rnd() * H, u * (0.024 + rnd() * 0.03), rnd() * 6.28, 'rgb(255 255 255 / 0.42)');
  printEdge(ctx, win, u);
}

function lavenderFront(ctx, L) {
  const { u, win, H } = L;
  if (!(win.w > 0)) return;
  const room = H - (win.y + win.h);
  const cell = Math.min(u * 0.012, (room * 0.8) / PIXEL_FLOWER.length);
  pixelArt(ctx, PIXEL_FLOWER, win.x + win.w / 2, win.y + win.h + room * 0.52, cell, '#6d5a8e');
}

const PIXEL_HEART = ['.##...##.', '####.####', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....'];

function pixelBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#a99bc0';
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(255 255 255 / 0.14)', 6, 800);
  const rnd = seeded(12);
  for (let i = 0; i < ((W * H) / (u * u)) * 6; i++) swirl(ctx, rnd() * W, rnd() * H, u * 0.03, rnd() * 6.28, 'rgb(255 255 255 / 0.18)');
  // a heart in white dots, the way a dot-matrix sign draws it
  const lw = win.w > 0 ? win.x : W * 0.25;
  const sc = 2;
  const cols = PIXEL_HEART[0].length * sc;
  const dot = Math.min((lw * 0.78) / (cols * 1.25), u * 0.014);
  const cx = lw * 0.5;
  const cy = H * 0.5;
  ctx.fillStyle = 'rgb(255 255 255 / 0.92)';
  PIXEL_HEART.forEach((row, j) => {
    [...row].forEach((c, i) => {
      if (c !== '#') return;
      for (let a = 0; a < sc; a++) {
        for (let b = 0; b < sc; b++) {
          ctx.beginPath();
          ctx.arc(cx + (i * sc + a - (row.length * sc) / 2) * dot * 1.25, cy + (j * sc + b - (PIXEL_HEART.length * sc) / 2) * dot * 1.25, dot * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  });
  printEdge(ctx, win, u, '#ffffff', 0.01);
}

const STAR_COLORS = ['#e0463c', '#2f6fd6', '#2e9a54', '#f0b429', '#8b5cc8', '#e86aa6', '#3cb6c4'];

function confettiBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(0 0 0 / 0.025)', 2, 600);
  printEdge(ctx, win, u, '#ffffff', 0.006);
}

function confettiFront(ctx, L) {
  const { u, win, W, H } = L;
  const rnd = seeded(21);
  const star = (x, y, R) => {
    ctx.save();
    ctx.shadowColor = 'rgb(0 0 0 / 0.22)';
    ctx.shadowBlur = R * 0.35;
    ctx.shadowOffsetY = R * 0.15;
    starPath(ctx, x, y, R, R * 0.5, rnd() * 6.28);
    ctx.fillStyle = STAR_COLORS[Math.floor(rnd() * STAR_COLORS.length)];
    ctx.fill();
    ctx.restore();
    starPath(ctx, x - R * 0.15, y - R * 0.15, R * 0.38, R * 0.17, 0.3);
    ctx.fillStyle = 'rgb(255 255 255 / 0.5)';
    ctx.fill();
  };
  if (!(win.w > 0)) {
    for (let i = 0; i < ((W * H) / (u * u)) * 30; i++) star(rnd() * W, rnd() * H, u * (0.012 + rnd() * 0.01));
    return;
  }
  // a loose ring through the margin, a few stars stuck over the picture's edge
  const cx = win.x + win.w / 2;
  const cy = win.y + win.h / 2;
  const rx = win.w / 2 + win.x * 0.5;
  const ry = win.h / 2 + win.y * 0.5;
  const n = Math.round((2 * Math.PI * Math.sqrt((rx * rx + ry * ry) / 2)) / (u * 0.055));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rnd() - 0.5) * 0.12;
    // a rounded rectangle path instead of an ellipse, so corners get stars too
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const k = 1 / Math.max(Math.abs(c) / rx, Math.abs(sn) / ry);
    const jitter = (rnd() - 0.5) * Math.min(win.x, win.y) * 0.5;
    star(cx + c * (k + jitter), cy + sn * (k + jitter), u * (0.013 + rnd() * 0.012));
  }
}

function doodleHeart(ctx, cx, cy, r, color, filled, rot = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.6, -r * 0.2, -r * 0.7, -r * 1.3, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.7, -r * 1.3, r * 1.6, -r * 0.2, 0, r * 0.9);
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

/** A record: grooves, a label, a hole. Clear vinyl lets the paper show through. */
function record(ctx, cx, cy, R, clear) {
  ctx.save();
  ctx.shadowColor = 'rgb(0 0 0 / 0.35)';
  ctx.shadowBlur = R * 0.08;
  ctx.shadowOffsetY = R * 0.03;
  ctx.fillStyle = clear ? 'rgb(240 234 226 / 0.86)' : '#16120f';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = clear ? 'rgb(150 130 120 / 0.25)' : 'rgb(255 255 255 / 0.07)';
  ctx.lineWidth = Math.max(1, R * 0.006);
  for (let r = R * 0.42; r < R * 0.97; r += R * 0.035) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const sheen = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  sheen.addColorStop(0.3, 'rgb(255 255 255 / 0)');
  sheen.addColorStop(0.5, `rgb(255 255 255 / ${clear ? 0.25 : 0.12})`);
  sheen.addColorStop(0.7, 'rgb(255 255 255 / 0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = clear ? '#d9c7b6' : '#c2363e';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = clear ? '#8e1f26' : '#f1e8d8';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

const VINYL = {
  vinyl: { bg: '#f1e8d8', grain: 'rgb(90 60 40 / 0.06)', heart: '#b8252f', soft: null, clear: false, mark: '#33261c' },
  vinylpink: { bg: '#f2cfd3', grain: 'rgb(255 255 255 / 0.2)', heart: '#ffffff', soft: 'rgb(255 255 255 / 0.4)', clear: false, mark: '#3a2528' },
  vinylred: { bg: '#8e1f26', grain: 'rgb(0 0 0 / 0.12)', heart: '#ffffff', soft: 'rgb(255 255 255 / 0.08)', clear: true, mark: '#f6ece2' },
};

function vinylPainters(id) {
  const P = VINYL[id];
  const back = (ctx, L) => {
    const { u, win, W, H } = L;
    ctx.fillStyle = P.bg;
    ctx.fillRect(0, 0, W, H);
    grain(ctx, W, H, u, P.grain, 8, 1100);
    if (P.soft) {
      const rnd = seeded(31);
      for (let i = 0; i < ((W * H) / (u * u)) * 7; i++) doodleHeart(ctx, rnd() * W, rnd() * H, u * (0.03 + rnd() * 0.03), P.soft, false, (rnd() - 0.5) * 0.8);
    }
    if (win.w > 0) {
      // the record slides out from behind the picture: half of it shows in the margin
      const side = W - win.x - win.w;
      const R = Math.min(side * 0.92, win.h * 0.3);
      record(ctx, W - R - side * 0.06, win.y + win.h * 0.36, R, P.clear);
    }
    printEdge(ctx, win, u, P.clear ? '#f6ece2' : '#ffffff', 0.006);
  };
  const front = (ctx, L) => {
    const { u, win, W } = L;
    if (!(win.w > 0)) return;
    const right = win.x + win.w;
    const side = W - right;
    const x = right + side * 0.5;
    doodleHeart(ctx, x, win.y + win.h * 0.76, side * 0.26, P.heart, false, -0.2);
    doodleHeart(ctx, x + side * 0.08, win.y + win.h * 0.88, side * 0.17, P.heart, false, 0.25);
  };
  return [back, front];
}

function monoBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#141210';
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(255 255 255 / 0.05)', 14, 1200);
  if (win.w > 0) {
    ctx.strokeStyle = 'rgb(244 241 234 / 0.85)';
    ctx.lineWidth = Math.max(1, u * 0.004);
    const g = u * 0.008;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2, (win.r || 0) + g);
    else ctx.rect(win.x - g, win.y - g, win.w + g * 2, win.h + g * 2);
    ctx.stroke();
  }
}

/** Wobbly pen strokes. */
function pen(ctx, pts, width, color, seed = 1) {
  const rnd = seeded(seed);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const jx = x + (rnd() - 0.5) * width * 0.6;
    const jy = y + (rnd() - 0.5) * width * 0.6;
    if (i) ctx.lineTo(jx, jy);
    else ctx.moveTo(jx, jy);
  });
  ctx.stroke();
  ctx.restore();
}

function butterBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#f8f0bf';
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(140 110 40 / 0.06)', 17, 900);
  printEdge(ctx, win, u, '#fffbe8', 0.008);
}

function butterFront(ctx, L) {
  const { u, win, W, H } = L;
  if (!(win.w > 0)) return;
  const blue = '#5b7fc4';
  const w = Math.max(1.2, u * 0.0045);
  const room = H - win.y - win.h;
  const by = win.y + win.h + room * 0.56;
  // a coffee cup
  const cx = win.x + win.w - u * 0.17;
  const s = Math.min(u * 0.035, room * 0.22);
  pen(ctx, [[cx - s, by - s * 0.6], [cx - s * 0.8, by + s * 0.7], [cx + s * 0.6, by + s * 0.7], [cx + s * 0.8, by - s * 0.6], [cx - s, by - s * 0.6]], w, blue, 2);
  pen(ctx, [[cx + s * 0.75, by - s * 0.3], [cx + s * 1.25, by - s * 0.2], [cx + s * 1.2, by + s * 0.3], [cx + s * 0.65, by + s * 0.35]], w, blue, 3);
  pen(ctx, [[cx - s * 0.3, by - s], [cx - s * 0.15, by - s * 1.5], [cx - s * 0.3, by - s * 1.9]], w * 0.8, blue, 4);
  pen(ctx, [[cx + s * 0.2, by - s], [cx + s * 0.35, by - s * 1.5], [cx + s * 0.2, by - s * 1.9]], w * 0.8, blue, 5);
  // a record
  const rx = win.x + win.w - u * 0.06;
  ctx.save();
  ctx.fillStyle = '#2b2a33';
  ctx.beginPath();
  ctx.arc(rx, by, s * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f0bf';
  ctx.beginPath();
  ctx.arc(rx, by, s * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // a heart and a scribbled underline on the left
  doodleHeart(ctx, win.x + u * 0.05, by - s * 0.2, s * 0.62, blue, false, -0.15);
  const pts = [];
  for (let i = 0; i <= 20; i++) pts.push([win.x + u * 0.1 + i * u * 0.012, by + Math.sin(i * 0.9) * s * 0.23]);
  pen(ctx, pts, w, blue, 7);
  doodleHeart(ctx, win.x + win.w + (W - win.x - win.w) * 0.5, win.y * 0.5, Math.min(win.y, W - win.x - win.w) * 0.3, '#7d9edb', true, 0.2);
}

function crinkle(ctx, W, H, u, seed) {
  const rnd = seeded(seed);
  for (let i = 0; i < ((W * H) / (u * u)) * 40; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    const a = rnd() * Math.PI;
    const l = u * (0.03 + rnd() * 0.08);
    ctx.strokeStyle = rnd() > 0.5 ? 'rgb(255 255 255 / 0.22)' : 'rgb(120 40 70 / 0.1)';
    ctx.lineWidth = Math.max(1, u * 0.002);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
}

/**
 * Points spread evenly around the margin, each in the middle of its band,
 * so stickers never cross into the picture whatever its shape or size.
 */
function marginSpots(L, n, seed) {
  const { win, W, H } = L;
  const rnd = seeded(seed);
  const top = win.y / 2;
  const bottom = win.y + win.h + (H - win.y - win.h) / 2;
  const left = win.x / 2;
  const right = win.x + win.w + (W - win.x - win.w) / 2;
  const sides = [
    [left, top, right, top, win.y],
    [right, top, right, bottom, W - win.x - win.w],
    [right, bottom, left, bottom, H - win.y - win.h],
    [left, bottom, left, top, win.x],
  ];
  const lens = sides.map(([x0, y0, x1, y1]) => Math.hypot(x1 - x0, y1 - y0));
  const total = lens.reduce((a, b) => a + b, 0);
  const out = [];
  for (let i = 0; i < n; i++) {
    let d = ((i + 0.5 + (rnd() - 0.5) * 0.5) / n) * total;
    let k = 0;
    while (k < 3 && d > lens[k]) d -= lens[k++];
    const [x0, y0, x1, y1, band] = sides[k];
    const t = Math.min(1, Math.max(0, d / lens[k]));
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t, band, r: rnd(), r2: rnd() });
  }
  return out;
}

/** A paper heart cut with scissors: a white rim, a soft shadow, a fill. */
function paperHeart(ctx, cx, cy, r, fill, rot, u) {
  ctx.save();
  ctx.shadowColor = 'rgb(90 30 50 / 0.22)';
  ctx.shadowBlur = u * 0.006;
  ctx.shadowOffsetY = u * 0.003;
  doodleHeart(ctx, cx, cy, r * 1.16, '#ffffff', true, rot);
  ctx.restore();
  doodleHeart(ctx, cx, cy, r, fill, true, rot);
}

function heartBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#f2b8c6';
  ctx.fillRect(0, 0, W, H);
  crinkle(ctx, W, H, u, 41);
  if (win.w > 0) {
    // a white deckled mat, straight-edged so the picture stays a clean rectangle
    const m = u * 0.016;
    ctx.save();
    ctx.shadowColor = 'rgb(120 40 70 / 0.18)';
    ctx.shadowBlur = u * 0.01;
    ctx.fillStyle = '#fff8fa';
    ctx.fillRect(win.x - m, win.y - m, win.w + m * 2, win.h + m * 2);
    ctx.restore();
  }
}

function heartFront(ctx, L) {
  const { u, win } = L;
  if (!(win.w > 0)) return;
  const fills = ['#e2556f', '#ffffff', '#f7d9e1', '#c93a58', '#ffffff'];
  marginSpots(L, 14, 43).forEach((p, i) => {
    const r = Math.min(p.band * 0.3, u * 0.034) * (0.7 + p.r * 0.45);
    if (i % 3 === 2) doodleHeart(ctx, p.x, p.y, r * 0.9, '#5b7fc4', false, (p.r2 - 0.5) * 0.8);
    else paperHeart(ctx, p.x, p.y, r, fills[i % fills.length], (p.r2 - 0.5) * 0.7, u);
  });
}

/** A jagged starburst sticker. */
function burst(ctx, cx, cy, R, color, edge) {
  ctx.save();
  ctx.beginPath();
  const n = 14;
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const r = i % 2 ? R * 0.72 : R;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1, R * 0.06);
  ctx.stroke();
  ctx.restore();
}

/** Halftone dots that grow toward one corner, like cheap comic print. */
function halftone(ctx, x, y, w, h, step, color, fromX, fromY) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = color;
  const far = Math.hypot(w, h);
  for (let j = 0, yy = y; yy < y + h + step; yy += step, j++) {
    for (let xx = x + (j % 2) * step * 0.5; xx < x + w + step; xx += step) {
      const k = 1 - Math.hypot(xx - fromX, yy - fromY) / far;
      const r = step * 0.42 * Math.max(0, k);
      if (r < 0.4) continue;
      ctx.beginPath();
      ctx.arc(xx, yy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** A rectangle with wavy sides: the edge waves, the opening inside stays straight. */
function wavyRect(ctx, x, y, w, h, amp, wave) {
  ctx.beginPath();
  const side = (x0, y0, x1, y1, nx, ny) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(4, Math.round(len / wave)) * 8;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const o = Math.sin(t * (n / 8) * Math.PI * 2) * amp;
      ctx.lineTo(x0 + (x1 - x0) * t + nx * o, y0 + (y1 - y0) * t + ny * o);
    }
  };
  side(x, y, x + w, y, 0, -1);
  side(x + w, y, x + w, y + h, 1, 0);
  side(x + w, y + h, x, y + h, 0, 1);
  side(x, y + h, x, y, -1, 0);
  ctx.closePath();
}

function comicBack(ctx, L) {
  const { u, win, W, H } = L;
  const cx = win.w > 0 ? win.x + win.w / 2 : W / 2;
  const cy = win.w > 0 ? win.y + win.h / 2 : H / 2;
  const ink = '#2f2620';
  const blocks = [['#7fa6d6', 0, 0, cx, cy], ['#a8c48f', cx, 0, W - cx, cy], ['#f2c9a8', 0, cy, cx, H - cy], ['#f4d35e', cx, cy, W - cx, H - cy]];
  blocks.forEach(([c, x, y, w, h], i) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    const corner = [[0, 0], [W, 0], [0, H], [W, H]][i];
    halftone(ctx, x, y, w, h, u * 0.018, 'rgb(47 38 32 / 0.16)', corner[0], corner[1]);
  });
  // gutters between the panels
  ctx.strokeStyle = '#fbf7ee';
  ctx.lineWidth = u * 0.01;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.lineWidth = u * 0.006;
  ctx.strokeRect(u * 0.012, u * 0.012, W - u * 0.024, H - u * 0.024);
  if (win.w > 0) {
    // a cream panel with a bold ink rule: a comic box around a straight-edged picture
    const m = u * 0.018;
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(win.x - m, win.y - m, win.w + m * 2, win.h + m * 2);
    ctx.lineWidth = u * 0.006;
    ctx.strokeRect(win.x - m * 0.45, win.y - m * 0.45, win.w + m * 0.9, win.h + m * 0.9);
  }
}

function comicFront(ctx, L) {
  const { u, win, W, H } = L;
  if (!(win.w > 0)) return;
  const ink = '#2f2620';
  const pad = Math.min(win.x, win.y, W - win.x - win.w, H - win.y - win.h);
  burst(ctx, win.x + win.w + pad * 0.08, win.y - pad * 0.08, Math.min(u * 0.05, pad * 0.62), '#f0573f', ink);
  // a speech bubble with three dots where the words would be
  const bx = win.x - pad * 0.05 + u * 0.06;
  const by = win.y + win.h + pad * 0.5;
  const rx = Math.min(u * 0.05, pad * 1.1);
  const ry = Math.min(u * 0.026, pad * 0.36);
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, u * 0.0035);
  ctx.beginPath();
  ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(bx + i * rx * 0.32, by, ry * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  doodleHeart(ctx, W - pad * 0.5, H - pad * 0.5, pad * 0.22, '#fbf7ee', true, 0.15);
  doodleHeart(ctx, pad * 0.5, pad * 0.5, pad * 0.18, ink, false, -0.2);
}

function ovalBack(ctx, L) {
  const { u, win, W, H } = L;
  ctx.fillStyle = '#a8c48f';
  ctx.fillRect(0, 0, W, H);
  halftone(ctx, 0, 0, W, H, u * 0.02, 'rgb(63 90 59 / 0.18)', W, H);
  ctx.strokeStyle = '#f2c9a8';
  ctx.lineWidth = u * 0.014;
  ctx.strokeRect(u * 0.014, u * 0.014, W - u * 0.028, H - u * 0.028);
  if (win.w > 0) {
    // a wavy cream mat; only its outer edge waves, the picture stays rectangular
    const m = u * 0.03;
    ctx.save();
    ctx.shadowColor = 'rgb(40 60 36 / 0.25)';
    ctx.shadowBlur = u * 0.008;
    ctx.fillStyle = '#fbf7ee';
    wavyRect(ctx, win.x - m, win.y - m, win.w + m * 2, win.h + m * 2, u * 0.006, u * 0.05);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#3f5a3b';
    ctx.lineWidth = Math.max(1, u * 0.003);
    ctx.strokeRect(win.x - u * 0.006, win.y - u * 0.006, win.w + u * 0.012, win.h + u * 0.012);
  }
}

function ovalFront(ctx, L) {
  const { u, win, W, H } = L;
  if (!(win.w > 0)) return;
  const pad = Math.min(win.x, win.y, W - win.x - win.w, H - win.y - win.h);
  burst(ctx, win.x + win.w + pad * 0.12, win.y - pad * 0.1, Math.min(u * 0.05, pad * 0.6), '#f4d35e', '#3b2f25');
  for (const [x, y, r, c] of [[win.x - pad * 0.45, win.y + win.h + pad * 0.45, 0.24, '#fbf7ee'], [W - pad * 0.5, H * 0.6, 0.18, '#f2c9a8'], [pad * 0.5, H * 0.3, 0.16, '#fbf7ee']]) {
    starPath(ctx, x, y, pad * r, pad * r * 0.45, -0.2);
    ctx.fillStyle = c;
    ctx.fill();
  }
}

function newsBack(ctx, L) {
  const { u, win, W, H } = L;
  const ink = '#1d1a17';
  ctx.fillStyle = '#f3ecdc';
  ctx.fillRect(0, 0, W, H);
  grain(ctx, W, H, u, 'rgb(40 30 20 / 0.06)', 33, 1000);
  // a halftone wash rising from the bottom and a double rule all round, like old print
  halftone(ctx, 0, H * 0.45, W, H * 0.55, u * 0.016, 'rgb(29 26 23 / 0.14)', W / 2, H * 1.4);
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1, u * 0.006);
  ctx.strokeRect(u * 0.016, u * 0.016, W - u * 0.032, H - u * 0.032);
  ctx.lineWidth = Math.max(1, u * 0.002);
  ctx.strokeRect(u * 0.028, u * 0.028, W - u * 0.056, H - u * 0.056);
  if (!(win.w > 0)) return;
  // the masthead band: a black bar with a row of hearts cut out of it
  const bandH = Math.min(win.y * 0.38, u * 0.05);
  const by = (win.y - bandH) / 2 + u * 0.008;
  ctx.fillStyle = ink;
  ctx.fillRect(win.x, by, win.w, bandH);
  const n = Math.max(5, Math.round(win.w / (bandH * 1.6)));
  for (let i = 0; i < n; i++) doodleHeart(ctx, win.x + ((i + 0.5) / n) * win.w, by + bandH / 2, bandH * 0.22, i % 4 === 1 ? '#e9a9c0' : '#f3ecdc', true);
  ctx.lineWidth = Math.max(1, u * 0.004);
  ctx.strokeRect(win.x - u * 0.006, win.y - u * 0.006, win.w + u * 0.012, win.h + u * 0.012);
}

function newsFront(ctx, L) {
  const { u, win, W, H } = L;
  if (!(win.w > 0)) return;
  const pad = Math.min(win.x, H - win.y - win.h);
  burst(ctx, win.x * 0.5, H - (H - win.y - win.h) * 0.5, pad * 0.42, '#5b7fc4', '#1d1a17');
  paperHeart(ctx, win.x + win.w + (W - win.x - win.w) * 0.5, win.y + win.h * 0.66, pad * 0.3, '#e9a9c0', 0.12, u);
  marginSpots(L, 9, 37).forEach((p, i) => {
    if (p.y < win.y) return; // keep the masthead clean
    const r = Math.min(p.band * 0.22, u * 0.013);
    starPath(ctx, p.x, p.y, r, r * 0.42, p.r);
    ctx.fillStyle = ['#5b7fc4', '#e9a9c0', '#1d1a17', '#f0b429'][i % 4];
    ctx.fill();
  });
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
  velvet: (ctx, w, h) => velvetBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  pressed: (ctx, w, h) => pressedBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  crochet: (ctx, w, h) => crochetBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  starry: (ctx, w, h) => starryBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  checker: (ctx, w, h) => checkerBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  lavender: (ctx, w, h) => lavenderBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  pixel: (ctx, w, h) => pixelBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  confetti: (ctx, w, h) => confettiBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  mono: (ctx, w, h) => monoBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  butter: (ctx, w, h) => butterBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  heart: (ctx, w, h) => heartBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  comic: (ctx, w, h) => comicBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  oval: (ctx, w, h) => ovalBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  news: (ctx, w, h) => newsBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  vinyl: (ctx, w, h) => vinylPainters('vinyl')[0](ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  vinylpink: (ctx, w, h) => vinylPainters('vinylpink')[0](ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  vinylred: (ctx, w, h) => vinylPainters('vinylred')[0](ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
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
  velvet: [velvetBack, velvetFront],
  pressed: [pressedBack, () => {}],
  crochet: [crochetBack, () => {}],
  starry: [starryBack, starryFront],
  checker: [checkerBack, () => {}],
  lavender: [lavenderBack, lavenderFront],
  pixel: [pixelBack, () => {}],
  confetti: [confettiBack, confettiFront],
  vinyl: vinylPainters('vinyl'),
  vinylpink: vinylPainters('vinylpink'),
  vinylred: vinylPainters('vinylred'),
  mono: [monoBack, () => {}],
  butter: [butterBack, butterFront],
  heart: [heartBack, heartFront],
  comic: [comicBack, comicFront],
  oval: [ovalBack, ovalFront],
  news: [newsBack, newsFront],
};

/**
 * A frame made from a picture someone brings (the showcase page): stretched
 * to the frame, or tiled across it. The picture's own window is cut out.
 */
export const CUSTOM = { border: null };
export function setCustomBorder({ image, mode = 'fit', pad = 0.1, tone = null }) {
  CUSTOM.border = {
    id: 'custom',
    name: 'Your frame',
    hint: 'A frame from your own picture.',
    pads: { t: pad, r: pad, b: pad, l: pad },
    radius: 0,
    swatch: ['#ffffff', '#33261c'],
    strip: { bg: '#ffffff', ink: '#33261c' },
    // the keys take the picture's own average colour for their dock when it is known
    ui: ui({ dock: tone ?? '#ffffff', surface: '#fbf7ef', ink: '#33261c', band: '#33261c', accent: '#cf6a4c', track: 'rgb(51 38 28 / 0.18)', play: ['#33261c', '#fbf7ef'] }),
    swatchTone: tone,
    image,
    mode,
  };
  PAINTERS.custom = [
    (ctx, L) => {
      if (mode === 'tile') {
        const tw = Math.max(24, L.u * 0.22);
        const th = (tw * image.height) / image.width;
        const t = document.createElement('canvas');
        t.width = Math.round(tw);
        t.height = Math.round(th);
        t.getContext('2d').drawImage(image, 0, 0, t.width, t.height);
        ctx.fillStyle = ctx.createPattern(t, 'repeat');
        ctx.fillRect(0, 0, L.W, L.H);
      } else ctx.drawImage(image, 0, 0, L.W, L.H);
    },
    () => {},
  ];
  return CUSTOM.border;
}

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
  const mh = width * 0.13;
  logoMark(ctx, width / 2 - mh * 0.22, fy, mh, s.ink, C.terracotta);
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
