# Câu hỏi kiến trúc còn mở (PLAN-002)

> Chỉ câu hỏi **kiến trúc / kỹ thuật**. Câu hỏi nghiệp vụ, dữ liệu, lịch (D1, D5–D8, DN-x, UNK-x) ở `docs/migration/06-risks-unknowns-decisions.md`. Mỗi mục: ai trả lời, cần trước mốc nào, mặc định nếu không có câu trả lời (để không chặn PLAN-003).

| ID | Câu hỏi | Ai | Cần trước | Mặc định | Liên quan |
|---|---|---|---|---|---|
| OQ-1 | Mobile: Expo + RN Web hay web-first PWA? | — | — | **Đã chốt 26/10/2026: web-first** | ADR-0010 |
| OQ-2 | Procrastinate thay arq + Redis? | — | — | **Đã chốt: Procrastinate** | ADR-0005 |
| OQ-3 | Nơi chạy và ai deploy: **đã chốt — chủ dự án tự deploy trên VM công ty** (`docs/ops/deploy-vm.md`). Còn cần IT: 3 app registration Entra + admin consent (OQ-3a), chứng chỉ TLS / tên miền nội bộ cho VM (OQ-3b), Wi-Fi khu nuôi tới VM (OQ-3c) | IT (3a–3c) | W1 | token giả ở local; TLS CA nội bộ | ADR-0004, ADR-0012, UNK-06/07 |
| OQ-4 | shadcn primitive | — | — | **Đã chốt: Base UI** | ADR-0009 |
| OQ-5 | PostgreSQL 16 hay 18 | — | — | **Đã chốt: 18** (`postgres:18`; `PGDATA` theo version) | ADR-0003 |
| OQ-6 | Python | — | — | **Đã chốt: 3.13** (ổn định nhất hiện tại cho stack này) | ADR-0003 |
| OQ-7 | RPO chấp nhận được: 24 h (pg_dump) hay cần PITR (pgBackRest)? | Genetics Manager | W4 | 24 h | ADR-0012 |
| OQ-8 | Tài khoản GitHub | — | — | **Đã chốt: Free** → ruleset + gitleaks; production deploy thủ công từ tag; không Environment reviewer | ADR-0013 |
| OQ-9 | Turborepo remote cache (Vercel free) có được phép dùng dịch vụ ngoài không? | chủ repo | khi CI > 10 phút | cache local | ADR-0001 |
| OQ-10 | MSW 3 với mock orval — chạy thử ở task init; nếu lỗi, pin MSW 2 bao lâu? | Claude web | task init | pin 2.x, xem lại hằng quý | ADR-0006 |
| OQ-11 | Thiết bị dùng chung ở khu nuôi: có cần PIN / khoá app riêng ngoài đăng nhập Microsoft không? | Genetics Manager | W2 | không; đăng xuất khi đổi ca | mobile.md §7.4 |
| OQ-12 | Web Push có đưa vào v1 không (iOS chỉ khi cài, Android đủ)? | Genetics Manager | W2 | không bắt buộc; thông báo trong app | F-0308 |
| OQ-13 | OpenTelemetry (còn beta cho FastAPI) có cần ở bản đầu? | người duyệt kỹ thuật | W4 | không; Sentry + log JSON | backend.md §14 |
| OQ-14 | Có dùng React Compiler từ đầu (ổn định 1.0) hay bật sau khi có coverage? | Claude web | task init | bật, pin phiên bản | web.md §3 |
| OQ-15 | (đóng — Expo không dùng) | — | — | — | ADR-0010 |
| OQ-16 | Tên thư mục | — | — | **Đã chốt: mặc định** `apps/web`, `apps/mobile`, `services/backend`; tên trong đề bài là mô tả dự án | ADR-0001 |
| OQ-17 | Lưu file: ổ server (mặc định) hay IT yêu cầu SharePoint? | IT | W2 | ổ server qua `FileStorage` | ADR-0015 |
| OQ-18 | Claude Code / Codex: license và phiên bản tối thiểu trên máy dev (Claude Code ≥ 2.1.277 để đọc AGENTS.md; Codex với `codex exec`) | chủ repo | W1 | ghi trong setup-guide | ADR-0014 |
