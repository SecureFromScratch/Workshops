import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import os from 'os'

// Get the local IP address of your machine
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const forbiddenPrefixes = [ [ "192." ], [] ] // setup so on first pass we do not take interfaces starting with 192
  for (const forbiddenList of forbiddenPrefixes) {
    for (const iface of Object.values(interfaces)) {
      for (const config of iface || []) {
        if (config.family === "IPv4" && !config.internal && !startsWithAny(config.address, forbiddenList)) {
          console.log(`========${'='.repeat(config.address.length)}=============`);
          console.log(`= Using ${config.address} as host ip =`);
          console.log(`========${'='.repeat(config.address.length)}=============`);
          return config.address; // Return the first non-internal IPv4 address
        }
      }
    }
  }

  return '127.0.0.1'; // Fallback to localhost
}

function startsWithAny(str, prefixesList) {
  for (const prefix of prefixesList) {
    if (str.startsWith(prefix)) {
      return true; // skip this address
    }
  }
  return false;
}
const localIp = getLocalIp();

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Ensure CSS is extracted into an external file
    cssCodeSplit: true,

    // Do not inline assets; emit them as files
    assetsInlineLimit: 0,
  },
  esbuild: {
    // Prevent inlining of JavaScript
    keepNames: true,
  },
  features: {
    inlineStyles: id => false
  },
  
  plugins: [react()],
  server: {
    strictPort: true,
    host: localIp,
    proxy: {
      '/api': {
        target: `http://${localIp}:5000`, // Your Web API's port
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      },
      '/assets': {
        target: `http://${localIp}:5000`, // Your Web API's port
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      },
      '/swagger': {
        target: `http://${localIp}:5000`, // Your Web API's port
        changeOrigin: true,
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      },
      '/tinymceCdn': {
        target: 'https://cdn.tiny.cloud', ///1/1y2txrzbb9yi55y9qsftdxekakkmjtlot9u3oa7wuilnapdx/tinymce/6/tinymce.min.js',
        changeOrigin: true, // Spoof the origin
        hostRewrite: 'localhost:5173',
        autoRewrite: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/tinymceCdn/, ''), // Remove prefix used to identify access via proxy
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
        configure: (proxy) => {
          console.log("configureing proxy");
          proxy.on('proxyReq', (proxyReq, req, res, options) => {
            if (proxyReq.getHeader('Referer') !== 'http://localhost:5173/') {
              console.log('Outgoing Host:', proxyReq.getHeader('host'));
              console.log('Outgoing Original Referer:', proxyReq.getHeader('Referer'));
              proxyReq.setHeader('Referer', 'http://localhost:5173/');
            }
          });
        },
      },
    }
  },
})
