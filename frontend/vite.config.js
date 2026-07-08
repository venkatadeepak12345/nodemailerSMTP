import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/mailer-auth-17/mailer-auth-17/',
  server: {
    // Allow external access for Netlify preview builds
    host: true,
    port: 5173
  }
})
