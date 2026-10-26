#!/usr/bin/env bash
# PreToolUse hook cho Edit|Write|MultiEdit: chặn sửa file ngoài TASK_SCOPE (danh sách glob, phân cách dấu phẩy).
# TASK_SCOPE chưa đặt → cho phép (in cảnh báo một lần). Exit 2 = chặn (Claude Code hiển thị stderr).
set -euo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)"
[ -z "$file" ] && exit 0
if [ -z "${TASK_SCOPE:-}" ]; then
  echo "scope-guard: TASK_SCOPE chưa đặt — cho phép. Đặt theo allowed_paths của task để được bảo vệ." >&2
  exit 0
fi
root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
rel="${file#"$root"/}"
IFS=',' read -r -a globs <<< "$TASK_SCOPE"
shopt -s extglob globstar nullglob
for g in "${globs[@]}"; do
  g="$(echo "$g" | xargs)"
  [ -z "$g" ] && continue
  # so khớp glob kiểu gitignore đơn giản bằng python fnmatch có hỗ trợ **
  if python3 - "$rel" "$g" <<'PY'
import sys, re
rel, g = sys.argv[1], sys.argv[2]
pat = re.escape(g).replace(r'\*\*/', '(?:.*/)?').replace(r'\*\*', '.*').replace(r'\*', '[^/]*').replace(r'\?', '.')
sys.exit(0 if re.fullmatch(pat, rel) else 1)
PY
  then exit 0; fi
done
echo "scope-guard: '$rel' nằm ngoài TASK_SCOPE ($TASK_SCOPE). Nếu thật sự cần, đặt task 'blocked' và nêu lý do trong task file." >&2
exit 2
