// design-system §8 "Lỗi": ErrorState + Thử lại + `trace_id` (api-standards problem+json).
import type * as React from 'react';
import { TriangleAlertIcon } from 'lucide-react';
import { Button } from '@genetics/ui/components/button';
import { StateBlock, type StateBlockProps } from './state-block';

type ErrorStateProps = Omit<StateBlockProps, 'icon' | 'tone'> & {
  icon?: React.ReactNode;
  /** `trace_id` / mã lỗi để người dùng báo lại; hiện chữ mono. */
  traceId?: string;
  traceLabel?: string;
  /** Có `onRetry` mà không có `action` → hiện nút Thử lại. */
  onRetry?: () => void;
  retryLabel?: string;
};

function ErrorState({
  icon,
  traceId,
  traceLabel = 'Mã lỗi',
  onRetry,
  retryLabel = 'Thử lại',
  action,
  ...props
}: ErrorStateProps) {
  return (
    <StateBlock
      data-slot="error-state"
      role="alert"
      tone="error"
      icon={icon ?? <TriangleAlertIcon />}
      action={
        action ??
        (onRetry && (
          <Button size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ))
      }
      {...props}
    >
      {traceId && (
        <p className="text-caption text-muted-foreground">
          {traceLabel}
          {': '}
          <span className="font-mono">{traceId}</span>
        </p>
      )}
    </StateBlock>
  );
}

export { ErrorState, type ErrorStateProps };
