import { defineConfig } from "vite";

/** Base relativa para abrir `dist/index.html` e hospedagem em subpasta. */
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
