import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@genetics/ui/lib/cn';

// design-system §3.2: badge cao 22, bo tròn hoàn toàn, chữ 12 / 500
const badgeVariants = cva(
  'group/badge inline-flex h-badge w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2 text-caption font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
        secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
        ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // design-system §3.2: token trạng thái; tên trùng `StatusToken` của @genetics/shared/enums
        'status-open': 'bg-status-open-bg text-status-open-fg',
        'status-pending': 'bg-status-pending-bg text-status-pending-fg',
        'status-ok': 'bg-status-ok-bg text-status-ok-fg',
        'status-closed': 'bg-status-closed-bg text-status-closed-fg',
        'status-error': 'bg-status-error-bg text-status-error-fg',
        'status-warning': 'bg-status-warning-bg text-status-warning-fg',
        'status-outline':
          'border-status-outline-border bg-status-outline-bg text-status-outline-fg',
        // design-system §3.3: badge dòng giống vuông bo 6, chữ 12 / 600; màu do StrainBadge thêm
        strain: 'rounded-sm font-semibold tracking-[0.02em]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
