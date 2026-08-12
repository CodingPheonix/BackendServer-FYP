import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
    hookTimeout: 60000,
    env: loadEnv('', process.cwd(), '')
  },
});
