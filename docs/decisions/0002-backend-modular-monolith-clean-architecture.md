# ADR-0002 · Backend: Modular Monolith với Clean Architecture bên trong module

- Trạng thái: **Proposed** · Ngày: 2026-10-26

## Bối cảnh
13 module nghiệp vụ (identity, reference, breeding, selective, quality, imports, labels, work, projects, analytics, notifications, files, audit) trên một DB; luật nghiệp vụ phải test không cần DB; AppSheet hiện có logic rải trong formula / action / bot (PLAN-001 INV-50…82); ~10 user.

## Động lực
Test được luật (gate, sinh mã, KPI, DQ); một use case một transaction; ranh giới rõ để Codex làm từng module song song với frontend; không over-engineer.

## Phương án và đánh đổi
| Phương án | Đánh đổi |
|---|---|
| Layered một package | rối khi 13 module; không enforce được ranh giới |
| Clean Architecture thuần cho mọi thứ | interface / DTO cho CRUD tham chiếu là chi phí thuần (Cosmic Python: "mỗi lớp gián tiếp tăng chi phí bảo trì") |
| Hexagonal | tương đương Clean về bản chất; mượn thuật ngữ port / adapter |
| DDD đầy đủ (domain event, message bus, event sourcing) | không có nhu cầu; cấm theo đề bài |
| Microservice | không có nhu cầu scale / team |
| **Modular monolith + Clean bên trong module, CQRS-lite cho đọc** | cần kỷ luật import, có tool kiểm (import-linter) |

## Quyết định đề xuất
- Package `genetics.modules.<module>` với 4 lớp `domain / application / infrastructure / api`; `shared_kernel`; `bootstrap` là composition root.
- Luật phụ thuộc đi vào trong; module nói chuyện qua `application/public.py`; mỗi bảng có đúng một module ghi; DAG module cố định (`backend.md` §6).
- Query đọc bằng SQL / Core trả DTO (không qua entity); mọi ghi qua domain + UoW.
- Không generic repository, không base class cho use case, không interface cho thứ chỉ có một adapter trừ port cần fake trong test (`Clock`, `IdGenerator`, `FileStorage`, `JobQueue`, `TokenVerifier`).
- Kiểm bằng import-linter contract (`layers`, `forbidden`, `independence`, `acyclic siblings`) trong pre-commit và CI; mypy strict cho domain + application.

## Hệ quả
- Module đơn giản (reference, files, notifications) được phép rút gọn (entity dựng từ row) — ghi rõ trong docstring module.
- Mỗi endpoint ghi theo checklist `backend.md` §17.
- Xem lại nếu: xuất hiện nhu cầu tách service riêng (ví dụ xử lý ảnh nặng) hoặc > 1 đội backend.

## Tham chiếu
Cosmic Python ch. 2, 4, 6, epilogue; Cockburn 2005; Martin 2012; Fowler MonolithFirst 2015; Grzybek modular-monolith-with-ddd (NetArchTest ≈ import-linter); import-linter 2.15 docs — `research-references.md` §B.
