import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// apps/app — WebApp: reportes y gestión sobre Supabase
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
