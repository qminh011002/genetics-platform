import { tokens } from '@genetics/design-tokens/tokens';
import { describe, expect, it } from 'vitest';

import { cn, TOKEN_RADIUS, TOKEN_SPACING, TOKEN_TEXT_SIZES } from './cn';

describe('cn', () => {
  it('gộp lớp trùng nhóm, lớp sau thắng', () => {
    const hidden = false;
    expect(cn('px-2', hidden && 'hidden', 'px-3.5')).toBe('px-3.5');
  });

  it('cỡ chữ token không bị coi là màu chữ', () => {
    expect(cn('text-caption', 'text-status-open-fg')).toBe('text-caption text-status-open-fg');
    expect(cn('text-sm', 'text-body-sm')).toBe('text-body-sm');
  });

  it('kích thước token gộp với thang Tailwind', () => {
    expect(cn('h-9', 'h-button-xl')).toBe('h-button-xl');
    expect(cn('rounded-md', 'rounded-sheet')).toBe('rounded-sheet');
  });

  it('danh sách token khớp @genetics/design-tokens', () => {
    expect(new Set(TOKEN_TEXT_SIZES)).toEqual(new Set(Object.keys(tokens.text)));
    expect(new Set(TOKEN_SPACING)).toEqual(new Set(Object.keys(tokens.size)));
    expect(Object.keys(tokens.radius)).toEqual(expect.arrayContaining([...TOKEN_RADIUS]));
  });
});
