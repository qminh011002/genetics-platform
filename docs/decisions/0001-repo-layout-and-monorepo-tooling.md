# ADR-0001 · Bố cục monorepo và công cụ: pnpm + Turborepo + uv

- Trạng thái: **Proposed** · Ngày: 2026-10-26 · Người đề xuất: Claude Planner (PLAN-002)

## Bối cảnh
Một repo chứa ba app (`genetics_platform_backend` Python, `genetics_platforms_web` React, `genetics_platform_mobile` PWA web-first) + package dùng chung + hợp đồng API, do ba agent làm song song. Repo hiện có sẵn thư mục trống `apps/ services/ packages/ contracts/` và tài liệu bản 1.0 ghi `backend/` ở gốc.

## Động lực
Build / test độc lập từng app; cache CI; một nguồn version cho dependency JS; Python tách riêng nhưng cùng repo; agent đoán được vị trí file; không thêm tool không cần.

## Phương án
| | A · pnpm `-r` + script root, không tool | B · **pnpm 12 + Turborepo 2** | C · Nx (+ `@nxlv/python` cộng đồng) |
|---|---|---|---|
| Task graph, cache local / remote, `--affected` | Chỉ topological order; không cache | Có; Vercel Remote Cache free hoặc tự host | Có, mạnh hơn |
| Python | tự gọi `uv` | script `package.json` bọc `uv run` (chế độ Python native còn experimental) | plugin cộng đồng |
| Độ phức tạp | thấp | thấp (một `turbo.json`) | cao, generator / plugin |
| Agent | đơn giản | đơn giản, phổ biến | học thêm |

Thư mục: `apps/web`, `apps/mobile`, `services/backend`, `contracts/openapi`, `packages/{ui,api-client,shared,design-tokens}`, `tools/legacy_import`, `infra/`. Package JS đặt tên `@genetics/*`; Python distribution `genetics-platform-backend`, import package `genetics`.

## Đánh đổi
- B thêm một file cấu hình nhưng cho `turbo run test --affected` trong CI và cache build web / mobile; A đủ cho 3 package nhưng CI sẽ build mọi thứ mỗi PR.
- `pnpm catalog:` làm nguồn version JS duy nhất (React, TanStack, zod…) để web và mobile không lệch.
- uv workspace (root `pyproject.toml`, một `uv.lock`) cho backend + `tools/legacy_import`; CI dùng `uv sync --locked`.
- Thư mục `services/backend` thay cho `backend/` của bản 1.0 để khớp cấu trúc đã tạo và tên dự án trong đề bài.

## Quyết định đề xuất
**B.** pnpm 12 workspaces + `catalog:` + Turborepo 2 (không bật chế độ Python experimental); uv 0.13 workspace; Node 22 LTS, Python 3.13; `packageManager` trong `package.json`; `.python-version`.

## Hệ quả
- Cập nhật `overview.md` §5 (đã làm). Backend có `package.json` tối thiểu (`lint`, `typecheck`, `test`, `build`, `export-openapi`).
- Bắt đầu với Turborepo cache local; remote cache (Vercel free) bật khi CI > 10 phút.
- Điều kiện xem lại: nếu Turborepo gây phiền (hash env, cache sai) với 3 package → bỏ về A trong 1 ngày công; nếu Turborepo Python workspaces ra khỏi experimental → cân nhắc bỏ script bọc.

## Tham chiếu
pnpm docs (workspace, catalogs, filtering, deploy, docker), Turborepo docs (configuration, remote caching, python guide "experimental"), uv docs (workspaces, sync `--locked`, docker, GitHub) — `research-references.md` §D, truy cập 26/10/2026.
