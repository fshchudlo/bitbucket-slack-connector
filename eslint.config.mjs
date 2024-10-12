import globals from "globals";
import tseslint from "typescript-eslint";


export default [
    {
        files: ["**/*.ts"]
    },
    {
        languageOptions: { globals: globals.node }
    },
    ...tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "no-console": [0],
            "strict": ["error", "global"]
        }
    }
];