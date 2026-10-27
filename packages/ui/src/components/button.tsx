import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@genetics/ui/lib/cn';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      // design-system §6.1: default (primary), outline, ghost, secondary, destructive, destructive-outline, success
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover', // design-system §3.1 primary-hover
        outline:
          'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
        // design-system §6.1: nút xoá nền đỏ đặc, chữ trắng (wireframe Foundations `.btn-destructive`)
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
        // design-system §6.1: viền đỏ nhạt (alert-error-border), chữ đỏ
        'destructive-outline':
          'border-alert-error-border bg-background text-destructive hover:bg-alert-error-bg focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
        // design-system §6.1, §3.1 success; chữ trắng = primary-foreground
        success:
          'bg-success text-primary-foreground hover:bg-success/90 focus-visible:border-success focus-visible:ring-success/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      // design-system §5: sm · default · lg · xl = 32 · 36 · 44 · 52 (token spacing-button-*)
      size: {
        default:
          'h-button-md gap-2 px-3.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-button-sm gap-1.5 px-2.5 text-body-sm in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        lg: 'h-button-lg gap-2 px-4.5 text-h3 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5',
        // design-system §5: nút chính điện thoại 52 px, bo radius-lg, chữ 16
        xl: 'h-button-xl gap-2 rounded-lg px-5 text-m-title has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-button-md',
        'icon-xs':
          "size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-button-sm in-data-[slot=button-group]:rounded-md',
        'icon-lg': 'size-button-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
