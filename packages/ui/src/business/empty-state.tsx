// design-system §8 "Trống": EmptyState + hành động đầu tiên (nếu có quyền — bọc bằng `Can`).
// `tone="search"` cho "Không tìm thấy" khi đang lọc (wireframe UIStates).
import type * as React from 'react';
import { FolderIcon, SearchIcon } from 'lucide-react';
import { StateBlock, type StateBlockProps } from './state-block';

type EmptyStateProps = Omit<StateBlockProps, 'icon' | 'tone'> & {
  icon?: React.ReactNode;
  tone?: 'empty' | 'search';
};

function EmptyState({ icon, tone = 'empty', ...props }: EmptyStateProps) {
  return (
    <StateBlock
      data-slot="empty-state"
      role="status"
      tone={tone === 'search' ? 'muted' : 'primary'}
      icon={icon ?? (tone === 'search' ? <SearchIcon /> : <FolderIcon />)}
      {...props}
    />
  );
}

export { EmptyState, type EmptyStateProps };
