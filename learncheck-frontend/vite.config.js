import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  cacheDir: ".vite",
  preview: {
    allowedHosts: [
      "learncheckai.up.railway.app",
      "frontend-production-e6ad.up.railway.app",
      ".up.railway.app",
    ],
    host: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
