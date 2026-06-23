import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: "./__tests__/setup/globalSetup.js",
    setupFiles: "./__tests__/setup/setup.js",
    coverage: {
      exclude: [
        "__tests__/**",
        "vitest.config.js",
        "node_modules/**",
        "generated/**",
      ],
    },
  },
});
