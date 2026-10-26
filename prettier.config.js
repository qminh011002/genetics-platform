// Prettier gốc cho web, mobile, packages (quality-standards.md §2.1).
// App có Tailwind v4 nên set `tailwindStylesheet` trong config riêng (kế thừa file này).
/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-tailwindcss'],
  // File sinh / lockfile / cấu hình agent: chỉ format khi có pragma `@format`
  // (tức là bỏ qua) — áp dụng cho cả `pnpm format` và lint-staged.
  overrides: [
    {
      files: [
        'pnpm-lock.yaml',
        'contracts/openapi/*.json',
        'packages/api-client/src/generated/**',
        'packages/design-tokens/dist/**',
        '**/routeTree.gen.ts',
      ],
      options: { requirePragma: true },
    },
  ],
};
