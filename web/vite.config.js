import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Builds exactly main.js + main.css into the repo root (== Qollab project root).
export default defineConfig(({ command }) => ({
  plugins: [react()],
  publicDir: false,
  // Dev server only: Pyodide is absent locally, so 'magnav.api' resolves to a stub.
  resolve: command === 'serve'
    ? { alias: { 'magnav.api': fileURLToPath(new URL('./src/dev/magnavApiStub.js', import.meta.url)) } }
    : {},
  // Lib mode does not replace this, and `process` is undefined in the Qollab iframe.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  // Dev server only: lets the stub import ../data/precomputed_run.json?raw (no effect on the build).
  server: { fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] } },
  build: {
    target: 'esnext',             // main.jsx ends with a top-level await
    outDir: '..',                 // repo root == Qollab root
    emptyOutDir: false,           // NEVER empty the repo root
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    copyPublicDir: false,
    // License notices of every bundled dependency (the lib build strips license comments).
    license: { fileName: 'THIRD_PARTY_LICENSES.md' },
    lib: { entry: 'src/main.jsx', formats: ['es'], fileName: () => 'main.js', cssFileName: 'main' },
    // Python modules are provided by Qollab's Pyodide runtime at load time.
    rollupOptions: { external: [/^magnav(\..+)?$/] },
  },
}));
