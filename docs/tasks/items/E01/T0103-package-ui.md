---
id: T0103
title: Package ui: shadcn init --monorepo (Base UI), primitive ban đầu, component nghiệp vụ dùng chung
epic: E01
status: done
area: web
type: feature
priority: P0
size: L
depends_on: [T0101, T0102]
decisions: [ADR-0009]
wireframes: [Foundations, States, UIStates]
owner: claude-web
allowed_paths:
  - "packages/ui/**"
  - "apps/web/components.json"
  - "apps/mobile/components.json"
---

## Bối cảnh
Web và mobile đều là DOM (ADR-0010) nên primitive shadcn và các component nghiệp vụ nhỏ đặt ở `packages/ui`. Nguồn: `setup-guide.md` §2b, `web.md` §8.1, `design-system.md` §6.

## Phạm vi
Làm:
- `pnpm dlx shadcn@4 init --monorepo -b base` → `packages/ui` với `components.json` (style new-york, base-ui, cssVariables true, alias)
- `shadcn add`: button input textarea select combobox dialog sheet tabs table badge card alert sonner switch checkbox radio-group command calendar progress avatar skeleton tooltip dropdown-menu popover separator
- Chỉnh theo design-system: biến thể Button (`destructive-outline`, `success`, size `xl`), Tabs (`pill`, `underline`), Input trạng thái `error` / `warning` + hậu tố đơn vị, Badge token §3.2, `StrainBadge` §3.3
- `src/business/`: `BatchCode`, `StrainBadge`, `StatusBadge` (map kind + value → token + nhãn vi/en), `Can`, `EmptyState`, `ErrorState`, `NoAccess`
- `src/lib/cn.ts`; `package.json` exports; Vitest + Testing Library cho business components

Không làm:
- Không tạo component bố cục app (sidebar, tab bar, PhoneTile…) — thuộc app
- Không dark mode (giữ block `.dark` rỗng)
- Không `add --overwrite` sau khi đã chỉnh

## Tiêu chí chấp nhận
1. Cho app import `@genetics/ui/components/button` · Khi render `<Button variant="success" size="xl">` · Thì class dùng token (không hex) và chiều cao 52 px
2. Khi `<StatusBadge kind="batch" value="reopened" />` · Thì nhãn "Mở lại" và màu `status-pending` theo §3.2
3. Khi `<Can perm="stage.close">` với context quyền thiếu · Thì không render con
4. Khi chạy `pnpm --filter @genetics/ui lint typecheck test build` · Thì xanh; không có mã hex trong `src/**` (ESLint rule)

## Ghi chú kỹ thuật
- Giữ file CLI sinh ở `src/components/`; mọi chỉnh sửa ghi comment `// design-system §x`
- Base UI khác Radix về API (`render` prop, không `asChild`) — không copy ví dụ Radix

## Kiểm thử bắt buộc
- Vitest cho business; snapshot DOM cho 5 primitive đã chỉnh

## Câu hỏi
- (đã chốt 27/10/2026 với chủ dự án) Catalog ghi `@base-ui-components/react 1.0.0-rc.0` (tên cũ, đã ngừng); shadcn 4 `-b base` dùng `@base-ui/react`, cần thêm `react-day-picker` (calendar) và `shadcn` (`shadcn/tailwind.css` chứa custom variant `data-open`/`data-checked`… mà component dùng). → Sửa `pnpm-workspace.yaml` catalog trong PR này, nhãn `deps-approved`.
- (đã chốt) Base UI không có style `new-york` (chỉ `base-nova` / `base-vega` / …) → dùng `base-vega` (bản "classic", tương đương new-york).

