// deps-review (ADR-0014 §6): PR đổi lockfile mà không có nhãn `deps-approved` → fail.
// Output `lockfile` = true | false để workflow quyết định có chạy audit (warn) hay không.
//
// node scripts/ci/deps-review.mjs --base <ref> [--head <ref>] --labels "a,b"
import { fileURLToPath } from 'node:url';
import { changedFiles, parseArgs, setOutput, summary } from './lib.mjs';

export const LOCKFILES = ['pnpm-lock.yaml', 'uv.lock'];
export const APPROVAL_LABEL = 'deps-approved';

export function review(files, labels) {
  const lockfiles = files.filter((f) => LOCKFILES.includes(f));
  const approved = labels.includes(APPROVAL_LABEL);
  return { lockfiles, approved, ok: lockfiles.length === 0 || approved };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const labels = (args.labels ?? '')
    .split(',')
    .map((l) => l.trim())
    .filter(Boolean);
  const { lockfiles, ok } = review(changedFiles(args.base, args.head || 'HEAD'), labels);
  setOutput('lockfile', String(lockfiles.length > 0));
  if (lockfiles.length === 0) {
    summary('### deps-review\nKhông đổi lockfile.');
    return 0;
  }
  const names = lockfiles.map((f) => `\`${f}\``).join(', ');
  if (ok) {
    summary(`### deps-review\nĐổi ${names}; có nhãn \`${APPROVAL_LABEL}\`.`);
    return 0;
  }
  summary(
    `### deps-review\nĐổi ${names} nhưng **thiếu nhãn \`${APPROVAL_LABEL}\`** (ADR-0014 §6). Thêm nhãn sau khi người duyệt rồi chạy lại.`,
  );
  console.log(`::error title=deps-review::${names} đổi mà PR không có nhãn ${APPROVAL_LABEL}`);
  return 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
