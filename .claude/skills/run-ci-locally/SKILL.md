---
name: run-ci-locally
description: Chạy toàn bộ gate CI (lint, typecheck, test, contract, build) tại máy trước khi mở PR và tóm tắt kết quả để dán vào PR.
---
1. Từ gốc repo chạy `pnpm run ci` (script `ci` trong `package.json`, tương đương các job `lint`, `contract`, `test-*`, `build` trong `.github/workflows/ci.yml`). Nếu task chỉ chạm một app, có thể chạy thêm `pnpm --filter <pkg> test` để nhanh, nhưng `pnpm run ci` vẫn bắt buộc trước PR.
2. Nếu đỏ: sửa trong `allowed_paths`; không tắt test, không bỏ qua lint.
3. Dán vào mục "Cách kiểm" của PR: lệnh đã chạy, số test pass/fail, thời gian, và kết quả `contract:check` (có breaking hay không).
