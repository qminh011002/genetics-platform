---
id: T0401
title: Web skeleton: Vite 8 + React 19 (Compiler), TanStack Router file-based + Query, i18n, Tailwind 4 + token, ESLint boundaries, AppShell (sidebar theo quyền, topbar, Ctrl K khung), testing (Vitest + MSW), gallery route
epic: E04
status: todo
area: web
type: feature
priority: P0
size: L
depends_on: [T0101, T0102, T0103, T0104, T0306]
decisions: [ADR-0008, ADR-0009]
wireframes: [Layout, AppSidebar, UIStates, Settings]
owner: claude-web
allowed_paths:
  - "apps/web/**"
---

## Bối cảnh
Nguồn: `web.md` §3–5, §9, §11; `setup-guide.md` §6; board Layout / AppSidebar / UIStates.

## Phạm vi
Làm:
- `pnpm create vite` react-ts → cấu trúc `web.md` §4; alias `@/`; `vite.config.ts` (plugin-react + `@rolldown/plugin-babel` React Compiler pin 1.0.0, router plugin, tailwind vite)
- `eslint.config.js`: boundaries policies §5, jsx-a11y, react-hooks recommended-latest, i18next `no-literal-string`, `no-restricted-syntax` (`fetch(` ngoài `lib/api.ts`, hex), `dependency-cruiser` config no-circular
- `routes/__root.tsx` (errorComponent, notFoundComponent, QueryErrorResetBoundary), `_app.tsx` (AppShell), `_app/index.tsx` chuyển home theo `/me.home`, `_app/home.tsx` placeholder, `_app/settings.tsx` (Settings tối thiểu)
- `layouts/`: AppShell 248 px sidebar, `nav.ts` (mục + perm; lọc theo `/me/permissions`), Topbar (breadcrumb, nút Ctrl K mở `cmdk` rỗng, chuông, avatar), responsive drawer ≤ 768
- `app/`: providers, query-client (staleTime 30 s, `/me/permissions` 5 phút), i18n vi/en nạp từ `@genetics/shared` + `locales/`
- `testing/`: render helper (providers), MSW server với `getAllHandlers()`; `gallery/` route dev (`/__gallery`) liệt kê component `@genetics/ui` + `common` theo state
- `globals.css`: `@import "tailwindcss"; @import "@genetics/design-tokens/web.css"`

Không làm:
- Không feature nghiệp vụ
- Không auth thật (T0206) — dùng MSW `/me` mặc định Executive

## Tiêu chí chấp nhận
1. Khi `pnpm --filter @genetics/web dev` · Thì mở `/home` với sidebar đúng 5 nhóm cho Executive mock; chọn mock Manager → không thấy mục Import
2. Khi import `features/a/components/X` từ `features/b` · Thì ESLint lỗi boundaries; `fetch(` trong feature → lỗi
3. Khi `pnpm --filter @genetics/web build` · Thì `dist/` có chunk theo route; `size-limit` báo cáo
4. Khi mở `/__gallery` · Thì render mọi component `@genetics/ui` + state loading/empty/error/no-access

## Ghi chú kỹ thuật
- `defaultPreloadStaleTime: 0`; search params zod ở route mẫu `/home?tab=`

## Kiểm thử bắt buộc
- Vitest khung (AppShell theo quyền); lint

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
