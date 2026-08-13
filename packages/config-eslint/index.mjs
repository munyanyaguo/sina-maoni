import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

/** Paths that should never be linted anywhere in the monorepo. */
export const ignores = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.turbo/**",
  "**/.next/**",
  "**/.expo/**",
  "**/.output/**",
  "**/.wxt/**",
  "**/src-tauri/target/**",
  "**/*.config.js",
];

export const baseConfig = tseslint.config(
  { ignores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node, ...globals.es2022 },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
);

export const browserConfig = tseslint.config(...baseConfig, {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    globals: { ...globals.browser },
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

export default baseConfig;
