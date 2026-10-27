// Tiện ích chung cho script CI (T0105): diff file của PR, ghi output / summary của GitHub Actions.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

/** Danh sách file đổi giữa merge-base(base, head) và head; rename tính cả đường cũ lẫn mới. */
export function changedFiles(base, head = 'HEAD') {
  const out = execFileSync('git', ['diff', '--name-only', '--no-renames', `${base}...${head}`], {
    encoding: 'utf8',
  });
  return out.split('\n').filter(Boolean);
}

/** Đọc `--key value` từ argv. */
export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1] ?? '';
  }
  return args;
}

export function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

export function summary(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  else console.log(markdown);
}
