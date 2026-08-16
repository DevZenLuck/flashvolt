import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Root-hosted (Vercel, custom domain) by default. For GitHub Pages at a
  // subpath, build with VITE_BASE_URL set, e.g. npm run build -- --base=/flashvolt/
  base: process.env.VITE_BASE_URL || '/',
});