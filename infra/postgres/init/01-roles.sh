#!/usr/bin/env bash
# Tạo 3 role ứng dụng từ biến môi trường (infrastructure.md §9, ADR-0004):
#   app_migrator      – Alembic; sở hữu schema / bảng (BYPASSRLS KHÔNG bật; migration không đọc dữ liệu nghiệp vụ)
#   app_rw            – API / worker; DML qua default privileges của app_migrator; RLS áp dụng
#   app_analytics_ro  – Metabase / báo cáo; chỉ SELECT
# Chạy bởi entrypoint của image postgres khi volume còn trống (docker-entrypoint-initdb.d).
# Idempotent: có thể chạy lại tay `psql -v ... -f` để rotate mật khẩu.
set -euo pipefail

: "${APP_MIGRATOR_PASSWORD:?APP_MIGRATOR_PASSWORD missing}"
: "${APP_RW_PASSWORD:?APP_RW_PASSWORD missing}"
: "${APP_ANALYTICS_RO_PASSWORD:?APP_ANALYTICS_RO_PASSWORD missing}"
: "${POSTGRES_DB:?POSTGRES_DB missing}"

psql -v ON_ERROR_STOP=1 \
  -v migrator_pw="$APP_MIGRATOR_PASSWORD" \
  -v rw_pw="$APP_RW_PASSWORD" \
  -v ro_pw="$APP_ANALYTICS_RO_PASSWORD" \
  -v db="$POSTGRES_DB" \
  --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
-- Tạo role nếu chưa có (CREATE ROLE không có IF NOT EXISTS → dùng \gexec).
SELECT format('CREATE ROLE app_migrator LOGIN NOINHERIT PASSWORD %L', :'migrator_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_migrator') \gexec
SELECT format('CREATE ROLE app_rw LOGIN PASSWORD %L', :'rw_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_rw') \gexec
SELECT format('CREATE ROLE app_analytics_ro LOGIN PASSWORD %L', :'ro_pw')
  WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_analytics_ro') \gexec

-- Luôn đồng bộ mật khẩu với .env (rotate = đổi .env + chạy lại script).
ALTER ROLE app_migrator PASSWORD :'migrator_pw';
ALTER ROLE app_rw PASSWORD :'rw_pw';
ALTER ROLE app_analytics_ro PASSWORD :'ro_pw';

-- Không role nào là superuser / bypass RLS.
ALTER ROLE app_migrator NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
ALTER ROLE app_rw NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
ALTER ROLE app_analytics_ro NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;

-- app_migrator sở hữu DB → tạo schema, extension cần superuser sẽ nằm trong migration có ghi chú.
SELECT format('ALTER DATABASE %I OWNER TO app_migrator', :'db') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO app_rw, app_analytics_ro', :'db') \gexec
SELECT format('REVOKE CONNECT ON DATABASE %I FROM PUBLIC', :'db') \gexec

-- Schema public: chỉ migrator tạo đối tượng; app đọc / ghi theo default privileges.
ALTER SCHEMA public OWNER TO app_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_rw, app_analytics_ro;

-- Mọi bảng / sequence / function do app_migrator tạo (ở bất kỳ schema) tự cấp quyền cho app:
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_rw;
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator
  GRANT USAGE, SELECT ON SEQUENCES TO app_rw;
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator
  GRANT EXECUTE ON FUNCTIONS TO app_rw;
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator
  GRANT SELECT ON TABLES TO app_analytics_ro;

-- Phiên của app_rw / app_analytics_ro không chạy quá lâu (bảo vệ DB nhỏ).
ALTER ROLE app_rw SET statement_timeout = '30s';
ALTER ROLE app_analytics_ro SET statement_timeout = '120s';
ALTER ROLE app_analytics_ro SET default_transaction_read_only = on;
SQL

echo "[init] roles app_migrator, app_rw, app_analytics_ro ready on database ${POSTGRES_DB}"
