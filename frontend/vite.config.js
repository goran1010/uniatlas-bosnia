import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import process from "node:process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // --------------------------------------------------------------------
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  const requiredVars = ["VITE_BACKEND_URL"];
  const missingVars = requiredVars.filter((varName) => !env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`,
    );
  }
  // --------------------------------------------------------------------

  return {
    plugins: [
      react({
        babel: {
          plugins: mode !== "test" ? ["babel-plugin-react-compiler"] : [],
        },
      }),
      tailwindcss(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./__tests__/setup.js",
      coverage: {
        include: ["src/**/*.{js,jsx}"],
        exclude: [
          "src/main.jsx",
          "**/*.test.{js,jsx}",
          "**/*.config.{js,jsx}",
          "**/node_modules/**",
        ],
      },
    },
  };
});
