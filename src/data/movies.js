/**
 * The tapes on the shelf: six Blender open movies hosted on Mux.
 *
 * Each tape plays either a Mux asset (`playbackId`) or a plain file (`src`).
 * Mux assets use Video.js's MuxVideo media component; anything else uses Video.
 *
 * All six are Creative Commons Attribution films by the Blender Foundation.
 * The credit line is shown on the deck while a tape plays and with every photo.
 *
 *   playbackId  Mux public playback ID (Video > Assets > ⋮ > Copy > Playback ID)
 *   title       Shown on the tape label, the deck and in screen reader text
 *   note        Second line on the label (year, runtime, credit)
 *   credit      License credit, printed on the back of photos (CC-BY needs one)
 *   captions    Optional WebVTT URL. Mux auto-generated captions need nothing
 *               here: they arrive inside the stream and show up automatically.
 *   colors      Tape shell, label and label text
 *
 * The cabinet holds 9 cubbies. Tapes fill them in order; empty cubbies get props.
 */
export const MOVIES = [
  {
    id: 'charge',
    title: 'Charge',
    note: '2022  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'xDY3RHlCJTE71hNjUkIAxGQJPYUjxEElEj3XBGVkemg',
    colors: { shell: '#b5294e', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'sprite-fright',
    title: 'Sprite Fright',
    note: '2021  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs',
    colors: { shell: '#3f8f7d', label: '#f5cf5e', ink: '#2a2140' },
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    note: '2012  Mango project',
    credit: '(CC) Blender Foundation | mango.blender.org',
    license: 'CC BY 3.0',
    playbackId: 'B00XyRvdblOoE022lFSoAB39hNNEX0013a9Mx8yQPQ2V01I',
    colors: { shell: '#2a2140', label: '#d6d9f7', ink: '#2a2140' },
  },
  {
    id: 'wing-it',
    title: 'Wing It!',
    note: '2023  Blender Studio',
    credit: '(CC) Blender Foundation | studio.blender.org',
    license: 'CC BY 4.0',
    playbackId: 'rCJR1vEOG00kz2ppqCanigCEtDSniE4o02xi02em6gRUL4',
    colors: { shell: '#e0874f', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    note: '2008  Peach project',
    credit: '© 2008 Blender Foundation | www.bigbuckbunny.org',
    license: 'CC BY 3.0',
    playbackId: 'W02G8oHMlhhE202Uw9C02eSvmVBHA01ZDF3qusCKvQ02oiIs',
    colors: { shell: '#7fcbb5', label: '#fff7e8', ink: '#2a2140' },
  },
  {
    id: 'sintel',
    title: 'Sintel',
    note: '2010  Durian project',
    credit: '© Blender Foundation | durian.blender.org',
    license: 'CC BY 3.0',
    playbackId: 'qoXh2JaPC1dQ26yr6vB6ybJqKMn2K5a5aHsIO7rtpes',
    colors: { shell: '#5a5fc8', label: '#fff7e8', ink: '#2a2140' },
  },
];

/** Dev-only: `?local` swaps every tape to /dev/sample.mp4 for offline testing. */
if (import.meta.env.DEV && typeof location !== 'undefined' && new URLSearchParams(location.search).has('local')) {
  for (const m of MOVIES) {
    delete m.playbackId;
    m.src = '/dev/sample.mp4';
    m.captions = '/dev/sample.vtt';
  }
}
