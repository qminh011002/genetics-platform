// Tương phản WCAG ≥ 4.5:1 cho các cặp chữ / nền ở design-system.md §3 (§9: cặp §3 đã chọn để đạt).
import { describe, expect, it } from 'vitest';

import { contrastRatio, formatOklch, hexToOklch } from './color';
import { collapseValue, resolveRefs, type Tree } from './generate';
import tokensJson from '../tokens.json';

const t = collapseValue(resolveRefs(tokensJson as unknown as Tree)) as unknown as {
  color: Record<string, string> & {
    status: Record<string, { bg: string; fg: string }>;
    strain: Record<string, { bg: string; fg: string }>;
    stat: Record<string, string>;
    'stat-hero': { bg: string; fg: string; muted: string };
    delta: Record<string, { bg: string; fg: string }>;
    alert: Record<string, { bg: string; fg: string }>;
    row: Record<string, string>;
    chart: Record<string, string>;
  };
};
const c = t.color;

const pairs: Array<[name: string, fg: string, bg: string]> = [
  ['foreground / background', c.foreground, c.background],
  ['primary-foreground / primary', c['primary-foreground'], c.primary],
  ['primary-foreground / primary-hover', c['primary-foreground'], c['primary-hover']],
  ['primary / background (link)', c.primary, c.background],
  ['primary / primary-soft (mục đang chọn)', c.primary, c['primary-soft']],
  ['muted-foreground / background', c['muted-foreground'], c.background],
  ['muted-foreground / muted', c['muted-foreground'], c.muted],
  ['destructive / background', c.destructive, c.background],
  ['success / background', c.success, c.background],
  ['foreground / surface', c.foreground, c.surface],
  ['foreground / panel', c.foreground, c.panel],
  ['foreground / table-head', c.foreground, c['table-head']],
  ['stat-hero fg / bg', c['stat-hero'].fg, c['stat-hero'].bg],
  ['stat-hero muted / bg', c['stat-hero'].muted, c['stat-hero'].bg],
  ['chart axis / background', c.chart.axis, c.background],
  ...Object.entries(c.status).map(([k, v]): [string, string, string] => [
    `status-${k} fg / bg`,
    v.fg,
    v.bg,
  ]),
  ...Object.entries(c.strain).map(([k, v]): [string, string, string] => [
    `strain ${k} fg / bg`,
    v.fg,
    v.bg,
  ]),
  ...Object.entries(c.delta).map(([k, v]): [string, string, string] => [
    `delta-${k} fg / bg`,
    v.fg,
    v.bg,
  ]),
  ...Object.entries(c.alert).map(([k, v]): [string, string, string] => [
    `alert-${k} fg / bg`,
    v.fg,
    v.bg,
  ]),
  ...Object.entries(c.stat).map(([k, v]): [string, string, string] => [
    `foreground / stat-${k}`,
    c.foreground,
    v,
  ]),
  ...Object.entries(c.row).map(([k, v]): [string, string, string] => [
    `foreground / row-${k}`,
    c.foreground,
    v,
  ]),
];

describe('tương phản ≥ 4.5:1 (design-system.md §3, §9)', () => {
  it.each(pairs)('%s', (_name, fg, bg) => {
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('subtle-foreground chỉ dùng chữ ≥ 11 px đậm: vẫn ≥ 4.5:1 trên trắng', () => {
    expect(contrastRatio(c['subtle-foreground'], c.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('hex → OKLCH', () => {
  it('trắng / đen là màu không sắc', () => {
    expect(formatOklch(hexToOklch('#ffffff'))).toBe('oklch(1 0 0)');
    expect(formatOklch(hexToOklch('#000000'))).toBe('oklch(0 0 0)');
  });
  it('tỉ lệ tương phản đối xứng và tối thiểu 1', () => {
    expect(contrastRatio('#013db3', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#013db3'));
    expect(contrastRatio('#013db3', '#013db3')).toBe(1);
  });
});
