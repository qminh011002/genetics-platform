import * as React from 'react';
import { cn } from '@genetics/ui/lib/cn';
import { fieldStateAria, fieldStateVariants, type FieldState } from '@genetics/ui/lib/field-state';

function Textarea({
  className,
  state = 'default',
  'aria-invalid': ariaInvalid,
  ...props
}: React.ComponentProps<'textarea'> & {
  /** design-system §6.1: `error` viền destructive + aria-invalid, `warning` viền warning. */
  state?: FieldState;
}) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={fieldStateAria(state, ariaInvalid)}
      // design-system §5: padding ngang 12 như ô nhập; §6.1 trạng thái error / warning
      className={cn(
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm',
        fieldStateVariants({ state }),
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
