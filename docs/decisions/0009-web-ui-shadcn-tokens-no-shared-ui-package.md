# ADR-0009 · UI: shadcn/ui (Base UI) trong `packages/ui` dùng chung web + mobile, design-tokens là package riêng, visual regression bằng Playwright

- Trạng thái: **Accepted** (chủ dự án duyệt qua trao đổi 26/10/2026) · Ngày: 2026-10-26 · **Base UI**; vì ADR-0010 chọn web-first nên tách `packages/ui` ngay từ init (sửa đổi so với bản đề xuất ban đầu)

## Bối cảnh
Design system (`design-system.md`) viết trên shadcn/ui + Tailwind với token màu / chữ / bo góc cụ thể và danh sách component nghiệp vụ. Nghiên cứu 26/10/2026: shadcn CLI 4, **Base UI là primitive mặc định từ 7/2026**, Radix vẫn được hỗ trợ (`init -b radix`), Tailwind 4 CSS-first `@theme`, shadcn có hướng dẫn monorepo (`packages/ui` + `components.json` mỗi workspace); NativeWind 4 (mobile Expo) chỉ Tailwind 3; Playwright bỏ component-testing cũ, visual bằng `toHaveScreenshot`; Storybook 10 định vị visual testing qua Chromatic (SaaS).

## Động lực
Giữ đúng thiết kế đã duyệt; không component trùng; token một nguồn cho web + mobile; chi phí tool thấp; agent không "thiết kế lại".

## Phương án
| Hạng mục | Chọn | Thay thế |
|---|---|---|
| Primitive | **Base UI** (mặc định shadcn hiện hành; CLI, docs, agent skill đi theo mặc định) | Radix (`-b radix`; nhiều tài liệu cũ, nhưng phải pin cờ ở mọi lệnh CI / agent) |
| Nơi đặt component shadcn | **`packages/ui`** (`@genetics/ui`, shadcn `init --monorepo`; `components.json` ở mỗi app trỏ `ui` → `@genetics/ui/components`) — dùng chung web + mobile vì cả hai là DOM (ADR-0010 = B) | `apps/web/src/components/ui` riêng (loại: mobile sẽ phải sao chép) |
| Token | `packages/design-tokens` (`tokens.json` → `web.css` Tailwind 4 `@theme` + biến shadcn, `tokens.ts`); không cần preset Tailwind 3 nữa | hex trong component (cấm) |
| Component nghiệp vụ | `components/common` theo danh sách cố định trong `design-system.md` §6.2 | tự do (cấm) |
| Visual regression | Playwright `toHaveScreenshot` trên trang gallery + màn chính, baseline trong Docker image pin | Storybook + Chromatic (SaaS, thêm tool) — để sau nếu cần designer review |
| Component test | Vitest + Testing Library + MSW; e2e Playwright | Playwright CT (đã bỏ) |

## Quyết định đề xuất
Như cột "Chọn". Quy tắc: không tạo component mới ngoài danh sách khi chưa cập nhật `design-system.md` trong cùng PR; biến thể bằng `cva`; ảnh visual đổi phải được duyệt; không dark mode nhưng giữ cấu trúc `.dark`.

## Hệ quả
- `packages/ui` chứa primitive shadcn (CLI sinh, sửa theo design system) + `cn`; `components/common` (web) và `components/mobile` (mobile) nằm trong từng app; component dùng chung cả hai app (BatchCode, StrainBadge, StatusBadge) chuyển lên `packages/ui/src/business`.
- `components.json` mỗi app: `style: new-york`, `base: base-ui`, `cssVariables: true`, alias `ui` → `@genetics/ui`; CI script `shadcn add` luôn chạy từ app với cờ tương ứng.
- Xem lại nếu: cần designer review từng story (thêm Storybook).

## Tham chiếu
shadcn docs (changelog Base UI default, components.json, tailwind-v4, theming, monorepo, registry), Tailwind theme docs, NativeWind docs, Playwright test-snapshots / docker / accessibility / test-components, Storybook visual-testing — `research-references.md` §C.
