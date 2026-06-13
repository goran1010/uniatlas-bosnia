/// <reference types="vitest/config" />

import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
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
});
