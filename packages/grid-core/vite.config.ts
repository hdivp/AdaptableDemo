import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Library build. Everything the host app already owns stays external, so the
// app ends up with exactly one copy of React and of AG Grid.
const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  /^ag-grid-community/,
  /^ag-grid-enterprise/,
  /^ag-grid-react/,
];

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    sourcemap: true,
    rollupOptions: { external },
  },
});
