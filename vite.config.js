import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages 子路径部署时改为 '/your-repo-name/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  server: {
    // 同时监听 IPv4/IPv6，避免 Windows 上 localhost 解析到 127.0.0.1 时连接被拒绝
    host: true,
    port: 5173,
  },
})
