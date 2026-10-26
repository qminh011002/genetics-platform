# ADR-0008 · Web: kiến trúc theo feature với luật import đơn hướng, kiểm bằng eslint-plugin-boundaries

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
19 feature, 95 màn đã duyệt; agent Claude (web) làm phần lớn; cần cấu trúc dễ đoán, ranh giới kiểm bằng tool, không trùng component.

## Phương án
| | Layered theo loại file | Feature-Sliced Design 2.1 | Domain modules độc lập | **Feature-based (bulletproof-react)** |
|---|---|---|---|---|
| Ranh giới enforce | yếu | mạnh (Steiger) | mạnh | mạnh (`eslint-plugin-boundaries` policies, dependency-cruiser) |
| Số khái niệm phải học | ít | nhiều (7 lớp, slice, segment) | trung bình | ít |
| Hợp với wireframe 13 feature | kém | trung bình (phải chia entities / features / widgets) | tốt | tốt (1 feature = 1 nhóm board) |
| Rủi ro | thư mục khổng lồ | tranh luận phân lớp; barrel file | trùng component chung | cần kỷ luật public API |

## Quyết định đề xuất
`src/{app, routes, features/<x>, components/common, layouts, hooks, lib, styles, testing}` (primitive shadcn ở `@genetics/ui`); luật `shared → features → app` (`web.md` §5); feature public API qua `index.ts` (export tường minh, không `*`); feature không import feature (ngoại lệ phải ghi lý do); `routes/` mỏng. TanStack Router file-based + Query; state lọc trong URL; không Redux / Zustand cho dữ liệu server. React Compiler bật. Error boundary mỗi page + `errorComponent` route.

## Hệ quả
- ESLint config có policies cụ thể (`web.md` §5) và `dependency-cruiser` no-circular; CI fail khi vi phạm.
- Mobile dùng cùng luật (`mobile.md` §4) để hai agent Claude dùng chung quy ước.
- Xem lại nếu: xuất hiện ≥ 3 feature cần dùng chung logic nghiệp vụ (không chỉ component) → thêm lớp `entities/` kiểu FSD cho phần đó.

## Tham chiếu
FSD docs (layers, public-api), bulletproof-react project-structure, eslint-plugin-boundaries 7, dependency-cruiser, react.dev build-from-scratch, TanStack Router (file-based, search params, authenticated routes, code splitting, external data loading), TanStack Query (keys, defaults, suspense, invalidation) — `research-references.md` §C.
