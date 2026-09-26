import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createViteAuthDbMiddleware } from './server/viteMiddleware.ts'

// Vite plugin to provide persistent multi-tenant backend at /api
function apiBackendPlugin() {
  const middleware = createViteAuthDbMiddleware();

  const setupMiddleware = (server: any) => {
    server.middlewares.use(middleware);
  };

  return {
    name: 'tuition-api-backend-plugin',
    configureServer: setupMiddleware,
    configurePreviewServer: setupMiddleware,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiBackendPlugin()],
  optimizeDeps: {
    include: ['html2canvas', 'jspdf', 'canvas-confetti'],
  },
});
