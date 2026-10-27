import { compile } from 'tailwindcss';
import { describe, expect, it } from 'vitest';

import { formatOklch, hexToOklch } from './color';
import { generate, type TokensInput } from './generate';
import tokensJson from '../tokens.json';

const input = tokensJson as unknown as TokensInput;
const { css, ts } = generate(input);

describe('snapshot 2 file sinh (tiêu chí 2: đổi tokens.json → test đỏ tới khi cập nhật snapshot)', () => {
  it('dist/web.css', async () => {
    await expect(css).toMatchFileSnapshot('./__snapshots__/web.css.snap');
  });
  it('dist/tokens.ts', async () => {
    await expect(ts).toMatchFileSnapshot('./__snapshots__/tokens.ts.snap');
  });
});

describe('tiêu chí 1: nội dung web.css và tokens.ts', () => {
  const primaryHex = (input.color.primary as { value: string }).value;
  const primaryOklch = formatOklch(hexToOklch(primaryHex));

  it('--primary (shadcn) là OKLCH của màu primary trong tokens.json; --color-primary trỏ tới nó', () => {
    expect(primaryHex).toBe('#013db3');
    expect(css).toContain(`--primary: ${primaryOklch};`);
    expect(css).toContain('--color-primary: var(--primary);');
    // Đối chiếu: shadcn CLI / culori cho #013db3 ≈ oklch(0.416 0.194 262.2)
    expect(primaryOklch).toMatch(/^oklch\(0\.41\d* 0\.19\d* 262\.\d+\)$/);
  });

  it('có --color-status-ok-bg và không còn hex nào trong CSS', () => {
    expect(css).toMatch(/--color-status-ok-bg: oklch\([^)]+\);/);
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('tokens.ts export tokens.color.strain.TMA.chart (object literal JSON hợp lệ)', () => {
    const m =
      /export const tokens = ([\s\S]*?) as const;\n\nexport type Tokens = typeof tokens;/.exec(ts);
    expect(m).not.toBeNull();
    const tokens = JSON.parse(m![1]) as {
      color: Record<string, unknown> & { strain: { TMA: { chart: string } } };
    };
    expect(tokens.color.strain.TMA.chart).toBe('#4338ca');
    // alias `{color.foreground}` đã được giải, `{ value }` đã gọn thành chuỗi
    expect(tokens.color['card-foreground']).toBe('#0a0a0b');
    expect(tokens.color.primary).toBe('#013db3');
  });
});

describe('tiêu chí 3: Tailwind 4 nhận token qua @theme', () => {
  it('sinh được bg-primary, text-muted-foreground, bg-stat-blue, rounded-xl', async () => {
    const compiler = await compile(`${css}\n@tailwind utilities;`);
    const out = compiler.build([
      'bg-primary',
      'text-muted-foreground',
      'bg-stat-blue',
      'rounded-xl',
      'text-body',
      'shadow-overlay',
      'h-button-md',
    ]);
    expect(out).toContain('.bg-primary');
    expect(out).toContain('background-color: var(--primary)');
    expect(out).toContain('.text-muted-foreground');
    expect(out).toContain('.bg-stat-blue');
    expect(out).toContain('.rounded-xl');
    expect(out).toContain('border-radius: 12px');
    expect(out).toContain('.text-body');
    expect(out).toContain('.shadow-overlay');
    expect(out).toContain('.h-button-md');
  });
});
