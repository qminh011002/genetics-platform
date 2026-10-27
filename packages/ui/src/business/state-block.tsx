// Khung chung cho EmptyState / ErrorState / NoAccess (design-system §6.2, §8; wireframe UIStates):
// icon trong ô 48 bo radius-2xl, tiêu đề, một câu, một hành động — căn giữa.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@genetics/ui/lib/cn';

const stateIconVariants = cva(
  'flex size-12 shrink-0 items-center justify-center rounded-2xl [&_svg]:size-6',
  {
    variants: {
      tone: {
        primary: 'bg-primary-soft text-primary',
        muted: 'bg-muted text-muted-foreground',
        error: 'bg-status-error-bg text-status-error-fg',
      },
    },
    defaultVariants: { tone: 'muted' },
  },
);

type StateBlockProps = Omit<React.ComponentProps<'div'>, 'title'> &
  VariantProps<typeof stateIconVariants> & {
    icon: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Một hành động (thường `<Button size="sm">`). */
    action?: React.ReactNode;
  };

function StateBlock({
  icon,
  title,
  description,
  action,
  tone,
  className,
  children,
  ...props
}: StateBlockProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center',
        className,
      )}
      {...props}
    >
      <span aria-hidden className={stateIconVariants({ tone })}>
        {icon}
      </span>
      <p className="text-body text-foreground font-semibold">{title}</p>
      {description !== undefined && description !== null && (
        <p className="text-body-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {children}
      {action !== undefined && action !== null && <div className="mt-1">{action}</div>}
    </div>
  );
}

export { StateBlock, type StateBlockProps };
