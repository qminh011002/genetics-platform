# ADR-0012 · Hạ tầng: Docker Compose trên server Genetics nội bộ (Azure là phương án B), deploy từ CI, backup pg_dump + restore drill

- Trạng thái: **Accepted** (chủ dự án duyệt qua trao đổi 26/10/2026) · Ngày: 2026-10-26 · **Chọn A: VM nội bộ (Docker Compose)** · chốt D3

## Bối cảnh
Server Genetics đang chạy Postgres + Metabase (Docker). ~10 user. Điện thoại cần HTTPS tới API từ khu nuôi (Wi-Fi nội bộ / VPN hoặc internet). IT dùng Microsoft 365 / Entra. Watchtower đã archive. Sentry self-host cần 16 GB RAM.

## Phương án
| | A · Compose trên server nội bộ | B · Azure (Container Apps / App Service + Azure Database for PostgreSQL) |
|---|---|---|
| Chi phí | máy có sẵn | theo tháng |
| Backup / TLS / cập nhật | tự lo (pg_dump cron, chứng chỉ nội bộ hoặc Let's Encrypt) | quản lý sẵn |
| Truy cập từ điện thoại | cần Wi-Fi / VPN tới server (UNK-07) | internet |
| Entra / GitHub OIDC | không liên quan | tiện |
| Khoá dữ liệu | nội bộ | cloud (cần chính sách) |

## Quyết định đề xuất
**A** (đã chốt). Deploy **thủ công bởi chủ dự án** trên VM bằng `infra/deploy.sh <tag>` (CI chỉ build + push image lên GHCR); migration trong entrypoint; backup mức 1 bắt buộc từ W1; PITR (pgBackRest) chỉ khi RPO < 24 h được yêu cầu; Sentry SaaS free; Uptime Kuma. Không Kubernetes, không Watchtower, không SSH từ GitHub. Hướng dẫn: `docs/ops/deploy-vm.md`.

## Hệ quả
`infrastructure.md` là đặc tả; cần IT xác nhận UNK-07 (Wi-Fi khu nuôi tới server, tên miền / chứng chỉ) trước W1 cuối. Xem lại nếu: server nội bộ không đạt 99 % giờ làm việc, hoặc cần truy cập từ ngoài công ty.

## Tham chiếu
Docker Compose spec (compose.yaml, healthcheck, depends_on), uv / pnpm Docker guides, Postgres image, pg_dump / continuous-archiving / pgBackRest, Watchtower (archived), Sentry pricing / self-hosted, Uptime Kuma, GitHub environments / OIDC Azure — `research-references.md` §D.
