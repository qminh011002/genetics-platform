// ESLint 10 flat config dùng chung. App / package import và nối thêm phần riêng
// (boundaries policies theo web.md §5, parserOptions.project, globals).
//   import base from '../../eslint.config.base.js';
//   export default [...base, { /* riêng */ }];
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import i18next from 'eslint-plugin-i18next';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/** Màu hex trong chuỗi — dùng token (design-system.md); `fetch(` tay — dùng hook @genetics/api-client. */
const noHexColor = {
  selector: 'Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$/]',
  message: 'Không dùng màu hex trực tiếp; dùng token từ @genetics/design-tokens.',
};
const noTemplateHexColor = {
  selector: 'TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3}){1,2}\\b/]',
  message: 'Không dùng màu hex trực tiếp; dùng token từ @genetics/design-tokens.',
};
const noRawFetch = {
  selector: "CallExpression[callee.name='fetch']",
  message: 'Không gọi fetch tay; dùng hook từ @genetics/api-client (api-standards.md §17).',
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/routeTree.gen.ts',
      'packages/api-client/src/generated/**',
      'packages/design-tokens/dist/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': ['error', noHexColor, noTemplateHexColor, noRawFetch],
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...reactHooks.configs['recommended-latest'],
  },
  {
    files: ['**/*.{jsx,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { i18next },
    rules: { 'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }] },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/testing/**', '**/mocks/**', '**/e2e/**'],
    rules: { 'i18next/no-literal-string': 'off', 'no-restricted-syntax': 'off' },
  },
);
