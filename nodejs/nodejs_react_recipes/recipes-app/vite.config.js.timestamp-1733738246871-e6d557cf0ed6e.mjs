// vite.config.js
import { defineConfig } from "file:///C:/Users/yariv/source/repos/cymulate/recipes-app/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/yariv/source/repos/cymulate/recipes-app/node_modules/@vitejs/plugin-react-swc/index.mjs";
import os from "os";
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const forbiddenPrefixes = [["192."], []];
  for (const forbiddenSet of forbiddenPrefixes) {
    for (const iface of Object.values(interfaces)) {
      for (const config of iface || []) {
        if (config.family === "IPv4" && !config.internal) {
          for (const prefix of forbiddenSet) {
            if (config.address.startsWith(prefix)) {
              continue;
            }
          }
          console.log(`Using ${config.address} as host ip`);
          return config.address;
        }
      }
    }
  }
  return "127.0.0.1";
}
var localIp = getLocalIp();
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    host: localIp,
    proxy: {
      "/api": {
        target: `http://${localIp}:5000`,
        // Your Web API's port
        changeOrigin: true
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      },
      "/assets": {
        target: `http://${localIp}:5000`,
        // Your Web API's port
        changeOrigin: true
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      },
      "/swagger": {
        target: `http://${localIp}:5000`,
        // Your Web API's port
        changeOrigin: true
        //rewrite: (path) => path.replace(/^\/api/, '') // Optional: Rewrite the URL path if needed
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5YXJpdlxcXFxzb3VyY2VcXFxccmVwb3NcXFxcY3ltdWxhdGVcXFxccmVjaXBlcy1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHlhcml2XFxcXHNvdXJjZVxcXFxyZXBvc1xcXFxjeW11bGF0ZVxcXFxyZWNpcGVzLWFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMveWFyaXYvc291cmNlL3JlcG9zL2N5bXVsYXRlL3JlY2lwZXMtYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5cbi8vIEdldCB0aGUgbG9jYWwgSVAgYWRkcmVzcyBvZiB5b3VyIG1hY2hpbmVcbmZ1bmN0aW9uIGdldExvY2FsSXAoKSB7XG4gIGNvbnN0IGludGVyZmFjZXMgPSBvcy5uZXR3b3JrSW50ZXJmYWNlcygpO1xuICBjb25zdCBmb3JiaWRkZW5QcmVmaXhlcyA9IFsgWyBcIjE5Mi5cIiBdLCBbXSBdIC8vIHNldHVwIHNvIG9uIGZpcnN0IHBhc3Mgd2UgZG8gbm90IHRha2UgaW50ZXJmYWNlcyBzdGFydGluZyB3aXRoIDE5MlxuICBmb3IgKGNvbnN0IGZvcmJpZGRlblNldCBvZiBmb3JiaWRkZW5QcmVmaXhlcykge1xuICAgIGZvciAoY29uc3QgaWZhY2Ugb2YgT2JqZWN0LnZhbHVlcyhpbnRlcmZhY2VzKSkge1xuICAgICAgZm9yIChjb25zdCBjb25maWcgb2YgaWZhY2UgfHwgW10pIHtcbiAgICAgICAgaWYgKGNvbmZpZy5mYW1pbHkgPT09IFwiSVB2NFwiICYmICFjb25maWcuaW50ZXJuYWwpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IHByZWZpeCBvZiBmb3JiaWRkZW5TZXQpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcuYWRkcmVzcy5zdGFydHNXaXRoKHByZWZpeCkpIHtcbiAgICAgICAgICAgICAgY29udGludWU7IC8vIHNraXAgdGhpcyBhZGRyZXNzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnNvbGUubG9nKGBVc2luZyAke2NvbmZpZy5hZGRyZXNzfSBhcyBob3N0IGlwYCk7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZy5hZGRyZXNzOyAvLyBSZXR1cm4gdGhlIGZpcnN0IG5vbi1pbnRlcm5hbCBJUHY0IGFkZHJlc3NcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAnMTI3LjAuMC4xJzsgLy8gRmFsbGJhY2sgdG8gbG9jYWxob3N0XG59XG5cbmNvbnN0IGxvY2FsSXAgPSBnZXRMb2NhbElwKCk7XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBsb2NhbElwLFxuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiBgaHR0cDovLyR7bG9jYWxJcH06NTAwMGAsIC8vIFlvdXIgV2ViIEFQSSdzIHBvcnRcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgICAvL3Jld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJykgLy8gT3B0aW9uYWw6IFJld3JpdGUgdGhlIFVSTCBwYXRoIGlmIG5lZWRlZFxuICAgICAgfSxcbiAgICAgICcvYXNzZXRzJzoge1xuICAgICAgICB0YXJnZXQ6IGBodHRwOi8vJHtsb2NhbElwfTo1MDAwYCwgLy8gWW91ciBXZWIgQVBJJ3MgcG9ydFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIC8vcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSAvLyBPcHRpb25hbDogUmV3cml0ZSB0aGUgVVJMIHBhdGggaWYgbmVlZGVkXG4gICAgICB9LFxuICAgICAgJy9zd2FnZ2VyJzoge1xuICAgICAgICB0YXJnZXQ6IGBodHRwOi8vJHtsb2NhbElwfTo1MDAwYCwgLy8gWW91ciBXZWIgQVBJJ3MgcG9ydFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIC8vcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSAvLyBPcHRpb25hbDogUmV3cml0ZSB0aGUgVVJMIHBhdGggaWYgbmVlZGVkXG4gICAgICB9XG4gICAgfVxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1YsU0FBUyxvQkFBb0I7QUFDN1csT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUdmLFNBQVMsYUFBYTtBQUNwQixRQUFNLGFBQWEsR0FBRyxrQkFBa0I7QUFDeEMsUUFBTSxvQkFBb0IsQ0FBRSxDQUFFLE1BQU8sR0FBRyxDQUFDLENBQUU7QUFDM0MsYUFBVyxnQkFBZ0IsbUJBQW1CO0FBQzVDLGVBQVcsU0FBUyxPQUFPLE9BQU8sVUFBVSxHQUFHO0FBQzdDLGlCQUFXLFVBQVUsU0FBUyxDQUFDLEdBQUc7QUFDaEMsWUFBSSxPQUFPLFdBQVcsVUFBVSxDQUFDLE9BQU8sVUFBVTtBQUNoRCxxQkFBVyxVQUFVLGNBQWM7QUFDakMsZ0JBQUksT0FBTyxRQUFRLFdBQVcsTUFBTSxHQUFHO0FBQ3JDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFDQSxrQkFBUSxJQUFJLFNBQVMsT0FBTyxPQUFPLGFBQWE7QUFDaEQsaUJBQU8sT0FBTztBQUFBLFFBQ2hCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsU0FBTztBQUNUO0FBRUEsSUFBTSxVQUFVLFdBQVc7QUFHM0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVEsVUFBVSxPQUFPO0FBQUE7QUFBQSxRQUN6QixjQUFjO0FBQUE7QUFBQSxNQUVoQjtBQUFBLE1BQ0EsV0FBVztBQUFBLFFBQ1QsUUFBUSxVQUFVLE9BQU87QUFBQTtBQUFBLFFBQ3pCLGNBQWM7QUFBQTtBQUFBLE1BRWhCO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVixRQUFRLFVBQVUsT0FBTztBQUFBO0FBQUEsUUFDekIsY0FBYztBQUFBO0FBQUEsTUFFaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
