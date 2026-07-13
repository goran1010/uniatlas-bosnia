/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),

    // Use React Compiler only for optimization in production build, not for testing
    // Need to make sure to memoize manually where needed to ensure tests don't fail due to infinte loops
    mode !== "test" && babel({ presets: [reactCompilerPreset()] }),

    tailwindcss(),
  ],

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./__tests__/setup.ts",

    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,tsx}",
        "**/node_modules/**",
      ],
    },
  },
}));
