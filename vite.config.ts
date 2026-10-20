import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/event-types': 'http://localhost:3000',
      '/slots': 'http://localhost:3000',
      '/bookings': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
