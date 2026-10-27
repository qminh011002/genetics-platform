#!/usr/bin/env node
// Kiểm `catalog:` là nguồn version duy nhất (ADR-0001, T0101):
//  1. dependency có trong catalog nhưng package ghi version riêng (phải là "catalog:")
//  2. dependency ghi version riêng ở ≥ 2 package (phải chuyển vào catalog)
// Exit 1 nếu vi phạm. Chạy: `pnpm check:catalog` (nằm trong `pnpm ci`).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const catalog = parseCatalog(readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8'));
const projects = JSON.parse(
  execFileSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], { cwd: root, encoding: 'utf8' }),
);

const FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
const errors = [];
const directVersions = new Map(); // name -> [{ pkg, spec }]

for (const project of projects) {
  const pkg = JSON.parse(readFileSync(join(project.path, 'package.json'), 'utf8'));
  const label = pkg.name ?? project.path;
  for (const field of FIELDS) {
    for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
      const usesCatalog = spec.startsWith('catalog:');
      const isWorkspace = spec.startsWith('workspace:');
      if (name in catalog && !usesCatalog) {
        errors.push(`${label}: "${name}": "${spec}" — có trong catalog, phải ghi "catalog:"`);
      }
      if (!usesCatalog && !isWorkspace) {
        const list = directVersions.get(name) ?? [];
        list.push({ pkg: label, spec });
        directVersions.set(name, list);
      }
    }
  }
}

for (const [name, uses] of directVersions) {
  const pkgs = new Set(uses.map((u) => u.pkg));
  if (pkgs.size >= 2) {
    errors.push(
      `"${name}" ghi version riêng ở ${pkgs.size} package (${[...pkgs].join(', ')}) — chuyển vào catalog`,
    );
  }
}

if (errors.length > 0) {
  console.error('check-catalog: vi phạm\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log(
  `check-catalog: OK (${projects.length} package, ${Object.keys(catalog).length} mục catalog)`,
);

/** Đọc khối `catalog:` (dạng phẳng `name: version`) từ pnpm-workspace.yaml, không cần thư viện YAML. */
function parseCatalog(yaml) {
  const out = {};
  let inCatalog = false;
  for (const raw of yaml.split('\n')) {
    const line = raw.replace(/\s+#.*$/, '').trimEnd();
    if (line === '' || line.trimStart().startsWith('#')) continue;
    if (/^\S/.test(line)) {
      inCatalog = line === 'catalog:';
      continue;
    }
    if (!inCatalog) continue;
    const m = /^\s+['"]?([^'":]+)['"]?:\s*(.+)$/.exec(line);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}
