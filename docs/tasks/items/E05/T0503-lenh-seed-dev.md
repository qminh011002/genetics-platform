---
id: T0503
title: Lệnh seed-dev: 4 user giả theo vai trò, strains TMA/TME/REF/MSA/MSB/MSC, generations F0–F7, 10 cage, 10 room, protocol v1 placeholder; dùng cho local, test e2e, staging
epic: E05
status: todo
area: backend
type: feature
priority: P0
size: S
depends_on: [T0501, T0201]
decisions: []
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/cli.py"
  - "services/backend/src/genetics/seed/**"
  - "services/backend/tests/**/test_seed.py"
---

## Bối cảnh
Nguồn: `blueprint.md` §5, `getting-started.md` §3.

## Phạm vi
Làm:
- `genetics seed-dev` idempotent (`ON CONFLICT DO NOTHING`), chỉ khi `ENV != production`; user `worker|executive|manager|admin@example.test` gắn role
- Fixture pytest `seeded_db` dùng cùng code

Không làm:
- Không dữ liệu thật

## Tiêu chí chấp nhận
1. Khi chạy 2 lần · Thì không trùng; `ENV=production` → từ chối
2. Khi e2e web gọi `/strains` · Thì thấy 6 dòng

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- pytest

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
