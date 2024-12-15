// vite.config.js
import { defineConfig } from "file:///C:/Users/yariv/source/repos/cymulate/recipes-app/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/yariv/source/repos/cymulate/recipes-app/node_modules/@vitejs/plugin-react-swc/index.mjs";
import os from "os";
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface || []) {
      if (config.family === "IPv4" && !config.internal) {
        console.log(`Using ${config.address} as host ip`);
        return config.address;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx5YXJpdlxcXFxzb3VyY2VcXFxccmVwb3NcXFxcY3ltdWxhdGVcXFxccmVjaXBlcy1hcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHlhcml2XFxcXHNvdXJjZVxcXFxyZXBvc1xcXFxjeW11bGF0ZVxcXFxyZWNpcGVzLWFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMveWFyaXYvc291cmNlL3JlcG9zL2N5bXVsYXRlL3JlY2lwZXMtYXBwL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnXG5pbXBvcnQgb3MgZnJvbSAnb3MnXG5cbi8vIEdldCB0aGUgbG9jYWwgSVAgYWRkcmVzcyBvZiB5b3VyIG1hY2hpbmVcbmZ1bmN0aW9uIGdldExvY2FsSXAoKSB7XG4gIGNvbnN0IGludGVyZmFjZXMgPSBvcy5uZXR3b3JrSW50ZXJmYWNlcygpO1xuICBmb3IgKGNvbnN0IGlmYWNlIG9mIE9iamVjdC52YWx1ZXMoaW50ZXJmYWNlcykpIHtcbiAgICBmb3IgKGNvbnN0IGNvbmZpZyBvZiBpZmFjZSB8fCBbXSkge1xuICAgICAgaWYgKGNvbmZpZy5mYW1pbHkgPT09IFwiSVB2NFwiICYmICFjb25maWcuaW50ZXJuYWwpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFVzaW5nICR7Y29uZmlnLmFkZHJlc3N9IGFzIGhvc3QgaXBgKTtcbiAgICAgICAgcmV0dXJuIGNvbmZpZy5hZGRyZXNzOyAvLyBSZXR1cm4gdGhlIGZpcnN0IG5vbi1pbnRlcm5hbCBJUHY0IGFkZHJlc3NcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuICcxMjcuMC4wLjEnOyAvLyBGYWxsYmFjayB0byBsb2NhbGhvc3Rcbn1cblxuY29uc3QgbG9jYWxJcCA9IGdldExvY2FsSXAoKTtcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IGxvY2FsSXAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6IGBodHRwOi8vJHtsb2NhbElwfTo1MDAwYCwgLy8gWW91ciBXZWIgQVBJJ3MgcG9ydFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIC8vcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSAvLyBPcHRpb25hbDogUmV3cml0ZSB0aGUgVVJMIHBhdGggaWYgbmVlZGVkXG4gICAgICB9LFxuICAgICAgJy9hc3NldHMnOiB7XG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke2xvY2FsSXB9OjUwMDBgLCAvLyBZb3VyIFdlYiBBUEkncyBwb3J0XG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgLy9yZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpIC8vIE9wdGlvbmFsOiBSZXdyaXRlIHRoZSBVUkwgcGF0aCBpZiBuZWVkZWRcbiAgICAgIH0sXG4gICAgICAnL3N3YWdnZXInOiB7XG4gICAgICAgIHRhcmdldDogYGh0dHA6Ly8ke2xvY2FsSXB9OjUwMDBgLCAvLyBZb3VyIFdlYiBBUEkncyBwb3J0XG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgLy9yZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvYXBpLywgJycpIC8vIE9wdGlvbmFsOiBSZXdyaXRlIHRoZSBVUkwgcGF0aCBpZiBuZWVkZWRcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVixTQUFTLG9CQUFvQjtBQUM3VyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxRQUFRO0FBR2YsU0FBUyxhQUFhO0FBQ3BCLFFBQU0sYUFBYSxHQUFHLGtCQUFrQjtBQUN4QyxhQUFXLFNBQVMsT0FBTyxPQUFPLFVBQVUsR0FBRztBQUM3QyxlQUFXLFVBQVUsU0FBUyxDQUFDLEdBQUc7QUFDaEMsVUFBSSxPQUFPLFdBQVcsVUFBVSxDQUFDLE9BQU8sVUFBVTtBQUNoRCxnQkFBUSxJQUFJLFNBQVMsT0FBTyxPQUFPLGFBQWE7QUFDaEQsZUFBTyxPQUFPO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNBLFNBQU87QUFDVDtBQUVBLElBQU0sVUFBVSxXQUFXO0FBRzNCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRLFVBQVUsT0FBTztBQUFBO0FBQUEsUUFDekIsY0FBYztBQUFBO0FBQUEsTUFFaEI7QUFBQSxNQUNBLFdBQVc7QUFBQSxRQUNULFFBQVEsVUFBVSxPQUFPO0FBQUE7QUFBQSxRQUN6QixjQUFjO0FBQUE7QUFBQSxNQUVoQjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsUUFBUSxVQUFVLE9BQU87QUFBQTtBQUFBLFFBQ3pCLGNBQWM7QUFBQTtBQUFBLE1BRWhCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
