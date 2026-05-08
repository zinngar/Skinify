import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/Skinify/' : '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['.com'],
  }
}))
