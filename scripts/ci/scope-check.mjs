// scope-check (ADR-0014 §3): đọc `Task: Txxxx` trong PR body → `allowed_paths` của task file → so với diff.
// Output `status` = in-scope | out-of-scope | no-task; workflow dựa vào đó gắn / gỡ nhãn `out-of-scope`.
// Luôn cho phép task file của chính task và `docs/tasks/board.md` (handoff cuối phiên, AGENTS.md).
// Glob giống `.claude/hooks/scope-guard.sh`: `**/` = 0..n thư mục, `**` = mọi thứ, `*` = trong một thư mục.
//
// node scripts/ci/scope-check.mjs --body-file <file> --base <ref> [--head <ref>]
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { changedFiles, parseArgs, setOutput, summary } from './lib.mjs';

const ITEMS_DIR = 'docs/tasks/items';
const ALWAYS_ALLOWED = ['docs/tasks/board.md'];

export function parseTaskId(body) {
  const m = /^\s*Task:\s*\[?(T\d{4})\b/im.exec(body ?? '');
  return m ? m[1] : null;
}

/** Lấy danh sách `allowed_paths` từ frontmatter YAML của task file (chỉ dạng list `- "glob"`). */
export function parseAllowedPaths(markdown) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(markdown);
  if (!fm) return [];
  const lines = fm[1].split('\n');
  const start = lines.findIndex((l) => /^allowed_paths:\s*$/.test(l));
  if (start === -1) return [];
  const globs = [];
  for (const line of lines.slice(start + 1)) {
    const item = /^\s+-\s+(.+?)\s*$/.exec(line);
    if (!item) break;
    globs.push(item[1].replace(/^(['"])(.*)\1$/, '$2'));
  }
  return globs;
}

export function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\*?]/g, '\\$&');
  const pattern = escaped
    .replace(/\\\*\\\*\//g, '(?:.*/)?')
    .replace(/\\\*\\\*/g, '.*')
    .replace(/\\\*/g, '[^/]*')
    .replace(/\\\?/g, '.');
  return new RegExp(`^${pattern}$`);
}

export function findOutOfScope(files, allowedGlobs) {
  const res = allowedGlobs.map(globToRegExp);
  return files.filter((f) => !res.some((re) => re.test(f)));
}

export function findTaskFile(taskId, itemsDir = ITEMS_DIR) {
  for (const epic of readdirSync(itemsDir, { withFileTypes: true })) {
    if (!epic.isDirectory()) continue;
    const hit = readdirSync(join(itemsDir, epic.name)).find(
      (n) => n.startsWith(`${taskId}-`) && n.endsWith('.md'),
    );
    if (hit) return join(itemsDir, epic.name, hit);
  }
  return null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const body = args['body-file'] ? readFileSync(args['body-file'], 'utf8') : '';
  const taskId = parseTaskId(body);
  if (!taskId) {
    setOutput('status', 'no-task');
    summary(
      '### scope-check\nPR body không có `Task: Txxxx` → bỏ qua (PR Dependabot / chore không gắn task).',
    );
    console.log(
      '::notice title=scope-check::PR body không có dòng `Task: Txxxx`; không kiểm phạm vi.',
    );
    return 0;
  }
  const taskFile = findTaskFile(taskId);
  if (!taskFile) {
    console.log(
      `::error title=scope-check::Không tìm thấy task file ${ITEMS_DIR}/*/${taskId}-*.md`,
    );
    return 1;
  }
  const allowed = [
    ...parseAllowedPaths(readFileSync(taskFile, 'utf8')),
    taskFile,
    ...ALWAYS_ALLOWED,
  ];
  const outside = findOutOfScope(changedFiles(args.base, args.head || 'HEAD'), allowed);
  setOutput('status', outside.length ? 'out-of-scope' : 'in-scope');
  const list = outside.map((f) => `- \`${f}\``).join('\n');
  summary(
    `### scope-check · ${taskId}\nTask file: \`${taskFile}\`\n\nallowed_paths: ${allowed.map((g) => `\`${g}\``).join(', ')}\n\n` +
      (outside.length
        ? `**${outside.length} file ngoài phạm vi** (cần người duyệt):\n${list}`
        : 'Mọi file trong phạm vi.'),
  );
  for (const f of outside)
    console.log(
      `::warning file=${f},title=out-of-scope::${f} nằm ngoài allowed_paths của ${taskId}`,
    );
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
