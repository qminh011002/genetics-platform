# ADR-0011 · Offline: outbox IndexedDB + id client sinh, gửi lại theo foreground, server thắng, không CRDT

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
Wi-Fi khu nuôi yếu (Rollout Plan rủi ro #1; AppSheet mất dữ liệu nửa chừng). iOS không có Background Sync; Android có. Safari ITP có thể xoá storage sau 7 ngày không dùng trong tab, nhưng Home Screen app có bộ đếm riêng; `navigator.storage.persist()` được cấp theo heuristic. Refresh token SPA hết hạn 24 h.

## Phương án
| | Outbox IndexedDB ở tầng app + gửi lại khi online / foreground / 30 s (chọn) | SW Background Sync | CRDT / sync engine (Dexie Cloud, PowerSync…) |
|---|---|---|---|
| iOS | có | không | có nhưng dịch vụ ngoài / phức tạp |
| Xung đột | người dùng quyết định; server thắng trạng thái batch | — | tự merge (không phù hợp dữ liệu đo có gate) |
| Phụ thuộc | `idb` | — | SaaS / server riêng |

## Quyết định đề xuất
Như `mobile.md` §6: lưu = outbox trước; FIFO theo batch; backoff; phân loại lỗi (gửi lại: mạng / 5xx / 429 / 503 / 401 sau refresh; xung đột: 409 / 412 / 422; failed: 403); `id` UUID v4 client sinh + so hash ở server (ADR-0003, `api-standards.md` §9); `client_recorded_at` lưu nhưng `created_at` theo server; hoàn tác xoá 10 s; outbox gắn `user_id`; `persist()` sau đăng nhập; Background Sync Android chỉ là bonus qua adapter.

## Hệ quả
- Backend bắt buộc idempotent (`duplicate_id`, `Idempotency-Key`).
- E2E bắt buộc kịch bản offline → online không trùng.
- Xem lại nếu: cần nhiều người sửa cùng bản ghi offline (hiện không có) hoặc cần đồng bộ hai chiều dữ liệu lớn.

## Tham chiếu
MDN storage quotas, WebKit storage policy 2023 / ITP 2020, Chrome background-sync, web.dev offline-ux, idb — `research-references.md` §E.
