import { tokens } from '@genetics/design-tokens/tokens';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STRAIN_CLASSES, StrainBadge } from './strain-badge';

describe('StrainBadge', () => {
  it('TMA dùng token strain-tma, badge vuông (§3.3)', () => {
    render(<StrainBadge code="TMA" />);
    const badge = screen.getByText('TMA');
    expect(badge.className).toContain('bg-strain-tma-bg');
    expect(badge.className).toContain('text-strain-tma-fg');
    expect(badge.className).toContain('rounded-sm');
    expect(badge.className).not.toContain('rounded-full');
  });

  it('có class cho đúng các dòng trong tokens.json', () => {
    expect(Object.keys(STRAIN_CLASSES).sort()).toEqual(Object.keys(tokens.color.strain).sort());
  });

  it('dòng chưa có token → màu trung tính', () => {
    render(<StrainBadge code="XYZ" />);
    expect(screen.getByText('XYZ').className).toContain('bg-status-closed-bg');
  });
});
