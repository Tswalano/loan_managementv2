import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  ssr: {
    noExternal: ['postgres'], // Add specific packages like 'postgres' here
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      Buffer: 'buffer',
      'perf_hooks': path.resolve(__dirname, 'perf_hooks-browser-shim.js'),
    },
  },
  define: {
    global: 'window',
  },
})
