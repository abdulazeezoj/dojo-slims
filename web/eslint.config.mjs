import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  // Extend Next.js recommended configs
  ...nextTs,
  ...nextVitals,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Custom rules for code quality and consistency
  {
    rules: {
      // ===== TypeScript Rules =====
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-interface": [
        "error",
        {
          allowSingleExtends: true,
        },
      ],
      "@typescript-eslint/no-empty-function": "off",

      // ===== React/Next.js Rules =====
      "react/no-unescaped-entities": "warn",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/jsx-no-duplicate-props": "error",
      "react/self-closing-comp": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ===== Import/Export Rules =====
      "import/order": [
        "warn",
        {
          groups: [
            ["builtin", "external"],
            "internal",
            ["parent", "sibling", "index"],
            "type",
          ],
          "newlines-between": "ignore", // Changed from "always"
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "import/no-duplicates": "warn",

      // ===== Code Quality Rules =====
      "no-console": [
        "warn",
        {
          allow: ["warn", "error", "info"],
        },
      ],
      "no-debugger": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "no-unused-expressions": [
        "warn",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      "no-throw-literal": "error",
      "prefer-template": "warn",
      "object-shorthand": "warn",

      // ===== Best Practices =====
      eqeqeq: ["warn", "always", { null: "ignore" }],
      curly: ["warn", "all"],
    },
  },
]);

export default eslintConfig;
