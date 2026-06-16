import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import globals from "globals";

export default defineConfig([
  globalIgnores(["dist/", "node_modules/", "coverage/", "src/generated/"]),

  {
    files: ["**/*.{js,ts}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
    ],
    rules: {
      "no-console": ["warn", { allow: ["error", "warn"] }],
    },
    languageOptions: {
      globals: globals.node,
    },
  },
]);
