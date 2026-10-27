// Sinh nội dung `dist/web.css` (Tailwind 4 `@theme` + biến shadcn `:root`) và `dist/tokens.ts`
// từ tokens.json. Hàm thuần, không I/O — scripts/build.ts ghi file, test snapshot gọi trực tiếp.
import { toCssColor } from './color';

export type Leaf = string | number;
export interface Tree {
  [key: string]: Leaf | Tree;
}

export interface TextToken {
  size: number;
  lineHeight?: number;
  weight?: number;
  tracking?: string;
}

export interface TokensInput {
  color: Tree;
  font: Record<string, string>;
  text: Record<string, TextToken>;
  size: Record<string, number>;
  radius: Record<string, number>;
  shadow: Record<string, string>;
}

export interface Generated {
  css: string;
  ts: string;
}

/**
 * Biến shadcn trong `:root` (theming shadcn CLI 4, `cssVariables: true`) và token màu tương ứng.
 * `@theme inline` trỏ `--color-x` → `var(--x)` để `.dark` (giữ rỗng, ADR-0009) có thể ghi đè sau.
 */
const SHADCN_VARS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
] as const;

const REF_RE = /^\{([^}]+)\}$/;

function isTree(v: Leaf | Tree): v is Tree {
  return typeof v === 'object' && v !== null;
}

function lookup(root: Tree, path: string): Leaf {
  let node: Leaf | Tree = root;
  for (const seg of path.split('.')) {
    if (!isTree(node) || !(seg in node))
      throw new Error(`Tham chiếu token không tồn tại: {${path}}`);
    node = node[seg];
  }
  if (isTree(node)) {
    if ('value' in node && !isTree(node.value)) return node.value;
    throw new Error(`Tham chiếu {${path}} không trỏ tới giá trị lá`);
  }
  return node;
}

/** Thay `{a.b.c}` bằng giá trị đích (một cấp; alias không được trỏ tới alias). */
export function resolveRefs<T extends Tree>(tree: T, root: Tree = tree): T {
  const out: Tree = {};
  for (const [k, v] of Object.entries(tree)) {
    if (isTree(v)) out[k] = resolveRefs(v, root);
    else if (typeof v === 'string' && REF_RE.test(v)) {
      const target = lookup(root, REF_RE.exec(v)![1]);
      if (typeof target === 'string' && REF_RE.test(target)) {
        throw new Error(`Alias lồng nhau không được hỗ trợ: ${v} → ${target}`);
      }
      out[k] = target;
    } else out[k] = v;
  }
  return out as T;
}

/** Gọn `{ value: x }` thành `x` cho tokens.ts (giữ nhóm `bg`/`fg`/`chart` nguyên). */
export function collapseValue(tree: Tree): Tree {
  const out: Tree = {};
  for (const [k, v] of Object.entries(tree)) {
    if (isTree(v)) {
      const keys = Object.keys(v);
      out[k] =
        keys.length === 1 && keys[0] === 'value' && !isTree(v.value) ? v.value : collapseValue(v);
    } else out[k] = v;
  }
  return out;
}

/** Phẳng hoá cây màu thành `[tên-css, giá-trị]`; bỏ đoạn `value`/`DEFAULT`, viết thường (TMA → tma). */
export function flattenColors(tree: Tree, prefix: string[] = []): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const [k, v] of Object.entries(tree)) {
    const path = k === 'value' || k === 'DEFAULT' ? prefix : [...prefix, k.toLowerCase()];
    if (isTree(v)) out.push(...flattenColors(v, path));
    else out.push([path.join('-'), String(v)]);
  }
  return out;
}

const px = (n: number) => `${n}px`;

export function generate(input: TokensInput): Generated {
  const resolved = resolveRefs(input as unknown as Tree) as unknown as TokensInput;
  const colors = flattenColors(resolved.color);
  const colorMap = new Map(colors);
  for (const name of SHADCN_VARS) {
    if (!colorMap.has(name)) throw new Error(`Thiếu token màu cho biến shadcn: ${name}`);
  }
  const shadcn = new Set<string>(SHADCN_VARS);

  const lines: string[] = [];
  const header =
    '/* File sinh bởi @genetics/design-tokens (scripts/build.ts) từ tokens.json — không sửa tay. */';
  lines.push(header, '');

  // 1. Biến shadcn (OKLCH) — shadcn CLI 4 theming, cssVariables: true.
  lines.push(':root {');
  for (const name of SHADCN_VARS) lines.push(`  --${name}: ${toCssColor(colorMap.get(name)!)};`);
  lines.push(`  --radius: ${px(resolved.radius.md)};`);
  lines.push('}', '');
  lines.push('/* Không dark mode (ADR-0009); giữ block để component shadcn không cần cài lại. */');
  lines.push('.dark {', '}', '');

  // 2. Tailwind 4 @theme. `inline` để utility nhận giá trị trực tiếp (biến shadcn qua var()).
  lines.push('@theme inline {');
  lines.push('  /* Chữ (design-system.md §4) */');
  for (const [k, v] of Object.entries(resolved.font)) lines.push(`  --font-${k}: ${v};`);
  for (const [k, t] of Object.entries(resolved.text)) {
    lines.push(`  --text-${k}: ${px(t.size)};`);
    if (t.lineHeight !== undefined) lines.push(`  --text-${k}--line-height: ${px(t.lineHeight)};`);
    if (t.weight !== undefined) lines.push(`  --text-${k}--font-weight: ${t.weight};`);
    if (t.tracking !== undefined) lines.push(`  --text-${k}--letter-spacing: ${t.tracking};`);
  }
  lines.push('', '  /* Màu (design-system.md §3) */');
  for (const [name, value] of colors) {
    lines.push(`  --color-${name}: ${shadcn.has(name) ? `var(--${name})` : toCssColor(value)};`);
  }
  lines.push(
    '',
    '  /* Kích thước (design-system.md §5; lưới 4 px = --spacing mặc định của Tailwind) */',
  );
  for (const [k, v] of Object.entries(resolved.size)) lines.push(`  --spacing-${k}: ${px(v)};`);
  lines.push('', '  /* Bo góc */');
  for (const [k, v] of Object.entries(resolved.radius)) lines.push(`  --radius-${k}: ${px(v)};`);
  lines.push('', '  /* Bóng */');
  for (const [k, v] of Object.entries(resolved.shadow)) lines.push(`  --shadow-${k}: ${v};`);
  lines.push('}', '');

  const tsTree = collapseValue(resolved as unknown as Tree);
  const ts = [
    '// File sinh bởi @genetics/design-tokens (scripts/build.ts) từ tokens.json — không sửa tay.',
    '// Giá trị thô (hex, px dạng số) cho Recharts và code cần số; CSS dùng web.css.',
    `export const tokens = ${JSON.stringify(tsTree, null, 2)} as const;`,
    '',
    'export type Tokens = typeof tokens;',
    '',
  ].join('\n');

  return { css: lines.join('\n'), ts };
}
