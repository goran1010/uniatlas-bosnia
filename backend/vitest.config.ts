import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./__tests__/setup/globalSetup.ts",
    setupFiles: "./__tests__/setup/setup.ts",
    coverage: {
      exclude: [
        "./__tests__/**",
        "vitest.config.ts",
        "node_modules/**",
        "generated/**",
      ],
    },
  },
});
