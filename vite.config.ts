import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      // Volcengine API 特殊处理（必须放在前面，优先级更高）
      '/api/coding': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          });
        },
      },
      // 代理其他所有 /api 请求到本地后端服务器
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})