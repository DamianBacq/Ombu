import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, las llamadas a /api van al servidor .NET
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
  },
})
