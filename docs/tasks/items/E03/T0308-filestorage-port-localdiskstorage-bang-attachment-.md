---
id: T0308
title: FileStorage port + LocalDiskStorage, bảng attachment, POST /attachments, GET download có kiểm quyền
epic: E03
status: todo
area: backend
type: feature
priority: P1
size: M
depends_on: [T0304, T0203]
decisions: [ADR-0015]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/modules/files/**"
  - "services/backend/alembic/versions/0007_attachment.py"
  - "services/backend/tests/**/test_files*.py"
---

## Bối cảnh
Cần cho nhãn, ảnh, import ở W2; làm ở init nếu còn thời gian. Nguồn: `backend.md` §4 module `files`, ADR-0015, `api-standards.md` §11.

## Phạm vi
Làm:
- Port `FileStorage` (put/get/delete/url_for) + `LocalDiskStorage(FILE_STORAGE_ROOT)` đường dẫn `owner_table/owner_id/uuid.ext`
- Migration `core.attachment` + audit
- `POST /attachments` multipart (20 MB / 10 MB theo loại, MIME allowlist) → 201; `GET /attachments/{id}/download` kiểm quyền owner (tạm: người tạo hoặc `admin.settings`)

Không làm:
- Không SharePoint / S3

## Tiêu chí chấp nhận
1. Khi upload PNG 1 MB với vai trò Executive · Thì 201 và file nằm đúng đường dẫn; tải lại bởi Worker khác → 404
2. Khi upload 25 MB · Thì 413 `payload_too_large`

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- pytest api + unit storage

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
