---
id: T0305
title: Hợp đồng: export-openapi chuẩn (operationId, Problem, examples), contracts/openapi + spectral ruleset, oasdiff trong CI, schemathesis khung
epic: E03
status: todo
area: backend
type: feature
priority: P0
size: M
depends_on: [T0303]
decisions: [ADR-0006]
wireframes: []
owner: codex
allowed_paths:
  - "services/backend/src/genetics/bootstrap/**"
  - "services/backend/src/genetics/cli.py"
  - "services/backend/tests/contract/**"
  - "contracts/**"
  - "package.json (script contract:check)"
  - "scripts/ci/contract-check.sh"
---

## Bối cảnh
Nguồn: `api-standards.md` §3, §16–20, `setup-guide.md` §4.

## Phạm vi
Làm:
- `genetics export-openapi` ghi `contracts/openapi/openapi.json` (ổn định, sort keys)
- `contracts/openapi/spectral.yaml`: `extends: spectral:oas`; rule `operationId` khớp `^[a-z]+_[a-z_]+$`, mọi 4xx có schema `Problem`, path kebab-case, tag = module
- `tests/contract/test_schemathesis.py`: `schema = schemathesis.from_asgi('/api/v1/openapi.json', app)`; `case.call_and_validate()`; chạy trên spec hiện có
- Script CI `contract:check` ở root: export → diff → spectral → `oasdiff breaking origin/main` (fail trừ nhãn `api-breaking`)

Không làm:
- Không SDK (T0306)

## Tiêu chí chấp nhận
1. Khi đổi tên hàm router · Thì `operationId` đổi và `oasdiff` báo breaking
2. Khi `pnpm contract:check` trên nhánh sạch · Thì xanh; khi quên export sau khi thêm route · Thì đỏ
3. Khi schemathesis chạy · Thì 0 lỗi 5xx trên `/healthz`, `/readyz`, `/me` (dev auth)

## Ghi chú kỹ thuật
- `oasdiff` chạy qua Docker hoặc binary tải trong CI

## Kiểm thử bắt buộc
- pytest contract; CI

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
