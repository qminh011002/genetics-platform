---
id: T0501
title: Migration tham chiếu: strain, scheme, line, generation, container, diet, protocol, protocol_version, kpi_definition (+ form_def đã có) với CHECK / UNIQUE / audit; ORM + repository tối thiểu
epic: E05
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0302, T0201]
decisions: [ADR-0003, ADR-0016]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/alembic/versions/0009_reference.py"
  - "services/backend/src/genetics/modules/reference/**"
  - "services/backend/tests/**/test_reference_*.py"
---

## Bối cảnh
Nguồn: `overview.md` §6, blueprint tab Database, `backend.md` §6, §7.6; ADR-0016 (model chung, chỉ phần MB nhưng có `scheme`, `line` ngay).

## Phạm vi
Làm:
- Migration `0009_reference`: bảng theo blueprint (code UNIQUE, `is_active`, cột hệ thống `created_*`, `updated_*`, `version`, `legacy_row_id`), CHECK (container code `^(MC|BC|CR)\d{2}$`, generation_no ≥ 0), UNIQUE (strain_id, generation_no); attach audit; seed `scheme` MSA/MSB/MSC, `line` SEL/CTR/BK, KPI definition v0 draft
- `modules/reference/infrastructure/orm.py` + repository `StrainRepository` (add, get, list, by_code) và query `list_strains` (SQL, cursor)
- Domain `Strain` (dataclass), value object `StrainCode` (uppercase, 2–5 ký tự)

Không làm:
- Không generation / container API (W1 sau / W2)

## Tiêu chí chấp nhận
1. Khi insert container `MC1` · Thì CHECK từ chối; `MC01` được
2. Khi up/down/up · Thì xanh; `alembic check` sạch
3. Khi insert strain trùng code · Thì UNIQUE lỗi → domain `DuplicateCode`

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- pytest integration + unit

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
