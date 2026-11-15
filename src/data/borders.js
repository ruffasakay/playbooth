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

const ALL_BORDERS = [
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
  /* ---- pattern frames: pictures, scaled with the picture, never stretched ---- */
  {
    id: 'cocoadots',
    name: 'Cocoa dots',
    hint: 'Cream cotton with small cocoa polka dots.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#f3ecdc', '#6f5a48'],
    strip: { bg: '#f3ecdc', ink: '#5b4636' },
    ui: ui({ dock: '#f3ecdc', surface: '#fbf7ee', ink: '#5b4636', band: '#5b4636', accent: '#7a6350', track: 'rgb(91 70 54 / 0.2)', play: ['#5b4636', '#fbf7ee'] }),
  },
  {
    id: 'ribbon',
    name: 'Cocoa ribbon',
    hint: 'Cocoa dots over a dark linen band, a gingham bow tied under the picture.',
    pads: { t: 0.045, r: 0.045, b: 0.17, l: 0.045 },
    radius: 0,
    raster: true,
    swatch: ['#f4eedd', '#3f2d22'],
    strip: { bg: '#f4eedd', ink: '#3f2d22' },
    ui: ui({ dock: '#f4eedd', surface: '#fbf7ee', ink: '#4a3326', band: '#4a3326', accent: '#6f5543', track: 'rgb(74 51 38 / 0.2)', play: ['#4a3326', '#fbf7ee'] }),
  },
  {
    id: 'pinkdoc',
    name: 'Pink document',
    hint: 'A pink word processor from 2003: the film is the page, the toolbars stay put.',
    pads: { t: 0.1631, r: 0.0369, b: 0.0641, l: 0.0453 },
    radius: 0,
    raster: true,
    swatch: ['#fbd3e5', '#ee2f7f'],
    strip: { bg: '#fbd8e8', ink: '#b2305f' },
    ui: ui({ dock: '#f7d3de', surface: '#fff3f7', ink: '#b2405f', band: '#b2405f', accent: '#e05a82', track: 'rgb(178 64 95 / 0.2)', play: ['#e05a82', '#fff3f7'] }),
  },
  {
    id: 'leopard',
    name: 'Leopard',
    hint: 'Soft leopard fur in sand and cocoa.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#d8b896', '#3a2516'],
    strip: { bg: '#d8b896', ink: '#3a2516' },
    ui: ui({ dock: '#cfae8b', surface: '#f7eadb', ink: '#3a2516', band: '#3a2516', accent: '#3a2516', track: 'rgb(58 37 22 / 0.2)', play: ['#3a2516', '#f7eadb'] }),
  },
  {
    id: 'denimstar',
    name: 'Star denim',
    hint: 'Washed denim with stitched star patches.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#9fb6d0', '#3d5f8e'],
    strip: { bg: '#9fb6d0', ink: '#2f4d78' },
    ui: ui({ dock: '#8eaacb', surface: '#f3f6fb', ink: '#2f4d78', band: '#f3f6fb', accent: '#f3f6fb', track: 'rgb(243 246 251 / 0.32)', play: ['#f3f6fb', '#2f4d78'] }),
  },
  {
    id: 'halftone',
    name: 'Halftone stars',
    hint: 'White halftone stars on black, like a lit marquee.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#121212', '#e6e6e6'],
    strip: { bg: '#121212', ink: '#eeeeee' },
    ui: ui({ dock: '#121212', surface: '#eeeeee', ink: '#151515', band: '#eeeeee', accent: '#eeeeee', track: 'rgb(238 238 238 / 0.22)', play: ['#eeeeee', '#151515'] }),
  },
  {
    id: 'lily',
    name: 'Lily & dots',
    hint: 'Sage cotton with pink dots above, a pink lily with stars below.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#a4b0aa', '#f0c6d2'],
    strip: { bg: '#f3dfe5', ink: '#8c4a5e' },
    ui: ui({ dock: '#9aa8a1', surface: '#fbeff2', ink: '#8c4a5e', band: '#fbeff2', accent: '#f2c6d2', track: 'rgb(251 239 242 / 0.35)', play: ['#fbeff2', '#8c4a5e'] }),
  },
  {
    id: 'sagestars',
    name: 'Sage stars',
    hint: 'Soft-focus stars drifting over sage green.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#a5b38f', '#eef2e4'],
    strip: { bg: '#a5b38f', ink: '#3f4e33' },
    ui: ui({ dock: '#9aab86', surface: '#f2f5ea', ink: '#4e5e40', band: '#f2f5ea', accent: '#f2f5ea', track: 'rgb(242 245 234 / 0.35)', play: ['#f2f5ea', '#4e5e40'] }),
  },
  {
    id: 'haze',
    name: 'Grain haze',
    hint: 'Grey and butter light, blurred, with film grain.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#c4c4b0', '#f3efcd'],
    strip: { bg: '#d8d6bd', ink: '#4d4b40' },
    ui: ui({ dock: '#b9b9a6', surface: '#f6f2d8', ink: '#4d4b40', band: '#4d4b40', accent: '#4d4b40', track: 'rgb(77 75 64 / 0.22)', play: ['#4d4b40', '#f6f2d8'] }),
  },
  {
    id: 'linen',
    name: 'Butter linen',
    hint: 'Plain butter-yellow linen, the weave showing.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#efdcab', '#8a6e3c'],
    strip: { bg: '#efdcab', ink: '#6b5530' },
    ui: ui({ dock: '#ead6a2', surface: '#fbf4e2', ink: '#6b5530', band: '#6b5530', accent: '#8a6e3c', track: 'rgb(107 85 48 / 0.2)', play: ['#6b5530', '#fbf4e2'] }),
  },
  {
    id: 'mosaic',
    name: 'Pool mosaic',
    hint: 'Small aqua glass tiles with an oil-slick shimmer, like the wall of an old pool.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#6cc9b8', '#0f5e57'],
    strip: { bg: '#8fd6c8', ink: '#0f4f4a' },
    ui: ui({ dock: '#5fbfae', surface: '#effaf7', ink: '#0f5e57', band: '#0b3f3a', accent: '#0f5e57', track: 'rgb(15 94 87 / 0.22)', play: ['#0f5e57', '#effaf7'] }),
  },
  {
    id: 'lilyvine',
    name: 'Lily vines',
    hint: 'Sage scrolls and pink watercolour lilies on white, with tiny stars.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#fbfbf6', '#a9b78d'],
    strip: { bg: '#fbfbf6', ink: '#5f6d47' },
    ui: ui({ dock: '#f3f4ec', surface: '#ffffff', ink: '#5f6d47', band: '#5f6d47', accent: '#d27c9c', track: 'rgb(95 109 71 / 0.2)', play: ['#5f6d47', '#ffffff'] }),
  },
  {
    id: 'starglow',
    name: 'Star glow',
    hint: 'Pastel sky behind a fine dot screen, with glowing sparkles and little stars.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#cfe8ee', '#e8664f'],
    strip: { bg: '#dcecf0', ink: '#2c5a6e' },
    ui: ui({ dock: '#cfe6ec', surface: '#ffffff', ink: '#2c5a6e', band: '#2c5a6e', accent: '#e8664f', track: 'rgb(44 90 110 / 0.2)', play: ['#2c5a6e', '#ffffff'] }),
  },
  {
    id: 'meadow',
    name: 'Meadow haze',
    hint: 'A soft blur of butter, rose and lilac flowers, as if seen through a window.',
    pads: { t: 0.05, r: 0.05, b: 0.05, l: 0.05 },
    radius: 0,
    raster: true,
    swatch: ['#ece7c6', '#c9a7d4'],
    strip: { bg: '#efead0', ink: '#5e4d6c' },
    ui: ui({ dock: '#e6e1c0', surface: '#fcfaee', ink: '#5e4d6c', band: '#5e4d6c', accent: '#d1668f', track: 'rgb(94 77 108 / 0.2)', play: ['#5e4d6c', '#fcfaee'] }),
  },
  /* ---- from your references, ranked by design and uniqueness ---- */
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

