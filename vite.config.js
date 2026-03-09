import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5176,
    hmr: {
      port: 5176,
    },
    proxy: {
      '/api': {
        target: 'https://taekwondo-backend-j8w4.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://taekwondo-backend-j8w4.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
