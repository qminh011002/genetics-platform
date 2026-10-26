---
paths: ["packages/**", "contracts/**"]
---
`contracts/openapi/*.json` và `packages/api-client/src/generated/**`, `packages/design-tokens/dist/**` là file sinh: không sửa tay, sinh lại bằng `pnpm generate` / `pnpm build:tokens`. `packages/ui`, `packages/shared`, `packages/design-tokens` dùng chung web + mobile: PR phải có nhãn `shared`, không import từ app, mọi màu từ `tokens.json`. Mã lỗi / quyền / enum phải khớp backend (test `test_codes_match_shared`).
