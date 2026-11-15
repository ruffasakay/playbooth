import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      // three pages: the booth at /, the Video.js showcase at /player/, and an ordinary page using the player at /embed/
      input: { main: resolve(root, 'index.html'), player: resolve(root, 'player/index.html'), embed: resolve(root, 'embed/index.html') },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three';
          if (id.includes('@videojs') || id.includes('hls.js')) return 'videojs';
          // react on its own, so pages without the 3D room (the showcase, the embed demo) never load three.js
          if (/node_modules\/(react|react-dom|scheduler|zustand)\//.test(id)) return 'react';
        },
      },
    },
  },
});
