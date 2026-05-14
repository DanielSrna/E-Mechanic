import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    js.configs.recommended,
    prettierConfig,
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "no-console": "warn",
            "no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
            "prefer-const": "error",
            "eqeqeq": "error",
            "prettier/prettier": "error",
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
            },
        },
    },
    {
        ignores: [
            "node_modules/",
            "coverage/",
            "logs/",
            "src/public/uploads/",
        ],
    },
];
