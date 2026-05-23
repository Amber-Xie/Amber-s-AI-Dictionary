import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 子路径部署时改为 '/your-repo-name/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
})
