import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/state': 'http://localhost:8080',
      '/start': 'http://localhost:8080',
      '/weaponselect': 'http://localhost:8080',
      '/itemselect': 'http://localhost:8080',
      '/itemuse': 'http://localhost:8080',
      '/battle': 'http://localhost:8080',
      '/nextday': 'http://localhost:8080',
    },
  },
  build: {
    outDir:'dist'
  }
})
