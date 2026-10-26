#!/usr/bin/env bash
# Chạy khi Codex tạo worktree mới cho một chat. Cài dependency JS + Python, sinh token và SDK.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v pnpm >/dev/null || corepack enable
pnpm install --frozen-lockfile
uv sync --locked
pnpm build:tokens || true
pnpm generate || true
echo "setup done: $(node -v) pnpm $(pnpm -v) uv $(uv --version)"
