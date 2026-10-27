---
id: T0102
title: Package design-tokens: tokens.json → web.css (Tailwind 4 @theme + biến shadcn) và tokens.ts
epic: E01
status: in_review
area: shared
type: feature
priority: P0
size: M
depends_on: [T0101]
decisions: [ADR-0009]
wireframes: [Foundations]
owner: planner
allowed_paths:
  - "packages/design-tokens/**"
---

## Bối cảnh
Token là nguồn duy nhất cho web và mobile (`design-system.md` §3–5, §11). Cả hai app dùng Tailwind 4 nên chỉ cần một đầu ra CSS. Nguồn: `setup-guide.md` §2.

## Phạm vi
Làm:
- `packages/design-tokens/tokens.json` đầy đủ: màu nền tảng, trạng thái, dòng giống, thẻ số, delta, alert, dòng bảng, sexing, biểu đồ; chữ; khoảng cách; bo góc; bóng (lấy đúng giá trị `design-system.md`)
- `scripts/build.ts` sinh `dist/web.css` (`@theme { --color-primary … }`, `--radius-*`, `--font-*`, `:root { --primary … }` biến shadcn dạng OKLCH chuyển từ hex) và `dist/tokens.ts` (object typed)
- `package.json` exports `./web.css`, `./tokens`; script `build`; test snapshot 2 file sinh

Không làm:
- Không sinh preset Tailwind 3 (không còn NativeWind)
- Không thêm token ngoài design-system; màu mới phải sửa `design-system.md` trước

## Tiêu chí chấp nhận
1. Cho `tokens.json` theo design-system · Khi `pnpm --filter @genetics/design-tokens build` · Thì `dist/web.css` chứa `--color-primary` tương ứng `#013db3` (OKLCH) và `--color-status-ok-bg`; `dist/tokens.ts` export `tokens.color.strain.TMA.chart`
2. Khi đổi một giá trị trong `tokens.json` · Thì test snapshot thất bại cho tới khi cập nhật có chủ ý
3. Khi import `@genetics/design-tokens/web.css` trong một file CSS Tailwind 4 · Thì class `bg-primary`, `text-muted-foreground`, `bg-stat-blue`, `rounded-xl` tồn tại

## Ghi chú kỹ thuật
- Chuyển hex → OKLCH bằng `culori`; kiểm tương phản ≥ 4.5:1 cho các cặp §3 bằng test

## Kiểm thử bắt buộc
- Vitest: snapshot + contrast

## Câu hỏi
- `culori` không có trong `catalog:` (`pnpm-workspace.yaml`) lẫn blueprint §3, mà version chỉ được ghi trong catalog (ngoài `allowed_paths`). Đã thay bằng toán màu thuần (`src/color.ts`: sRGB → OKLab → OKLCH theo Ottosson / CSS Color 4, tương phản WCAG) — không thêm dependency. Planner chọn: (a) giữ bản thuần, sửa "Ghi chú kỹ thuật" của task; hoặc (b) thêm `culori` vào catalog (PR `deps-approved`) rồi thay `src/color.ts` (snapshot có thể lệch ở chữ số lẻ cuối).
- Biến shadcn mà §3.1 không liệt kê (`card`, `card-foreground`, `popover`, `popover-foreground`, `secondary-foreground`, `accent-foreground`, `destructive-foreground`) được khai báo trong `tokens.json` dạng **alias** `{color.background}` / `{color.foreground}` / `{color.primary-foreground}` — không có màu mới, nhưng là tên token mới. Component shadcn (Card, Popover, Button variant) cần chúng; đề xuất bổ sung vào bảng §3.1 của `design-system.md` (PR docs).
- `--radius` (shadcn base) đặt = `radius.md` (8 px, nút / ô nhập). Xác nhận.
- Khoảng giá trị trong §4 không biểu diễn được bằng một token: `caption` 400–500 → ghi 400 (badge dùng `font-medium`); `overline` 11–12 / `+0.04–0.06em` → ghi 11 px, `0.04em` (cận dưới). Đề xuất chốt một giá trị trong `design-system.md`.
- `@types/node` không có trong catalog → `tsconfig.json` chỉ typecheck `src/**` + `vitest.config.ts`; `scripts/build.ts` (17 dòng, chỉ đọc/ghi file) chạy bằng tsx, không qua `tsc`. Nếu muốn typecheck cả `scripts/`, thêm `@types/node` vào catalog.
- **`pnpm install` thoát mã 1 (pnpm 12 `ERR_PNPM_IGNORED_BUILDS`)** vì `esbuild` (dep của tsx / vitest / vite) có build script chưa duyệt; `node_modules` vẫn đủ và mọi lệnh chạy được (esbuild dùng binary `@esbuild/linux-x64`, postinstall chỉ là tối ưu). Sửa ở `pnpm-workspace.yaml` (ngoài `allowed_paths`): `ignoredBuiltDependencies: [esbuild]` (an toàn) hoặc `onlyBuiltDependencies: [esbuild]`. Cần làm trước khi có workflow CI chạy `pnpm install --frozen-lockfile`.

