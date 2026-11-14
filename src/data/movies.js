/**
 * The tapes on the shelf: ten Blender open movies hosted on Mux, most loved first.
 *
 * Each tape plays either a Mux asset (`playbackId`) or a plain file (`src`).
 * Mux assets use Video.js's MuxVideo media component; anything else uses Video.
 *
 * All ten are Creative Commons films by the Blender Foundation (Agent 327 is
 * BY-ND, so it is only ever played as it is). The credit line is shown on the
 * deck while a tape plays and with every photo.
 *
 *   playbackId  Mux public playback ID (Video > Assets > ⋮ > Copy > Playback ID)
 *   title       Shown on the tape label, the deck and in screen reader text
 *   note        Second line on the label (year, runtime, credit)
 *   credit      License credit, printed on the back of photos (CC-BY needs one)
 *   captions    Optional WebVTT URL. Mux auto-generated captions need nothing
 *               here: they arrive inside the stream and show up automatically.
 *   coverTime   Seconds into the film for the frame used on the tape cover.
 *               Mux serves it from image.mux.com. To use an official poster
 *               instead, add  cover: '/covers/<file>.jpg'  (place the file in
 *               public/covers/).
 *   colors      Fallback cover colors while the cover image loads
 *
 * The cabinet's shelves hold 3, 4 and 3 tapes, filled in order, top row first.
 */
export const MOVIES = [
  {
    id: 'big-buck-bunny',
    year: '2008',
    genre: 'Short, comedy',
    synopsis: 'A big, gentle rabbit is pushed too far by three bullying rodents, and the forest gets a very creative revenge.',
    coverTime: 120,
    title: 'Big Buck Bunny',
    note: '2008  Peach project',
    credit: '© 2008 Blender Foundation | www.bigbuckbunny.org',
    license: 'CC BY 3.0',
    playbackId: 'W02G8oHMlhhE202Uw9C02eSvmVBHA01ZDF3qusCKvQ02oiIs',
    colors: { shell: '#7fcbb5', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'sintel',
    year: '2010',
    genre: 'Short, fantasy',
    synopsis: 'A lone young woman crosses a harsh land searching for the baby dragon she once raised and lost.',
    coverTime: 215,
    title: 'Sintel',
    note: '2010  Durian project',
    credit: '© Blender Foundation | durian.blender.org',
    license: 'CC BY 3.0',
    playbackId: 'qoXh2JaPC1dQ26yr6vB6ybJqKMn2K5a5aHsIO7rtpes',
    colors: { shell: '#5a5fc8', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'agent-327',
    year: '2017',
    genre: 'Short, spy comedy',
    synopsis: 'Undercover in a quiet barbershop, Agent 327 runs into a deadly henchman and has to fight his way out to save his secret service.',
    coverTime: 60,
    title: 'Agent 327',
    note: '2017  Operation Barbershop',
    credit: '(CC) Blender Foundation | agent327.com',
    license: 'CC BY-ND',
    playbackId: 'yZxPit1BWmxEWyBf01ym2Ez8dtU84Nrjjb2hAwVOYpVM',
    colors: { shell: '#1f3a5f', label: '#f2d16b', ink: '#1a1a2a' },
  },
  {
    id: 'charge',
    year: '2022',
    genre: 'Short, sci-fi action',
    synopsis: 'A desperate scavenger slips into a heavily guarded energy facility, and the security robot on duty refuses to let it go.',
    coverTime: 64,
    title: 'Charge',
    note: '2022  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg',
    colors: { shell: '#b5294e', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'cosmos-laundromat',
    year: '2015',
    genre: 'Short, surreal comedy',
    synopsis: 'On a desolate island, a gloomy sheep named Franck meets Victor, a smooth salesman who offers him the gift of a lifetime.',
    coverTime: 200,
    title: 'Cosmos Laundromat',
    note: '2015  Gooseberry project',
    credit: '(CC) Blender Foundation | gooseberry.blender.org',
    license: 'CC BY-SA 4.0',
    playbackId: '7O8N1XhgouGf1WdofHO9o1d02lp3Sx56MU5b013XhBXGs',
    colors: { shell: '#6b4fa0', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'sprite-fright',
    year: '2021',
    genre: 'Short, horror comedy',
    synopsis: 'Rowdy teenagers trek into an isolated British forest and meet peaceful mushroom creatures who turn out to be a force of nature.',
    coverTime: 150,
    title: 'Sprite Fright',
    note: '2021  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs',
    colors: { shell: '#3f8f7d', label: '#f5cf5e', ink: '#2a2140' },
  },
  {
    id: 'tears-of-steel',
    year: '2012',
    genre: 'Short, live-action sci-fi',
    synopsis: 'In a near-future Amsterdam, warriors and scientists gather to replay a moment from the past and save the world from destructive robots.',
    coverTime: 95,
    title: 'Tears of Steel',
    note: '2012  Mango project',
    credit: '(CC) Blender Foundation | mango.blender.org',
    license: 'CC BY 3.0',
    playbackId: 'B00XyRvdblOoE022lFSoAB39hNNEX0013a9Mx8yQPQ2V01I',
    colors: { shell: '#2a2140', label: '#d6d9f7', ink: '#2a2140' },
  },
  {
    id: 'wing-it',
    year: '2023',
    genre: 'Short, comedy',
    synopsis: 'On a quiet farm, two unlikely friends build a homemade flying machine and find out, loudly, whether it works.',
    coverTime: 70,
    title: 'Wing It!',
    note: '2023  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'rCJR1vEOG00kz2ppqCanigCEtDSniE4o02xi02em6gRUL4',
    colors: { shell: '#e0874f', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'singularity',
    year: '2026',
    genre: 'Short, space adventure',
    synopsis: 'A small space creature loses its icy home to a cosmic event and seeks refuge with luminous beings watched over by a mysterious celestial figure.',
    coverTime: 45,
    title: 'Singularity',
    note: '2026  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY',
    playbackId: 'HcEBfBVn9gNbjtm101wUr00PBpzCNZfFwdeDfnT6j8gSI',
    colors: { shell: '#132347', label: '#c9e3ff', ink: '#132347' },
  },
  {
    id: 'elephants-dream',
    year: '2006',
    genre: 'Short, surreal sci-fi',
    synopsis: 'Old Proog and young Emo wander an endless, strange machine, and see two very different worlds inside it. The first open movie.',
    coverTime: 120,
    title: 'Elephants Dream',
    note: '2006  Orange project',
    credit: '(CC) Blender Foundation | orange.blender.org',
    license: 'CC BY 2.5',
    playbackId: 'qGpuC17ZuBsL4Wwb00LDkXBEtroYB2rvV5zJGF9wnsB4',
    colors: { shell: '#c4612f', label: '#fff7e8', ink: '#2a2140' },
  },
];

/** Dev-only: `?local` swaps every tape to /dev/sample.mp4 for offline testing. */
if (import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('local')) {
  for (const m of MOVIES) {
    delete m.playbackId;
    m.src = '/dev/sample.mp4';
    m.cover = null;
    m.captions = '/dev/sample.vtt';
  }
}
