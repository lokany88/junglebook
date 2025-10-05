import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'apps/**/*.test.{ts,tsx,js,jsx}',
      'packages/**/*.test.{ts,tsx,js,jsx}',
      'apps/**/tests/**/*.{test,spec}.{ts,tsx,js,jsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.open-next/**',
      '**/.turbo/**',
    ],
    root: path.resolve(__dirname),
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
    },
    reporters: ['default'],
    watch: true,
    ui: true,
  },
})

