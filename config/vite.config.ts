import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const addressApiTarget = 'http://127.0.0.1:8788';
const addressApiProxy: Record<string, ProxyOptions> = {
  '/api/address': {
    target: addressApiTarget,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyRequest, request) => {
        // Preserve the same-origin check when the local UI and Pages use different ports.
        const origin = request.headers.origin;
        if (origin) {
          try {
            if (new URL(origin).host === request.headers.host) {
              proxyRequest.setHeader('origin', addressApiTarget);
            }
          } catch {
            /* Forward malformed origins unchanged so the API can reject them. */
          }
        }
      });
    },
  },
};

export default defineConfig({
  server: { proxy: addressApiProxy },
  preview: { proxy: addressApiProxy },
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
  },
});
