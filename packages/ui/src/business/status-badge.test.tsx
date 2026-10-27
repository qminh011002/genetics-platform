import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STATUS_ENUMS, StatusBadge, statusInfo, type StatusKind } from './status-badge';

describe('StatusBadge', () => {
  it('tiêu chí 2: batch reopened → "Mở lại", màu status-pending (§3.2)', () => {
    render(<StatusBadge kind="batch" value="reopened" />);
    const badge = screen.getByText('Mở lại');
    expect(badge).toHaveAttribute('data-slot', 'badge');
    expect(badge.className).toContain('bg-status-pending-bg');
    expect(badge.className).toContain('text-status-pending-fg');
  });

  it('nhãn tiếng Anh khi locale en', () => {
    render(<StatusBadge kind="batch" value="reopened" locale="en" />);
    expect(screen.getByText('Reopened')).toBeInTheDocument();
  });

  it('nối detail sau nhãn ("Mở lại · còn n giờ")', () => {
    render(<StatusBadge kind="batch" value="reopened" detail="còn 12 giờ" />);
    expect(screen.getByText(/Mở lại · còn 12 giờ/)).toBeInTheDocument();
  });

  it.each([
    ['batch', 'open', 'status-open', 'Open'],
    ['batch', 'closed', 'status-ok', 'Đã chốt'],
    ['task', 'requires_amendment', 'status-warning', 'Cần sửa'],
    ['task', 'pending', 'status-pending', 'Tạm dừng'],
    ['routine', 'late', 'status-error', 'Trễ'],
    ['dq', 'ignored', 'status-closed', 'Đã bỏ qua'],
    ['priority', 'low', 'status-outline', undefined],
  ] as const)('%s %s → %s', (kind, value, token, label) => {
    const info = statusInfo(kind, value);
    expect(info.token).toBe(token);
    if (label) expect(info.label).toBe(label);
  });

  it('mọi giá trị của mọi kind đều có token (mapping cố định §3.2)', () => {
    for (const [kind, def] of Object.entries(STATUS_ENUMS)) {
      for (const value of def.values) {
        expect(statusInfo(kind as StatusKind, value).token).toBe(def.token(value as never));
      }
    }
  });

  it('giá trị lạ (API mới hơn client) → status-outline + giá trị thô', () => {
    render(<StatusBadge kind="task" value={'archived' as never} />);
    expect(screen.getByText('archived').className).toContain('bg-status-outline-bg');
  });

  it('chấm tròn ẩn với trình đọc màn hình', () => {
    const { container } = render(<StatusBadge kind="sync" value="conflict" dot />);
    expect(container.querySelector('[aria-hidden]')?.className).toContain('rounded-full');
  });
});
