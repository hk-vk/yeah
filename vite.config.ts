import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import million from 'million/compiler';

export default defineConfig({
  plugins: [million.vite({ auto: true }), react()],
  server: {
    port: 5173,
    host: true
  },
  build:{
    sourcemap:true
  }
});
