// Test cho scope-check / deps-review (T0105 tiêu chí 2, 3). Chạy: node --test scripts/ci/
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { review } from './deps-review.mjs';
import {
  findOutOfScope,
  findTaskFile,
  globToRegExp,
  parseAllowedPaths,
  parseTaskId,
} from './scope-check.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

describe('scope-check', () => {
  it('đọc Task id từ PR body theo template', () => {
    assert.equal(parseTaskId('## Task\nTask: T0303 (link task file) · Epic: E03'), 'T0303');
    assert.equal(parseTaskId('Task: [T0502](docs/tasks/items/E05/T0502-strains-api.md)'), 'T0502');
    assert.equal(parseTaskId('Task: T____ (link task file)'), null);
    assert.equal(parseTaskId(''), null);
  });

  it('đọc allowed_paths từ frontmatter', () => {
    const md =
      '---\nid: T9999\nallowed_paths:\n  - "services/backend/**"\n  - contracts/**\nnext: x\n---\nbody';
    assert.deepEqual(parseAllowedPaths(md), ['services/backend/**', 'contracts/**']);
    assert.deepEqual(parseAllowedPaths('no frontmatter'), []);
  });

  it('glob giống scope-guard: ** qua thư mục, * trong một thư mục', () => {
    assert.ok(globToRegExp('services/backend/**').test('services/backend/src/a.py'));
    assert.ok(globToRegExp('.github/workflows/**').test('.github/workflows/ci.yml'));
    assert.ok(globToRegExp('**/*.md').test('README.md'));
    assert.ok(globToRegExp('docs/*.md').test('docs/a.md'));
    assert.ok(!globToRegExp('docs/*.md').test('docs/x/a.md'));
    assert.ok(!globToRegExp('.github/dependabot.yml').test('.github/dependabotXyml'));
  });

  it('PR T0303 chạm apps/web/ → ngoài phạm vi (tiêu chí 3, task file thật)', () => {
    const taskFile = findTaskFile('T0303', join(repoRoot, 'docs/tasks/items'));
    assert.ok(taskFile, 'thiếu task file T0303');
    const allowed = parseAllowedPaths(readFileSync(taskFile, 'utf8'));
    assert.ok(allowed.length > 0);
    assert.deepEqual(findOutOfScope(['apps/web/src/main.tsx'], allowed), ['apps/web/src/main.tsx']);
  });
});

describe('deps-review', () => {
  it('lockfile đổi, không nhãn deps-approved → fail (tiêu chí 2)', () => {
    assert.equal(review(['pnpm-lock.yaml', 'package.json'], ['shared']).ok, false);
    assert.equal(review(['uv.lock'], []).ok, false);
  });
  it('có nhãn hoặc không đổi lockfile → ok', () => {
    assert.equal(review(['pnpm-lock.yaml'], ['deps-approved']).ok, true);
    assert.equal(review(['docs/a.md', 'apps/web/pnpm-lock.yaml.bak'], []).ok, true);
  });
});

// Chạy CLI thật trên một repo git tạm: nhánh main + nhánh PR.
function tempRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ci-policy-'));
  const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'pipe' });
  git('init', '-q', '-b', 'main');
  git('config', 'user.email', 'ci@example.invalid');
  git('config', 'user.name', 'ci');
  mkdirSync(join(dir, 'docs/tasks/items/E03'), { recursive: true });
  writeFileSync(
    join(dir, 'docs/tasks/items/E03/T0303-loi.md'),
    '---\nid: T0303\nallowed_paths:\n  - "services/backend/**"\n---\n',
  );
  writeFileSync(join(dir, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
  git('add', '.');
  git('commit', '-qm', 'base');
  git('checkout', '-qb', 'pr');
  const write = (p, c) => {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), c);
    git('add', p);
  };
  return { dir, git, write };
}

function runCli(script, dir, args) {
  const out = join(dir, '.gh-output');
  writeFileSync(out, '');
  const res = spawnSync('node', [join(here, script), ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, GITHUB_OUTPUT: out, GITHUB_STEP_SUMMARY: join(dir, '.gh-summary') },
  });
  return { status: res.status, output: readFileSync(out, 'utf8') };
}

describe('CLI trên repo git tạm', () => {
  it('scope-check: Task T0303 + diff apps/web → status=out-of-scope', () => {
    const { dir, git, write } = tempRepo();
    write('services/backend/src/a.py', 'x = 1\n');
    write('apps/web/src/main.tsx', 'export {};\n');
    write('docs/tasks/W1-status.md', '| T0303 |\n');
    git('commit', '-qm', 'pr');
    writeFileSync(join(dir, 'body.md'), 'Task: T0303 (link) · Epic: E03');
    const res = runCli('scope-check.mjs', dir, ['--body-file', 'body.md', '--base', 'main']);
    assert.equal(res.status, 0);
    assert.match(res.output, /status=out-of-scope/);
  });

  it('scope-check: chỉ sửa trong phạm vi + task file / board → status=in-scope', () => {
    const { dir, git, write } = tempRepo();
    write('services/backend/src/a.py', 'x = 1\n');
    write(
      'docs/tasks/items/E03/T0303-loi.md',
      '---\nid: T0303\nstatus: done\nallowed_paths:\n  - "services/backend/**"\n---\n',
    );
    git('commit', '-qm', 'pr');
    writeFileSync(join(dir, 'body.md'), 'Task: T0303');
    assert.match(
      runCli('scope-check.mjs', dir, ['--body-file', 'body.md', '--base', 'main']).output,
      /status=in-scope/,
    );
  });

  it('scope-check: không có Task → no-task; Task không có file → exit 1', () => {
    const { dir, git, write } = tempRepo();
    write('README.md', 'x\n');
    git('commit', '-qm', 'pr');
    writeFileSync(join(dir, 'body.md'), 'Task: T____');
    assert.match(
      runCli('scope-check.mjs', dir, ['--body-file', 'body.md', '--base', 'main']).output,
      /status=no-task/,
    );
    writeFileSync(join(dir, 'body.md'), 'Task: T0999');
    assert.equal(
      runCli('scope-check.mjs', dir, ['--body-file', 'body.md', '--base', 'main']).status,
      1,
    );
  });

  it('deps-review: đổi pnpm-lock.yaml không nhãn → exit 1; có deps-approved → exit 0', () => {
    const { dir, git, write } = tempRepo();
    write('pnpm-lock.yaml', 'lockfileVersion: 9\npackages: {}\n');
    git('commit', '-qm', 'pr');
    const fail = runCli('deps-review.mjs', dir, ['--base', 'main', '--labels', 'shared']);
    assert.equal(fail.status, 1);
    assert.match(fail.output, /lockfile=true/);
    assert.equal(
      runCli('deps-review.mjs', dir, ['--base', 'main', '--labels', 'shared,deps-approved']).status,
      0,
    );
  });
});
