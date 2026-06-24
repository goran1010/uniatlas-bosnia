import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./src/__tests__/setup/globalSetup.ts",
    setupFiles: "./src/__tests__/setup/setup.ts",
    coverage: {
      exclude: [
        "./src/__tests__/**",
        "vitest.config.ts",
        "node_modules/**",
        "generated/**",
      ],
    },
  },
});
