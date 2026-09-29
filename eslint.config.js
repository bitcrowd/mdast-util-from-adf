import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    ignores: ["dist/", "coverage/"],
  },
  {
    files: ["**/*.ts"],
  },
  {
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      ...typescriptEslint.configs["eslint-recommended"].overrides[0].rules,
      ...typescriptEslint.configs.recommended.rules,
      ...prettierConfig.rules,
      ...prettier.configs.recommended.rules,
      ...js.configs.recommended.rules,
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prettier/prettier": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];
