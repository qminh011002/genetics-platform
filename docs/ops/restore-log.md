# Restore drill log

Hằng tháng (bắt buộc, `infrastructure.md` §7, `deploy-vm.md` §6): chạy `infra/backup/restore-test.sh` (restore bản mới nhất vào DB tạm, đếm bảng, xoá DB tạm) và dán dòng kết quả vào đây. Ghi cả lần restore thật (sự cố) với ghi chú.

Lệnh:

```bash
cd /opt/genetics/<env>
docker compose -f compose.yaml -f compose.prod.yaml run --rm --no-deps \
  -e RESTORE_TEST_USER=postgres -e RESTORE_TEST_PASSWORD="$POSTGRES_PASSWORD" \
  --entrypoint /opt/backup/restore-test.sh backup            # hoặc thêm /backups/<file>.dump
```

| Thời điểm (UTC) | Bản backup | Người | Kết quả | Kiểm tra (số bảng, alembic, thời gian) | Ghi chú |
|---|---|---|---|---|---|
