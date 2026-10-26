# Deploy lên VM công ty (staging và production)

> Người vận hành: chủ dự án (tự deploy). CI chỉ **build và push image** lên GHCR; không có SSH từ GitHub vào VM. Áp dụng ADR-0012 (Compose trên VM nội bộ), ADR-0005 (không Redis), PostgreSQL 18, GitHub Free.
> Hai stack trên cùng VM hoặc hai VM: `staging` (theo dõi `main`) và `production` (theo tag `vX.Y.Z`). Thư mục chuẩn: `/opt/genetics/<env>/`.

## 1. Chuẩn bị VM (một lần)

- Ubuntu 24.04 LTS (hoặc tương đương), 4 vCPU, 8 GB RAM, 80 GB SSD; mở 443 (và 80 để redirect) trong LAN / VPN; NTP bật.
- Cài Docker Engine + Compose v2; user `deploy` trong group `docker`; `ufw` chỉ cho 22, 80, 443.
- Đăng nhập GHCR: `docker login ghcr.io -u <user> -p <PAT read:packages>` (PAT chỉ quyền đọc package).
- Tạo thư mục:

```bash
sudo mkdir -p /opt/genetics/{staging,production}/{files,backups} && sudo chown -R deploy:deploy /opt/genetics
```

- Chứng chỉ TLS: nội bộ (CA công ty) hoặc Let's Encrypt nếu có tên miền public; đặt tại `/opt/genetics/<env>/tls/{fullchain.pem,privkey.pem}`.
- Lấy file deploy từ repo: `infra/compose.yaml`, `infra/compose.prod.yaml`, `infra/nginx/`, `infra/backup/`, `infra/deploy.sh`, `infra/.env.example` (clone repo vào `/opt/genetics/src` và symlink, hoặc `scp`).
- Tạo `/opt/genetics/<env>/.env` từ `.env.example`, `chmod 600`: `ENV=staging|production`, `AUTH_MODE=entra`, mật khẩu DB ngẫu nhiên cho 3 role, `ENTRA_*`, `PUBLIC_WEB_URL=https://<host>`, `PUBLIC_MOBILE_URL=https://<host>/app`, `SENTRY_DSN`, `IMAGE_TAG`.

## 2. Image

CI (`.github/workflows/release.yml`) push lên GHCR:

| Image | Tag |
|---|---|
| `ghcr.io/<org>/genetics-api` (API + worker) | `sha-<git sha>` mỗi merge `main`; `vX.Y.Z` khi gắn tag |
| `ghcr.io/<org>/genetics-web` | như trên |
| `ghcr.io/<org>/genetics-mobile` | như trên |

Staging dùng `IMAGE_TAG=sha-<sha>` (hoặc `main`), production chỉ dùng `vX.Y.Z`.

## 3. Deploy / cập nhật

```bash
cd /opt/genetics/production
./deploy.sh v1.4.0          # staging: ./deploy.sh sha-abc1234
```

`infra/deploy.sh` làm theo thứ tự, dừng ngay khi lỗi:

1. Ghi `IMAGE_TAG` vào `.env`; `docker compose pull`.
2. **Backup trước khi migrate**: `docker compose exec postgres pg_dump -Fc -U app_migrator genetics > backups/pre-<tag>-<time>.dump`.
3. `docker compose up -d --remove-orphans` (container `api` tự chạy `alembic upgrade head` trong entrypoint rồi mới mở cổng; `worker` chờ `api` healthy).
4. Smoke: `curl -fsS https://<host>/readyz`, `curl -fsS https://<host>/` và `/app/manifest.webmanifest`; kiểm `alembic current` = head qua `docker compose exec api genetics db-current`.
5. Ghi dòng vào `docs/ops/deploy-log.md` (tag, giờ, người, kết quả).

Downtime chấp nhận: vài giây khi container `api` khởi động lại (một instance). Deploy production vào giờ không nhập liệu (trước 07:00 hoặc sau 18:00).

## 4. Rollback

```bash
./deploy.sh v1.3.2                                   # image cũ
docker compose exec api alembic downgrade <rev>      # chỉ khi migration của bản mới có downgrade (ghi trong PR)
# nếu không downgrade được: restore backup pre-<tag> (mục 6) rồi deploy image cũ
```

## 5. Vận hành hằng ngày

| Việc | Lệnh |
|---|---|
| Xem log | `docker compose logs -f api worker nginx --since 1h` |
| Trạng thái | `docker compose ps`; Uptime Kuma tại `https://<host>:3001` (profile `ops`) |
| Chạy job tay | `docker compose exec api genetics job run nightly_dq` |
| Mở shell DB | `docker compose exec postgres psql -U app_migrator genetics` |
| Rotate secret | sửa `.env` → `docker compose up -d` (DB role: `ALTER ROLE … PASSWORD` trước) |
| Cập nhật OS / Docker | tháng một lần, sau backup |

## 6. Backup và restore

- Cron trong container `backup` (profile mặc định): `pg_dump -Fc` 02:00 hằng ngày vào `backups/`, giữ 30 ngày + 12 tháng; `rsync` `backups/` và `files/` sang máy khác / SharePoint (script `backup/offsite.sh`, cấu hình đích trong `.env`).
- **Restore drill hằng tháng** (bắt buộc, ghi `docs/ops/restore-log.md`):

```bash
docker compose exec postgres createdb -U app_migrator genetics_restore_test
docker compose exec postgres pg_restore -U app_migrator -d genetics_restore_test -j 4 /backups/<file>.dump
docker compose exec postgres psql -U app_migrator -d genetics_restore_test -c "select count(*) from core.batch"
docker compose exec postgres dropdb -U app_migrator genetics_restore_test
```

- Restore thật: dừng `api`, `worker`; `pg_restore --clean --if-exists` vào `genetics`; `up -d`.
- PITR (pgBackRest) chỉ thêm khi OQ-7 yêu cầu RPO < 24 giờ.

## 7. Cutover từ AppSheet (W4)

Theo `docs/migration/05-waves.md` và runbook `docs/ops/runbook.md` (viết ở W4): khoá AppSheet chỉ đọc → `genetics legacy import --final` → đối chiếu → mở app mới → tắt cron ETL + Metabase → rotate secret cũ.

## 8. Checklist trước khi deploy production lần đầu

- [ ] Staging chạy ≥ 2 tuần với dữ liệu migrate, 0 defect mở.
- [ ] Backup + restore drill đã ghi log ít nhất 1 lần.
- [ ] TLS hợp lệ trên điện thoại Android và iPhone trong khu nuôi (cài CA nếu nội bộ).
- [ ] Entra app registration production (redirect URI đúng host).
- [ ] `.env` production không chứa giá trị ví dụ; `AUTH_MODE=entra`; Swagger tắt (`ENV=production`).
- [ ] Uptime Kuma theo dõi `/readyz`, trang web, trang mobile; thông báo tới người vận hành.
- [ ] Người thứ hai biết chạy `deploy.sh` và restore.
