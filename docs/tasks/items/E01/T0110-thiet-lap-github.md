---
id: T0110
title: Thiết lập GitHub: ruleset main (required checks, review, squash, linear), labels, GHCR, Dependabot bật
epic: E01
status: ready
area: infra
type: chore
priority: P0
size: S
depends_on: [T0105]
decisions: [ADR-0013]
wireframes: []
owner: human
allowed_paths:
  - "(ngoài repo: GitHub / Entra)"
---

## Bối cảnh
Thao tác trên GitHub UI / `gh` bởi chủ repo (GitHub Free). Nguồn: `quality-standards.md` §3, `setup-guide.md` §10.

## Phạm vi
Làm:
- Ruleset `main`: required status checks `lint contract test-backend test-web test-mobile build scope-check`, ≥ 1 approving review, require code owner review, linear history, squash only, block force push
- Tạo labels (script `scripts/ci/labels.sh` từ T0105)
- Bật Dependabot alerts + updates; GHCR visibility private; PAT đọc package cho VM

Không làm:
- Không bật Environment (không có ở Free cho private)

## Tiêu chí chấp nhận
1. Khi PR có check đỏ · Thì nút merge khoá
2. Khi push thẳng `main` · Thì bị từ chối

## Ghi chú kỹ thuật
- (không)

## Kiểm thử bắt buộc
- Kiểm thủ công, chụp màn hình vào task file

## Câu hỏi
- (trống)

## Kết quả (điền khi xong)
- PR: #
- Ghi chú:
