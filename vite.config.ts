import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    // 禁用错误覆盖层以获得更好的开发体验
    hmr: { 
      overlay: true,
      // 启用详细的热更新日志
      clientLogLevel: 'info'
    },
    // 添加API代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uploads/, '/api/uploads')
      }
    },
    // 增加开发服务器超时时间
    timeout: 60000,
    // 使用轮询而不是文件系统事件，提高稳定性
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // 启用详细构建日志
  logLevel: 'info',
  // 确保构建产物路径正确
  base: '/'
})