## Kết quả (điền khi xong)
- PR: chưa mở (máy chưa có `gh` / remote). Nhánh `shared/T0102-package-design-tokens`, 1 commit trên T0101. Nhãn: `shared`.
- Ghi chú:
  - Đã tạo `packages/design-tokens/`: `tokens.json` (mọi giá trị §3–5, §11: 29 màu nền tảng + status / strain / stat / stat-hero / delta / alert / row / sex / chart, `font`, `text` 13 bậc, `size` 15 kích thước, `radius` 7, `shadow` 4; `scrim` giữ dạng rgba), `src/color.ts` (hex → OKLCH, tương phản), `src/generate.ts` (hàm thuần sinh CSS + TS; giải alias `{a.b}`, gọn `{value}`, phẳng hoá tên `--color-status-ok-bg`, `--color-strain-tma-chart`, `--color-stat` cho `DEFAULT`), `scripts/build.ts` (ghi `dist/`), `src/generate.test.ts` + `src/contrast.test.ts` (56 test), `src/__snapshots__/{web.css,tokens.ts}.snap` (file snapshot, `toMatchFileSnapshot`), `package.json` (exports `./web.css`, `./tokens`, thêm `./tokens.json`; scripts build / lint / typecheck / test; devDeps `tsx`, `typescript`, `vitest`, `eslint`, `tailwindcss` — tất cả `catalog:`), `tsconfig.json`, `vitest.config.ts`, `eslint.config.js` (kế thừa base). `pnpm-lock.yaml` cập nhật (lệnh cài).
  - Cấu trúc `web.css`: `:root { --background … --ring, --radius }` (OKLCH, shadcn CLI 4 theming) · `.dark {}` rỗng (ADR-0009) · `@theme inline { --font-*, --text-*(+ --line-height / --font-weight / --letter-spacing), --color-* (biến shadcn trỏ `var(--x)`, token khác OKLCH trực tiếp), --spacing-* (kích thước §5), --radius-*, --shadow-* }`. Lưới 4 px = `--spacing` mặc định Tailwind, không khai báo lại.
  - `dist/**` **không commit**: `.gitignore` gốc có `dist/`, turbo `build` `dependsOn: ["^build"]` nên app build/typecheck/test luôn sinh token trước; `pnpm build:tokens` ở gốc. `.gitattributes` `linguist-generated` giữ nguyên (vô hại). Nếu sau này cần commit dist (vd. để Stylelint / IDE đọc), thêm `!packages/design-tokens/dist/` vào `.gitignore` (PR infra).
  - `tokens.ts` export `tokens` (`as const`) + `type Tokens`; giá trị thô: hex cho Recharts, số px cho radius / size.
  - Kiểm tiêu chí (27/10/2026, Node 24.17 / pnpm 12.15.0):
    1. `pnpm --filter @genetics/design-tokens build` → `dist/web.css` 8837 B, `dist/tokens.ts` 6154 B ✅. `--primary: oklch(0.4163 0.1944 262.24)` (= `#013db3`; shadcn/culori ≈ 0.416 0.194 262.2) và `--color-primary: var(--primary)` ✅; `--color-status-ok-bg: oklch(0.9624 0.0434 156.74)` ✅; `tokens.color.strain.TMA.chart === '#4338ca'` ✅ (test `generate.test.ts`). CSS không còn hex.
    2. Đổi `primary` `#013db3` → `#013db4` rồi `vitest run`: 4 test đỏ (2 snapshot mismatched + 2 test tiêu chí 1) ✅; hoàn nguyên → 56/56 xanh.
    3. Test `tailwindcss.compile(web.css + "@tailwind utilities").build([...])` sinh `.bg-primary { background-color: var(--primary) }`, `.text-muted-foreground`, `.bg-stat-blue`, `.rounded-xl { border-radius: 12px }` (+ `text-body`, `shadow-overlay`, `h-button-md`) ✅.
    - Tương phản: 48 cặp §3 (nền tảng, status, strain, delta, alert, stat, row, stat-hero, chart axis, subtle-foreground) đều ≥ 4.5:1 ✅.
    - `pnpm run ci` exit 0 ✅ (format:check, check:catalog OK 60 mục / 1 package, lint, typecheck, test 56, contract:check bỏ qua vì chưa có backend / api-client, build).
  - Ngoài `allowed_paths`: chỉ `pnpm-lock.yaml` (lockfile sinh bởi `pnpm install`). Không sửa file gốc nào khác; các việc cần sửa gốc ghi ở "Câu hỏi".
- Còn lại:
  - Planner trả lời 5 câu hỏi trên; quan trọng nhất: `ignoredBuiltDependencies: [esbuild]` (trước CI) và quyết định `culori`.
  - Push + mở PR nhãn `shared`.
- Lệnh để tiếp tục:
  ```
  cd /home/qminh/company_project/gp-wt/T0102   # hoặc git checkout shared/T0102-package-design-tokens
  pnpm install && pnpm --filter @genetics/design-tokens build test && pnpm run ci
  git push -u origin shared/T0102-package-design-tokens
  gh pr create --title "feat(design-tokens): build web.css and tokens.ts from tokens.json (T0102)" --body-file .github/pull_request_template.md --label shared
  ```
