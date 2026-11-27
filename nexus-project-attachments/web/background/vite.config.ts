import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: { port: 3101 },
  build: { outDir: "dist", emptyOutDir: true },
});