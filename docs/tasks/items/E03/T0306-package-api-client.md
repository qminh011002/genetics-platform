---
id: T0306
title: Package api-client: orval (react-query, fetch, mock MSW, zod), mutator chung (token, headers, problem+json → ApiError), quyết định MSW 2/3
epic: E03
status: todo
area: web
type: feature
priority: P0
size: M
depends_on: [T0305, T0104]
decisions: [ADR-0006]
wireframes: []
owner: claude-web
allowed_paths:
  - "packages/api-client/**"
  - "pnpm-workspace.yaml (catalog msw nếu phải pin)"
---

## Bối cảnh
Nguồn: `api-standards.md` §17–18, `web.md` §7.1, ADR-0006, OQ-10.

## Phạm vi
Làm:
- `packages/api-client/orval.config.ts`: input `../../contracts/openapi/openapi.json`; output `src/generated` mode `tags-split`, client `react-query`, `httpClient: fetch`, `mock: true`, zod cho body; `override.mutator` → `src/mutator.ts`
- `src/mutator.ts`: nhận `tokenProvider`, gắn `Authorization`, `X-Request-ID`, `Accept-Language`, đọc `problem+json` → `ApiError { status, code, detail, errors, blockers, trace_id, current_version }`
- `src/mocks/index.ts` export `getAllHandlers()` với faker seed cố định
- Thử MSW 3 với mock orval; nếu lỗi → pin `msw@2` trong catalog và ghi OQ-10
- `package.json` exports; script `generate`; test: mutator + 1 handler

Không làm:
- Không sửa tay `src/generated`
- Không gọi API thật

## Tiêu chí chấp nhận
1. Khi `pnpm --filter @genetics/api-client generate` hai lần · Thì `git diff` rỗng lần hai
2. Khi backend trả 409 problem · Thì `ApiError.code === 'gate_not_met'` và `blockers` có dữ liệu (test MSW)
3. Khi dùng `useIdentityGetMe()` (hook sinh) trong component test với `setupServer(...getAllHandlers())` · Thì render dữ liệu mock

## Ghi chú kỹ thuật
- `operationId` từ backend → tên hook; nếu tên xấu, sửa tên hàm router (không `override.operationName`)

## Kiểm thử bắt buộc
- Vitest + MSW

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
