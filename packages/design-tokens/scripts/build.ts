// `pnpm --filter @genetics/design-tokens build` → dist/web.css + dist/tokens.ts.
// Chạy bằng tsx; phần sinh nội dung nằm ở src/generate.ts (thuần, có test snapshot).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate, type TokensInput } from '../src/generate';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = JSON.parse(readFileSync(resolve(root, 'tokens.json'), 'utf8')) as TokensInput;
const { css, ts } = generate(input);

const dist = resolve(root, 'dist');
mkdirSync(dist, { recursive: true });
writeFileSync(resolve(dist, 'web.css'), css);
writeFileSync(resolve(dist, 'tokens.ts'), ts);
console.log(
  `design-tokens: đã sinh dist/web.css (${css.length} B), dist/tokens.ts (${ts.length} B)`,
);
