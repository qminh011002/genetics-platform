# ADR-0015 · Lưu file: port `FileStorage`, bản đầu ổ server (volume), SharePoint / MinIO sau

- Trạng thái: **Proposed** · Ngày: 2026-10-26 · Liên quan D4

## Bối cảnh
File: nhãn PDF, report PDF, ảnh (cage / room / task), file import, tài liệu; AppSheet lưu trong thư mục app và link SharePoint (PM `files.file_path`). Khối lượng nhỏ (hàng nghìn file, MB-GB).

## Phương án
| | Ổ server (volume) | SharePoint qua Graph API | MinIO / S3 |
|---|---|---|---|
| Vận hành | backup cùng rsync | IT quản, quyền Entra | thêm service |
| Tích hợp | đơn giản | token Graph, throttling, quyền thư mục | SDK S3 |
| Phù hợp v1 | có | có nếu IT yêu cầu lưu tập trung | khi cần nhiều máy |

## Quyết định đề xuất
Port `FileStorage` (`put`, `get`, `delete`, `url_for` có kiểm quyền qua API) + adapter `LocalDiskStorage` (volume `files`, đường dẫn theo `owner_table/owner_id/uuid.ext`), bảng `attachment` giữ metadata; download luôn qua API (không link public). Adapter SharePoint hoặc S3 thêm sau mà không đổi domain / API.

## Hệ quả
Backup file cùng lịch DB; giới hạn 20 MB / 10 MB; quét MIME. Xem lại nếu IT yêu cầu lưu trên SharePoint (retention / eDiscovery) hoặc có > 1 máy chạy API.
