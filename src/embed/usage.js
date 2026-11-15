/** The usage snippet, shared by the showcase's "Use it" card and the demo page, so they can't drift apart. */
export const USAGE = {
  install: 'npm i react react-dom @videojs/react @videojs/core @videojs/mux-video @videojs/mux-data zustand idb-keyval @fontsource-variable/fraunces @fontsource/dm-mono',
  jsx: `import { PlayboothPlayer } from './src/player/PlayboothPlayer.jsx';

export default function Film() {
  return (
    <PlayboothPlayer
      title="Sprite Fright"
      playbackId="TWFNjB9Ku021WuLLXrYG3lLoOR6l02fgYcg2oYWTqLyCs"
      credit="Blender Studio"
      year={2021}
      frame="vinyl"
      style={{ width: '100%', aspectRatio: '16 / 10' }}
    />
  );
}`,
  props: [
    ['playbackId', 'a Mux public playback ID'],
    ['src', 'or any HLS (.m3u8) or MP4 URL'],
    ['title, credit, year', 'shown above the picture'],
    ['captions', 'a WebVTT URL (Mux captions need nothing)'],
    ['frame', 'any frame id from src/data/borders.js'],
    ['style / className', 'give it a width and a height or aspect ratio'],
  ],
};