/*
 * The order the frames are offered in: mixed on purpose, so neighbours differ in
 * pattern, colour and weight (no two dotted, starry, denim or blurred frames side by side).
 */
const ORDER = [
  'none', 'cocoadots', 'pinkdoc', 'mosaic', 'leopard', 'lilyvine', 'halftone', 'linen', 'velvet', 'starglow',
  'crochet', 'lily', 'reel', 'haze', 'denimstar', 'ticket', 'comic', 'pressed', 'mono', 'ribbon',
  'lavender', 'airmail', 'sagestars', 'stamp', 'meadow', 'matinee', 'confetti', 'lace', 'checker', 'pixel',
  'stripe', 'denim', 'polka', 'booth',
];
export const BORDERS = ORDER.map((id) => ALL_BORDERS.find((b) => b.id === id));
if (BORDERS.length !== ALL_BORDERS.length || BORDERS.some((b) => !b)) throw new Error('borders: ORDER and the frame list differ');

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

/* ---------- Cocoa bow ---------- */

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

/** Photostrip backings for frames whose texture should carry onto the strip. */
const rasterStrip = (id, anchorY = 0.5) => (ctx, w, h) => {
  const b = BORDERS.find((x) => x.id === id);
  ctx.fillStyle = b.strip.bg;
  ctx.fillRect(0, 0, w, h);
  const img = rasterImage(id);
  if (img) coverDraw(ctx, img, 0, 0, w, h, anchorY);
};
const STRIP_PAINT = {
  cocoadots: rasterStrip('cocoadots'),
  ribbon: rasterStrip('ribbon', 1),
  leopard: rasterStrip('leopard'),
  denimstar: rasterStrip('denimstar'),
  halftone: rasterStrip('halftone'),
  lily: rasterStrip('lily'),
  sagestars: rasterStrip('sagestars'),
  haze: rasterStrip('haze'),
  linen: rasterStrip('linen'),
  mosaic: rasterStrip('mosaic'),
  lilyvine: rasterStrip('lilyvine'),
  starglow: rasterStrip('starglow'),
  meadow: rasterStrip('meadow'),
  denim: (ctx, w, h) => {
    denimFill(ctx, 0, 0, w, h, w);
    laceTrim(ctx, 0, w, 0, 1, w);
    laceTrim(ctx, 0, w, h, -1, w);
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
  checker: (ctx, w, h) => checkerBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  lavender: (ctx, w, h) => lavenderBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  pixel: (ctx, w, h) => pixelBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  confetti: (ctx, w, h) => confettiBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  mono: (ctx, w, h) => monoBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
  comic: (ctx, w, h) => comicBack(ctx, { W: w, H: h, u: w, win: { x: -1e5, y: -1e5, w: 0, h: 0 } }),
};

/* ---------- pattern frames: pictures from public/frames ---------- */

/** Fires when a pattern picture has loaded, so open frames and thumbnails repaint. */
export const frameEvents = typeof EventTarget !== 'undefined' ? new EventTarget() : null;
const rasters = new Map();
/** The frame's picture once it has loaded (loaded on first use), else null. */
function rasterImage(id) {
  if (typeof Image === 'undefined') return null;
  let r = rasters.get(id);
  if (!r) {
    const img = new Image();
    img.decoding = 'async';
    r = { img, ready: false };
    img.onload = () => {
      r.ready = true;
      frameEvents?.dispatchEvent(new Event('load'));
    };
    img.src = `/frames/${id}.jpg`;
    rasters.set(id, r);
  }
  return r.ready ? r.img : null;
}
/** Preload a frame's picture (the picker calls it so a choice paints at once). */
export function warmFrame(border) {
  if (border?.raster) rasterImage(border.id);
}

/** Scale a picture to cover W × H, keeping its proportions; anchorY 0 = top, 0.5 = centre, 1 = bottom. */
function coverDraw(ctx, img, x, y, W, H, anchorY = 0.5) {
  const k = Math.max(W / img.width, H / img.height);
  const w = img.width * k;
  const h = img.height * k;
  ctx.drawImage(img, x + (W - w) / 2, y + (H - h) * anchorY, w, h);
}

/** A pattern frame: the picture covers the frame (its own size follows the frame's), with a fine edge at the window. */
function rasterPainters(id, { edge, anchorY = 0.5 }) {
  return [
    (ctx, L) => {
      const b = BORDERS.find((x) => x.id === id);
      ctx.fillStyle = b?.swatch?.[0] ?? '#eeeeee';
      ctx.fillRect(0, 0, L.W, L.H);
      const img = rasterImage(id);
      if (img) coverDraw(ctx, img, 0, 0, L.W, L.H, anchorY);
      if (edge) printEdge(ctx, L.win, L.u, edge, 0.007);
    },
    () => {},
  ];
}

/*
 * The pink document: sliced, not stretched. The toolbars along the top and
 * bottom keep their proportions at the window's scale; the ruler and the
 * scroll bar run down the sides, their ends kept whole and only the plain
 * middle of each (the ruler's run, the scroll track) drawn longer or
 * shorter; the white page is the window itself.
 * Measured on the picture: the page is x 70–1615, y 252–842 of 1672 × 941.
 */
const DOC = { w: 1672, h: 941, l: 70, r: 1615, t: 252, b: 842, s0: 345, s1: 690 };
const docPainters = [
  (ctx, L) => {
    ctx.fillStyle = '#fbd3e5';
    ctx.fillRect(0, 0, L.W, L.H);
    const img = rasterImage('pinkdoc');
    if (!img || !(L.win.w > 0)) return;
    const s = img.width / DOC.w; // the file may be any size; DOC is in picture pixels at full size
    const k = L.win.w / (DOC.r - DOC.l); // one picture pixel, at the window's scale
    const x0 = L.win.x - DOC.l * k;
    const top = DOC.t * k;
    const bot = (DOC.h - DOC.b) * k;
    const yTop = L.win.y - top;
    const yBot = L.win.y + L.win.h;
    ctx.drawImage(img, 0, 0, img.width, DOC.t * s, x0, yTop, DOC.w * k, top);
    ctx.drawImage(img, 0, DOC.b * s, img.width, (DOC.h - DOC.b) * s, x0, yBot, DOC.w * k, bot);
    // the side columns: whole ends, a middle that takes up the difference
    const head = (DOC.s0 - DOC.t) * k;
    const foot = (DOC.b - DOC.s1) * k;
    const mid = Math.max(0, L.win.h - head - foot);
    const side = (sx, sw, dx) => {
      if (mid > 0) {
        ctx.drawImage(img, sx * s, DOC.t * s, sw * s, (DOC.s0 - DOC.t) * s, dx, L.win.y, sw * k, head);
        ctx.drawImage(img, sx * s, DOC.s0 * s, sw * s, (DOC.s1 - DOC.s0) * s, dx, L.win.y + head, sw * k, mid);
        ctx.drawImage(img, sx * s, DOC.s1 * s, sw * s, (DOC.b - DOC.s1) * s, dx, L.win.y + head + mid, sw * k, foot);
      } else {
        ctx.drawImage(img, sx * s, DOC.t * s, sw * s, (DOC.b - DOC.t) * s, dx, L.win.y, sw * k, L.win.h);
      }
    };
    side(0, DOC.l, x0);
    side(DOC.r, DOC.w - DOC.r, x0 + DOC.r * k);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(L.win.x, L.win.y, L.win.w, L.win.h);
  },
  () => {},
];

const PAINTERS = {
  none: [noneBack, () => {}],
  cocoadots: rasterPainters('cocoadots', { edge: '#fffaf0' }),
  ribbon: rasterPainters('ribbon', { edge: '#fffaf0', anchorY: 1 }),
  pinkdoc: docPainters,
  leopard: rasterPainters('leopard', { edge: '#f7eadb' }),
  denimstar: rasterPainters('denimstar', { edge: '#f3f6fb' }),
  halftone: rasterPainters('halftone', { edge: '#eeeeee' }),
  lily: rasterPainters('lily', { edge: '#fbeff2' }),
  sagestars: rasterPainters('sagestars', { edge: '#f2f5ea' }),
  haze: rasterPainters('haze', { edge: '#f6f2d8' }),
  linen: rasterPainters('linen', { edge: '#fbf4e2' }),
  mosaic: rasterPainters('mosaic', { edge: '#effaf7' }),
  lilyvine: rasterPainters('lilyvine', { edge: '#ffffff' }),
  starglow: rasterPainters('starglow', { edge: '#ffffff' }),
  meadow: rasterPainters('meadow', { edge: '#fcfaee' }),
  booth: [boothBack, boothFront],
  lace: [laceBack, () => {}],
  stamp: [stampBack, stampFront],
  ticket: [ticketBack, ticketFront],
  denim: [denimBack, denimFront],
  reel: [reelBack, reelFront],
  airmail: [airmailBack, airmailFront],
  matinee: [matineeBack, matineeFront],
  polka: [polkaBack, () => {}],
  stripe: [stripeBack, stripeFront],
  velvet: [velvetBack, velvetFront],
  pressed: [pressedBack, () => {}],
  crochet: [crochetBack, () => {}],
  checker: [checkerBack, () => {}],
  lavender: [lavenderBack, lavenderFront],
  pixel: [pixelBack, () => {}],
  confetti: [confettiBack, confettiFront],
  mono: [monoBack, () => {}],
  comic: [comicBack, comicFront],
};

/**
 * A frame made from a picture someone brings (the showcase page): stretched
 * to the frame, or tiled across it. The picture's own window is cut out.
 */
export const CUSTOM = { border: null };
export function setCustomBorder({ image, mode = 'fit', pad = 0.06, tone = null }) {
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
      } else {
        // fit keeps the picture's proportions: scaled to cover the frame and centred, never stretched
        const k = Math.max(L.W / image.width, L.H / image.height);
        const w = image.width * k;
        const h = image.height * k;
        ctx.drawImage(image, (L.W - w) / 2, (L.H - h) / 2, w, h);
      }
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
