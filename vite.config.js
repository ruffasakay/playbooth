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
      // two pages: the booth at /, and the Video.js showcase at /player/ (not linked from the booth)
      input: { main: resolve(root, 'index.html'), player: resolve(root, 'player/index.html') },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'three';
          if (id.includes('@videojs') || id.includes('hls.js')) return 'videojs';
        },
      },
    },
  },
});
