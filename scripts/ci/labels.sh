#!/usr/bin/env bash
# Tạo / cập nhật nhãn PR từ .github/labels.yml bằng gh (idempotent: `gh label create --force`).
# Dùng: scripts/ci/labels.sh [owner/repo]   (mặc định repo của thư mục hiện tại; cần `gh auth login`)
set -euo pipefail
cd "$(dirname "$0")/../.."
repo_args=()
[[ $# -gt 0 ]] && repo_args=(--repo "$1")

name="" color="" desc=""
flush() {
  [[ -z "$name" ]] && return 0
  gh label create "$name" --color "$color" --description "$desc" --force "${repo_args[@]}"
  echo "label: $name"
  name="" color="" desc=""
}
# labels.yml chỉ có dạng phẳng `- name:` / `color:` / `description:` nên đọc bằng bash, không cần parser YAML.
while IFS= read -r line; do
  case "$line" in
    "- name: "*) flush; name="${line#- name: }" ;;
    *"color: "*) color="${line#*color: }"; color="${color//\'/}" ;;
    *"description: "*) desc="${line#*description: }" ;;
  esac
done < .github/labels.yml
flush
