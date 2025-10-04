import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["apps/**/*.test.{ts,tsx,js,jsx}"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      reportsDirectory: "coverage",
      all: false
    },
    setupFiles: ["vitest.setup.ts"]
  },
});
