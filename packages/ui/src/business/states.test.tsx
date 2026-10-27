import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EmptyState } from './empty-state';
import { ErrorState } from './error-state';
import { NoAccess } from './no-access';

describe('EmptyState', () => {
  it('tiêu đề, một câu, một hành động', () => {
    render(
      <EmptyState
        title="Chưa có lần cân mẫu nào"
        description="Neonate cần ≥ 3 lần cân mẫu 100 con trước khi chốt."
        action={<button type="button">Thêm lần cân</button>}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Chưa có lần cân mẫu nào');
    expect(screen.getByRole('button', { name: 'Thêm lần cân' })).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('Thử lại gọi onRetry và hiện trace_id', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState title="Không lưu được lần cân" traceId="E-5021" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Mã lỗi: E-5021');
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('không có onRetry / action → không có nút', () => {
    render(<ErrorState title="Lỗi" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('NoAccess', () => {
  it('tiêu đề mặc định từ @genetics/shared/i18n', () => {
    render(<NoAccess />);
    expect(screen.getByText('Bạn không có quyền thực hiện thao tác này')).toBeInTheDocument();
  });

  it('tiêu đề do app truyền', () => {
    render(<NoAccess title="Chỉ Admin mở lại được" locale="en" />);
    expect(screen.getByText('Chỉ Admin mở lại được')).toBeInTheDocument();
  });
});
