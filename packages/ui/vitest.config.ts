import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@genetics\/ui\/(.*)$/,
        replacement: fileURLToPath(new URL('./src/$1', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/testing/setup.ts'],
  },
});
