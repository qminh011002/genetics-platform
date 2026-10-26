---
id: T0103
title: Package ui: shadcn init --monorepo (Base UI), primitive ban đầu, component nghiệp vụ dùng chung
epic: E01
status: todo
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
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
