---
id: T0405
title: Mobile offline khung: IndexedDB (idb) stores + migration, outbox, sync engine (FIFO theo batch, backoff, phân loại lỗi, idempotent), MSync, OfflineBanner/SyncBadge nối dữ liệu
epic: E04
status: todo
area: mobile
type: feature
priority: P0
size: L
depends_on: [T0404, T0306]
decisions: [ADR-0011]
wireframes: [MSync]
owner: claude-mobile
allowed_paths:
  - "apps/mobile/src/offline/**"
  - "apps/mobile/src/platform/storage.ts"
  - "apps/mobile/src/features/sync/**"
  - "apps/mobile/src/components/mobile/{OfflineBanner,SyncBadge}.tsx"
---

## Bối cảnh
Mục tiêu "không mất dữ liệu". Nguồn: `mobile.md` §6, `api-standards.md` §9, ADR-0011.

## Phạm vi
Làm:
- `offline/db.ts`: database `genetics` v1 với 6 store, index theo `user_id`, `batch_code`, `status`; `platform/storage.ts` bọc idb; `navigator.storage.persist()` sau đăng nhập
- `offline/outbox.ts`: `enqueue(kind, method, path, body, headers)`, `update`, `remove`, `listByStatus`; item có `id` = id bản ghi
- `offline/sync-engine.ts`: trigger (sau enqueue, `online`, `visibilitychange`, 30 s), FIFO per batch, backoff 5/15/60/300 s, phân loại 2xx / mạng-5xx-429-503 / 401 / 409-412-422 / 403, cập nhật cache + invalidate query; không Background Sync
- `features/sync/`: MSync (danh sách chờ gửi, xung đột với Sửa / Bỏ, lịch sử 7 ngày), OfflineBanner, SyncBadge nối store
- Hoàn tác xoá 10 s (`pendingDelete` timer)

Không làm:
- Không form thật (W2) — dùng form giả `demo_note` POST tới endpoint mock

## Tiêu chí chấp nhận
1. Cho offline · Khi enqueue 3 item cùng batch rồi online · Thì gửi tuần tự, server (MSW) nhận đúng thứ tự, 3 item `sent`
2. Cho server trả 503 rồi 201 · Thì retry sau 5 s (fake timers) và thành công
3. Cho server trả 409 `batch_closed` · Thì item `conflict`, không retry, MSync hiện lý do
4. Cho xoá rồi bấm Hoàn tác trong 10 s · Thì không có item delete trong outbox
5. Cho đổi user · Thì `listByStatus` chỉ trả item của user hiện tại

## Ghi chú kỹ thuật
- Dùng `fake-indexeddb` trong Vitest

## Kiểm thử bắt buộc
- Vitest unit (sync engine) + component (MSync)

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
