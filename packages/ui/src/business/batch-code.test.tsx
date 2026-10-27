import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BatchCode } from './batch-code';

describe('BatchCode', () => {
  it('mã chữ mono', () => {
    render(<BatchCode code="TMA_F7_BC01" />);
    expect(screen.getByText('TMA_F7_BC01').className).toContain('font-mono');
  });

  it('bấm copy ghi mã vào clipboard và đổi nhãn', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<BatchCode code="TMA_F7_BC01" />);
    await user.click(screen.getByRole('button', { name: 'Sao chép mã' }));
    expect(writeText).toHaveBeenCalledWith('TMA_F7_BC01');
    expect(await screen.findByRole('button', { name: 'Đã sao chép' })).toBeInTheDocument();
  });

  it('render link do app truyền', () => {
    render(
      <BatchCode
        code="REF_F7_BC02"
        render={({ children, ...props }) => (
          <a href="/batches/REF_F7_BC02" {...props}>
            {children}
          </a>
        )}
      />,
    );
    expect(screen.getByRole('link', { name: 'REF_F7_BC02' })).toHaveAttribute(
      'href',
      '/batches/REF_F7_BC02',
    );
  });

  it('copyable=false ẩn nút copy', () => {
    render(<BatchCode code="TMA_F7_BC01" copyable={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
