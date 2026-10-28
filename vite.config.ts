import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base: '/whack-a-bug/',
  plugins: [react()],
});
