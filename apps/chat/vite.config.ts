import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// apps/chat — UI clon de WhatsApp: captura de intención + Evolution API
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
});
