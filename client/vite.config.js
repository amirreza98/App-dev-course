import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // if you use React

export default defineConfig({
  plugins: [react()],
  // Always use one copy of React (prevents "Invalid hook call")
  resolve: { dedupe: ['react', 'react-dom'] },
  // NEW: MapLibre loads its web worker relative to its own file; pre-bundling breaks that
  optimizeDeps: { exclude: ['maplibre-gl'] },
  server: {
    port: 5173,
    // Forward /api/* calls to the Express server
    proxy: { '/api': 'http://localhost:3001' },
  },
});