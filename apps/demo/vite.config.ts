import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const coreSrc = resolve(__dirname, "../../packages/grid-core/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Point at the library source, not its build output. Editing grid-core
    // then hot reloads here with no rebuild step.
    alias: {
      "@grid-aidlc/core": resolve(coreSrc, "index.ts"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  // Let Vite watch the library source as first party code.
  optimizeDeps: {
    exclude: ["@grid-aidlc/core"],
  },
});