## Kết quả (điền khi xong)
- PR: #6 (https://github.com/qminh011002/genetics-platform/pull/6)
- Ghi chú:
  - `shadcn init --monorepo` chỉ dựng monorepo **mới** (không áp lên repo có sẵn): đã chạy thử ngoài repo, chép khung `packages/ui` (`components.json`, alias) về đây rồi chạy **`shadcn add` thật** cho 26 file trong `src/components/` (25 primitive + `input-group` kéo theo).
  - `exports` có điều kiện `"source"` (trỏ `src/`) đứng đầu: shadcn CLI resolve alias qua `exports` nên ghi đúng vào `src/components/`; Vite / tsc không nhận `source` nên dùng `dist/` (build `tsc -p tsconfig.build.json`). App import `@genetics/ui/components/<x>`, `@genetics/ui/business`, `@genetics/ui/lib/cn`, CSS `@genetics/ui/globals.css`.
  - `src/lib/cn.ts`: clsx + tailwind-merge **mở rộng theo tên token** (không thì `text-caption` bị `text-status-*-fg` xoá); test đối chiếu `tokens.ts`. Không dùng gói `cn` mà template sinh (ngoài catalog).
  - Đã chỉnh (comment `// design-system §x`): Button (`destructive` đặc, `destructive-outline`, `success`, size 32/36/44/52 theo token), Badge (`status-*` §3.2 trùng tên `StatusToken`, `strain` §3.3), Input (`state` error/warning, `unit`, `inputSize="lg"` 48), Textarea / SelectTrigger / ComboboxInput (`state`), Tabs (`pill` mặc định, `underline`), Sonner (bỏ `next-themes`, luôn light). Dialog / Sheet: `closeLabel` thay chữ "Close" cứng (app truyền i18n).
  - `src/business/`: `BatchCode` (`render` prop kiểu Base UI cho link, nút copy), `StrainBadge`, `StatusBadge` (map từ `@genetics/shared/enums`, `detail`, `dot`, giá trị lạ → `status-outline`), `Can` + `PermissionsProvider` / `useCan` / `usePermissions` (dùng `can()` của shared), `EmptyState` / `ErrorState` / `NoAccess` (khung chung `StateBlock`, theo board UIStates).
  - ESLint riêng `packages/ui`: cấm hex **bên trong** chuỗi (vd `bg-[#013db3]`) — luật gốc chỉ bắt literal là nguyên mã hex.
  - Ngoài `allowed_paths` (nhãn `out-of-scope`): `pnpm-workspace.yaml` + `pnpm-lock.yaml` (catalog, đã duyệt); `eslint.config.base.js` sửa 1 dòng `reactHooks.configs['recommended-latest']` → `configs.flat['recommended-latest']` (react-hooks 7: bản cũ là định dạng legacy, ESLint 10 báo lỗi với mọi file `.tsx` — `packages/ui` là package tsx đầu tiên nên lộ ra).
  - Lockfile: `shadcn@4.23.0` phát hành hôm nay vi phạm `minimumReleaseAge` của pnpm 12 → catalog `^4.22.1`, lock 4.22.1; không thêm `minimumReleaseAgeExclude`.
  - Kiểm thử: 46 test Vitest (tiêu chí 1: `primitives.test.tsx`; tiêu chí 2: `status-badge.test.tsx`; tiêu chí 3: `can.test.tsx`; tiêu chí 4: `pnpm run ci` bên dưới + luật hex ESLint). Snapshot DOM: Button, Badge, Input, Textarea, Tabs (×2).
  - `pnpm run ci` (27/10/2026, worktree): exit 0 — prettier OK; check-catalog OK (5 package, 62 mục); lint / typecheck / test / build xanh; design-tokens 56 test, shared 49 test, ui 46 test. `contract:check` in "No projects matched" cho `@genetics/api-client` (chưa có, T0306) nhưng exit 0.
  - Lưu ý chung: ở pnpm 12, `pnpm ci` là lệnh có sẵn (clean install), **không** chạy script `ci` — phải gõ `pnpm run ci`. AGENTS.md / CLAUDE.md / skill `run-ci-locally` đang ghi `pnpm ci` (ngoài phạm vi task này, cần Planner sửa).

## Còn lại
- Chưa kiểm `shadcn add` chạy từ `apps/web` / `apps/mobile` (chưa có `package.json` / tsconfig app): kiểm ở T0401 / T0404.
- Chỉnh thêm theo §6.1 chưa làm (task không liệt kê): Switch 36 × 20, Progress 8 / 6, Avatar nền `primary-soft`, Skeleton gradient, Table `radius-xl` + `table-head`, Calendar tuần bắt đầu thứ Hai + `vi`.
- `blueprint.md` §3 còn ghi `@base-ui-components/react` (Planner cập nhật).
- Bảng màu dòng giống mở rộng (§3.3 "Admin gán màu") chưa có trong `tokens.json`: `StrainBadge` dòng lạ → màu trung tính.

## Lệnh để tiếp tục
```
cd ../gp-wt/T0103   # worktree nhánh shared/T0103-package-ui
pnpm install --frozen-lockfile && pnpm build:tokens
pnpm --filter @genetics/ui test && pnpm run ci
# thêm primitive: cd packages/ui && pnpm exec shadcn add <name>   (không --overwrite file đã chỉnh)
```
