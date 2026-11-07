import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: true,
    sourcemap: false,
    // three.js lives in its own lazily loaded chunk (the desk scene)
    chunkSizeWarningLimit: 700,
  },
})
