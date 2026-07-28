import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('jspdf-autotable') || id.includes('jspdf')) return 'pdf-vendor';
          if (id.includes('html2canvas') || id.includes('dompurify')) return 'document-vendor';
          if (id.includes('recharts')) return 'charts-vendor';
          if (id.includes('framer-motion')) return 'motion-vendor';
          if (id.includes('socket.io-client') || id.includes('axios') || id.includes('peerjs')) return 'network-vendor';
          return undefined;
        }
      }
    }
  }
}))
