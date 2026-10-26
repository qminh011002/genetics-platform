# ADR-0013 · Quality gate: tool-first, chia Init và Harden

- Trạng thái: **Proposed** · Ngày: 2026-10-26 · Ràng buộc đã chốt: **GitHub Free** → không có Environment reviewer / secret scanning cho repo private; production deploy thủ công từ tag bởi người có SSH; gitleaks + ruleset thay thế

## Bối cảnh
Agent AI viết phần lớn code; quy tắc chỉ nằm trong prompt thì không đảm bảo. Cần gate kiểm được bằng máy, chia giai đoạn để không chặn khởi tạo.

## Quyết định đề xuất
Áp dụng `quality-standards.md`: static (ruff, ESLint 10, mypy, tsc, import-linter, boundaries, dependency-cruiser, commitlint, gitleaks), test (pytest unit / integration testcontainers / API / schemathesis; Vitest + MSW (web, mobile); Playwright e2e + visual + axe + PWA), contract (Spectral, oasdiff, diff generated), review (CODEOWNERS, PR template), ruleset GitHub (required checks luôn chạy — không `paths:` ở mức workflow; squash; ≥ 1 reviewer người). Init = W1 (acceptance-checklist); Harden = W4 (audit fail-on-high, size-limit, benchmark, backup drill, runbook, thiết bị thật). SLO và ngưỡng nâng cấp hạ tầng ở §7.

## Phương án đã loại
Pact (một backend, hai client nội bộ); Storybook + Chromatic ở bản đầu (ADR-0009); Lighthouse CI cho PWA (category đã bỏ từ Lighthouse 12); Nx / SonarQube (thêm vận hành không tương xứng).

## Hệ quả
CI ~ 8–12 phút mục tiêu; Playwright chạy trong image pin; coverage domain ≥ 90 % từ W2. Xem lại khi CI > 15 phút (bật remote cache, shard) hoặc khi có > 3 người review.

## Tham chiếu
Playwright docs (ci, docker, sharding, snapshots, accessibility), Vitest 5, MSW 3, Lighthouse 12 changelog, GitHub rulesets / required checks / CODEOWNERS, pre-commit, gitleaks, Dependabot, Renovate — `research-references.md` §C, §D.
